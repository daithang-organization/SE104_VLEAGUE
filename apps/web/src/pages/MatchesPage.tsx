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
  Select,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import {
  apiAddMatchEvent,
  apiGetMatch,
  apiGetMatches,
  type AddMatchEventPayload,
  type Match,
  type MatchEvent,
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
  YELLOW_CARD: { label: 'Thẻ vàng', color: 'gold', icon: '🟨' },
  RED_CARD: { label: 'Thẻ đỏ', color: 'red', icon: '🟥' },
  SUBSTITUTION: { label: 'Thay người', color: 'blue', icon: '🔄' },
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailMatch, setDetailMatch] = useState<Match | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [form] = Form.useForm();

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

  const viewDetail = async (matchId: string) => {
    setDetailLoading(true);
    try {
      const data = await apiGetMatch(matchId);
      setDetailMatch(data);
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
      await apiAddMatchEvent(detailMatch.id, values as AddMatchEventPayload);
      message.success('Đã thêm sự kiện!');
      setEventModalOpen(false);
      form.resetFields();
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

      {/* Match Detail Drawer */}
      <Modal
        title="Chi tiết trận đấu"
        open={!!detailMatch}
        onCancel={() => setDetailMatch(null)}
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
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    form.resetFields();
                    setEventModalOpen(true);
                  }}
                >
                  Thêm sự kiện
                </Button>
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
        onCancel={() => setEventModalOpen(false)}
        onOk={handleAddEvent}
        confirmLoading={savingEvent}
        okText="Thêm"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="minute"
            label="Phút"
            rules={[{ required: true, message: 'Vui lòng nhập phút' }]}
          >
            <InputNumber min={0} max={120} style={{ width: '100%' }} placeholder="VD: 45" />
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

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú thêm (tùy chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
