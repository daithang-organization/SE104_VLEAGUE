import { api } from '../lib/api';

// ─────────── Types ───────────
export type Notification = {
  id: string;
  type: 'MATCH_FINISHED' | 'SCHEDULE_PUBLISHED' | 'SEASON_STARTED' | 'TEAM_REGISTERED' | 'GENERAL';
  title: string;
  message: string;
  readAt: string | null;
  link: string | null;
  createdAt: string;
};

export type NotificationResponse = {
  data: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ─────────── API calls ───────────
export function apiGetNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}) {
  return api.get<NotificationResponse>('/notifications', { params }).then((r) => r.data);
}

export function apiGetUnreadCount() {
  return api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data);
}

export function apiMarkAsRead(id: string) {
  return api.patch(`/notifications/${id}/read`).then((r) => r.data);
}

export function apiMarkAllAsRead() {
  return api.patch('/notifications/read-all').then((r) => r.data);
}

export function apiDeleteNotification(id: string) {
  return api.delete(`/notifications/${id}`).then((r) => r.data);
}
