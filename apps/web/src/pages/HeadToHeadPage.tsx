import { SwapOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Typography,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { apiGetHeadToHead, type HeadToHeadResult } from '../services/searchApi';

const { Title } = Typography;

type Team = { id: string; name: string; shortName?: string | null };
type Season = { id: string; name: string };

export default function HeadToHeadPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [team1Id, setTeam1Id] = useState<string>();
  const [team2Id, setTeam2Id] = useState<string>();
  const [seasonId, setSeasonId] = useState<string>();
  const [result, setResult] = useState<HeadToHeadResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get<{ data: Team[] }>('/teams', { params: { limit: 100 } })
      .then((r) => setTeams(r.data.data ?? []))
      .catch(() => {});
    api
      .get<{ data: Season[] }>('/seasons', { params: { limit: 50 } })
      .then((r) => setSeasons(r.data.data ?? []))
      .catch(() => {});
  }, []);

  const fetchH2H = useCallback(async () => {
    if (!team1Id || !team2Id) return;
    setLoading(true);
    try {
      const data = await apiGetHeadToHead(team1Id, team2Id, seasonId);
      setResult(data);
    } catch {
      setResult(null);
    }
    setLoading(false);
  }, [team1Id, team2Id, seasonId]);

  const swapTeams = () => {
    const tmp = team1Id;
    setTeam1Id(team2Id);
    setTeam2Id(tmp);
  };

  const team1 = teams.find((t) => t.id === team1Id);
  const team2 = teams.find((t) => t.id === team2Id);

  return (
    <Card>
      <Title level={4} style={{ marginTop: 0 }}>
        Đối đầu (Head-to-Head)
      </Title>

      <Space wrap style={{ marginBottom: 24 }}>
        <Select
          placeholder="Chọn đội 1"
          value={team1Id}
          onChange={setTeam1Id}
          showSearch
          optionFilterProp="children"
          style={{ width: 220 }}
          allowClear
        >
          {teams
            .filter((t) => t.id !== team2Id)
            .map((t) => (
              <Select.Option key={t.id} value={t.id}>
                {t.name}
              </Select.Option>
            ))}
        </Select>

        <Button icon={<SwapOutlined />} onClick={swapTeams} />

        <Select
          placeholder="Chọn đội 2"
          value={team2Id}
          onChange={setTeam2Id}
          showSearch
          optionFilterProp="children"
          style={{ width: 220 }}
          allowClear
        >
          {teams
            .filter((t) => t.id !== team1Id)
            .map((t) => (
              <Select.Option key={t.id} value={t.id}>
                {t.name}
              </Select.Option>
            ))}
        </Select>

        <Select
          placeholder="Mùa giải (tất cả)"
          value={seasonId}
          onChange={setSeasonId}
          allowClear
          style={{ width: 200 }}
        >
          {seasons.map((s) => (
            <Select.Option key={s.id} value={s.id}>
              {s.name}
            </Select.Option>
          ))}
        </Select>

        <Button type="primary" onClick={fetchH2H} disabled={!team1Id || !team2Id} loading={loading}>
          So sánh
        </Button>
      </Space>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      )}

      {!loading && !result && (
        <Empty description="Chọn 2 đội và nhấn So sánh để xem thống kê đối đầu" />
      )}

      {!loading && result && (
        <>
          {/* Summary */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title={team1?.name ?? 'Đội 1'}
                  value={result.team1Wins}
                  suffix="thắng"
                  valueStyle={{ color: '#1890ff' }}
                />
                <div style={{ fontSize: 12, color: '#888' }}>{result.team1Goals} bàn</div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic title="Tổng trận" value={result.totalMatches} />
                <div style={{ fontSize: 12, color: '#888' }}>{result.draws} hòa</div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title={team2?.name ?? 'Đội 2'}
                  value={result.team2Wins}
                  suffix="thắng"
                  valueStyle={{ color: '#f5222d' }}
                />
                <div style={{ fontSize: 12, color: '#888' }}>{result.team2Goals} bàn</div>
              </Card>
            </Col>
          </Row>

          {/* Match History */}
          {result.matches && result.matches.length > 0 && (
            <Card title="Lịch sử đối đầu" size="small">
              <Table
                rowKey="id"
                dataSource={result.matches}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Vòng',
                    dataIndex: 'roundNo',
                    width: 70,
                    render: (v: number) => `V${v}`,
                  },
                  {
                    title: 'Mùa giải',
                    key: 'season',
                    width: 140,
                    render: (_: unknown, r: { season?: { name: string } }) => r.season?.name ?? '—',
                  },
                  {
                    title: 'Đội nhà',
                    key: 'home',
                    render: (_: unknown, r: { homeTeam?: { name: string } }) => r.homeTeam?.name,
                  },
                  {
                    title: 'Tỉ số',
                    key: 'score',
                    width: 80,
                    align: 'center',
                    render: (_: unknown, r: { homeScore?: number; awayScore?: number }) =>
                      r.homeScore != null ? `${r.homeScore} – ${r.awayScore}` : '—',
                  },
                  {
                    title: 'Đội khách',
                    key: 'away',
                    render: (_: unknown, r: { awayTeam?: { name: string } }) => r.awayTeam?.name,
                  },
                  {
                    title: 'Ngày',
                    key: 'date',
                    width: 120,
                    render: (_: unknown, r: { kickoffAt?: string }) =>
                      r.kickoffAt ? new Date(r.kickoffAt).toLocaleDateString('vi-VN') : '—',
                  },
                ]}
              />
            </Card>
          )}
        </>
      )}
    </Card>
  );
}
