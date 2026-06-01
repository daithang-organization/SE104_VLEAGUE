import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  HomeOutlined,
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
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiGetStadium, type StadiumDetail, type StadiumMatch } from '../services/stadiumApi';

import { STATUS_MAP } from '../utils/constants';
import { getTeamLogoUrl } from '../utils/teamLogos';

const { Title } = Typography;

export default function StadiumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const request = state?.request;
  const { t } = useTranslation();
  const [stadium, setStadium] = useState<StadiumDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    if (id.startsWith('request-') && request) {
      setStadium({
        id: request.id,
        name: request.payload?.name || '',
        city: request.payload?.city || '',
        address: request.payload?.address,
        country: request.payload?.country,
        capacity: request.payload?.capacity,
        fifaStars: request.payload?.fifaStars,
        teams: request.team ? [request.team] : [],
        matches: [],
      } as unknown as StadiumDetail);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetch = async () => {
      try {
        const data = await apiGetStadium(id);
        if (!cancelled) setStadium(data);
      } catch (_err) {
        if (!cancelled) message.error(t('stadiumDetail.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    setLoading(true);
    fetch();
    return () => {
      cancelled = true;
    };
  }, [id, request, t]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!stadium) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4}>{t('stadiumDetail.notFound')}</Title>
        <Button onClick={() => navigate('/stadiums')}>{t('stadiumDetail.back')}</Button>
      </div>
    );
  }

  const finishedMatches = stadium.matches.filter((m) => m.status === 'FINISHED');
  const upcomingMatches = stadium.matches.filter((m) => m.status !== 'FINISHED');
  const visibleManagerRequestNote = user?.role === 'ADMIN' ? request?.requestNote : null;
  const visibleAdminDecisionNote = user?.role === 'TEAM_MANAGER' ? request?.adminNote : null;

  const renderTeamLogo = (team: { name: string }) => {
    const logoUrl = getTeamLogoUrl(team);

    return logoUrl ? (
      <img src={logoUrl} alt={`${team.name} logo`} className="stadium-team-logo" />
    ) : (
      <span className="stadium-team-logo stadium-team-logo-fallback" aria-hidden="true">
        {team.name.slice(0, 2).toUpperCase()}
      </span>
    );
  };

  const renderTeamLink = (team: StadiumMatch['homeTeam']) => (
    <a className="stadium-team-link" onClick={() => navigate(`/teams/${team.id}`)}>
      {renderTeamLogo(team)}
      <span>{team.name}</span>
    </a>
  );

  const renderTabLabel = (icon: ReactNode, label: string) => (
    <Space size={6}>
      <span aria-hidden="true" className="stadium-tab-icon">
        {icon}
      </span>
      <span>{label}</span>
    </Space>
  );

  const matchColumns = [
    {
      title: t('stadiumDetail.matchColRound'),
      key: 'round',
      width: 80,
      render: (_: unknown, r: StadiumMatch) => `V${r.roundNo}`,
    },
    {
      title: t('stadiumDetail.matchColHome'),
      key: 'home',
      render: (_: unknown, r: StadiumMatch) => renderTeamLink(r.homeTeam),
    },
    {
      title: t('stadiumDetail.matchColScore'),
      key: 'score',
      width: 100,
      align: 'center' as const,
      render: (_: unknown, r: StadiumMatch) =>
        r.homeScore != null ? (
          <strong>
            {r.homeScore} – {r.awayScore}
          </strong>
        ) : (
          <span style={{ color: '#bbb' }}>— : —</span>
        ),
    },
    {
      title: t('stadiumDetail.matchColAway'),
      key: 'away',
      render: (_: unknown, r: StadiumMatch) => renderTeamLink(r.awayTeam),
    },
    {
      title: t('stadiumDetail.matchColDate'),
      key: 'date',
      width: 130,
      render: (_: unknown, r: StadiumMatch) =>
        r.kickoffAt ? dayjs(r.kickoffAt).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      title: t('stadiumDetail.matchColStatus'),
      key: 'status',
      width: 110,
      render: (_: unknown, r: StadiumMatch) => {
        const s = STATUS_MAP[r.status];
        return <Tag color={s?.color}>{s?.label ?? r.status}</Tag>;
      },
    },
    {
      title: t('stadiumDetail.matchColAction'),
      key: 'action',
      width: 80,
      render: (_: unknown, r: StadiumMatch) => (
        <Button type="link" size="small" onClick={() => navigate(`/matches/${r.id}`)}>
          {t('stadiumDetail.matchDetailBtn')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() =>
            navigate('/stadiums', {
              state: { tab: state?.fromTab || (request ? 'review' : 'list') },
            })
          }
        >
          {t('stadiumDetail.back')}
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          <Space size={8}>
            <span aria-hidden="true" className="stadium-title-icon">
              <HomeOutlined />
            </span>
            <span>{stadium.name}</span>
          </Space>
        </Title>
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title={t('stadiumDetail.statCapacity')}
              value={
                stadium.capacity
                  ? stadium.capacity.toLocaleString('vi-VN')
                  : t('stadiumDetail.statCapacityEmpty')
              }
              prefix={<TeamOutlined />}
              styles={{ content: { fontSize: stadium.capacity ? 24 : 16 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title={t('stadiumDetail.statHomeTeams')}
              value={stadium.teams.length}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title={t('stadiumDetail.statTotalMatches')}
              value={stadium.matches.length}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: 'info',
            label: renderTabLabel(<FileTextOutlined />, t('stadiumDetail.tabInfo')),
            children: (
              <Card>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label={t('stadiumDetail.descName')}>
                    {stadium.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('stadiumDetail.descCity')}>
                    {stadium.city}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('stadiumDetail.descAddress')}>
                    {stadium.address ?? '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('stadiumDetail.descCapacity')}>
                    {stadium.capacity ? stadium.capacity.toLocaleString('vi-VN') : '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Đội sân nhà">
                    {stadium.teams && stadium.teams.length > 0
                      ? stadium.teams.map((t) => t.name).join(', ')
                      : '—'}
                  </Descriptions.Item>
                  {request?.manager && (
                    <Descriptions.Item label="Người yêu cầu">
                      {request.manager.name
                        ? `${request.manager.name} (${request.manager.email})`
                        : request.manager.email}
                    </Descriptions.Item>
                  )}
                  {request && (
                    <Descriptions.Item label="Trạng thái">
                      <Tag
                        color={
                          request.status === 'APPROVED'
                            ? 'green'
                            : request.status === 'REJECTED'
                              ? 'red'
                              : 'gold'
                        }
                      >
                        {request.status === 'APPROVED'
                          ? 'Đã duyệt'
                          : request.status === 'REJECTED'
                            ? 'Từ chối'
                            : 'Chờ duyệt'}
                      </Tag>
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {(visibleManagerRequestNote || visibleAdminDecisionNote) && (
                  <div className="team-detail-note-grid">
                    {visibleManagerRequestNote && (
                      <div className="team-detail-note-card">
                        <span className="team-detail-note-heading">
                          <ExclamationCircleOutlined className="team-detail-note-icon" />
                          <span className="team-detail-note-label">Ghi chú</span>
                        </span>
                        <p>{visibleManagerRequestNote}</p>
                      </div>
                    )}
                    {visibleAdminDecisionNote && (
                      <div className="team-detail-note-card team-detail-note-card-admin">
                        <span className="team-detail-note-heading">
                          <ExclamationCircleOutlined className="team-detail-note-icon" />
                          <span className="team-detail-note-label">Phản hồi</span>
                        </span>
                        <p>{visibleAdminDecisionNote}</p>
                      </div>
                    )}
                  </div>
                )}

                {!request && stadium.teams.length > 0 && (
                  <Card
                    size="small"
                    title={t('stadiumDetail.homeTeamsTitle')}
                    style={{ marginTop: 16 }}
                  >
                    <Space wrap>
                      {stadium.teams.map((t) => (
                        <Tag
                          key={t.id}
                          color="blue"
                          className="stadium-home-team-tag"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/teams/${t.id}`)}
                        >
                          {renderTeamLogo(t)}
                          <span>{t.name}</span>
                        </Tag>
                      ))}
                    </Space>
                  </Card>
                )}
              </Card>
            ),
          },
          {
            key: 'matches',
            label: renderTabLabel(
              <CalendarOutlined />,
              t('stadiumDetail.tabMatches', { count: stadium.matches.length }),
            ),
            children: (
              <div>
                {upcomingMatches.length > 0 && (
                  <Card
                    size="small"
                    title={t('stadiumDetail.upcomingTitle')}
                    style={{ marginBottom: 16 }}
                  >
                    <Table
                      dataSource={upcomingMatches}
                      columns={matchColumns}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  </Card>
                )}
                <Card
                  size="small"
                  title={t('stadiumDetail.finishedTitle', { count: finishedMatches.length })}
                >
                  <Table
                    dataSource={finishedMatches}
                    columns={matchColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                    locale={{ emptyText: t('stadiumDetail.matchesEmpty') }}
                  />
                </Card>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
