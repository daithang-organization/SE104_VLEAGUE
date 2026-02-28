import { CrownOutlined } from '@ant-design/icons';
import { Card, Empty, Flex, message, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import ExportButton from '../components/ExportButton';
import { TableSkeleton } from '../components';
import { apiGetSeasons, type Season } from '../services/seasonApi';
import {
  apiGetStandings,
  apiGetTopScorers,
  type TeamStanding,
  type TopScorer,
} from '../services/standingsApi';

// VLeague: top 2 qualify for AFC Champions League, bottom 2 get relegated
const AFC_CL_COUNT = 2;
const RELEGATION_COUNT = 2;

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

  const totalTeams = standings.length;

  const standingsColumns: ColumnsType<TeamStanding> = [
    {
      title: '#',
      dataIndex: 'position',
      width: 50,
      render: (pos: number) => {
        if (pos === 1) {
          return (
            <strong style={{ color: '#d4a017' }}>
              <CrownOutlined style={{ marginRight: 4 }} />
              {pos}
            </strong>
          );
        }
        return <strong>{pos}</strong>;
      },
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

  // Row class for AFC CL / relegation zone
  const getRowClassName = (record: TeamStanding) => {
    if (record.position <= AFC_CL_COUNT) return 'standings-afc-cl';
    if (totalTeams > 0 && record.position > totalTeams - RELEGATION_COUNT) {
      return 'standings-relegation';
    }
    return '';
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Inline styles for row highlighting */}
      <style>{`
        .standings-afc-cl {
          background: #f6ffed !important;
          border-left: 4px solid #52c41a !important;
        }
        .standings-afc-cl td {
          background: #f6ffed !important;
        }
        .standings-relegation {
          background: #fff1f0 !important;
          border-left: 4px solid #ff4d4f !important;
        }
        .standings-relegation td {
          background: #fff1f0 !important;
        }
      `}</style>

      {loading && standings.length === 0 ? (
        <Card>
          <Typography.Title level={4} style={{ margin: '0 0 16px' }}>
            🏆 Bảng xếp hạng
          </Typography.Title>
          <TableSkeleton />
        </Card>
      ) : (
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
              🏆 Bảng xếp hạng
            </Typography.Title>
            <Space>
              <ExportButton
                columns={[
                  { title: '#', key: 'position' },
                  { title: 'Đội bóng', key: 'teamName' },
                  { title: 'Trận', key: 'played' },
                  { title: 'Thắng', key: 'won' },
                  { title: 'Hòa', key: 'drawn' },
                  { title: 'Thua', key: 'lost' },
                  { title: 'BT', key: 'goalsFor' },
                  { title: 'BN', key: 'goalsAgainst' },
                  { title: 'HS', key: 'goalDifference' },
                  { title: 'Điểm', key: 'points' },
                ]}
                dataSource={standings as unknown as Record<string, unknown>[]}
                filename="bang-xep-hang"
              />
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
            </Space>
          </div>

          <Table
            columns={standingsColumns}
            dataSource={standings}
            rowKey="teamId"
            loading={loading}
            pagination={false}
            size="middle"
            rowClassName={getRowClassName}
            locale={{
              emptyText: loading ? (
                'Đang tải...'
              ) : (
                <Empty description="Chưa có dữ liệu bảng xếp hạng" />
              ),
            }}
          />

          {/* Legend */}
          {totalTeams > 0 && (
            <Flex gap={16} style={{ marginTop: 12, paddingLeft: 4 }} wrap="wrap">
              <Flex align="center" gap={6}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    background: '#f6ffed',
                    border: '2px solid #52c41a',
                  }}
                />
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  AFC Champions League ({AFC_CL_COUNT} đội đầu)
                </Typography.Text>
              </Flex>
              <Flex align="center" gap={6}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    background: '#fff1f0',
                    border: '2px solid #ff4d4f',
                  }}
                />
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  Xuống hạng ({RELEGATION_COUNT} đội cuối)
                </Typography.Text>
              </Flex>
            </Flex>
          )}
        </Card>
      )}

      <Card>
        <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
          <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 0 }}>
            ⚽ Vua phá lưới (Top 10)
          </Typography.Title>
          <ExportButton
            columns={[
              { title: '#', key: 'position' },
              { title: 'Cầu thủ', key: 'playerName' },
              { title: 'Đội bóng', key: 'teamName' },
              { title: 'Bàn thắng', key: 'goals' },
            ]}
            dataSource={topScorers as unknown as Record<string, unknown>[]}
            filename="vua-pha-luoi"
          />
        </Flex>

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
