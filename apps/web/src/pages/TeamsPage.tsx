import {
  ArrowRightOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AppMenuIcon, PageCover } from '../components';
import ImageUpload from '../components/ImageUpload';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  apiCreateTeam,
  apiDeleteTeam,
  apiGetTeams,
  apiUpdateTeam,
  type CreateTeamPayload,
  type Team,
} from '../services/teamApi';
import {
  apiCreateTeamManagerRequest,
  apiDeleteTeamManagerRequest,
  apiGetTeamManagerClaimableTeams,
  apiGetTeamManagerManagedTeam,
  apiGetTeamManagerManagementRequest,
  apiGetTeamManagerRequests,
  apiReviewTeamManagerRequest,
  apiUpdateTeamManagerRequest,
  type TeamManagerRequest,
} from '../services/teamManagerApi';
import { apiGetUsers, type User } from '../services/userApi';
import { getTeamLogoUrl, getTeamThemeStyle } from '../utils/teamLogos';

const CAN_EDIT_ROLES = ['ADMIN'];
const NO_MANAGER_VALUE = '__NO_MANAGER__';

type ManagerTeamCardItem = {
  key: string;
  team: Team;
  status: TeamManagerRequest['status'];
  canOpen: boolean;
  request?: TeamManagerRequest;
  requestType?: TeamManagerRequest['requestType'];
  adminNote?: string | null;
};

export default function TeamsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Team['status']>('ALL');
  const [form] = Form.useForm();
  const [createRequestForm] = Form.useForm();
  const [claimRequestForm] = Form.useForm();
  const [managedTeam, setManagedTeam] = useState<Team | null>(null);
  const [managerRequest, setManagerRequest] = useState<TeamManagerRequest | null>(null);
  const [claimableTeams, setClaimableTeams] = useState<Team[]>([]);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestModalTab, setRequestModalTab] = useState<'create' | 'claim'>('create');
  const [editingManagerRequest, setEditingManagerRequest] = useState<TeamManagerRequest | null>(
    null,
  );
  const [adminRequests, setAdminRequests] = useState<TeamManagerRequest[]>([]);
  const [reviewingRequest, setReviewingRequest] = useState<TeamManagerRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const canEdit = useMemo(() => {
    return user?.role && CAN_EDIT_ROLES.includes(user.role);
  }, [user]);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetTeams();
      setTeams(res?.data || []);
    } catch (_err) {
      message.error(t('teams.loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchManagerState = useCallback(async () => {
    setLoading(true);
    try {
      const [teamsData, managedTeamData, requestData, claimableTeamsData] = await Promise.all([
        apiGetTeams(),
        apiGetTeamManagerManagedTeam(),
        apiGetTeamManagerManagementRequest(),
        apiGetTeamManagerClaimableTeams(),
      ]);

      setTeams(teamsData?.data || []);
      setManagedTeam(managedTeamData);
      setManagerRequest(requestData);
      setClaimableTeams(claimableTeamsData);
    } catch (_err) {
      message.error('Không thể tải trạng thái quản lý CLB');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (user?.role !== 'ADMIN') return;
    try {
      const data = await apiGetUsers();
      setUsers(data || []);
    } catch (_err) {
      setUsers([]);
    }
  }, [user?.role]);

  const fetchAdminRequests = useCallback(async () => {
    if (user?.role !== 'ADMIN') return;
    try {
      const data = await apiGetTeamManagerRequests();
      setAdminRequests(data);
    } catch (_err) {
      setAdminRequests([]);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === 'TEAM_MANAGER') {
      fetchManagerState();
      return;
    }
    fetchAdminRequests();
    fetchUsers();
    fetchTeams();
  }, [fetchAdminRequests, fetchManagerState, fetchTeams, fetchUsers, user?.role]);

  const openCreateModal = () => {
    setEditingTeam(null);
    form.resetFields();
    form.setFieldsValue({ managerId: NO_MANAGER_VALUE, status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEditModal = (team: Team) => {
    const currentManager = users.find(
      (candidate) => candidate.role === 'TEAM_MANAGER' && candidate.managedTeamId === team.id,
    );
    setEditingTeam(team);
    form.setFieldsValue({
      name: team.name,
      shortName: team.shortName ?? '',
      city: team.city ?? '',
      logoUrl: team.logoUrl ?? '',
      managerId: currentManager?.id ?? NO_MANAGER_VALUE,
      status: team.status,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Clean up empty strings to undefined
      const payload: CreateTeamPayload = {
        name: values.name,
        shortName: values.shortName || undefined,
        city: values.city || undefined,
        logoUrl: values.logoUrl || undefined,
        status: values.status,
        managerId: values.managerId === NO_MANAGER_VALUE ? null : values.managerId || null,
      };

      if (editingTeam) {
        await apiUpdateTeam(editingTeam.id, payload);
        message.success(t('teams.updateSuccess'));
      } else {
        await apiCreateTeam(payload);
        message.success(t('teams.createSuccess'));
      }

      setModalOpen(false);
      fetchTeams();
      fetchUsers();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(t('teams.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteTeam(id);
      message.success(t('teams.deleteSuccess'));
      fetchTeams();
    } catch (_err) {
      message.error(t('teams.deleteError'));
    }
  };

  const openCreateRequestModal = () => {
    setEditingManagerRequest(null);
    createRequestForm.resetFields();
    claimRequestForm.resetFields();
    setRequestModalTab('create');
    setRequestModalOpen(true);
  };

  const openEditManagerRequestModal = (request: TeamManagerRequest) => {
    if (request.status === 'APPROVED') return;

    setEditingManagerRequest(request);
    setRequestModalTab(request.requestType === 'CREATE_TEAM' ? 'create' : 'claim');
    createRequestForm.setFieldsValue({
      name: request.proposedTeamName ?? undefined,
      shortName: request.proposedTeamShortName ?? undefined,
      city: request.proposedTeamCity ?? undefined,
      logoUrl: request.proposedTeamLogoUrl ?? undefined,
      requestNote: request.requestNote ?? undefined,
    });
    claimRequestForm.setFieldsValue({
      teamId: request.teamId ?? undefined,
      requestNote: request.requestNote ?? undefined,
    });
    setRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setRequestModalOpen(false);
    setEditingManagerRequest(null);
    createRequestForm.resetFields();
    claimRequestForm.resetFields();
  };

  const handleDeleteManagerRequest = async (request: TeamManagerRequest) => {
    try {
      await apiDeleteTeamManagerRequest(request.id);
      message.success(
        request.status === 'APPROVED' ? 'Đã xóa quyền quản lý CLB' : 'Đã xóa yêu cầu quản lý CLB',
      );
      fetchManagerState();
    } catch (_err) {
      message.error('Không thể xóa yêu cầu quản lý CLB');
    }
  };

  const submitCreateTeamRequest = async () => {
    try {
      const values = await createRequestForm.validateFields();
      setRequestSubmitting(true);
      const payload = {
        requestType: 'CREATE_TEAM',
        proposedTeamName: values.name,
        proposedTeamShortName: values.shortName || undefined,
        proposedTeamCity: values.city || undefined,
        proposedTeamLogoUrl: values.logoUrl || undefined,
        requestNote: values.requestNote || undefined,
      } as const;
      if (editingManagerRequest) {
        await apiUpdateTeamManagerRequest(editingManagerRequest.id, payload);
        message.success('Đã cập nhật yêu cầu tạo CLB');
      } else {
        await apiCreateTeamManagerRequest(payload);
        message.success('Đã gửi yêu cầu tạo CLB mới đến Admin');
      }
      closeRequestModal();
      fetchManagerState();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể gửi yêu cầu';
      message.error(msg);
    } finally {
      setRequestSubmitting(false);
    }
  };

  const submitClaimTeamRequest = async () => {
    try {
      const values = await claimRequestForm.validateFields();
      setRequestSubmitting(true);
      const payload = {
        requestType: 'CLAIM_EXISTING_TEAM',
        teamId: values.teamId,
        requestNote: values.requestNote || undefined,
      } as const;
      if (editingManagerRequest) {
        await apiUpdateTeamManagerRequest(editingManagerRequest.id, payload);
        message.success('Đã cập nhật yêu cầu nhận quản lý CLB');
      } else {
        await apiCreateTeamManagerRequest(payload);
        message.success('Đã gửi yêu cầu nhận quản lý CLB đến Admin');
      }
      closeRequestModal();
      fetchManagerState();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể gửi yêu cầu';
      message.error(msg);
    } finally {
      setRequestSubmitting(false);
    }
  };

  const submitReviewTeamRequest = async (
    request: TeamManagerRequest,
    status: 'APPROVED' | 'REJECTED',
    adminNote?: string,
  ) => {
    setReviewing(true);
    try {
      await apiReviewTeamManagerRequest(request.id, {
        status,
        adminNote: adminNote || undefined,
      });
      message.success(status === 'APPROVED' ? 'Đã duyệt yêu cầu CLB' : 'Đã từ chối yêu cầu CLB');
      setReviewingRequest(null);
      setReviewNote('');
      fetchAdminRequests();
      fetchTeams();
    } catch (_err) {
      message.error('Không thể xét duyệt yêu cầu CLB');
    } finally {
      setReviewing(false);
    }
  };

  const handleReviewTeamRequest = async (status: 'APPROVED' | 'REJECTED') => {
    if (!reviewingRequest) return;
    await submitReviewTeamRequest(reviewingRequest, status, reviewNote);
  };

  const filteredTeams = (teams || []).filter((team) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [team.name, team.shortName, team.city, team.stadium?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    const matchesStatus = statusFilter === 'ALL' || team.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTeams = teams.filter((team) => team.status === 'ACTIVE').length;
  const inactiveTeams = teams.filter((team) => team.status === 'INACTIVE').length;
  const isManager = user?.role === 'TEAM_MANAGER';
  const getRequestTeam = (request: TeamManagerRequest): Team =>
    request.requestType === 'CREATE_TEAM'
      ? {
          id: request.teamId ?? `request-${request.id}`,
          name: request.proposedTeamName ?? 'CLB đề xuất',
          shortName: request.proposedTeamShortName ?? null,
          city: request.proposedTeamCity ?? null,
          logoUrl: request.proposedTeamLogoUrl ?? null,
          status: 'ACTIVE',
          stadiumId: null,
          stadium: null,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        }
      : (request.team ?? {
          id: request.teamId ?? `request-${request.id}`,
          name: 'CLB đã chọn',
          shortName: null,
          city: null,
          logoUrl: null,
          status: 'ACTIVE',
          stadiumId: null,
          stadium: null,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        });
  const currentEditingManagerId = editingTeam
    ? users.find(
        (candidate) =>
          candidate.role === 'TEAM_MANAGER' && candidate.managedTeamId === editingTeam.id,
      )?.id
    : undefined;
  const availableManagerOptions = users
    .filter(
      (candidate) =>
        candidate.role === 'TEAM_MANAGER' &&
        (!candidate.managedTeamId || candidate.id === currentEditingManagerId),
    )
    .map((candidate) => ({
      value: candidate.id,
      label: candidate.name ? `${candidate.name} (${candidate.email})` : candidate.email,
    }));
  const claimableTeamOptions = [
    ...claimableTeams,
    ...(editingManagerRequest?.requestType === 'CLAIM_EXISTING_TEAM' &&
    editingManagerRequest.team &&
    !claimableTeams.some((team) => team.id === editingManagerRequest.teamId)
      ? [editingManagerRequest.team]
      : []),
  ].map((team) => ({
    value: team.id,
    label: `${team.name}${team.city ? ` (${team.city})` : ''}`,
  }));

  const renderTeamLogo = (team: Team) => {
    const logoUrl = getTeamLogoUrl(team);
    if (logoUrl) {
      return <img src={logoUrl} alt={`${team.name} logo`} className="club-card-logo" />;
    }

    return (
      <div className="club-card-logo club-card-logo-fallback" aria-hidden="true">
        {(team.shortName || team.name).slice(0, 2).toUpperCase()}
      </div>
    );
  };

  const managerRequestCards: ManagerTeamCardItem[] = managerRequest
    ? [
        {
          key: managerRequest.id,
          team: getRequestTeam(managerRequest),
          status: managerRequest.status,
          canOpen: Boolean(managerRequest.teamId && managerRequest.team),
          request: managerRequest,
          requestType: managerRequest.requestType,
          adminNote: managerRequest.adminNote,
        },
      ]
    : managedTeam
      ? [
          {
            key: managedTeam.id,
            team: managedTeam,
            status: 'APPROVED',
            canOpen: true,
            request: managerRequest ?? undefined,
          },
        ]
      : [];

  const requestStatusMeta: Record<TeamManagerRequest['status'], { color: string; label: string }> =
    {
      PENDING: { color: 'processing', label: 'Đang chờ duyệt' },
      APPROVED: { color: 'green', label: 'Đã được duyệt' },
      REJECTED: { color: 'red', label: 'Bị từ chối' },
    };

  const renderTeamCards = (items: Team[], emptyDescription = t('common.noData')) => {
    if (loading && items.length === 0) {
      return <TableSkeleton rows={8} />;
    }

    if (items.length === 0) {
      return (
        <div className="clubs-empty">
          <Empty description={emptyDescription} />
        </div>
      );
    }

    return (
      <div className="club-card-grid" aria-label="Danh sách đội bóng">
        {items.map((team) => (
          <article key={team.id} className="club-card" style={getTeamThemeStyle(team)}>
            <button
              type="button"
              className="club-card-main"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              <span className="club-card-crest">{renderTeamLogo(team)}</span>
              <span className="club-card-body">
                <span className="club-card-heading">
                  <span className="club-card-name">{team.name}</span>
                  {team.shortName && <span className="club-card-code-pill">{team.shortName}</span>}
                </span>
                <span className="club-card-meta">
                  <EnvironmentOutlined />
                  {team.stadium?.name ?? team.city ?? 'Chưa có sân nhà'}
                </span>
              </span>
              <ArrowRightOutlined className="club-card-arrow" />
            </button>

            <div className="club-card-footer">
              <Tag color={team.status === 'ACTIVE' ? 'green' : 'default'}>
                {team.status === 'ACTIVE' ? t('teams.filterActive') : t('teams.filterInactive')}
              </Tag>
            </div>

            <div className="club-card-actions">
              <Button
                className="club-card-detail-button"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                {t('common.detail')}
              </Button>
              {canEdit && (
                <>
                  <Button
                    aria-label={`${t('common.edit')} ${team.name}`}
                    icon={<EditOutlined />}
                    onClick={() => openEditModal(team)}
                  />
                  <Popconfirm
                    title={t('teams.deleteConfirmTitle')}
                    description={t('teams.deleteConfirmDesc', { name: team.name })}
                    onConfirm={() => handleDelete(team.id)}
                    okText={t('teams.deleteOk')}
                    cancelText={t('teams.deleteCancel')}
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      aria-label={`${t('common.delete')} ${team.name}`}
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    );
  };

  const renderManagerTeamCards = (
    items: ManagerTeamCardItem[],
    emptyDescription = 'Bạn chưa có CLB được Admin duyệt.',
  ) => {
    if (loading && items.length === 0) {
      return <TableSkeleton rows={4} />;
    }

    if (items.length === 0) {
      return (
        <div className="clubs-empty">
          <Empty description={emptyDescription} />
        </div>
      );
    }

    return (
      <div className="club-card-grid club-card-grid-fixed" aria-label="Đội bóng của tôi">
        {items.map((item) => {
          const { team } = item;
          const status = requestStatusMeta[item.status];
          const cardContent = (
            <>
              <span className="club-card-crest">{renderTeamLogo(team)}</span>
              <span className="club-card-body">
                <span className="club-card-heading">
                  <span className="club-card-name">{team.name}</span>
                  {team.shortName && <span className="club-card-code-pill">{team.shortName}</span>}
                </span>
                <span className="club-card-meta">
                  <EnvironmentOutlined />
                  {team.stadium?.name ?? team.city ?? 'Chưa có sân nhà'}
                </span>
              </span>
              <ArrowRightOutlined className="club-card-arrow" />
            </>
          );

          return (
            <article key={item.key} className="club-card" style={getTeamThemeStyle(team)}>
              {item.canOpen ? (
                <button
                  type="button"
                  className="club-card-main"
                  onClick={() => navigate(`/teams/${team.id}`)}
                >
                  {cardContent}
                </button>
              ) : (
                <div className="club-card-main club-card-main-static">{cardContent}</div>
              )}

              <div className="club-card-footer">
                <Tag color={status.color}>{status.label}</Tag>
                {item.requestType && (
                  <Tag>
                    {item.requestType === 'CREATE_TEAM' ? 'Tạo CLB mới' : 'Nhận quản lý CLB'}
                  </Tag>
                )}
              </div>

              {item.adminNote && <div className="club-card-note">Ghi chú: {item.adminNote}</div>}

              <div className="club-card-actions">
                <Button
                  className="club-card-detail-button"
                  icon={<ArrowRightOutlined />}
                  disabled={!item.canOpen}
                  onClick={() => item.canOpen && navigate(`/teams/${team.id}`)}
                >
                  {item.canOpen ? t('common.detail') : 'Chờ duyệt'}
                </Button>
                <Button
                  aria-label={`Chỉnh sửa ${team.name}`}
                  icon={<EditOutlined />}
                  disabled={!item.request || item.status === 'APPROVED'}
                  onClick={() => item.request && openEditManagerRequestModal(item.request)}
                />
                <Popconfirm
                  title={
                    item.status === 'APPROVED'
                      ? 'Xóa quyền quản lý CLB?'
                      : 'Xóa yêu cầu quản lý CLB?'
                  }
                  description={
                    item.status === 'APPROVED'
                      ? 'Manager sẽ không còn quản lý CLB này.'
                      : 'Yêu cầu này sẽ bị xóa khỏi hệ thống.'
                  }
                  disabled={!item.request}
                  onConfirm={() => item.request && handleDeleteManagerRequest(item.request)}
                  okText="Xóa"
                  cancelText={t('common.cancel')}
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    aria-label={`Xóa ${team.name}`}
                    danger
                    icon={<DeleteOutlined />}
                    disabled={!item.request}
                  />
                </Popconfirm>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  const renderTeamRequestsTable = () => {
    if (adminRequests.length === 0) {
      return (
        <div className="clubs-empty">
          <Empty description={t('common.noData')} />
        </div>
      );
    }

    return (
      <div className="club-card-grid club-card-grid-fixed" aria-label="Duyệt đội bóng">
        {adminRequests.map((request) => {
          const team = getRequestTeam(request);
          const status = requestStatusMeta[request.status];
          const canReview = request.status === 'PENDING';

          return (
            <article key={request.id} className="club-card" style={getTeamThemeStyle(team)}>
              <div className="club-card-main club-card-main-static">
                <span className="club-card-crest">{renderTeamLogo(team)}</span>
                <span className="club-card-body">
                  <span className="club-card-heading">
                    <span className="club-card-name">{team.name}</span>
                    {team.shortName && (
                      <span className="club-card-code-pill">{team.shortName}</span>
                    )}
                  </span>
                  <span className="club-card-meta">
                    <UserOutlined />
                    {request.manager?.name || request.manager?.email || '—'}
                  </span>
                </span>
                <ArrowRightOutlined className="club-card-arrow" />
              </div>

              <div className="club-card-footer">
                <Tag color={status.color}>{status.label}</Tag>
                <Tag>
                  {request.requestType === 'CREATE_TEAM' ? 'Tạo CLB mới' : 'Nhận quản lý CLB'}
                </Tag>
              </div>

              {request.adminNote && (
                <div className="club-card-note">
                  <div>Ghi chú Admin: {request.adminNote}</div>
                </div>
              )}

              <div className="club-card-actions">
                <Button
                  className="club-card-detail-button"
                  icon={<ArrowRightOutlined />}
                  disabled={!request.teamId}
                  onClick={() =>
                    request.teamId &&
                    navigate(`/teams/${request.teamId}`, {
                      state: {
                        requestNote: request.requestNote,
                        requestStatus: request.status,
                        managerName: request.manager?.name,
                        managerEmail: request.manager?.email,
                      },
                    })
                  }
                >
                  {t('common.detail')}
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  disabled={!canReview}
                  loading={reviewing && reviewingRequest?.id === request.id}
                  onClick={() => {
                    setReviewingRequest(request);
                    submitReviewTeamRequest(request, 'APPROVED');
                  }}
                />
                <Button
                  danger
                  icon={<CloseOutlined />}
                  disabled={!canReview}
                  onClick={() => {
                    setReviewingRequest(request);
                    setReviewNote(request.adminNote ?? '');
                  }}
                />
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <div className="clubs-page page-stack">
      <PageCover
        className={isManager ? 'teams-manager-cover' : undefined}
        title={t('teams.title')}
        description={t('teams.subtitle')}
        icon={<AppMenuIcon menuKey="teams" />}
        metrics={
          isManager
            ? [
                {
                  label: 'Tổng CLB',
                  value: teams.length.toLocaleString('vi-VN'),
                  icon: <TeamOutlined />,
                },
                {
                  label: 'Chưa có Manager',
                  value: claimableTeams.length.toLocaleString('vi-VN'),
                  icon: <TeamOutlined />,
                },
                {
                  label: 'Đang quản lý',
                  value: (managedTeam ? 1 : 0).toLocaleString('vi-VN'),
                  icon: <TeamOutlined />,
                },
              ]
            : [
                {
                  label: t('common.total'),
                  value: teams.length.toLocaleString('vi-VN'),
                  icon: <TeamOutlined />,
                },
                {
                  label: t('teams.filterActive'),
                  value: activeTeams.toLocaleString('vi-VN'),
                  icon: <TeamOutlined />,
                },
                {
                  label: t('teams.filterInactive'),
                  value: inactiveTeams.toLocaleString('vi-VN'),
                  icon: <TeamOutlined />,
                },
              ]
        }
      />
      <div className="clubs-toolbar">
        <Space wrap className="clubs-toolbar-controls">
          <Input
            placeholder={t('teams.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="clubs-search"
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="clubs-status-filter"
            options={[
              { value: 'ALL', label: t('common.all') },
              { value: 'ACTIVE', label: t('teams.filterActive') },
              { value: 'INACTIVE', label: t('teams.filterInactive') },
            ]}
          />
        </Space>
        <Space>
          {isManager && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateRequestModal}>
              Thêm đội bóng
            </Button>
          )}
          {canEdit && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              {t('teams.addBtn')}
            </Button>
          )}
        </Space>
      </div>

      {isManager ? (
        <Tabs
          className="teams-manager-tabs"
          items={[
            {
              key: 'all',
              label: 'Tất cả đội bóng',
              children: renderTeamCards(filteredTeams),
            },
            {
              key: 'mine',
              label: 'Đội bóng của tôi',
              children: renderManagerTeamCards(managerRequestCards),
            },
          ]}
        />
      ) : user?.role === 'ADMIN' ? (
        <Tabs
          defaultActiveKey={location.state?.tab || 'list'}
          items={[
            {
              key: 'list',
              label: 'Danh sách đội bóng',
              children: renderTeamCards(filteredTeams),
            },
            {
              key: 'review',
              label: 'Duyệt đội bóng',
              children: renderTeamRequestsTable(),
            },
          ]}
        />
      ) : (
        renderTeamCards(filteredTeams)
      )}

      <Modal
        title={editingManagerRequest ? 'Cập nhật yêu cầu quản lý CLB' : 'Yêu cầu quyền quản lý CLB'}
        open={requestModalOpen}
        onCancel={closeRequestModal}
        footer={null}
        destroyOnClose
        centered
        width={600}
      >
        <Tabs
          className="team-manager-request-tabs"
          activeKey={requestModalTab}
          onChange={(key) => setRequestModalTab(key as 'create' | 'claim')}
          items={[
            {
              key: 'create',
              label: 'Tạo CLB mới',
              children: (
                <Form form={createRequestForm} layout="vertical" style={{ marginTop: 8 }}>
                  <Row gutter={16}>
                    <Col xs={24} md={16}>
                      <Form.Item
                        name="name"
                        label={t('teams.formName')}
                        rules={[{ required: true, message: t('teams.formNameRequired') }]}
                      >
                        <Input placeholder={t('teams.formNamePlaceholder')} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="shortName" label={t('teams.formShortName')}>
                        <Input maxLength={10} placeholder={t('teams.formShortNamePlaceholder')} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24}>
                      <Form.Item name="city" label={t('teams.formCity')}>
                        <Input placeholder={t('teams.formCityPlaceholder')} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="logoUrl" label={t('teams.formLogo')}>
                    <ImageUpload />
                  </Form.Item>
                  <Form.Item name="requestNote" label="Ghi chú gửi Admin">
                    <Input.TextArea rows={2} placeholder="Thông tin bổ sung để Admin xét duyệt" />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      loading={requestSubmitting}
                      onClick={submitCreateTeamRequest}
                    >
                      Gửi yêu cầu
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'claim',
              label: 'Chọn CLB có sẵn',
              children: (
                <Form form={claimRequestForm} layout="vertical" style={{ marginTop: 8 }}>
                  <Typography.Paragraph type="secondary">
                    Chỉ hiển thị các CLB đang hoạt động, chưa có Manager chính thức và chưa có yêu
                    cầu chờ duyệt.
                  </Typography.Paragraph>
                  <Form.Item
                    name="teamId"
                    label="CLB muốn quản lý"
                    rules={[{ required: true, message: 'Vui lòng chọn CLB' }]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="label"
                      placeholder="Chọn CLB"
                      options={claimableTeamOptions}
                    />
                  </Form.Item>
                  <Form.Item name="requestNote" label="Ghi chú gửi Admin">
                    <Input.TextArea rows={2} placeholder="Lý do bạn muốn quản lý CLB này" />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      loading={requestSubmitting}
                      onClick={submitClaimTeamRequest}
                    >
                      Gửi yêu cầu
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Modal>

      <Modal
        title="Chi tiết yêu cầu CLB"
        open={!!reviewingRequest}
        onCancel={() => setReviewingRequest(null)}
        footer={[
          <Button
            key="reject"
            danger
            loading={reviewing}
            onClick={() => handleReviewTeamRequest('REJECTED')}
          >
            Từ chối
          </Button>,
          <Button
            key="approve"
            type="primary"
            loading={reviewing}
            onClick={() => handleReviewTeamRequest('APPROVED')}
          >
            Duyệt
          </Button>,
        ]}
      >
        {reviewingRequest && (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Typography.Text strong>
              {reviewingRequest.requestType === 'CREATE_TEAM'
                ? reviewingRequest.proposedTeamName
                : reviewingRequest.team?.name}
            </Typography.Text>
            <Typography.Text>Manager: {reviewingRequest.manager?.email ?? '—'}</Typography.Text>
            <Typography.Text>Ghi chú: {reviewingRequest.requestNote || '—'}</Typography.Text>
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú xét duyệt"
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
            />
          </Space>
        )}
      </Modal>

      <Modal
        title={editingTeam ? t('teams.modalEditTitle') : t('teams.modalCreateTitle')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingTeam ? t('common.save') : t('common.create')}
        cancelText={t('common.cancel')}
        destroyOnClose
        centered
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label={t('teams.formName')}
                rules={[{ required: true, message: t('teams.formNameRequired') }]}
              >
                <Input placeholder={t('teams.formNamePlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="shortName" label={t('teams.formShortName')}>
                <Input placeholder={t('teams.formShortNamePlaceholder')} maxLength={10} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="city" label={t('teams.formCity')}>
                <Input placeholder={t('teams.formCityPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="managerId" label={t('teams.formManager')}>
            <Select
              placeholder={t('teams.formManagerPlaceholder')}
              showSearch
              optionFilterProp="label"
              options={[
                { value: NO_MANAGER_VALUE, label: t('teams.formManagerNone') },
                ...availableManagerOptions,
              ]}
            />
          </Form.Item>

          <Form.Item name="logoUrl" label={t('teams.formLogo')}>
            <ImageUpload />
          </Form.Item>

          <Form.Item name="status" label={t('teams.formStatus')}>
            <Select>
              <Select.Option value="ACTIVE">{t('teams.formStatusActive')}</Select.Option>
              <Select.Option value="INACTIVE">{t('teams.formStatusInactive')}</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
