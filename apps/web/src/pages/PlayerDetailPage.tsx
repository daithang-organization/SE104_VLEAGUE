import { ArrowLeftOutlined, TrophyOutlined, WarningOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  message,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ProfileSkeleton } from '../components';
import { api } from '../lib/api';
import { apiGetPlayerStats, type PlayerStats } from '../services/searchApi';

import { POSITION_MAP } from '../utils/constants';

const { Title } = Typography;

const EVENT_ICONS: Record<string, string> = {
  GOAL: '⚽',
  OWN_GOAL: '⚽🔴',
  PENALTY: '⚽(P)',
  PENALTY_MISS: '❌(P)',
  YELLOW_CARD: '🟨',
  RED_CARD: '🟥',
  SUBSTITUTION: '🔄',
};

type MatchEvent = {
  id: string;
  minute: number;
  type: string;
  goalType?: string | null;
  note?: string | null;
  match: {
    id: string;
    roundNo: number;
    kickoffAt: string | null;
    season?: { id: string; name: string } | null;
  };
  team?: { id: string; name: string } | null;
};

type TeamHistory = {
  id: string;
  jerseyNumber: number | null;
  joinedAt: string;
  leftAt: string | null;
  team: { id: string; name: string; shortName?: string | null };
};

type PlayerDetail = {
  id: string;
  fullName: string;
  dob: string;
  nationality: string;
  position: string;
  playerType: string;
  birthPlace?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  teamPlayers: TeamHistory[];
  matchEvents: MatchEvent[];
};

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsSeason, setStatsSeason] = useState<string>();
  const [seasons, setSeasons] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    api
      .get<{ data: { id: string; name: string }[] }>('/seasons', { params: { limit: 50 } })
      .then((r) => setSeasons(r.data.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetchPlayer = async () => {
      try {
        const res = await api.get<PlayerDetail>(`/players/${id}`);
        if (!cancelled) setPlayer(res.data);
      } catch {
        if (!cancelled) message.error(t('playerDetail.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    setLoading(true);
    fetchPlayer();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Fetch advanced player stats
  useEffect(() => {
    if (!id) return;
    setStatsLoading(true);
    apiGetPlayerStats(id, statsSeason)
      .then(setPlayerStats)
      .catch(() => setPlayerStats(null))
      .finally(() => setStatsLoading(false));
  }, [id, statsSeason]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!player) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4}>{t('playerDetail.notFound')}</Title>
        <Button onClick={() => navigate('/players')}>{t('playerDetail.back')}</Button>
      </div>
    );
  }

  const currentTeam = player.teamPlayers.find((tp) => !tp.leftAt);
  const pos = POSITION_MAP[player.position];

  // Stats
  const goals = player.matchEvents.filter((e) => e.type === 'GOAL' || e.type === 'PENALTY').length;
  const ownGoals = player.matchEvents.filter((e) => e.type === 'OWN_GOAL').length;
  const yellowCards = player.matchEvents.filter((e) => e.type === 'YELLOW_CARD').length;
  const redCards = player.matchEvents.filter((e) => e.type === 'RED_CARD').length;

  const age = new Date().getFullYear() - new Date(player.dob).getFullYear();

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/players')}>
          {t('playerDetail.back')}
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          {player.fullName}
        </Title>
        <Tag color={pos?.color}>{pos?.label ?? player.position}</Tag>
        <Tag color={player.playerType === 'FOREIGN' ? 'purple' : 'cyan'}>
          {t(`playerType.${player.playerType}`)}
        </Tag>
      </Space>

      {/* Stats Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title={t('playerDetail.statGoals')}
              value={goals}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title={t('playerDetail.statYellowCards')}
              value={yellowCards}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title={t('playerDetail.statRedCards')}
              value={redCards}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title={t('playerDetail.statOwnGoals')} value={ownGoals} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Player Info */}
        <Col xs={24} md={12}>
          <Card title={t('playerDetail.infoTitle')} size="small">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label={t('playerDetail.descFullName')}>
                {player.fullName}
              </Descriptions.Item>
              <Descriptions.Item label={t('playerDetail.descDob')}>
                {new Date(player.dob).toLocaleDateString('vi-VN')} (
                {t('playerDetail.descAge', { age })})
              </Descriptions.Item>
              <Descriptions.Item label={t('playerDetail.descNationality')}>
                {player.nationality}
              </Descriptions.Item>
              <Descriptions.Item label={t('playerDetail.descBirthPlace')}>
                {player.birthPlace ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('playerDetail.descPosition')}>
                <Tag color={pos?.color}>{pos?.label ?? player.position}</Tag>
              </Descriptions.Item>
              {player.heightCm && (
                <Descriptions.Item label={t('playerDetail.descHeight')}>
                  {player.heightCm} cm
                </Descriptions.Item>
              )}
              {player.weightKg && (
                <Descriptions.Item label={t('playerDetail.descWeight')}>
                  {player.weightKg} kg
                </Descriptions.Item>
              )}
              <Descriptions.Item label={t('playerDetail.descCurrentTeam')}>
                {currentTeam ? (
                  <a onClick={() => navigate(`/teams/${currentTeam.team.id}`)}>
                    {currentTeam.team.name}
                    {currentTeam.jerseyNumber
                      ? ` (${t('playerDetail.descJerseyNumber', { number: currentTeam.jerseyNumber })})`
                      : ''}
                  </a>
                ) : (
                  <Tag color="default">{t('playerDetail.noTeam')}</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Team History */}
        <Col xs={24} md={12}>
          <Card title={t('playerDetail.teamHistoryTitle')} size="small">
            <Table
              dataSource={player.teamPlayers}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: t('playerDetail.teamHistoryColTeam'),
                  key: 'team',
                  render: (_: unknown, r: TeamHistory) => (
                    <a onClick={() => navigate(`/teams/${r.team.id}`)}>{r.team.name}</a>
                  ),
                },
                {
                  title: t('playerDetail.teamHistoryColJersey'),
                  dataIndex: 'jerseyNumber',
                  width: 70,
                  render: (v: number | null) => v ?? '—',
                },
                {
                  title: t('playerDetail.teamHistoryColFrom'),
                  key: 'from',
                  width: 100,
                  render: (_: unknown, r: TeamHistory) =>
                    new Date(r.joinedAt).toLocaleDateString('vi-VN'),
                },
                {
                  title: t('playerDetail.teamHistoryColTo'),
                  key: 'to',
                  width: 100,
                  render: (_: unknown, r: TeamHistory) =>
                    r.leftAt
                      ? new Date(r.leftAt).toLocaleDateString('vi-VN')
                      : t('playerDetail.teamHistoryPresent'),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Match Events Timeline */}
      {player.matchEvents.length > 0 && (
        <Card title={t('playerDetail.eventsTitle')} size="small" style={{ marginTop: 16 }}>
          <Timeline
            items={player.matchEvents.slice(0, 30).map((evt) => ({
              color:
                evt.type === 'GOAL' || evt.type === 'PENALTY'
                  ? 'green'
                  : evt.type === 'RED_CARD'
                    ? 'red'
                    : evt.type === 'YELLOW_CARD'
                      ? 'orange'
                      : 'blue',
              children: (
                <Space>
                  <span>{EVENT_ICONS[evt.type] ?? '•'}</span>
                  <span>{t('playerDetail.eventMinute', { minute: evt.minute })}</span>
                  <Tag>{evt.team?.name ?? '—'}</Tag>
                  <span style={{ color: '#888' }}>
                    V{evt.match.roundNo}
                    {evt.match.season ? ` — ${evt.match.season.name}` : ''}
                  </span>
                  {evt.note && <span style={{ color: '#aaa' }}>({evt.note})</span>}
                </Space>
              ),
            }))}
          />
          {player.matchEvents.length > 30 && (
            <div style={{ textAlign: 'center', color: '#888' }}>
              {t('playerDetail.eventMoreCount', { count: player.matchEvents.length - 30 })}
            </div>
          )}
        </Card>
      )}

      {/* Advanced Stats with Chart */}
      <Card
        title={t('playerDetail.advancedStatsTitle')}
        size="small"
        style={{ marginTop: 16 }}
        extra={
          <Select
            placeholder={t('playerDetail.seasonPlaceholder')}
            value={statsSeason}
            onChange={setStatsSeason}
            allowClear
            style={{ width: 180 }}
            size="small"
          >
            {seasons.map((s) => (
              <Select.Option key={s.id} value={s.id}>
                {s.name}
              </Select.Option>
            ))}
          </Select>
        }
      >
        {statsLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        ) : playerStats ? (
          <Tabs
            items={[
              {
                key: 'overview',
                label: t('playerDetail.statsTabOverview'),
                children: (
                  <Row gutter={[16, 16]}>
                    <Col xs={8} sm={4}>
                      <Statistic
                        title={t('playerDetail.statsMatchesPlayed')}
                        value={playerStats.matchesPlayed}
                      />
                    </Col>
                    <Col xs={8} sm={4}>
                      <Statistic
                        title={t('playerDetail.statsGoals')}
                        value={playerStats.goals}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col xs={8} sm={4}>
                      <Statistic
                        title={t('playerDetail.statsAssists')}
                        value={playerStats.assists}
                      />
                    </Col>
                    <Col xs={8} sm={4}>
                      <Statistic
                        title={t('playerDetail.statsOwnGoals')}
                        value={playerStats.ownGoals}
                      />
                    </Col>
                    <Col xs={8} sm={4}>
                      <Statistic
                        title={t('playerDetail.statsYellowCards')}
                        value={playerStats.yellowCards}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                    <Col xs={8} sm={4}>
                      <Statistic
                        title={t('playerDetail.statsRedCards')}
                        value={playerStats.redCards}
                        valueStyle={{ color: '#ff4d4f' }}
                      />
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'chart',
                label: t('playerDetail.statsTabChart'),
                children:
                  playerStats.goalsByRound && Object.keys(playerStats.goalsByRound).length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={Object.entries(playerStats.goalsByRound).map(([round, goals]) => ({
                          round: Number(round),
                          goals,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="round" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar
                          dataKey="goals"
                          fill="#1890ff"
                          name={t('playerDetail.chartBarLabel')}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                      {t('playerDetail.chartEmpty')}
                    </div>
                  ),
              },
            ]}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 24, color: '#888' }}>
            {t('playerDetail.statsLoadError')}
          </div>
        )}
      </Card>
    </div>
  );
}
