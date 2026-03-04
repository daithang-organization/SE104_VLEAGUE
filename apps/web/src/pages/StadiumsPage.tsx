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
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { TableSkeleton } from '../components';
import {
  apiCreateStadium,
  apiDeleteStadium,
  apiGetStadiums,
  apiUpdateStadium,
  type CreateStadiumPayload,
  type Stadium,
} from '../services/stadiumApi';

export default function StadiumsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
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
    } catch (_err) {
      message.error(t('stadiums.loadError'));
    } finally {
      setLoading(false);
      setInitialLoad(false);
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
        message.success(t('stadiums.updateSuccess'));
      } else {
        await apiCreateStadium(payload);
        message.success(t('stadiums.createSuccess'));
      }

      setModalOpen(false);
      fetchStadiums();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(t('stadiums.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteStadium(id);
      message.success(t('stadiums.deleteSuccess'));
      fetchStadiums();
    } catch (_err) {
      message.error(t('stadiums.deleteError'));
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
      title: t('stadiums.colName'),
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: Stadium) => (
        <a onClick={() => navigate(`/stadiums/${record.id}`)} style={{ fontWeight: 600 }}>
          {name}
        </a>
      ),
    },
    {
      title: t('stadiums.colCity'),
      dataIndex: 'city',
      width: 150,
      sorter: (a, b) => a.city.localeCompare(b.city),
    },
    {
      title: t('stadiums.colAddress'),
      dataIndex: 'address',
      ellipsis: true,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: t('stadiums.colCapacity'),
      dataIndex: 'capacity',
      width: 120,
      align: 'right',
      sorter: (a, b) => (a.capacity ?? 0) - (b.capacity ?? 0),
      render: (v: number | null) => (v ? v.toLocaleString('vi-VN') : '—'),
    },
    ...(isAdmin
      ? [
          {
            title: t('stadiums.colActions'),
            key: 'actions',
            width: 120,
            render: (_: unknown, record: Stadium) => (
              <Space>
                <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                <Popconfirm
                  title={t('stadiums.deleteConfirmTitle')}
                  description={t('stadiums.deleteConfirmDesc', { name: record.name })}
                  onConfirm={() => handleDelete(record.id)}
                  okText={t('stadiums.deleteOk')}
                  cancelText={t('stadiums.deleteCancel')}
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

  if (initialLoad) {
    return (
      <Card>
        <TableSkeleton rows={8} />
      </Card>
    );
  }

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
          {t('stadiums.title')}
        </Typography.Title>
        <Space>
          <Input
            placeholder={t('stadiums.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('stadiums.addBtn')}
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
        title={editing ? t('stadiums.modalEditTitle') : t('stadiums.modalCreateTitle')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? t('common.save') : t('common.create')}
        cancelText={t('common.cancel')}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label={t('stadiums.formName')}
            rules={[{ required: true, message: t('stadiums.formNameRequired') }]}
          >
            <Input placeholder={t('stadiums.formNamePlaceholder')} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label={t('stadiums.formCity')}
                rules={[{ required: true, message: t('stadiums.formCityRequired') }]}
              >
                <Input placeholder={t('stadiums.formCityPlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="capacity" label={t('stadiums.formCapacity')}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('stadiums.formCapacityPlaceholder')}
                  min={0}
                  formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label={t('stadiums.formAddress')}>
            <Input placeholder={t('stadiums.formAddressPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
