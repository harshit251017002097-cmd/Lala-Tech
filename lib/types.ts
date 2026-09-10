export type Role = 'manager' | 'employee';

export interface User {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: Role;
  avatar_color: string;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  created_at: string;
}

// PRD v2 6-stage lifecycle statuses
export type RequestStatus =
  | 'new'
  | 'needs_clarification'
  | 'ready_to_assign'
  | 'in_progress'
  | 'waiting_on_client'
  | 'done';

export type Priority = 'high' | 'medium' | 'low';

export type RequestCategory =
  | 'Sales'
  | 'Logistics'
  | 'Support'
  | 'Finance'
  | 'Operations'
  | 'Other';

export type RequestSource =
  | 'whatsapp'
  | 'email'
  | 'phone'
  | 'website'
  | 'manual'
  | 'other';

export interface RequestItem {
  id: string;
  display_id: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: Priority;
  category: RequestCategory;
  source: RequestSource;
  client_id: string | null;
  created_by: string;
  assigned_to: string | null;
  due_date: string | null;
  client_waiting_reason: string | null;
  waiting_since: string | null;
  total_client_waiting_minutes: number;
  total_internal_working_minutes: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  // Joined fields
  client_name?: string | null;
  client_company?: string | null;
  client_whatsapp?: string | null;
  client_phone?: string | null;
  client_email?: string | null;
  assignee_name?: string | null;
  assignee_color?: string | null;
  creator_name?: string | null;
  // Computed fields
  is_overdue?: boolean;
}

export interface Clarification {
  id: string;
  request_id: string;
  missing_information: string;
  requested_at: string;
  requested_from: string;
  resolved_at: string | null;
  notes: string | null;
}

export interface Comment {
  id: string;
  request_id: string;
  user_id: string;
  body: string;
  created_at: string;
  user_name?: string;
  user_role?: Role;
  user_color?: string;
}

export type ActivityActionType =
  | 'request_created'
  | 'request_edited'
  | 'request_assigned'
  | 'request_reassigned'
  | 'status_changed'
  | 'priority_changed'
  | 'clarification_requested'
  | 'clarification_resolved'
  | 'waiting_on_client_set'
  | 'comment_added'
  | 'request_completed'
  | 'request_deleted';

export interface ActivityLogEntry {
  id: string;
  request_id: string | null;
  user_id: string | null;
  action_type: ActivityActionType;
  description: string;
  metadata: string | null; // JSON string
  created_at: string;
  user_name?: string;
  user_role?: Role;
  request_title?: string;
  display_id?: string;
}

export type NotificationType =
  | 'request_assigned'
  | 'request_reassigned'
  | 'deadline_approaching'
  | 'request_overdue'
  | 'clarification_requested'
  | 'waiting_on_client'
  | 'comment_added'
  | 'request_completed';

export interface Notification {
  id: string;
  user_id: string;
  request_id: string | null;
  type: NotificationType;
  message: string;
  is_read: number;
  created_at: string;
  display_id?: string;
  request_title?: string;
}

export interface DashboardSummary {
  queues: {
    waiting_for_us: number;
    waiting_for_client: number;
    unassigned: number;
    overdue: number;
  };
  status_counts: Record<RequestStatus, number>;
  priority_counts: Record<Priority, number>;
  total_active: number;
  total_done: number;
  today_count: number;
}
