import { Card, message, Select, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { apiGetMatches, type Match } from '../../services/matchApi';
import { apiGetSeasons, type Season } from '../../services/seasonApi';

const { Title } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  FINISHED: { label: 'Kết thúc', color: 'green' },
};

export default function PublicResultsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>();

  useEffect(() => {
    apiGetSeasons().then((data) => {
      setSeasons(data);
      if (data.length > 0) setSelectedSeasonId(data[0].id);
    });
  }, []);

  const fetchResults = useCallback(async () => {
    if (!selectedSeasonId) return;
    setLoading(true);
    try {
      const res = await apiGetMatches(selectedSeasonId, 1, 200);
      // Only show finished matches
      setMatches(res.data.filter((m) => m.status === 'FINISHED'));
    } catch {
      message.error('Không thể tải kết quả');
    } finally {
      setLoading(false);
    }
  }, [selectedSeasonId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const columns = [
    {
      title: 'Vòng',
      key: 'round',
      width: 70,
      render: (_: unknown, r: Match) => `V${r.roundNo}`,
    },
    {
      title: 'Đội nhà',
      key: 'home',
      render: (_: unknown, r: Match) => <strong>{r.homeTeam?.name ?? '—'}</strong>,
    },
    {
      title: 'Tỷ số',
      key: 'score',
      width: 100,
      align: 'center' as const,
      render: (_: unknown, r: Match) => (
        <strong style={{ fontSize: 15 }}>
          {r.homeScore} – {r.awayScore}
        </strong>
      ),
    },
    {
      title: 'Đội khách',
      key: 'away',
      render: (_: unknown, r: Match) => <span>{r.awayTeam?.name ?? '—'}</span>,
    },
    {
      title: 'Sân',
      key: 'stadium',
      render: (_: unknown, r: Match) => (
        <span style={{ color: '#666', fontSize: 12 }}>{r.stadium?.name ?? '—'}</span>
      ),
    },
    {
      title: 'Ngày',
      key: 'date',
      width: 130,
      render: (_: unknown, r: Match) =>
        r.kickoffAt ? dayjs(r.kickoffAt).format('DD/MM/YYYY') : '—',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      render: (_: unknown, r: Match) => {
        const s = STATUS_MAP[r.status] ?? { label: r.status, color: 'default' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} align="center">
        <Title level={3} style={{ margin: 0 }}>
          ⚽ Kết quả trận đấu
        </Title>
        <Select
          value={selectedSeasonId}
          onChange={setSelectedSeasonId}
          style={{ width: 220 }}
          placeholder="Chọn mùa giải"
          options={seasons.map((s) => ({
            value: s.id,
            label: `${s.name} (${s.year}/${s.year + 1})`,
          }))}
        />
      </Space>
      <Card>
        <Table
          dataSource={matches}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15 }}
          size="middle"
          locale={{ emptyText: 'Chưa có kết quả' }}
        />
      </Card>
    </div>
  );
}
