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
import {
  apiCreateTeam,
  apiDeleteTeam,
  apiGetTeams,
  apiUpdateTeam,
  type CreateTeamPayload,
  type Team,
} from '../services/teamApi';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetTeams();
      setTeams(data);
    } catch {
      message.error('Không thể tải danh sách đội bóng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const openCreateModal = () => {
    setEditingTeam(null);
    form.resetFields();
    form.setFieldsValue({ status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    form.setFieldsValue({ name: team.name, status: team.status });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editingTeam) {
        await apiUpdateTeam(editingTeam.id, values);
        message.success('Cập nhật đội bóng thành công!');
      } else {
        await apiCreateTeam(values as CreateTeamPayload);
        message.success('Tạo đội bóng thành công!');
      }

      setModalOpen(false);
      fetchTeams();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return; // form validation error
      message.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteTeam(id);
      message.success('Xóa đội bóng thành công!');
      fetchTeams();
    } catch {
      message.error('Không thể xóa đội bóng');
    }
  };

  const filteredTeams = teams.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  const columns: ColumnsType<Team> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, i) => i + 1,
    },
    {
      title: 'Tên đội bóng',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Sân nhà',
      key: 'stadium',
      render: (_, record) => record.stadium?.name ?? '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>
          {status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng'}
        </Tag>
      ),
      filters: [
        { text: 'Hoạt động', value: 'ACTIVE' },
        { text: 'Ngưng', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title="Xóa đội bóng?"
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
          Quản lý đội bóng
        </Typography.Title>
        <Space>
          <Input
            placeholder="Tìm kiếm đội bóng..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Thêm đội bóng
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredTeams}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15, showSizeChanger: true }}
        size="middle"
      />

      <Modal
        title={editingTeam ? 'Chỉnh sửa đội bóng' : 'Thêm đội bóng mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingTeam ? 'Lưu' : 'Tạo'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Tên đội bóng"
            rules={[{ required: true, message: 'Vui lòng nhập tên đội bóng' }]}
          >
            <Input placeholder="VD: Hoàng Anh Gia Lai" />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Select.Option value="ACTIVE">Hoạt động</Select.Option>
              <Select.Option value="INACTIVE">Ngưng hoạt động</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
