import { Card, message, Select, Space, Table, Tag, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { apiGetSeasons, type Season } from '../../services/seasonApi';
import { apiGetStandings, type TeamStanding } from '../../services/standingsApi';

const { Title } = Typography;

export default function PublicStandingsPage() {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>();
  const prevSeasonId = useRef<string | undefined>();

  useEffect(() => {
    apiGetSeasons().then((data) => {
      setSeasons(data);
      if (data.length > 0) setSelectedSeasonId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedSeasonId || selectedSeasonId === prevSeasonId.current) return;
    prevSeasonId.current = selectedSeasonId;

    let cancelled = false;
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect -- data fetch pattern
    apiGetStandings(selectedSeasonId)
      .then((data) => {
        if (!cancelled) setStandings(data);
      })
      .catch(() => {
        if (!cancelled) message.error('Không thể tải bảng xếp hạng');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSeasonId]);

  const columns = [
    {
      title: '#',
      dataIndex: 'position',
      key: 'position',
      width: 50,
      render: (v: number) => <strong>{v}</strong>,
    },
    {
      title: 'Đội',
      dataIndex: 'teamName',
      key: 'team',
      render: (v: string) => <strong>{v}</strong>,
    },
    { title: 'Trận', dataIndex: 'played', width: 60, align: 'center' as const },
    {
      title: 'T',
      dataIndex: 'won',
      width: 50,
      align: 'center' as const,
      render: (v: number) => <span style={{ color: '#52c41a' }}>{v}</span>,
    },
    {
      title: 'H',
      dataIndex: 'drawn',
      width: 50,
      align: 'center' as const,
      render: (v: number) => <span style={{ color: '#faad14' }}>{v}</span>,
    },
    {
      title: 'B',
      dataIndex: 'lost',
      width: 50,
      align: 'center' as const,
      render: (v: number) => <span style={{ color: '#ff4d4f' }}>{v}</span>,
    },
    { title: 'BT', dataIndex: 'goalsFor', width: 50, align: 'center' as const },
    { title: 'BN', dataIndex: 'goalsAgainst', width: 50, align: 'center' as const },
    { title: 'HS', dataIndex: 'goalDifference', width: 50, align: 'center' as const },
    {
      title: 'Điểm',
      dataIndex: 'points',
      width: 60,
      align: 'center' as const,
      render: (v: number) => (
        <Tag color="blue">
          <strong>{v}</strong>
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} align="center">
        <Title level={3} style={{ margin: 0 }}>
          🏆 Bảng xếp hạng V-League
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
          dataSource={standings}
          columns={columns}
          rowKey="teamId"
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
