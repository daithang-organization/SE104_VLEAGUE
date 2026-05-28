import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
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
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { FilterValue, SorterResult, SortOrder as AntSortOrder } from 'antd/es/table/interface';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import { apiGetTeamManagerManagedTeam } from '../services/teamManagerApi';
import { getTeamLogoUrl } from '../utils/teamLogos';

const POSITION_LABELS: Record<string, string> = {
  GK: 'Thủ môn',
  DF: 'Hậu vệ',
  MF: 'Tiền vệ',
  FW: 'Tiền đạo',
};

const POSITION_COLORS: Record<string, string> = {
  GK: 'gold',
  DF: 'blue',
  MF: 'green',
  FW: 'red',
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

export default function PlayersPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  const [managerTeamLoaded, setManagerTeamLoaded] = useState(false);
  const [form] = Form.useForm();

  const isTeamManager = user?.role === 'TEAM_MANAGER';
  const canEdit = useMemo(() => {
    return user?.role && CAN_EDIT_ROLES.includes(user.role);
  }, [user]);
  const totalPlayers = pagination.total || players.length;
  const metricPlayers = filterSourcePlayers.length > 0 ? filterSourcePlayers : players;
  const foreignPlayers = metricPlayers.filter((player) => player.playerType === 'FOREIGN').length;
  const rosteredPlayers = metricPlayers.filter((player) => player.roster?.[0]?.team).length;

  useEffect(() => {
    if (!isTeamManager) {
      setManagerTeamId(null);
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
          setTeams(managedTeam ? [managedTeam] : []);
        }
      } catch (_err) {
        if (!cancelled) {
          setManagerTeamId(null);
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

  const fetchPlayers = useCallback(
    async (page = 1, limit = 20, searchQuery?: string) => {
      setLoading(true);
      try {
        const res = await apiGetPlayers(page, limit, {
          search: searchQuery || undefined,
          teamId: managerTeamId || columnFilters.teamId || undefined,
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
      managerTeamId,
      sortState.sortBy,
      sortState.sortOrder,
      t,
    ],
  );

  useEffect(() => {
    if (isTeamManager && !managerTeamLoaded) return;
    if (isTeamManager && !managerTeamId) {
      setPlayers([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
      setLoading(false);
      return;
    }
    fetchPlayers(pagination.page, pagination.limit, search);
  }, [
    fetchPlayers,
    isTeamManager,
    managerTeamId,
    managerTeamLoaded,
    pagination.limit,
    pagination.page,
    search,
  ]);

  useEffect(() => {
    if (isTeamManager && !managerTeamLoaded) return;
    if (isTeamManager && !managerTeamId) {
      setFilterSourcePlayers([]);
      return;
    }

    let cancelled = false;
    apiGetPlayers(1, 1000, { teamId: managerTeamId || undefined })
      .then((res) => {
        if (!cancelled) setFilterSourcePlayers(res.data);
      })
      .catch(() => {
        if (!cancelled) setFilterSourcePlayers([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isTeamManager, managerTeamId, managerTeamLoaded]);

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
      teamId: managerTeamId || firstFilterValue(filters.club),
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

  const openCreateModal = () => {
    setEditingPlayer(null);
    form.resetFields();
    form.setFieldsValue({ playerType: 'DOMESTIC', teamId: managerTeamId ?? undefined });
    setModalOpen(true);
  };

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    form.setFieldsValue({
      fullName: player.fullName,
      dob: dayjs(player.dob),
      nationality: player.nationality,
      position: player.position,
      playerType: player.playerType ?? 'DOMESTIC',
      birthPlace: player.birthPlace ?? '',
      heightCm: player.heightCm ?? undefined,
      weightKg: player.weightKg ?? undefined,
      teamId: managerTeamId ?? (player.roster || [])[0]?.team?.id ?? undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload: CreatePlayerPayload = {
        fullName: values.fullName,
        dob: values.dob.format('YYYY-MM-DD'),
        nationality: values.nationality,
        position: values.position,
        playerType: values.playerType || undefined,
        birthPlace: values.birthPlace || undefined,
        heightCm: values.heightCm || undefined,
        weightKg: values.weightKg || undefined,
        teamId: managerTeamId ?? values.teamId ?? undefined,
      };

      if (editingPlayer) {
        await apiUpdatePlayer(editingPlayer.id, payload);
        message.success(t('players.updateSuccess'));
      } else {
        await apiCreatePlayer(payload);
        message.success(t('players.createSuccess'));
      }

      setModalOpen(false);
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
      await apiDeletePlayer(id);
      message.success(t('players.deleteSuccess'));
      fetchPlayers(pagination.page, pagination.limit, search);
    } catch (_err) {
      message.error(t('players.deleteError'));
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
      width: 60,
      render: (_, __, i) => (pagination.page - 1) * pagination.limit + i + 1,
    },
    {
      title: t('players.colFullName'),
      dataIndex: 'fullName',
      sorter: true,
      sortOrder: sortState.sortBy === 'fullName' ? toAntSortOrder(sortState.sortOrder) : null,
      render: (name: string, record: Player) => (
        <a onClick={() => navigate(`/players/${record.id}`)}>{name}</a>
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
        <Tag color={POSITION_COLORS[pos]}>{POSITION_LABELS[pos] ?? pos}</Tag>
      ),
      filters: Object.entries(POSITION_LABELS).map(([value, text]) => ({
        text,
        value,
      })),
      filteredValue: columnFilters.position ? [columnFilters.position] : null,
    },
    {
      title: t('players.colType'),
      dataIndex: 'playerType',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'FOREIGN' ? 'purple' : 'cyan'}>
          {type === 'FOREIGN' ? t('players.formTypeForeign') : t('players.formTypeDomestic')}
        </Tag>
      ),
      filters: [
        { text: t('players.formTypeDomestic'), value: 'DOMESTIC' },
        { text: t('players.formTypeForeign'), value: 'FOREIGN' },
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
    ...(canEdit
      ? [
          {
            title: t('players.colActions'),
            key: 'actions',
            width: 120,
            render: (_: unknown, record: Player) => (
              <Space>
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/players/${record.id}`)}
                />
                <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
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
              </Space>
            ),
          },
        ]
      : []),
  ];

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
              label: t('players.colClub'),
              value: rosteredPlayers.toLocaleString('vi-VN'),
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
          </Space>
          {canEdit && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              {t('players.addBtn')}
            </Button>
          )}
        </div>

        <Card>
          {loading && players.length === 0 ? (
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
              }}
              onChange={handleTableChange}
              size="middle"
              locale={{ emptyText: t('common.noData') }}
            />
          )}
        </Card>
      </div>

      <Modal
        title={editingPlayer ? t('players.modalEditTitle') : t('players.modalCreateTitle')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingPlayer ? t('common.save') : t('common.create')}
        cancelText={t('common.cancel')}
        destroyOnClose
        width={650}
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
              <Form.Item name="birthPlace" label={t('players.formBirthPlace')}>
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
                  <Select.Option value="DOMESTIC">{t('players.formTypeDomestic')}</Select.Option>
                  <Select.Option value="FOREIGN">{t('players.formTypeForeign')}</Select.Option>
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
                  <Select.Option value="GK">{t('players.formPositionGK')}</Select.Option>
                  <Select.Option value="DF">{t('players.formPositionDF')}</Select.Option>
                  <Select.Option value="MF">{t('players.formPositionMF')}</Select.Option>
                  <Select.Option value="FW">{t('players.formPositionFW')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="heightCm" label={t('players.formHeight')}>
                <InputNumber
                  min={100}
                  max={250}
                  style={{ width: '100%' }}
                  placeholder={t('players.formHeightPlaceholder')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="weightKg" label={t('players.formWeight')}>
                <InputNumber
                  min={30}
                  max={200}
                  style={{ width: '100%' }}
                  placeholder={t('players.formWeightPlaceholder')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}
