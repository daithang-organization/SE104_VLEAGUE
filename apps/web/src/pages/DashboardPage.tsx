import {
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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../auth/AuthContext';
import { CardSkeleton } from '../components';
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
import { apiGetTeam, apiGetTeams, type Team, type TeamDetail } from '../services/teamApi';
import {
  apiCreateTeamManagerAssignment,
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
  const [teams, setTeams] = useState<Team[]>([]);
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
        const [teamsData, seasonsData] = await Promise.all([apiGetTeams(1, 100), apiGetSeasons()]);
        const season = getDashboardSeason(seasonsData);
        const assignment = season?.id ? await apiGetTeamManagerAssignment(season.id) : null;

        setTeams(teamsData.data);
        setCurrentSeason(season);
        setSelectedTeamId(assignment?.teamId ?? null);
      } catch (_err) {
        message.error('Không tải được dữ liệu chọn đội bóng');
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

  const handleSelectTeam = async (teamId: string) => {
    if (!currentSeason?.id) return;

    setLoading(true);
    try {
      const assignment = await apiCreateTeamManagerAssignment(currentSeason.id, teamId);
      setSelectedTeamId(assignment.teamId);
      message.success('Đã chọn CLB quản lý cho mùa giải này');
    } catch (_err) {
      message.error('Không thể chọn CLB. Tài khoản này có thể đã chọn CLB cho mùa giải.');
    } finally {
      setLoading(false);
    }
  };

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

  if (!selectedTeamId) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3}>Chọn CLB quản lý</Typography.Title>
          <Typography.Paragraph type="secondary">
            Vui lòng chọn đội bóng của bạn để bắt đầu trang quản lý CLB.
          </Typography.Paragraph>
          <Typography.Text type="danger">
            Lưu ý: Bạn chỉ được chọn một lần duy nhất và không thể thay đổi đến hết mùa giải.
          </Typography.Text>
        </div>

        <Row gutter={[16, 16]}>
          {teams.map((candidate) => {
            const logoUrl = getTeamLogoUrl(candidate);
            return (
              <Col xs={12} sm={8} md={6} lg={4} key={candidate.id}>
                <Card
                  hoverable
                  loading={loading}
                  onClick={() => handleSelectTeam(candidate.id)}
                  style={{ textAlign: 'center', minHeight: 188 }}
                  styles={{
                    body: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 14,
                      minHeight: 188,
                    },
                  }}
                >
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt={`${candidate.name} logo`}
                      style={{ width: 82, height: 82, objectFit: 'contain', flex: '0 0 auto' }}
                    />
                  )}
                  <Typography.Text
                    strong
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'center',
                      lineHeight: 1.35,
                    }}
                  >
                    {candidate.name}
                  </Typography.Text>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Space>
    );
  }

  return (
    <div>
      <Typography.Title level={3}>
        Chào mừng đến trang quản lý chính thức của CLB {team?.name ?? '...'}
      </Typography.Title>

      <Card
        title={
          <Space size={8}>
            <FileDoneOutlined />
            <span>Hồ sơ tham dự mùa giải</span>
          </Space>
        }
        size="small"
        extra={<Tag color={applicationStatus.color}>{applicationStatus.label}</Tag>}
        loading={loading && !application}
        style={{ marginBottom: 16 }}
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

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card loading={loading} hoverable className="stat-card">
            <Space align="center">
              {team && getTeamLogoUrl(team) && (
                <img
                  src={getTeamLogoUrl(team)}
                  alt={`${team.name} logo`}
                  style={{ width: 48, height: 48, objectFit: 'contain' }}
                />
              )}
              <Statistic title="Đội bóng" value={team?.name ?? '...'} />
            </Space>
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card loading={loading} hoverable className="stat-card">
            <Statistic
              title="Cầu thủ"
              value={team?.roster?.length ?? 0}
              prefix={<UserOutlined />}
              styles={{ content: { color: '#fa8c16', fontWeight: 'bold' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card loading={loading} hoverable className="stat-card">
            <Statistic
              title="Trận đấu"
              value={teamMatches.length}
              prefix={<CalendarOutlined />}
              styles={{ content: { color: THEME_RED, fontWeight: 'bold' } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Card
            title={`🏆 Bảng xếp hạng (Thứ ${selectedStanding?.position ?? '—'} tại VLeague)`}
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
          <Card title="🧾 Trận đấu sắp tới" size="small" hoverable>
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
          <Card title="⚽ Kết quả gần đây" size="small" hoverable>
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
          <Card title="🏅 Vua phá lưới (Top 5 CLB)" size="small" hoverable>
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
                  title: '⚽',
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

      <style>{`
        .manager-upcoming-match {
          display: grid;
          grid-template-columns: minmax(140px, 1fr) 28px 28px 28px minmax(140px, 1fr);
          align-items: center;
          column-gap: 8px;
        }
        .manager-upcoming-team {
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .manager-upcoming-team-left {
          text-align: right;
        }
        .manager-upcoming-team-right {
          text-align: left;
        }
        .manager-upcoming-logo {
          width: 24px;
          height: 24px;
          object-fit: contain;
          justify-self: center;
          flex: 0 0 auto;
        }
        .manager-upcoming-vs {
          justify-self: center;
          font-weight: 700;
        }
        .manager-home-team-row td {
          background: rgba(227, 34, 33, 0.18) !important;
          font-weight: 700;
        }
      `}</style>
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
    <div>
      {/* Thêm chút CSS trực tiếp cho các hiệu ứng hover mượt mà */}
      <style>{`
        /* Khung Card chính */
        .stat-card {
          position: relative;
          background: #152238; /* Phải set cứng màu nền để trùng với màu box bên dưới */
          border: none !important;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        /* Lúc di chuột vẫn nhấc nhẹ cái box lên */
        .stat-card:hover {
          transform: translateY(-5px);
        }

        /* TẠO AURA QUAY (conic-gradient) NẰM LỚP DƯỚI CÙNG */
        .stat-card::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            transparent,
            transparent,
            transparent,
            #E32221
          );
          animation: spin-aura 0.75s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 0;
        }

        /* Lớp giả ở giữa (nhỏ hơn thẻ 1 tí) che đi phần ruột của Aura, chỉ để hở 2px viền */
        .stat-card::after {
          content: "";
          position: absolute;
          inset: 3px; /* 2px này chính là độ dày của cái vòng Aura */
          background: #152238; /* Cùng màu nền box để tàng hình */
          border-radius: 6px;
          z-index: 1;
        }

        /* Kéo ruột của Ant Design Card lên lớp trên cùng để không bị che */
        .stat-card .ant-card-body {
          position: relative;
          z-index: 2;
        }

        /* Khi hover thì hiện Aura ra */
        .stat-card:hover::before {
          opacity: 1;
        }

        :root[data-theme='light'] .stat-card {
          background: var(--primary);
        }

        :root[data-theme='light'] .stat-card::before {
          background: conic-gradient(
            transparent,
            transparent,
            transparent,
            #ffffff
          );
        }

        :root[data-theme='light'] .stat-card::after {
          background: var(--primary);
        }

        :root[data-theme='light'] .stat-card .ant-statistic-title,
        :root[data-theme='light'] .stat-card .ant-statistic-content,
        :root[data-theme='light'] .stat-card .ant-statistic-content-prefix,
        :root[data-theme='light'] .stat-card .ant-statistic-content-value {
          color: #ffffff !important;
        }

        .dashboard-upcoming-match {
          display: grid;
          grid-template-columns: minmax(140px, 1fr) 28px 28px 28px minmax(140px, 1fr);
          align-items: center;
          column-gap: 8px;
        }

        .dashboard-upcoming-team {
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dashboard-upcoming-team-left {
          text-align: right;
        }

        .dashboard-upcoming-team-right {
          text-align: left;
        }

        .dashboard-upcoming-logo {
          width: 24px;
          height: 24px;
          object-fit: contain;
          justify-self: center;
          flex: 0 0 auto;
        }

        .dashboard-upcoming-vs {
          justify-self: center;
          font-weight: 700;
        }

        /* Keyframe xoay Aura */
        @keyframes spin-aura {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
      }
      `}</style>

      <Typography.Title level={3}>{t('dashboard.title')}</Typography.Title>
      <Typography.Paragraph type="secondary">{dashboardWelcome}</Typography.Paragraph>

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
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card loading={loading} hoverable className="stat-card">
                <Statistic
                  title={t('dashboard.statTeams')}
                  value={stats.teams}
                  prefix={<TeamOutlined />}
                  styles={{ content: { color: THEME_RED, fontWeight: 'bold' } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card loading={loading} hoverable className="stat-card">
                <Statistic
                  title={t('dashboard.statPlayers')}
                  value={stats.players}
                  prefix={<UserOutlined />}
                  styles={{ content: { color: '#fa8c16', fontWeight: 'bold' } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card loading={loading} hoverable className="stat-card">
                <Statistic
                  title={t('dashboard.statMatches')}
                  value={stats.matches}
                  prefix={<CalendarOutlined />}
                  styles={{ content: { color: THEME_RED, fontWeight: 'bold' } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card loading={loading} hoverable className="stat-card">
                <Statistic
                  title={t('dashboard.statSeasons')}
                  value={stats.seasons}
                  prefix={<TrophyOutlined />}
                  styles={{ content: { color: '#eb2f96', fontWeight: 'bold' } }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            {currentSeason && (
              <Col xs={24} md={isAdmin ? 16 : 24}>
                <Card
                  size="small"
                  loading={loading}
                  style={{ borderTop: `3px solid ${THEME_RED}` }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <Badge color={THEME_RED} />
                      <Typography.Text strong>{currentSeason.name}</Typography.Text>
                      <Tag color="red">{t('dashboard.inProgress')}</Tag>
                    </Space>
                    {seasonProgress !== null && (
                      <Progress
                        percent={seasonProgress}
                        size="small"
                        strokeColor={{
                          '0%': '#52c41a', // Bắt đầu: Xanh lá cây mướt mắt
                          '50%': '#faad14', // Giữa mùa: Chuyển sang vàng cam cho mượt
                          '100%': '#E32221', // Cuối mùa: Đỏ rực VLeague
                        }}
                        format={(p) => t('dashboard.seasonProgress', { percent: p })}
                      />
                    )}
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
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
                <Card title={t('dashboard.quickActions')} size="small" loading={loading}>
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

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <Card title={t('dashboard.standingsTitle')} size="small" hoverable>
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
              <Card title={t('dashboard.upcomingTitle')} size="small" hoverable>
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

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={14}>
              <Card title={t('dashboard.recentTitle')} size="small" hoverable>
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
              <Card title={`🏅 ${t('dashboard.topScorersTitle')}`} size="small" hoverable>
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
                      title: '⚽',
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
                <Card title={`📊 ${t('dashboard.teamFormTitle')}`} size="small" hoverable>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
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
                        <div
                          key={team.teamId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 12px',
                            borderRadius: 8,
                            background: 'var(--ant-color-fill-quaternary)', // Chỉ giữ lại biến màu linh hoạt của Antd
                            minWidth: 200,
                          }}
                        >
                          <span style={{ fontWeight: 600, minWidth: 100, fontSize: 13 }}>
                            {team.teamName}
                          </span>
                          <Space size={4}>
                            {teamResults.map((result, i) => (
                              <span
                                key={i}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: '#fff',
                                  background:
                                    result === 'W'
                                      ? '#52c41a' // Thắng giữ màu xanh lá
                                      : result === 'L'
                                        ? THEME_RED // Thua cho màu đỏ
                                        : '#8c8c8c',
                                }}
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
                            style={{ marginLeft: 'auto', fontSize: 11 }}
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

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {goalsPerRound.length > 0 && (
              <Col xs={24} md={14}>
                <Card title={`⚽ ${t('dashboard.goalsPerRoundTitle')}`} size="small" hoverable>
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
                      {/* Đổi màu cột sang đỏ */}
                      <Bar dataKey="goals" fill={THEME_RED} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            )}
            {cardStats.length > 0 && (
              <Col xs={24} md={goalsPerRound.length > 0 ? 10 : 24}>
                <Card title={`🟨 ${t('dashboard.cardStatsTitle')}`} size="small" hoverable>
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
                        title: '🟨',
                        dataIndex: 'yellowCards',
                        width: 50,
                        align: 'center' as const,
                        render: (v: number) => <strong style={{ color: '#faad14' }}>{v}</strong>,
                      },
                      {
                        title: '🟥',
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
