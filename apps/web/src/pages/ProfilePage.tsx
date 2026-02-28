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
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { UserProfile } from '../services/authApi';
import { apiGetMe, apiLogoutAll, apiUpdateProfile } from '../services/authApi';

export default function ProfilePage() {
  const nav = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();
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
      title: t('profile.logoutAllConfirmTitle'),
      content: t('profile.logoutAllConfirmContent'),
      okText: t('profile.logoutAllOk'),
      okType: 'danger',
      cancelText: t('profile.logoutAllCancel'),
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
      message.success(t('profile.updateSuccess'));
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
        <Typography.Text type="danger">{t('profile.loadFailed')}</Typography.Text>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Typography.Title level={3}>{t('profile.title')}</Typography.Title>

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
            {t('profile.editBtn')}
          </Button>
        </div>

        <Descriptions column={1} bordered>
          <Descriptions.Item label={t('profile.descId')}>{profile.id}</Descriptions.Item>
          <Descriptions.Item label={t('profile.descName')}>
            {profile.name || (
              <Typography.Text type="secondary">{t('profile.descNameEmpty')}</Typography.Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('profile.descEmail')}>{profile.email}</Descriptions.Item>
          <Descriptions.Item label={t('profile.descRole')}>
            <Tag color={getRoleColor(profile.role)}>{t(`roleLabel.${profile.role}`)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('profile.descEmailStatus')}>
            {profile.emailVerified ? (
              <Tag color="success">{t('profile.emailVerified')}</Tag>
            ) : (
              <Tag color="warning">{t('profile.emailNotVerified')}</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('profile.descCreatedAt')}>
            {new Date(profile.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label={t('profile.descUpdatedAt')}>
            {new Date(profile.updatedAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
        </Descriptions>

        <Space style={{ marginTop: 24 }}>
          <Button type="primary" onClick={() => nav('/change-password')}>
            {t('profile.changePasswordBtn')}
          </Button>
          <Button onClick={() => nav('/sessions')}>{t('profile.manageSessionsBtn')}</Button>
          <Button danger onClick={handleLogoutAll} loading={logoutAllLoading}>
            {t('profile.logoutAllBtn')}
          </Button>
        </Space>
      </Card>

      <Modal
        title={t('profile.editModalTitle')}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
          <Form.Item
            name="name"
            label={t('profile.formDisplayName')}
            rules={[
              { min: 2, message: t('profile.formDisplayNameMin') },
              { max: 100, message: t('profile.formDisplayNameMax') },
            ]}
          >
            <Input placeholder={t('profile.formDisplayNamePlaceholder')} />
          </Form.Item>
          <Form.Item
            name="avatarUrl"
            label={t('profile.formAvatarUrl')}
            rules={[{ type: 'url', message: t('profile.formAvatarUrlInvalid') }]}
          >
            <Input placeholder={t('profile.formAvatarUrlPlaceholder')} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={editLoading}>
                {t('profile.saveBtn')}
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>{t('profile.cancelBtn')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
