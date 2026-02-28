import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
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
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGetStadium, type StadiumDetail, type StadiumMatch } from '../services/stadiumApi';

import { STATUS_MAP } from '../utils/constants';

const { Title } = Typography;

export default function StadiumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stadium, setStadium] = useState<StadiumDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetch = async () => {
      try {
        const data = await apiGetStadium(id);
        if (!cancelled) setStadium(data);
      } catch {
        if (!cancelled) message.error('Không thể tải thông tin sân vận động');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    setLoading(true);
    fetch();
    return () => {
      cancelled = true;
    };
  }, [id]);

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
        <Title level={4}>Không tìm thấy sân vận động</Title>
        <Button onClick={() => navigate('/stadiums')}>Quay lại</Button>
      </div>
    );
  }

  const finishedMatches = stadium.matches.filter((m) => m.status === 'FINISHED');
  const upcomingMatches = stadium.matches.filter((m) => m.status !== 'FINISHED');

  const matchColumns = [
    {
      title: 'Vòng',
      key: 'round',
      width: 80,
      render: (_: unknown, r: StadiumMatch) => `V${r.roundNo}`,
    },
    {
      title: 'Đội nhà',
      key: 'home',
      render: (_: unknown, r: StadiumMatch) => (
        <a onClick={() => navigate(`/teams/${r.homeTeam.id}`)}>{r.homeTeam.name}</a>
      ),
    },
    {
      title: 'Tỷ số',
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
      title: 'Đội khách',
      key: 'away',
      render: (_: unknown, r: StadiumMatch) => (
        <a onClick={() => navigate(`/teams/${r.awayTeam.id}`)}>{r.awayTeam.name}</a>
      ),
    },
    {
      title: 'Ngày',
      key: 'date',
      width: 130,
      render: (_: unknown, r: StadiumMatch) =>
        r.kickoffAt ? dayjs(r.kickoffAt).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 110,
      render: (_: unknown, r: StadiumMatch) => {
        const s = STATUS_MAP[r.status];
        return <Tag color={s?.color}>{s?.label ?? r.status}</Tag>;
      },
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: unknown, r: StadiumMatch) => (
        <Button type="link" size="small" onClick={() => navigate(`/matches/${r.id}`)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/stadiums')}>
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          🏟️ {stadium.name}
        </Title>
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Sức chứa"
              value={stadium.capacity ? stadium.capacity.toLocaleString('vi-VN') : 'Chưa cập nhật'}
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: stadium.capacity ? 24 : 16 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Đội sân nhà"
              value={stadium.teams.length}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Tổng trận đấu"
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
            label: '📋 Thông tin',
            children: (
              <Card>
                <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Tên sân">{stadium.name}</Descriptions.Item>
                  <Descriptions.Item label="Thành phố">{stadium.city}</Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">{stadium.address ?? '—'}</Descriptions.Item>
                  <Descriptions.Item label="Sức chứa">
                    {stadium.capacity ? stadium.capacity.toLocaleString('vi-VN') : '—'}
                  </Descriptions.Item>
                </Descriptions>

                {stadium.teams.length > 0 && (
                  <Card size="small" title="Đội sân nhà" style={{ marginTop: 16 }}>
                    <Space wrap>
                      {stadium.teams.map((t) => (
                        <Tag
                          key={t.id}
                          color="blue"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/teams/${t.id}`)}
                        >
                          {t.name}
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
            label: `⚽ Trận đấu (${stadium.matches.length})`,
            children: (
              <div>
                {upcomingMatches.length > 0 && (
                  <Card size="small" title="Sắp diễn ra" style={{ marginBottom: 16 }}>
                    <Table
                      dataSource={upcomingMatches}
                      columns={matchColumns}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  </Card>
                )}
                <Card size="small" title={`Đã hoàn thành (${finishedMatches.length})`}>
                  <Table
                    dataSource={finishedMatches}
                    columns={matchColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                    locale={{ emptyText: 'Chưa có trận đấu nào' }}
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
