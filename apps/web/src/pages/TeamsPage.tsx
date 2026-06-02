import {
  ArrowRightOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  LogoutOutlined,
  PlusOutlined,
  ReloadOutlined,
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
  Popover,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
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
  apiGetMyTeamManagerRequests,
  apiGetTeamManagerClaimableTeams,
  apiGetTeamManagerManagedTeam,
  apiGetTeamManagerManagementRequest,
  apiGetTeamManagerRequests,
  apiLeaveTeamManagerManagedTeam,
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
};

export default function TeamsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const tabFromUrl = new URLSearchParams(location.search).get('tab');
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
  const [managerRequests, setManagerRequests] = useState<TeamManagerRequest[]>([]);
  const [claimableTeams, setClaimableTeams] = useState<Team[]>([]);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestModalTab, setRequestModalTab] = useState<'create' | 'claim'>('create');
  const [requestModalPurpose, setRequestModalPurpose] = useState<'management' | 'updateTeam'>(
    'management',
  );
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
  }, [t]);

  const fetchManagerState = useCallback(async () => {
    setLoading(true);
    try {
      const [teamsData, managedTeamData, requestData, requestsData, claimableTeamsData] =
        await Promise.all([
          apiGetTeams(),
          apiGetTeamManagerManagedTeam(),
          apiGetTeamManagerManagementRequest(),
          apiGetMyTeamManagerRequests(),
          apiGetTeamManagerClaimableTeams(),
        ]);

      setTeams(teamsData?.data || []);
      setManagedTeam(managedTeamData);
      setManagerRequest(requestData);
      setManagerRequests(requestsData);
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
      coachName: team.coachName ?? '',
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
        coachName: values.coachName || undefined,
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
    setRequestModalPurpose('management');
    createRequestForm.resetFields();
    createRequestForm.setFieldsValue({ proposedTeamStatus: 'ACTIVE' });
    claimRequestForm.resetFields();
    setRequestModalTab('create');
    setRequestModalOpen(true);
  };

  const openEditManagerRequestModal = (request: TeamManagerRequest) => {
    if (request.status === 'APPROVED') return;

    setEditingManagerRequest(request);
    setRequestModalPurpose(
      request.requestType === 'UPDATE_MANAGED_TEAM' ? 'updateTeam' : 'management',
    );
    setRequestModalTab(request.requestType === 'CLAIM_EXISTING_TEAM' ? 'claim' : 'create');
    createRequestForm.setFieldsValue({
      name: request.proposedTeamName ?? undefined,
      shortName: request.proposedTeamShortName ?? undefined,
      city: request.proposedTeamCity ?? undefined,
      coachName: request.proposedCoachName ?? undefined,
      logoUrl: request.proposedTeamLogoUrl ?? undefined,
      proposedTeamStatus: request.proposedTeamStatus ?? request.team?.status ?? 'ACTIVE',
      requestNote: request.requestNote ?? undefined,
    });
    claimRequestForm.setFieldsValue({
      teamId: request.teamId ?? undefined,
      requestNote: request.requestNote ?? undefined,
    });
    setRequestModalOpen(true);
  };

  const openUpdateManagedTeamModal = (team: Team, request?: TeamManagerRequest) => {
    setEditingManagerRequest(request ?? null);
    setRequestModalPurpose('updateTeam');
    setRequestModalTab('create');
    claimRequestForm.resetFields();
    createRequestForm.setFieldsValue({
      name: request?.proposedTeamName ?? team.name,
      shortName: request?.proposedTeamShortName ?? team.shortName ?? undefined,
      city: request?.proposedTeamCity ?? team.city ?? undefined,
      coachName: request?.proposedCoachName ?? team.coachName ?? undefined,
      logoUrl: request?.proposedTeamLogoUrl ?? team.logoUrl ?? undefined,
      proposedTeamStatus: request?.proposedTeamStatus ?? team.status ?? 'ACTIVE',
      requestNote: request?.requestNote ?? undefined,
    });
    setRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setRequestModalOpen(false);
    setEditingManagerRequest(null);
    setRequestModalPurpose('management');
    createRequestForm.resetFields();
    claimRequestForm.resetFields();
  };

  const handleDeleteManagerRequest = async (request: TeamManagerRequest) => {
    try {
      await apiDeleteTeamManagerRequest(request.id);
      message.success('Đã xóa yêu cầu quản lý CLB');
      fetchManagerState();
    } catch (_err) {
      message.error('Không thể xóa yêu cầu quản lý CLB');
    }
  };

  const handleLeaveManagedTeam = async () => {
    try {
      await apiLeaveTeamManagerManagedTeam();
      message.success('Đã rời khỏi CLB');
      fetchManagerState();
    } catch (_err) {
      message.error('Không thể rời khỏi CLB');
    }
  };

  const handleCreateDeleteTeamRequest = async (team: Team) => {
    try {
      await apiCreateTeamManagerRequest({
        requestType: 'DELETE_MANAGED_TEAM',
        teamId: team.id,
      });
      message.success('Đã gửi yêu cầu xóa CLB đến Admin');
      fetchManagerState();
    } catch (_err) {
      message.error('Không thể gửi yêu cầu xóa CLB');
    }
  };

  const submitCreateTeamRequest = async () => {
    try {
      const values = await createRequestForm.validateFields();
      setRequestSubmitting(true);
      const isTeamUpdate = requestModalPurpose === 'updateTeam';
      const teamId = managedTeam?.id ?? editingManagerRequest?.teamId ?? undefined;
      if (isTeamUpdate && !teamId) {
        message.error('Không tìm thấy CLB để cập nhật');
        return;
      }
      const payload = isTeamUpdate
        ? ({
            requestType: 'UPDATE_MANAGED_TEAM',
            teamId: teamId!,
            proposedTeamName: values.name,
            proposedTeamShortName: values.shortName || undefined,
            proposedTeamCity: values.city || undefined,
            proposedCoachName: values.coachName || undefined,
            proposedTeamLogoUrl: values.logoUrl || undefined,
            proposedTeamStatus: values.proposedTeamStatus || 'ACTIVE',
            requestNote: values.requestNote || undefined,
          } as const)
        : ({
            requestType: 'CREATE_TEAM',
            proposedTeamName: values.name,
            proposedTeamShortName: values.shortName || undefined,
            proposedTeamCity: values.city || undefined,
            proposedCoachName: values.coachName || undefined,
            proposedTeamLogoUrl: values.logoUrl || undefined,
            proposedTeamStatus: values.proposedTeamStatus || 'ACTIVE',
            requestNote: values.requestNote || undefined,
          } as const);
      if (editingManagerRequest) {
        await apiUpdateTeamManagerRequest(editingManagerRequest.id, payload);
        message.success(
          isTeamUpdate ? 'Đã cập nhật yêu cầu chỉnh sửa CLB' : 'Đã cập nhật yêu cầu tạo CLB',
        );
      } else {
        await apiCreateTeamManagerRequest(payload);
        message.success(
          isTeamUpdate
            ? 'Đã gửi yêu cầu chỉnh sửa CLB đến Admin'
            : 'Đã gửi yêu cầu tạo CLB mới đến Admin',
        );
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

  const getReviewActionTitle = (request: TeamManagerRequest, status: 'APPROVED' | 'REJECTED') => {
    const action = status === 'APPROVED' ? 'Duyệt' : 'Từ chối';
    const requestLabel = requestTypeLabel(request.requestType);
    return `${action} ${requestLabel.charAt(0).toLowerCase()}${requestLabel.slice(1)}`;
  };

  const renderReviewConfirmContent = (request: TeamManagerRequest) => (
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
    request: TeamManagerRequest,
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
      onConfirm={() => submitReviewTeamRequest(request, status, reviewNote)}
      disabled={request.status !== 'PENDING'}
      overlayClassName="team-review-popconfirm"
    >
      {button}
    </Popconfirm>
  );

  const filteredTeams = (teams || []).filter((team) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [team.name, team.shortName, team.city, team.stadium?.name, team.coachName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    const matchesStatus = statusFilter === 'ALL' || team.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTeams = teams.filter((team) => team.status === 'ACTIVE').length;
  const inactiveTeams = teams.filter((team) => team.status === 'INACTIVE').length;
  const isManager = user?.role === 'TEAM_MANAGER';
  // Lock edit/delete buttons while a PENDING update or delete request exists for the managed team
  const hasPendingTeamRequest =
    isManager &&
    managerRequests.some(
      (r) =>
        r.status === 'PENDING' &&
        (r.requestType === 'UPDATE_MANAGED_TEAM' || r.requestType === 'DELETE_MANAGED_TEAM'),
    );
  const getRequestTeam = (request: TeamManagerRequest): Team =>
    request.requestType === 'CREATE_TEAM' || request.requestType === 'UPDATE_MANAGED_TEAM'
      ? {
          id: request.teamId ?? `request-${request.id}`,
          name: request.proposedTeamName ?? request.team?.name ?? 'CLB đề xuất',
          shortName: request.proposedTeamShortName ?? request.team?.shortName ?? null,
          city: request.proposedTeamCity ?? request.team?.city ?? null,
          logoUrl: request.proposedTeamLogoUrl ?? request.team?.logoUrl ?? null,
          status: request.proposedTeamStatus ?? request.team?.status ?? 'ACTIVE',
          stadiumId: request.team?.stadiumId ?? null,
          stadium: request.team?.stadium ?? null,
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

  const activeManagedTeamRequest =
    managedTeam && managerRequest?.status === 'PENDING' && managerRequest.teamId === managedTeam.id
      ? managerRequest
      : null;
  const managerRequestCards: ManagerTeamCardItem[] = managedTeam
    ? [{ key: managedTeam.id, team: managedTeam }]
    : [];

  const requestStatusMeta: Record<TeamManagerRequest['status'], { color: string; label: string }> =
    {
      PENDING: { color: 'gold', label: 'Chờ duyệt' },
      APPROVED: { color: 'green', label: 'Được duyệt' },
      REJECTED: { color: 'red', label: 'Từ chối' },
    };

  const requestTypeLabel = (requestType: TeamManagerRequest['requestType']) => {
    if (requestType === 'CREATE_TEAM') return 'Tạo CLB mới';
    if (requestType === 'CLAIM_EXISTING_TEAM') return 'Nhận quản lý CLB';
    if (requestType === 'UPDATE_MANAGED_TEAM') return 'Chỉnh sửa CLB';
    return 'Xóa CLB';
  };

  const renderRequestTypeTag = (
    request: Pick<TeamManagerRequest, 'requestType' | 'requestNote'>,
    options?: {
      noteText?: string | null;
      noteTitle?: string;
      noteTone?: 'info' | 'danger';
      showEmptyNote?: boolean;
    },
  ) => {
    const hasCustomNoteText = Object.prototype.hasOwnProperty.call(options ?? {}, 'noteText');
    const noteText = hasCustomNoteText ? options?.noteText : request.requestNote;
    const noteTitle = options?.noteTitle ?? 'Ghi chú';
    const noteTone = options?.noteTone ?? 'info';
    const shouldShowPopover = Boolean(noteText) || options?.showEmptyNote;
    const tag = (
      <Tag className={shouldShowPopover ? 'club-card-request-type-tag' : undefined}>
        {requestTypeLabel(request.requestType)}
      </Tag>
    );

    if (!shouldShowPopover) return tag;

    return (
      <Popover
        trigger={['hover', 'click']}
        placement="topLeft"
        overlayClassName="manager-request-note-popover"
        title={
          <span className={`manager-request-note-title manager-request-note-title-${noteTone}`}>
            {noteTitle}
          </span>
        }
        content={<div className="manager-request-note-content">{noteText || '—'}</div>}
      >
        <span className="club-card-request-type-popover" tabIndex={0}>
          {tag}
        </span>
      </Popover>
    );
  };

  const getTeamManagerDisplay = (team: Team) => {
    return team.coachName?.trim() || '—';
  };

  const getTeamRequestName = (request: TeamManagerRequest) =>
    request.team?.name ?? request.proposedTeamName ?? '—';

  const getTeamRequestManager = (request: TeamManagerRequest) => {
    if (request.manager?.name || request.manager?.email) {
      return request.manager.name
        ? `${request.manager.name} (${request.manager.email})`
        : request.manager.email;
    }
    if (user?.role === 'TEAM_MANAGER') {
      return user.name ? `${user.name} (${user.email})` : user.email;
    }
    return '—';
  };

  const getTeamRequestDetailState = (
    request: TeamManagerRequest,
    fromTab: 'requests' | 'review',
  ) => ({
    fromTab,
    requestType: request.requestType,
    requestNote: request.requestNote,
    adminNote: request.adminNote,
    requestStatus: request.status,
    managerName: request.manager?.name,
    managerEmail: request.manager?.email,
    proposedTeamName: request.proposedTeamName,
    proposedTeamShortName: request.proposedTeamShortName,
    proposedTeamCity: request.proposedTeamCity,
    proposedCoachName: request.proposedCoachName,
    proposedTeamLogoUrl: request.proposedTeamLogoUrl,
    proposedTeamStatus: request.proposedTeamStatus,
  });

  const renderTeamRequestName = (request: TeamManagerRequest) => {
    const teamName = getTeamRequestName(request);
    const isAdminReview = user?.role === 'ADMIN';
    const noteTitle = isAdminReview ? 'Ghi chú của Manager' : 'Phản hồi';
    const noteTone = isAdminReview ? 'info' : 'danger';
    const noteText = isAdminReview ? request.requestNote : request.adminNote;

    const nameNode = request.teamId ? (
      <Button
        type="link"
        className="table-link-button"
        onClick={() =>
          navigate(`/teams/${request.teamId}`, {
            state: getTeamRequestDetailState(
              request,
              user?.role === 'TEAM_MANAGER' ? 'requests' : 'review',
            ),
          })
        }
      >
        {teamName}
      </Button>
    ) : (
      <span className="table-link-button">{teamName}</span>
    );

    return (
      <Popover
        trigger="hover"
        placement="topLeft"
        overlayClassName="manager-request-note-popover"
        title={
          <span className={`manager-request-note-title manager-request-note-title-${noteTone}`}>
            {noteTitle}
          </span>
        }
        content={<div className="manager-request-note-content">{noteText || '—'}</div>}
      >
        {nameNode}
      </Popover>
    );
  };

  const canEditTeamRequest = (request: TeamManagerRequest) =>
    request.status !== 'APPROVED' && request.requestType !== 'DELETE_MANAGED_TEAM';

  const canDeleteTeamRequest = (request: TeamManagerRequest) => request.status !== 'APPROVED';

  const teamRequestColumns: ColumnsType<TeamManagerRequest> = [
    {
      title: '#',
      key: 'index',
      align: 'center',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'requestType',
      width: 170,
      render: (requestType: TeamManagerRequest['requestType']) => requestTypeLabel(requestType),
    },
    {
      title: 'Tên đội bóng',
      key: 'teamName',
      render: (_, request) => renderTeamRequestName(request),
    },
    {
      title: 'Người yêu cầu',
      key: 'manager',
      render: (_, request) => getTeamRequestManager(request),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      filters: [
        { text: requestStatusMeta.PENDING.label, value: 'PENDING' },
        { text: requestStatusMeta.APPROVED.label, value: 'APPROVED' },
        { text: requestStatusMeta.REJECTED.label, value: 'REJECTED' },
      ],
      onFilter: (value, request) => request.status === value,
      render: (status: TeamManagerRequest['status']) => (
        <Tag color={requestStatusMeta[status].color}>{requestStatusMeta[status].label}</Tag>
      ),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      width: 130,
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      render: (value: string) => dayjs(value).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 120,
      render: (_, request) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            disabled={!canEditTeamRequest(request)}
            onClick={() => openEditManagerRequestModal(request)}
          />
          <Popconfirm
            title="Xóa yêu cầu đội bóng?"
            description="Yêu cầu này sẽ bị xóa khỏi danh sách của bạn."
            disabled={!canDeleteTeamRequest(request)}
            onConfirm={() => handleDeleteManagerRequest(request)}
            okText="Xóa"
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={!canDeleteTeamRequest(request)}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderManagerTeamRequestsTable = () => (
    <Table
      columns={teamRequestColumns}
      dataSource={managerRequests}
      rowKey="id"
      loading={loading}
      pagination={{
        defaultPageSize: 15,
        pageSizeOptions: [10, 15, 20, 50],
        showSizeChanger: true,
        showTotal: (total) => `Tổng ${total} yêu cầu`,
        hideOnSinglePage: false,
      }}
      size="middle"
      locale={{ emptyText: t('common.noData') }}
    />
  );

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
              onClick={() => navigate(`/teams/${team.id}`, { state: { fromTab: 'all' } })}
            >
              <span className="club-card-crest">{renderTeamLogo(team)}</span>
              <span className="club-card-body">
                <span className="club-card-heading">
                  <span className="club-card-name">{team.name}</span>
                  {team.shortName && <span className="club-card-code-pill">{team.shortName}</span>}
                </span>
                <span className="club-card-meta">
                  <UserOutlined />
                  {getTeamManagerDisplay(team)}
                </span>
              </span>
              <ArrowRightOutlined className="club-card-arrow" />
            </button>

            <div className="club-card-footer">
              <Tag color={team.status === 'ACTIVE' ? 'green-inverse' : 'default'}>
                {team.status === 'ACTIVE' ? t('teams.filterActive') : t('teams.filterInactive')}
              </Tag>
            </div>

            <div className="club-card-actions">
              <Button
                className="club-card-detail-button"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate(`/teams/${team.id}`, { state: { fromTab: 'all' } })}
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

  const renderManagerTeamCards = (items: ManagerTeamCardItem[], emptyDescription = '—') => {
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
          const isActive = team.status === 'ACTIVE';
          const cardContent = (
            <>
              <span className="club-card-crest">{renderTeamLogo(team)}</span>
              <span className="club-card-body">
                <span className="club-card-heading">
                  <span className="club-card-name">{team.name}</span>
                  {team.shortName && <span className="club-card-code-pill">{team.shortName}</span>}
                </span>
                <span className="club-card-meta">
                  <UserOutlined />
                  {getTeamManagerDisplay(team)}
                </span>
              </span>
              <ArrowRightOutlined className="club-card-arrow" />
            </>
          );

          return (
            <article key={item.key} className="club-card" style={getTeamThemeStyle(team)}>
              <button
                type="button"
                className="club-card-main"
                onClick={() => navigate(`/teams/${team.id}`, { state: { fromTab: 'mine' } })}
              >
                {cardContent}
              </button>

              <div className="club-card-footer">
                <Tag color={isActive ? 'green-inverse' : 'default'}>
                  {isActive ? t('teams.filterActive') : 'Không hoạt động'}
                </Tag>
              </div>

              <div className="club-card-actions">
                <Button
                  className="club-card-detail-button"
                  icon={<ArrowRightOutlined />}
                  onClick={() =>
                    navigate(`/teams/${team.id}`, {
                      state: { fromTab: 'mine' },
                    })
                  }
                >
                  {t('common.detail')}
                </Button>
                <Button
                  className="club-card-outline-action club-card-edit-action"
                  aria-label={`Chỉnh sửa ${team.name}`}
                  icon={<EditOutlined />}
                  disabled={hasPendingTeamRequest}
                  title={hasPendingTeamRequest ? 'Đang chờ Admin duyệt yêu cầu' : undefined}
                  onClick={() => openUpdateManagedTeamModal(team)}
                />
                <Popconfirm
                  title="Gửi yêu cầu xóa CLB?"
                  description="Admin sẽ cần duyệt trước khi CLB bị xóa khỏi hệ thống."
                  onConfirm={() => handleCreateDeleteTeamRequest(team)}
                  okText="Xóa"
                  cancelText={t('common.cancel')}
                  okButtonProps={{ danger: true }}
                  disabled={hasPendingTeamRequest}
                >
                  <Button
                    className="club-card-outline-action club-card-delete-action"
                    aria-label={`Xóa ${team.name}`}
                    icon={<DeleteOutlined />}
                    disabled={hasPendingTeamRequest}
                    title={hasPendingTeamRequest ? 'Đang chờ Admin duyệt yêu cầu' : undefined}
                  />
                </Popconfirm>
                <Popconfirm
                  title="Rời khỏi CLB?"
                  description="Bạn sẽ không còn quyền quản lý CLB này."
                  onConfirm={handleLeaveManagedTeam}
                  okText="Rời khỏi"
                  cancelText={t('common.cancel')}
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    className="club-card-outline-action club-card-leave-action"
                    aria-label={`Rời khỏi ${team.name}`}
                    icon={<LogoutOutlined />}
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
              <button
                type="button"
                className="club-card-main"
                onClick={() =>
                  request.teamId &&
                  navigate(`/teams/${request.teamId}`, {
                    state: getTeamRequestDetailState(request, 'review'),
                  })
                }
              >
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
              </button>

              <div className="club-card-footer">
                <Tag color={status.color}>{status.label}</Tag>
                {renderRequestTypeTag(request, { showEmptyNote: true })}
              </div>

              <div className="club-card-actions">
                <Button
                  className="club-card-detail-button"
                  icon={<ArrowRightOutlined />}
                  disabled={!request.teamId}
                  onClick={() =>
                    request.teamId &&
                    navigate(`/teams/${request.teamId}`, {
                      state: getTeamRequestDetailState(request, 'review'),
                    })
                  }
                >
                  {t('common.detail')}
                </Button>
                {renderReviewPopconfirm(
                  request,
                  'APPROVED',
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    disabled={!canReview}
                    loading={
                      reviewing &&
                      reviewingRequest?.id === request.id &&
                      request.status === 'PENDING'
                    }
                  />,
                )}
                {renderReviewPopconfirm(
                  request,
                  'REJECTED',
                  <Button danger icon={<CloseOutlined />} disabled={!canReview} />,
                )}
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  const handleReload = useCallback(() => {
    if (user?.role === 'TEAM_MANAGER') {
      fetchManagerState();
    } else {
      fetchTeams();
      fetchUsers();
      fetchAdminRequests();
    }
  }, [fetchManagerState, fetchTeams, fetchUsers, fetchAdminRequests, user?.role]);

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
                  label: 'Tổng số CLB',
                  value: teams.length.toLocaleString('vi-VN'),
                  icon: <TeamOutlined />,
                },
                {
                  label: 'Chưa có HLV',
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
          <Button icon={<ReloadOutlined />} onClick={handleReload}>
            Tải lại
          </Button>
        </Space>
        <Space>
          {isManager && (
            <Button
              type="primary"
              icon={managedTeam ? <EditOutlined /> : <PlusOutlined />}
              onClick={() => {
                if (managedTeam) {
                  openUpdateManagedTeamModal(
                    managedTeam,
                    activeManagedTeamRequest?.requestType === 'UPDATE_MANAGED_TEAM'
                      ? activeManagedTeamRequest
                      : undefined,
                  );
                  return;
                }
                openCreateRequestModal();
              }}
            >
              {managedTeam ? 'Chỉnh sửa đội bóng' : 'Thêm đội bóng'}
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
          defaultActiveKey={location.state?.tab || tabFromUrl || 'all'}
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
            {
              key: 'requests',
              label: 'Yêu cầu đội bóng',
              children: renderManagerTeamRequestsTable(),
            },
          ]}
        />
      ) : user?.role === 'ADMIN' ? (
        <Tabs
          defaultActiveKey={location.state?.tab || tabFromUrl || 'list'}
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
        title={
          requestModalPurpose === 'updateTeam'
            ? 'Yêu cầu chỉnh sửa thông tin CLB'
            : editingManagerRequest
              ? 'Cập nhật yêu cầu quản lý CLB'
              : 'Yêu cầu quyền quản lý CLB'
        }
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
              label: requestModalPurpose === 'updateTeam' ? 'Thông tin CLB' : 'Tạo CLB mới',
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
                    <Col xs={24} md={12}>
                      <Form.Item name="coachName" label={t('teams.formCoachName')}>
                        <Input placeholder={t('teams.formCoachNamePlaceholder')} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="city" label={t('teams.formCity')}>
                        <Input placeholder={t('teams.formCityPlaceholder')} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="logoUrl" label={t('teams.formLogo')}>
                    <ImageUpload />
                  </Form.Item>
                  <Form.Item name="proposedTeamStatus" label={t('teams.formStatus')}>
                    <Select
                      options={[
                        { value: 'ACTIVE', label: t('teams.filterActive') },
                        { value: 'INACTIVE', label: t('teams.filterInactive') },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item name="requestNote" label="Ghi chú gửi Admin">
                    <Input.TextArea rows={2} placeholder="Thông tin bổ sung để Admin xét duyệt" />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Space>
                      <Button onClick={closeRequestModal} disabled={requestSubmitting}>
                        {t('common.cancel')}
                      </Button>
                      <Button
                        type="primary"
                        loading={requestSubmitting}
                        onClick={submitCreateTeamRequest}
                      >
                        Gửi yêu cầu
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              ),
            },
            ...(requestModalPurpose === 'management'
              ? [
                  {
                    key: 'claim',
                    label: 'Chọn CLB có sẵn',
                    children: (
                      <Form form={claimRequestForm} layout="vertical" style={{ marginTop: 8 }}>
                        <Typography.Paragraph type="secondary">
                          Chỉ hiển thị các CLB đang hoạt động, chưa có Manager chính thức và chưa có
                          yêu cầu chờ duyệt.
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
                          <Space>
                            <Button onClick={closeRequestModal} disabled={requestSubmitting}>
                              {t('common.cancel')}
                            </Button>
                            <Button
                              type="primary"
                              loading={requestSubmitting}
                              onClick={submitClaimTeamRequest}
                            >
                              Gửi yêu cầu
                            </Button>
                          </Space>
                        </Form.Item>
                      </Form>
                    ),
                  },
                ]
              : []),
          ]}
        />
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
            <Col span={12}>
              <Form.Item name="coachName" label={t('teams.formCoachName')}>
                <Input placeholder={t('teams.formCoachNamePlaceholder')} maxLength={120} />
              </Form.Item>
            </Col>
            <Col span={12}>
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
