import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  apiAddMatchEvent,
  apiGetMatch,
  apiGetTeamRoster,
  apiUpdateMatch,
  apiUpdateMatchStatus,
  type AddMatchEventPayload,
  type Match,
  type MatchEvent,
  type RosterPlayer,
} from '../services/matchApi';

const { Title, Text } = Typography;

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

const POSITION_MAP: Record<string, { label: string; color: string }> = {
  GK: { label: 'Thủ môn', color: 'gold' },
  DF: { label: 'Hậu vệ', color: 'blue' },
  MF: { label: 'Tiền vệ', color: 'green' },
  FW: { label: 'Tiền đạo', color: 'red' },
};

const CAN_EDIT_ROLES = ['ADMIN', 'REFEREE'];

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  // Rosters
  const [homeRoster, setHomeRoster] = useState<RosterPlayer[]>([]);
  const [awayRoster, setAwayRoster] = useState<RosterPlayer[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  // Score edit
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [scoreForm] = Form.useForm();
  const [savingScore, setSavingScore] = useState(false);

  // Event modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventForm] = Form.useForm();
  const [selectedTeamSide, setSelectedTeamSide] = useState<'home' | 'away' | null>(null);

  const canEdit = useMemo(() => user?.role && CAN_EDIT_ROLES.includes(user.role), [user]);

  const loadRosters = useCallback(async (m: Match) => {
    setRosterLoading(true);
    try {
      const [home, away] = await Promise.all([
        apiGetTeamRoster(m.homeTeamId),
        apiGetTeamRoster(m.awayTeamId),
      ]);
      setHomeRoster(home.players ?? []);
      setAwayRoster(away.players ?? []);
    } catch {
      setHomeRoster([]);
      setAwayRoster([]);
    } finally {
      setRosterLoading(false);
    }
  }, []);

  const fetchMatch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await apiGetMatch(id);
      setMatch(data);
      loadRosters(data);
    } catch {
      message.error('Không thể tải chi tiết trận đấu');
    } finally {
      setLoading(false);
    }
  }, [id, loadRosters]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  const currentRoster = useMemo(() => {
    if (selectedTeamSide === 'home') return homeRoster;
    if (selectedTeamSide === 'away') return awayRoster;
    return [];
  }, [selectedTeamSide, homeRoster, awayRoster]);

  // ── Score update ──
  const openScoreModal = () => {
    if (!match) return;
    scoreForm.setFieldsValue({
      homeScore: match.homeScore ?? 0,
      awayScore: match.awayScore ?? 0,
    });
    setScoreModalOpen(true);
  };

  const handleSaveScore = async () => {
    if (!match) return;
    try {
      const values = await scoreForm.validateFields();
      setSavingScore(true);
      await apiUpdateMatch(match.id, {
        homeScore: values.homeScore,
        awayScore: values.awayScore,
      });
      message.success('Đã cập nhật tỉ số!');
      setScoreModalOpen(false);
      fetchMatch();
    } catch {
      message.error('Không thể cập nhật tỉ số');
    } finally {
      setSavingScore(false);
    }
  };

  // ── Status update ──
  const handleStatusChange = async (newStatus: string) => {
    if (!match) return;
    try {
      await apiUpdateMatchStatus(match.id, newStatus);
      message.success(`Đã chuyển trạng thái sang ${STATUS_MAP[newStatus]?.label ?? newStatus}`);
      fetchMatch();
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || 'Không thể cập nhật trạng thái');
    }
  };

  // ── Add event ──
  const handleAddEvent = async () => {
    if (!match) return;
    try {
      const values = await eventForm.validateFields();
      setSavingEvent(true);
      const teamId = values.teamSide === 'home' ? match.homeTeamId : match.awayTeamId;
      const events: {
        type: string;
        minute: number;
        playerId?: string;
        note?: string;
        goalType?: string;
        relatedPlayerId?: string;
      }[] = values.events ?? [];
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
            goalType: evt.goalType || undefined,
            relatedPlayerId: evt.relatedPlayerId || undefined,
          };
          await apiAddMatchEvent(match.id, payload);
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
        fetchMatch();
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('Không thể thêm sự kiện');
    } finally {
      setSavingEvent(false);
    }
  };

  const getStatusActions = (m: Match) => {
    const transitions: Record<string, string[]> = {
      DRAFT: ['PUBLISHED', 'POSTPONED'],
      PUBLISHED: ['LOCKED', 'POSTPONED'],
      LOCKED: ['FINISHED'],
      FINISHED: [],
      POSTPONED: ['DRAFT'],
    };
    return transitions[m.status] ?? [];
  };

  // ── Helpers ──
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

  // ── Loading / Not found ──
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!match) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4}>Không tìm thấy trận đấu</Title>
        <Button onClick={() => navigate('/matches')}>Quay lại</Button>
      </div>
    );
  }

  // ── Data derivation ──
  const events = match.events ?? [];
  const homeGoals = events
    .filter(
      (e) =>
        ((e.type === 'GOAL' || e.type === 'PENALTY') && e.team?.id === match.homeTeamId) ||
        (e.type === 'OWN_GOAL' && e.team?.id === match.awayTeamId),
    )
    .sort((a, b) => a.minute - b.minute);
  const awayGoals = events
    .filter(
      (e) =>
        ((e.type === 'GOAL' || e.type === 'PENALTY') && e.team?.id === match.awayTeamId) ||
        (e.type === 'OWN_GOAL' && e.team?.id === match.homeTeamId),
    )
    .sort((a, b) => a.minute - b.minute);
  const homeCards = events
    .filter(
      (e) => (e.type === 'YELLOW_CARD' || e.type === 'RED_CARD') && e.team?.id === match.homeTeamId,
    )
    .sort((a, b) => a.minute - b.minute);
  const awayCards = events
    .filter(
      (e) => (e.type === 'YELLOW_CARD' || e.type === 'RED_CARD') && e.team?.id === match.awayTeamId,
    )
    .sort((a, b) => a.minute - b.minute);

  // Stats derivation
  const homeYellows = homeCards.filter((c) => c.type === 'YELLOW_CARD').length;
  const homeReds = homeCards.filter((c) => c.type === 'RED_CARD').length;
  const awayYellows = awayCards.filter((c) => c.type === 'YELLOW_CARD').length;
  const awayReds = awayCards.filter((c) => c.type === 'RED_CARD').length;
  const homeSubs = events.filter(
    (e) => e.type === 'SUBSTITUTION' && e.team?.id === match.homeTeamId,
  ).length;
  const awaySubs = events.filter(
    (e) => e.type === 'SUBSTITUTION' && e.team?.id === match.awayTeamId,
  ).length;

  const renderScorers = (goals: MatchEvent[], align: 'left' | 'right' | 'center') => {
    if (goals.length === 0) return null;
    return (
      <div style={{ marginTop: 6 }}>
        {groupByPlayer(goals).map(([pid, { name, minutes }]) => (
          <div key={pid} style={{ fontSize: 12, color: '#555', textAlign: align, lineHeight: 1.7 }}>
            ⚽ <span style={{ fontWeight: 500 }}>{name}</span>{' '}
            <span style={{ color: '#999' }}>
              {minutes
                .sort((a, b) => a.minute - b.minute)
                .map((m) => {
                  const suffix =
                    m.type === 'OWN_GOAL' ? ' (PL)' : m.type === 'PENALTY' ? ' (P)' : '';
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
          <div key={pid} style={{ fontSize: 11, color: '#777', textAlign: align, lineHeight: 1.7 }}>
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

  const rosterColumns = [
    {
      title: 'Số áo',
      dataIndex: 'jerseyNumber',
      key: 'jerseyNumber',
      width: 80,
      sorter: (a: RosterPlayer, b: RosterPlayer) => (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99),
      render: (v: number | null) => v ?? '—',
    },
    {
      title: 'Cầu thủ',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string, r: RosterPlayer) => (
        <a onClick={() => navigate(`/players/${r.playerId}`)}>{name}</a>
      ),
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
      width: 120,
      render: (pos: string) => {
        const p = POSITION_MAP[pos];
        return <Tag color={p?.color}>{p?.label ?? pos}</Tag>;
      },
    },
  ];

  // Stats table data
  const statsData = [
    {
      key: 'goals',
      stat: '⚽ Bàn thắng',
      home: homeGoals.length,
      away: awayGoals.length,
    },
    {
      key: 'yellows',
      stat: '🟨 Thẻ vàng',
      home: homeYellows,
      away: awayYellows,
    },
    {
      key: 'reds',
      stat: '🟥 Thẻ đỏ',
      home: homeReds,
      away: awayReds,
    },
    {
      key: 'subs',
      stat: '🔄 Thay người',
      home: homeSubs,
      away: awaySubs,
    },
  ];

  return (
    <div>
      {/* Header */}
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/matches')}>
          Quay lại
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          Chi tiết trận đấu — Vòng {match.roundNo}
        </Title>
      </Space>

      {/* Scoreboard */}
      <Card
        style={{
          marginBottom: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
        }}
      >
        <Flex justify="center" align="flex-start" gap={32}>
          <div style={{ textAlign: 'center', minWidth: 180, flex: 1 }}>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              {match.homeTeam?.name ?? '—'}
            </Title>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>
              🏠 Đội nhà
            </div>
            <div style={{ filter: 'brightness(2)' }}>
              {renderScorers(homeGoals, 'center')}
              {renderCards(homeCards, 'center')}
            </div>
          </div>
          <div style={{ textAlign: 'center', minWidth: 100 }}>
            <Title level={1} style={{ color: '#fff', margin: 0, fontSize: 48 }}>
              {match.homeScore ?? '—'} : {match.awayScore ?? '—'}
            </Title>
            <Tag
              color={STATUS_MAP[match.status]?.color ?? 'default'}
              style={{ marginTop: 8, fontSize: 13 }}
            >
              {STATUS_MAP[match.status]?.label ?? match.status}
            </Tag>
            {match.kickoffAt && (
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 6 }}>
                📅 {dayjs(match.kickoffAt).format('DD/MM/YYYY HH:mm')}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center', minWidth: 180, flex: 1 }}>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              {match.awayTeam?.name ?? '—'}
            </Title>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>
              ✈️ Đội khách
            </div>
            <div style={{ filter: 'brightness(2)' }}>
              {renderScorers(awayGoals, 'center')}
              {renderCards(awayCards, 'center')}
            </div>
          </div>
        </Flex>
      </Card>

      {/* Admin Actions */}
      {canEdit && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Flex gap={8} wrap="wrap" align="center">
            <Text strong style={{ marginRight: 8 }}>
              Thao tác:
            </Text>
            <Button type="primary" icon={<EditOutlined />} onClick={openScoreModal}>
              Cập nhật tỉ số
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                eventForm.resetFields();
                setSelectedTeamSide(null);
                setEventModalOpen(true);
              }}
            >
              Thêm sự kiện
            </Button>
            {getStatusActions(match).map((nextStatus) => {
              const s = STATUS_MAP[nextStatus];
              return (
                <Button key={nextStatus} onClick={() => handleStatusChange(nextStatus)}>
                  Chuyển → {s?.label ?? nextStatus}
                </Button>
              );
            })}
          </Flex>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: 'overview',
            label: '📋 Tổng quan',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="Thông tin trận đấu" size="small">
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Vòng">V{match.roundNo}</Descriptions.Item>
                      <Descriptions.Item label="Lượt">
                        {match.leg === 1 ? 'Lượt đi' : 'Lượt về'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Mùa giải">
                        {match.season?.name ?? '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Sân vận động">
                        {match.stadium?.name ? (
                          <a onClick={() => navigate(`/stadiums/${match.stadiumId}`)}>
                            {match.stadium.name}
                          </a>
                        ) : (
                          '—'
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giờ thi đấu">
                        {match.kickoffAt ? dayjs(match.kickoffAt).format('DD/MM/YYYY HH:mm') : '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Trạng thái">
                        <Tag color={STATUS_MAP[match.status]?.color}>
                          {STATUS_MAP[match.status]?.label ?? match.status}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Thống kê trận đấu" size="small">
                    <Table
                      dataSource={statsData}
                      rowKey="key"
                      pagination={false}
                      size="small"
                      columns={[
                        {
                          title: match.homeTeam?.name ?? 'Nhà',
                          dataIndex: 'home',
                          align: 'center',
                          width: 80,
                          render: (v: number) => <strong>{v}</strong>,
                        },
                        {
                          title: 'Chỉ số',
                          dataIndex: 'stat',
                          align: 'center',
                        },
                        {
                          title: match.awayTeam?.name ?? 'Khách',
                          dataIndex: 'away',
                          align: 'center',
                          width: 80,
                          render: (v: number) => <strong>{v}</strong>,
                        },
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'events',
            label: `⚽ Sự kiện (${events.length})`,
            children: (
              <Card size="small">
                {events.length === 0 ? (
                  <Text type="secondary">Chưa có sự kiện nào</Text>
                ) : (
                  <Timeline
                    items={[...events]
                      .sort((a, b) => a.minute - b.minute)
                      .map((e) => {
                        const meta = EVENT_TYPE_MAP[e.type] ?? {
                          label: e.type,
                          color: 'default',
                          icon: '•',
                        };
                        return {
                          color: meta.color,
                          children: (
                            <div>
                              <strong>
                                {meta.icon} {e.minute}'
                              </strong>{' '}
                              — <Tag color={meta.color}>{meta.label}</Tag>
                              {e.player && (
                                <a onClick={() => navigate(`/players/${e.playerId}`)}>
                                  {e.player.fullName}
                                </a>
                              )}
                              {e.relatedPlayer && (
                                <span style={{ color: '#888', marginLeft: 4 }}>
                                  (
                                  {e.type === 'SUBSTITUTION'
                                    ? `thay ${e.relatedPlayer.fullName}`
                                    : `kiến tạo: ${e.relatedPlayer.fullName}`}
                                  )
                                </span>
                              )}
                              {e.team && <span style={{ color: '#888' }}> ({e.team.name})</span>}
                              {e.goalType && <Tag style={{ marginLeft: 4 }}>{e.goalType}</Tag>}
                              {e.note && (
                                <span style={{ color: '#888', marginLeft: 8 }}>— {e.note}</span>
                              )}
                            </div>
                          ),
                        };
                      })}
                  />
                )}
              </Card>
            ),
          },
          {
            key: 'lineups',
            label: '👥 Đội hình',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card
                    title={`🏠 ${match.homeTeam?.name ?? 'Đội nhà'} — Danh sách`}
                    size="small"
                    loading={rosterLoading}
                  >
                    <Table
                      dataSource={homeRoster}
                      columns={rosterColumns}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      locale={{ emptyText: 'Chưa có dữ liệu đội hình' }}
                    />
                    <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
                      Tổng: {homeRoster.length} cầu thủ
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card
                    title={`✈️ ${match.awayTeam?.name ?? 'Đội khách'} — Danh sách`}
                    size="small"
                    loading={rosterLoading}
                  >
                    <Table
                      dataSource={awayRoster}
                      columns={rosterColumns}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      locale={{ emptyText: 'Chưa có dữ liệu đội hình' }}
                    />
                    <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
                      Tổng: {awayRoster.length} cầu thủ
                    </div>
                  </Card>
                </Col>
              </Row>
            ),
          },
        ]}
      />

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
        <Form form={scoreForm} layout="vertical" style={{ marginTop: 16 }}>
          <Flex gap={16} align="flex-end">
            <Form.Item
              name="homeScore"
              label={match.homeTeam?.name ?? 'Đội nhà'}
              rules={[{ required: true, message: 'Nhập số bàn' }]}
              style={{ flex: 1 }}
            >
              <InputNumber min={0} max={99} style={{ width: '100%' }} size="large" />
            </Form.Item>
            <Title level={3} style={{ margin: '0 0 24px 0' }}>
              :
            </Title>
            <Form.Item
              name="awayScore"
              label={match.awayTeam?.name ?? 'Đội khách'}
              rules={[{ required: true, message: 'Nhập số bàn' }]}
              style={{ flex: 1 }}
            >
              <InputNumber min={0} max={99} style={{ width: '100%' }} size="large" />
            </Form.Item>
          </Flex>
        </Form>
      </Modal>

      {/* ── Add Event Modal ── */}
      <Modal
        title="Thêm sự kiện trận đấu"
        open={eventModalOpen}
        onCancel={() => {
          setEventModalOpen(false);
          setSelectedTeamSide(null);
        }}
        onOk={handleAddEvent}
        confirmLoading={savingEvent}
        okText="Thêm tất cả"
        cancelText="Hủy"
        destroyOnClose
        width={680}
      >
        <Form form={eventForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="teamSide"
            label="Đội"
            rules={[{ required: true, message: 'Vui lòng chọn đội' }]}
          >
            <Radio.Group
              onChange={(e) => {
                setSelectedTeamSide(e.target.value);
                const evts = eventForm.getFieldValue('events') ?? [];
                eventForm.setFieldsValue({
                  events: evts.map((evt: Record<string, unknown>) => ({
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
                🏠 {match.homeTeam?.name ?? 'Đội nhà'}
              </Radio.Button>
              <Radio.Button value="away" style={{ width: '50%', textAlign: 'center' }}>
                ✈️ {match.awayTeam?.name ?? 'Đội khách'}
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

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
                    <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 13, color: '#666' }}>
                        Sự kiện {idx + 1}
                      </Text>
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
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, cur) => {
                        const prevType = prev?.events?.[name]?.type;
                        const curType = cur?.events?.[name]?.type;
                        return prevType !== curType;
                      }}
                    >
                      {() => {
                        const evtType = eventForm.getFieldValue(['events', name, 'type']);
                        const showGoalType = ['GOAL', 'PENALTY'].includes(evtType);
                        const showRelated = ['GOAL', 'SUBSTITUTION'].includes(evtType);
                        if (!showGoalType && !showRelated) return null;
                        return (
                          <Flex gap={8}>
                            {showGoalType && (
                              <Form.Item
                                {...restField}
                                name={[name, 'goalType']}
                                style={{ flex: 1, marginBottom: 8 }}
                              >
                                <Select placeholder="Loại bàn thắng" allowClear>
                                  <Select.Option value="NORMAL">Bình thường</Select.Option>
                                  <Select.Option value="HEADER">Đánh đầu</Select.Option>
                                  <Select.Option value="FREE_KICK">Sút phạt</Select.Option>
                                  <Select.Option value="PENALTY_KICK">Penalty</Select.Option>
                                  <Select.Option value="LONG_RANGE">Sút xa</Select.Option>
                                </Select>
                              </Form.Item>
                            )}
                            {showRelated && (
                              <Form.Item
                                {...restField}
                                name={[name, 'relatedPlayerId']}
                                style={{ flex: 1, marginBottom: 8 }}
                              >
                                <Select
                                  placeholder={evtType === 'GOAL' ? 'Kiến tạo' : 'Cầu thủ bị thay'}
                                  disabled={!selectedTeamSide || rosterLoading}
                                  loading={rosterLoading}
                                  showSearch
                                  optionFilterProp="label"
                                  allowClear
                                  options={currentRoster.map((p) => ({
                                    value: p.playerId,
                                    label: `#${p.jerseyNumber ?? '?'} ${p.fullName}`,
                                  }))}
                                />
                              </Form.Item>
                            )}
                          </Flex>
                        );
                      }}
                    </Form.Item>
                  </div>
                ))}
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

      {/* Stats summary row */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Tổng sự kiện" value={events.length} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Tổng bàn thắng"
              value={homeGoals.length + awayGoals.length}
              prefix="⚽"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Tổng thẻ"
              value={homeYellows + awayYellows + homeReds + awayReds}
              prefix="🃏"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Thay người" value={homeSubs + awaySubs} prefix="🔄" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
