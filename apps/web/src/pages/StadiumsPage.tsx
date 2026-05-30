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
  Tabs,
  Tag,
  Typography,
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
import {
  apiCreateManagerStadiumRequest,
  apiGetManagerStadiumRequests,
  apiGetMyManagerStadiumRequests,
  apiGetTeamManagerManagedTeam,
  apiReviewManagerStadiumRequest,
  type ManagerStadiumRequest,
} from '../services/teamManagerApi';
import type { Team } from '../services/teamApi';

export default function StadiumsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);
  const isManager = user?.role === 'TEAM_MANAGER';
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [managedTeam, setManagedTeam] = useState<Team | null>(null);
  const [managerStadiumRequests, setManagerStadiumRequests] = useState<ManagerStadiumRequest[]>([]);
  const [adminStadiumRequests, setAdminStadiumRequests] = useState<ManagerStadiumRequest[]>([]);
  const [reviewingRequest, setReviewingRequest] = useState<ManagerStadiumRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);
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

  const fetchManagerStadiumState = useCallback(async () => {
    if (!isManager) return;
    try {
      const [team, requests] = await Promise.all([
        apiGetTeamManagerManagedTeam(),
        apiGetMyManagerStadiumRequests(),
      ]);
      setManagedTeam(team);
      setManagerStadiumRequests(requests);
    } catch (_err) {
      setManagedTeam(null);
      setManagerStadiumRequests([]);
    }
  }, [isManager]);

  const fetchAdminStadiumRequests = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const requests = await apiGetManagerStadiumRequests();
      setAdminStadiumRequests(requests);
    } catch (_err) {
      setAdminStadiumRequests([]);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchManagerStadiumState();
    fetchAdminStadiumRequests();
  }, [fetchAdminStadiumRequests, fetchManagerStadiumState]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ country: 'Việt Nam', fifaStars: 2 });
    setModalOpen(true);
  };

  const openManagerHomeStadium = () => {
    const current = stadiums.find((stadium) => stadium.id === managedTeam?.stadiumId);
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      name: current?.name,
      city: current?.city ?? managedTeam?.city,
      address: current?.address ?? '',
      country: current?.country ?? 'Việt Nam',
      capacity: current?.capacity,
      fifaStars: current?.fifaStars ?? 2,
    });
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

      if (isManager) {
        await apiCreateManagerStadiumRequest({
          requestType: managedTeam?.stadiumId ? 'UPDATE_HOME_STADIUM' : 'CREATE_HOME_STADIUM',
          stadiumId: managedTeam?.stadiumId ?? undefined,
          ...payload,
          requestNote: values.requestNote || undefined,
        });
        message.success('Đã gửi yêu cầu sân nhà đến Admin');
        fetchManagerStadiumState();
      } else if (editing) {
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

  const handleReviewStadiumRequest = async (status: 'APPROVED' | 'REJECTED') => {
    if (!reviewingRequest) return;
    setReviewing(true);
    try {
      await apiReviewManagerStadiumRequest(reviewingRequest.id, {
        status,
        adminNote: reviewNote || undefined,
      });
      message.success(
        status === 'APPROVED' ? 'Đã duyệt yêu cầu sân nhà' : 'Đã từ chối yêu cầu sân nhà',
      );
      setReviewingRequest(null);
      setReviewNote('');
      fetchAdminStadiumRequests();
      fetchStadiums();
    } catch (_err) {
      message.error('Không thể xét duyệt yêu cầu sân nhà');
    } finally {
      setReviewing(false);
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
  const homeStadium = stadiums.find((stadium) => stadium.id === managedTeam?.stadiumId);
  const hasPendingStadiumRequest = managerStadiumRequests.some(
    (request) => request.status === 'PENDING',
  );
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
      {isManager && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openManagerHomeStadium}
          disabled={!managedTeam || hasPendingStadiumRequest}
        >
          {managedTeam?.stadiumId ? 'Chỉnh sửa sân nhà' : 'Thêm sân nhà'}
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

  const renderStadiumTable = (data: Stadium[]) => (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        defaultPageSize: 15,
        pageSizeOptions: [10, 15, 20, 50],
        showSizeChanger: true,
        showTotal: (total) => t('stadiums.totalCount', { total }),
      }}
      size="middle"
    />
  );

  const renderRequestSummary = (request: ManagerStadiumRequest) => {
    const payload = request.payload || {};
    return (
      <Space direction="vertical" size={2}>
        <Typography.Text strong>{payload.name || request.stadium?.name || '—'}</Typography.Text>
        <Typography.Text type="secondary">
          {request.team?.name ?? '—'} · {request.requestNote || 'Không có ghi chú'}
        </Typography.Text>
      </Space>
    );
  };

  const requestColumns: ColumnsType<ManagerStadiumRequest> = [
    {
      title: 'Loại yêu cầu',
      dataIndex: 'requestType',
      width: 180,
      render: (type: ManagerStadiumRequest['requestType']) =>
        type === 'CREATE_HOME_STADIUM' ? 'Tạo sân nhà' : 'Chỉnh sửa sân nhà',
    },
    {
      title: 'Nội dung',
      key: 'summary',
      render: (_, record) => renderRequestSummary(record),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (status: ManagerStadiumRequest['status']) => (
        <Tag color={status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'gold'}>
          {status === 'APPROVED' ? 'Đã duyệt' : status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
        </Tag>
      ),
    },
    ...(isAdmin
      ? [
          {
            title: t('stadiums.colActions'),
            key: 'actions',
            width: 120,
            render: (_: unknown, record: ManagerStadiumRequest) => (
              <Button
                type="link"
                onClick={() => {
                  setReviewingRequest(record);
                  setReviewNote(record.adminNote ?? '');
                }}
              >
                Chi tiết
              </Button>
            ),
          },
        ]
      : []),
  ];

  const renderRequestsTable = (requests: ManagerStadiumRequest[]) => (
    <Table
      columns={requestColumns}
      dataSource={requests}
      rowKey="id"
      pagination={{ pageSize: 8 }}
      size="middle"
      locale={{ emptyText: t('common.noData') }}
    />
  );

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
          {isAdmin ? (
            <Tabs
              items={[
                {
                  key: 'list',
                  label: 'Danh sách sân vận động',
                  children: renderStadiumTable(filtered),
                },
                {
                  key: 'review',
                  label: 'Duyệt từ Manager',
                  children: renderRequestsTable(adminStadiumRequests),
                },
              ]}
            />
          ) : isManager ? (
            <Tabs
              items={[
                {
                  key: 'all',
                  label: 'Tất cả sân vận động',
                  children: renderStadiumTable(filtered),
                },
                {
                  key: 'mine',
                  label: 'Sân nhà của tôi',
                  children: (
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      {renderRequestsTable(managerStadiumRequests)}
                      {renderStadiumTable(homeStadium ? [homeStadium] : [])}
                    </Space>
                  ),
                },
              ]}
            />
          ) : (
            renderStadiumTable(filtered)
          )}
        </Card>
      </div>

      <Modal
        title={
          isManager
            ? managedTeam?.stadiumId
              ? 'Đề xuất chỉnh sửa sân nhà'
              : 'Đề xuất thêm sân nhà'
            : editing
              ? t('stadiums.modalEditTitle')
              : t('stadiums.modalCreateTitle')
        }
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

          {isManager && (
            <Form.Item name="requestNote" label="Ghi chú gửi Admin">
              <Input.TextArea rows={3} placeholder="Nhập lý do hoặc thông tin bổ sung..." />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title="Chi tiết yêu cầu sân nhà"
        open={!!reviewingRequest}
        onCancel={() => setReviewingRequest(null)}
        footer={[
          <Button
            key="reject"
            danger
            loading={reviewing}
            onClick={() => handleReviewStadiumRequest('REJECTED')}
          >
            Từ chối
          </Button>,
          <Button
            key="approve"
            type="primary"
            loading={reviewing}
            onClick={() => handleReviewStadiumRequest('APPROVED')}
          >
            Duyệt
          </Button>,
        ]}
      >
        {reviewingRequest && (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {renderRequestSummary(reviewingRequest)}
            <pre className="request-payload-preview">
              {JSON.stringify(reviewingRequest.payload, null, 2)}
            </pre>
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú xét duyệt"
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
            />
          </Space>
        )}
      </Modal>
    </>
  );
}
