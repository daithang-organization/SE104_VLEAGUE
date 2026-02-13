import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
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
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import {
  apiCreateUser,
  apiDeleteUser,
  apiGetUsers,
  apiUpdateUserRole,
  type CreateUserPayload,
  type User,
} from '../services/userApi';

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  ADMIN: { label: 'Admin', color: 'red' },
  TEAM_MANAGER: { label: 'Quản lý đội', color: 'blue' },
  REFEREE: { label: 'Trọng tài', color: 'green' },
  SUPERVISOR: { label: 'Giám sát', color: 'orange' },
  PUBLIC: { label: 'Công khai', color: 'default' },
};

const ROLE_OPTIONS = Object.entries(ROLE_CONFIG).map(([value, { label }]) => ({
  value,
  label,
}));

export default function UsersPage() {
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
    } catch {
      message.error('Không thể tải danh sách người dùng');
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
      message.success('Tạo người dùng thành công');
      setCreateOpen(false);
      createForm.resetFields();
      fetchUsers();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Tạo người dùng thất bại';
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
      message.success('Cập nhật vai trò thành công');
      setEditOpen(false);
      fetchUsers();
    } catch {
      message.error('Cập nhật vai trò thất bại');
    } finally {
      setUpdating(false);
    }
  };

  // ─── Delete ─────────────────
  const handleDelete = async (id: string) => {
    try {
      await apiDeleteUser(id);
      message.success('Xóa người dùng thành công');
      fetchUsers();
    } catch {
      message.error('Xóa người dùng thất bại');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<User> = [
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      render: (v: string | null) => v || '—',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      width: 140,
      filters: ROLE_OPTIONS.map((r) => ({ text: r.label, value: r.value })),
      onFilter: (value, record) => record.role === value,
      render: (role: string) => {
        const cfg = ROLE_CONFIG[role] || { label: role, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Email xác thực',
      dataIndex: 'emailVerified',
      width: 130,
      align: 'center',
      render: (v: boolean) => (v ? <Tag color="success">✓</Tag> : <Tag color="error">✗</Tag>),
    },
    {
      title: 'OAuth',
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
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 130,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title="Xóa người dùng?"
            description={`Bạn có chắc muốn xóa "${record.email}"?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Quản lý người dùng
          </Typography.Title>
          <Space>
            <Input
              placeholder="Tìm kiếm email, tên..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 260 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              Tạo người dùng
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng: ${t}` }}
          size="middle"
        />
      </Card>

      {/* Create User Modal */}
      <Modal
        title="Tạo người dùng mới"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="user@vleague.local" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select options={ROLE_OPTIONS} placeholder="Chọn vai trò" />
          </Form.Item>
          <Form.Item name="name" label="Tên (tùy chọn)">
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCreateOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={creating}>
                Tạo
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        title={`Đổi vai trò — ${editingUser?.email ?? ''}`}
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateRole}>
          <Form.Item
            name="role"
            label="Vai trò mới"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select options={ROLE_OPTIONS} placeholder="Chọn vai trò" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={updating}>
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
