import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
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
  type AddMatchEventPayload,
  type Match,
  type MatchEvent,
  type RosterPlayer,
} from '../services/matchApi';

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

const CAN_ADD_EVENT_ROLES = ['ADMIN', 'REFEREE'];

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailMatch, setDetailMatch] = useState<Match | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [form] = Form.useForm();

  // Roster state
  const [selectedTeamSide, setSelectedTeamSide] = useState<'home' | 'away' | null>(null);
  const [homeRoster, setHomeRoster] = useState<RosterPlayer[]>([]);
  const [awayRoster, setAwayRoster] = useState<RosterPlayer[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const canAddEvent = useMemo(() => {
    return user?.role && CAN_ADD_EVENT_ROLES.includes(user.role);
  }, [user]);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetMatches();
      setMatches(data);
    } catch {
      message.error('Không thể tải danh sách trận đấu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

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
      // Rosters may be empty, that's ok
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
      // Load rosters for both teams
      loadRosters(data);
    } catch {
      message.error('Không thể tải chi tiết trận đấu');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!detailMatch) return;
    try {
      const values = await form.validateFields();
      setSavingEvent(true);

      // Determine teamId from selected side
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
      form.resetFields();
      setSelectedTeamSide(null);
      // Reload detail
      viewDetail(detailMatch.id);
      fetchMatches();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('Không thể thêm sự kiện');
    } finally {
      setSavingEvent(false);
    }
  };

  // Get players for selected team side
  const currentRoster = useMemo(() => {
    if (selectedTeamSide === 'home') return homeRoster;
    if (selectedTeamSide === 'away') return awayRoster;
    return [];
  }, [selectedTeamSide, homeRoster, awayRoster]);

  const columns: ColumnsType<Match> = [
    {
      title: 'Vòng',
      dataIndex: 'roundNo',
      width: 80,
      render: (v: number) => <strong>V{v}</strong>,
      sorter: (a, b) => a.roundNo - b.roundNo,
    },
    {
      title: 'Đội nhà',
      key: 'home',
      render: (_, r) => r.homeTeam?.name ?? '—',
    },
    {
      title: 'Tỉ số',
      key: 'score',
      width: 100,
      align: 'center',
      render: (_, r) =>
        r.homeScore != null && r.awayScore != null ? (
          <strong>
            {r.homeScore} - {r.awayScore}
          </strong>
        ) : (
          <span style={{ color: '#999' }}>— : —</span>
        ),
    },
    {
      title: 'Đội khách',
      key: 'away',
      render: (_, r) => r.awayTeam?.name ?? '—',
    },
    {
      title: 'Sân',
      key: 'stadium',
      render: (_, r) => r.stadium?.name ?? '—',
    },
    {
      title: 'Giờ thi đấu',
      dataIndex: 'kickoffAt',
      width: 160,
      render: (v: string | null) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const s = STATUS_MAP[status] ?? { label: status, color: 'default' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 70,
      render: (_, r) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => viewDetail(r.id)} />
      ),
    },
  ];

  const renderEventTimeline = (events: MatchEvent[]) => {
    if (!events || events.length === 0) {
      return <Typography.Text type="secondary">Chưa có sự kiện nào</Typography.Text>;
    }

    return (
      <Timeline
        items={events.map((e) => {
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
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Kết quả trận đấu
      </Typography.Title>

      <Table
        columns={columns}
        dataSource={matches}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        size="middle"
        locale={{ emptyText: 'Chưa có trận đấu nào' }}
      />

      {/* Match Detail Modal */}
      <Modal
        title="Chi tiết trận đấu"
        open={!!detailMatch}
        onCancel={() => {
          setDetailMatch(null);
          setHomeRoster([]);
          setAwayRoster([]);
        }}
        footer={null}
        width={700}
        loading={detailLoading}
      >
        {detailMatch && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Vòng">V{detailMatch.roundNo}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={STATUS_MAP[detailMatch.status]?.color ?? 'default'}>
                  {STATUS_MAP[detailMatch.status]?.label ?? detailMatch.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Đội nhà">
                {detailMatch.homeTeam?.name ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Đội khách">
                {detailMatch.awayTeam?.name ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Tỉ số" span={2}>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {detailMatch.homeScore ?? '—'} : {detailMatch.awayScore ?? '—'}
                </Typography.Title>
              </Descriptions.Item>
              <Descriptions.Item label="Sân">{detailMatch.stadium?.name ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Giờ">
                {detailMatch.kickoffAt
                  ? dayjs(detailMatch.kickoffAt).format('DD/MM/YYYY HH:mm')
                  : '—'}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Space
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <Typography.Title level={5} style={{ margin: 0 }}>
                  Sự kiện trận đấu
                </Typography.Title>
                {canAddEvent && (
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      form.resetFields();
                      setSelectedTeamSide(null);
                      setEventModalOpen(true);
                    }}
                  >
                    Thêm sự kiện
                  </Button>
                )}
              </Space>
              {renderEventTimeline(detailMatch.events ?? [])}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Event Modal */}
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
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {/* Team Selector */}
          <Form.Item
            name="teamSide"
            label="Đội"
            rules={[{ required: true, message: 'Vui lòng chọn đội' }]}
          >
            <Radio.Group
              onChange={(e) => {
                setSelectedTeamSide(e.target.value);
                form.setFieldValue('playerId', undefined);
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

          {/* Event Type */}
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

          {/* Minute */}
          <Form.Item
            name="minute"
            label="Phút"
            rules={[{ required: true, message: 'Vui lòng nhập phút' }]}
          >
            <InputNumber min={0} max={150} style={{ width: '100%' }} placeholder="VD: 45" />
          </Form.Item>

          {/* Player Selector */}
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

          {/* Note */}
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú thêm (tùy chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
