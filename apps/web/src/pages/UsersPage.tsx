import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  TeamOutlined,
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
  Tabs,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppMenuIcon } from '../components';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { PageCover } from '../components/PageCover';
import {
  apiGetManagerPlayerRequests,
  apiGetManagerStadiumRequests,
  apiGetTeamManagerRequests,
  apiReviewManagerPlayerRequest,
  apiReviewManagerStadiumRequest,
  apiReviewTeamManagerRequest,
  type ManagerPlayerRequest,
  type ManagerRequestStatus,
  type ManagerStadiumRequest,
  type TeamManagerRequest,
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
type AggregateRequestEntity = 'team' | 'player' | 'stadium';
type AggregateManagerRequest = {
  id: string;
  key: string;
  managerName: string;
  requestLabel: string;
  requestDetail: string;
  requestTypeLabel: 'Thêm' | 'Chỉnh sửa' | 'Xóa';
  status: ManagerRequestStatus;
  createdAt: string;
  targetTab: string;
  entity: AggregateRequestEntity;
};

function requestStatusTag(status: ManagerRequestStatus) {
  if (status === 'APPROVED') return <Tag color="success">Đã duyệt</Tag>;
  if (status === 'REJECTED') return <Tag color="error">Từ chối</Tag>;
  return <Tag color="gold">Chờ duyệt</Tag>;
}

function managerDisplayName(manager?: TeamManagerRequest['manager']) {
  return manager?.name || '—';
}

function teamRequestTypeLabel(
  requestType: TeamManagerRequest['requestType'],
): AggregateManagerRequest['requestTypeLabel'] {
  if (requestType === 'UPDATE_MANAGED_TEAM') return 'Chỉnh sửa';
  if (requestType === 'DELETE_MANAGED_TEAM') return 'Xóa';
  return 'Thêm';
}

function playerRequestTypeLabel(
  requestType: ManagerPlayerRequest['requestType'],
): AggregateManagerRequest['requestTypeLabel'] {
  if (requestType === 'UPDATE_PLAYER') return 'Chỉnh sửa';
  if (requestType === 'REMOVE_FROM_TEAM') return 'Xóa';
  return 'Thêm';
}

function stadiumRequestTypeLabel(
  requestType: ManagerStadiumRequest['requestType'],
): AggregateManagerRequest['requestTypeLabel'] {
  if (requestType === 'UPDATE_HOME_STADIUM') return 'Chỉnh sửa';
  if (requestType === 'REMOVE_HOME_STADIUM') return 'Xóa';
  return 'Thêm';
}

function toAggregateRequests(
  teamRequests: TeamManagerRequest[],
  playerRequests: ManagerPlayerRequest[],
  stadiumRequests: ManagerStadiumRequest[],
): AggregateManagerRequest[] {
  return [
    ...teamRequests.map((request) => ({
      id: request.id,
      key: `team-${request.id}`,
      managerName: managerDisplayName(request.manager),
      requestLabel: 'Đội bóng',
      requestDetail: request.team?.name ?? request.proposedTeamName ?? '—',
      requestTypeLabel: teamRequestTypeLabel(request.requestType),
      status: request.status,
      createdAt: request.createdAt,
      targetTab: '/teams',
      entity: 'team' as const,
    })),
    ...playerRequests.map((request) => ({
      id: request.id,
      key: `player-${request.id}`,
      managerName: managerDisplayName(request.manager),
      requestLabel: 'Cầu thủ',
      requestDetail: request.player?.fullName ?? request.payload?.fullName ?? '—',
      requestTypeLabel: playerRequestTypeLabel(request.requestType),
      status: request.status,
      createdAt: request.createdAt,
      targetTab: '/players',
      entity: 'player' as const,
    })),
    ...stadiumRequests.map((request) => ({
      id: request.id,
      key: `stadium-${request.id}`,
      managerName: managerDisplayName(request.manager),
      requestLabel: 'Sân vận động',
      requestDetail: request.stadium?.name ?? request.payload?.name ?? '—',
      requestTypeLabel: stadiumRequestTypeLabel(request.requestType),
      status: request.status,
      createdAt: request.createdAt,
      targetTab: '/stadiums',
      entity: 'stadium' as const,
    })),
  ].sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
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

  const [requests, setRequests] = useState<AggregateManagerRequest[]>([]);
  const [activeTab, setActiveTab] = useState('users');
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState<{
    key: string;
    status: Extract<ManagerRequestStatus, 'APPROVED' | 'REJECTED'>;
  } | null>(null);

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
  }, [t]);

  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const [teamRequests, playerRequests, stadiumRequests] = await Promise.all([
        apiGetTeamManagerRequests(),
        apiGetManagerPlayerRequests(),
        apiGetManagerStadiumRequests(),
      ]);
      setRequests(toAggregateRequests(teamRequests, playerRequests, stadiumRequests));
    } catch (_err) {
      message.error('Không thể tải yêu cầu từ Manager');
    } finally {
      setRequestsLoading(false);
    }
  }, []);

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

  const goToRequestReview = (record: AggregateManagerRequest) => {
    window.location.href = `${record.targetTab}?tab=review`;
  };

  const handleReviewRequest = async (
    record: AggregateManagerRequest,
    status: Extract<ManagerRequestStatus, 'APPROVED' | 'REJECTED'>,
  ) => {
    setReviewingRequest({ key: record.key, status });
    try {
      if (record.entity === 'team') {
        await apiReviewTeamManagerRequest(record.id, { status });
      } else if (record.entity === 'player') {
        await apiReviewManagerPlayerRequest(record.id, { status });
      } else {
        await apiReviewManagerStadiumRequest(record.id, { status });
      }

      message.success(status === 'APPROVED' ? 'Đã duyệt yêu cầu' : 'Đã từ chối yêu cầu');
      setRequests((currentRequests) =>
        currentRequests.map((item) => (item.key === record.key ? { ...item, status } : item)),
      );
      await fetchUsers();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể xét duyệt yêu cầu';
      message.error(msg);
    } finally {
      setReviewingRequest(null);
    }
  };

  const requestColumns: ColumnsType<AggregateManagerRequest> = [
    {
      title: 'Quản lý',
      key: 'manager',
      render: (_, record) => record.managerName,
    },
    {
      title: 'Yêu cầu',
      key: 'request',
      render: (_, record) => (
        <Button type="link" className="table-link-button" onClick={() => goToRequestReview(record)}>
          {record.requestLabel}
          {record.requestDetail !== '—' ? `: ${record.requestDetail}` : ''}
        </Button>
      ),
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'requestTypeLabel',
      width: 150,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      filters: [
        { text: 'Chờ duyệt', value: 'PENDING' },
        { text: 'Đã duyệt', value: 'APPROVED' },
        { text: 'Từ chối', value: 'REJECTED' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: ManagerRequestStatus) => requestStatusTag(status),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      width: 130,
      render: (value: string) => dayjs(value).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            aria-label="Duyệt yêu cầu"
            type="text"
            style={record.status === 'REJECTED' ? {} : { color: '#52c41a' }}
            icon={<CheckOutlined />}
            disabled={record.status !== 'PENDING'}
            loading={reviewingRequest?.key === record.key && reviewingRequest.status === 'APPROVED'}
            onClick={(e) => {
              e.stopPropagation();
              handleReviewRequest(record, 'APPROVED');
            }}
          />
          <Button
            aria-label="Từ chối yêu cầu"
            danger
            type="text"
            className={record.status === 'REJECTED' ? 'review-reject-button-active' : undefined}
            style={record.status === 'REJECTED' ? { color: '#ff4d4f' } : undefined}
            icon={<CloseOutlined />}
            disabled={record.status !== 'PENDING'}
            loading={reviewingRequest?.key === record.key && reviewingRequest.status === 'REJECTED'}
            onClick={(e) => {
              e.stopPropagation();
              handleReviewRequest(record, 'REJECTED');
            }}
          />
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
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              if (activeTab === 'users') fetchUsers();
              else fetchRequests();
            }}
          >
            Tải lại
          </Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          {t('users.createBtn')}
        </Button>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
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
              label: 'Yêu cầu quản lý',
              children: (
                <Table
                  columns={requestColumns}
                  dataSource={requests}
                  rowKey="id"
                  loading={requestsLoading}
                  pagination={{ pageSize: 10, showSizeChanger: true }}
                  size="middle"
                  locale={{ emptyText: t('common.noData') }}
                />
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
    </div>
  );
}
