// lib/queries/universities.js
import { query } from "@/lib/db";

export async function getUniversities({ activeOnly = true } = {}) {
  const { rows } = await query(
    `select id, name, short_name, city, state, is_active
       from universities
      ${activeOnly ? "where is_active = true" : ""}
      order by name asc`
  );
  return rows;
}

export async function getUniversityById(id) {
  const { rows } = await query(`select * from universities where id = $1`, [id]);
  return rows[0] || null;
}

export async function createUniversity(data) {
  const { rows } = await query(
    `insert into universities (name, short_name, city, state, country)
     values ($1,$2,$3,$4, coalesce($5,'Nigeria')) returning *`,
    [data.name, data.short_name, data.city, data.state, data.country]
  );
  return rows[0];
}

export async function updateUniversity(id, data) {
  const { rows } = await query(
    `update universities set name=$2, short_name=$3, city=$4, state=$5, is_active=$6, updated_at=now()
      where id=$1 returning *`,
    [id, data.name, data.short_name, data.city, data.state, data.is_active]
  );
  return rows[0];
}

export async function deleteUniversity(id) {
  await query(`delete from universities where id = $1`, [id]);
}

export async function getLocations({ universityId, activeOnly = true } = {}) {
  const where = [];
  const params = [];
  if (universityId) {
    params.push(universityId);
    where.push(`university_id = $${params.length}`);
  }
  if (activeOnly) where.push("is_active = true");
  const whereSql = where.length ? `where ${where.join(" and ")}` : "";
  const { rows } = await query(
    `select id, university_id, name, description, distance_to_campus_km, walk_minutes, is_active
       from locations ${whereSql} order by name asc`,
    params
  );
  return rows;
}

export async function getLocationById(id) {
  const { rows } = await query(`select * from locations where id = $1`, [id]);
  return rows[0] || null;
}

export async function createLocation(data) {
  const { rows } = await query(
    `insert into locations (university_id, name, description, distance_to_campus_km, walk_minutes)
     values ($1,$2,$3,$4,$5) returning *`,
    [data.university_id, data.name, data.description || null, data.distance_to_campus_km || null, data.walk_minutes || null]
  );
  return rows[0];
}

export async function updateLocation(id, data) {
  const { rows } = await query(
    `update locations set name=$2, description=$3, distance_to_campus_km=$4, walk_minutes=$5, is_active=$6, updated_at=now()
      where id=$1 returning *`,
    [id, data.name, data.description || null, data.distance_to_campus_km || null, data.walk_minutes || null, data.is_active]
  );
  return rows[0];
}

export async function deleteLocation(id) {
  await query(`delete from locations where id = $1`, [id]);
}
