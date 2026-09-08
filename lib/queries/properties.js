// lib/queries/properties.js
import { query, withTransaction } from "@/lib/db";

const CARD_FIELDS = `
  p.id, p.title, p.slug, p.property_type, p.room_type, p.price_amount, p.price_period,
  p.bedrooms, p.bathrooms, p.max_occupants, p.address_line, p.distance_to_campus_km,
  p.status, p.is_verified, p.is_available, p.view_count, p.created_at,
  l.name as location_name, u.short_name as university_short_name,
  (select url from property_images pi where pi.property_id = p.id order by pi.is_cover desc, pi.sort_order asc limit 1) as cover_image,
  coalesce((select round(avg(r.rating)::numeric,1) from reviews r where r.property_id = p.id and r.status = 'published'), 0) as avg_rating,
  coalesce((select count(*) from reviews r where r.property_id = p.id and r.status = 'published'), 0)::int as review_count
`;

export async function searchProperties(filters = {}, pagination = {}) {
  const {
    q,
    universityId,
    locationId,
    propertyType,
    minPrice,
    maxPrice,
    minBedrooms,
    facilities = [],
    availableOnly,
    verifiedOnly,
    sort = "newest",
    status = "published",
    ownerId,
  } = filters;
  const { page = 1, pageSize = 12 } = pagination;

  const where = [];
  const params = [];

  function add(cond, value) {
    params.push(value);
    where.push(cond.replace("?", `$${params.length}`));
  }

  if (status) {
    if (Array.isArray(status)) {
      params.push(status);
      where.push(`p.status = any($${params.length})`);
    } else {
      add("p.status = ?", status);
    }
  }
  if (ownerId) add("p.owner_id = ?", ownerId);
  if (universityId) add("p.university_id = ?", universityId);
  if (locationId) add("p.location_id = ?", locationId);
  if (propertyType) add("p.property_type = ?", propertyType);
  if (minPrice) add("p.price_amount >= ?", minPrice);
  if (maxPrice) add("p.price_amount <= ?", maxPrice);
  if (minBedrooms) add("p.bedrooms >= ?", minBedrooms);
  if (availableOnly) where.push("p.is_available = true");
  if (verifiedOnly) where.push("p.is_verified = true");
  if (q) {
    params.push(q);
    where.push(
      `to_tsvector('english', coalesce(p.title,'') || ' ' || coalesce(p.description,'') || ' ' || coalesce(p.address_line,'')) @@ plainto_tsquery('english', $${params.length})`
    );
  }
  if (facilities.length > 0) {
    params.push(facilities);
    where.push(
      `p.id in (select property_id from property_facilities pf where pf.facility_id = any($${params.length}) group by property_id having count(distinct pf.facility_id) = ${facilities.length})`
    );
  }

  const whereSql = where.length ? `where ${where.join(" and ")}` : "";

  const sortSql =
    {
      newest: "p.created_at desc",
      price_asc: "p.price_amount asc",
      price_desc: "p.price_amount desc",
      distance: "p.distance_to_campus_km asc nulls last",
      rating: "avg_rating desc",
    }[sort] || "p.created_at desc";

  const offset = (page - 1) * pageSize;
  params.push(pageSize);
  const limitParam = params.length;
  params.push(offset);
  const offsetParam = params.length;

  const listSql = `
    select ${CARD_FIELDS}
    from properties p
    join locations l on l.id = p.location_id
    join universities u on u.id = p.university_id
    ${whereSql}
    order by ${sortSql}
    limit $${limitParam} offset $${offsetParam}
  `;

  const countSql = `
    select count(*)::int as count
    from properties p
    join locations l on l.id = p.location_id
    join universities u on u.id = p.university_id
    ${whereSql}
  `;

  const [{ rows: items }, { rows: countRows }] = await Promise.all([
    query(listSql, params),
    query(countSql, params.slice(0, params.length - 2)),
  ]);

  return {
    items,
    total: countRows[0]?.count || 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((countRows[0]?.count || 0) / pageSize)),
  };
}

export async function getPropertyBySlug(slug) {
  const { rows } = await query(
    `select p.*, l.name as location_name, l.description as location_description,
            l.distance_to_campus_km as location_distance_km,
            u.name as university_name, u.short_name as university_short_name,
            owner.full_name as owner_name, owner.email as owner_email, owner.phone as owner_phone,
            owner.is_verified as owner_is_verified, owner.role as owner_role, owner.agency_name as owner_agency_name,
            coalesce((select round(avg(r.rating)::numeric,1) from reviews r where r.property_id = p.id and r.status = 'published'), 0) as avg_rating,
            coalesce((select count(*) from reviews r where r.property_id = p.id and r.status = 'published'), 0)::int as review_count
       from properties p
       join locations l on l.id = p.location_id
       join universities u on u.id = p.university_id
       join users owner on owner.id = p.owner_id
      where p.slug = $1`,
    [slug]
  );
  const property = rows[0];
  if (!property) return null;

  const [{ rows: images }, { rows: facilities }] = await Promise.all([
    query(
      `select id, url, is_cover, sort_order from property_images where property_id = $1 order by sort_order asc`,
      [property.id]
    ),
    query(
      `select f.id, f.name, f.icon from property_facilities pf
         join facilities f on f.id = pf.facility_id
        where pf.property_id = $1
        order by f.name asc`,
      [property.id]
    ),
  ]);

  return { ...property, images, facilities };
}

export async function getPropertyById(id) {
  const { rows } = await query(`select * from properties where id = $1`, [id]);
  return rows[0] || null;
}

export async function incrementViewCount(id) {
  await query(`update properties set view_count = view_count + 1 where id = $1`, [id]);
}

function slugify(title) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export async function createProperty(ownerId, data) {
  return withTransaction(async (client) => {
    const slug = slugify(data.title);
    const { rows } = await client.query(
      `insert into properties
        (owner_id, university_id, location_id, title, slug, description, property_type, room_type,
         price_amount, price_period, bedrooms, bathrooms, max_occupants, address_line,
         distance_to_campus_km, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'pending_review')
       returning *`,
      [
        ownerId,
        data.university_id,
        data.location_id,
        data.title,
        slug,
        data.description || "",
        data.property_type,
        data.room_type,
        data.price_amount,
        data.price_period,
        data.bedrooms,
        data.bathrooms,
        data.max_occupants,
        data.address_line,
        data.distance_to_campus_km || null,
      ]
    );
    const property = rows[0];

    if (Array.isArray(data.facility_ids) && data.facility_ids.length) {
      const values = data.facility_ids.map((fid, i) => `($1, $${i + 2})`).join(",");
      await client.query(
        `insert into property_facilities (property_id, facility_id) values ${values}`,
        [property.id, ...data.facility_ids]
      );
    }

    if (Array.isArray(data.image_urls) && data.image_urls.length) {
      for (let i = 0; i < data.image_urls.length; i++) {
        await client.query(
          `insert into property_images (property_id, url, is_cover, sort_order) values ($1,$2,$3,$4)`,
          [property.id, data.image_urls[i], i === 0, i]
        );
      }
    }

    return property;
  });
}

export async function updateProperty(id, data) {
  return withTransaction(async (client) => {
    const fields = [];
    const params = [];
    const settable = [
      "title",
      "description",
      "property_type",
      "room_type",
      "price_amount",
      "price_period",
      "bedrooms",
      "bathrooms",
      "max_occupants",
      "address_line",
      "location_id",
      "university_id",
      "distance_to_campus_km",
      "is_available",
    ];
    for (const key of settable) {
      if (data[key] !== undefined) {
        params.push(data[key]);
        fields.push(`${key} = $${params.length}`);
      }
    }
    // Substantive edits should go back through moderation.
    if (fields.length) {
      fields.push(`status = 'pending_review'`);
      fields.push(`updated_at = now()`);
      params.push(id);
      await client.query(
        `update properties set ${fields.join(", ")} where id = $${params.length}`,
        params
      );
    }

    if (Array.isArray(data.facility_ids)) {
      await client.query(`delete from property_facilities where property_id = $1`, [id]);
      if (data.facility_ids.length) {
        const values = data.facility_ids.map((fid, i) => `($1, $${i + 2})`).join(",");
        await client.query(
          `insert into property_facilities (property_id, facility_id) values ${values}`,
          [id, ...data.facility_ids]
        );
      }
    }

    if (Array.isArray(data.image_urls)) {
      await client.query(`delete from property_images where property_id = $1`, [id]);
      if (data.image_urls.length) {
        for (let i = 0; i < data.image_urls.length; i++) {
          await client.query(
            `insert into property_images (property_id, url, is_cover, sort_order) values ($1,$2,$3,$4)`,
            [id, data.image_urls[i], i === 0, i]
          );
        }
      }
    }

    const { rows } = await client.query(`select * from properties where id = $1`, [id]);
    return rows[0];
  });
}

export async function deleteProperty(id) {
  await query(`delete from properties where id = $1`, [id]);
}

export async function setPropertyAvailability(id, isAvailable) {
  await query(`update properties set is_available = $2, updated_at = now() where id = $1`, [
    id,
    isAvailable,
  ]);
}

export async function setPropertyStatus(id, status, { verified, notes } = {}) {
  const fields = ["status = $2", "updated_at = now()"];
  const params = [id, status];
  if (verified !== undefined) {
    params.push(verified);
    fields.push(`is_verified = $${params.length}`);
  }
  if (notes !== undefined) {
    params.push(notes);
    fields.push(`verification_notes = $${params.length}`);
  }
  await query(`update properties set ${fields.join(", ")} where id = $1`, params);
}

export async function getPropertyForEdit(id) {
  const { rows } = await query(`select * from properties where id = $1`, [id]);
  const property = rows[0];
  if (!property) return null;

  const [{ rows: images }, { rows: facilityRows }] = await Promise.all([
    query(`select url from property_images where property_id = $1 order by sort_order asc`, [id]),
    query(`select facility_id from property_facilities where property_id = $1`, [id]),
  ]);

  return {
    ...property,
    image_urls: images.map((i) => i.url),
    facility_ids: facilityRows.map((f) => f.facility_id),
  };
}

export async function getFacilities() {
  const { rows } = await query(`select id, name, icon from facilities order by name asc`);
  return rows;
}

export async function getPropertiesByIds(ids) {
  if (!ids.length) return [];
  const { rows } = await query(
    `select ${CARD_FIELDS},
            p.description,
            (select json_agg(json_build_object('id', f.id, 'name', f.name, 'icon', f.icon))
               from property_facilities pf join facilities f on f.id = pf.facility_id
              where pf.property_id = p.id) as facilities
       from properties p
       join locations l on l.id = p.location_id
       join universities u on u.id = p.university_id
      where p.id = any($1)`,
    [ids]
  );
  return rows;
}
