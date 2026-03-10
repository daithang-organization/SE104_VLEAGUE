import { api } from '../lib/api';

export interface Notification {
  id: string;
  userId: string | null;
  title: string;
  message: string;
  type: 'MATCH_RESULT' | 'STATUS_CHANGE' | 'SCHEDULE_CHANGE' | 'SYSTEM';
  entityType?: string;
  entityId?: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationResponse {
  data: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const apiGetNotifications = (page = 1, limit = 20) =>
  api.get<NotificationResponse>('/notifications', { params: { page, limit } }).then((r) => r.data);

export const apiMarkAsRead = (id: string) =>
  api.patch(`/notifications/${encodeURIComponent(id)}/read`).then((r) => r.data);

export const apiMarkAllAsRead = () => api.patch('/notifications/read-all').then((r) => r.data);
