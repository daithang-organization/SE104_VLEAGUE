import {
  CalendarOutlined,
  EditOutlined,
  ReloadOutlined,
  SendOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Collapse,
  DatePicker,
  Flex,
  Form,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { apiUpdateMatch } from '../services/matchApi';
import {
  apiGenerateSchedule,
  apiGetSchedule,
  apiPublishSchedule,
  type ScheduleMatch,
} from '../services/scheduleApi';
import { apiGetSeasons, type Season } from '../services/seasonApi';
import { apiGetStadiums, type Stadium } from '../services/teamApi';
import { STATUS_MAP } from '../utils/constants';
import { getTeamLogoUrl } from '../utils/teamLogos';

export default function SchedulePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [matches, setMatches] = useState<ScheduleMatch[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeLeg, setActiveLeg] = useState<string>('all');

  // Edit modal
  const [editingMatch, setEditingMatch] = useState<ScheduleMatch | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // Generate modal
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateSeasonId, setGenerateSeasonId] = useState<string | undefined>();

  const isAdmin = user?.role === 'ADMIN';

  // Fetch seasons + stadiums on mount
  useEffect(() => {
    apiGetSeasons()
      .then((list) => {
        setSeasons(list);
        const active = list.find((s) => s.status === 'IN_PROGRESS' || s.status === 'UPCOMING');
        if (active) setSelectedSeasonId(active.id);
        else if (list.length > 0) setSelectedSeasonId(list[0].id);
      })
      .catch(() => {});
    apiGetStadiums()
      .then(setStadiums)
      .catch(() => {});
  }, []);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetSchedule(selectedSeasonId);
      setMatches(data.matches ?? []);
    } catch (_err) {
      message.error(t('schedule.loadError'));
    } finally {
      setLoading(false);
    }
  }, [selectedSeasonId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const openGenerateModal = () => {
    setGenerateSeasonId(selectedSeasonId);
    setGenerateModalOpen(true);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await apiGenerateSchedule(generateSeasonId);
      message.success(result.message || t('schedule.generateSuccess'));
      // Switch to the generated season view
      if (generateSeasonId && generateSeasonId !== selectedSeasonId) {
        setSelectedSeasonId(generateSeasonId);
      }
      setGenerateModalOpen(false);
      fetchSchedule();
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || t('schedule.generateError'));
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const result = await apiPublishSchedule(selectedSeasonId);
      message.success(result.message || t('schedule.publishSuccess'));
      fetchSchedule();
    } catch (_err) {
      message.error(t('schedule.publishError'));
    } finally {
      setPublishing(false);
    }
  };

  // Edit match
  const openEditModal = (match: ScheduleMatch) => {
    setEditingMatch(match);
    form.setFieldsValue({
      stadiumId: match.stadiumId || undefined,
      kickoffAt: match.kickoffAt ? dayjs(match.kickoffAt) : null,
    });
    setEditModalOpen(true);
  };

  const handleSaveMatch = async () => {
    if (!editingMatch) return;
    setSaving(true);
    try {
      const values = form.getFieldsValue();
      await apiUpdateMatch(editingMatch.id, {
        stadiumId: values.stadiumId || null,
        kickoffAt: values.kickoffAt ? (values.kickoffAt as dayjs.Dayjs).toISOString() : null,
      });
      message.success(t('schedule.matchUpdateSuccess'));
      setEditModalOpen(false);
      fetchSchedule();
    } catch (_err) {
      message.error(t('schedule.matchUpdateError'));
    } finally {
      setSaving(false);
    }
  };

  // Filter by leg
  const filteredMatches = useMemo(() => {
    if (activeLeg === 'all') return matches;
    return matches.filter((m) => m.leg === Number(activeLeg));
  }, [matches, activeLeg]);

  // Group matches by round
  const roundGroups = useMemo(() => {
    const map = new Map<number, ScheduleMatch[]>();
    filteredMatches.forEach((m) => {
      const list = map.get(m.roundNo) ?? [];
      list.push(m);
      map.set(m.roundNo, list);
    });
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [filteredMatches]);

  // Stats
  const totalMatches = matches.length;
  const draftCount = matches.filter((m) => m.status === 'DRAFT').length;

  // Compact columns for per-round table
  const roundColumns: ColumnsType<ScheduleMatch> = [
    {
      title: t('schedule.colLeg'),
      dataIndex: 'leg',
      width: 80,
      render: (leg: number) => (
        <Tag color={leg === 1 ? 'blue' : 'volcano'} style={{ margin: 0 }}>
          {leg === 1 ? t('common.leg1') : t('common.leg2')}
        </Tag>
      ),
    },
    {
      title: t('schedule.colHome'),
      key: 'home',
      width: '20%',
      render: (_, r) => {
        const logoUrl = getTeamLogoUrl(r.homeTeam);
        const teamName = r.homeTeam?.name || r.homeTeamId.slice(0, 8);
        return (
          <strong
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            {teamName}
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${teamName} logo`}
                style={{ width: 22, height: 22, objectFit: 'contain', flex: '0 0 auto' }}
              />
            )}
          </strong>
        );
      },
    },
    {
      title: t('schedule.colScore'),
      key: 'score',
      width: 80,
      align: 'center',
      render: (_, r) => {
        if (r.homeScore == null && r.awayScore == null)
          return <span style={{ color: '#bbb' }}>vs</span>;
        return (
          <strong>
            {r.homeScore ?? 0} – {r.awayScore ?? 0}
          </strong>
        );
      },
    },
    {
      title: t('schedule.colAway'),
      key: 'away',
      width: '22%',
      render: (_, r) => {
        const logoUrl = getTeamLogoUrl(r.awayTeam);
        const teamName = r.awayTeam?.name || r.awayTeamId.slice(0, 8);
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${teamName} logo`}
                style={{ width: 22, height: 22, objectFit: 'contain', flex: '0 0 auto' }}
              />
            )}
            {teamName}
          </span>
        );
      },
    },
    {
      title: t('schedule.colStadium'),
      key: 'stadium',
      render: (_, r) =>
        r.stadium?.name ? (
          <span style={{ fontSize: 13 }}>{r.stadium.name}</span>
        ) : (
          <span style={{ color: '#ccc', fontSize: 13 }}>{t('schedule.stadiumNotSet')}</span>
        ),
    },
    {
      title: t('schedule.colKickoff'),
      dataIndex: 'kickoffAt',
      width: 150,
      render: (v: string | null) =>
        v ? (
          <Flex align="center" gap={4}>
            <CalendarOutlined style={{ color: '#1677ff', fontSize: 12 }} />
            <span style={{ fontSize: 13 }}>{dayjs(v).format('DD/MM/YYYY HH:mm')}</span>
          </Flex>
        ) : (
          <span style={{ color: '#ccc', fontSize: 13 }}>{t('schedule.kickoffNotSet')}</span>
        ),
    },
    {
      title: t('schedule.colStatus'),
      dataIndex: 'status',
      width: 90,
      render: (status: string) => {
        const s = STATUS_MAP[status] ?? { label: status, color: 'default' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    ...(isAdmin
      ? [
          {
            title: '',
            key: 'actions',
            width: 40,
            render: (_: unknown, r: ScheduleMatch) => (
              <Tooltip title={t('schedule.editTooltip')}>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(r);
                  }}
                />
              </Tooltip>
            ),
          } as const,
        ]
      : []),
  ];

  // Build Collapse items for each round
  const collapseItems = roundGroups.map(([roundNo, roundMatches]) => {
    // Get date range for the round
    const dates = roundMatches.filter((m) => m.kickoffAt).map((m) => dayjs(m.kickoffAt!));
    const dateLabel =
      dates.length > 0 ? dates.reduce((a, b) => (a.isBefore(b) ? a : b)).format('DD/MM/YYYY') : '';

    const finishedCount = roundMatches.filter((m) => m.status === 'FINISHED').length;
    const allFinished = finishedCount === roundMatches.length;

    return {
      key: `round-${roundNo}`,
      label: (
        <Flex align="center" gap={12} style={{ width: '100%' }}>
          <Badge
            count={`V${roundNo}`}
            style={{
              backgroundColor: allFinished ? '#52c41a' : '#1677ff',
              fontWeight: 600,
              fontSize: 13,
              minWidth: 36,
            }}
          />
          <Typography.Text strong style={{ fontSize: 15 }}>
            {t('schedule.roundLabel', { round: roundNo })}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            {t('schedule.roundMatches', { count: roundMatches.length })}
            {dateLabel ? ` · ${dateLabel}` : ''}
          </Typography.Text>
          {allFinished && (
            <Tag color="green" style={{ marginLeft: 'auto' }}>
              {t('schedule.roundFinished')}
            </Tag>
          )}
          {finishedCount > 0 && !allFinished && (
            <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
              {t('schedule.roundProgress', { finished: finishedCount, total: roundMatches.length })}
            </Typography.Text>
          )}
        </Flex>
      ),
      children: (
        <Table
          columns={roundColumns}
          dataSource={roundMatches}
          rowKey="id"
          pagination={false}
          size="small"
          showHeader={false}
          style={{ margin: -12 }}
        />
      ),
    };
  });

  return (
    <Card>
      {/* Header */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={8} style={{ marginBottom: 16 }}>
        <Space>
          <TrophyOutlined style={{ fontSize: 22, color: '#faad14' }} />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('schedule.title')}
          </Typography.Title>
          {seasons.length > 0 && (
            <Select
              value={selectedSeasonId}
              onChange={(v) => setSelectedSeasonId(v)}
              style={{ width: 200 }}
              placeholder={t('schedule.seasonPlaceholder')}
              options={seasons.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.year}/${s.year + 1})`,
              }))}
            />
          )}
          {totalMatches > 0 && (
            <Typography.Text type="secondary">
              {t('schedule.matchCount', { total: totalMatches })}
              {draftCount > 0 ? ` · ${t('schedule.draftCount', { count: draftCount })}` : ''}
            </Typography.Text>
          )}
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchSchedule} loading={loading}>
            {t('schedule.reloadBtn')}
          </Button>
          {isAdmin && (
            <>
              <Button
                icon={<ThunderboltOutlined />}
                onClick={openGenerateModal}
                loading={generating}
              >
                {t('schedule.generateBtn')}
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handlePublish}
                loading={publishing}
                disabled={draftCount === 0}
              >
                {t('schedule.publishBtn')}
              </Button>
            </>
          )}
        </Space>
      </Flex>

      {/* Leg tabs */}
      <Tabs
        activeKey={activeLeg}
        onChange={setActiveLeg}
        items={[
          { key: 'all', label: t('schedule.tabAll', { count: matches.length }) },
          {
            key: '1',
            label: t('schedule.tabLeg1', { count: matches.filter((m) => m.leg === 1).length }),
          },
          {
            key: '2',
            label: t('schedule.tabLeg2', { count: matches.filter((m) => m.leg === 2).length }),
          },
        ]}
        style={{ marginBottom: 12 }}
      />

      {/* Rounds grouped by Collapse */}
      <Spin spinning={loading} tip={t('common.loading')}>
        {roundGroups.length === 0 && !loading ? (
          <Flex justify="center" align="center" style={{ padding: 48, color: '#999' }}>
            <Typography.Text type="secondary" style={{ fontSize: 15 }}>
              {t('schedule.emptySchedule')}
            </Typography.Text>
          </Flex>
        ) : (
          <Collapse
            items={collapseItems}
            expandIconPosition="end"
            style={{ background: 'transparent', border: 'none' }}
            size="small"
          />
        )}
      </Spin>

      {/* Edit Match Modal */}
      <Modal
        title={
          editingMatch
            ? t('schedule.editModalTitleSpecific', {
                home: editingMatch.homeTeam?.name ?? '?',
                away: editingMatch.awayTeam?.name ?? '?',
                round: editingMatch.roundNo,
              })
            : t('schedule.editModalTitle')
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSaveMatch}
        confirmLoading={saving}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="stadiumId" label={t('schedule.formStadium')}>
            <Select
              placeholder={t('schedule.formStadiumPlaceholder')}
              allowClear
              showSearch
              optionFilterProp="label"
              options={stadiums.map((s) => ({
                value: s.id,
                label: `${s.name}${s.city ? ` (${s.city})` : ''}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="kickoffAt" label={t('schedule.formKickoff')}>
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder={t('schedule.formKickoffPlaceholder')}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Generate Schedule Modal */}
      <Modal
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#faad14' }} />
            <span>{t('schedule.generateModalTitle')}</span>
          </Space>
        }
        open={generateModalOpen}
        onCancel={() => setGenerateModalOpen(false)}
        onOk={handleGenerate}
        confirmLoading={generating}
        okText={t('schedule.generateModalOk')}
        cancelText={t('common.cancel')}
        okButtonProps={{ type: 'primary', icon: <ThunderboltOutlined /> }}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text>{t('schedule.generateModalDesc')}</Typography.Text>
        </div>
        <Select
          value={generateSeasonId}
          onChange={(v) => setGenerateSeasonId(v)}
          style={{ width: '100%', marginBottom: 16 }}
          placeholder={t('schedule.generateModalSeasonPlaceholder')}
          size="large"
          options={seasons.map((s) => ({
            value: s.id,
            label: `${s.name} (${s.year}/${s.year + 1})`,
          }))}
        />
        <div
          style={{
            background: '#fffbe6',
            border: '1px solid #ffe58f',
            borderRadius: 8,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <WarningOutlined style={{ color: '#faad14', fontSize: 16 }} />
          <Typography.Text style={{ fontSize: 13 }}>
            {t('schedule.generateModalWarning')}
          </Typography.Text>
        </div>
      </Modal>
    </Card>
  );
}
