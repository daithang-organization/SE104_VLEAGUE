import {
    DeleteOutlined,
    DesktopOutlined,
    MobileOutlined,
    TabletOutlined,
} from '@ant-design/icons';
import {
    Alert,
    Button,
    Card,
    List,
    message,
    Popconfirm,
    Space,
    Tag,
    Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Session } from '../services/authApi';
import { apiGetSessions, apiLogoutAll, apiRevokeSession } from '../services/authApi';

export default function SessionsPage() {
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
      message.success('Đã thu hồi phiên đăng nhập');
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
        <Link to="/profile">← Quay lại hồ sơ</Link>
      </div>

      <Card
        title="Quản lý phiên đăng nhập"
        extra={
          sessions.length > 1 && (
            <Popconfirm
              title="Đăng xuất tất cả?"
              description="Bạn sẽ bị đăng xuất khỏi tất cả thiết bị, bao gồm thiết bị này."
              onConfirm={handleLogoutAll}
              okText="Đăng xuất"
              okButtonProps={{ danger: true }}
              cancelText="Hủy"
            >
              <Button danger loading={logoutAllLoading}>
                Đăng xuất tất cả
              </Button>
            </Popconfirm>
          )
        }
      >
        <Alert
          message="Phiên đăng nhập"
          description="Danh sách các thiết bị đang đăng nhập vào tài khoản của bạn. Bạn có thể thu hồi quyền truy cập của bất kỳ thiết bị nào."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <List
          loading={loading}
          dataSource={sessions}
          locale={{ emptyText: 'Không có phiên đăng nhập nào' }}
          renderItem={(session, index) => (
            <List.Item
              actions={[
                index === 0 ? (
                  <Tag color="green" key="current">
                    Thiết bị này
                  </Tag>
                ) : (
                  <Popconfirm
                    key="revoke"
                    title="Thu hồi phiên này?"
                    description="Thiết bị này sẽ bị đăng xuất."
                    onConfirm={() => handleRevoke(session.id)}
                    okText="Thu hồi"
                    okButtonProps={{ danger: true }}
                    cancelText="Hủy"
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      loading={revoking === session.id}
                    >
                      Thu hồi
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
                    {index === 0 && <Tag color="blue">Hiện tại</Tag>}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Typography.Text type="secondary">
                      IP: {session.ipAddress || 'N/A'}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      Hoạt động lần cuối: {formatDate(session.lastUsedAt)}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      Đăng nhập: {formatDate(session.createdAt)}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      Hết hạn: {formatDate(session.expiresAt)}
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
