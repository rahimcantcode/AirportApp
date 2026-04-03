import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/errors.js';
import type { MessageDTO } from '../types.js';

function toDto(row: any): MessageDTO {
  const boardType = row.board_type;
  const meta = row.message_meta || {};

  return {
    id: String(row.message_id),
    boardType,
    senderRole: row.sender_role || undefined,
    senderId: row.sender_id || undefined,
    relatedFlightId: row.related_flight_id || undefined,
    relatedBagId: row.related_bag_id || undefined,
    content: row.content,
    createdAt: row.created_at,

    board: boardType,
    role: boardType,
    subject: meta.subject || 'Operational update',
    severity: meta.severity || 'info',
    read: Boolean(meta.is_read),
    ticketNumber: meta.related_ticket_number || undefined,
    passengerId: meta.related_ticket_number || undefined,
    flightId: row.related_flight_id || undefined,
    bagId: row.related_bag_id || undefined,
    timestamp: row.created_at,
    author: meta.author_username || row.sender_role || 'system',
    airline: meta.airline_code || row.related_flight?.airline_code || undefined,
  };
}

export async function listMessages(): Promise<MessageDTO[]> {
  const { data, error } = await supabase
    .from('message')
    .select(
      'message_id, board_type, sender_role, sender_id, related_flight_id, related_bag_id, content, created_at, related_flight:related_flight_id(airline_code), message_meta(subject, severity, is_read, related_ticket_number, airline_code, author_username)'
    )
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(500, error.message);
  return (data || []).map(toDto);
}

export async function createMessage(input: Partial<MessageDTO>): Promise<MessageDTO> {
  const boardType = input.boardType || input.board || input.role;
  if (!boardType) throw new ApiError(400, 'boardType is required');
  if (!input.content) throw new ApiError(400, 'content is required');

  const { data, error } = await supabase
    .from('message')
    .insert({
      board_type: boardType,
      sender_role: input.senderRole || input.author || input.role || null,
      sender_id: input.senderId || null,
      related_flight_id: input.relatedFlightId || input.flightId || null,
      related_bag_id: input.relatedBagId || input.bagId || null,
      content: input.content,
    })
    .select('message_id, board_type, sender_role, sender_id, related_flight_id, related_bag_id, content, created_at')
    .single();

  if (error || !data) throw new ApiError(500, error?.message || 'Failed to create message');

  const { error: metaError } = await supabase.from('message_meta').upsert(
    {
      message_id: data.message_id,
      subject: input.subject || 'Operational update',
      severity: input.severity || 'info',
      is_read: Boolean(input.read),
      related_ticket_number: input.ticketNumber || input.passengerId || null,
      airline_code: input.airline || null,
      author_username: input.author || null,
    },
    { onConflict: 'message_id' }
  );

  if (metaError) throw new ApiError(500, metaError.message);

  const { data: fullRow, error: fullErr } = await supabase
    .from('message')
    .select(
      'message_id, board_type, sender_role, sender_id, related_flight_id, related_bag_id, content, created_at, related_flight:related_flight_id(airline_code), message_meta(subject, severity, is_read, related_ticket_number, airline_code, author_username)'
    )
    .eq('message_id', data.message_id)
    .single();

  if (fullErr || !fullRow) throw new ApiError(500, fullErr?.message || 'Failed to load message');
  return toDto(fullRow);
}

export async function markMessageRead(messageId: string, read: boolean): Promise<MessageDTO> {
  const id = Number(messageId);

  const { error: metaError } = await supabase
    .from('message_meta')
    .upsert({ message_id: id, is_read: read }, { onConflict: 'message_id' });

  if (metaError) throw new ApiError(500, metaError.message);

  const { data, error } = await supabase
    .from('message')
    .select(
      'message_id, board_type, sender_role, sender_id, related_flight_id, related_bag_id, content, created_at, related_flight:related_flight_id(airline_code), message_meta(subject, severity, is_read, related_ticket_number, airline_code, author_username)'
    )
    .eq('message_id', id)
    .single();

  if (error || !data) throw new ApiError(500, error?.message || 'Failed to update message');
  return toDto(data);
}
