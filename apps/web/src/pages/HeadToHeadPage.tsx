import { SwapOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
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
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { apiGetHeadToHead, type HeadToHeadResult } from '../services/searchApi';

const { Title } = Typography;

type Team = { id: string; name: string; shortName?: string | null };
type Season = { id: string; name: string };

export default function HeadToHeadPage() {
  const { t } = useTranslation();
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

  const team1 = teams.find((tm) => tm.id === team1Id);
  const team2 = teams.find((tm) => tm.id === team2Id);

  return (
    <Card>
      <Title level={4} style={{ marginTop: 0 }}>
        {t('headToHead.title')}
      </Title>

      <Space wrap style={{ marginBottom: 24 }}>
        <Select
          placeholder={t('headToHead.team1Placeholder')}
          value={team1Id}
          onChange={setTeam1Id}
          showSearch
          optionFilterProp="children"
          style={{ width: 220 }}
          allowClear
        >
          {teams
            .filter((tm) => tm.id !== team2Id)
            .map((tm) => (
              <Select.Option key={tm.id} value={tm.id}>
                {tm.name}
              </Select.Option>
            ))}
        </Select>

        <Button icon={<SwapOutlined />} onClick={swapTeams} />

        <Select
          placeholder={t('headToHead.team2Placeholder')}
          value={team2Id}
          onChange={setTeam2Id}
          showSearch
          optionFilterProp="children"
          style={{ width: 220 }}
          allowClear
        >
          {teams
            .filter((tm) => tm.id !== team1Id)
            .map((tm) => (
              <Select.Option key={tm.id} value={tm.id}>
                {tm.name}
              </Select.Option>
            ))}
        </Select>

        <Select
          placeholder={t('headToHead.seasonPlaceholder')}
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
          {t('headToHead.compareBtn')}
        </Button>
      </Space>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      )}

      {!loading && !result && <Empty description={t('headToHead.emptyHint')} />}

      {!loading && result && (
        <>
          {/* Summary */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title={team1?.name ?? t('headToHead.team1Default')}
                  value={result.team1.wins}
                  suffix={t('headToHead.winsSuffix')}
                  valueStyle={{ color: '#1890ff' }}
                />
                <div style={{ fontSize: 12, color: '#888' }}>
                  {result.team1.goals} {t('headToHead.goalsSuffix')}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic title={t('headToHead.totalMatches')} value={result.totalMatches} />
                <div style={{ fontSize: 12, color: '#888' }}>
                  {result.draws} {t('headToHead.drawsSuffix')}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title={team2?.name ?? t('headToHead.team2Default')}
                  value={result.team2.wins}
                  suffix={t('headToHead.winsSuffix')}
                  valueStyle={{ color: '#f5222d' }}
                />
                <div style={{ fontSize: 12, color: '#888' }}>
                  {result.team2.goals} {t('headToHead.goalsSuffix')}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Match History */}
          {result.matches && result.matches.length > 0 && (
            <Card title={t('headToHead.historyTitle')} size="small">
              <Table
                rowKey="id"
                dataSource={result.matches}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: t('headToHead.colRound'),
                    dataIndex: 'roundNo',
                    width: 70,
                    render: (v: number) => `V${v}`,
                  },
                  {
                    title: t('headToHead.colSeason'),
                    key: 'season',
                    width: 140,
                    render: (_: unknown, r) => r.season?.name ?? '—',
                  },
                  {
                    title: t('headToHead.colHome'),
                    key: 'home',
                    render: (_: unknown, r) => r.homeTeam?.name,
                  },
                  {
                    title: t('headToHead.colScore'),
                    key: 'score',
                    width: 80,
                    align: 'center' as const,
                    render: (_: unknown, r) =>
                      r.homeScore != null ? `${r.homeScore} – ${r.awayScore}` : '—',
                  },
                  {
                    title: t('headToHead.colAway'),
                    key: 'away',
                    render: (_: unknown, r) => r.awayTeam?.name,
                  },
                  {
                    title: t('headToHead.colDate'),
                    key: 'date',
                    width: 120,
                    render: (_: unknown, r) =>
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
