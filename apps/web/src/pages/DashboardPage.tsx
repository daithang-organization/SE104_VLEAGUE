import {
  BarChartOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  PlusOutlined,
  SaveOutlined,
  SettingOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../auth/AuthContext';
import { CardSkeleton, PageHero } from '../components';
import { apiGetMatches, type Match } from '../services/matchApi';
import { apiGetPlayers } from '../services/playerApi';
import { apiGetSchedule } from '../services/scheduleApi';
import { apiGetSeasons, type Season } from '../services/seasonApi';
import {
  apiGetCardStats,
  apiGetStandings,
  apiGetTopScorers,
  type CardStat,
  type TeamStanding,
  type TopScorer,
} from '../services/standingsApi';
import { apiGetTeam, apiGetTeams, type TeamDetail } from '../services/teamApi';
import {
  apiGetTeamManagerAssignment,
  apiGetTeamManagerApplication,
  apiSubmitTeamManagerApplication,
  type SubmitTeamManagerApplicationPayload,
  type TeamManagerApplication,
} from '../services/teamManagerApi';
import { getTeamLogoUrl } from '../utils/teamLogos';

// MÃ MÀU ĐỎ CHỦ ĐẠO MỚI
const THEME_RED = '#E32221';

type RecentResult = {
  id: string;
  roundNo: number;
  homeTeam: { name: string };
  awayTeam: { name: string };
  homeScore: number | null;
  awayScore: number | null;
  kickoffAt: string | null;
};

const FORM_SLOTS = 5;

function DashboardCardTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <Space size={8} className="dashboard-card-title">
      <span className="dashboard-card-title-icon">{icon}</span>
      <span>{children}</span>
    </Space>
  );
}

function getDashboardSeason(seasons: Season[]) {
  return (
    seasons.find((season) => {
      if (!season.startDate || !season.endDate) return false;
      const start = dayjs(season.startDate).startOf('day').valueOf();
      const end = dayjs(season.endDate).endOf('day').valueOf();
      const now = dayjs().valueOf();
      return now >= start && now <= end;
    }) ??
    seasons.find((season) => season.status === 'IN_PROGRESS') ??
    seasons
      .filter((season) => season.startDate)
      .sort((a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf())[0] ??
    null
  );
}

function renderDashboardRecentForm(recentForm: TeamStanding['recentForm'] = []) {
  const slots = Array.from({ length: FORM_SLOTS }, (_, index) => recentForm[index]);
  return (
    <Space size={4}>
      {slots.map((result, index) => (
        <span
          key={`${result ?? 'empty'}-${index}`}
          className={`standings-form-box standings-form-${result?.toLowerCase() ?? 'empty'}`}
          title={result ?? ''}
        >
          {result === 'W' ? '✓' : result === 'D' ? '−' : result === 'L' ? '×' : ''}
        </span>
      ))}
    </Space>
  );
}

function getApplicationStatus(application: TeamManagerApplication | null) {
  if (!application) return { label: 'Chưa có hồ sơ', color: 'default' };
  if (application.status === 'APPROVED') return { label: 'Đã được BTC duyệt', color: 'success' };
  if (application.status === 'REJECTED') return { label: 'Bị từ chối', color: 'error' };
  if (application.applicationSubmittedAt) return { label: 'Đã nộp hồ sơ', color: 'processing' };
  return { label: 'Chờ nộp hồ sơ', color: 'warning' };
}

function TeamManagerDashboard() {
  const [applicationForm] = Form.useForm<SubmitTeamManagerApplicationPayload>();
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [application, setApplication] = useState<TeamManagerApplication | null>(null);
  const [applicationSaving, setApplicationSaving] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [seasonMatches, setSeasonMatches] = useState<Match[]>([]);
  const [teamMatches, setTeamMatches] = useState<Match[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);

  useEffect(() => {
    const loadBootstrap = async () => {
      setLoading(true);
      try {
        const seasonsData = await apiGetSeasons();
        const season = getDashboardSeason(seasonsData);
        const assignment = season?.id ? await apiGetTeamManagerAssignment(season.id) : null;

        setCurrentSeason(season);
        setSelectedTeamId(assignment?.teamId ?? null);
      } catch (_err) {
        message.error('Không tải được dữ liệu CLB quản lý');
      } finally {
        setLoading(false);
      }
    };

    loadBootstrap();
  }, []);

  useEffect(() => {
    if (!selectedTeamId || !currentSeason) {
      setTeam(null);
      setApplication(null);
      setSeasonMatches([]);
      setTeamMatches([]);
      setStandings([]);
      setTopScorers([]);
      return;
    }

    const loadTeamDashboard = async () => {
      setLoading(true);
      try {
        const [teamData, standingsData, matchesData, scorersData, applicationData] =
          await Promise.all([
            apiGetTeam(selectedTeamId),
            apiGetStandings(currentSeason.id),
            apiGetMatches(currentSeason.id, 1, 1000),
            apiGetTopScorers(currentSeason.id, 100),
            apiGetTeamManagerApplication(currentSeason.id),
          ]);

        const matches = matchesData.data.filter(
          (match) => match.homeTeamId === selectedTeamId || match.awayTeamId === selectedTeamId,
        );

        setTeam(teamData);
        setApplication(applicationData);
        setSeasonMatches(matchesData.data);
        setTeamMatches(matches);
        setStandings(standingsData);
        setTopScorers(
          scorersData
            .filter((scorer) => scorer.teamId === selectedTeamId)
            .sort((a, b) => b.goals - a.goals)
            .slice(0, 5)
            .map((scorer, index) => ({ ...scorer, position: index + 1 })),
        );
      } catch (_err) {
        message.error('Không tải được dashboard đội bóng');
      } finally {
        setLoading(false);
      }
    };

    loadTeamDashboard();
  }, [currentSeason, selectedTeamId]);

  useEffect(() => {
    if (!currentSeason) {
      applicationForm.resetFields();
      return;
    }

    applicationForm.setFieldsValue({
      seasonId: currentSeason.id,
      ownerName: application?.ownerName ?? '',
      ownerCountry: application?.ownerCountry ?? 'Việt Nam',
      ownerAddress: application?.ownerAddress ?? '',
      teamIntroduction: application?.teamIntroduction ?? '',
      primaryKit: application?.primaryKit ?? '',
      backupKit: application?.backupKit ?? '',
      participationFeePaid: application?.participationFeePaid ?? false,
      feeReceiptCode: application?.feeReceiptCode ?? '',
      externalCompetitionSchedule: application?.externalCompetitionSchedule ?? '',
    });
  }, [application, applicationForm, currentSeason]);

  const handleSubmitApplication = async (values: SubmitTeamManagerApplicationPayload) => {
    if (!currentSeason?.id) return;

    setApplicationSaving(true);
    try {
      const updatedApplication = await apiSubmitTeamManagerApplication({
        ...values,
        seasonId: currentSeason.id,
        ownerAddress: values.ownerAddress?.trim() || undefined,
        feeReceiptCode: values.feeReceiptCode?.trim() || undefined,
        externalCompetitionSchedule: values.externalCompetitionSchedule?.trim() || undefined,
        participationFeePaid: values.participationFeePaid ?? false,
      });
      setApplication(updatedApplication);
      message.success('Đã nộp hồ sơ tham dự mùa giải cho BTC');
    } catch (_err) {
      message.error('Không thể nộp hồ sơ. Hãy kiểm tra các thông tin bắt buộc.');
    } finally {
      setApplicationSaving(false);
    }
  };

  const selectedStanding = standings.find((standing) => standing.teamId === selectedTeamId);
  const standingsWindow = selectedStanding
    ? standings.slice(
        Math.max(0, selectedStanding.position - 3),
        Math.max(0, selectedStanding.position - 3) + 5,
      )
    : standings.slice(0, 5);
  const matchesByRound = seasonMatches.reduce((roundMap, match) => {
    const roundMatches = roundMap.get(match.roundNo) ?? [];
    roundMatches.push(match);
    roundMap.set(match.roundNo, roundMatches);
    return roundMap;
  }, new Map<number, Match[]>());
  const lastCompletedRound = [...matchesByRound.entries()]
    .sort(([roundA], [roundB]) => roundA - roundB)
    .reduce((completedRound, [roundNo, roundMatches]) => {
      if (completedRound !== roundNo - 1) return completedRound;
      return roundMatches.every((match) => match.status === 'FINISHED') ? roundNo : completedRound;
    }, 0);
  const upcomingMatches = teamMatches
    .filter((match) => match.status !== 'FINISHED' && match.roundNo > lastCompletedRound)
    .sort((a, b) => {
      if (a.roundNo !== b.roundNo) return a.roundNo - b.roundNo;
      return dayjs(a.kickoffAt ?? 0).valueOf() - dayjs(b.kickoffAt ?? 0).valueOf();
    })
    .slice(0, 5);
  const recentResults = teamMatches
    .filter((match) => match.status === 'FINISHED')
    .sort((a, b) => b.roundNo - a.roundNo)
    .slice(0, 5);
  const applicationStatus = getApplicationStatus(application);
  const applicationLocked = application?.status === 'APPROVED';
  const teamLogoUrl = getTeamLogoUrl(team);

  if (!selectedTeamId) {
    return (
      <div className="page-stack dashboard-page dashboard-manager-page">
        <PageHero
          eyebrow="VLeague"
          title="Chưa được gắn CLB"
          description="Tài khoản TEAM_MANAGER cần được admin gắn với một CLB cố định trước khi sử dụng trang quản lý đội bóng."
          icon={<TeamOutlined />}
          metrics={[
            {
              label: 'Mùa giải',
              value: currentSeason?.name ?? '...',
              icon: <TrophyOutlined />,
            },
          ]}
        />

        <Alert
          type="warning"
          showIcon
          message="Tài khoản chưa có CLB cố định"
          description="Vui lòng liên hệ admin để gắn tài khoản này với đúng CLB trong màn hình Quản lý người dùng."
        />
      </div>
    );
  }

  return (
    <div className="page-stack dashboard-page dashboard-manager-page">
      <PageHero
        eyebrow="Quản lý CLB"
        title={`CLB ${team?.name ?? '...'}`}
        description="Theo dõi hồ sơ tham dự, lực lượng, lịch thi đấu và chỉ số phong độ của đội bóng trong một màn hình."
        icon={
          teamLogoUrl ? (
            <img className="dashboard-hero-logo" src={teamLogoUrl} alt={`${team?.name} logo`} />
          ) : (
            <TeamOutlined />
          )
        }
        metrics={[
          {
            label: 'Cầu thủ',
            value: (team?.roster?.length ?? 0).toLocaleString('vi-VN'),
            icon: <UserOutlined />,
          },
          {
            label: 'Trận đấu',
            value: teamMatches.length.toLocaleString('vi-VN'),
            icon: <CalendarOutlined />,
          },
          {
            label: 'Hồ sơ',
            value: applicationStatus.label,
            icon: <FileDoneOutlined />,
          },
        ]}
      />

      <Card
        title={
          <DashboardCardTitle icon={<FileDoneOutlined />}>
            Hồ sơ tham dự mùa giải
          </DashboardCardTitle>
        }
        className="dashboard-panel-card"
        size="small"
        extra={<Tag color={applicationStatus.color}>{applicationStatus.label}</Tag>}
        loading={loading && !application}
      >
        {!application ? (
          <Alert
            type="warning"
            showIcon
            message="CLB chưa có bản ghi tham dự mùa giải"
            description="Hãy xác nhận lời mời tham dự mùa giải từ BTC trước khi nộp hồ sơ."
          />
        ) : (
          <Form
            form={applicationForm}
            layout="vertical"
            onFinish={handleSubmitApplication}
            disabled={applicationLocked}
          >
            <Row gutter={[16, 8]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="ownerName"
                  label="Cơ quan/công ty chủ quản"
                  rules={[{ required: true, message: 'Vui lòng nhập cơ quan chủ quản' }]}
                >
                  <Input placeholder="Ví dụ: Công ty Cổ phần Bóng đá Bình Định" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="ownerCountry"
                  label="Quốc gia đặt trụ sở"
                  rules={[{ required: true, message: 'Vui lòng nhập quốc gia đặt trụ sở' }]}
                >
                  <Input placeholder="Việt Nam" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="ownerAddress" label="Địa chỉ cơ quan chủ quản">
                  <Input placeholder="Địa chỉ tại Việt Nam" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="teamIntroduction"
                  label="Thông tin tự giới thiệu đội"
                  rules={[{ required: true, message: 'Vui lòng nhập phần giới thiệu đội' }]}
                >
                  <Input.TextArea rows={3} placeholder="Tóm tắt lịch sử, mục tiêu mùa giải..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="primaryKit"
                  label="Áo thi đấu chính thức"
                  rules={[{ required: true, message: 'Vui lòng mô tả áo chính thức' }]}
                >
                  <Input placeholder="Ví dụ: Áo đỏ, quần đỏ, tất đỏ" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="backupKit"
                  label="Áo thi đấu dự bị"
                  rules={[{ required: true, message: 'Vui lòng mô tả áo dự bị' }]}
                >
                  <Input placeholder="Ví dụ: Áo trắng, quần trắng, tất trắng" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="feeReceiptCode" label="Mã biên lai/ghi chú nộp phí">
                  <Input placeholder="Mã biên lai lệ phí 1 tỷ đồng" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="participationFeePaid"
                  label="Lệ phí tham dự"
                  valuePropName="checked"
                >
                  <Checkbox>Đã nộp lệ phí 1 tỷ đồng</Checkbox>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="externalCompetitionSchedule"
                  label="Lịch giải khác đã/đang tham gia"
                >
                  <Input.TextArea
                    rows={2}
                    placeholder="Nếu có, nhập tên giải và khoảng thời gian thi đấu"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={applicationSaving}
            >
              Nộp hồ sơ
            </Button>
          </Form>
        )}
      </Card>

      <div className="dashboard-stat-grid dashboard-stat-grid-three">
        <Card loading={loading} hoverable className="dashboard-stat-card">
          <Space align="center">
            {teamLogoUrl && (
              <img
                src={teamLogoUrl}
                alt={`${team?.name ?? 'Đội bóng'} logo`}
                className="dashboard-stat-logo"
              />
            )}
            <Statistic title="Đội bóng" value={team?.name ?? '...'} />
          </Space>
        </Card>
        <Card loading={loading} hoverable className="dashboard-stat-card">
          <Statistic title="Cầu thủ" value={team?.roster?.length ?? 0} prefix={<UserOutlined />} />
        </Card>
        <Card loading={loading} hoverable className="dashboard-stat-card">
          <Statistic title="Trận đấu" value={teamMatches.length} prefix={<CalendarOutlined />} />
        </Card>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            title={
              <DashboardCardTitle icon={<TrophyOutlined />}>
                Bảng xếp hạng (Thứ {selectedStanding?.position ?? '—'} tại VLeague)
              </DashboardCardTitle>
            }
            className="dashboard-panel-card"
            size="small"
            hoverable
          >
            <Table
              columns={[
                { title: '#', dataIndex: 'position', width: 50 },
                {
                  title: 'Đội',
                  dataIndex: 'teamName',
                  render: (teamName: string) => {
                    const logoUrl = getTeamLogoUrl(teamName);
                    return (
                      <Space size={8}>
                        {logoUrl && (
                          <img
                            src={logoUrl}
                            alt={`${teamName} logo`}
                            style={{
                              width: 24,
                              height: 24,
                              objectFit: 'contain',
                              flex: '0 0 auto',
                            }}
                          />
                        )}
                        <Typography.Text strong>{teamName}</Typography.Text>
                      </Space>
                    );
                  },
                },
                { title: 'Trận', dataIndex: 'played', width: 70 },
                { title: 'Điểm', dataIndex: 'points', width: 70 },
                {
                  title: '5 trận gần nhất',
                  dataIndex: 'recentForm',
                  width: 140,
                  align: 'center',
                  render: renderDashboardRecentForm,
                },
              ]}
              dataSource={standingsWindow}
              rowKey="teamId"
              loading={loading}
              pagination={false}
              size="small"
              rowClassName={(record) =>
                record.teamId === selectedTeamId ? 'manager-home-team-row' : ''
              }
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={
              <DashboardCardTitle icon={<CalendarOutlined />}>Trận đấu sắp tới</DashboardCardTitle>
            }
            className="dashboard-panel-card"
            size="small"
            hoverable
          >
            <Table
              columns={[
                { title: 'Vòng', dataIndex: 'roundNo', width: 70, render: (v) => `V${v}` },
                {
                  title: 'Trận đấu',
                  key: 'match',
                  render: (_, r) => (
                    <div className="manager-upcoming-match">
                      <span className="manager-upcoming-team manager-upcoming-team-left">
                        {r.homeTeam?.name ?? '—'}
                      </span>
                      {r.homeTeam && getTeamLogoUrl(r.homeTeam) && (
                        <img
                          className="manager-upcoming-logo"
                          src={getTeamLogoUrl(r.homeTeam)}
                          alt={r.homeTeam.name}
                        />
                      )}
                      <Typography.Text type="secondary" className="manager-upcoming-vs">
                        vs
                      </Typography.Text>
                      {r.awayTeam && getTeamLogoUrl(r.awayTeam) && (
                        <img
                          className="manager-upcoming-logo"
                          src={getTeamLogoUrl(r.awayTeam)}
                          alt={r.awayTeam.name}
                        />
                      )}
                      <span className="manager-upcoming-team manager-upcoming-team-right">
                        {r.awayTeam?.name ?? '—'}
                      </span>
                    </div>
                  ),
                },
                {
                  title: 'Thời gian',
                  dataIndex: 'kickoffAt',
                  width: 140,
                  render: (v) => (v ? dayjs(v).format('DD/MM HH:mm') : '—'),
                },
              ]}
              dataSource={upcomingMatches}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
              locale={{ emptyText: 'Chưa có trận đấu sắp tới' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={14}>
          <Card
            title={
              <DashboardCardTitle icon={<CalendarOutlined />}>Kết quả gần đây</DashboardCardTitle>
            }
            className="dashboard-panel-card"
            size="small"
            hoverable
          >
            <Table
              columns={[
                { title: 'V', dataIndex: 'roundNo', width: 50, render: (v) => `V${v}` },
                {
                  title: 'Trận đấu',
                  key: 'match',
                  render: (_, r) => (
                    <span>
                      <strong>{r.homeTeam?.name ?? '—'}</strong>
                      <Tag color="red" style={{ margin: '0 6px' }}>
                        {r.homeScore ?? 0} - {r.awayScore ?? 0}
                      </Tag>
                      <strong>{r.awayTeam?.name ?? '—'}</strong>
                    </span>
                  ),
                },
                {
                  title: 'Ngày',
                  dataIndex: 'kickoffAt',
                  width: 100,
                  render: (v) => (v ? dayjs(v).format('DD/MM') : '—'),
                },
              ]}
              dataSource={recentResults}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
              locale={{ emptyText: 'Chưa có kết quả gần đây' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card
            title={
              <DashboardCardTitle icon={<TrophyOutlined />}>
                Vua phá lưới (Top 5 CLB)
              </DashboardCardTitle>
            }
            className="dashboard-panel-card"
            size="small"
            hoverable
          >
            <Table
              dataSource={topScorers}
              rowKey="playerId"
              loading={loading}
              pagination={false}
              size="small"
              locale={{ emptyText: 'Chưa có cầu thủ ghi bàn' }}
              columns={[
                { title: '#', dataIndex: 'position', width: 40 },
                { title: 'Cầu thủ', dataIndex: 'playerName', ellipsis: true },
                {
                  title: 'Bàn',
                  dataIndex: 'goals',
                  width: 50,
                  align: 'center',
                  render: (v: number) => <strong style={{ color: THEME_RED }}>{v}</strong>,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';
  const dashboardWelcome =
    user?.role === 'REFEREE'
      ? 'Chào mừng đến trang quản lý chính thức của VLeague dành cho trọng tài'
      : t('dashboard.welcome');
  const [stats, setStats] = useState({
    teams: 0,
    players: 0,
    matches: 0,
    seasons: 0,
  });
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [seasonProgress, setSeasonProgress] = useState<number | null>(null);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [cardStats, setCardStats] = useState<CardStat[]>([]);
  const [goalsPerRound, setGoalsPerRound] = useState<{ round: string; goals: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (user?.role === 'TEAM_MANAGER') {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [
          teams,
          players,
          schedule,
          seasons,
          standingsData,
          matchesData,
          scorersData,
          cardStatsData,
        ] = await Promise.allSettled([
          apiGetTeams(),
          apiGetPlayers(),
          apiGetSchedule(),
          apiGetSeasons(),
          apiGetStandings(),
          apiGetMatches(undefined, 1, 100),
          apiGetTopScorers(undefined, 5),
          apiGetCardStats(undefined, 5),
        ]);

        setStats({
          teams: teams.status === 'fulfilled' ? teams.value.total : 0,
          players: players.status === 'fulfilled' ? players.value.total : 0,
          matches: schedule.status === 'fulfilled' ? (schedule.value.matches?.length ?? 0) : 0,
          seasons: seasons.status === 'fulfilled' ? seasons.value.length : 0,
        });

        if (standingsData.status === 'fulfilled') {
          setStandings(standingsData.value.slice(0, 5));
        }

        if (matchesData.status === 'fulfilled') {
          const finished = matchesData.value.data
            .filter((m) => m.status === 'FINISHED')
            .sort((a, b) => {
              if (a.kickoffAt && b.kickoffAt)
                return new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime();
              return b.roundNo - a.roundNo;
            })
            .slice(0, 5) as RecentResult[];
          setRecentResults(finished);
        }

        const dashboardSeason =
          seasons.status === 'fulfilled'
            ? (seasons.value.find((season) => {
                if (!season.startDate || !season.endDate) return false;
                const start = dayjs(season.startDate).startOf('day').valueOf();
                const end = dayjs(season.endDate).endOf('day').valueOf();
                const now = dayjs().valueOf();
                return now >= start && now <= end;
              }) ??
              seasons.value.find((season) => season.status === 'IN_PROGRESS') ??
              seasons.value
                .filter((season) => season.startDate)
                .sort((a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf())[0] ??
              null)
            : null;
        setCurrentSeason(dashboardSeason);

        if (dashboardSeason) {
          const seasonMatches = await apiGetMatches(dashboardSeason.id, 1, 1000);
          const teamIds = new Set<string>();
          let finishedMatches = 0;
          const sortedSeasonMatches = [...seasonMatches.data].sort((a, b) => {
            if (a.roundNo !== b.roundNo) return a.roundNo - b.roundNo;
            return dayjs(a.kickoffAt ?? 0).valueOf() - dayjs(b.kickoffAt ?? 0).valueOf();
          });

          sortedSeasonMatches.forEach((match) => {
            teamIds.add(match.homeTeamId);
            teamIds.add(match.awayTeamId);
            if (match.status === 'FINISHED') finishedMatches++;
          });

          const latestFinishedRound = Math.max(
            0,
            ...sortedSeasonMatches
              .filter((match) => match.status === 'FINISHED')
              .map((match) => match.roundNo),
          );
          const nextRoundNo =
            sortedSeasonMatches.find(
              (match) => match.status !== 'FINISHED' && match.roundNo > latestFinishedRound,
            )?.roundNo ?? sortedSeasonMatches.find((match) => match.status !== 'FINISHED')?.roundNo;
          setUpcoming(
            nextRoundNo
              ? sortedSeasonMatches.filter(
                  (match) => match.status !== 'FINISHED' && match.roundNo === nextRoundNo,
                )
              : [],
          );

          const roundRobinFixtures = teamIds.size > 1 ? teamIds.size * (teamIds.size - 1) : 0;
          const totalSeasonMatches =
            seasonMatches.total || seasonMatches.data.length || roundRobinFixtures;
          setSeasonProgress(
            totalSeasonMatches > 0
              ? Math.min(100, Math.round((finishedMatches / totalSeasonMatches) * 100))
              : 0,
          );
        } else {
          setSeasonProgress(null);
          setUpcoming([]);
        }

        if (scorersData.status === 'fulfilled') {
          setTopScorers(scorersData.value.slice(0, 5));
        }

        if (cardStatsData.status === 'fulfilled') {
          setCardStats(cardStatsData.value.slice(0, 5));
        }

        if (matchesData.status === 'fulfilled') {
          const finished = matchesData.value.data.filter((m: Match) => m.status === 'FINISHED');
          const roundGoals = new Map<number, number>();
          finished.forEach((m: Match) => {
            const round = m.roundNo;
            const goals = (m.homeScore ?? 0) + (m.awayScore ?? 0);
            roundGoals.set(round, (roundGoals.get(round) ?? 0) + goals);
          });
          const chartData = [...roundGoals.entries()]
            .sort(([a], [b]) => a - b)
            .slice(0, 15)
            .map(([round, goals]) => ({
              round: `V${round}`,
              goals,
            }));
          setGoalsPerRound(chartData);
        }
      } catch (_err) {
        message.error(t('dashboard.errorLoad'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [t, user?.role]);

  const standingsCols: ColumnsType<TeamStanding> = [
    { title: t('dashboard.standingsColRank'), dataIndex: 'position', width: 50 },
    {
      title: t('dashboard.standingsColTeam'),
      dataIndex: 'teamName',
      render: (teamName: string) => {
        const logoUrl = getTeamLogoUrl(teamName);
        return (
          <Space size={8}>
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${teamName} logo`}
                style={{ width: 24, height: 24, objectFit: 'contain', flex: '0 0 auto' }}
              />
            )}
            <Typography.Text strong>{teamName}</Typography.Text>
          </Space>
        );
      },
    },
    { title: t('dashboard.standingsColPlayed'), dataIndex: 'played', width: 60 },
    { title: t('dashboard.standingsColPoints'), dataIndex: 'points', width: 60 },
    {
      title: '5 trận gần nhất',
      dataIndex: 'recentForm',
      width: 140,
      align: 'center',
      render: renderDashboardRecentForm,
    },
  ];

  const upcomingCols: ColumnsType<Match> = [
    {
      title: t('dashboard.upcomingColRound'),
      dataIndex: 'roundNo',
      width: 70,
      render: (v: number) => `V${v}`,
    },
    {
      title: t('dashboard.upcomingColMatch'),
      key: 'match',
      render: (_, r) => (
        <div className="dashboard-upcoming-match">
          <span className="dashboard-upcoming-team dashboard-upcoming-team-left">
            {r.homeTeam?.name ?? '-'}
          </span>
          {r.homeTeam && getTeamLogoUrl(r.homeTeam) && (
            <img
              className="dashboard-upcoming-logo"
              src={getTeamLogoUrl(r.homeTeam)}
              alt={`${r.homeTeam.name} logo`}
            />
          )}
          <Typography.Text type="secondary" className="dashboard-upcoming-vs">
            vs
          </Typography.Text>
          {r.awayTeam && getTeamLogoUrl(r.awayTeam) && (
            <img
              className="dashboard-upcoming-logo"
              src={getTeamLogoUrl(r.awayTeam)}
              alt={`${r.awayTeam.name} logo`}
            />
          )}
          <span className="dashboard-upcoming-team dashboard-upcoming-team-right">
            {r.awayTeam?.name ?? '-'}
          </span>
        </div>
      ),
    },
    {
      title: t('dashboard.upcomingColTime'),
      dataIndex: 'kickoffAt',
      width: 150,
      render: (v: string | null) => (v ? dayjs(v).format('DD/MM HH:mm') : '-'),
    },
  ];

  const recentCols: ColumnsType<RecentResult> = [
    {
      title: t('dashboard.recentColRound'),
      dataIndex: 'roundNo',
      width: 50,
      render: (v: number) => `V${v}`,
    },
    {
      title: t('dashboard.recentColMatch'),
      key: 'match',
      render: (_, r) => (
        <span>
          <strong>{r.homeTeam.name}</strong>
          {/* Đổi tag tỷ số sang màu đỏ */}
          <Tag color="red" style={{ margin: '0 6px' }}>
            {r.homeScore ?? 0} – {r.awayScore ?? 0}
          </Tag>
          <strong>{r.awayTeam.name}</strong>
        </span>
      ),
    },
    {
      title: t('dashboard.recentColDate'),
      dataIndex: 'kickoffAt',
      width: 100,
      render: (v: string | null) => (v ? dayjs(v).format('DD/MM') : '—'),
    },
  ];

  if (user?.role === 'TEAM_MANAGER') {
    return <TeamManagerDashboard />;
  }

  return (
    <div className="page-stack dashboard-page">
      <PageHero
        eyebrow="VLeague"
        title={t('dashboard.title')}
        description={dashboardWelcome}
        icon={<BarChartOutlined />}
        metrics={[
          {
            label: t('dashboard.statTeams'),
            value: loading ? '...' : stats.teams.toLocaleString('vi-VN'),
            icon: <TeamOutlined />,
          },
          {
            label: t('dashboard.statMatches'),
            value: loading ? '...' : stats.matches.toLocaleString('vi-VN'),
            icon: <CalendarOutlined />,
          },
          {
            label: t('dashboard.statSeasons'),
            value: loading ? '...' : stats.seasons.toLocaleString('vi-VN'),
            icon: <TrophyOutlined />,
          },
        ]}
      />

      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={12} sm={6} key={i}>
              <CardSkeleton />
            </Col>
          ))}
          <Col xs={24} md={12}>
            <CardSkeleton />
          </Col>
          <Col xs={24} md={12}>
            <CardSkeleton />
          </Col>
        </Row>
      ) : (
        <>
          <div className="dashboard-stat-grid">
            <Card loading={loading} hoverable className="dashboard-stat-card">
              <Statistic
                title={t('dashboard.statTeams')}
                value={stats.teams}
                prefix={<TeamOutlined />}
              />
            </Card>
            <Card loading={loading} hoverable className="dashboard-stat-card">
              <Statistic
                title={t('dashboard.statPlayers')}
                value={stats.players}
                prefix={<UserOutlined />}
              />
            </Card>
            <Card loading={loading} hoverable className="dashboard-stat-card">
              <Statistic
                title={t('dashboard.statMatches')}
                value={stats.matches}
                prefix={<CalendarOutlined />}
              />
            </Card>
            <Card loading={loading} hoverable className="dashboard-stat-card">
              <Statistic
                title={t('dashboard.statSeasons')}
                value={stats.seasons}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </div>

          <Row gutter={[16, 16]}>
            {currentSeason && (
              <Col xs={24} md={isAdmin ? 16 : 24}>
                <Card
                  className="dashboard-season-card"
                  title={
                    <DashboardCardTitle icon={<CalendarOutlined />}>
                      {currentSeason.name}
                    </DashboardCardTitle>
                  }
                  size="small"
                  loading={loading}
                >
                  <Space orientation="vertical" style={{ width: '100%' }}>
                    <Space wrap>
                      <Badge color={THEME_RED} />
                      <Tag color="red">{t('dashboard.inProgress')}</Tag>
                    </Space>
                    {seasonProgress !== null && (
                      <Progress
                        percent={seasonProgress}
                        size="small"
                        strokeColor={{
                          '0%': '#16a34a',
                          '50%': '#f59e0b',
                          '100%': THEME_RED,
                        }}
                        format={(p) => t('dashboard.seasonProgress', { percent: p })}
                      />
                    )}
                    <Typography.Text type="secondary" className="dashboard-season-meta">
                      {currentSeason.startDate
                        ? dayjs(currentSeason.startDate).format('DD/MM/YYYY')
                        : '?'}{' '}
                      →{' '}
                      {currentSeason.endDate
                        ? dayjs(currentSeason.endDate).format('DD/MM/YYYY')
                        : '?'}
                    </Typography.Text>
                  </Space>
                </Card>
              </Col>
            )}
            {isAdmin && (
              <Col xs={24} md={currentSeason ? 8 : 24}>
                <Card
                  title={
                    <DashboardCardTitle icon={<SettingOutlined />}>
                      {t('dashboard.quickActions')}
                    </DashboardCardTitle>
                  }
                  className="dashboard-panel-card dashboard-actions-card"
                  size="small"
                  loading={loading}
                >
                  <Space wrap>
                    <Button
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => navigate('/seasons')}
                    >
                      {t('dashboard.btnSeason')}
                    </Button>
                    <Button icon={<TeamOutlined />} size="small" onClick={() => navigate('/teams')}>
                      {t('dashboard.btnTeam')}
                    </Button>
                    <Button
                      icon={<CalendarOutlined />}
                      size="small"
                      onClick={() => navigate('/schedule')}
                    >
                      {t('dashboard.btnSchedule')}
                    </Button>
                    <Button
                      icon={<SettingOutlined />}
                      size="small"
                      onClick={() => navigate('/regulations')}
                    >
                      {t('dashboard.btnRegulation')}
                    </Button>
                  </Space>
                </Card>
              </Col>
            )}
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                title={
                  <DashboardCardTitle icon={<TrophyOutlined />}>
                    {t('dashboard.standingsTitle')}
                  </DashboardCardTitle>
                }
                className="dashboard-panel-card"
                size="small"
                hoverable
              >
                <Table
                  columns={standingsCols}
                  dataSource={standings}
                  rowKey="teamId"
                  loading={loading}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: t('dashboard.standingsEmpty') }}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title={
                  <DashboardCardTitle icon={<CalendarOutlined />}>
                    {t('dashboard.upcomingTitle')}
                  </DashboardCardTitle>
                }
                className="dashboard-panel-card"
                size="small"
                hoverable
              >
                <Table
                  columns={upcomingCols}
                  dataSource={upcoming}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: t('dashboard.upcomingEmpty') }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={14}>
              <Card
                title={
                  <DashboardCardTitle icon={<CalendarOutlined />}>
                    {t('dashboard.recentTitle')}
                  </DashboardCardTitle>
                }
                className="dashboard-panel-card"
                size="small"
                hoverable
              >
                <Table
                  columns={recentCols}
                  dataSource={recentResults}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: t('dashboard.recentEmpty') }}
                />
              </Card>
            </Col>
            <Col xs={24} md={10}>
              <Card
                title={
                  <DashboardCardTitle icon={<TrophyOutlined />}>
                    {t('dashboard.topScorersTitle')}
                  </DashboardCardTitle>
                }
                className="dashboard-panel-card"
                size="small"
                hoverable
              >
                <Table
                  dataSource={topScorers}
                  rowKey="playerId"
                  loading={loading}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: t('dashboard.topScorersEmpty') }}
                  columns={[
                    { title: '#', dataIndex: 'position', width: 40 },
                    {
                      title: t('dashboard.topScorersColPlayer'),
                      dataIndex: 'playerName',
                      ellipsis: true,
                    },
                    {
                      title: t('dashboard.topScorersColTeam'),
                      dataIndex: 'teamName',
                      width: 120,
                      ellipsis: true,
                    },
                    {
                      title: t('dashboard.goalsColGoals'),
                      dataIndex: 'goals',
                      width: 50,
                      align: 'center',
                      render: (v: number) => <strong style={{ color: THEME_RED }}>{v}</strong>,
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>

          {standings.length > 0 && recentResults.length > 0 && (
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card
                  title={
                    <DashboardCardTitle icon={<BarChartOutlined />}>
                      {t('dashboard.teamFormTitle')}
                    </DashboardCardTitle>
                  }
                  className="dashboard-panel-card"
                  size="small"
                  hoverable
                >
                  <div className="dashboard-form-strip">
                    {standings.map((team) => {
                      const teamResults = recentResults
                        .filter(
                          (r) =>
                            r.homeTeam.name === team.teamName || r.awayTeam.name === team.teamName,
                        )
                        .slice(0, 5)
                        .map((r) => {
                          const isHome = r.homeTeam.name === team.teamName;
                          const ownScore = isHome ? r.homeScore : r.awayScore;
                          const oppScore = isHome ? r.awayScore : r.homeScore;
                          if (ownScore == null || oppScore == null) return 'D';
                          if (ownScore > oppScore) return 'W';
                          if (ownScore < oppScore) return 'L';
                          return 'D';
                        });
                      if (teamResults.length === 0) return null;
                      return (
                        <div key={team.teamId} className="dashboard-form-team">
                          <span className="dashboard-form-team-name">{team.teamName}</span>
                          <Space size={4}>
                            {teamResults.map((result, i) => (
                              <span
                                key={i}
                                className={`dashboard-form-result dashboard-form-result-${result.toLowerCase()}`}
                              >
                                {result}
                              </span>
                            ))}
                          </Space>
                          <Tag
                            color={
                              teamResults.filter((r) => r === 'W').length >= 3
                                ? 'green'
                                : teamResults.filter((r) => r === 'L').length >= 3
                                  ? 'red'
                                  : 'default'
                            }
                            className="dashboard-form-summary"
                          >
                            {teamResults.filter((r) => r === 'W').length}W{' '}
                            {teamResults.filter((r) => r === 'D').length}D{' '}
                            {teamResults.filter((r) => r === 'L').length}L
                          </Tag>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          <Row gutter={[16, 16]}>
            {goalsPerRound.length > 0 && (
              <Col xs={24} md={14}>
                <Card
                  title={
                    <DashboardCardTitle icon={<BarChartOutlined />}>
                      {t('dashboard.goalsPerRoundTitle')}
                    </DashboardCardTitle>
                  }
                  className="dashboard-panel-card"
                  size="small"
                  hoverable
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={goalsPerRound}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="round" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis
                        allowDecimals={false}
                        fontSize={12}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(227, 34, 33, 0.1)' }}
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Bar dataKey="goals" fill={THEME_RED} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            )}
            {cardStats.length > 0 && (
              <Col xs={24} md={goalsPerRound.length > 0 ? 10 : 24}>
                <Card
                  title={
                    <DashboardCardTitle icon={<FileDoneOutlined />}>
                      {t('dashboard.cardStatsTitle')}
                    </DashboardCardTitle>
                  }
                  className="dashboard-panel-card"
                  size="small"
                  hoverable
                >
                  <Table
                    dataSource={cardStats}
                    rowKey="playerId"
                    loading={loading}
                    pagination={false}
                    size="small"
                    locale={{ emptyText: t('dashboard.cardStatsEmpty') }}
                    columns={[
                      { title: '#', key: 'pos', width: 40, render: (_, __, i) => i + 1 },
                      {
                        title: t('dashboard.cardStatsColPlayer'),
                        dataIndex: 'playerName',
                        ellipsis: true,
                      },
                      {
                        title: t('dashboard.cardStatsColYellow'),
                        dataIndex: 'yellowCards',
                        width: 50,
                        align: 'center' as const,
                        render: (v: number) => <strong style={{ color: '#faad14' }}>{v}</strong>,
                      },
                      {
                        title: t('dashboard.cardStatsColRed'),
                        dataIndex: 'redCards',
                        width: 50,
                        align: 'center' as const,
                        render: (v: number) => <strong style={{ color: THEME_RED }}>{v}</strong>,
                      },
                    ]}
                  />
                </Card>
              </Col>
            )}
          </Row>
        </>
      )}
    </div>
  );
}
