import { EditOutlined, UserOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { UserProfile } from '../services/authApi';
import { apiGetMe, apiLogoutAll, apiUpdateProfile } from '../services/authApi';

export default function ProfilePage() {
  const nav = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchProfile = async () => {
    try {
      const data = await apiGetMe();
      setProfile(data);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể tải thông tin';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogoutAll = () => {
    Modal.confirm({
      title: 'Đăng xuất tất cả thiết bị',
      content:
        'Bạn sẽ bị đăng xuất khỏi tất cả thiết bị, bao gồm cả thiết bị hiện tại. Tiếp tục?',
      okText: 'Đăng xuất',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setLogoutAllLoading(true);
        try {
          const result = await apiLogoutAll();
          message.success(result.message);
          // Logout current session
          await logout();
          nav('/login');
        } catch (err: unknown) {
          const errorMessage =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Có lỗi xảy ra';
          message.error(errorMessage);
        } finally {
          setLogoutAllLoading(false);
        }
      },
    });
  };

  const handleEditProfile = () => {
    form.setFieldsValue({
      name: profile?.name || '',
      avatarUrl: profile?.avatarUrl || '',
    });
    setEditModalVisible(true);
  };

  const handleUpdateProfile = async (values: { name?: string; avatarUrl?: string }) => {
    setEditLoading(true);
    try {
      const updated = await apiUpdateProfile(values);
      setProfile(updated);
      message.success('Cập nhật thành công');
      setEditModalVisible(false);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Có lỗi xảy ra';
      message.error(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'red';
      case 'TEAM_MANAGER':
        return 'blue';
      case 'REFEREE':
        return 'orange';
      case 'SUPERVISOR':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'TEAM_MANAGER':
        return 'Quản lý đội bóng';
      case 'REFEREE':
        return 'Trọng tài';
      case 'SUPERVISOR':
        return 'Giám sát';
      case 'PUBLIC':
        return 'Người dùng';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <Typography.Text type="danger">Không thể tải thông tin người dùng</Typography.Text>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Typography.Title level={3}>Thông tin tài khoản</Typography.Title>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Avatar
            size={80}
            icon={<UserOutlined />}
            src={profile.avatarUrl}
            style={{ marginRight: 24 }}
          />
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {profile.name || profile.email}
            </Typography.Title>
            <Typography.Text type="secondary">{profile.email}</Typography.Text>
          </div>
          <Button
            icon={<EditOutlined />}
            style={{ marginLeft: 'auto' }}
            onClick={handleEditProfile}
          >
            Chỉnh sửa
          </Button>
        </div>

        <Descriptions column={1} bordered>
          <Descriptions.Item label="ID">{profile.id}</Descriptions.Item>
          <Descriptions.Item label="Tên hiển thị">
            {profile.name || <Typography.Text type="secondary">Chưa cập nhật</Typography.Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
          <Descriptions.Item label="Vai trò">
            <Tag color={getRoleColor(profile.role)}>{getRoleLabel(profile.role)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái email">
            {profile.emailVerified ? (
              <Tag color="success">Đã xác thực</Tag>
            ) : (
              <Tag color="warning">Chưa xác thực</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(profile.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {new Date(profile.updatedAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
        </Descriptions>

        <Space style={{ marginTop: 24 }}>
          <Button type="primary" onClick={() => nav('/change-password')}>
            Đổi mật khẩu
          </Button>
          <Button onClick={() => nav('/sessions')}>Quản lý phiên đăng nhập</Button>
          <Button danger onClick={handleLogoutAll} loading={logoutAllLoading}>
            Đăng xuất tất cả thiết bị
          </Button>
        </Space>
      </Card>

      <Modal
        title="Chỉnh sửa hồ sơ"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
          <Form.Item
            name="name"
            label="Tên hiển thị"
            rules={[
              { min: 2, message: 'Tên phải có ít nhất 2 ký tự' },
              { max: 100, message: 'Tên không được quá 100 ký tự' },
            ]}
          >
            <Input placeholder="Nhập tên của bạn" />
          </Form.Item>
          <Form.Item
            name="avatarUrl"
            label="URL ảnh đại diện"
            rules={[{ type: 'url', message: 'Vui lòng nhập URL hợp lệ' }]}
          >
            <Input placeholder="https://example.com/avatar.jpg" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={editLoading}>
                Lưu thay đổi
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
