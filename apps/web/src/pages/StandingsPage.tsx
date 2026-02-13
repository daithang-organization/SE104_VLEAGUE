import { Card, Empty, message, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { apiGetSeasons, type Season } from '../services/seasonApi';
import {
  apiGetStandings,
  apiGetTopScorers,
  type TeamStanding,
  type TopScorer,
} from '../services/standingsApi';

export default function StandingsPage() {
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string | undefined>();

  useEffect(() => {
    apiGetSeasons()
      .then(setSeasons)
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async (seasonId?: string) => {
    setLoading(true);
    try {
      const [standingsData, scorersData] = await Promise.all([
        apiGetStandings(seasonId),
        apiGetTopScorers(seasonId, 10),
      ]);
      setStandings(standingsData);
      setTopScorers(scorersData);
    } catch {
      message.error('Không thể tải bảng xếp hạng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedSeason);
  }, [selectedSeason, fetchData]);

  const handleSeasonChange = (value: string) => {
    setSelectedSeason(value || undefined);
  };

  const standingsColumns: ColumnsType<TeamStanding> = [
    {
      title: '#',
      dataIndex: 'position',
      width: 50,
      render: (pos: number) => <strong>{pos}</strong>,
    },
    { title: 'Đội bóng', dataIndex: 'teamName' },
    { title: 'Trận', dataIndex: 'played', width: 60, align: 'center' },
    { title: 'Thắng', dataIndex: 'won', width: 60, align: 'center' },
    { title: 'Hòa', dataIndex: 'drawn', width: 60, align: 'center' },
    { title: 'Thua', dataIndex: 'lost', width: 60, align: 'center' },
    { title: 'BT', dataIndex: 'goalsFor', width: 60, align: 'center' },
    { title: 'BN', dataIndex: 'goalsAgainst', width: 60, align: 'center' },
    { title: 'HS', dataIndex: 'goalDifference', width: 60, align: 'center' },
    {
      title: 'Điểm',
      dataIndex: 'points',
      width: 70,
      align: 'center',
      render: (pts: number) => <strong>{pts}</strong>,
    },
  ];

  const scorerColumns: ColumnsType<TopScorer> = [
    {
      title: '#',
      dataIndex: 'position',
      width: 50,
    },
    { title: 'Cầu thủ', dataIndex: 'playerName' },
    { title: 'Đội bóng', dataIndex: 'teamName' },
    {
      title: 'Bàn thắng',
      dataIndex: 'goals',
      width: 100,
      align: 'center',
      render: (goals: number) => <strong>{goals}</strong>,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
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
            Bảng xếp hạng
          </Typography.Title>
          <Select
            placeholder="Chọn mùa giải"
            value={selectedSeason}
            onChange={handleSeasonChange}
            style={{ width: 200 }}
            allowClear
          >
            {seasons.map((s) => (
              <Select.Option key={s.id} value={s.id}>
                {s.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <Table
          columns={standingsColumns}
          dataSource={standings}
          rowKey="teamId"
          loading={loading}
          pagination={false}
          size="middle"
          locale={{
            emptyText: loading ? (
              'Đang tải...'
            ) : (
              <Empty description="Chưa có dữ liệu bảng xếp hạng" />
            ),
          }}
        />
      </Card>

      <Card>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          ⚽ Vua phá lưới (Top 10)
        </Typography.Title>

        <Table
          columns={scorerColumns}
          dataSource={topScorers}
          rowKey="playerId"
          loading={loading}
          pagination={false}
          size="middle"
          locale={{
            emptyText: loading ? (
              'Đang tải...'
            ) : (
              <Empty description="Chưa có dữ liệu vua phá lưới" />
            ),
          }}
        />
      </Card>
    </Space>
  );
}
