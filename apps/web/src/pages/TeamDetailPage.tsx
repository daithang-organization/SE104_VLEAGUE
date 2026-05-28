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
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { ProfileSkeleton } from '../components';
import { apiGetTeam, type TeamDetail } from '../services/teamApi';

import { POSITION_MAP, STATUS_MAP } from '../utils/constants';
import { getTeamLogoUrl, getTeamThemeStyle } from '../utils/teamLogos';

const { Title } = Typography;

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMatchMonthKey, setActiveMatchMonthKey] = useState<string | undefined>();

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

  // Merge home + away matches, sort by kickoff date for the monthly team fixture view.
  const allMatches = useMemo(
    () =>
      [
        ...(team?.homeMatches || []).map((m) => ({ ...m, side: 'home' as const })),
        ...(team?.awayMatches || []).map((m) => ({ ...m, side: 'away' as const })),
      ].sort((a, b) => {
        if (!a.kickoffAt && !b.kickoffAt) return a.roundNo - b.roundNo;
        if (!a.kickoffAt) return 1;
        if (!b.kickoffAt) return -1;
        return new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();
      }),
    [team],
  );

  const matchMonthGroups = useMemo(() => {
    const map = new Map<string, typeof allMatches>();
    for (const match of allMatches) {
      const key = match.kickoffAt ? dayjs(match.kickoffAt).format('YYYY-MM') : 'unscheduled';
      const list = map.get(key) ?? [];
      list.push(match);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === 'unscheduled') return 1;
      if (b === 'unscheduled') return -1;
      return a.localeCompare(b);
    });
  }, [allMatches]);

  useEffect(() => {
    if (matchMonthGroups.length === 0) {
      setActiveMatchMonthKey(undefined);
      return;
    }
    if (
      !activeMatchMonthKey ||
      !matchMonthGroups.some(([monthKey]) => monthKey === activeMatchMonthKey)
    ) {
      const todayMonth = dayjs().format('YYYY-MM');
      const currentMonth = matchMonthGroups.find(([monthKey]) => monthKey === todayMonth);
      const nextMonth = matchMonthGroups.find(
        ([monthKey]) => monthKey !== 'unscheduled' && monthKey >= todayMonth,
      );
      setActiveMatchMonthKey((currentMonth ?? nextMonth ?? matchMonthGroups[0])[0]);
    }
  }, [activeMatchMonthKey, matchMonthGroups]);

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

  const activeMatchMonthIndex = matchMonthGroups.findIndex(
    ([monthKey]) => monthKey === activeMatchMonthKey,
  );
  const activeMatchMonth =
    activeMatchMonthIndex >= 0 ? matchMonthGroups[activeMatchMonthIndex] : undefined;
  const activeMonthMatches = activeMatchMonth?.[1] ?? [];
  const activeMonthLabel =
    activeMatchMonth?.[0] === 'unscheduled'
      ? 'Chưa xếp lịch'
      : activeMatchMonth?.[0]
        ? `Tháng ${dayjs(`${activeMatchMonth[0]}-01`).format('M/YYYY')}`
        : t('teamDetail.tabMatches', { count: allMatches.length });

  const formatMatchDateLabel = (kickoffAt: string | null) => {
    if (!kickoffAt) return 'Chưa xếp lịch';
    const date = dayjs(kickoffAt);
    const weekday = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][date.day()];
    return `${weekday}, ${date.format('D/M')}`;
  };

  const getTeamDisplay = (match: (typeof allMatches)[0], side: 'home' | 'away') => {
    if (side === match.side) {
      return {
        id: team.id,
        name: team.shortName || team.name,
        logoUrl: getTeamLogoUrl(team),
      };
    }

    const opponent = match.side === 'home' ? match.awayTeam : match.homeTeam;
    return {
      id: opponent?.id,
      name: opponent?.shortName || opponent?.name || '—',
      logoUrl: getTeamLogoUrl(opponent),
    };
  };

  const renderTeamLogo = (displayTeam: ReturnType<typeof getTeamDisplay>) =>
    displayTeam.logoUrl ? (
      <img src={displayTeam.logoUrl} alt={displayTeam.name} className="team-match-logo" />
    ) : (
      <div className="team-match-logo team-match-logo-fallback">
        {displayTeam.name.slice(0, 2).toUpperCase()}
      </div>
    );

  const renderTeamFixture = (match: (typeof allMatches)[0]) => {
    const leftTeam = getTeamDisplay(match, 'home');
    const rightTeam = getTeamDisplay(match, 'away');
    const hasScore = match.homeScore != null && match.awayScore != null;
    const scoreText = hasScore
      ? `${match.homeScore} - ${match.awayScore}`
      : match.kickoffAt
        ? dayjs(match.kickoffAt).format('HH:mm')
        : 'vs';

    return (
      <div key={match.id} className="team-fixture-row">
        <div className="team-fixture-meta">
          <span className="team-fixture-round">Vòng {match.roundNo}</span>
          <Tag color={STATUS_MAP[match.status]?.color}>
            {STATUS_MAP[match.status]?.label ?? match.status}
          </Tag>
        </div>
        <button
          type="button"
          className="team-fixture-team team-fixture-team-left"
          onClick={() => leftTeam.id && navigate(`/teams/${leftTeam.id}`)}
        >
          <span>{leftTeam.name}</span>
          {renderTeamLogo(leftTeam)}
        </button>
        <button
          type="button"
          className={`team-fixture-score${hasScore ? ' is-final' : ''}`}
          onClick={() => navigate(`/matches/${match.id}`)}
        >
          {scoreText}
        </button>
        <button
          type="button"
          className="team-fixture-team team-fixture-team-right"
          onClick={() => rightTeam.id && navigate(`/teams/${rightTeam.id}`)}
        >
          {renderTeamLogo(rightTeam)}
          <span>{rightTeam.name}</span>
        </button>
      </div>
    );
  };

  const roster = team.roster || [];
  const buildFilters = <T,>(
    items: T[],
    getValue: (item: T) => string | number | null | undefined,
  ) =>
    Array.from(
      new Set(
        items
          .map(getValue)
          .filter(
            (value): value is string | number =>
              value !== null && value !== undefined && value !== '',
          ),
      ),
    )
      .sort((a, b) => String(a).localeCompare(String(b), 'vi', { numeric: true }))
      .map((value) => ({ text: String(value), value }));

  const rosterColumns: ColumnsType<TeamDetail['roster'][0]> = [
    {
      title: t('teamDetail.rosterColJersey'),
      dataIndex: 'jerseyNumber',
      key: 'jerseyNumber',
      width: 120,
      align: 'center',
      filters: buildFilters(roster, (r) => r.jerseyNumber),
      onFilter: (value, record) => record.jerseyNumber === Number(value),
      sorter: (a: TeamDetail['roster'][0], b: TeamDetail['roster'][0]) =>
        (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99),
      render: (v: number | null) => v ?? '—',
    },
    {
      title: t('teamDetail.rosterColName'),
      key: 'fullName',
      filters: buildFilters(roster, (r) => r.player.fullName),
      onFilter: (value, record) => record.player.fullName === value,
      render: (_: unknown, r: TeamDetail['roster'][0]) => (
        <a onClick={() => navigate(`/players/${r.player.id}`)}>{r.player.fullName}</a>
      ),
    },
    {
      title: t('teamDetail.rosterColPosition'),
      key: 'position',
      filters: buildFilters(roster, (r) => {
        const p = POSITION_MAP[r.player.position];
        return p?.label ?? r.player.position;
      }),
      onFilter: (value, record) => {
        const p = POSITION_MAP[record.player.position];
        return (p?.label ?? record.player.position) === value;
      },
      render: (_: unknown, r: TeamDetail['roster'][0]) => {
        const p = POSITION_MAP[r.player.position];
        return <Tag color={p?.color}>{p?.label ?? r.player.position}</Tag>;
      },
    },
    {
      title: t('teamDetail.rosterColNationality'),
      key: 'nationality',
      filters: buildFilters(roster, (r) => r.player.nationality),
      onFilter: (value, record) => record.player.nationality === value,
      render: (_: unknown, r: TeamDetail['roster'][0]) => r.player.nationality,
    },
    {
      title: t('teamDetail.rosterColType'),
      key: 'playerType',
      filters: buildFilters(roster, (r) => t(`playerType.${r.player.playerType}`)),
      onFilter: (value, record) => t(`playerType.${record.player.playerType}`) === value,
      render: (_: unknown, r: TeamDetail['roster'][0]) => (
        <Tag color={r.player.playerType === 'FOREIGN' ? 'purple' : 'cyan'}>
          {t(`playerType.${r.player.playerType}`)}
        </Tag>
      ),
    },
  ];

  const currentStanding = (team.standings || []).length > 0 ? team.standings[0] : null;
  const teamLogoUrl = getTeamLogoUrl(team);
  const teamInitials = (team.shortName || team.name).slice(0, 2).toUpperCase();

  return (
    <div className="club-detail-page">
      <section className="club-detail-hero" style={getTeamThemeStyle(team)}>
        <div className="club-detail-hero-top">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/teams')}>
            {t('teamDetail.back')}
          </Button>
          <Tag color={team.status === 'ACTIVE' ? 'green' : 'red'}>
            {team.status === 'ACTIVE'
              ? t('teamDetail.statusActive')
              : t('teamDetail.statusInactive')}
          </Tag>
        </div>

        <div className="club-detail-hero-main">
          <div className="club-detail-crest">
            {teamLogoUrl ? (
              <img src={teamLogoUrl} alt={team.name} />
            ) : (
              <span aria-hidden="true">{teamInitials}</span>
            )}
          </div>
          <div className="club-detail-copy">
            <Title level={1} className="club-detail-title">
              {team.name}
            </Title>
            <div className="club-detail-facts">
              {team.shortName && <span className="club-detail-code-pill">{team.shortName}</span>}
              <span>{team.city ?? 'Chưa cập nhật thành phố'}</span>
              <span>{team.stadium?.name ?? t('teamDetail.stadiumEmpty')}</span>
            </div>
          </div>
        </div>

        <div className="club-detail-stat-strip">
          <div className="club-detail-stat">
            <TeamOutlined />
            <span>{t('teamDetail.statPlayers')}</span>
            <strong>{(team.roster || []).length}</strong>
          </div>
          <div className="club-detail-stat">
            <TrophyOutlined />
            <span>{t('teamDetail.statMatches')}</span>
            <strong>{allMatches.length}</strong>
          </div>
          <div className="club-detail-stat club-detail-stat-wide">
            <EnvironmentOutlined />
            <span>{t('teamDetail.statStadium')}</span>
            <strong>{team.stadium?.name ?? t('teamDetail.stadiumEmpty')}</strong>
          </div>
        </div>
      </section>

      <Tabs
        className="club-detail-tabs"
        defaultActiveKey="info"
        items={[
          {
            key: 'info',
            label: t('teamDetail.tabInfo'),
            children: (
              <Card>
                <Descriptions bordered column={1}>
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
                dataSource={roster}
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
              <Card className="team-fixtures-card">
                {matchMonthGroups.length === 0 ? (
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
                        disabled={activeMatchMonthIndex <= 0}
                        onClick={() =>
                          setActiveMatchMonthKey(matchMonthGroups[activeMatchMonthIndex - 1][0])
                        }
                      />
                      <div style={{ minWidth: 220, textAlign: 'center' }}>
                        <Typography.Title level={4} style={{ margin: 0 }}>
                          {activeMonthLabel}
                        </Typography.Title>
                        <Typography.Text type="secondary">
                          {`${activeMonthMatches.length} trận`}
                        </Typography.Text>
                      </div>
                      <Button
                        shape="circle"
                        size="large"
                        icon={<RightOutlined />}
                        disabled={
                          activeMatchMonthIndex < 0 ||
                          activeMatchMonthIndex >= matchMonthGroups.length - 1
                        }
                        onClick={() =>
                          setActiveMatchMonthKey(matchMonthGroups[activeMatchMonthIndex + 1][0])
                        }
                      />
                    </Space>
                    <div className="team-fixtures-list">
                      {activeMonthMatches.map((match, index) => {
                        const previous = activeMonthMatches[index - 1];
                        const showDate =
                          index === 0 ||
                          formatMatchDateLabel(previous.kickoffAt) !==
                            formatMatchDateLabel(match.kickoffAt);

                        return (
                          <div key={match.id} className="team-fixture-day-group">
                            {showDate && (
                              <Typography.Title level={5} className="team-fixture-date">
                                {formatMatchDateLabel(match.kickoffAt)}
                              </Typography.Title>
                            )}
                            {renderTeamFixture(match)}
                          </div>
                        );
                      })}
                    </div>
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
