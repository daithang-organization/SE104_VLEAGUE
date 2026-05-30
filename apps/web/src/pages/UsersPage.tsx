import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
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
  apiGetTeamManagerRequests,
  apiReviewTeamManagerRequest,
  type TeamManagerRequest,
  type TeamManagerRequestStatus,
} from '../services/teamManagerApi';
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

function requestStatusTag(status: TeamManagerRequestStatus) {
  if (status === 'APPROVED') return <Tag color="success">Đã duyệt</Tag>;
  if (status === 'REJECTED') return <Tag color="error">Từ chối</Tag>;
  return <Tag color="processing">Chờ duyệt</Tag>;
}

function requestTypeLabel(request: TeamManagerRequest) {
  return request.requestType === 'CREATE_TEAM' ? 'Tạo CLB mới' : 'Nhận quản lý CLB có sẵn';
}

function requestTeamName(request: TeamManagerRequest) {
  return request.team?.name ?? request.proposedTeamName ?? '—';
}

export default function UsersPage() {
  const { t } = useTranslation();
  const roleOptions = useMemo(
    () => ROLE_KEYS.map((k) => ({ value: k, label: t(`role.${k}`) })),
    [t],
  );
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [requests, setRequests] = useState<TeamManagerRequest[]>([]);
  const [requestStatus, setRequestStatus] = useState<TeamManagerRequestStatus | undefined>(
    'PENDING',
  );
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TeamManagerRequest | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [reviewForm] = Form.useForm<{ adminNote?: string }>();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [creating, setCreating] = useState(false);

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

  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const data = await apiGetTeamManagerRequests(requestStatus);
      setRequests(data);
    } catch (_err) {
      message.error('Không thể tải yêu cầu quản lý CLB');
    } finally {
      setRequestsLoading(false);
    }
  }, [requestStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCreate = async (values: CreateUserPayload) => {
    setCreating(true);
    try {
      await apiCreateUser({ ...values, managedTeamId: undefined });
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

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteUser(id);
      message.success(t('users.deleteSuccess'));
      fetchUsers();
    } catch (_err) {
      message.error(t('users.deleteError'));
    }
  };

  const openReviewModal = (request: TeamManagerRequest) => {
    setSelectedRequest(request);
    reviewForm.setFieldsValue({ adminNote: request.adminNote ?? '' });
    setReviewOpen(true);
  };

  const handleReviewRequest = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return;
    const values = reviewForm.getFieldsValue();

    setReviewing(true);
    try {
      await apiReviewTeamManagerRequest(selectedRequest.id, {
        status,
        adminNote: values.adminNote?.trim() || undefined,
      });
      message.success(status === 'APPROVED' ? 'Đã duyệt yêu cầu' : 'Đã từ chối yêu cầu');
      setReviewOpen(false);
      setSelectedRequest(null);
      fetchRequests();
      fetchUsers();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể xét duyệt yêu cầu';
      message.error(msg);
    } finally {
      setReviewing(false);
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
      render: (value: string | null) => value || '—',
    },
    {
      title: t('users.colRole'),
      dataIndex: 'role',
      width: 150,
      filters: roleOptions.map((role) => ({ text: role.label, value: role.value })),
      onFilter: (value, record) => record.role === value,
      render: (role: string) => (
        <Tag color={ROLE_COLORS[role] || 'default'}>{t(`role.${role}`)}</Tag>
      ),
    },
    {
      title: t('users.colManagedTeam'),
      key: 'managedTeam',
      width: 190,
      render: (_, record) =>
        record.role === 'TEAM_MANAGER' ? (
          record.managedTeam ? (
            <Space size={6}>
              <TeamOutlined />
              <span>{record.managedTeam.name}</span>
            </Space>
          ) : (
            <Tag color="warning">{t('users.managedTeamMissing')}</Tag>
          )
        ) : (
          '—'
        ),
    },
    {
      title: t('users.colEmailVerified'),
      dataIndex: 'emailVerified',
      width: 130,
      align: 'center',
      render: (value: boolean) =>
        value ? <Tag color="success">✓</Tag> : <Tag color="error">✗</Tag>,
    },
    {
      title: t('users.colOAuth'),
      key: 'oauth',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          {record.googleId && <Tag color="red">Google</Tag>}
          {record.facebookId && <Tag color="blue">FB</Tag>}
          {!record.googleId && !record.facebookId && '—'}
        </Space>
      ),
    },
    {
      title: t('users.colCreatedAt'),
      dataIndex: 'createdAt',
      width: 130,
      render: (value: string) => dayjs(value).format('DD/MM/YYYY'),
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

  const requestColumns: ColumnsType<TeamManagerRequest> = [
    {
      title: 'Manager',
      key: 'manager',
      render: (_, record) => record.manager?.email ?? '—',
    },
    {
      title: 'Loại yêu cầu',
      key: 'requestType',
      render: (_, record) => requestTypeLabel(record),
    },
    {
      title: 'CLB',
      key: 'team',
      render: (_, record) => requestTeamName(record),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (status: TeamManagerRequestStatus) => requestStatusTag(status),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      width: 130,
      render: (value: string) => dayjs(value).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => openReviewModal(record)}>
          Chi tiết
        </Button>
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
        <Tabs
          items={[
            {
              key: 'users',
              label: 'Người dùng',
              children:
                loading && filteredUsers.length === 0 ? (
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
                ),
            },
            {
              key: 'requests',
              label: 'Yêu cầu quản lý CLB',
              children: (
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Space wrap>
                    <Select
                      value={requestStatus ?? 'ALL'}
                      onChange={(value) =>
                        setRequestStatus(
                          value === 'ALL' ? undefined : (value as TeamManagerRequestStatus),
                        )
                      }
                      style={{ width: 180 }}
                      options={[
                        { value: 'PENDING', label: 'Chờ duyệt' },
                        { value: 'APPROVED', label: 'Đã duyệt' },
                        { value: 'REJECTED', label: 'Từ chối' },
                        { value: 'ALL', label: 'Tất cả' },
                      ]}
                    />
                    <Button icon={<ReloadOutlined />} onClick={fetchRequests}>
                      Tải lại
                    </Button>
                  </Space>
                  <Table
                    columns={requestColumns}
                    dataSource={requests}
                    rowKey="id"
                    loading={requestsLoading}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    size="middle"
                    locale={{ emptyText: t('common.noData') }}
                  />
                </Space>
              ),
            },
          ]}
        />
      </Card>

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

      <Modal
        title="Chi tiết yêu cầu quản lý CLB"
        open={reviewOpen}
        onCancel={() => setReviewOpen(false)}
        width={720}
        footer={
          <Space>
            <Button onClick={() => setReviewOpen(false)}>{t('common.cancel')}</Button>
            {selectedRequest?.status === 'PENDING' && (
              <>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  loading={reviewing}
                  onClick={() => handleReviewRequest('REJECTED')}
                >
                  Từ chối
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={reviewing}
                  onClick={() => handleReviewRequest('APPROVED')}
                >
                  Duyệt
                </Button>
              </>
            )}
          </Space>
        }
      >
        {selectedRequest && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Manager">
                {selectedRequest.manager?.email ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Loại yêu cầu">
                {requestTypeLabel(selectedRequest)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {requestStatusTag(selectedRequest.status)}
              </Descriptions.Item>
              <Descriptions.Item label="CLB">{requestTeamName(selectedRequest)}</Descriptions.Item>
              <Descriptions.Item label="Tên viết tắt đề xuất">
                {selectedRequest.proposedTeamShortName ?? selectedRequest.team?.shortName ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Thành phố">
                {selectedRequest.proposedTeamCity ?? selectedRequest.team?.city ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú Manager">
                {selectedRequest.requestNote || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày gửi">
                {dayjs(selectedRequest.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>
            <Form form={reviewForm} layout="vertical">
              <Form.Item name="adminNote" label="Ghi chú xét duyệt">
                <Input.TextArea rows={3} placeholder="Nhập lý do duyệt/từ chối nếu cần" />
              </Form.Item>
            </Form>
          </Space>
        )}
      </Modal>
    </div>
  );
}
