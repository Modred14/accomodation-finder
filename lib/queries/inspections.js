// lib/queries/inspections.js
import { query } from "@/lib/db";

export async function createInspectionRequest(studentId, { property_id, owner_id, preferred_date, preferred_time, message }) {
  const { rows } = await query(
    `insert into inspection_requests (property_id, student_id, owner_id, preferred_date, preferred_time, message)
     values ($1,$2,$3,$4,$5,$6) returning *`,
    [property_id, studentId, owner_id, preferred_date, preferred_time || "Afternoon", message || ""]
  );
  return rows[0];
}

export async function getInspectionsForStudent(studentId) {
  const { rows } = await query(
    `select ir.*, p.title as property_title, p.slug as property_slug,
            (select url from property_images pi where pi.property_id = p.id order by pi.is_cover desc limit 1) as property_image,
            (select alt from property_images pi where pi.property_id = p.id order by pi.is_cover desc limit 1) as property_image_alt,
            owner.full_name as owner_name, owner.phone as owner_phone
       from inspection_requests ir
       join properties p on p.id = ir.property_id
       join users owner on owner.id = ir.owner_id
      where ir.student_id = $1
      order by ir.created_at desc`,
    [studentId]
  );
  return rows;
}

export async function getInspectionsForOwner(ownerId) {
  const { rows } = await query(
    `select ir.*, p.title as property_title, p.slug as property_slug,
            (select url from property_images pi where pi.property_id = p.id order by pi.is_cover desc limit 1) as property_image,
            (select alt from property_images pi where pi.property_id = p.id order by pi.is_cover desc limit 1) as property_image_alt,
            student.full_name as student_name, student.phone as student_phone, student.email as student_email
       from inspection_requests ir
       join properties p on p.id = ir.property_id
       join users student on student.id = ir.student_id
      where ir.owner_id = $1
      order by ir.created_at desc`,
    [ownerId]
  );
  return rows;
}

export async function updateInspectionStatus(id, ownerId, status, ownerNote) {
  const { rows } = await query(
    `update inspection_requests set status = $3, owner_note = coalesce($4, owner_note), updated_at = now()
      where id = $1 and owner_id = $2 returning *`,
    [id, ownerId, status, ownerNote ?? null]
  );
  return rows[0] || null;
}

export async function cancelInspection(id, studentId) {
  const { rows } = await query(
    `update inspection_requests set status = 'cancelled', updated_at = now()
      where id = $1 and student_id = $2 returning *`,
    [id, studentId]
  );
  return rows[0] || null;
}