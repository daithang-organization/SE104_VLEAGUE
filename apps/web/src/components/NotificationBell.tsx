import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, Empty, List, Typography } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  apiGetNotifications,
  apiMarkAllAsRead,
  apiMarkAsRead,
  type Notification,
} from '../services/notificationApi';
import { dispatchTeamInvitationReopen } from './TeamInvitationPopup';

const POLL_INTERVAL = 30_000;

export default function NotificationBell() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiGetNotifications(1, 15);
      setNotifications(res.data);
      setUnreadCount(res.unreadCount);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    timerRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchNotifications]);

  const handleRead = async (item: Notification) => {
    if (!item.readAt) {
      try {
        await apiMarkAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        /* silent */
      }
    }
    if (item.entityType === 'match' && item.entityId) {
      nav(`/matches/${item.entityId}`);
      setOpen(false);
    }
    if (item.entityType === 'team_invitation') {
      dispatchTeamInvitationReopen(item.entityId);
      setOpen(false);
    }
  };

  const handleMarkAll = async () => {
    try {
      await apiMarkAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      /* silent */
    }
  };

  const dropdownContent = (
    <div
      style={{
        width: 360,
        maxHeight: 420,
        overflow: 'auto',
        background: 'var(--ant-color-bg-elevated, #fff)',
        borderRadius: 8,
        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px 8px',
          borderBottom: '1px solid var(--ant-color-border, #f0f0f0)',
        }}
      >
        <Typography.Text strong>{t('Thông báo')}</Typography.Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAll}>
            {t('Đã đọc tất cả')}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Empty
          description={t('Chưa có thông báo nào!')}
          style={{ padding: 24 }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              onClick={() => handleRead(item)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                background: item.readAt ? 'transparent' : 'var(--ant-color-primary-bg, #e6f4ff)',
              }}
            >
              <List.Item.Meta
                title={
                  <Typography.Text strong={!item.readAt} style={{ fontSize: 13 }}>
                    {item.title}
                  </Typography.Text>
                }
                description={
                  <>
                    <Typography.Paragraph
                      style={{ fontSize: 12, margin: 0 }}
                      ellipsis={{ rows: 2 }}
                    >
                      {item.message}
                    </Typography.Paragraph>
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={['click']}
      dropdownRender={() => dropdownContent}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small" offset={[-4, 4]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ color: 'white', fontSize: 16 }} />}
          title={t('Thông báo')}
        />
      </Badge>
    </Dropdown>
  );
}
