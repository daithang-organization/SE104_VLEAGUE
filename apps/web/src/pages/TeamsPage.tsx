import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
} from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AppMenuIcon, PageCover } from '../components';
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
import { getTeamLogoUrl, getTeamThemeStyle } from '../utils/teamLogos';

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
  const [statusFilter, setStatusFilter] = useState<'ALL' | Team['status']>('ALL');
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

  const filteredTeams = (teams || []).filter((team) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [team.name, team.shortName, team.city, team.stadium?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    const matchesStatus = statusFilter === 'ALL' || team.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTeams = teams.filter((team) => team.status === 'ACTIVE').length;
  const inactiveTeams = teams.filter((team) => team.status === 'INACTIVE').length;

  const renderTeamLogo = (team: Team) => {
    const logoUrl = getTeamLogoUrl(team);
    if (logoUrl) {
      return <img src={logoUrl} alt={`${team.name} logo`} className="club-card-logo" />;
    }

    return (
      <div className="club-card-logo club-card-logo-fallback" aria-hidden="true">
        {(team.shortName || team.name).slice(0, 2).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="clubs-page page-stack">
      <PageCover
        title={t('teams.title')}
        description={t('teams.subtitle')}
        icon={<AppMenuIcon menuKey="teams" />}
        metrics={[
          {
            label: t('common.total'),
            value: teams.length.toLocaleString('vi-VN'),
            icon: <TeamOutlined />,
          },
          {
            label: t('teams.filterActive'),
            value: activeTeams.toLocaleString('vi-VN'),
            icon: <TeamOutlined />,
          },
          {
            label: t('teams.filterInactive'),
            value: inactiveTeams.toLocaleString('vi-VN'),
            icon: <TeamOutlined />,
          },
        ]}
      />
      <div className="clubs-toolbar">
        <Space wrap className="clubs-toolbar-controls">
          <Input
            placeholder={t('teams.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="clubs-search"
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="clubs-status-filter"
            options={[
              { value: 'ALL', label: t('common.all') },
              { value: 'ACTIVE', label: t('teams.filterActive') },
              { value: 'INACTIVE', label: t('teams.filterInactive') },
            ]}
          />
        </Space>
        <Space>
          {canEdit && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              {t('teams.addBtn')}
            </Button>
          )}
        </Space>
      </div>

      {loading && filteredTeams.length === 0 ? (
        <TableSkeleton rows={8} />
      ) : filteredTeams.length === 0 ? (
        <div className="clubs-empty">
          <Empty description={t('common.noData')} />
        </div>
      ) : (
        <div className="club-card-grid" aria-label="Danh sách đội bóng">
          {filteredTeams.map((team) => (
            <article key={team.id} className="club-card" style={getTeamThemeStyle(team)}>
              <button
                type="button"
                className="club-card-main"
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                <span className="club-card-crest">{renderTeamLogo(team)}</span>
                <span className="club-card-body">
                  <span className="club-card-heading">
                    <span className="club-card-name">{team.name}</span>
                    {team.shortName && (
                      <span className="club-card-code-pill">{team.shortName}</span>
                    )}
                  </span>
                  <span className="club-card-meta">
                    <EnvironmentOutlined />
                    {team.stadium?.name ?? team.city ?? 'Chưa có sân nhà'}
                  </span>
                </span>
                <ArrowRightOutlined className="club-card-arrow" />
              </button>

              <div className="club-card-footer">
                <Tag color={team.status === 'ACTIVE' ? 'green' : 'default'}>
                  {team.status === 'ACTIVE' ? t('teams.filterActive') : t('teams.filterInactive')}
                </Tag>
              </div>

              <div className="club-card-actions">
                <Button
                  className="club-card-detail-button"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate(`/teams/${team.id}`)}
                >
                  {t('common.detail')}
                </Button>
                {canEdit && (
                  <>
                    <Button
                      aria-label={`${t('common.edit')} ${team.name}`}
                      icon={<EditOutlined />}
                      onClick={() => openEditModal(team)}
                    />
                    <Popconfirm
                      title={t('teams.deleteConfirmTitle')}
                      description={t('teams.deleteConfirmDesc', { name: team.name })}
                      onConfirm={() => handleDelete(team.id)}
                      okText={t('teams.deleteOk')}
                      cancelText={t('teams.deleteCancel')}
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        aria-label={`${t('common.delete')} ${team.name}`}
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
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
            <ImageUpload />
          </Form.Item>

          <Form.Item name="status" label={t('teams.formStatus')}>
            <Select>
              <Select.Option value="ACTIVE">{t('teams.formStatusActive')}</Select.Option>
              <Select.Option value="INACTIVE">{t('teams.formStatusInactive')}</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
