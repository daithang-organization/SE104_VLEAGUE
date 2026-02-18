import { EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
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
      const data = await apiGetMatches(selectedSeasonId);
      setMatches(data);
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
      message.error(msg || 'Không thể cập nhật trạng thái');
    }
  };

  // ── Add event ──
  const handleAddEvent = async () => {
    if (!detailMatch) return;
    try {
      const values = await eventForm.validateFields();
      setSavingEvent(true);
      const teamId = values.teamSide === 'home' ? detailMatch.homeTeamId : detailMatch.awayTeamId;
      const payload: AddMatchEventPayload = {
        minute: values.minute,
        type: values.type,
        teamId,
        playerId: values.playerId || undefined,
        note: values.note || undefined,
      };
      await apiAddMatchEvent(detailMatch.id, payload);
      message.success('Đã thêm sự kiện!');
      setEventModalOpen(false);
      eventForm.resetFields();
      setSelectedTeamSide(null);
      viewDetail(detailMatch.id);
      fetchMatches();
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
            {/* Score display */}
            <div
              style={{
                textAlign: 'center',
                padding: '20px 0',
                background: '#f6f6f6',
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <Flex justify="center" align="center" gap={24}>
                <div style={{ textAlign: 'center', minWidth: 120 }}>
                  <Typography.Text strong style={{ fontSize: 16 }}>
                    {detailMatch.homeTeam?.name ?? '—'}
                  </Typography.Text>
                  <div style={{ color: '#888', fontSize: 12 }}>Đội nhà</div>
                </div>
                <div style={{ textAlign: 'center' }}>
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
                <div style={{ textAlign: 'center', minWidth: 120 }}>
                  <Typography.Text strong style={{ fontSize: 16 }}>
                    {detailMatch.awayTeam?.name ?? '—'}
                  </Typography.Text>
                  <div style={{ color: '#888', fontSize: 12 }}>Đội khách</div>
                </div>
              </Flex>
            </div>

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
        okText="Thêm"
        cancelText="Hủy"
        destroyOnClose
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
                eventForm.setFieldValue('playerId', undefined);
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

          <Form.Item
            name="type"
            label="Loại sự kiện"
            rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện' }]}
          >
            <Select placeholder="Chọn loại sự kiện">
              {Object.entries(EVENT_TYPE_MAP).map(([value, { label, icon }]) => (
                <Select.Option key={value} value={value}>
                  {icon} {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="minute"
            label="Phút"
            rules={[{ required: true, message: 'Vui lòng nhập phút' }]}
          >
            <InputNumber min={0} max={150} style={{ width: '100%' }} placeholder="VD: 45" />
          </Form.Item>

          <Form.Item name="playerId" label="Cầu thủ">
            <Select
              placeholder={
                selectedTeamSide
                  ? rosterLoading
                    ? 'Đang tải...'
                    : 'Chọn cầu thủ'
                  : 'Vui lòng chọn đội trước'
              }
              disabled={!selectedTeamSide || rosterLoading}
              loading={rosterLoading}
              showSearch
              optionFilterProp="label"
              allowClear
              options={currentRoster.map((p) => ({
                value: p.playerId,
                label: `${p.jerseyNumber ? `#${p.jerseyNumber} ` : ''}${p.fullName} (${p.position})`,
              }))}
            />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú thêm (tùy chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
