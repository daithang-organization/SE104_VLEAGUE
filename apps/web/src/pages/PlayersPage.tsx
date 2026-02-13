import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
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
import {
  apiCreatePlayer,
  apiDeletePlayer,
  apiGetPlayers,
  apiUpdatePlayer,
  type CreatePlayerPayload,
  type Player,
} from '../services/playerApi';

const POSITION_LABELS: Record<string, string> = {
  GK: 'Thủ môn',
  DF: 'Hậu vệ',
  MF: 'Tiền vệ',
  FW: 'Tiền đạo',
};

const POSITION_COLORS: Record<string, string> = {
  GK: 'gold',
  DF: 'blue',
  MF: 'green',
  FW: 'red',
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetPlayers();
      setPlayers(data);
    } catch {
      message.error('Không thể tải danh sách cầu thủ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const openCreateModal = () => {
    setEditingPlayer(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    form.setFieldsValue({
      fullName: player.fullName,
      dob: dayjs(player.dob),
      nationality: player.nationality,
      position: player.position,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        ...values,
        dob: values.dob.format('YYYY-MM-DD'),
      };

      if (editingPlayer) {
        await apiUpdatePlayer(editingPlayer.id, payload);
        message.success('Cập nhật cầu thủ thành công!');
      } else {
        await apiCreatePlayer(payload as CreatePlayerPayload);
        message.success('Tạo cầu thủ thành công!');
      }

      setModalOpen(false);
      fetchPlayers();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeletePlayer(id);
      message.success('Xóa cầu thủ thành công!');
      fetchPlayers();
    } catch {
      message.error('Không thể xóa cầu thủ');
    }
  };

  const filteredPlayers = players.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.nationality.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Player> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, i) => i + 1,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dob',
      width: 120,
      render: (dob: string) => dayjs(dob).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.dob).getTime() - new Date(b.dob).getTime(),
    },
    {
      title: 'Quốc tịch',
      dataIndex: 'nationality',
      width: 120,
      filters: [...new Set(players.map((p) => p.nationality))].map((n) => ({
        text: n,
        value: n,
      })),
      onFilter: (value, record) => record.nationality === value,
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      width: 100,
      render: (pos: string) => (
        <Tag color={POSITION_COLORS[pos]}>{POSITION_LABELS[pos] ?? pos}</Tag>
      ),
      filters: Object.entries(POSITION_LABELS).map(([value, text]) => ({
        text,
        value,
      })),
      onFilter: (value, record) => record.position === value,
    },
    {
      title: 'Loại',
      dataIndex: 'playerType',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'FOREIGN' ? 'purple' : 'cyan'}>
          {type === 'FOREIGN' ? 'Ngoại binh' : 'Nội binh'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title="Xóa cầu thủ?"
            description={`Bạn có chắc muốn xóa "${record.fullName}"?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          Quản lý cầu thủ
        </Typography.Title>
        <Space>
          <Input
            placeholder="Tìm kiếm theo tên hoặc quốc tịch..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Thêm cầu thủ
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredPlayers}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15, showSizeChanger: true }}
        size="middle"
      />

      <Modal
        title={editingPlayer ? 'Chỉnh sửa cầu thủ' : 'Thêm cầu thủ mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingPlayer ? 'Lưu' : 'Tạo'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="VD: Nguyễn Quang Hải" />
          </Form.Item>

          <Form.Item
            name="dob"
            label="Ngày sinh"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>

          <Form.Item
            name="nationality"
            label="Quốc tịch"
            rules={[{ required: true, message: 'Vui lòng nhập quốc tịch' }]}
          >
            <Input placeholder="VD: Vietnam" />
          </Form.Item>

          <Form.Item
            name="position"
            label="Vị trí"
            rules={[{ required: true, message: 'Vui lòng chọn vị trí' }]}
          >
            <Select placeholder="Chọn vị trí">
              <Select.Option value="GK">Thủ môn (GK)</Select.Option>
              <Select.Option value="DF">Hậu vệ (DF)</Select.Option>
              <Select.Option value="MF">Tiền vệ (MF)</Select.Option>
              <Select.Option value="FW">Tiền đạo (FW)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
