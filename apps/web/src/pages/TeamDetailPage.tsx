import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  LeftOutlined,
  RightOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
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
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { MatchFixtureCard, ProfileSkeleton } from '../components';
import { apiGetCurrentSeason } from '../services/seasonApi';
import { apiGetTeam, type TeamDetail } from '../services/teamApi';

import { POSITION_MAP, STATUS_MAP } from '../utils/constants';
import { getTeamLogoUrl, getTeamThemeStyle } from '../utils/teamLogos';

const { Title } = Typography;

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const requestNote = state?.requestNote;
  const requestStatus = state?.requestStatus;
  const adminNote = state?.adminNote;
  const stateManagerName = state?.managerName;
  const stateManagerEmail = state?.managerEmail;
  const stateSeasonId = typeof state?.seasonId === 'string' ? state.seasonId : undefined;
  const { user } = useAuth();
  const { t } = useTranslation();
  const [teamData, setTeamData] = useState<TeamDetail | null>(null);

  const team = useMemo(() => {
    if (!teamData) return null;
    return {
      ...teamData,
      name: state?.proposedTeamName ?? teamData.name,
      shortName: state?.proposedTeamShortName ?? teamData.shortName,
      city: state?.proposedTeamCity ?? teamData.city,
      status: state?.proposedTeamStatus ?? teamData.status,
    };
  }, [teamData, state]);
  const [loading, setLoading] = useState(true);
  const [activeMatchMonthKey, setActiveMatchMonthKey] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetchTeam = async () => {
      try {
        const currentSeasonId =
          stateSeasonId ?? (await apiGetCurrentSeason().catch(() => null))?.id;
        const data = await apiGetTeam(id, currentSeasonId);
        if (!cancelled) setTeamData(data);
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
  }, [id, stateSeasonId, t]);

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
  const activeMonthMatchGroups = (() => {
    const map = new Map<string, typeof activeMonthMatches>();
    for (const match of activeMonthMatches) {
      const key = match.kickoffAt ? dayjs(match.kickoffAt).format('YYYY-MM-DD') : 'unscheduled';
      const list = map.get(key) ?? [];
      list.push(match);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === 'unscheduled') return 1;
      if (b === 'unscheduled') return -1;
      return a.localeCompare(b);
    });
  })();
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
        name: team.name,
        shortName: team.shortName,
        logoUrl: getTeamLogoUrl(team),
        coachName: team.coachName,
      };
    }

    const opponent = match.side === 'home' ? match.awayTeam : match.homeTeam;
    return {
      id: opponent?.id,
      name: opponent?.name || '—',
      shortName: opponent?.shortName,
      logoUrl: getTeamLogoUrl(opponent),
      coachName: opponent?.coachName,
    };
  };

  const renderTeamFixture = (match: (typeof allMatches)[0]) => {
    const homeTeam = getTeamDisplay(match, 'home');
    const awayTeam = getTeamDisplay(match, 'away');
    const status = STATUS_MAP[match.status] ?? { label: match.status, color: 'default' };

    return (
      <MatchFixtureCard
        key={match.id}
        id={match.id}
        className="results-fixture-row"
        actionClassName="results-fixture-action"
        roundLabel={`Vòng ${match.roundNo}`}
        statusLabel={status.label}
        statusColor={status.color}
        homeTeamId={homeTeam.id ?? team.id}
        awayTeamId={awayTeam.id ?? team.id}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeScore={match.homeScore}
        awayScore={match.awayScore}
        kickoffAt={match.kickoffAt}
        stadiumName={match.stadium?.name}
        stadiumFallback={t('schedule.stadiumNotSet')}
        kickoffFallback={t('schedule.kickoffNotSet')}
        scoreMode="kickoff-or-vs"
        onTeamClick={(teamId) => navigate(`/teams/${teamId}`)}
        onMatchClick={(matchId) => navigate(`/matches/${matchId}`)}
        actions={
          <Tooltip title={t('matches.btnDetail')}>
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/matches/${match.id}`)}
            >
              {t('matches.btnDetail')}
            </Button>
          </Tooltip>
        }
      />
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
  const teamLogoUrl = state?.proposedTeamLogoUrl ?? getTeamLogoUrl(team);
  const teamInitials = (team.shortName || team.name).slice(0, 2).toUpperCase();
  const manager = team.managedUsers?.[0] ?? null;
  const coachName = team.coachName?.trim();
  const getFallbackManagerDisplay = () => {
    if (stateManagerName && stateManagerEmail) {
      return `${stateManagerName} (${stateManagerEmail})`;
    }
    return stateManagerName || stateManagerEmail || '—';
  };

  const managerDisplay = coachName
    ? manager?.email
      ? `${coachName} (${manager.email})`
      : coachName
    : manager
      ? manager.name
        ? `${manager.name} (${manager.email})`
        : manager.email
      : getFallbackManagerDisplay();

  const renderStatusTag = () => {
    if (requestStatus === 'PENDING') return <Tag color="gold">Chờ duyệt</Tag>;
    if (requestStatus === 'APPROVED') return <Tag color="green">Được duyệt</Tag>;
    if (requestStatus === 'REJECTED') return <Tag color="red">Từ chối</Tag>;

    return (
      <Tag color={team.status === 'ACTIVE' ? 'green-inverse' : 'default'}>
        {team.status === 'ACTIVE' ? t('teamDetail.statusActive') : t('teamDetail.statusInactive')}
      </Tag>
    );
  };

  const renderActivityTag = () => (
    <Tag color={team.status === 'ACTIVE' ? 'green-inverse' : 'default'}>
      {team.status === 'ACTIVE' ? t('teamDetail.statusActive') : t('teamDetail.statusInactive')}
    </Tag>
  );

  const managerRequestNote =
    typeof requestNote === 'string' && requestNote.trim() ? requestNote.trim() : null;
  const adminDecisionNote =
    typeof adminNote === 'string' && adminNote.trim() ? adminNote.trim() : null;
  const visibleManagerRequestNote = user?.role === 'ADMIN' ? managerRequestNote : null;
  const visibleAdminDecisionNote = user?.role === 'TEAM_MANAGER' ? adminDecisionNote : null;

  return (
    <div className="club-detail-page">
      <section className="club-detail-hero" style={getTeamThemeStyle(team)}>
        <div className="club-detail-hero-top">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              navigate('/teams', {
                state: { tab: state?.fromTab || (requestStatus ? 'review' : 'list') },
              })
            }
          >
            {t('teamDetail.back')}
          </Button>
          <Space size={8}>
            {requestStatus && renderActivityTag()}
            {renderStatusTag()}
          </Space>
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
              {coachName && (
                <span>
                  <UserOutlined />
                  {coachName}
                </span>
              )}
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
                  <Descriptions.Item label={t('teamDetail.descManager')}>
                    {managerDisplay}
                  </Descriptions.Item>
                  {requestStatus && (
                    <Descriptions.Item label={t('teamDetail.descActivity')}>
                      {renderActivityTag()}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label={t('teamDetail.descStatus')}>
                    {renderStatusTag()}
                  </Descriptions.Item>
                </Descriptions>

                {(visibleManagerRequestNote || visibleAdminDecisionNote) && (
                  <div className="team-detail-note-grid">
                    {visibleManagerRequestNote && (
                      <div className="team-detail-note-card">
                        <span className="team-detail-note-heading">
                          <ExclamationCircleOutlined className="team-detail-note-icon" />
                          <span className="team-detail-note-label">
                            {t('teamDetail.managerRequestNoteTitle')}
                          </span>
                        </span>
                        <p>{visibleManagerRequestNote}</p>
                      </div>
                    )}
                    {visibleAdminDecisionNote && (
                      <div className="team-detail-note-card team-detail-note-card-admin">
                        <span className="team-detail-note-heading">
                          <ExclamationCircleOutlined className="team-detail-note-icon" />
                          <span className="team-detail-note-label">
                            {t('teamDetail.adminDecisionNoteTitle')}
                          </span>
                        </span>
                        <p>{visibleAdminDecisionNote}</p>
                      </div>
                    )}
                  </div>
                )}

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
              <Card className="schedule-page-card team-fixtures-card">
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
                    <div className="schedule-fixture-list">
                      {activeMonthMatchGroups.map(([dayKey, dayMatches]) => (
                        <div key={dayKey} className="schedule-fixture-day-group">
                          <Typography.Title level={5} className="schedule-fixture-date">
                            {formatMatchDateLabel(dayMatches[0]?.kickoffAt)}
                          </Typography.Title>
                          <div className="schedule-fixture-day-list">
                            {dayMatches.map((match) => renderTeamFixture(match))}
                          </div>
                        </div>
                      ))}
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
