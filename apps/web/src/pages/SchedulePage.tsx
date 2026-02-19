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
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'default' },
  PUBLISHED: { label: 'Đã công bố', color: 'blue' },
  LOCKED: { label: 'Đã khóa', color: 'orange' },
  FINISHED: { label: 'Kết thúc', color: 'green' },
  POSTPONED: { label: 'Hoãn', color: 'red' },
};

export default function SchedulePage() {
  const { user } = useAuth();
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
    } catch {
      message.error('Không thể tải lịch thi đấu');
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
      message.success(result.message || 'Tạo lịch thi đấu thành công!');
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
      message.error((msg as string) || 'Không thể tạo lịch thi đấu');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const result = await apiPublishSchedule(selectedSeasonId);
      message.success(result.message || 'Công bố lịch thi đấu thành công!');
      fetchSchedule();
    } catch {
      message.error('Không thể công bố lịch thi đấu');
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
      message.success('Đã cập nhật trận đấu');
      setEditModalOpen(false);
      fetchSchedule();
    } catch {
      message.error('Không thể cập nhật trận đấu');
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
      title: 'Lượt',
      dataIndex: 'leg',
      width: 80,
      render: (leg: number) => (
        <Tag color={leg === 1 ? 'blue' : 'volcano'} style={{ margin: 0 }}>
          {leg === 1 ? 'Lượt đi' : 'Lượt về'}
        </Tag>
      ),
    },
    {
      title: 'Đội nhà',
      key: 'home',
      width: '20%',
      render: (_, r) => (
        <strong style={{ whiteSpace: 'nowrap' }}>
          {r.homeTeam?.name || r.homeTeamId.slice(0, 8)}
        </strong>
      ),
    },
    {
      title: 'Tỉ số',
      key: 'score',
      width: 80,
      align: 'center',
      render: (_, r) =>
        r.homeScore != null && r.awayScore != null ? (
          <strong>
            {r.homeScore} – {r.awayScore}
          </strong>
        ) : (
          <span style={{ color: '#bbb' }}>vs</span>
        ),
    },
    {
      title: 'Đội khách',
      key: 'away',
      width: '22%',
      render: (_, r) => (
        <span style={{ whiteSpace: 'nowrap' }}>{r.awayTeam?.name || r.awayTeamId.slice(0, 8)}</span>
      ),
    },
    {
      title: 'Sân vận động',
      key: 'stadium',
      render: (_, r) =>
        r.stadium?.name ? (
          <span style={{ fontSize: 13 }}>{r.stadium.name}</span>
        ) : (
          <span style={{ color: '#ccc', fontSize: 13 }}>Chưa chọn</span>
        ),
    },
    {
      title: 'Giờ thi đấu',
      dataIndex: 'kickoffAt',
      width: 150,
      render: (v: string | null) =>
        v ? (
          <Flex align="center" gap={4}>
            <CalendarOutlined style={{ color: '#1677ff', fontSize: 12 }} />
            <span style={{ fontSize: 13 }}>{dayjs(v).format('DD/MM/YYYY HH:mm')}</span>
          </Flex>
        ) : (
          <span style={{ color: '#ccc', fontSize: 13 }}>Chưa đặt</span>
        ),
    },
    {
      title: 'TT',
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
              <Tooltip title="Sửa sân & giờ">
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
            Vòng {roundNo}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            {roundMatches.length} trận
            {dateLabel ? ` · ${dateLabel}` : ''}
          </Typography.Text>
          {allFinished && (
            <Tag color="green" style={{ marginLeft: 'auto' }}>
              Đã kết thúc
            </Tag>
          )}
          {finishedCount > 0 && !allFinished && (
            <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
              {finishedCount}/{roundMatches.length} xong
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
            Lịch thi đấu
          </Typography.Title>
          {seasons.length > 0 && (
            <Select
              value={selectedSeasonId}
              onChange={(v) => setSelectedSeasonId(v)}
              style={{ width: 200 }}
              placeholder="Chọn mùa giải"
              options={seasons.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.year}/${s.year + 1})`,
              }))}
            />
          )}
          {totalMatches > 0 && (
            <Typography.Text type="secondary">
              {totalMatches} trận{draftCount > 0 ? ` · ${draftCount} nháp` : ''}
            </Typography.Text>
          )}
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchSchedule} loading={loading}>
            Tải lại
          </Button>
          {isAdmin && (
            <>
              <Button
                icon={<ThunderboltOutlined />}
                onClick={openGenerateModal}
                loading={generating}
              >
                Tạo lịch tự động
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handlePublish}
                loading={publishing}
                disabled={draftCount === 0}
              >
                Công bố lịch
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
          { key: 'all', label: `Tất cả (${matches.length})` },
          { key: '1', label: `Lượt đi (${matches.filter((m) => m.leg === 1).length})` },
          { key: '2', label: `Lượt về (${matches.filter((m) => m.leg === 2).length})` },
        ]}
        style={{ marginBottom: 12 }}
      />

      {/* Rounds grouped by Collapse */}
      {roundGroups.length === 0 && !loading ? (
        <Flex justify="center" align="center" style={{ padding: 48, color: '#999' }}>
          <Typography.Text type="secondary" style={{ fontSize: 15 }}>
            Chưa có lịch thi đấu. Nhấn "Tạo lịch tự động" để bắt đầu.
          </Typography.Text>
        </Flex>
      ) : (
        <Collapse
          items={collapseItems}
          defaultActiveKey={roundGroups.length > 0 ? [`round-${roundGroups[0][0]}`] : []}
          expandIconPosition="end"
          style={{ background: 'transparent', border: 'none' }}
          size="small"
        />
      )}

      {/* Edit Match Modal */}
      <Modal
        title={
          editingMatch
            ? `Sửa: ${editingMatch.homeTeam?.name ?? '?'} vs ${editingMatch.awayTeam?.name ?? '?'} (V${editingMatch.roundNo})`
            : 'Sửa trận đấu'
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSaveMatch}
        confirmLoading={saving}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="stadiumId" label="Sân vận động">
            <Select
              placeholder="Chọn sân"
              allowClear
              showSearch
              optionFilterProp="label"
              options={stadiums.map((s) => ({
                value: s.id,
                label: `${s.name}${s.city ? ` (${s.city})` : ''}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="kickoffAt" label="Giờ thi đấu">
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn ngày giờ"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Generate Schedule Modal */}
      <Modal
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#faad14' }} />
            <span>Tạo lịch thi đấu tự động</span>
          </Space>
        }
        open={generateModalOpen}
        onCancel={() => setGenerateModalOpen(false)}
        onOk={handleGenerate}
        confirmLoading={generating}
        okText="Tạo lịch"
        cancelText="Hủy"
        okButtonProps={{ type: 'primary', icon: <ThunderboltOutlined /> }}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text>Chọn mùa giải để tạo lịch thi đấu round-robin:</Typography.Text>
        </div>
        <Select
          value={generateSeasonId}
          onChange={(v) => setGenerateSeasonId(v)}
          style={{ width: '100%', marginBottom: 16 }}
          placeholder="Chọn mùa giải"
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
            Lịch thi đấu nháp hiện tại (nếu có) sẽ bị xóa và tạo lại.
          </Typography.Text>
        </div>
      </Modal>
    </Card>
  );
}
