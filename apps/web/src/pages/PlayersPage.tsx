import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FireOutlined,
  GlobalOutlined,
  HomeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
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
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { SortOrder as AntSortOrder, FilterValue, SorterResult } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AppMenuIcon, PageCover, TableSkeleton } from '../components';
import {
  apiCreatePlayer,
  apiDeletePlayer,
  apiGetPlayers,
  apiUpdatePlayer,
  type CreatePlayerPayload,
  type Player,
  type PlayerSortBy,
  type PlayerSortOrder,
} from '../services/playerApi';
import { apiGetTeams, type Team } from '../services/teamApi';
import {
  apiCreateManagerPlayerRequest,
  apiDeleteManagerPlayerRequest,
  apiGetManagerPlayerRequests,
  apiGetMyManagerPlayerRequests,
  apiGetTeamManagerManagedTeam,
  apiReviewManagerPlayerRequest,
  apiUpdateManagerPlayerRequest,
  type ManagerPlayerRequest,
} from '../services/teamManagerApi';
import { getTeamLogoUrl } from '../utils/teamLogos';
import { cleanDecorativeLabel } from '../utils/textLabels';

const POSITION_TRANSLATION_KEYS: Record<string, string> = {
  GK: 'players.formPositionGK',
  DF: 'players.formPositionDF',
  MF: 'players.formPositionMF',
  FW: 'players.formPositionFW',
};

const POSITION_LABELS: Record<string, string> = {
  GK: 'Thủ môn',
  DF: 'Hậu vệ',
  MF: 'Tiền vệ',
  FW: 'Tiền đạo',
};

const POSITION_ICONS: Record<string, ReactNode> = {
  GK: <UserOutlined />,
  DF: <SafetyOutlined />,
  MF: <SettingOutlined />,
  FW: <FireOutlined />,
};

const POSITION_COLORS: Record<string, string> = {
  GK: 'gold',
  DF: 'blue',
  MF: 'green',
  FW: 'red',
};

const PLAYER_TYPE_ICONS: Record<string, ReactNode> = {
  DOMESTIC: <HomeOutlined />,
  FOREIGN: <GlobalOutlined />,
};

const CAN_EDIT_ROLES = ['ADMIN', 'TEAM_MANAGER'];

type PlayerColumnFilters = {
  teamId?: string;
  nationality?: string;
  position?: string;
  playerType?: string;
};

type PlayerSortState = {
  sortBy: PlayerSortBy;
  sortOrder: PlayerSortOrder;
};

const PLAYER_SORT_FIELDS = new Set<PlayerSortBy>(['fullName', 'dob', 'heightCm', 'weightKg']);

const firstFilterValue = (value?: FilterValue | null) =>
  value?.[0] !== undefined ? String(value[0]) : undefined;

const toAntSortOrder = (sortOrder: PlayerSortOrder): AntSortOrder =>
  sortOrder === 'asc' ? 'ascend' : 'descend';

function iconLabel(icon: ReactNode, label: string) {
  return (
    <Space size={6}>
      {icon}
      <span>{cleanDecorativeLabel(label)}</span>
    </Space>
  );
}

export default function PlayersPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const tabFromUrl = new URLSearchParams(location.search).get('tab');
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [columnFilters, setColumnFilters] = useState<PlayerColumnFilters>({});
  const [sortState, setSortState] = useState<PlayerSortState>({
    sortBy: 'fullName',
    sortOrder: 'asc',
  });
  const [filterSourcePlayers, setFilterSourcePlayers] = useState<Player[]>([]);
  const [managerTeamId, setManagerTeamId] = useState<string | null>(null);
  const [managerTeamStatus, setManagerTeamStatus] = useState<Team['status'] | null>(null);
  const [managerTeamLoaded, setManagerTeamLoaded] = useState(false);
  const [managerPlayerTab, setManagerPlayerTab] = useState<'all' | 'mine' | 'requests'>(
    ((location.state as Record<string, unknown>)?.tab as 'all' | 'mine' | 'requests') ||
      (tabFromUrl as 'all' | 'mine' | 'requests') ||
      'all',
  );
  const [managerPlayerRequests, setManagerPlayerRequests] = useState<ManagerPlayerRequest[]>([]);
  const [adminPlayerRequests, setAdminPlayerRequests] = useState<ManagerPlayerRequest[]>([]);
  const [editingPlayerRequest, setEditingPlayerRequest] = useState<ManagerPlayerRequest | null>(
    null,
  );
  const [reviewingRequest, setReviewingRequest] = useState<ManagerPlayerRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [form] = Form.useForm();

  const isTeamManager = user?.role === 'TEAM_MANAGER';
  const isManagerMineTab = isTeamManager && managerPlayerTab === 'mine';
  const isManagerTeamInactive = isTeamManager && managerTeamStatus === 'INACTIVE';
  const canEdit = useMemo(() => {
    return user?.role && CAN_EDIT_ROLES.includes(user.role);
  }, [user]);
  const showPlayerActions = Boolean(user?.role === 'ADMIN' || isManagerMineTab);
  const totalPlayers = pagination.total || players.length;
  const metricPlayers = filterSourcePlayers.length > 0 ? filterSourcePlayers : players;
  const foreignPlayers = metricPlayers.filter((player) => player.playerType === 'FOREIGN').length;
  const domesticPlayers = metricPlayers.filter(
    (player) =>
      player.playerType === 'DOMESTIC' ||
      ['việt nam', 'vietnam'].includes(player.nationality.trim().toLocaleLowerCase('vi-VN')),
  ).length;
  const getPositionLabel = (position: string) =>
    cleanDecorativeLabel(t(POSITION_TRANSLATION_KEYS[position] ?? position));
  const getPlayerTypeLabel = (type: string) =>
    cleanDecorativeLabel(
      type === 'FOREIGN' ? t('players.formTypeForeign') : t('players.formTypeDomestic'),
    );

  useEffect(() => {
    if (!isTeamManager) {
      setManagerTeamId(null);
      setManagerTeamStatus(null);
      setManagerTeamLoaded(true);
      return;
    }

    let cancelled = false;
    setManagerTeamLoaded(false);
    const loadManagerTeam = async () => {
      try {
        const managedTeam = await apiGetTeamManagerManagedTeam();
        if (!cancelled) {
          setManagerTeamId(managedTeam?.id ?? null);
          setManagerTeamStatus(managedTeam?.status ?? null);
          setTeams(managedTeam ? [managedTeam] : []);
        }
      } catch (_err) {
        if (!cancelled) {
          setManagerTeamId(null);
          setManagerTeamStatus(null);
          message.error('Không tải được CLB quản lý của tài khoản này');
        }
      } finally {
        if (!cancelled) setManagerTeamLoaded(true);
      }
    };

    loadManagerTeam();
    return () => {
      cancelled = true;
    };
  }, [isTeamManager]);

  const fetchManagerPlayerRequests = useCallback(async () => {
    if (!isTeamManager) return;
    try {
      const data = await apiGetMyManagerPlayerRequests();
      setManagerPlayerRequests(
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      );
    } catch (_err) {
      setManagerPlayerRequests([]);
    }
  }, [isTeamManager]);

  const fetchAdminPlayerRequests = useCallback(async () => {
    if (user?.role !== 'ADMIN') return;
    try {
      const data = await apiGetManagerPlayerRequests();
      setAdminPlayerRequests(
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      );
    } catch (_err) {
      setAdminPlayerRequests([]);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchManagerPlayerRequests();
    fetchAdminPlayerRequests();
  }, [fetchAdminPlayerRequests, fetchManagerPlayerRequests]);

  const fetchPlayers = useCallback(
    async (page = 1, limit = 20, searchQuery?: string) => {
      setLoading(true);
      try {
        const res = await apiGetPlayers(page, limit, {
          search: searchQuery || undefined,
          teamId: isManagerMineTab ? managerTeamId || undefined : columnFilters.teamId || undefined,
          nationality: columnFilters.nationality,
          position: columnFilters.position,
          playerType: columnFilters.playerType,
          sortBy: sortState.sortBy,
          sortOrder: sortState.sortOrder,
        });
        setPlayers(res.data);
        setPagination((prev) => {
          if (prev.page === res.page && prev.limit === res.limit && prev.total === res.total) {
            return prev;
          }
          return { ...prev, total: res.total, page: res.page, limit: res.limit };
        });
      } catch (_err) {
        message.error(t('players.loadError'), 2);
      } finally {
        setLoading(false);
      }
    },
    [
      columnFilters.nationality,
      columnFilters.playerType,
      columnFilters.position,
      columnFilters.teamId,
      isManagerMineTab,
      managerTeamId,
      sortState.sortBy,
      sortState.sortOrder,
      t,
    ],
  );

  useEffect(() => {
    if (isTeamManager && !managerTeamLoaded) return;
    if (isManagerMineTab && !managerTeamId) {
      setPlayers([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
      setLoading(false);
      return;
    }
    fetchPlayers(pagination.page, pagination.limit, search);
  }, [
    fetchPlayers,
    isManagerMineTab,
    isTeamManager,
    managerTeamId,
    managerTeamLoaded,
    pagination.limit,
    pagination.page,
    search,
  ]);

  useEffect(() => {
    if (isTeamManager && !managerTeamLoaded) return;
    if (isManagerMineTab && !managerTeamId) {
      setFilterSourcePlayers([]);
      return;
    }

    let cancelled = false;
    apiGetPlayers(1, 1000, { teamId: isManagerMineTab ? managerTeamId || undefined : undefined })
      .then((res) => {
        if (!cancelled) setFilterSourcePlayers(res.data);
      })
      .catch(() => {
        if (!cancelled) setFilterSourcePlayers([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isManagerMineTab, isTeamManager, managerTeamId, managerTeamLoaded]);

  useEffect(() => {
    apiGetTeams()
      .then((res) =>
        setTeams(
          isTeamManager && managerTeamId
            ? res.data.filter((t) => t.id === managerTeamId)
            : res.data,
        ),
      )
      .catch(() => {});
  }, [isTeamManager, managerTeamId]);

  const onSearch = (value: string) => {
    const cleanValue = value.trim();
    setSearch(cleanValue);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleTableChange = (
    nextPagination: { current?: number; pageSize?: number },
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Player> | SorterResult<Player>[],
  ) => {
    const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = typeof activeSorter?.field === 'string' ? activeSorter.field : undefined;
    const nextSortState: PlayerSortState =
      field && PLAYER_SORT_FIELDS.has(field as PlayerSortBy) && activeSorter.order
        ? {
            sortBy: field as PlayerSortBy,
            sortOrder: activeSorter.order === 'descend' ? 'desc' : 'asc',
          }
        : { sortBy: 'fullName', sortOrder: 'asc' };

    setSortState(nextSortState);
    setColumnFilters({
      teamId: isManagerMineTab ? managerTeamId || undefined : firstFilterValue(filters.club),
      nationality: firstFilterValue(filters.nationality),
      position: firstFilterValue(filters.position),
      playerType: firstFilterValue(filters.playerType),
    });
    setPagination((prev) => ({
      ...prev,
      page: nextPagination.current ?? 1,
      limit: nextPagination.pageSize ?? prev.limit,
    }));
  };

  const handleManagerTabChange = (key: string) => {
    setManagerPlayerTab(key as 'all' | 'mine' | 'requests');
    setPagination((prev) => ({ ...prev, page: 1 }));
    setColumnFilters((prev) => ({ ...prev, teamId: undefined }));
  };

  const openCreateModal = () => {
    if (isManagerTeamInactive) {
      message.warning('CLB đang không hoạt động, không thể thêm cầu thủ.');
      return;
    }

    setEditingPlayer(null);
    setEditingPlayerRequest(null);
    form.resetFields();
    form.setFieldsValue({
      playerType: 'DOMESTIC',
      teamId: managerTeamId ?? undefined,
      requestNote: undefined,
    });
    setModalOpen(true);
  };

  const openEditModal = (player: Player) => {
    if (isManagerTeamInactive) {
      message.warning('CLB đang không hoạt động, không thể chỉnh sửa cầu thủ.');
      return;
    }

    setEditingPlayer(player);
    setEditingPlayerRequest(null);
    form.setFieldsValue({
      fullName: player.fullName,
      dob: dayjs(player.dob),
      nationality: player.nationality,
      position: player.position,
      playerType: player.playerType ?? 'DOMESTIC',
      birthPlace: player.birthPlace ?? '',
      heightCm: player.heightCm ?? undefined,
      weightKg: player.weightKg ?? undefined,
      careerSummary: player.careerSummary ?? '',
      teamId: managerTeamId ?? (player.roster || [])[0]?.team?.id ?? undefined,
      requestNote: undefined,
    });
    setModalOpen(true);
  };

  const openEditRequestModal = (request: ManagerPlayerRequest) => {
    if (request.status === 'APPROVED' || request.requestType === 'REMOVE_FROM_TEAM') return;
    if (isManagerTeamInactive) {
      message.warning('CLB đang không hoạt động, không thể chỉnh sửa yêu cầu cầu thủ.');
      return;
    }

    const payload = request.payload ?? {};
    const sourcePlayer = request.player;
    setEditingPlayer(null);
    setEditingPlayerRequest(request);
    form.setFieldsValue({
      fullName: payload.fullName ?? sourcePlayer?.fullName,
      dob: (payload.dob ?? sourcePlayer?.dob) ? dayjs(payload.dob ?? sourcePlayer?.dob) : undefined,
      nationality: payload.nationality ?? sourcePlayer?.nationality,
      position: payload.position ?? sourcePlayer?.position,
      playerType: payload.playerType ?? sourcePlayer?.playerType ?? 'DOMESTIC',
      birthPlace: payload.birthPlace ?? sourcePlayer?.birthPlace ?? '',
      heightCm: payload.heightCm ?? sourcePlayer?.heightCm ?? undefined,
      weightKg: payload.weightKg ?? sourcePlayer?.weightKg ?? undefined,
      careerSummary: payload.careerSummary ?? sourcePlayer?.careerSummary ?? '',
      teamId: request.teamId,
      requestNote: request.requestNote ?? undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (isManagerTeamInactive) {
        message.warning('CLB đang không hoạt động, không thể lưu thay đổi cầu thủ.');
        return;
      }

      if (!isTeamManager && values.teamId) {
        const selectedTeam = teams.find((team) => team.id === values.teamId);
        if (selectedTeam?.status === 'INACTIVE') {
          message.warning('CLB đang không hoạt động, không thể thêm hoặc chỉnh sửa cầu thủ.');
          return;
        }
      }

      setSaving(true);

      const payload: CreatePlayerPayload = {
        fullName: values.fullName,
        dob: values.dob.format('YYYY-MM-DD'),
        nationality: values.nationality,
        position: values.position,
        playerType: values.playerType || undefined,
        birthPlace: values.birthPlace.trim(),
        heightCm: values.heightCm,
        weightKg: values.weightKg,
        careerSummary: values.careerSummary.trim(),
        teamId: managerTeamId ?? values.teamId ?? undefined,
      };

      if (editingPlayerRequest) {
        await apiUpdateManagerPlayerRequest(editingPlayerRequest.id, {
          requestType: editingPlayerRequest.requestType,
          playerId: editingPlayerRequest.playerId ?? undefined,
          ...payload,
          requestNote: values.requestNote || undefined,
        });
        message.success('Đã cập nhật và gửi lại yêu cầu cầu thủ đến Admin');
        fetchManagerPlayerRequests();
      } else if (editingPlayer) {
        if (isTeamManager) {
          await apiCreateManagerPlayerRequest({
            requestType: 'UPDATE_PLAYER',
            playerId: editingPlayer.id,
            ...payload,
            requestNote: values.requestNote || undefined,
          });
          message.success('Đã gửi yêu cầu chỉnh sửa cầu thủ đến Admin');
          fetchManagerPlayerRequests();
        } else {
          await apiUpdatePlayer(editingPlayer.id, payload);
          message.success(t('players.updateSuccess'));
        }
      } else {
        if (isTeamManager) {
          await apiCreateManagerPlayerRequest({
            requestType: 'ADD_PLAYER',
            ...payload,
            requestNote: values.requestNote || undefined,
          });
          message.success('Đã gửi yêu cầu thêm cầu thủ đến Admin');
          fetchManagerPlayerRequests();
        } else {
          await apiCreatePlayer(payload);
          message.success(t('players.createSuccess'));
        }
      }

      setModalOpen(false);
      setEditingPlayerRequest(null);
      fetchPlayers(pagination.page, pagination.limit, search);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;

      // Try to extract backend error message
      let errorMsg = t('players.saveError');
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { message: string | string[] } } };
        const backendMsg = axiosError.response?.data?.message;
        if (backendMsg) {
          errorMsg = Array.isArray(backendMsg) ? backendMsg[0] : backendMsg;
        }
      }
      message.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (isTeamManager) {
        if (isManagerTeamInactive) {
          message.warning('CLB đang không hoạt động, không thể xóa cầu thủ.');
          return;
        }

        await apiCreateManagerPlayerRequest({
          requestType: 'REMOVE_FROM_TEAM',
          playerId: id,
        });
        message.success('Đã gửi yêu cầu xóa cầu thủ đến Admin');
        fetchManagerPlayerRequests();
      } else {
        await apiDeletePlayer(id);
        message.success(t('players.deleteSuccess'));
      }
      fetchPlayers(pagination.page, pagination.limit, search);
    } catch (_err) {
      message.error(t('players.deleteError'));
    }
  };

  const handleDeletePlayerRequest = async (request: ManagerPlayerRequest) => {
    try {
      await apiDeleteManagerPlayerRequest(request.id);
      message.success('Đã xóa yêu cầu cầu thủ');
      fetchManagerPlayerRequests();
    } catch (_err) {
      message.error('Không thể xóa yêu cầu cầu thủ');
    }
  };

  const submitReview = async (
    request: ManagerPlayerRequest,
    status: 'APPROVED' | 'REJECTED',
    adminNote?: string,
  ) => {
    setReviewing(true);
    setReviewingRequest(request);
    try {
      await apiReviewManagerPlayerRequest(request.id, {
        status,
        adminNote: adminNote || undefined,
      });
      message.success(
        status === 'APPROVED' ? 'Đã duyệt yêu cầu cầu thủ' : 'Đã từ chối yêu cầu cầu thủ',
      );
      setReviewingRequest(null);
      setReviewNote('');
      fetchAdminPlayerRequests();
      fetchPlayers(pagination.page, pagination.limit, search);
    } catch (_err) {
      message.error('Không thể xét duyệt yêu cầu cầu thủ');
    } finally {
      setReviewing(false);
      setReviewingRequest(null);
    }
  };

  const renderClubCell = (team: NonNullable<Player['roster']>[number]['team']) => {
    const logoUrl = getTeamLogoUrl(team);
    const label = team.shortName || team.name;

    return (
      <span className="player-club-cell" title={team.name}>
        {logoUrl ? (
          <img src={logoUrl} alt={`${team.name} logo`} className="player-club-logo" />
        ) : (
          <span className="player-club-logo player-club-logo-fallback" aria-hidden="true">
            {label.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span className="player-club-name">{label}</span>
      </span>
    );
  };

  const columns: ColumnsType<Player> = [
    {
      title: '#',
      key: 'index',
      align: 'center',
      width: 60,
      render: (_, __, i) => (pagination.page - 1) * pagination.limit + i + 1,
    },
    {
      title: t('players.colFullName'),
      dataIndex: 'fullName',
      sorter: true,
      sortOrder: sortState.sortBy === 'fullName' ? toAntSortOrder(sortState.sortOrder) : null,
      render: (name: string, record: Player) => (
        <a
          onClick={() =>
            navigate(`/players/${record.id}`, {
              state: { fromTab: user?.role === 'ADMIN' ? 'list' : managerPlayerTab },
            })
          }
        >
          {name}
        </a>
      ),
    },
    {
      title: t('players.colClub'),
      key: 'club',
      width: 180,
      render: (_, record) => {
        const tp = record.roster?.[0];
        if (!tp?.team) return <span style={{ color: '#ccc' }}>{t('players.colNoClub')}</span>;
        return renderClubCell(tp.team);
      },
      filters: (() => {
        const clubs = new Map<string, string>();
        filterSourcePlayers.forEach((p) => {
          const tp = p.roster?.[0];
          if (tp?.team) clubs.set(tp.team.id, tp.team.name);
        });
        if (clubs.size === 0) {
          teams.forEach((team) => clubs.set(team.id, team.name));
        }
        return [...clubs.entries()].map(([id, name]) => ({ text: name, value: id }));
      })(),
      filteredValue: columnFilters.teamId ? [columnFilters.teamId] : null,
    },
    {
      title: t('players.colDob'),
      dataIndex: 'dob',
      width: 120,
      render: (dob: string) => dayjs(dob).format('DD/MM/YYYY'),
      sorter: true,
      sortOrder: sortState.sortBy === 'dob' ? toAntSortOrder(sortState.sortOrder) : null,
    },
    {
      title: t('players.colNationality'),
      dataIndex: 'nationality',
      width: 120,
      filters: [...new Set(filterSourcePlayers.map((p) => p.nationality).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
        .map((n) => ({
          text: n,
          value: n,
        })),
      filteredValue: columnFilters.nationality ? [columnFilters.nationality] : null,
    },
    {
      title: t('players.colPosition'),
      dataIndex: 'position',
      width: 100,
      render: (pos: string) => (
        <Tag icon={POSITION_ICONS[pos]} color={POSITION_COLORS[pos]}>
          {POSITION_LABELS[pos] ?? getPositionLabel(pos)}
        </Tag>
      ),
      filters: Object.entries(POSITION_LABELS).map(([value, label]) => ({
        text: iconLabel(POSITION_ICONS[value], label),
        value,
      })),
      filteredValue: columnFilters.position ? [columnFilters.position] : null,
    },
    {
      title: t('players.colType'),
      dataIndex: 'playerType',
      width: 100,
      render: (type: string) => (
        <Tag icon={PLAYER_TYPE_ICONS[type]} color={type === 'FOREIGN' ? 'purple' : 'cyan'}>
          {getPlayerTypeLabel(type)}
        </Tag>
      ),
      filters: [
        {
          text: iconLabel(PLAYER_TYPE_ICONS.DOMESTIC, getPlayerTypeLabel('DOMESTIC')),
          value: 'DOMESTIC',
        },
        {
          text: iconLabel(PLAYER_TYPE_ICONS.FOREIGN, getPlayerTypeLabel('FOREIGN')),
          value: 'FOREIGN',
        },
      ],
      filteredValue: columnFilters.playerType ? [columnFilters.playerType] : null,
    },
    {
      title: t('players.colHeight'),
      dataIndex: 'heightCm',
      width: 90,
      render: (v: number | null) => (v ? `${v} cm` : '—'),
      sorter: true,
      sortOrder: sortState.sortBy === 'heightCm' ? toAntSortOrder(sortState.sortOrder) : null,
    },
    {
      title: t('players.colWeight'),
      dataIndex: 'weightKg',
      width: 90,
      render: (v: number | null) => (v ? `${v} kg` : '—'),
      sorter: true,
      sortOrder: sortState.sortBy === 'weightKg' ? toAntSortOrder(sortState.sortOrder) : null,
    },
    ...(showPlayerActions
      ? ([
          {
            title: t('players.colActions'),
            key: 'actions',
            align: 'center',
            width: 120,
            render: (_: unknown, record: Player) => (
              <Space>
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() =>
                    navigate(`/players/${record.id}`, {
                      state: { fromTab: user?.role === 'ADMIN' ? 'list' : managerPlayerTab },
                    })
                  }
                />
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  disabled={isManagerTeamInactive}
                  onClick={() => openEditModal(record)}
                />
                {isTeamManager ? (
                  <Popconfirm
                    title="Gửi yêu cầu xóa cầu thủ?"
                    description={`Yêu cầu xóa "${record.fullName}" sẽ được gửi Admin để duyệt.`}
                    onConfirm={() => handleDelete(record.id)}
                    okText="Gửi"
                    cancelText={t('common.cancel')}
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      disabled={isManagerTeamInactive}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                ) : (
                  <Popconfirm
                    title={t('players.deleteConfirmTitle')}
                    description={t('players.deleteConfirmDesc', { name: record.fullName })}
                    onConfirm={() => handleDelete(record.id)}
                    okText={t('players.deleteOk')}
                    cancelText={t('players.deleteCancel')}
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                )}
              </Space>
            ),
          },
        ] as ColumnType<Player>[])
      : []),
  ];

  const renderPlayersTable = () =>
    loading && players.length === 0 ? (
      <TableSkeleton rows={8} />
    ) : (
      <Table
        columns={columns}
        dataSource={players}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => t('players.totalCount', { total }),
          hideOnSinglePage: false,
          pageSizeOptions: [10, 15, 20, 50],
        }}
        onChange={handleTableChange}
        size="middle"
        locale={{ emptyText: t('common.noData') }}
      />
    );

  const playerRequestTypeText = (type: ManagerPlayerRequest['requestType']) =>
    type === 'ADD_PLAYER'
      ? 'Thêm cầu thủ'
      : type === 'UPDATE_PLAYER'
        ? 'Chỉnh sửa cầu thủ'
        : 'Xóa cầu thủ';

  const renderPlayerRequestName = (record: ManagerPlayerRequest) => {
    const name = record.payload?.fullName || record.player?.fullName || '—';
    const isAdminReview = user?.role === 'ADMIN';
    const noteTitle = isAdminReview ? 'Ghi chú của Manager' : 'Phản hồi';
    const noteTone = isAdminReview ? 'info' : 'danger';
    const noteText = isAdminReview ? record.requestNote : record.adminNote;

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
        <a
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/players/${record.playerId || `request-${record.id}`}`, {
              state: { request: record, fromTab: user?.role === 'ADMIN' ? 'review' : 'requests' },
            });
          }}
          style={{ fontWeight: 600 }}
        >
          {name}
        </a>
      </Popover>
    );
  };

  const getReviewActionTitle = (request: ManagerPlayerRequest, status: 'APPROVED' | 'REJECTED') => {
    const action = status === 'APPROVED' ? 'Duyệt' : 'Từ chối';
    const requestLabel = playerRequestTypeText(request.requestType).toLowerCase();
    return `${action} ${requestLabel}`;
  };

  const renderReviewConfirmContent = (request: ManagerPlayerRequest) => (
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
    request: ManagerPlayerRequest,
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

  const playerRequestColumns: ColumnsType<ManagerPlayerRequest> = [
    {
      title: '#',
      key: 'index',
      align: 'center',
      width: 60,
      render: (_, __, i) => i + 1,
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'requestType',
      width: 150,
      render: (type: ManagerPlayerRequest['requestType']) => playerRequestTypeText(type),
    },
    {
      title: 'Họ và tên',
      key: 'name',
      render: (_, record) => renderPlayerRequestName(record),
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
        { text: 'Được duyệt', value: 'APPROVED' },
        { text: 'Từ chối', value: 'REJECTED' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: ManagerPlayerRequest['status']) => (
        <Tag color={status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'gold'}>
          {status === 'APPROVED' ? 'Được duyệt' : status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
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
    ...(user?.role === 'ADMIN'
      ? ([
          {
            title: t('players.colActions'),
            key: 'actions',
            align: 'center',
            width: 120,
            render: (_: unknown, record: ManagerPlayerRequest) => (
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
        ] as ColumnType<ManagerPlayerRequest>[])
      : isTeamManager
        ? ([
            {
              title: t('players.colActions'),
              key: 'actions',
              align: 'center',
              width: 120,
              render: (_: unknown, record: ManagerPlayerRequest) => (
                <Space>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    disabled={
                      record.status === 'APPROVED' || record.requestType === 'REMOVE_FROM_TEAM'
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditRequestModal(record);
                    }}
                  />
                  <Popconfirm
                    title="Xóa yêu cầu cầu thủ?"
                    description="Yêu cầu này sẽ bị xóa khỏi danh sách của bạn."
                    onConfirm={() => handleDeletePlayerRequest(record)}
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
          ] as ColumnType<ManagerPlayerRequest>[])
        : []),
  ];

  const renderPlayerRequestsTable = (requests: ManagerPlayerRequest[]) => (
    <Table
      columns={playerRequestColumns}
      dataSource={requests}
      rowKey="id"
      pagination={{
        defaultPageSize: 15,
        pageSizeOptions: [10, 15, 20, 50],
        showSizeChanger: true,
        showTotal: (total) => t('players.totalCount', { total }),
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
          navigate(`/players/${record.playerId || `request-${record.id}`}`, {
            state: { request: record, fromTab: user?.role === 'ADMIN' ? 'review' : 'requests' },
          });
        },
        style: { cursor: 'pointer' },
      })}
    />
  );

  const handleReload = useCallback(() => {
    fetchPlayers(pagination.page, pagination.limit, search);
    if (isTeamManager) fetchManagerPlayerRequests();
    if (user?.role === 'ADMIN') fetchAdminPlayerRequests();
  }, [
    fetchPlayers,
    pagination.page,
    pagination.limit,
    search,
    isTeamManager,
    fetchManagerPlayerRequests,
    user?.role,
    fetchAdminPlayerRequests,
  ]);

  return (
    <>
      <div className="page-stack">
        <PageCover
          eyebrow={t('menu.players')}
          title={t('players.title')}
          description={t('players.searchPlaceholder')}
          icon={<AppMenuIcon menuKey="players" />}
          metrics={[
            {
              label: t('common.total'),
              value: totalPlayers.toLocaleString('vi-VN'),
              icon: <UserOutlined />,
            },
            {
              label: t('playerType.FOREIGN'),
              value: foreignPlayers.toLocaleString('vi-VN'),
              icon: <TeamOutlined />,
            },
            {
              label: t('playerType.DOMESTIC'),
              value: domesticPlayers.toLocaleString('vi-VN'),
              icon: <TeamOutlined />,
            },
          ]}
        />

        <div className="page-toolbar">
          <Space wrap>
            <Input.Search
              placeholder={t('players.searchPlaceholder')}
              onSearch={onSearch}
              style={{ width: 300 }}
              allowClear
              loading={loading}
            />
            <Button icon={<ReloadOutlined />} onClick={handleReload}>
              Tải lại
            </Button>
          </Space>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={isManagerTeamInactive}
              onClick={openCreateModal}
            >
              {t('players.addBtn')}
            </Button>
          )}
        </div>

        <Card>
          {user?.role === 'ADMIN' ? (
            <Tabs
              defaultActiveKey={
                ((location.state as Record<string, unknown>)?.tab as string) || tabFromUrl || 'list'
              }
              items={[
                {
                  key: 'list',
                  label: 'Danh sách cầu thủ',
                  children: renderPlayersTable(),
                },
                {
                  key: 'review',
                  label: 'Duyệt cầu thủ',
                  children: renderPlayerRequestsTable(adminPlayerRequests),
                },
              ]}
            />
          ) : isTeamManager ? (
            <Tabs
              activeKey={managerPlayerTab}
              onChange={handleManagerTabChange}
              items={[
                {
                  key: 'all',
                  label: 'Tất cả cầu thủ',
                  children: renderPlayersTable(),
                },
                {
                  key: 'mine',
                  label: 'Cầu thủ của tôi',
                  children: renderPlayersTable(),
                },
                {
                  key: 'requests',
                  label: 'Yêu cầu cầu thủ',
                  children: renderPlayerRequestsTable(managerPlayerRequests),
                },
              ]}
            />
          ) : (
            renderPlayersTable()
          )}
        </Card>
      </div>

      <Modal
        title={
          editingPlayerRequest
            ? 'Cập nhật yêu cầu cầu thủ'
            : editingPlayer
              ? t('players.modalEditTitle')
              : t('players.modalCreateTitle')
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingPlayerRequest(null);
        }}
        onOk={handleSave}
        confirmLoading={saving}
        okText={
          editingPlayerRequest ? 'Gửi lại' : editingPlayer ? t('common.save') : t('common.create')
        }
        cancelText={t('common.cancel')}
        destroyOnClose
        width={650}
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="fullName"
            label={t('players.formFullName')}
            rules={[{ required: true, message: t('players.formFullNameRequired') }]}
          >
            <Input placeholder={t('players.formFullNamePlaceholder')} />
          </Form.Item>

          <Form.Item name="teamId" label={t('players.formClub')}>
            <Select
              placeholder={t('players.formClubPlaceholder')}
              allowClear={!isTeamManager}
              disabled={isTeamManager}
              showSearch
              optionFilterProp="label"
              options={teams
                .filter((t) => t.status === 'ACTIVE')
                .map((t) => ({
                  value: t.id,
                  label: `${t.name}${t.shortName ? ` (${t.shortName})` : ''}`,
                }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dob"
                label={t('players.formDob')}
                rules={[{ required: true, message: t('players.formDobRequired') }]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  placeholder={t('players.formDobPlaceholder')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="birthPlace"
                label={t('players.formBirthPlace')}
                rules={[{ required: true, message: t('players.formBirthPlaceRequired') }]}
              >
                <Input placeholder={t('players.formBirthPlacePlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nationality"
                label={t('players.formNationality')}
                rules={[{ required: true, message: t('players.formNationalityRequired') }]}
              >
                <Input placeholder={t('players.formNationalityPlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="playerType" label={t('players.formType')}>
                <Select>
                  <Select.Option value="DOMESTIC">
                    {iconLabel(PLAYER_TYPE_ICONS.DOMESTIC, getPlayerTypeLabel('DOMESTIC'))}
                  </Select.Option>
                  <Select.Option value="FOREIGN">
                    {iconLabel(PLAYER_TYPE_ICONS.FOREIGN, getPlayerTypeLabel('FOREIGN'))}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="position"
                label={t('players.formPosition')}
                rules={[{ required: true, message: t('players.formPositionRequired') }]}
              >
                <Select placeholder={t('players.formPositionPlaceholder')}>
                  {Object.keys(POSITION_TRANSLATION_KEYS).map((position) => (
                    <Select.Option key={position} value={position}>
                      {iconLabel(POSITION_ICONS[position], getPositionLabel(position))}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="heightCm"
                label={t('players.formHeight')}
                rules={[{ required: true, message: t('players.formHeightRequired') }]}
              >
                <InputNumber
                  min={100}
                  max={250}
                  style={{ width: '100%' }}
                  placeholder={t('players.formHeightPlaceholder')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="weightKg"
                label={t('players.formWeight')}
                rules={[{ required: true, message: t('players.formWeightRequired') }]}
              >
                <InputNumber
                  min={30}
                  max={200}
                  style={{ width: '100%' }}
                  placeholder={t('players.formWeightPlaceholder')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={isTeamManager ? 12 : 24}>
              <Form.Item
                name="careerSummary"
                label={t('players.formCareerSummary')}
                rules={[{ required: true, message: t('players.formCareerSummaryRequired') }]}
              >
                <Input.TextArea
                  rows={3}
                  maxLength={2000}
                  showCount
                  placeholder={t('players.formCareerSummaryPlaceholder')}
                />
              </Form.Item>
            </Col>
            {isTeamManager && (
              <Col xs={24} md={12}>
                <Form.Item name="requestNote" label="Ghi chú gửi Admin">
                  <Input.TextArea
                    rows={3}
                    maxLength={1000}
                    showCount
                    placeholder="Thông tin bổ sung để Admin xét duyệt"
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    </>
  );
}
