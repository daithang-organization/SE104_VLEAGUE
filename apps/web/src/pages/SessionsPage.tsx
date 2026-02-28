import { DeleteOutlined, DesktopOutlined, MobileOutlined, TabletOutlined } from '@ant-design/icons';
import { Alert, Button, Card, List, message, Popconfirm, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Session } from '../services/authApi';
import { apiGetSessions, apiLogoutAll, apiRevokeSession } from '../services/authApi';

export default function SessionsPage() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);

  const fetchSessions = async () => {
    try {
      const data = await apiGetSessions();
      setSessions(data);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể tải danh sách phiên đăng nhập';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      await apiRevokeSession(sessionId);
      message.success(t('sessions.revokeSuccess'));
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể thu hồi phiên đăng nhập';
      message.error(errorMessage);
    } finally {
      setRevoking(null);
    }
  };

  const handleLogoutAll = async () => {
    setLogoutAllLoading(true);
    try {
      const result = await apiLogoutAll();
      message.success(result.message);
      setSessions([]);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể đăng xuất khỏi tất cả thiết bị';
      message.error(errorMessage);
    } finally {
      setLogoutAllLoading(false);
    }
  };

  const getDeviceIcon = (deviceName: string | null) => {
    if (!deviceName) return <DesktopOutlined />;
    const name = deviceName.toLowerCase();
    if (name.includes('android') || name.includes('ios') || name.includes('iphone')) {
      return <MobileOutlined />;
    }
    if (name.includes('ipad') || name.includes('tablet')) {
      return <TabletOutlined />;
    }
    return <DesktopOutlined />;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Link to="/profile">{t('sessions.backToProfile')}</Link>
      </div>

      <Card
        title={t('sessions.title')}
        extra={
          sessions.length > 1 && (
            <Popconfirm
              title={t('sessions.logoutAllConfirmTitle')}
              description={t('sessions.logoutAllConfirmDesc')}
              onConfirm={handleLogoutAll}
              okText={t('sessions.logoutAllOk')}
              okButtonProps={{ danger: true }}
              cancelText={t('sessions.logoutAllCancel')}
            >
              <Button danger loading={logoutAllLoading}>
                {t('sessions.logoutAllBtn')}
              </Button>
            </Popconfirm>
          )
        }
      >
        <Alert
          message={t('sessions.alertTitle')}
          description={t('sessions.alertDesc')}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <List
          loading={loading}
          dataSource={sessions}
          locale={{ emptyText: t('sessions.empty') }}
          renderItem={(session, index) => (
            <List.Item
              actions={[
                index === 0 ? (
                  <Tag color="green" key="current">
                    {t('sessions.currentDevice')}
                  </Tag>
                ) : (
                  <Popconfirm
                    key="revoke"
                    title={t('sessions.revokeConfirmTitle')}
                    description={t('sessions.revokeConfirmDesc')}
                    onConfirm={() => handleRevoke(session.id)}
                    okText={t('sessions.revokeOk')}
                    okButtonProps={{ danger: true }}
                    cancelText={t('sessions.revokeCancel')}
                  >
                    <Button danger icon={<DeleteOutlined />} loading={revoking === session.id}>
                      {t('sessions.revokeBtn')}
                    </Button>
                  </Popconfirm>
                ),
              ]}
            >
              <List.Item.Meta
                avatar={
                  <span style={{ fontSize: 24, color: '#1890ff' }}>
                    {getDeviceIcon(session.deviceName)}
                  </span>
                }
                title={
                  <Space>
                    {session.deviceName || 'Unknown Device'}
                    {index === 0 && <Tag color="blue">{t('sessions.currentTag')}</Tag>}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Typography.Text type="secondary">
                      {t('sessions.ipLabel', { ip: session.ipAddress || 'N/A' })}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {t('sessions.lastUsedLabel', { time: formatDate(session.lastUsedAt) })}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {t('sessions.createdLabel', { time: formatDate(session.createdAt) })}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {t('sessions.expiresLabel', { time: formatDate(session.expiresAt) })}
                    </Typography.Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
