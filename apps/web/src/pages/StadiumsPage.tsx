import {
  BankOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AppMenuIcon, TableSkeleton } from '../components';
import { PageCover } from '../components/PageCover';
import {
  apiCreateStadium,
  apiDeleteStadium,
  apiGetStadiums,
  apiUpdateStadium,
  type CreateStadiumPayload,
  type Stadium,
} from '../services/stadiumApi';
import { apiGetTeams, type Team } from '../services/teamApi';
import {
  apiCreateManagerStadiumRequest,
  apiDeleteManagerStadiumRequest,
  apiGetManagerStadiumRequests,
  apiGetMyManagerStadiumRequests,
  apiGetTeamManagerManagedTeam,
  apiReviewManagerStadiumRequest,
  apiUpdateManagerStadiumRequest,
  type ManagerStadiumRequest,
} from '../services/teamManagerApi';

export default function StadiumsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tabFromUrl = new URLSearchParams(location.search).get('tab');
  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);
  const isManager = user?.role === 'TEAM_MANAGER';
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [managedTeam, setManagedTeam] = useState<Team | null>(null);
  const [managerStadiumRequests, setManagerStadiumRequests] = useState<ManagerStadiumRequest[]>([]);
  const [adminStadiumRequests, setAdminStadiumRequests] = useState<ManagerStadiumRequest[]>([]);
  const [editingStadiumRequest, setEditingStadiumRequest] = useState<ManagerStadiumRequest | null>(
    null,
  );
  const [reviewingRequest, setReviewingRequest] = useState<ManagerStadiumRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Stadium | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  const fetchStadiums = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetStadiums();
      setStadiums(data);
    } catch (_err) {
      message.error(t('stadiums.loadError'));
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [t]);

  const fetchTeams = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const data = await apiGetTeams();
      setTeams(data?.data || []);
    } catch (_err) {
      setTeams([]);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchStadiums();
    fetchTeams();
  }, [fetchStadiums, fetchTeams]);

  const fetchManagerStadiumState = useCallback(async () => {
    if (!isManager) return;
    try {
      const [team, requests] = await Promise.all([
        apiGetTeamManagerManagedTeam(),
        apiGetMyManagerStadiumRequests(),
      ]);
      setManagedTeam(team);
      setManagerStadiumRequests(
        requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      );
    } catch (_err) {
      setManagedTeam(null);
      setManagerStadiumRequests([]);
    }
  }, [isManager]);

  const fetchAdminStadiumRequests = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const requests = await apiGetManagerStadiumRequests();
      setAdminStadiumRequests(
        requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      );
    } catch (_err) {
      setAdminStadiumRequests([]);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchManagerStadiumState();
    fetchAdminStadiumRequests();
  }, [fetchAdminStadiumRequests, fetchManagerStadiumState]);

  const openCreate = () => {
    setEditing(null);
    setEditingStadiumRequest(null);
    form.resetFields();
    form.setFieldsValue({ country: 'Việt Nam', fifaStars: 2 });
    setModalOpen(true);
  };

  const openManagerHomeStadium = (stadium?: Stadium) => {
    const current = stadium ?? stadiums.find((item) => item.id === managedTeam?.stadiumId);
    setEditing(null);
    setEditingStadiumRequest(null);
    form.resetFields();
    form.setFieldsValue({
      name: current?.name,
      city: current?.city ?? managedTeam?.city,
      address: current?.address ?? '',
      country: current?.country ?? 'Việt Nam',
      capacity: current?.capacity,
      fifaStars: current?.fifaStars ?? 2,
    });
    setModalOpen(true);
  };

  const openEdit = (stadium: Stadium) => {
    setEditing(stadium);
    setEditingStadiumRequest(null);
    form.setFieldsValue({
      name: stadium.name,
      city: stadium.city,
      address: stadium.address ?? '',
      country: stadium.country ?? 'Việt Nam',
      capacity: stadium.capacity,
      fifaStars: stadium.fifaStars,
      teamId: teams.find((team) => team.stadiumId === stadium.id)?.id,
    });
    setModalOpen(true);
  };

  const openEditRequest = (request: ManagerStadiumRequest) => {
    if (request.status === 'APPROVED' || request.requestType === 'REMOVE_HOME_STADIUM') return;

    const payload = request.payload ?? {};
    setEditing(null);
    setEditingStadiumRequest(request);
    form.resetFields();
    form.setFieldsValue({
      name: payload.name ?? request.stadium?.name,
      city: payload.city ?? request.stadium?.city ?? request.team?.city,
      address: payload.address ?? request.stadium?.address ?? '',
      country: payload.country ?? request.stadium?.country ?? 'Việt Nam',
      capacity: payload.capacity ?? request.stadium?.capacity ?? undefined,
      fifaStars: payload.fifaStars ?? request.stadium?.fifaStars ?? 2,
      requestNote: request.requestNote ?? undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload: CreateStadiumPayload = {
        name: values.name,
        city: values.city,
        address: values.address || undefined,
        country: values.country?.trim() || undefined,
        capacity: values.capacity || undefined,
        fifaStars: values.fifaStars ?? undefined,
        teamId: !isManager ? values.teamId || undefined : undefined,
      };

      if (isManager && editingStadiumRequest) {
        await apiUpdateManagerStadiumRequest(editingStadiumRequest.id, {
          requestType: editingStadiumRequest.requestType,
          stadiumId: editingStadiumRequest.stadiumId ?? managedTeam?.stadiumId ?? undefined,
          ...payload,
          requestNote: values.requestNote || undefined,
        });
        message.success('Đã cập nhật và gửi lại yêu cầu sân nhà đến Admin');
        fetchManagerStadiumState();
      } else if (isManager) {
        await apiCreateManagerStadiumRequest({
          requestType: managedTeam?.stadiumId ? 'UPDATE_HOME_STADIUM' : 'CREATE_HOME_STADIUM',
          stadiumId: managedTeam?.stadiumId ?? undefined,
          ...payload,
          requestNote: values.requestNote || undefined,
        });
        message.success('Đã gửi yêu cầu sân nhà đến Admin');
        fetchManagerStadiumState();
      } else if (editing) {
        await apiUpdateStadium(editing.id, payload);
        message.success(t('stadiums.updateSuccess'));
      } else {
        await apiCreateStadium(payload);
        message.success(t('stadiums.createSuccess'));
      }

      setModalOpen(false);
      setEditingStadiumRequest(null);
      fetchStadiums();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(t('stadiums.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteStadium(id);
      message.success(t('stadiums.deleteSuccess'));
      fetchStadiums();
    } catch (_err) {
      message.error(t('stadiums.deleteError'));
    }
  };

  const handleDeleteStadiumRequest = async (request: ManagerStadiumRequest) => {
    try {
      await apiDeleteManagerStadiumRequest(request.id);
      message.success('Đã xóa yêu cầu sân nhà');
      fetchManagerStadiumState();
    } catch (_err) {
      message.error('Không thể xóa yêu cầu sân nhà');
    }
  };

  const handleManagerDeleteHomeStadium = async (stadium: Stadium) => {
    try {
      await apiCreateManagerStadiumRequest({
        requestType: 'REMOVE_HOME_STADIUM',
        stadiumId: stadium.id,
      });
      message.success('Đã gửi yêu cầu xóa sân nhà đến Admin');
      fetchManagerStadiumState();
    } catch (_err) {
      message.error('Không thể gửi yêu cầu xóa sân nhà');
    }
  };

  const submitReview = async (
    request: ManagerStadiumRequest,
    status: 'APPROVED' | 'REJECTED',
    adminNote?: string,
  ) => {
    setReviewing(true);
    try {
      await apiReviewManagerStadiumRequest(request.id, {
        status,
        adminNote: adminNote || undefined,
      });
      message.success(
        status === 'APPROVED' ? 'Đã duyệt yêu cầu sân nhà' : 'Đã từ chối yêu cầu sân nhà',
      );
      setReviewingRequest(null);
      setReviewNote('');
      fetchAdminStadiumRequests();
      fetchStadiums();
    } catch (_err) {
      message.error('Không thể xét duyệt yêu cầu sân nhà');
    } finally {
      setReviewing(false);
    }
  };

  const filtered = stadiums.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      (s.country ?? '').toLowerCase().includes(search.toLowerCase()),
  );
  const capacities = stadiums
    .map((stadium) => stadium.capacity)
    .filter((capacity): capacity is number => typeof capacity === 'number' && capacity > 0);
  const maxCapacity = capacities.length > 0 ? Math.max(...capacities) : null;
  const minCapacity = capacities.length > 0 ? Math.min(...capacities) : null;
  const cityCount = new Set(stadiums.map((stadium) => stadium.city).filter(Boolean)).size;
  const homeStadium = stadiums.find((stadium) => stadium.id === managedTeam?.stadiumId);
  const hasPendingStadiumRequest = managerStadiumRequests.some(
    (request) => request.status === 'PENDING',
  );
  const handleReload = useCallback(() => {
    fetchStadiums();
    if (isManager) fetchManagerStadiumState();
    if (isAdmin) fetchAdminStadiumRequests();
  }, [fetchStadiums, fetchManagerStadiumState, fetchAdminStadiumRequests, isManager, isAdmin]);

  const hero = (
    <PageCover
      eyebrow={t('menu.stadiums')}
      title={t('stadiums.title')}
      description={t('stadiums.searchPlaceholder')}
      icon={<AppMenuIcon menuKey="stadiums" />}
      metrics={[
        {
          label: t('menu.stadiums'),
          value: stadiums.length.toLocaleString('vi-VN'),
          icon: <BankOutlined />,
        },
        {
          label: t('stadiums.maxCapacity'),
          value: maxCapacity != null ? maxCapacity.toLocaleString('vi-VN') : '—',
          icon: <TeamOutlined />,
        },
        {
          label: t('stadiums.minCapacity'),
          value: minCapacity != null ? minCapacity.toLocaleString('vi-VN') : '—',
          icon: <TeamOutlined />,
        },
        {
          label: t('stadiums.colCity'),
          value: cityCount.toLocaleString('vi-VN'),
          icon: <EnvironmentOutlined />,
        },
      ]}
    />
  );
  const toolbar = (
    <div className="page-toolbar">
      <Space wrap>
        <Input
          placeholder={t('stadiums.searchPlaceholder')}
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        <Button icon={<ReloadOutlined />} onClick={handleReload}>
          Tải lại
        </Button>
      </Space>
      {isAdmin && (
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('stadiums.addBtn')}
        </Button>
      )}
      {isManager && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openManagerHomeStadium()}
          disabled={!managedTeam || hasPendingStadiumRequest}
        >
          {managedTeam?.stadiumId ? 'Chỉnh sửa sân nhà' : 'Thêm sân nhà'}
        </Button>
      )}
    </div>
  );

  const getColumns = (fromTab?: string): ColumnsType<Stadium> => [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, i) => i + 1,
    },
    {
      title: t('stadiums.colName'),
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: Stadium) => (
        <a
          onClick={() => navigate(`/stadiums/${record.id}`, { state: { fromTab } })}
          style={{ fontWeight: 600 }}
        >
          {name}
        </a>
      ),
    },
    {
      title: t('stadiums.colCity'),
      dataIndex: 'city',
      width: 150,
      sorter: (a, b) => a.city.localeCompare(b.city),
    },
    {
      title: t('stadiums.colCountry'),
      dataIndex: 'country',
      width: 130,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: t('stadiums.colAddress'),
      dataIndex: 'address',
      ellipsis: true,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: t('stadiums.colCapacity'),
      dataIndex: 'capacity',
      width: 120,
      align: 'right',
      sorter: (a, b) => (a.capacity ?? 0) - (b.capacity ?? 0),
      render: (v: number | null) => (v ? v.toLocaleString('vi-VN') : '—'),
    },
    {
      title: t('stadiums.colFifaStars'),
      dataIndex: 'fifaStars',
      width: 120,
      align: 'center',
      sorter: (a, b) => (a.fifaStars ?? 0) - (b.fifaStars ?? 0),
      render: (v: number | null) => (v != null ? `${v}/5` : '—'),
    },
    ...(isAdmin
      ? [
          {
            title: t('stadiums.colActions'),
            key: 'actions',
            width: 120,
            render: (_: unknown, record: Stadium) => (
              <Space>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  aria-label={t('stadiums.editAction')}
                  onClick={() => openEdit(record)}
                />
                <Popconfirm
                  title={t('stadiums.deleteConfirmTitle')}
                  description={t('stadiums.deleteConfirmDesc', { name: record.name })}
                  onConfirm={() => handleDelete(record.id)}
                  okText={t('stadiums.deleteOk')}
                  cancelText={t('stadiums.deleteCancel')}
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={t('stadiums.deleteAction')}
                  />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  const getManagerHomeColumns = (fromTab?: string): ColumnsType<Stadium> => [
    ...getColumns(fromTab),
    {
      title: t('stadiums.colActions'),
      key: 'managerActions',
      width: 120,
      render: (_: unknown, record: Stadium) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label={t('stadiums.editAction')}
            disabled={hasPendingStadiumRequest}
            onClick={() => openManagerHomeStadium(record)}
          />
          <Popconfirm
            title="Gửi yêu cầu xóa sân nhà?"
            description={`Yêu cầu xóa "${record.name}" sẽ được gửi Admin để duyệt.`}
            disabled={hasPendingStadiumRequest}
            onConfirm={() => handleManagerDeleteHomeStadium(record)}
            okText="Gửi"
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={t('stadiums.deleteAction')}
              disabled={hasPendingStadiumRequest}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderStadiumTable = (data: Stadium[], options?: { managerActions?: boolean }) => {
    const fromTab = options?.managerActions ? 'mine' : 'all';
    return (
      <Table
        columns={options?.managerActions ? getManagerHomeColumns(fromTab) : getColumns(fromTab)}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 15,
          pageSizeOptions: [10, 15, 20, 50],
          showSizeChanger: true,
          showTotal: (total) => t('stadiums.totalCount', { total }),
          hideOnSinglePage: false,
        }}
        size="middle"
        onRow={(record) => ({
          onClick: (e) => {
            if (
              (e.target as HTMLElement).closest('button') ||
              (e.target as HTMLElement).closest('a')
            ) {
              return;
            }
            navigate(`/stadiums/${record.id}`, { state: { fromTab } });
          },
          style: { cursor: 'pointer' },
        })}
      />
    );
  };

  const stadiumRequestTypeText = (type: ManagerStadiumRequest['requestType']) =>
    type === 'CREATE_HOME_STADIUM'
      ? 'Tạo sân nhà'
      : type === 'UPDATE_HOME_STADIUM'
        ? 'Chỉnh sửa sân nhà'
        : 'Xóa sân nhà';

  const getReviewActionTitle = (
    request: ManagerStadiumRequest,
    status: 'APPROVED' | 'REJECTED',
  ) => {
    const action = status === 'APPROVED' ? 'Duyệt' : 'Từ chối';
    const requestLabel = stadiumRequestTypeText(request.requestType).toLowerCase();
    return `${action} ${requestLabel}`;
  };

  const renderReviewConfirmContent = (request: ManagerStadiumRequest) => (
    <div className="team-review-popconfirm-content">
      <Input.TextArea
        rows={3}
        placeholder="Nhập phản hồi gửi Manager"
        value={reviewingRequest?.id === request.id ? reviewNote : ''}
        onChange={(event) => setReviewNote(event.target.value)}
      />
    </div>
  );

  const renderReviewPopconfirm = (
    request: ManagerStadiumRequest,
    status: 'APPROVED' | 'REJECTED',
    button: ReactElement,
  ) => (
    <Popconfirm
      title={getReviewActionTitle(request, status)}
      description={renderReviewConfirmContent(request)}
      icon={null}
      okText="Gửi"
      cancelText={t('common.cancel')}
      okButtonProps={{ danger: status === 'REJECTED', loading: reviewing }}
      onOpenChange={(open) => {
        if (open) {
          setReviewingRequest(request);
          setReviewNote(request.adminNote ?? '');
          return;
        }
        if (!reviewing) {
          setReviewingRequest(null);
          setReviewNote('');
        }
      }}
      onConfirm={() => submitReview(request, status, reviewNote)}
      disabled={request.status !== 'PENDING'}
      overlayClassName="team-review-popconfirm"
    >
      {button}
    </Popconfirm>
  );

  const requestColumns: ColumnsType<ManagerStadiumRequest> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, i) => i + 1,
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'requestType',
      width: 150,
      render: (type: ManagerStadiumRequest['requestType']) => stadiumRequestTypeText(type),
    },
    {
      title: 'Tên sân vận động',
      key: 'name',
      render: (_, record) => {
        const name = record.payload?.name || record.stadium?.name || '—';
        return (
          <a
            onClick={() =>
              navigate(`/stadiums/${record.stadiumId || `request-${record.id}`}`, {
                state: { request: record },
              })
            }
            style={{ fontWeight: 600 }}
          >
            {name}
          </a>
        );
      },
    },
    {
      title: 'Người yêu cầu',
      key: 'manager',
      render: (_, record) => {
        const m = record.manager;
        if (!m) return '—';
        return m.name ? `${m.name} (${m.email})` : m.email;
      },
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
      render: (status: ManagerStadiumRequest['status']) => (
        <Tag color={status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'gold'}>
          {status === 'APPROVED' ? 'Đã duyệt' : status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
        </Tag>
      ),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      width: 130,
      render: (value: string) => dayjs(value).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    ...(isAdmin
      ? [
          {
            title: t('stadiums.colActions'),
            key: 'actions',
            width: 100,
            render: (_: unknown, record: ManagerStadiumRequest) => (
              <Space>
                {renderReviewPopconfirm(
                  record,
                  'APPROVED',
                  <Button
                    type="text"
                    style={record.status === 'REJECTED' ? undefined : { color: '#52c41a' }}
                    icon={<CheckOutlined />}
                    loading={
                      reviewing && reviewingRequest?.id === record.id && record.status === 'PENDING'
                    }
                    disabled={record.status !== 'PENDING'}
                    onClick={(e) => e.stopPropagation()}
                  />,
                )}
                {renderReviewPopconfirm(
                  record,
                  'REJECTED',
                  <Button
                    danger
                    type="text"
                    className={
                      record.status === 'REJECTED' ? 'review-reject-button-active' : undefined
                    }
                    icon={<CloseOutlined />}
                    disabled={record.status !== 'PENDING'}
                    onClick={(e) => e.stopPropagation()}
                  />,
                )}
              </Space>
            ),
          },
        ]
      : isManager
        ? [
            {
              title: t('stadiums.colActions'),
              key: 'actions',
              width: 120,
              render: (_: unknown, record: ManagerStadiumRequest) => (
                <Space>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    disabled={
                      record.status === 'APPROVED' || record.requestType === 'REMOVE_HOME_STADIUM'
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditRequest(record);
                    }}
                  />
                  <Popconfirm
                    title="Xóa yêu cầu sân nhà?"
                    description="Yêu cầu này sẽ bị xóa khỏi danh sách của bạn."
                    onConfirm={() => handleDeleteStadiumRequest(record)}
                    okText="Xóa"
                    cancelText={t('common.cancel')}
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                </Space>
              ),
            },
          ]
        : []),
  ];

  const renderRequestsTable = (requests: ManagerStadiumRequest[]) => (
    <Table
      columns={requestColumns}
      dataSource={requests}
      rowKey="id"
      pagination={{
        defaultPageSize: 15,
        pageSizeOptions: [10, 15, 20, 50],
        showSizeChanger: true,
        showTotal: (total) => t('stadiums.totalCount', { total }),
        hideOnSinglePage: false,
      }}
      size="middle"
      locale={{ emptyText: t('common.noData') }}
      onRow={(record) => ({
        onClick: (e) => {
          if (
            (e.target as HTMLElement).closest('button') ||
            (e.target as HTMLElement).closest('a')
          ) {
            return;
          }
          navigate(`/stadiums/${record.stadiumId || `request-${record.id}`}`, {
            state: { request: record },
          });
        },
        style: { cursor: 'pointer' },
      })}
    />
  );

  if (initialLoad) {
    return (
      <div className="page-stack">
        {hero}
        {toolbar}
        <Card>
          <TableSkeleton rows={8} />
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="page-stack">
        {hero}
        {toolbar}
        <Card>
          {isAdmin ? (
            <Tabs
              defaultActiveKey={location.state?.tab || tabFromUrl || 'list'}
              items={[
                {
                  key: 'list',
                  label: 'Danh sách sân vận động',
                  children: renderStadiumTable(filtered),
                },
                {
                  key: 'review',
                  label: 'Duyệt sân vận động',
                  children: renderRequestsTable(adminStadiumRequests),
                },
              ]}
            />
          ) : isManager ? (
            <Tabs
              defaultActiveKey={location.state?.tab || tabFromUrl || 'all'}
              items={[
                {
                  key: 'all',
                  label: 'Danh sách sân vận động',
                  children: renderStadiumTable(filtered),
                },
                {
                  key: 'mine',
                  label: 'Sân vận động của tôi',
                  children: renderStadiumTable(homeStadium ? [homeStadium] : [], {
                    managerActions: true,
                  }),
                },
                {
                  key: 'requests',
                  label: 'Yêu cầu sân vận động',
                  children: renderRequestsTable(managerStadiumRequests),
                },
              ]}
            />
          ) : (
            renderStadiumTable(filtered, { managerActions: false })
          )}
        </Card>
      </div>

      <Modal
        title={
          isManager
            ? editingStadiumRequest
              ? 'Cập nhật yêu cầu sân nhà'
              : managedTeam?.stadiumId
                ? 'Đề xuất chỉnh sửa sân nhà'
                : 'Đề xuất thêm sân nhà'
            : editing
              ? t('stadiums.modalEditTitle')
              : t('stadiums.modalCreateTitle')
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingStadiumRequest(null);
        }}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingStadiumRequest ? 'Gửi lại' : editing ? t('common.save') : t('common.create')}
        cancelText={t('common.cancel')}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label={t('stadiums.formName')}
            rules={[{ required: true, message: t('stadiums.formNameRequired') }]}
          >
            <Input placeholder={t('stadiums.formNamePlaceholder')} />
          </Form.Item>

          {isAdmin && (
            <Form.Item name="teamId" label={t('stadiums.formTeam')}>
              <Select
                placeholder={t('stadiums.formTeamPlaceholder')}
                allowClear
                showSearch
                optionFilterProp="label"
                options={teams.map((team) => ({
                  value: team.id,
                  label: `${team.name}${team.city ? ` (${team.city})` : ''}`,
                }))}
              />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label={t('stadiums.formCity')}
                rules={[{ required: true, message: t('stadiums.formCityRequired') }]}
              >
                <Input placeholder={t('stadiums.formCityPlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="country" label={t('stadiums.formCountry')}>
                <Input placeholder={t('stadiums.formCountryPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="capacity" label={t('stadiums.formCapacity')}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('stadiums.formCapacityPlaceholder')}
                  min={0}
                  formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fifaStars" label={t('stadiums.formFifaStars')}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('stadiums.formFifaStarsPlaceholder')}
                  min={2}
                  max={5}
                  precision={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label={t('stadiums.formAddress')}>
            <Input placeholder={t('stadiums.formAddressPlaceholder')} />
          </Form.Item>

          {isManager && (
            <Form.Item name="requestNote" label="Ghi chú gửi Admin">
              <Input.TextArea rows={3} placeholder="Nhập lý do hoặc thông tin bổ sung..." />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}
