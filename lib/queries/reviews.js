// lib/queries/reviews.js
import { query } from "@/lib/db";

export async function getReviewsForProperty(propertyId) {
  const { rows } = await query(
    `select r.id, r.rating, r.comment, r.created_at, u.full_name as reviewer_name
       from reviews r
       join users u on u.id = r.user_id
      where r.property_id = $1 and r.status = 'published'
      order by r.created_at desc`,
    [propertyId]
  );
  return rows;
}

export async function getUserReviewForProperty(userId, propertyId) {
  const { rows } = await query(
    `select * from reviews where user_id = $1 and property_id = $2`,
    [userId, propertyId]
  );
  return rows[0] || null;
}

export async function getReviewsByStudent(userId) {
  const { rows } = await query(
    `select r.*, p.title as property_title, p.slug as property_slug
       from reviews r join properties p on p.id = r.property_id
      where r.user_id = $1
      order by r.created_at desc`,
    [userId]
  );
  return rows;
}

export async function upsertReview(userId, propertyId, { rating, comment }) {
  const { rows } = await query(
    `insert into reviews (property_id, user_id, rating, comment)
     values ($1,$2,$3,$4)
     on conflict (property_id, user_id)
     do update set rating = excluded.rating, comment = excluded.comment
     returning *`,
    [propertyId, userId, rating, comment || ""]
  );
  return rows[0];
}
