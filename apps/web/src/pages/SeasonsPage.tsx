import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import {
  apiCreateSeason,
  apiDeleteSeason,
  apiGetSeasons,
  apiUpdateSeason,
  apiUpdateSeasonStatus,
  type CreateSeasonPayload,
  type Season,
} from '../services/seasonApi';
import {
  apiGetSeasonTeams,
  apiRegisterTeam,
  apiRemoveSeasonTeam,
  apiUpdateSeasonTeamStatus,
  type SeasonTeam,
} from '../services/seasonTeamApi';
import { apiGetTeams, type Team } from '../services/teamApi';

const STATUS_OPTIONS = [
  { value: 'UPCOMING', label: 'Sắp diễn ra', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'Đang diễn ra', color: 'green' },
  { value: 'COMPLETED', label: 'Đã kết thúc', color: 'default' },
];

// Generate season year options: e.g. "2024/2025", "2025/2026", etc.
function generateYearOptions() {
  const currentYear = new Date().getFullYear();
  const options = [];
  for (let y = currentYear - 3; y <= currentYear + 3; y++) {
    options.push({
      value: y,
      label: `Mùa giải ${y}/${y + 1}`,
    });
  }
  return options;
}

const TEAM_STATUS_MAP: Record<string, { label: string; color: string }> = {
  REGISTERED: { label: 'Đã đăng ký', color: 'processing' },
  APPROVED: { label: 'Đã duyệt', color: 'success' },
  REJECTED: { label: 'Từ chối', color: 'error' },
  WITHDRAWN: { label: 'Rút lui', color: 'default' },
};

// ─── Season Team Panel (expandable row) ───
function SeasonTeamPanel({ seasonId }: { seasonId: string }) {
  const { t } = useTranslation();
  const [teams, setTeams] = useState<SeasonTeam[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const [seasonTeams, teamRes] = await Promise.all([
        apiGetSeasonTeams(seasonId),
        apiGetTeams(),
      ]);
      setTeams(seasonTeams);
      setAllTeams(teamRes.data);
    } catch (_err) {
      message.error(t('seasons.teamPanelLoadError'));
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const registeredTeamIds = new Set(teams.map((t) => t.teamId));
  const availableTeams = allTeams.filter(
    (t) => !registeredTeamIds.has(t.id) && t.status === 'ACTIVE',
  );

  const handleAdd = async () => {
    if (!selectedTeamId) return;
    setAdding(true);
    try {
      await apiRegisterTeam(seasonId, selectedTeamId);
      message.success(t('seasons.teamPanelRegSuccess'));
      setSelectedTeamId(undefined);
      fetchTeams();
    } catch (_err) {
      message.error(t('seasons.teamPanelRegError'));
    } finally {
      setAdding(false);
    }
  };

  const handleStatus = async (teamId: string, status: string) => {
    try {
      await apiUpdateSeasonTeamStatus(seasonId, teamId, status);
      message.success(t('seasons.teamPanelStatusSuccess'));
      fetchTeams();
    } catch (_err) {
      message.error(t('seasons.teamPanelStatusError'));
    }
  };

  const handleRemove = async (teamId: string) => {
    try {
      await apiRemoveSeasonTeam(seasonId, teamId);
      message.success(t('seasons.teamPanelRemoveSuccess'));
      fetchTeams();
    } catch (_err) {
      message.error(t('seasons.teamPanelRemoveError'));
    }
  };

  const cols: ColumnsType<SeasonTeam> = [
    {
      title: t('seasons.teamPanelColTeam'),
      key: 'team',
      render: (_, r) => (
        <Space size={6}>
          {r.team.logoUrl && (
            <img
              src={r.team.logoUrl}
              alt=""
              style={{ width: 20, height: 20, objectFit: 'contain' }}
            />
          )}
          <strong>{r.team.name}</strong>
          {r.team.shortName && <span style={{ color: '#888' }}>({r.team.shortName})</span>}
        </Space>
      ),
    },
    {
      title: t('seasons.teamPanelColCity'),
      key: 'city',
      width: 140,
      render: (_, r) => r.team.city ?? '—',
    },
    {
      title: t('seasons.teamPanelColStatus'),
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (s: string) => {
        const m = TEAM_STATUS_MAP[s] ?? { label: s, color: 'default' };
        return <Tag color={m.color}>{m.label}</Tag>;
      },
    },
    {
      title: t('seasons.teamPanelColRegDate'),
      dataIndex: 'registeredAt',
      width: 120,
      render: (d: string) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: '',
      key: 'actions',
      width: 140,
      render: (_, r) => (
        <Space size={4}>
          {r.status === 'REGISTERED' && (
            <>
              <Tooltip title={t('seasons.teamPanelApproveTooltip')}>
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  style={{ color: '#52c41a' }}
                  onClick={() => handleStatus(r.teamId, 'APPROVED')}
                />
              </Tooltip>
              <Tooltip title={t('seasons.teamPanelRejectTooltip')}>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  danger
                  onClick={() => handleStatus(r.teamId, 'REJECTED')}
                />
              </Tooltip>
            </>
          )}
          <Popconfirm
            title={t('seasons.teamPanelRemoveConfirm')}
            onConfirm={() => handleRemove(r.teamId)}
            okText={t('seasons.deleteOk')}
            cancelText={t('seasons.deleteCancel')}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Typography.Text strong>
          <TeamOutlined />{' '}
          {t('seasons.teamPanelTitle', {
            approved: teams.filter((t) => t.status === 'APPROVED').length,
            total: teams.length,
          })}
        </Typography.Text>
        <Space>
          <Select
            value={selectedTeamId}
            onChange={setSelectedTeamId}
            placeholder={t('seasons.teamPanelAddPlaceholder')}
            style={{ width: 250 }}
            allowClear
            showSearch
            optionFilterProp="label"
            options={availableTeams.map((t) => ({
              value: t.id,
              label: `${t.name}${t.shortName ? ` (${t.shortName})` : ''}`,
            }))}
          />
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            disabled={!selectedTeamId}
            loading={adding}
            onClick={handleAdd}
          >
            {t('seasons.teamPanelAddBtn')}
          </Button>
        </Space>
      </Flex>
      <Table
        columns={cols}
        dataSource={teams}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="small"
        locale={{ emptyText: t('seasons.teamPanelEmpty') }}
      />
    </div>
  );
}

export default function SeasonsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const yearOptions = generateYearOptions();

  const fetchSeasons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetSeasons();
      setSeasons(data);
    } catch (_err) {
      message.error(t('seasons.loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    const currentYear = new Date().getFullYear();
    form.setFieldsValue({
      year: currentYear,
      name: `VLeague ${currentYear}/${currentYear + 1}`,
      status: 'UPCOMING',
    });
    setModalOpen(true);
  };

  const openEdit = (season: Season) => {
    setEditing(season);
    form.setFieldsValue({
      name: season.name,
      year: season.year,
      status: season.status,
      startDate: season.startDate ? dayjs(season.startDate) : undefined,
      endDate: season.endDate ? dayjs(season.endDate) : undefined,
    });
    setModalOpen(true);
  };

  const handleYearChange = (year: number) => {
    if (!editing) {
      form.setFieldValue('name', `VLeague ${year}/${year + 1}`);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (
        values.startDate &&
        values.endDate &&
        (values.startDate as dayjs.Dayjs).isAfter(values.endDate as dayjs.Dayjs, 'day')
      ) {
        form.setFields([
          {
            name: 'startDate',
            errors: ['Ngày bắt đầu không được sau ngày kết thúc'],
          },
          {
            name: 'endDate',
            errors: ['Ngày kết thúc phải sau hoặc bằng ngày bắt đầu'],
          },
        ]);
        message.error('Ngày bắt đầu không được sau ngày kết thúc');
        return;
      }

      setSaving(true);

      const payload: CreateSeasonPayload = {
        name: values.name,
        year: values.year,
        status: values.status,
        startDate: values.startDate ? values.startDate.toISOString() : undefined,
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
      };

      if (editing) {
        await apiUpdateSeason(editing.id, payload);
        message.success(t('seasons.updateSuccess'));
      } else {
        await apiCreateSeason(payload);
        message.success(t('seasons.createSuccess'));
      }

      setModalOpen(false);
      fetchSeasons();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(t('seasons.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteSeason(id);
      message.success(t('seasons.deleteSuccess'));
      fetchSeasons();
    } catch (_err) {
      message.error(t('seasons.deleteError'));
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiUpdateSeasonStatus(id, status);
      message.success(t('seasons.statusUpdateSuccess'));
      fetchSeasons();
    } catch (_err) {
      message.error(t('seasons.statusUpdateError'));
    }
  };

  const columns: ColumnsType<Season> = [
    {
      title: t('seasons.colName'),
      dataIndex: 'name',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: t('seasons.colYear'),
      dataIndex: 'year',
      width: 120,
      align: 'center',
      render: (year: number) => `${year}/${year + 1}`,
    },
    {
      title: t('seasons.colStatus'),
      dataIndex: 'status',
      width: 150,
      align: 'center',
      render: (status: string, record: Season) => {
        const s = STATUS_OPTIONS.find((o) => o.value === status);
        if (isAdmin) {
          return (
            <Select
              value={status}
              onChange={(v) => handleStatusChange(record.id, v)}
              size="small"
              style={{ width: 130 }}
              options={STATUS_OPTIONS.map((o) => ({
                value: o.value,
                label: <Tag color={o.color}>{o.label}</Tag>,
              }))}
            />
          );
        }
        return <Tag color={s?.color}>{s?.label ?? status}</Tag>;
      },
    },
    {
      title: t('seasons.colStartDate'),
      dataIndex: 'startDate',
      width: 140,
      render: (d: string | null) =>
        d ? (
          <Flex align="center" gap={4}>
            <CalendarOutlined style={{ color: '#1677ff', fontSize: 12 }} />
            {dayjs(d).format('DD/MM/YYYY')}
          </Flex>
        ) : (
          <span style={{ color: '#ccc' }}>{t('seasons.notSet')}</span>
        ),
    },
    {
      title: t('seasons.colEndDate'),
      dataIndex: 'endDate',
      width: 140,
      render: (d: string | null) =>
        d ? (
          dayjs(d).format('DD/MM/YYYY')
        ) : (
          <span style={{ color: '#ccc' }}>{t('seasons.notSet')}</span>
        ),
    },
    ...(isAdmin
      ? [
          {
            title: '',
            key: 'actions',
            width: 80,
            render: (_: unknown, record: Season) => (
              <Space size="small">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => openEdit(record)}
                />
                <Popconfirm
                  title={t('seasons.deleteConfirmTitle')}
                  description={t('seasons.deleteConfirmDesc')}
                  onConfirm={() => handleDelete(record.id)}
                  okText={t('seasons.deleteOk')}
                  cancelText={t('seasons.deleteCancel')}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <Card>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('seasons.title')}
        </Typography.Title>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {t('seasons.createBtn')}
          </Button>
        )}
      </Flex>

      <Table
        columns={columns}
        dataSource={seasons}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
        expandable={
          isAdmin
            ? {
                expandedRowRender: (record) => <SeasonTeamPanel seasonId={record.id} />,
                expandRowByClick: false,
              }
            : undefined
        }
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editing ? t('seasons.modalEditTitle') : t('seasons.modalCreateTitle')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? t('common.save') : t('common.create')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="year"
            label={t('seasons.formYear')}
            rules={[{ required: true, message: t('seasons.formYearRequired') }]}
          >
            <Select
              options={yearOptions}
              size="large"
              onChange={handleYearChange}
              placeholder={t('seasons.formYearPlaceholder')}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label={t('seasons.formName')}
            rules={[{ required: true, message: t('seasons.formNameRequired') }]}
          >
            <Input placeholder={t('seasons.formNamePlaceholder')} />
          </Form.Item>

          <Form.Item name="status" label={t('seasons.formStatus')} initialValue="UPCOMING">
            <Select options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
          </Form.Item>

          <Flex gap={16}>
            <Form.Item name="startDate" label={t('seasons.formStartDate')} style={{ flex: 1 }}>
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                placeholder={t('seasons.formStartDatePlaceholder')}
              />
            </Form.Item>
            <Form.Item name="endDate" label={t('seasons.formEndDate')} style={{ flex: 1 }}>
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                placeholder={t('seasons.formEndDatePlaceholder')}
              />
            </Form.Item>
          </Flex>
        </Form>
      </Modal>
    </Card>
  );
}
