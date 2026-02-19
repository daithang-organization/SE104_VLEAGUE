import { DeleteOutlined, EditOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
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
import { useEffect, useState } from 'react';
import {
  apiDeleteRegulation,
  apiGetRegulations,
  apiSeedDefaultRegulations,
  apiUpsertRegulation,
  type Regulation,
} from '../services/regulationApi';
import { apiGetSeasons, type Season } from '../services/seasonApi';

const VALUE_TYPE_OPTIONS = [
  { label: 'Số', value: 'number' },
  { label: 'Chuỗi', value: 'string' },
  { label: 'Boolean', value: 'boolean' },
];

const REGULATION_LABELS: Record<string, string> = {
  MIN_AGE: 'Tuổi tối thiểu',
  MAX_AGE: 'Tuổi tối đa',
  MIN_ROSTER: 'Số cầu thủ tối thiểu',
  MAX_ROSTER: 'Số cầu thủ tối đa',
  MAX_FOREIGN_PLAYERS: 'Số ngoại binh tối đa',
  WIN_POINTS: 'Điểm thắng',
  DRAW_POINTS: 'Điểm hòa',
  LOSS_POINTS: 'Điểm thua',
  MAX_GOAL_TIME: 'Thời điểm ghi bàn tối đa (phút)',
};

export default function RegulationsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReg, setEditingReg] = useState<Regulation | null>(null);
  const [form] = Form.useForm();

  // Load seasons on mount
  useEffect(() => {
    apiGetSeasons()
      .then((data) => {
        setSeasons(data);
        // Auto-select current season or first
        const current = data.find((s) => s.status === 'IN_PROGRESS');
        if (current) setSelectedSeason(current.id);
        else if (data.length > 0) setSelectedSeason(data[0].id);
      })
      .catch(() => message.error('Không thể tải danh sách mùa giải'));
  }, []);

  // Load regulations when season changes
  useEffect(() => {
    if (!selectedSeason) return;
    loadRegulations();
  }, [selectedSeason]);

  async function loadRegulations() {
    setLoading(true);
    try {
      const data = await apiGetRegulations(selectedSeason);
      setRegulations(data);
    } catch {
      message.error('Không thể tải quy định');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingReg(null);
    form.resetFields();
    form.setFieldsValue({ valueType: 'number' });
    setModalOpen(true);
  }

  function openEditModal(reg: Regulation) {
    setEditingReg(reg);
    form.setFieldsValue({
      key: reg.key,
      value: reg.value,
      valueType: reg.valueType,
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      await apiUpsertRegulation(selectedSeason, {
        key: values.key,
        value: values.value,
        valueType: values.valueType,
      });
      message.success(editingReg ? 'Đã cập nhật quy định' : 'Đã thêm quy định');
      setModalOpen(false);
      loadRegulations();
    } catch {
      // validation errors handled by form
    }
  }

  async function handleDelete(key: string) {
    try {
      await apiDeleteRegulation(selectedSeason, key);
      message.success('Đã xóa quy định');
      loadRegulations();
    } catch {
      message.error('Không thể xóa quy định');
    }
  }

  async function handleSeedDefaults() {
    try {
      await apiSeedDefaultRegulations(selectedSeason);
      message.success('Đã khởi tạo quy định mặc định');
      loadRegulations();
    } catch {
      message.error('Không thể khởi tạo quy định mặc định');
    }
  }

  const columns: ColumnsType<Regulation> = [
    {
      title: 'Khóa',
      dataIndex: 'key',
      width: 220,
      render: (key: string) => (
        <span>
          <Tag color="blue">{key}</Tag>
          {REGULATION_LABELS[key] && (
            <Typography.Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
              {REGULATION_LABELS[key]}
            </Typography.Text>
          )}
        </span>
      ),
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      width: 150,
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: 'Kiểu',
      dataIndex: 'valueType',
      width: 100,
      render: (vt: string) => <Tag>{vt}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            size="small"
          />
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => handleDelete(record.key)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={3}>Quy định giải đấu</Typography.Title>
      <Typography.Paragraph type="secondary">
        Quản lý các quy định của từng mùa giải VLeague.
      </Typography.Paragraph>

      <Card
        title={
          <Space>
            <span>Mùa giải:</span>
            <Select
              style={{ width: 240 }}
              value={selectedSeason || undefined}
              onChange={setSelectedSeason}
              placeholder="Chọn mùa giải"
              options={seasons.map((s) => ({
                label: `${s.name} (${s.year})`,
                value: s.id,
              }))}
            />
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<ThunderboltOutlined />}
              onClick={handleSeedDefaults}
              disabled={!selectedSeason}
            >
              Khởi tạo mặc định
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              disabled={!selectedSeason}
            >
              Thêm quy định
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={regulations}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
          locale={{ emptyText: 'Chưa có quy định. Nhấn "Khởi tạo mặc định" để bắt đầu.' }}
        />
      </Card>

      <Modal
        title={editingReg ? 'Sửa quy định' : 'Thêm quy định'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingReg ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="key"
            label="Khóa quy định"
            rules={[{ required: true, message: 'Vui lòng nhập khóa' }]}
          >
            <Input placeholder="VD: MAX_FOREIGN_PLAYERS" disabled={!!editingReg} />
          </Form.Item>
          <Form.Item
            name="value"
            label="Giá trị"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
          >
            <Input placeholder="VD: 3" />
          </Form.Item>
          <Form.Item name="valueType" label="Kiểu dữ liệu">
            <Select options={VALUE_TYPE_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
