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
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import ImageUpload from '../components/ImageUpload';
import { TableSkeleton } from '../components/LoadingSkeleton';
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
import { getTeamLogoUrl } from '../utils/teamLogos';

const CAN_EDIT_ROLES = ['ADMIN'];

export default function TeamsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
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
      const res = await apiGetTeams();
      setTeams(res?.data || []);
    } catch (_err) {
      message.error(t('teams.loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStadiums = useCallback(async () => {
    try {
      const data = await apiGetStadiums();
      setStadiums(data || []);
    } catch (_err) {
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
        message.success(t('teams.updateSuccess'));
      } else {
        await apiCreateTeam(payload);
        message.success(t('teams.createSuccess'));
      }

      setModalOpen(false);
      fetchTeams();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(t('teams.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteTeam(id);
      message.success(t('teams.deleteSuccess'));
      fetchTeams();
    } catch (_err) {
      message.error(t('teams.deleteError'));
    }
  };

  const filteredTeams = (teams || []).filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Team> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, i) => i + 1,
    },
    {
      title: t('teams.colName'),
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: Team) => {
        const logoUrl = getTeamLogoUrl(record);
        return (
          <a
            onClick={() => navigate(`/teams/${record.id}`)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${name} logo`}
                style={{ width: 28, height: 28, objectFit: 'contain', flex: '0 0 auto' }}
              />
            )}
            {name}
          </a>
        );
      },
    },
    {
      title: t('teams.colShortName'),
      dataIndex: 'shortName',
      width: 100,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: t('teams.colCity'),
      dataIndex: 'city',
      width: 130,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: t('teams.colStadium'),
      key: 'stadium',
      render: (_, record) => record.stadium?.name ?? '—',
    },
    {
      title: t('teams.colStatus'),
      dataIndex: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>
          {status === 'ACTIVE' ? t('teams.filterActive') : t('teams.filterInactive')}
        </Tag>
      ),
      filters: [
        { text: t('teams.filterActive'), value: 'ACTIVE' },
        { text: t('teams.filterInactive'), value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    ...(canEdit
      ? [
          {
            title: t('teams.colActions'),
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
                  title={t('teams.deleteConfirmTitle')}
                  description={t('teams.deleteConfirmDesc', { name: record.name })}
                  onConfirm={() => handleDelete(record.id)}
                  okText={t('teams.deleteOk')}
                  cancelText={t('teams.deleteCancel')}
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
          {t('teams.title')}
        </Typography.Title>
        <Space>
          <Input
            placeholder={t('teams.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          {canEdit && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              {t('teams.addBtn')}
            </Button>
          )}
        </Space>
      </div>

      {loading && filteredTeams.length === 0 ? (
        <TableSkeleton rows={8} />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredTeams}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: true }}
          size="middle"
          locale={{ emptyText: t('common.noData') }}
        />
      )}

      <Modal
        title={editingTeam ? t('teams.modalEditTitle') : t('teams.modalCreateTitle')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingTeam ? t('common.save') : t('common.create')}
        cancelText={t('common.cancel')}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label={t('teams.formName')}
                rules={[{ required: true, message: t('teams.formNameRequired') }]}
              >
                <Input placeholder={t('teams.formNamePlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="shortName" label={t('teams.formShortName')}>
                <Input placeholder={t('teams.formShortNamePlaceholder')} maxLength={10} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label={t('teams.formCity')}>
                <Input placeholder={t('teams.formCityPlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stadiumId" label={t('teams.formStadium')}>
                <Select
                  placeholder={t('teams.formStadiumPlaceholder')}
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

          <Form.Item name="logoUrl" label={t('teams.formLogo')}>
            <ImageUpload hint={t('teams.formLogoPlaceholder')} />
          </Form.Item>

          <Form.Item name="status" label={t('teams.formStatus')}>
            <Select>
              <Select.Option value="ACTIVE">{t('teams.formStatusActive')}</Select.Option>
              <Select.Option value="INACTIVE">{t('teams.formStatusInactive')}</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
