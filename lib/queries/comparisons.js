// lib/queries/comparisons.js
import { query } from "@/lib/db";

export const MAX_COMPARISON_ITEMS = 4;

export async function getComparisonIds(userId) {
  const { rows } = await query(
    `select property_id from comparison_items where user_id = $1 order by added_at asc`,
    [userId]
  );
  return rows.map((r) => r.property_id);
}

export async function toggleComparisonItem(userId, propertyId) {
  const { rows } = await query(
    `select 1 from comparison_items where user_id = $1 and property_id = $2`,
    [userId, propertyId]
  );
  if (rows.length > 0) {
    await query(`delete from comparison_items where user_id = $1 and property_id = $2`, [
      userId,
      propertyId,
    ]);
    return { added: false };
  }

  const current = await getComparisonIds(userId);
  if (current.length >= MAX_COMPARISON_ITEMS) {
    return { added: false, limitReached: true, max: MAX_COMPARISON_ITEMS };
  }

  await query(`insert into comparison_items (user_id, property_id) values ($1,$2)`, [
    userId,
    propertyId,
  ]);
  return { added: true };
}

export async function clearComparison(userId) {
  await query(`delete from comparison_items where user_id = $1`, [userId]);
}
