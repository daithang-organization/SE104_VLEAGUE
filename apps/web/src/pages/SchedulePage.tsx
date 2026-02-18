import {
  ExclamationCircleOutlined,
  ReloadOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Card, message, Modal, Select, Space, Table, Tabs, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  apiGenerateSchedule,
  apiGetSchedule,
  apiPublishSchedule,
  type ScheduleMatch,
} from '../services/scheduleApi';
import { apiGetSeasons, type Season } from '../services/seasonApi';

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
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeLeg, setActiveLeg] = useState<string>('all');

  const isAdmin = user?.role === 'ADMIN';

  // Fetch seasons on mount
  useEffect(() => {
    apiGetSeasons()
      .then((list) => {
        setSeasons(list);
        // Auto-select first active season
        const active = list.find((s) => s.status === 'IN_PROGRESS' || s.status === 'UPCOMING');
        if (active) setSelectedSeasonId(active.id);
        else if (list.length > 0) setSelectedSeasonId(list[0].id);
      })
      .catch(() => {
        /* ignore */
      });
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

  const handleGenerate = async () => {
    Modal.confirm({
      title: 'Tạo lịch thi đấu tự động?',
      icon: <ExclamationCircleOutlined />,
      content: 'Lịch thi đấu nháp hiện tại (nếu có) sẽ bị xóa và tạo lại. Bạn có chắc không?',
      okText: 'Tạo lịch',
      cancelText: 'Hủy',
      onOk: async () => {
        setGenerating(true);
        try {
          const result = await apiGenerateSchedule(selectedSeasonId);
          message.success(result.message || 'Tạo lịch thi đấu thành công!');
          fetchSchedule();
        } catch (err: unknown) {
          const msg =
            err &&
            typeof err === 'object' &&
            'response' in err &&
            (err as { response?: { data?: { message?: string } } }).response?.data?.message;
          message.error(msg || 'Không thể tạo lịch thi đấu');
        } finally {
          setGenerating(false);
        }
      },
    });
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

  // Filter by leg
  const filteredMatches = useMemo(() => {
    if (activeLeg === 'all') return matches;
    return matches.filter((m) => m.leg === Number(activeLeg));
  }, [matches, activeLeg]);

  // Stats
  const totalMatches = matches.length;
  const draftCount = matches.filter((m) => m.status === 'DRAFT').length;

  const columns: ColumnsType<ScheduleMatch> = [
    {
      title: 'Vòng',
      dataIndex: 'roundNo',
      width: 80,
      sorter: (a, b) => a.roundNo - b.roundNo,
      render: (roundNo: number) => <strong>V{roundNo}</strong>,
    },
    {
      title: 'Lượt',
      dataIndex: 'leg',
      width: 80,
      render: (leg: number) => (
        <Tag color={leg === 1 ? 'blue' : 'volcano'}>{leg === 1 ? 'Lượt đi' : 'Lượt về'}</Tag>
      ),
    },
    {
      title: 'Đội nhà',
      key: 'home',
      render: (_, r) => <strong>{r.homeTeam?.name ?? r.homeTeamId.slice(0, 8)}</strong>,
    },
    {
      title: 'Tỉ số',
      key: 'score',
      width: 100,
      align: 'center',
      render: (_, r) =>
        r.homeScore != null && r.awayScore != null ? (
          <strong>
            {r.homeScore} – {r.awayScore}
          </strong>
        ) : (
          <span style={{ color: '#999' }}>— : —</span>
        ),
    },
    {
      title: 'Đội khách',
      key: 'away',
      render: (_, r) => r.awayTeam?.name ?? r.awayTeamId.slice(0, 8),
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
      sorter: (a, b) => new Date(a.kickoffAt ?? 0).getTime() - new Date(b.kickoffAt ?? 0).getTime(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const s = STATUS_MAP[status] ?? { label: status, color: 'default' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
      filters: Object.entries(STATUS_MAP).map(([value, { label }]) => ({
        text: label,
        value,
      })),
      onFilter: (value, record) => record.status === value,
    },
  ];

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Space>
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
                label: `${s.name} (${s.year})`,
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
              <Button icon={<ThunderboltOutlined />} onClick={handleGenerate} loading={generating}>
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
      </div>

      <Tabs
        activeKey={activeLeg}
        onChange={setActiveLeg}
        items={[
          { key: 'all', label: `Tất cả (${matches.length})` },
          {
            key: '1',
            label: `Lượt đi (${matches.filter((m) => m.leg === 1).length})`,
          },
          {
            key: '2',
            label: `Lượt về (${matches.filter((m) => m.leg === 2).length})`,
          },
        ]}
        style={{ marginBottom: 8 }}
      />

      <Table
        columns={columns}
        dataSource={filteredMatches}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        size="middle"
        locale={{
          emptyText: loading
            ? 'Đang tải...'
            : 'Chưa có lịch thi đấu. Nhấn "Tạo lịch tự động" để bắt đầu.',
        }}
      />
    </Card>
  );
}
