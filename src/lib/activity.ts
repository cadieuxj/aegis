import { supabaseAdmin } from './supabase';
import { generateId } from './utils';

type ActivityStatus = 'success' | 'error';

interface ActivityLogInput {
  eventType: string;
  entityType?: string;
  entityId?: string | null;
  status?: ActivityStatus;
  message?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logActivity({
  eventType,
  entityType,
  entityId = null,
  status = 'success',
  message = null,
  metadata = {},
}: ActivityLogInput): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('activity_logs').insert({
      id: generateId(),
      event_type: eventType,
      entity_type: entityType || null,
      entity_id: entityId,
      status,
      message,
      metadata,
    });

    if (error) {
      console.error('[Activity] Failed to log activity:', error.message);
    }
  } catch (error) {
    console.error('[Activity] Failed to log activity:', error);
  }
}
