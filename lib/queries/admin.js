// lib/queries/admin.js
import { query } from "@/lib/db";

export async function getPlatformStats() {
  const [
    { rows: userCounts },
    { rows: propertyCounts },
    { rows: reportCounts },
    { rows: inspectionCounts },
  ] = await Promise.all([
    query(`select role, count(*)::int as count from users group by role`),
    query(`select status, count(*)::int as count from properties group by status`),
    query(`select status, count(*)::int as count from reports group by status`),
    query(`select status, count(*)::int as count from inspection_requests group by status`),
  ]);

  return { userCounts, propertyCounts, reportCounts, inspectionCounts };
}

export async function getAllUsers({ role, q } = {}) {
  const where = [];
  const params = [];
  if (role) {
    params.push(role);
    where.push(`role = $${params.length}`);
  }
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(`(lower(full_name) like $${params.length} or lower(email) like $${params.length})`);
  }
  const whereSql = where.length ? `where ${where.join(" and ")}` : "";
  const { rows } = await query(
    `select id, role, full_name, email, phone, is_verified, status, created_at,
            (select count(*) from properties p where p.owner_id = users.id)::int as listing_count
       from users ${whereSql} order by created_at desc`,
    params
  );
  return rows;
}

export async function setUserStatus(id, status) {
  const { rows } = await query(
    `update users set status = $2, updated_at = now() where id = $1 returning *`,
    [id, status]
  );
  return rows[0] || null;
}

export async function setUserVerified(id, isVerified) {
  const { rows } = await query(
    `update users set is_verified = $2, updated_at = now() where id = $1 returning *`,
    [id, isVerified]
  );
  return rows[0] || null;
}

export async function getModerationQueue() {
  const { rows } = await query(
    `select p.id, p.title, p.slug, p.status, p.is_verified, p.price_amount, p.price_period, p.created_at,
            owner.full_name as owner_name, owner.email as owner_email,
            l.name as location_name,
            (select url from property_images pi where pi.property_id = p.id order by pi.is_cover desc limit 1) as cover_image,
            (select alt from property_images pi where pi.property_id = p.id order by pi.is_cover desc limit 1) as cover_image_alt
       from properties p
       join users owner on owner.id = p.owner_id
       join locations l on l.id = p.location_id
      order by (p.status = 'pending_review') desc, p.created_at desc`
  );
  return rows;
}