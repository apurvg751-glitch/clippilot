import fs from 'fs';
import path from 'path';

export interface StoredFeedback {
  id: string;
  business_id: string;
  business_slug?: string;
  business_name?: string;
  business_category?: string;
  rating: number;
  customer_name: string;
  customer_contact: string;
  complaint_text: string;
  status: 'pending' | 'resolved';
  created_at: string;
}

const FEEDBACK_STORE_PATH = path.join(process.env.TEMP || '/tmp', 'repuboost_feedback_store.json');

const MEMORY_FEEDBACK: StoredFeedback[] = [];

export function isDemoFeedbackRecord(f: any): boolean {
  if (!f) return false;
  const name = String(f.customer_name || '').toLowerCase();
  const contact = String(f.customer_contact || '');
  const biz = String(f.business_name || '').toLowerCase();
  const text = String(f.complaint_text || '').toLowerCase();
  return (
    name.includes('e2e') ||
    name.includes('verification') ||
    name.includes('vikram') ||
    name.includes('rahul') ||
    contact.includes('98111') ||
    contact.includes('98765') ||
    biz.includes('management') ||
    text.includes('samosas were cold') ||
    text.includes('rasmalai was slightly sour') ||
    text.includes('counter queue was slightly slow')
  );
}

export function getStoredFeedbacks(): StoredFeedback[] {
  try {
    if (fs.existsSync(FEEDBACK_STORE_PATH)) {
      const raw = fs.readFileSync(FEEDBACK_STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((item) => !isDemoFeedbackRecord(item));
        if (cleaned.length !== parsed.length) {
          try {
            fs.writeFileSync(FEEDBACK_STORE_PATH, JSON.stringify(cleaned, null, 2), 'utf-8');
          } catch {}
        }
        return cleaned;
      }
    }
  } catch (err) {
    console.warn('[FeedbackStore] Error reading stored feedbacks:', err);
  }
  return MEMORY_FEEDBACK.filter((item) => !isDemoFeedbackRecord(item));
}

export function persistFeedback(fb: StoredFeedback): StoredFeedback[] {
  try {
    const list = getStoredFeedbacks();
    list.unshift(fb);
    fs.writeFileSync(FEEDBACK_STORE_PATH, JSON.stringify(list, null, 2), 'utf-8');
    MEMORY_FEEDBACK.unshift(fb);
    return list;
  } catch {
    MEMORY_FEEDBACK.unshift(fb);
    return [...MEMORY_FEEDBACK];
  }
}

export function deleteStoredFeedback(id: string, businessId?: string): StoredFeedback[] {
  try {
    const list = getStoredFeedbacks().filter((f) => {
      if (f.id !== id) return true;
      // Strict multi-tenant isolation: if businessId is supplied, do not delete unless business matches
      if (businessId && f.business_id !== businessId && f.business_slug !== businessId) {
        return true;
      }
      return false;
    });
    fs.writeFileSync(FEEDBACK_STORE_PATH, JSON.stringify(list, null, 2), 'utf-8');
    const idx = MEMORY_FEEDBACK.findIndex(
      (f) =>
        f.id === id &&
        (!businessId || f.business_id === businessId || f.business_slug === businessId)
    );
    if (idx >= 0) {
      MEMORY_FEEDBACK.splice(idx, 1);
    }
    return list;
  } catch {
    const idx = MEMORY_FEEDBACK.findIndex(
      (f) =>
        f.id === id &&
        (!businessId || f.business_id === businessId || f.business_slug === businessId)
    );
    if (idx >= 0) {
      MEMORY_FEEDBACK.splice(idx, 1);
    }
    return [...MEMORY_FEEDBACK];
  }
}

export function updateStoredFeedbackStatus(
  id: string,
  status: 'pending' | 'resolved',
  businessId?: string
): boolean {
  try {
    const list = getStoredFeedbacks();
    const item = list.find(
      (f) =>
        f.id === id &&
        (!businessId || f.business_id === businessId || f.business_slug === businessId)
    );
    if (item) {
      item.status = status;
      fs.writeFileSync(FEEDBACK_STORE_PATH, JSON.stringify(list, null, 2), 'utf-8');
      const mItem = MEMORY_FEEDBACK.find(
        (f) =>
          f.id === id &&
          (!businessId || f.business_id === businessId || f.business_slug === businessId)
      );
      if (mItem) mItem.status = status;
      return true;
    }
  } catch (err) {
    console.warn('[FeedbackStore] Error updating feedback status:', err);
  }
  return false;
}
