import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  apiCreateSeason,
  apiDeleteSeason,
  apiGetSeasons,
  apiUpdateSeason,
  apiUpdateSeasonStatus,
  type CreateSeasonPayload,
  type Season,
} from '../services/seasonApi';
import {
  apiGetSeasonTeams,
  apiRegisterTeam,
  apiRemoveSeasonTeam,
  apiUpdateSeasonTeamStatus,
  type SeasonTeam,
} from '../services/seasonTeamApi';
import { apiGetTeams, type Team } from '../services/teamApi';

const STATUS_OPTIONS = [
  { value: 'UPCOMING', label: 'Sắp diễn ra', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'Đang diễn ra', color: 'green' },
  { value: 'COMPLETED', label: 'Đã kết thúc', color: 'default' },
];

// Generate season year options: e.g. "2024/2025", "2025/2026", etc.
function generateYearOptions() {
  const currentYear = new Date().getFullYear();
  const options = [];
  for (let y = currentYear - 3; y <= currentYear + 3; y++) {
    options.push({
      value: y,
      label: `Mùa giải ${y}/${y + 1}`,
    });
  }
  return options;
}

const TEAM_STATUS_MAP: Record<string, { label: string; color: string }> = {
  REGISTERED: { label: 'Đã đăng ký', color: 'processing' },
  APPROVED: { label: 'Đã duyệt', color: 'success' },
  REJECTED: { label: 'Từ chối', color: 'error' },
  WITHDRAWN: { label: 'Rút lui', color: 'default' },
};

// ─── Season Team Panel (expandable row) ───
function SeasonTeamPanel({ seasonId }: { seasonId: string }) {
  const [teams, setTeams] = useState<SeasonTeam[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const [seasonTeams, teamList] = await Promise.all([
        apiGetSeasonTeams(seasonId),
        apiGetTeams(),
      ]);
      setTeams(seasonTeams);
      setAllTeams(teamList);
    } catch {
      message.error('Không thể tải danh sách đội');
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const registeredTeamIds = new Set(teams.map((t) => t.teamId));
  const availableTeams = allTeams.filter(
    (t) => !registeredTeamIds.has(t.id) && t.status === 'ACTIVE',
  );

  const handleAdd = async () => {
    if (!selectedTeamId) return;
    setAdding(true);
    try {
      await apiRegisterTeam(seasonId, selectedTeamId);
      message.success('Đã đăng ký đội');
      setSelectedTeamId(undefined);
      fetchTeams();
    } catch {
      message.error('Không thể đăng ký đội');
    } finally {
      setAdding(false);
    }
  };

  const handleStatus = async (teamId: string, status: string) => {
    try {
      await apiUpdateSeasonTeamStatus(seasonId, teamId, status);
      message.success('Đã cập nhật trạng thái');
      fetchTeams();
    } catch {
      message.error('Không thể cập nhật');
    }
  };

  const handleRemove = async (teamId: string) => {
    try {
      await apiRemoveSeasonTeam(seasonId, teamId);
      message.success('Đã xóa đội');
      fetchTeams();
    } catch {
      message.error('Không thể xóa đội');
    }
  };

  const cols: ColumnsType<SeasonTeam> = [
    {
      title: 'Đội',
      key: 'team',
      render: (_, r) => (
        <Space size={6}>
          {r.team.logoUrl && (
            <img
              src={r.team.logoUrl}
              alt=""
              style={{ width: 20, height: 20, objectFit: 'contain' }}
            />
          )}
          <strong>{r.team.name}</strong>
          {r.team.shortName && <span style={{ color: '#888' }}>({r.team.shortName})</span>}
        </Space>
      ),
    },
    {
      title: 'Thành phố',
      key: 'city',
      width: 140,
      render: (_, r) => r.team.city ?? '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (s: string) => {
        const m = TEAM_STATUS_MAP[s] ?? { label: s, color: 'default' };
        return <Tag color={m.color}>{m.label}</Tag>;
      },
    },
    {
      title: 'Ngày ĐK',
      dataIndex: 'registeredAt',
      width: 120,
      render: (d: string) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: '',
      key: 'actions',
      width: 140,
      render: (_, r) => (
        <Space size={4}>
          {r.status === 'REGISTERED' && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  style={{ color: '#52c41a' }}
                  onClick={() => handleStatus(r.teamId, 'APPROVED')}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  danger
                  onClick={() => handleStatus(r.teamId, 'REJECTED')}
                />
              </Tooltip>
            </>
          )}
          <Popconfirm
            title="Xóa đội khỏi mùa giải?"
            onConfirm={() => handleRemove(r.teamId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Typography.Text strong>
          <TeamOutlined /> Đội tham gia ({teams.filter((t) => t.status === 'APPROVED').length} duyệt
          / {teams.length} ĐK)
        </Typography.Text>
        <Space>
          <Select
            value={selectedTeamId}
            onChange={setSelectedTeamId}
            placeholder="Chọn đội để thêm"
            style={{ width: 250 }}
            allowClear
            showSearch
            optionFilterProp="label"
            options={availableTeams.map((t) => ({
              value: t.id,
              label: `${t.name}${t.shortName ? ` (${t.shortName})` : ''}`,
            }))}
          />
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            disabled={!selectedTeamId}
            loading={adding}
            onClick={handleAdd}
          >
            Thêm
          </Button>
        </Space>
      </Flex>
      <Table
        columns={cols}
        dataSource={teams}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="small"
        locale={{ emptyText: 'Chưa có đội nào đăng ký' }}
      />
    </div>
  );
}

export default function SeasonsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const yearOptions = generateYearOptions();

  const fetchSeasons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetSeasons();
      setSeasons(data);
    } catch {
      message.error('Không thể tải danh sách mùa giải');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    const currentYear = new Date().getFullYear();
    form.setFieldsValue({
      year: currentYear,
      name: `VLeague ${currentYear}/${currentYear + 1}`,
      status: 'UPCOMING',
    });
    setModalOpen(true);
  };

  const openEdit = (season: Season) => {
    setEditing(season);
    form.setFieldsValue({
      name: season.name,
      year: season.year,
      status: season.status,
      startDate: season.startDate ? dayjs(season.startDate) : undefined,
      endDate: season.endDate ? dayjs(season.endDate) : undefined,
    });
    setModalOpen(true);
  };

  const handleYearChange = (year: number) => {
    if (!editing) {
      form.setFieldValue('name', `VLeague ${year}/${year + 1}`);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload: CreateSeasonPayload = {
        name: values.name,
        year: values.year,
        status: values.status,
        startDate: values.startDate ? values.startDate.toISOString() : undefined,
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
      };

      if (editing) {
        await apiUpdateSeason(editing.id, payload);
        message.success('Đã cập nhật mùa giải');
      } else {
        await apiCreateSeason(payload);
        message.success('Đã tạo mùa giải mới');
      }

      setModalOpen(false);
      fetchSeasons();
    } catch {
      message.error('Lỗi khi lưu mùa giải');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteSeason(id);
      message.success('Đã xóa mùa giải');
      fetchSeasons();
    } catch {
      message.error('Không thể xóa mùa giải (có thể đang có lịch thi đấu)');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiUpdateSeasonStatus(id, status);
      message.success('Đã cập nhật trạng thái');
      fetchSeasons();
    } catch {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const columns: ColumnsType<Season> = [
    {
      title: 'Mùa giải',
      dataIndex: 'name',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: 'Năm',
      dataIndex: 'year',
      width: 120,
      align: 'center',
      render: (year: number) => `${year}/${year + 1}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      align: 'center',
      render: (status: string, record: Season) => {
        const s = STATUS_OPTIONS.find((o) => o.value === status);
        if (isAdmin) {
          return (
            <Select
              value={status}
              onChange={(v) => handleStatusChange(record.id, v)}
              size="small"
              style={{ width: 130 }}
              options={STATUS_OPTIONS.map((o) => ({
                value: o.value,
                label: <Tag color={o.color}>{o.label}</Tag>,
              }))}
            />
          );
        }
        return <Tag color={s?.color}>{s?.label ?? status}</Tag>;
      },
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      width: 140,
      render: (d: string | null) =>
        d ? (
          <Flex align="center" gap={4}>
            <CalendarOutlined style={{ color: '#1677ff', fontSize: 12 }} />
            {dayjs(d).format('DD/MM/YYYY')}
          </Flex>
        ) : (
          <span style={{ color: '#ccc' }}>Chưa đặt</span>
        ),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      width: 140,
      render: (d: string | null) =>
        d ? dayjs(d).format('DD/MM/YYYY') : <span style={{ color: '#ccc' }}>Chưa đặt</span>,
    },
    ...(isAdmin
      ? [
          {
            title: '',
            key: 'actions',
            width: 80,
            render: (_: unknown, record: Season) => (
              <Space size="small">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => openEdit(record)}
                />
                <Popconfirm
                  title="Xóa mùa giải này?"
                  description="Tất cả lịch thi đấu liên quan sẽ bị xóa."
                  onConfirm={() => handleDelete(record.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <Card>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          📅 Quản lý mùa giải
        </Typography.Title>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Tạo mùa giải
          </Button>
        )}
      </Flex>

      <Table
        columns={columns}
        dataSource={seasons}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
        expandable={
          isAdmin
            ? {
                expandedRowRender: (record) => <SeasonTeamPanel seasonId={record.id} />,
                expandRowByClick: false,
              }
            : undefined
        }
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editing ? 'Sửa mùa giải' : 'Tạo mùa giải mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? 'Lưu' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="year"
            label="Chọn mùa giải"
            rules={[{ required: true, message: 'Vui lòng chọn năm' }]}
          >
            <Select
              options={yearOptions}
              size="large"
              onChange={handleYearChange}
              placeholder="Chọn mùa giải"
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên mùa giải"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="VLeague 2025/2026" />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" initialValue="UPCOMING">
            <Select options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
          </Form.Item>

          <Flex gap={16}>
            <Form.Item name="startDate" label="Ngày bắt đầu" style={{ flex: 1 }}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày" />
            </Form.Item>
            <Form.Item name="endDate" label="Ngày kết thúc" style={{ flex: 1 }}>
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày" />
            </Form.Item>
          </Flex>
        </Form>
      </Modal>
    </Card>
  );
}
