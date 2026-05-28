import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppMenuIcon } from '../components';
import { PageCover } from '../components/PageCover';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  apiCreateUser,
  apiDeleteUser,
  apiGetUsers,
  apiUpdateUserRole,
  type CreateUserPayload,
  type User,
} from '../services/userApi';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'red',
  TEAM_MANAGER: 'blue',
  REFEREE: 'green',
  SUPERVISOR: 'orange',
  PUBLIC: 'default',
};

const ROLE_KEYS = ['ADMIN', 'TEAM_MANAGER', 'REFEREE', 'SUPERVISOR', 'PUBLIC'] as const;

export default function UsersPage() {
  const { t } = useTranslation();
  const roleOptions = useMemo(
    () => ROLE_KEYS.map((k) => ({ value: k, label: t(`role.${k}`) })),
    [t],
  );
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create user modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [creating, setCreating] = useState(false);

  // Edit role modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetUsers();
      setUsers(data);
    } catch (_err) {
      message.error(t('users.loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ─── Create ─────────────────
  const handleCreate = async (values: CreateUserPayload) => {
    setCreating(true);
    try {
      await apiCreateUser(values);
      message.success(t('users.createSuccess'));
      setCreateOpen(false);
      createForm.resetFields();
      fetchUsers();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t('users.createError');
      message.error(msg);
    } finally {
      setCreating(false);
    }
  };

  // ─── Edit Role ──────────────
  const openEditModal = (user: User) => {
    setEditingUser(user);
    editForm.setFieldsValue({ role: user.role });
    setEditOpen(true);
  };

  const handleUpdateRole = async (values: { role: string }) => {
    if (!editingUser) return;
    setUpdating(true);
    try {
      await apiUpdateUserRole(editingUser.id, values.role);
      message.success(t('users.roleUpdateSuccess'));
      setEditOpen(false);
      fetchUsers();
    } catch (_err) {
      message.error(t('users.roleUpdateError'));
    } finally {
      setUpdating(false);
    }
  };

  // ─── Delete ─────────────────
  const handleDelete = async (id: string) => {
    try {
      await apiDeleteUser(id);
      message.success(t('users.deleteSuccess'));
      fetchUsers();
    } catch (_err) {
      message.error(t('users.deleteError'));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name ?? '').toLowerCase().includes(search.toLowerCase()),
  );
  const verifiedUsers = users.filter((user) => user.emailVerified).length;
  const adminUsers = users.filter((user) => user.role === 'ADMIN').length;

  const columns: ColumnsType<User> = [
    {
      title: t('users.colEmail'),
      dataIndex: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: t('users.colName'),
      dataIndex: 'name',
      render: (v: string | null) => v || '—',
    },
    {
      title: t('users.colRole'),
      dataIndex: 'role',
      width: 140,
      filters: roleOptions.map((r) => ({ text: r.label, value: r.value })),
      onFilter: (value, record) => record.role === value,
      render: (role: string) => {
        const color = ROLE_COLORS[role] || 'default';
        return <Tag color={color}>{t(`role.${role}`)}</Tag>;
      },
    },
    {
      title: t('users.colEmailVerified'),
      dataIndex: 'emailVerified',
      width: 130,
      align: 'center',
      render: (v: boolean) => (v ? <Tag color="success">✓</Tag> : <Tag color="error">✗</Tag>),
    },
    {
      title: t('users.colOAuth'),
      key: 'oauth',
      width: 100,
      align: 'center',
      render: (_, r) => (
        <Space size={4}>
          {r.googleId && <Tag color="red">Google</Tag>}
          {r.facebookId && <Tag color="blue">FB</Tag>}
          {!r.googleId && !r.facebookId && '—'}
        </Space>
      ),
    },
    {
      title: t('users.colCreatedAt'),
      dataIndex: 'createdAt',
      width: 130,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: t('users.colActions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title={t('users.deleteConfirmTitle')}
            description={t('users.deleteConfirmDesc', { email: record.email })}
            onConfirm={() => handleDelete(record.id)}
            okText={t('users.deleteOk')}
            cancelText={t('users.deleteCancel')}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <PageCover
        eyebrow={t('menu.users')}
        title={t('users.title')}
        description={t('users.searchPlaceholder')}
        icon={<AppMenuIcon menuKey="users" />}
        metrics={[
          {
            label: t('common.total'),
            value: users.length.toLocaleString('vi-VN'),
            icon: <UserOutlined />,
          },
          {
            label: t('profile.emailVerified'),
            value: verifiedUsers.toLocaleString('vi-VN'),
            icon: <CheckCircleOutlined />,
          },
          {
            label: t('role.ADMIN'),
            value: adminUsers.toLocaleString('vi-VN'),
            icon: <SafetyCertificateOutlined />,
          },
        ]}
      />

      <div className="page-toolbar">
        <Space wrap>
          <Input
            placeholder={t('users.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 260 }}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          {t('users.createBtn')}
        </Button>
      </div>

      <Card>
        {loading && filteredUsers.length === 0 ? (
          <TableSkeleton rows={8} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => t('users.totalCount', { total }),
            }}
            size="middle"
            locale={{ emptyText: t('common.noData') }}
          />
        )}
      </Card>

      {/* Create User Modal */}
      <Modal
        title={t('users.createModalTitle')}
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="email"
            label={t('users.formEmail')}
            rules={[
              { required: true, message: t('users.formEmailRequired') },
              { type: 'email', message: t('users.formEmailInvalid') },
            ]}
          >
            <Input placeholder={t('users.formEmailPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('users.formPassword')}
            rules={[
              { required: true, message: t('users.formPasswordRequired') },
              { min: 6, message: t('users.formPasswordMin') },
            ]}
          >
            <Input.Password placeholder={t('users.formPasswordPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="role"
            label={t('users.formRole')}
            rules={[{ required: true, message: t('users.formRoleRequired') }]}
          >
            <Select options={roleOptions} placeholder={t('users.formRolePlaceholder')} />
          </Form.Item>
          <Form.Item name="name" label={t('users.formName')}>
            <Input placeholder={t('users.formNamePlaceholder')} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={creating}>
                {t('common.create')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        title={t('users.editRoleModalTitle', { email: editingUser?.email ?? '' })}
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateRole}>
          <Form.Item
            name="role"
            label={t('users.formNewRole')}
            rules={[{ required: true, message: t('users.formNewRoleRequired') }]}
          >
            <Select options={roleOptions} placeholder={t('users.formRolePlaceholder')} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditOpen(false)}>{t('common.cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={updating}>
                {t('common.save')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
