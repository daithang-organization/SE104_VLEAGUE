import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  apiCreateStadium,
  apiDeleteStadium,
  apiGetStadiums,
  apiUpdateStadium,
  type CreateStadiumPayload,
  type Stadium,
} from '../services/stadiumApi';

export default function StadiumsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Stadium | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  const fetchStadiums = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetStadiums();
      setStadiums(data);
    } catch {
      message.error('Không thể tải danh sách sân vận động');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStadiums();
  }, [fetchStadiums]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (stadium: Stadium) => {
    setEditing(stadium);
    form.setFieldsValue({
      name: stadium.name,
      city: stadium.city,
      address: stadium.address ?? '',
      capacity: stadium.capacity,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload: CreateStadiumPayload = {
        name: values.name,
        city: values.city,
        address: values.address || undefined,
        capacity: values.capacity || undefined,
      };

      if (editing) {
        await apiUpdateStadium(editing.id, payload);
        message.success('Cập nhật sân vận động thành công!');
      } else {
        await apiCreateStadium(payload);
        message.success('Tạo sân vận động thành công!');
      }

      setModalOpen(false);
      fetchStadiums();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteStadium(id);
      message.success('Xóa sân vận động thành công!');
      fetchStadiums();
    } catch {
      message.error('Không thể xóa sân vận động (có thể đang được sử dụng)');
    }
  };

  const filtered = stadiums.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Stadium> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, i) => i + 1,
    },
    {
      title: 'Tên sân vận động',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: Stadium) => (
        <a onClick={() => navigate(`/stadiums/${record.id}`)} style={{ fontWeight: 600 }}>
          {name}
        </a>
      ),
    },
    {
      title: 'Thành phố',
      dataIndex: 'city',
      width: 150,
      sorter: (a, b) => a.city.localeCompare(b.city),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      ellipsis: true,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      width: 120,
      align: 'right',
      sorter: (a, b) => (a.capacity ?? 0) - (b.capacity ?? 0),
      render: (v: number | null) => (v ? v.toLocaleString('vi-VN') : '—'),
    },
    ...(isAdmin
      ? [
          {
            title: 'Hành động',
            key: 'actions',
            width: 120,
            render: (_: unknown, record: Stadium) => (
              <Space>
                <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                <Popconfirm
                  title="Xóa sân vận động?"
                  description={`Bạn có chắc muốn xóa "${record.name}"?`}
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
        ]
      : []),
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
          🏟️ Quản lý sân vận động
        </Typography.Title>
        <Space>
          <Input
            placeholder="Tìm kiếm sân..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm sân
            </Button>
          )}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15, showSizeChanger: true }}
        size="middle"
      />

      <Modal
        title={editing ? 'Chỉnh sửa sân vận động' : 'Thêm sân vận động mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? 'Lưu' : 'Tạo'}
        cancelText="Hủy"
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Tên sân vận động"
            rules={[{ required: true, message: 'Vui lòng nhập tên sân' }]}
          >
            <Input placeholder="VD: Sân Mỹ Đình" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="Thành phố"
                rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}
              >
                <Input placeholder="VD: Hà Nội" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="capacity" label="Sức chứa">
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="VD: 40000"
                  min={0}
                  formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="VD: Đường Lê Đức Thọ, Nam Từ Liêm" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
