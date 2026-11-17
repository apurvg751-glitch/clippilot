export type SubscriptionStatus = 'trial' | 'active' | 'grace_period' | 'paused';

export interface Shop {
  id: string;
  name: string;
  slug: string;
  category: string;
  city?: string;
  owner_name: string;
  owner_phone: string;
  google_review_url: string;
  monthly_retainer?: number;
  subscription_status: SubscriptionStatus;
  payment_status?: string;
  portal_password?: string; // Tenant access PIN for shopkeeper
  trial_ends_at: string; // ISO 8601 timestamp (7 days from creation)
  current_period_end?: string | null; // ISO 8601 timestamp
  razorpay_subscription_id?: string | null;
  razorpay_customer_id?: string | null;
  payment_link?: string | null;
  total_scans?: number;
  positive_redirects?: number;
  scans_count?: number;
  rating_avg?: number;
  reviews_gained?: number;
  complaints_blocked?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PrivateFeedback {
  id: string;
  business_id?: string;
  business_name?: string;
  business_category?: string;
  rating: number;
  customer_name: string;
  customer_contact: string;
  complaint_text: string;
  status: 'pending' | 'resolved';
  created_at: string;
}

export interface WebhookEventPayload {
  entity: string;
  account_id?: string;
  event: string;
  contains: string[];
  payload: {
    subscription?: {
      entity: {
        id: string;
        plan_id?: string;
        customer_id?: string;
        status?: string;
        current_end?: number;
        charge_at?: number;
        short_url?: string;
        notes?: Record<string, string>;
      };
    };
    payment?: {
      entity: {
        id: string;
        amount?: number;
        currency?: string;
        status?: string;
        order_id?: string;
        notes?: Record<string, string>;
      };
    };
  };
  created_at: number;
}
