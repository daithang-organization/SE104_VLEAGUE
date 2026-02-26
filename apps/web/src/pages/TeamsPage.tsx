import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  apiCreateTeam,
  apiDeleteTeam,
  apiGetStadiums,
  apiGetTeams,
  apiUpdateTeam,
  type CreateTeamPayload,
  type Stadium,
  type Team,
} from '../services/teamApi';

const CAN_EDIT_ROLES = ['ADMIN'];

export default function TeamsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  const canEdit = useMemo(() => {
    return user?.role && CAN_EDIT_ROLES.includes(user.role);
  }, [user]);

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

  const fetchStadiums = useCallback(async () => {
    try {
      const data = await apiGetStadiums();
      setStadiums(data);
    } catch {
      // Stadiums may fail to load, that's ok
    }
  }, []);

  useEffect(() => {
    fetchTeams();
    fetchStadiums();
  }, [fetchTeams, fetchStadiums]);

  const openCreateModal = () => {
    setEditingTeam(null);
    form.resetFields();
    form.setFieldsValue({ status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    form.setFieldsValue({
      name: team.name,
      shortName: team.shortName ?? '',
      city: team.city ?? '',
      stadiumId: team.stadiumId ?? undefined,
      logoUrl: team.logoUrl ?? '',
      status: team.status,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Clean up empty strings to undefined
      const payload: CreateTeamPayload = {
        name: values.name,
        shortName: values.shortName || undefined,
        city: values.city || undefined,
        stadiumId: values.stadiumId || undefined,
        logoUrl: values.logoUrl || undefined,
        status: values.status,
      };

      if (editingTeam) {
        await apiUpdateTeam(editingTeam.id, payload);
        message.success('Cập nhật đội bóng thành công!');
      } else {
        await apiCreateTeam(payload);
        message.success('Tạo đội bóng thành công!');
      }

      setModalOpen(false);
      fetchTeams();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
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
      render: (name: string, record: Team) => (
        <a onClick={() => navigate(`/teams/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: 'Viết tắt',
      dataIndex: 'shortName',
      width: 100,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'Thành phố',
      dataIndex: 'city',
      width: 130,
      render: (v: string | null) => v ?? '—',
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
    ...(canEdit
      ? [
          {
            title: 'Hành động',
            key: 'actions',
            width: 120,
            render: (_: unknown, record: Team) => (
              <Space>
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/teams/${record.id}`)}
                />
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
          {canEdit && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Thêm đội bóng
            </Button>
          )}
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
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Tên đội bóng"
                rules={[{ required: true, message: 'Vui lòng nhập tên đội bóng' }]}
              >
                <Input placeholder="VD: Hoàng Anh Gia Lai" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="shortName" label="Tên viết tắt">
                <Input placeholder="VD: HAGL" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="Thành phố">
                <Input placeholder="VD: Pleiku" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stadiumId" label="Sân nhà">
                <Select
                  placeholder="Chọn sân nhà"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={stadiums.map((s) => ({
                    value: s.id,
                    label: `${s.name} (${s.city})`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="logoUrl" label="URL Logo">
            <Input placeholder="https://example.com/logo.png" />
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
