// lib/queries/favourites.js
import { query } from "@/lib/db";

export async function getFavouriteIds(userId) {
  const { rows } = await query(`select property_id from favourites where user_id = $1`, [userId]);
  return rows.map((r) => r.property_id);
}

export async function isFavourite(userId, propertyId) {
  const { rows } = await query(
    `select 1 from favourites where user_id = $1 and property_id = $2`,
    [userId, propertyId]
  );
  return rows.length > 0;
}

export async function toggleFavourite(userId, propertyId) {
  const already = await isFavourite(userId, propertyId);
  if (already) {
    await query(`delete from favourites where user_id = $1 and property_id = $2`, [userId, propertyId]);
    return { favourited: false };
  }
  await query(`insert into favourites (user_id, property_id) values ($1,$2)`, [userId, propertyId]);
  return { favourited: true };
}
