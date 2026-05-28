import {
  BankOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AppMenuIcon, TableSkeleton } from '../components';
import { PageCover } from '../components/PageCover';
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
    form.setFieldsValue({ country: 'Việt Nam', fifaStars: 2 });
    setModalOpen(true);
  };

  const openEdit = (stadium: Stadium) => {
    setEditing(stadium);
    form.setFieldsValue({
      name: stadium.name,
      city: stadium.city,
      address: stadium.address ?? '',
      country: stadium.country ?? 'Việt Nam',
      capacity: stadium.capacity,
      fifaStars: stadium.fifaStars,
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
        country: values.country?.trim() || undefined,
        capacity: values.capacity || undefined,
        fifaStars: values.fifaStars ?? undefined,
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
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      (s.country ?? '').toLowerCase().includes(search.toLowerCase()),
  );
  const totalCapacity = stadiums.reduce((sum, stadium) => sum + (stadium.capacity ?? 0), 0);
  const cityCount = new Set(stadiums.map((stadium) => stadium.city).filter(Boolean)).size;
  const hero = (
    <PageCover
      eyebrow={t('menu.stadiums')}
      title={t('stadiums.title')}
      description={t('stadiums.searchPlaceholder')}
      icon={<AppMenuIcon menuKey="stadiums" />}
      metrics={[
        {
          label: t('menu.stadiums'),
          value: stadiums.length.toLocaleString('vi-VN'),
          icon: <BankOutlined />,
        },
        {
          label: t('stadiumDetail.statCapacity'),
          value: totalCapacity.toLocaleString('vi-VN'),
          icon: <TeamOutlined />,
        },
        {
          label: t('stadiums.colCity'),
          value: cityCount.toLocaleString('vi-VN'),
          icon: <EnvironmentOutlined />,
        },
      ]}
    />
  );
  const toolbar = (
    <div className="page-toolbar">
      <Space wrap>
        <Input
          placeholder={t('stadiums.searchPlaceholder')}
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
      </Space>
      {isAdmin && (
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('stadiums.addBtn')}
        </Button>
      )}
    </div>
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
      title: t('stadiums.colCountry'),
      dataIndex: 'country',
      width: 130,
      render: (v: string | null) => v ?? '—',
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
    {
      title: t('stadiums.colFifaStars'),
      dataIndex: 'fifaStars',
      width: 120,
      align: 'center',
      sorter: (a, b) => (a.fifaStars ?? 0) - (b.fifaStars ?? 0),
      render: (v: number | null) => (v != null ? `${v}/5` : '—'),
    },
    ...(isAdmin
      ? [
          {
            title: t('stadiums.colActions'),
            key: 'actions',
            width: 120,
            render: (_: unknown, record: Stadium) => (
              <Space>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  aria-label={t('stadiums.editAction')}
                  onClick={() => openEdit(record)}
                />
                <Popconfirm
                  title={t('stadiums.deleteConfirmTitle')}
                  description={t('stadiums.deleteConfirmDesc', { name: record.name })}
                  onConfirm={() => handleDelete(record.id)}
                  okText={t('stadiums.deleteOk')}
                  cancelText={t('stadiums.deleteCancel')}
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={t('stadiums.deleteAction')}
                  />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  if (initialLoad) {
    return (
      <div className="page-stack">
        {hero}
        {toolbar}
        <Card>
          <TableSkeleton rows={8} />
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="page-stack">
        {hero}
        {toolbar}
        <Card>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 15, showSizeChanger: true }}
            size="middle"
          />
        </Card>
      </div>

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
              <Form.Item name="country" label={t('stadiums.formCountry')}>
                <Input placeholder={t('stadiums.formCountryPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
            <Col span={12}>
              <Form.Item name="fifaStars" label={t('stadiums.formFifaStars')}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('stadiums.formFifaStarsPlaceholder')}
                  min={2}
                  max={5}
                  precision={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label={t('stadiums.formAddress')}>
            <Input placeholder={t('stadiums.formAddressPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
