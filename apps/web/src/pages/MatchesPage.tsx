import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Collapse,
  Descriptions,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  apiAddMatchEvent,
  apiGetMatch,
  apiGetMatches,
  apiGetTeamRoster,
  apiUpdateMatch,
  apiUpdateMatchStatus,
  type AddMatchEventPayload,
  type Match,
  type MatchEvent,
  type RosterPlayer,
} from '../services/matchApi';
import { apiGetSeasons, type Season } from '../services/seasonApi';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'default' },
  PUBLISHED: { label: 'Đã công bố', color: 'blue' },
  LOCKED: { label: 'Đã khóa', color: 'orange' },
  FINISHED: { label: 'Kết thúc', color: 'green' },
  POSTPONED: { label: 'Hoãn', color: 'red' },
};

const EVENT_TYPE_MAP: Record<string, { label: string; color: string; icon: string }> = {
  GOAL: { label: 'Bàn thắng', color: 'green', icon: '⚽' },
  OWN_GOAL: { label: 'Phản lưới', color: 'red', icon: '⚽🔴' },
  PENALTY: { label: 'Phạt đền (ghi bàn)', color: 'green', icon: '⚽🎯' },
  PENALTY_MISS: { label: 'Phạt đền (hỏng)', color: 'orange', icon: '❌🎯' },
  YELLOW_CARD: { label: 'Thẻ vàng', color: 'gold', icon: '🟨' },
  RED_CARD: { label: 'Thẻ đỏ', color: 'red', icon: '🟥' },
  SUBSTITUTION: { label: 'Thay người', color: 'blue', icon: '🔄' },
};

const CAN_EDIT_ROLES = ['ADMIN', 'REFEREE'];

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');

  // Detail modal
  const [detailMatch, setDetailMatch] = useState<Match | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Score edit
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [scoreForm] = Form.useForm();
  const [savingScore, setSavingScore] = useState(false);

  // Event modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventForm] = Form.useForm();

  // Roster state
  const [selectedTeamSide, setSelectedTeamSide] = useState<'home' | 'away' | null>(null);
  const [homeRoster, setHomeRoster] = useState<RosterPlayer[]>([]);
  const [awayRoster, setAwayRoster] = useState<RosterPlayer[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const canEdit = useMemo(() => user?.role && CAN_EDIT_ROLES.includes(user.role), [user]);

  // Fetch seasons
  useEffect(() => {
    apiGetSeasons().then((data) => {
      setSeasons(data);
      if (data.length > 0) setSelectedSeasonId(data[0].id);
    });
  }, []);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetMatches(selectedSeasonId, 1, 200);
      setMatches(res.data);
    } catch {
      message.error('Không thể tải danh sách trận đấu');
    } finally {
      setLoading(false);
    }
  }, [selectedSeasonId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // ── Group matches by round, filter by search ──
  const filteredAndGrouped = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    const filtered = q
      ? matches.filter(
          (m) =>
            m.homeTeam?.name?.toLowerCase().includes(q) ||
            m.awayTeam?.name?.toLowerCase().includes(q),
        )
      : matches;

    const grouped = new Map<number, Match[]>();
    for (const m of filtered) {
      const round = m.roundNo ?? 0;
      if (!grouped.has(round)) grouped.set(round, []);
      grouped.get(round)!.push(m);
    }
    return Array.from(grouped.entries()).sort(([a], [b]) => a - b);
  }, [matches, searchText]);

  // Find which rounds contain the search match to auto-open
  const activeKeys = useMemo(() => {
    if (searchText.trim()) {
      return filteredAndGrouped.map(([roundNo]) => String(roundNo));
    }
    // By default open all rounds that have unfinished matches
    const keys: string[] = [];
    for (const [roundNo, roundMatches] of filteredAndGrouped) {
      if (roundMatches.some((m) => m.status !== 'FINISHED')) {
        keys.push(String(roundNo));
        if (keys.length >= 2) break; // Only auto-open first 2 unfinished rounds
      }
    }
    return keys.length > 0 ? keys : filteredAndGrouped.slice(0, 1).map(([r]) => String(r));
  }, [filteredAndGrouped, searchText]);

  const loadRosters = async (match: Match) => {
    setRosterLoading(true);
    try {
      const [home, away] = await Promise.all([
        apiGetTeamRoster(match.homeTeamId),
        apiGetTeamRoster(match.awayTeamId),
      ]);
      setHomeRoster(home.players ?? []);
      setAwayRoster(away.players ?? []);
    } catch {
      setHomeRoster([]);
      setAwayRoster([]);
    } finally {
      setRosterLoading(false);
    }
  };

  const viewDetail = async (matchId: string) => {
    setDetailLoading(true);
    try {
      const data = await apiGetMatch(matchId);
      setDetailMatch(data);
      loadRosters(data);
    } catch {
      message.error('Không thể tải chi tiết trận đấu');
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Score update ──
  const openScoreModal = () => {
    if (!detailMatch) return;
    scoreForm.setFieldsValue({
      homeScore: detailMatch.homeScore ?? 0,
      awayScore: detailMatch.awayScore ?? 0,
    });
    setScoreModalOpen(true);
  };

  const handleSaveScore = async () => {
    if (!detailMatch) return;
    try {
      const values = await scoreForm.validateFields();
      setSavingScore(true);
      await apiUpdateMatch(detailMatch.id, {
        homeScore: values.homeScore,
        awayScore: values.awayScore,
      });
      message.success('Đã cập nhật tỉ số!');
      setScoreModalOpen(false);
      viewDetail(detailMatch.id);
      fetchMatches();
    } catch {
      message.error('Không thể cập nhật tỉ số');
    } finally {
      setSavingScore(false);
    }
  };

  // ── Status update ──
  const handleStatusChange = async (newStatus: string) => {
    if (!detailMatch) return;
    try {
      await apiUpdateMatchStatus(detailMatch.id, newStatus);
      message.success(`Đã chuyển trạng thái sang ${STATUS_MAP[newStatus]?.label ?? newStatus}`);
      viewDetail(detailMatch.id);
      fetchMatches();
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || 'Không thể cập nhật trạng thái');
    }
  };

  // ── Add events (batch) ──
  const handleAddEvent = async () => {
    if (!detailMatch) return;
    try {
      const values = await eventForm.validateFields();
      setSavingEvent(true);
      const teamId = values.teamSide === 'home' ? detailMatch.homeTeamId : detailMatch.awayTeamId;
      const events: { type: string; minute: number; playerId?: string; note?: string }[] =
        values.events ?? [];
      if (events.length === 0) {
        message.warning('Vui lòng thêm ít nhất 1 sự kiện');
        setSavingEvent(false);
        return;
      }
      let successCount = 0;
      for (const evt of events) {
        try {
          const payload: AddMatchEventPayload = {
            minute: evt.minute,
            type: evt.type as AddMatchEventPayload['type'],
            teamId,
            playerId: evt.playerId || undefined,
            note: evt.note || undefined,
          };
          await apiAddMatchEvent(detailMatch.id, payload);
          successCount++;
        } catch {
          message.error(`Lỗi thêm sự kiện phút ${evt.minute}`);
        }
      }
      if (successCount > 0) {
        message.success(`Đã thêm ${successCount} sự kiện!`);
        setEventModalOpen(false);
        eventForm.resetFields();
        setSelectedTeamSide(null);
        viewDetail(detailMatch.id);
        fetchMatches();
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('Không thể thêm sự kiện');
    } finally {
      setSavingEvent(false);
    }
  };

  const currentRoster = useMemo(() => {
    if (selectedTeamSide === 'home') return homeRoster;
    if (selectedTeamSide === 'away') return awayRoster;
    return [];
  }, [selectedTeamSide, homeRoster, awayRoster]);

  const getStatusActions = (match: Match) => {
    const transitions: Record<string, string[]> = {
      DRAFT: ['PUBLISHED', 'POSTPONED'],
      PUBLISHED: ['LOCKED', 'POSTPONED'],
      LOCKED: ['FINISHED'],
      FINISHED: [],
      POSTPONED: ['DRAFT'],
    };
    return transitions[match.status] ?? [];
  };

  // ── Per-round table columns ──
  const roundColumns: ColumnsType<Match> = [
    {
      title: 'Đội nhà',
      key: 'home',
      width: '22%',
      render: (_, r) => <strong>{r.homeTeam?.name ?? '—'}</strong>,
    },
    {
      title: 'Tỉ số',
      key: 'score',
      width: 100,
      align: 'center',
      render: (_, r) =>
        r.homeScore != null && r.awayScore != null ? (
          <strong style={{ fontSize: 15 }}>
            {r.homeScore} – {r.awayScore}
          </strong>
        ) : (
          <span style={{ color: '#bbb' }}>— : —</span>
        ),
    },
    {
      title: 'Đội khách',
      key: 'away',
      width: '22%',
      render: (_, r) => <span>{r.awayTeam?.name ?? '—'}</span>,
    },
    {
      title: 'Sân',
      key: 'stadium',
      width: '20%',
      render: (_, r) => <span style={{ color: '#666' }}>{r.stadium?.name ?? '—'}</span>,
    },
    {
      title: 'Giờ',
      dataIndex: 'kickoffAt',
      width: 130,
      render: (v: string | null) =>
        v ? (
          <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            📅 {dayjs(v).format('DD/MM/YYYY HH:mm')}
          </span>
        ) : (
          '—'
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const s = STATUS_MAP[status] ?? { label: status, color: 'default' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, r) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => viewDetail(r.id)}>
          {canEdit ? 'Sửa' : ''}
        </Button>
      ),
    },
  ];

  // ── Build Collapse items ──
  const collapseItems = filteredAndGrouped.map(([roundNo, roundMatches]) => {
    const finishedCount = roundMatches.filter((m) => m.status === 'FINISHED').length;
    const allFinished = finishedCount === roundMatches.length;
    const numRounds = matches.length > 0 ? Math.max(...matches.map((m) => m.roundNo)) / 2 : 9;
    const isLeg2 = roundNo > numRounds;

    return {
      key: String(roundNo),
      label: (
        <Flex align="center" gap={12}>
          <Badge
            count={`V${roundNo}`}
            style={{
              backgroundColor: allFinished ? '#52c41a' : '#1677ff',
              fontWeight: 600,
              fontSize: 13,
            }}
          />
          <span style={{ fontWeight: 500 }}>
            Vòng {roundNo}{' '}
            <Tag color={isLeg2 ? 'volcano' : 'blue'} style={{ marginLeft: 4 }}>
              {isLeg2 ? 'Lượt về' : 'Lượt đi'}
            </Tag>
          </span>
          <span style={{ color: '#888', fontSize: 13 }}>
            {roundMatches.length} trận · {finishedCount}/{roundMatches.length} kết thúc
          </span>
        </Flex>
      ),
      children: (
        <Table
          columns={roundColumns}
          dataSource={roundMatches}
          rowKey="id"
          pagination={false}
          size="small"
          showHeader={roundNo === filteredAndGrouped[0]?.[0]}
        />
      ),
    };
  });

  const renderEventTimeline = (events: MatchEvent[]) => {
    if (!events || events.length === 0) {
      return <Typography.Text type="secondary">Chưa có sự kiện nào</Typography.Text>;
    }
    return (
      <Timeline
        items={events.map((e) => {
          const meta = EVENT_TYPE_MAP[e.type] ?? { label: e.type, color: 'default', icon: '•' };
          return {
            color: meta.color,
            children: (
              <div>
                <strong>
                  {meta.icon} {e.minute}'
                </strong>{' '}
                — <Tag color={meta.color}>{meta.label}</Tag>
                {e.player && <span>{e.player.fullName}</span>}
                {e.team && <span style={{ color: '#888' }}> ({e.team.name})</span>}
                {e.note && <span style={{ color: '#888', marginLeft: 8 }}>— {e.note}</span>}
              </div>
            ),
          };
        })}
      />
    );
  };

  return (
    <Card>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: 16 }}
        wrap="wrap"
        gap={12}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          ⚽ Kết quả trận đấu
        </Typography.Title>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm đội bóng..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 220 }}
          />
          <Select
            value={selectedSeasonId}
            onChange={setSelectedSeasonId}
            style={{ width: 220 }}
            placeholder="Chọn mùa giải"
            allowClear
            options={seasons.map((s) => ({
              value: s.id,
              label: `${s.name} (${s.year}/${s.year + 1})`,
            }))}
          />
        </Space>
      </Flex>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Đang tải...</div>
      ) : filteredAndGrouped.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          {searchText ? `Không tìm thấy trận đấu cho "${searchText}"` : 'Chưa có trận đấu nào'}
        </div>
      ) : (
        <Collapse
          defaultActiveKey={activeKeys}
          items={collapseItems}
          style={{ background: '#fff' }}
        />
      )}

      {/* ── Match Detail Modal ── */}
      <Modal
        title="Chi tiết trận đấu"
        open={!!detailMatch}
        onCancel={() => {
          setDetailMatch(null);
          setHomeRoster([]);
          setAwayRoster([]);
        }}
        footer={null}
        width={750}
        loading={detailLoading}
      >
        {detailMatch && (
          <div>
            {/* Score display with goal scorers + cards */}
            {(() => {
              const events = detailMatch.events ?? [];
              // Home goals: scored by home team (GOAL/PENALTY) OR own-goal by away team
              const homeGoals = events
                .filter(
                  (e) =>
                    ((e.type === 'GOAL' || e.type === 'PENALTY') &&
                      e.team?.id === detailMatch.homeTeamId) ||
                    (e.type === 'OWN_GOAL' && e.team?.id === detailMatch.awayTeamId),
                )
                .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));
              // Away goals: scored by away team (GOAL/PENALTY) OR own-goal by home team
              const awayGoals = events
                .filter(
                  (e) =>
                    ((e.type === 'GOAL' || e.type === 'PENALTY') &&
                      e.team?.id === detailMatch.awayTeamId) ||
                    (e.type === 'OWN_GOAL' && e.team?.id === detailMatch.homeTeamId),
                )
                .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));
              // Cards per team
              const homeCards = events
                .filter(
                  (e) =>
                    (e.type === 'YELLOW_CARD' || e.type === 'RED_CARD') &&
                    e.team?.id === detailMatch.homeTeamId,
                )
                .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));
              const awayCards = events
                .filter(
                  (e) =>
                    (e.type === 'YELLOW_CARD' || e.type === 'RED_CARD') &&
                    e.team?.id === detailMatch.awayTeamId,
                )
                .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));

              // Group events by player → { name, minutes[] }
              const groupByPlayer = (evts: MatchEvent[]) => {
                const grouped = new Map<
                  string,
                  { name: string; minutes: { minute: number; type: string }[] }
                >();
                for (const g of evts) {
                  const pid = g.player?.id ?? g.id;
                  const existing = grouped.get(pid);
                  if (existing) {
                    existing.minutes.push({ minute: g.minute, type: g.type });
                  } else {
                    grouped.set(pid, {
                      name: g.player?.fullName ?? '—',
                      minutes: [{ minute: g.minute, type: g.type }],
                    });
                  }
                }
                return Array.from(grouped.entries());
              };

              const renderScorers = (goals: MatchEvent[], align: 'left' | 'right' | 'center') => {
                if (goals.length === 0) return null;
                return (
                  <div style={{ marginTop: 6 }}>
                    {groupByPlayer(goals).map(([pid, { name, minutes }]) => (
                      <div
                        key={pid}
                        style={{ fontSize: 12, color: '#555', textAlign: align, lineHeight: 1.7 }}
                      >
                        ⚽ <span style={{ fontWeight: 500 }}>{name}</span>{' '}
                        <span style={{ color: '#999' }}>
                          {minutes
                            .sort((a, b) => a.minute - b.minute)
                            .map((m) => {
                              const suffix =
                                m.type === 'OWN_GOAL'
                                  ? ' (PL)'
                                  : m.type === 'PENALTY'
                                    ? ' (P)'
                                    : '';
                              return `${m.minute}'${suffix}`;
                            })
                            .join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              };

              const renderCards = (cards: MatchEvent[], align: 'left' | 'right' | 'center') => {
                if (cards.length === 0) return null;
                return (
                  <div style={{ marginTop: 4 }}>
                    {groupByPlayer(cards).map(([pid, { name, minutes }]) => (
                      <div
                        key={pid}
                        style={{ fontSize: 11, color: '#777', textAlign: align, lineHeight: 1.7 }}
                      >
                        {minutes
                          .sort((a, b) => a.minute - b.minute)
                          .map((m, i) => (
                            <span key={i}>
                              {i > 0 && ', '}
                              {m.type === 'RED_CARD' ? '🟥' : '🟨'}
                            </span>
                          ))}{' '}
                        <span style={{ fontWeight: 500 }}>{name}</span>{' '}
                        <span style={{ color: '#aaa' }}>
                          {minutes
                            .sort((a, b) => a.minute - b.minute)
                            .map((m) => `${m.minute}'`)
                            .join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              };

              return (
                <div
                  style={{
                    padding: '20px 16px',
                    background: '#f6f6f6',
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <Flex justify="center" align="flex-start" gap={24}>
                    <div style={{ textAlign: 'center', minWidth: 150, flex: 1 }}>
                      <Typography.Text strong style={{ fontSize: 16 }}>
                        {detailMatch.homeTeam?.name ?? '—'}
                      </Typography.Text>
                      <div style={{ color: '#888', fontSize: 12, marginBottom: 2 }}>Đội nhà</div>
                      {renderScorers(homeGoals, 'center')}
                      {renderCards(homeCards, 'center')}
                    </div>
                    <div style={{ textAlign: 'center', minWidth: 80 }}>
                      <Typography.Title level={2} style={{ margin: 0 }}>
                        {detailMatch.homeScore ?? '—'} : {detailMatch.awayScore ?? '—'}
                      </Typography.Title>
                      <Tag
                        color={STATUS_MAP[detailMatch.status]?.color ?? 'default'}
                        style={{ marginTop: 4 }}
                      >
                        {STATUS_MAP[detailMatch.status]?.label ?? detailMatch.status}
                      </Tag>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: 150, flex: 1 }}>
                      <Typography.Text strong style={{ fontSize: 16 }}>
                        {detailMatch.awayTeam?.name ?? '—'}
                      </Typography.Text>
                      <div style={{ color: '#888', fontSize: 12, marginBottom: 2 }}>Đội khách</div>
                      {renderScorers(awayGoals, 'center')}
                      {renderCards(awayCards, 'center')}
                    </div>
                  </Flex>
                </div>
              );
            })()}

            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Vòng">V{detailMatch.roundNo}</Descriptions.Item>
              <Descriptions.Item label="Lượt">
                {detailMatch.leg === 1 ? 'Lượt đi' : 'Lượt về'}
              </Descriptions.Item>
              <Descriptions.Item label="Sân">{detailMatch.stadium?.name ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Giờ">
                {detailMatch.kickoffAt
                  ? dayjs(detailMatch.kickoffAt).format('DD/MM/YYYY HH:mm')
                  : '—'}
              </Descriptions.Item>
            </Descriptions>

            {/* Admin Actions */}
            {canEdit && (
              <Flex gap={8} style={{ marginBottom: 16 }} wrap="wrap">
                <Button type="primary" icon={<EditOutlined />} onClick={openScoreModal}>
                  Cập nhật tỉ số
                </Button>
                {getStatusActions(detailMatch).map((nextStatus) => {
                  const s = STATUS_MAP[nextStatus];
                  return (
                    <Button key={nextStatus} onClick={() => handleStatusChange(nextStatus)}>
                      Chuyển → {s?.label ?? nextStatus}
                    </Button>
                  );
                })}
              </Flex>
            )}

            {/* Events */}
            <div style={{ marginTop: 8 }}>
              <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  Sự kiện trận đấu
                </Typography.Title>
                {canEdit && (
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      eventForm.resetFields();
                      setSelectedTeamSide(null);
                      setEventModalOpen(true);
                    }}
                  >
                    Thêm sự kiện
                  </Button>
                )}
              </Flex>
              {renderEventTimeline(detailMatch.events ?? [])}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Score Edit Modal ── */}
      <Modal
        title="Cập nhật tỉ số"
        open={scoreModalOpen}
        onCancel={() => setScoreModalOpen(false)}
        onOk={handleSaveScore}
        confirmLoading={savingScore}
        okText="Lưu"
        cancelText="Hủy"
      >
        {detailMatch && (
          <Form form={scoreForm} layout="vertical" style={{ marginTop: 16 }}>
            <Flex gap={16} align="flex-end">
              <Form.Item
                name="homeScore"
                label={detailMatch.homeTeam?.name ?? 'Đội nhà'}
                rules={[{ required: true, message: 'Nhập số bàn' }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} max={99} style={{ width: '100%' }} size="large" />
              </Form.Item>
              <Typography.Title level={3} style={{ margin: '0 0 24px 0' }}>
                :
              </Typography.Title>
              <Form.Item
                name="awayScore"
                label={detailMatch.awayTeam?.name ?? 'Đội khách'}
                rules={[{ required: true, message: 'Nhập số bàn' }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} max={99} style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Flex>
          </Form>
        )}
      </Modal>

      {/* ── Add Event Modal (Batch) ── */}
      <Modal
        title="Thêm sự kiện trận đấu"
        open={eventModalOpen}
        onCancel={() => {
          setEventModalOpen(false);
          setSelectedTeamSide(null);
        }}
        onOk={handleAddEvent}
        confirmLoading={savingEvent}
        okText={`Thêm tất cả`}
        cancelText="Hủy"
        destroyOnClose
        width={680}
      >
        <Form form={eventForm} layout="vertical" style={{ marginTop: 16 }}>
          {/* Team selector — applies to all events */}
          <Form.Item
            name="teamSide"
            label="Đội"
            rules={[{ required: true, message: 'Vui lòng chọn đội' }]}
          >
            <Radio.Group
              onChange={(e) => {
                setSelectedTeamSide(e.target.value);
                // Clear all player selections when team changes
                const events = eventForm.getFieldValue('events') ?? [];
                eventForm.setFieldsValue({
                  events: events.map((evt: Record<string, unknown>) => ({
                    ...evt,
                    playerId: undefined,
                  })),
                });
              }}
              optionType="button"
              buttonStyle="solid"
              style={{ width: '100%' }}
            >
              <Radio.Button value="home" style={{ width: '50%', textAlign: 'center' }}>
                🏠 {detailMatch?.homeTeam?.name ?? 'Đội nhà'}
              </Radio.Button>
              <Radio.Button value="away" style={{ width: '50%', textAlign: 'center' }}>
                ✈️ {detailMatch?.awayTeam?.name ?? 'Đội khách'}
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* Dynamic event rows */}
          <Form.List name="events" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, idx) => (
                  <div
                    key={key}
                    style={{
                      background: idx % 2 === 0 ? '#fafafa' : '#f0f0f0',
                      padding: '12px 12px 4px',
                      borderRadius: 8,
                      marginBottom: 8,
                      position: 'relative',
                    }}
                  >
                    {/* Row header */}
                    <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                      <Typography.Text strong style={{ fontSize: 13, color: '#666' }}>
                        Sự kiện {idx + 1}
                      </Typography.Text>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      )}
                    </Flex>

                    {/* Row fields: Type + Minute on same line */}
                    <Flex gap={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        rules={[{ required: true, message: 'Chọn loại' }]}
                        style={{ flex: 2, marginBottom: 8 }}
                      >
                        <Select placeholder="Loại sự kiện" size="middle">
                          {Object.entries(EVENT_TYPE_MAP).map(([value, { label, icon }]) => (
                            <Select.Option key={value} value={value}>
                              {icon} {label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'minute']}
                        rules={[{ required: true, message: 'Phút' }]}
                        style={{ flex: 1, marginBottom: 8 }}
                      >
                        <InputNumber
                          min={0}
                          max={150}
                          style={{ width: '100%' }}
                          placeholder="Phút"
                        />
                      </Form.Item>
                    </Flex>

                    {/* Player + Note on same line */}
                    <Flex gap={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'playerId']}
                        style={{ flex: 2, marginBottom: 8 }}
                      >
                        <Select
                          placeholder={selectedTeamSide ? 'Chọn cầu thủ' : 'Chọn đội trước'}
                          disabled={!selectedTeamSide || rosterLoading}
                          loading={rosterLoading}
                          showSearch
                          optionFilterProp="label"
                          allowClear
                          options={currentRoster.map((p) => ({
                            value: p.playerId,
                            label: `#${p.jerseyNumber ?? '?'} ${p.fullName} (${p.position})`,
                          }))}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'note']}
                        style={{ flex: 1, marginBottom: 8 }}
                      >
                        <Input placeholder="Ghi chú" />
                      </Form.Item>
                    </Flex>
                  </div>
                ))}

                {/* Add row button */}
                <Button
                  type="dashed"
                  onClick={() => add({})}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginTop: 4 }}
                >
                  Thêm sự kiện
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Card>
  );
}
