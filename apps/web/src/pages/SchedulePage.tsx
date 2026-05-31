import {
  CalendarOutlined,
  EditOutlined,
  LeftOutlined,
  ReloadOutlined,
  RightOutlined,
  SendOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Flex,
  Form,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AppMenuIcon, MatchFixtureCard, PageCover } from '../components';
import { apiUpdateMatch } from '../services/matchApi';
import {
  apiGenerateSchedule,
  apiGetSchedule,
  apiPublishSchedule,
  type ScheduleMatch,
} from '../services/scheduleApi';
import { apiGetCurrentSeason, apiGetSeasons, type Season } from '../services/seasonApi';
import { apiGetTeamManagerManagedTeam } from '../services/teamManagerApi';
import { apiGetStadiums, type Stadium } from '../services/teamApi';
import { STATUS_MAP } from '../utils/constants';

function formatScheduleDateLabel(kickoffAt?: string | null) {
  if (!kickoffAt) return 'Chưa xếp lịch';
  const date = dayjs(kickoffAt);
  const weekday = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][date.day()];
  return `${weekday}, ${date.format('D/M')}`;
}

function compareMatchesByKickoff(a: ScheduleMatch, b: ScheduleMatch) {
  if (!a.kickoffAt && !b.kickoffAt) return a.id.localeCompare(b.id);
  if (!a.kickoffAt) return 1;
  if (!b.kickoffAt) return -1;

  const timeDiff = new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();
  return timeDiff || a.id.localeCompare(b.id);
}

export default function SchedulePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<ScheduleMatch[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeLeg, setActiveLeg] = useState<string>('all');
  const [activeRoundNo, setActiveRoundNo] = useState<number | undefined>();
  const [managedTeamId, setManagedTeamId] = useState<string | null>(null);

  // Edit modal
  const [editingMatch, setEditingMatch] = useState<ScheduleMatch | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // Generate modal
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateSeasonId, setGenerateSeasonId] = useState<string | undefined>();

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'TEAM_MANAGER';

  // Fetch seasons + stadiums on mount
  useEffect(() => {
    Promise.all([apiGetSeasons(), apiGetCurrentSeason().catch(() => null)])
      .then(([list, current]) => {
        setSeasons(list);
        const active = current ?? list.find((s) => s.status === 'IN_PROGRESS');
        if (active) setSelectedSeasonId(active.id);
        else if (list.length > 0) setSelectedSeasonId(list[0].id);
      })
      .catch(() => {});
    apiGetStadiums()
      .then(setStadiums)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!isManager) {
      setManagedTeamId(null);
      return () => {
        cancelled = true;
      };
    }

    apiGetTeamManagerManagedTeam()
      .then((team) => {
        if (!cancelled) setManagedTeamId(team?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setManagedTeamId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isManager]);

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
  }, [selectedSeasonId, t]);

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

  useEffect(() => {
    if (isManager && (activeLeg === '1' || activeLeg === '2')) {
      setActiveLeg('all');
    } else if (!isManager && activeLeg === 'mine') {
      setActiveLeg('all');
    }
  }, [activeLeg, isManager]);

  const managerMatches = useMemo(() => {
    if (!managedTeamId) return [];
    return matches.filter(
      (match) => match.homeTeamId === managedTeamId || match.awayTeamId === managedTeamId,
    );
  }, [managedTeamId, matches]);

  // Filter by selected schedule tab.
  const filteredMatches = useMemo(() => {
    if (isManager && activeLeg === 'mine') return managerMatches;
    if (activeLeg === 'all') return matches;
    return matches.filter((m) => m.leg === Number(activeLeg));
  }, [activeLeg, isManager, managerMatches, matches]);

  const scheduleTabItems = useMemo(() => {
    if (isManager) {
      return [
        { key: 'all', label: t('schedule.tabAll', { count: matches.length }) },
        {
          key: 'mine',
          label: t('schedule.tabMine', { count: managerMatches.length }),
        },
      ];
    }

    return [
      { key: 'all', label: t('schedule.tabAll', { count: matches.length }) },
      {
        key: '1',
        label: t('schedule.tabLeg1', { count: matches.filter((m) => m.leg === 1).length }),
      },
      {
        key: '2',
        label: t('schedule.tabLeg2', { count: matches.filter((m) => m.leg === 2).length }),
      },
    ];
  }, [isManager, managerMatches.length, matches, t]);

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

  useEffect(() => {
    if (roundGroups.length === 0) {
      setActiveRoundNo(undefined);
      return;
    }
    if (!activeRoundNo || !roundGroups.some(([roundNo]) => roundNo === activeRoundNo)) {
      setActiveRoundNo(roundGroups[0][0]);
    }
  }, [activeRoundNo, roundGroups]);

  const activeRoundIndex = roundGroups.findIndex(([roundNo]) => roundNo === activeRoundNo);
  const activeRound = activeRoundIndex >= 0 ? roundGroups[activeRoundIndex] : undefined;
  const activeRoundMatches = useMemo(() => activeRound?.[1] ?? [], [activeRound]);
  const activeRoundDates = activeRoundMatches
    .filter((m) => m.kickoffAt)
    .map((m) => dayjs(m.kickoffAt!));
  const activeRoundDateLabel =
    activeRoundDates.length > 0
      ? activeRoundDates.reduce((a, b) => (a.isBefore(b) ? a : b)).format('DD/MM/YYYY')
      : '';
  const activeRoundFinishedCount = activeRoundMatches.filter((m) => m.status === 'FINISHED').length;
  const activeRoundMatchGroups = useMemo(() => {
    const map = new Map<string, ScheduleMatch[]>();
    [...activeRoundMatches].sort(compareMatchesByKickoff).forEach((match) => {
      const key = match.kickoffAt ? dayjs(match.kickoffAt).format('YYYY-MM-DD') : 'unscheduled';
      const list = map.get(key) ?? [];
      list.push(match);
      map.set(key, list);
    });

    return [...map.entries()].sort(([a], [b]) => {
      if (a === 'unscheduled') return 1;
      if (b === 'unscheduled') return -1;
      return a.localeCompare(b);
    });
  }, [activeRoundMatches]);

  // Stats
  const totalMatches = matches.length;
  const draftCount = matches.filter((m) => m.status === 'DRAFT').length;
  const scheduledCount = matches.filter((m) => m.kickoffAt).length;

  const renderScheduleFixture = (match: ScheduleMatch) => {
    const status = STATUS_MAP[match.status] ?? { label: match.status, color: 'default' };

    return (
      <MatchFixtureCard
        key={match.id}
        id={match.id}
        roundLabel={t('schedule.roundLabel', { round: match.roundNo })}
        statusLabel={status.label}
        statusColor={status.color}
        homeTeamId={match.homeTeamId}
        awayTeamId={match.awayTeamId}
        homeTeam={match.homeTeam}
        awayTeam={match.awayTeam}
        homeScore={match.homeScore}
        awayScore={match.awayScore}
        kickoffAt={match.kickoffAt}
        stadiumName={match.stadium?.name}
        stadiumFallback={t('schedule.stadiumNotSet')}
        kickoffFallback={t('schedule.kickoffNotSet')}
        onTeamClick={(teamId) => navigate(`/teams/${teamId}`)}
        onMatchClick={(matchId) => navigate(`/matches/${matchId}`)}
        actions={
          isAdmin ? (
            <Tooltip title={t('schedule.editTooltip')}>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEditModal(match)}
              />
            </Tooltip>
          ) : null
        }
      />
    );
  };

  return (
    <div className="page-stack">
      <PageCover
        eyebrow={t('menu.schedule')}
        title={t('schedule.title')}
        description={t('schedule.subtitle')}
        icon={<AppMenuIcon menuKey="schedule" />}
        metrics={[
          {
            label: t('common.total'),
            value: totalMatches.toLocaleString('vi-VN'),
            icon: <TrophyOutlined />,
          },
          {
            label: t('status.DRAFT'),
            value: draftCount.toLocaleString('vi-VN'),
            icon: <WarningOutlined />,
          },
          {
            label: t('schedule.formKickoff'),
            value: scheduledCount.toLocaleString('vi-VN'),
            icon: <CalendarOutlined />,
          },
        ]}
      />

      <div className="page-toolbar">
        <Space wrap>
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
          <Button icon={<ReloadOutlined />} onClick={fetchSchedule} loading={loading}>
            {t('schedule.reloadBtn')}
          </Button>
        </Space>
        {isAdmin && (
          <Space wrap>
            <Button icon={<ThunderboltOutlined />} onClick={openGenerateModal} loading={generating}>
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
          </Space>
        )}
      </div>

      <Card className="schedule-page-card">
        {/* Schedule tabs */}
        <Tabs
          activeKey={activeLeg}
          onChange={setActiveLeg}
          items={scheduleTabItems}
          style={{ marginBottom: 12 }}
        />

        {/* Round navigator */}
        <Spin spinning={loading} tip={t('common.loading')}>
          {roundGroups.length === 0 && !loading ? (
            <Flex justify="center" align="center" style={{ padding: 48, color: '#999' }}>
              <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                {t('schedule.emptySchedule')}
              </Typography.Text>
            </Flex>
          ) : (
            <div>
              <Flex justify="center" align="center" gap={18} style={{ margin: '12px 0 20px' }}>
                <Button
                  shape="circle"
                  size="large"
                  icon={<LeftOutlined />}
                  disabled={activeRoundIndex <= 0}
                  onClick={() => setActiveRoundNo(roundGroups[activeRoundIndex - 1][0])}
                />
                <div style={{ minWidth: 220, textAlign: 'center' }}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {activeRound
                      ? t('schedule.roundLabel', { round: activeRound[0] })
                      : t('schedule.title')}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {activeRound
                      ? `${t('schedule.roundMatches', { count: activeRoundMatches.length })}${
                          activeRoundDateLabel ? ` · ${activeRoundDateLabel}` : ''
                        } · ${t('schedule.roundProgress', {
                          finished: activeRoundFinishedCount,
                          total: activeRoundMatches.length,
                        })}`
                      : ''}
                  </Typography.Text>
                </div>
                <Button
                  shape="circle"
                  size="large"
                  icon={<RightOutlined />}
                  disabled={activeRoundIndex < 0 || activeRoundIndex >= roundGroups.length - 1}
                  onClick={() => setActiveRoundNo(roundGroups[activeRoundIndex + 1][0])}
                />
              </Flex>
              <div className="schedule-fixture-list">
                {activeRoundMatchGroups.map(([dayKey, dayMatches]) => (
                  <div key={dayKey} className="schedule-fixture-day-group">
                    <Typography.Title level={5} className="schedule-fixture-date">
                      {formatScheduleDateLabel(dayMatches[0]?.kickoffAt)}
                    </Typography.Title>
                    <div className="schedule-fixture-day-list">
                      {dayMatches.map((match) => renderScheduleFixture(match))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Spin>
      </Card>

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
    </div>
  );
}
