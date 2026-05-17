import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  LeftOutlined,
  RightOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  message,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ProfileSkeleton } from '../components';
import { apiGetTeam, type TeamDetail } from '../services/teamApi';

import { POSITION_MAP, STATUS_MAP } from '../utils/constants';

const { Title } = Typography;

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMatchRoundNo, setActiveMatchRoundNo] = useState<number | undefined>();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetchTeam = async () => {
      try {
        const data = await apiGetTeam(id);
        if (!cancelled) setTeam(data);
      } catch (_err) {
        if (!cancelled) message.error(t('teamDetail.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    setLoading(true);
    fetchTeam();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Merge home + away matches, sort by kickoff desc
  const allMatches = useMemo(
    () =>
      [
        ...(team?.homeMatches || []).map((m) => ({ ...m, side: 'home' as const })),
        ...(team?.awayMatches || []).map((m) => ({ ...m, side: 'away' as const })),
      ].sort((a, b) => {
        if (!a.kickoffAt || !b.kickoffAt) return 0;
        return new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime();
      }),
    [team],
  );

  const matchRoundGroups = useMemo(() => {
    const map = new Map<number, typeof allMatches>();
    for (const match of allMatches) {
      const list = map.get(match.roundNo) ?? [];
      list.push(match);
      map.set(match.roundNo, list);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [allMatches]);

  useEffect(() => {
    if (matchRoundGroups.length === 0) {
      setActiveMatchRoundNo(undefined);
      return;
    }
    if (
      !activeMatchRoundNo ||
      !matchRoundGroups.some(([roundNo]) => roundNo === activeMatchRoundNo)
    ) {
      setActiveMatchRoundNo(matchRoundGroups[0][0]);
    }
  }, [activeMatchRoundNo, matchRoundGroups]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!team) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4}>{t('teamDetail.notFound')}</Title>
        <Button onClick={() => navigate('/teams')}>{t('teamDetail.back')}</Button>
      </div>
    );
  }

  const activeMatchRoundIndex = matchRoundGroups.findIndex(
    ([roundNo]) => roundNo === activeMatchRoundNo,
  );
  const activeMatchRound =
    activeMatchRoundIndex >= 0 ? matchRoundGroups[activeMatchRoundIndex] : undefined;
  const activeRoundMatches = activeMatchRound?.[1] ?? [];
  const activeRoundDateLabel =
    activeRoundMatches.length > 0 && activeRoundMatches[0].kickoffAt
      ? new Date(activeRoundMatches[0].kickoffAt).toLocaleDateString('vi-VN')
      : '';

  const getMatchResult = (m: (typeof allMatches)[0]) => {
    if (m.homeScore == null || m.awayScore == null) return null;
    const isHome = m.side === 'home';
    const ours = isHome ? m.homeScore : m.awayScore;
    const theirs = isHome ? m.awayScore : m.homeScore;
    if (ours > theirs) return { label: t('teamDetail.matchResultWin'), color: 'green' };
    if (ours < theirs) return { label: t('teamDetail.matchResultLoss'), color: 'red' };
    return { label: t('teamDetail.matchResultDraw'), color: 'orange' };
  };

  const rosterColumns = [
    {
      title: t('teamDetail.rosterColJersey'),
      dataIndex: 'jerseyNumber',
      key: 'jerseyNumber',
      width: 80,
      sorter: (a: TeamDetail['roster'][0], b: TeamDetail['roster'][0]) =>
        (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99),
      render: (v: number | null) => v ?? '—',
    },
    {
      title: t('teamDetail.rosterColName'),
      key: 'fullName',
      render: (_: unknown, r: TeamDetail['roster'][0]) => (
        <a onClick={() => navigate(`/players/${r.player.id}`)}>{r.player.fullName}</a>
      ),
    },
    {
      title: t('teamDetail.rosterColPosition'),
      key: 'position',
      render: (_: unknown, r: TeamDetail['roster'][0]) => {
        const p = POSITION_MAP[r.player.position];
        return <Tag color={p?.color}>{p?.label ?? r.player.position}</Tag>;
      },
    },
    {
      title: t('teamDetail.rosterColNationality'),
      key: 'nationality',
      render: (_: unknown, r: TeamDetail['roster'][0]) => r.player.nationality,
    },
    {
      title: t('teamDetail.rosterColType'),
      key: 'playerType',
      render: (_: unknown, r: TeamDetail['roster'][0]) => (
        <Tag color={r.player.playerType === 'FOREIGN' ? 'purple' : 'cyan'}>
          {t(`playerType.${r.player.playerType}`)}
        </Tag>
      ),
    },
  ];

  const matchColumns = [
    {
      title: t('teamDetail.matchColRound'),
      key: 'round',
      width: 80,
      align: 'center' as const,
      render: (_: unknown, r: (typeof allMatches)[0]) => `V${r.roundNo}`,
    },
    {
      title: t('teamDetail.matchColOpponent'),
      key: 'opponent',
      align: 'center' as const,
      render: (_: unknown, r: (typeof allMatches)[0]) => {
        const opponent = r.side === 'home' ? (r.awayTeam?.name ?? '—') : (r.homeTeam?.name ?? '—');
        const prefix =
          r.side === 'home' ? t('teamDetail.matchSideHome') : t('teamDetail.matchSideAway');
        return `${prefix} ${opponent}`;
      },
    },
    {
      title: t('teamDetail.matchColScore'),
      key: 'score',
      width: 100,
      align: 'center' as const,
      render: (_: unknown, r: (typeof allMatches)[0]) =>
        r.homeScore != null ? `${r.homeScore} - ${r.awayScore}` : '— : —',
    },
    {
      title: t('teamDetail.matchColResult'),
      key: 'result',
      width: 80,
      align: 'center' as const,
      render: (_: unknown, r: (typeof allMatches)[0]) => {
        const res = getMatchResult(r);
        return res ? <Tag color={res.color}>{res.label}</Tag> : '—';
      },
    },
    {
      title: t('teamDetail.matchColStatus'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center' as const,
      render: (s: string) => {
        const st = STATUS_MAP[s];
        return <Tag color={st?.color}>{st?.label ?? s}</Tag>;
      },
    },
    {
      title: t('teamDetail.matchColDate'),
      key: 'date',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, r: (typeof allMatches)[0]) =>
        r.kickoffAt ? new Date(r.kickoffAt).toLocaleDateString('vi-VN') : '—',
    },
  ];

  const currentStanding = (team.standings || []).length > 0 ? team.standings[0] : null;

  return (
    <div>
      <Space style={{ marginBottom: 16 }} align="center">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/teams')}>
          {t('teamDetail.back')}
        </Button>
        {team.logoUrl && (
          <img
            src={team.logoUrl}
            alt={team.name}
            style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 8 }}
          />
        )}
        <Title level={3} style={{ margin: 0 }}>
          {team.name}
        </Title>
        <Tag color={team.status === 'ACTIVE' ? 'green' : 'red'}>
          {team.status === 'ACTIVE' ? t('teamDetail.statusActive') : t('teamDetail.statusInactive')}
        </Tag>
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic
              title={t('teamDetail.statPlayers')}
              value={(team.roster || []).length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic
              title={t('teamDetail.statMatches')}
              value={allMatches.length}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic
              title={t('teamDetail.statStadium')}
              value={team.stadium?.name ?? t('teamDetail.stadiumEmpty')}
              prefix={<EnvironmentOutlined />}
              styles={{ content: { fontSize: 16 } }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: 'info',
            label: t('teamDetail.tabInfo'),
            children: (
              <Card>
                <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label={t('teamDetail.descName')}>
                    {team.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('teamDetail.descShortName')}>
                    {team.shortName ?? '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('teamDetail.descCity')}>
                    {team.city ?? '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('teamDetail.descStadium')}>
                    {team.stadium?.name ?? '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('teamDetail.descStatus')}>
                    <Tag color={team.status === 'ACTIVE' ? 'green' : 'red'}>
                      {team.status === 'ACTIVE'
                        ? t('teamDetail.statusActive')
                        : t('teamDetail.statusInactiveShort')}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>

                {currentStanding && (
                  <Card
                    size="small"
                    title={t('teamDetail.standingsTitle', { season: currentStanding.season.name })}
                    style={{ marginTop: 16 }}
                  >
                    <Row gutter={16}>
                      {[
                        { label: t('teamDetail.standingRank'), value: currentStanding.rank ?? '—' },
                        { label: t('teamDetail.standingPoints'), value: currentStanding.points },
                        { label: t('teamDetail.standingPlayed'), value: currentStanding.played },
                        { label: t('teamDetail.standingWon'), value: currentStanding.win },
                        { label: t('teamDetail.standingDrawn'), value: currentStanding.draw },
                        { label: t('teamDetail.standingLost'), value: currentStanding.loss },
                        { label: t('teamDetail.standingGF'), value: currentStanding.goalsFor },
                        { label: t('teamDetail.standingGA'), value: currentStanding.goalsAgainst },
                        { label: t('teamDetail.standingGD'), value: currentStanding.goalDiff },
                      ].map((s) => (
                        <Col key={s.label} span={4} xs={8} sm={4}>
                          <Statistic title={s.label} value={s.value} />
                        </Col>
                      ))}
                    </Row>
                  </Card>
                )}
              </Card>
            ),
          },
          {
            key: 'roster',
            label: t('teamDetail.tabRoster', { count: (team.roster || []).length }),
            children: (
              <Table
                dataSource={team.roster || []}
                columns={rosterColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ),
          },
          {
            key: 'matches',
            label: t('teamDetail.tabMatches', { count: allMatches.length }),
            children: (
              <Card>
                {matchRoundGroups.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                    {t('common.noData')}
                  </div>
                ) : (
                  <>
                    <Space
                      align="center"
                      style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}
                      size={18}
                    >
                      <Button
                        shape="circle"
                        size="large"
                        icon={<LeftOutlined />}
                        disabled={activeMatchRoundIndex <= 0}
                        onClick={() =>
                          setActiveMatchRoundNo(matchRoundGroups[activeMatchRoundIndex - 1][0])
                        }
                      />
                      <div style={{ minWidth: 220, textAlign: 'center' }}>
                        <Typography.Title level={4} style={{ margin: 0 }}>
                          {activeMatchRound
                            ? t('schedule.roundLabel', { round: activeMatchRound[0] })
                            : t('teamDetail.tabMatches', { count: allMatches.length })}
                        </Typography.Title>
                        <Typography.Text type="secondary">
                          {activeRoundDateLabel
                            ? `${activeRoundMatches.length} trận · ${activeRoundDateLabel}`
                            : `${activeRoundMatches.length} trận`}
                        </Typography.Text>
                      </div>
                      <Button
                        shape="circle"
                        size="large"
                        icon={<RightOutlined />}
                        disabled={
                          activeMatchRoundIndex < 0 ||
                          activeMatchRoundIndex >= matchRoundGroups.length - 1
                        }
                        onClick={() =>
                          setActiveMatchRoundNo(matchRoundGroups[activeMatchRoundIndex + 1][0])
                        }
                      />
                    </Space>
                    <Table
                      dataSource={activeRoundMatches}
                      columns={matchColumns}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  </>
                )}
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
