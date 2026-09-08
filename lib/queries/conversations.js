// lib/queries/conversations.js
import { query, withTransaction } from "@/lib/db";

export async function getOrCreateConversation({ studentId, ownerId, propertyId }) {
  const { rows } = await query(
    `select * from conversations where student_id = $1 and owner_id = $2 and property_id is not distinct from $3`,
    [studentId, ownerId, propertyId || null]
  );
  if (rows[0]) return rows[0];

  const { rows: created } = await query(
    `insert into conversations (student_id, owner_id, property_id) values ($1,$2,$3) returning *`,
    [studentId, ownerId, propertyId || null]
  );
  return created[0];
}

export async function getConversationsForUser(userId, role) {
  const column = role === "student" ? "student_id" : "owner_id";
  const { rows } = await query(
    `select c.*, p.title as property_title, p.slug as property_slug,
            student.full_name as student_name, owner.full_name as owner_name,
            (select body from messages m where m.conversation_id = c.id order by m.created_at desc limit 1) as last_message,
            (select count(*) from messages m where m.conversation_id = c.id and m.is_read = false and m.sender_id <> $1)::int as unread_count
       from conversations c
       left join properties p on p.id = c.property_id
       join users student on student.id = c.student_id
       join users owner on owner.id = c.owner_id
      where c.${column} = $1
      order by c.last_message_at desc`,
    [userId]
  );
  return rows;
}

export async function getConversationById(id, userId) {
  const { rows } = await query(
    `select c.*, p.title as property_title, p.slug as property_slug,
            student.full_name as student_name, owner.full_name as owner_name
       from conversations c
       left join properties p on p.id = c.property_id
       join users student on student.id = c.student_id
       join users owner on owner.id = c.owner_id
      where c.id = $1 and (c.student_id = $2 or c.owner_id = $2)`,
    [id, userId]
  );
  return rows[0] || null;
}

export async function getMessages(conversationId) {
  const { rows } = await query(
    `select m.id, m.body, m.created_at, m.sender_id, m.is_read, u.full_name as sender_name
       from messages m
       join users u on u.id = m.sender_id
      where m.conversation_id = $1
      order by m.created_at asc`,
    [conversationId]
  );
  return rows;
}

export async function sendMessage(conversationId, senderId, body) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `insert into messages (conversation_id, sender_id, body) values ($1,$2,$3) returning *`,
      [conversationId, senderId, body]
    );
    await client.query(`update conversations set last_message_at = now() where id = $1`, [conversationId]);
    return rows[0];
  });
}

export async function markConversationRead(conversationId, userId) {
  await query(
    `update messages set is_read = true where conversation_id = $1 and sender_id <> $2`,
    [conversationId, userId]
  );
}
