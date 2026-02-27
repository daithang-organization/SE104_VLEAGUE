import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
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
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  apiCreateCoach,
  apiDeleteCoach,
  apiGetCoaches,
  apiUpdateCoach,
  type Coach,
} from '../services/coachApi';
import { api } from '../lib/api';

const { Title } = Typography;

type Team = { id: string; name: string };

export default function CoachesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coach | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetCoaches({ page, limit: 15, search: search || undefined });
      setCoaches(res.data);
      setTotal(res.total);
    } catch {
      message.error('Không thể tải danh sách HLV');
    }
    setLoading(false);
  }, [page, search]);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await api.get<{ data: Team[] }>('/teams', { params: { limit: 100 } });
      setTeams(res.data.data ?? []);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (coach: Coach) => {
    setEditing(coach);
    form.setFieldsValue({
      fullName: coach.fullName,
      nationality: coach.nationality,
      dob: coach.dob?.slice(0, 10),
      licenseType: coach.licenseType,
      teamId: coach.teamId,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await apiUpdateCoach(editing.id, values);
        message.success('Đã cập nhật HLV');
      } else {
        await apiCreateCoach(values);
        message.success('Đã thêm HLV');
      }
      setModalOpen(false);
      fetchCoaches();
    } catch {
      message.error('Lỗi lưu HLV');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteCoach(id);
      message.success('Đã xóa HLV');
      fetchCoaches();
    } catch {
      message.error('Không thể xóa HLV');
    }
  };

  const columns: ColumnsType<Coach> = [
    { title: 'Họ tên', dataIndex: 'fullName', ellipsis: true },
    { title: 'Quốc tịch', dataIndex: 'nationality', width: 120 },
    {
      title: 'Ngày sinh',
      dataIndex: 'dob',
      width: 120,
      render: (v: string) => (v ? new Date(v).toLocaleDateString('vi-VN') : '—'),
    },
    {
      title: 'Bằng cấp',
      dataIndex: 'licenseType',
      width: 100,
      render: (v: string) => (v ? <Tag color="blue">{v}</Tag> : '—'),
    },
    {
      title: 'Đội',
      key: 'team',
      width: 160,
      render: (_: unknown, r: Coach) => r.team?.name ?? '—',
    },
    ...(isAdmin
      ? [
          {
            title: 'Thao tác',
            key: 'actions',
            width: 140,
            render: (_: unknown, r: Coach) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
                <Popconfirm title="Xóa HLV này?" onConfirm={() => handleDelete(r.id)}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <Card>
      <Space
        style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}
        align="center"
      >
        <Title level={4} style={{ margin: 0 }}>
          Quản lý Huấn luyện viên
        </Title>
        <Space>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            allowClear
            style={{ width: 240 }}
          />
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm HLV
            </Button>
          )}
        </Space>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={coaches}
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 15,
          onChange: setPage,
          showTotal: (t) => `Tổng ${t} HLV`,
        }}
        size="middle"
      />

      <Modal
        title={editing ? 'Sửa HLV' : 'Thêm HLV'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Lưu"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="nationality" label="Quốc tịch">
            <Input />
          </Form.Item>
          <Form.Item name="dob" label="Ngày sinh">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="licenseType" label="Bằng cấp HLV">
            <Select allowClear placeholder="Chọn bằng cấp">
              <Select.Option value="AFC_PRO">AFC Pro</Select.Option>
              <Select.Option value="AFC_A">AFC A</Select.Option>
              <Select.Option value="AFC_B">AFC B</Select.Option>
              <Select.Option value="AFC_C">AFC C</Select.Option>
              <Select.Option value="OTHER">Khác</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="teamId" label="Đội bóng">
            <Select allowClear placeholder="Chọn đội" showSearch optionFilterProp="children">
              {teams.map((t) => (
                <Select.Option key={t.id} value={t.id}>
                  {t.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
