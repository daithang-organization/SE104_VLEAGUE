import { ReloadOutlined, SendOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Card, message, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import {
  apiGenerateSchedule,
  apiGetSchedule,
  apiPublishSchedule,
  type ScheduleMatch,
} from '../services/scheduleApi';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'default' },
  PUBLISHED: { label: 'Đã công bố', color: 'blue' },
  LOCKED: { label: 'Đã khóa', color: 'orange' },
  FINISHED: { label: 'Kết thúc', color: 'green' },
  POSTPONED: { label: 'Hoãn', color: 'red' },
};

export default function SchedulePage() {
  const [matches, setMatches] = useState<ScheduleMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetSchedule();
      setMatches(data.matches ?? []);
    } catch {
      message.error('Không thể tải lịch thi đấu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await apiGenerateSchedule();
      message.success(result.message || 'Tạo lịch thi đấu thành công!');
      fetchSchedule();
    } catch {
      message.error('Không thể tạo lịch thi đấu');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const result = await apiPublishSchedule();
      message.success(result.message || 'Công bố lịch thi đấu thành công!');
      fetchSchedule();
    } catch {
      message.error('Không thể công bố lịch thi đấu');
    } finally {
      setPublishing(false);
    }
  };

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
      width: 70,
      render: (leg: number) => (leg === 1 ? 'Lượt đi' : 'Lượt về'),
    },
    {
      title: 'Đội nhà',
      key: 'home',
      render: (_, r) => r.homeTeam?.name ?? r.homeTeamId.slice(0, 8),
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
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          Lịch thi đấu
        </Typography.Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchSchedule} loading={loading}>
            Tải lại
          </Button>
          <Button icon={<ThunderboltOutlined />} onClick={handleGenerate} loading={generating}>
            Tạo lịch tự động
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handlePublish}
            loading={publishing}
          >
            Công bố lịch
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={matches}
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
