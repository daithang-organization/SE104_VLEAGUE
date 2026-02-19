import { CalendarOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
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
