// lib/queries/reports.js
import { query } from "@/lib/db";

export async function createReport(reportedBy, { property_id, reason, details }) {
  const { rows } = await query(
    `insert into reports (property_id, reported_by, reason, details) values ($1,$2,$3,$4) returning *`,
    [property_id || null, reportedBy, reason, details || ""]
  );
  return rows[0];
}

export async function getReportsForUser(userId) {
  const { rows } = await query(
    `select r.*, p.title as property_title, p.slug as property_slug
       from reports r
       left join properties p on p.id = r.property_id
      where r.reported_by = $1
      order by r.created_at desc`,
    [userId]
  );
  return rows;
}

export async function getAllReports({ status } = {}) {
  const where = [];
  const params = [];
  if (status) {
    params.push(status);
    where.push(`r.status = $${params.length}`);
  }
  const whereSql = where.length ? `where ${where.join(" and ")}` : "";
  const { rows } = await query(
    `select r.*, p.title as property_title, p.slug as property_slug,
            reporter.full_name as reporter_name, reporter.email as reporter_email
       from reports r
       left join properties p on p.id = r.property_id
       join users reporter on reporter.id = r.reported_by
       ${whereSql}
      order by r.created_at desc`,
    params
  );
  return rows;
}

export async function resolveReport(id, resolvedBy, status) {
  const { rows } = await query(
    `update reports set status = $2, resolved_by = $3, resolved_at = now() where id = $1 returning *`,
    [id, status, resolvedBy]
  );
  return rows[0] || null;
}
