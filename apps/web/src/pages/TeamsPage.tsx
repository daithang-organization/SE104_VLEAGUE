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
  Alert,
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
  Tabs,
  Tag,
  Typography,
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
import {
  apiCreateTeamManagerRequest,
  apiGetTeamManagerClaimableTeams,
  apiGetTeamManagerManagedTeam,
  apiGetTeamManagerManagementRequest,
  apiGetTeamManagerRequests,
  apiReviewTeamManagerRequest,
  type TeamManagerRequest,
} from '../services/teamManagerApi';
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
  const [createRequestForm] = Form.useForm();
  const [claimRequestForm] = Form.useForm();
  const [managedTeam, setManagedTeam] = useState<Team | null>(null);
  const [managerRequest, setManagerRequest] = useState<TeamManagerRequest | null>(null);
  const [claimableTeams, setClaimableTeams] = useState<Team[]>([]);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [adminRequests, setAdminRequests] = useState<TeamManagerRequest[]>([]);
  const [reviewingRequest, setReviewingRequest] = useState<TeamManagerRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);

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

  const fetchManagerState = useCallback(async () => {
    setLoading(true);
    try {
      const [teamsData, managedTeamData, requestData, claimableTeamsData] = await Promise.all([
        apiGetTeams(),
        apiGetTeamManagerManagedTeam(),
        apiGetTeamManagerManagementRequest(),
        apiGetTeamManagerClaimableTeams(),
      ]);

      setTeams(teamsData?.data || []);
      setManagedTeam(managedTeamData);
      setManagerRequest(requestData);
      setClaimableTeams(claimableTeamsData);
    } catch (_err) {
      message.error('Không thể tải trạng thái quản lý CLB');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdminRequests = useCallback(async () => {
    if (user?.role !== 'ADMIN') return;
    try {
      const data = await apiGetTeamManagerRequests();
      setAdminRequests(data);
    } catch (_err) {
      setAdminRequests([]);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchStadiums();
    if (user?.role === 'TEAM_MANAGER') {
      fetchManagerState();
      return;
    }
    fetchAdminRequests();
    fetchTeams();
  }, [fetchAdminRequests, fetchManagerState, fetchTeams, fetchStadiums, user?.role]);

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

  const submitCreateTeamRequest = async () => {
    try {
      const values = await createRequestForm.validateFields();
      setRequestSubmitting(true);
      await apiCreateTeamManagerRequest({
        requestType: 'CREATE_TEAM',
        proposedTeamName: values.name,
        proposedTeamShortName: values.shortName || undefined,
        proposedTeamCity: values.city || undefined,
        proposedStadiumId: values.stadiumId || undefined,
        proposedTeamLogoUrl: values.logoUrl || undefined,
        requestNote: values.requestNote || undefined,
      });
      message.success('Đã gửi yêu cầu tạo CLB mới đến Admin');
      createRequestForm.resetFields();
      setRequestModalOpen(false);
      fetchManagerState();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể gửi yêu cầu';
      message.error(msg);
    } finally {
      setRequestSubmitting(false);
    }
  };

  const submitClaimTeamRequest = async () => {
    try {
      const values = await claimRequestForm.validateFields();
      setRequestSubmitting(true);
      await apiCreateTeamManagerRequest({
        requestType: 'CLAIM_EXISTING_TEAM',
        teamId: values.teamId,
        requestNote: values.requestNote || undefined,
      });
      message.success('Đã gửi yêu cầu nhận quản lý CLB đến Admin');
      claimRequestForm.resetFields();
      setRequestModalOpen(false);
      fetchManagerState();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể gửi yêu cầu';
      message.error(msg);
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleReviewTeamRequest = async (status: 'APPROVED' | 'REJECTED') => {
    if (!reviewingRequest) return;
    setReviewing(true);
    try {
      await apiReviewTeamManagerRequest(reviewingRequest.id, {
        status,
        adminNote: reviewNote || undefined,
      });
      message.success(status === 'APPROVED' ? 'Đã duyệt yêu cầu CLB' : 'Đã từ chối yêu cầu CLB');
      setReviewingRequest(null);
      setReviewNote('');
      fetchAdminRequests();
      fetchTeams();
    } catch (_err) {
      message.error('Không thể xét duyệt yêu cầu CLB');
    } finally {
      setReviewing(false);
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
  const isManager = user?.role === 'TEAM_MANAGER';
  const managerTeams = managedTeam
    ? filteredTeams.filter((team) => team.id === managedTeam.id)
    : [];

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

  const requestStatusNode = managerRequest ? (
    <Alert
      type={
        managerRequest.status === 'APPROVED'
          ? 'success'
          : managerRequest.status === 'REJECTED'
            ? 'error'
            : 'info'
      }
      showIcon
      message={
        managerRequest.status === 'APPROVED'
          ? 'Yêu cầu đã được duyệt'
          : managerRequest.status === 'REJECTED'
            ? 'Yêu cầu đã bị từ chối'
            : 'Yêu cầu đang chờ Admin xét duyệt'
      }
      description={
        <Space direction="vertical" size={4}>
          <span>
            {managerRequest.requestType === 'CREATE_TEAM'
              ? `Tạo CLB mới: ${managerRequest.proposedTeamName ?? '—'}`
              : `Nhận quản lý CLB: ${managerRequest.team?.name ?? '—'}`}
          </span>
          {managerRequest.adminNote && <span>Ghi chú Admin: {managerRequest.adminNote}</span>}
        </Space>
      }
    />
  ) : null;

  const renderTeamCards = (items: Team[], emptyDescription = t('common.noData')) => {
    if (loading && items.length === 0) {
      return <TableSkeleton rows={8} />;
    }

    if (items.length === 0) {
      return (
        <div className="clubs-empty">
          <Empty description={emptyDescription} />
        </div>
      );
    }

    return (
      <div className="club-card-grid" aria-label="Danh sách đội bóng">
        {items.map((team) => (
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
                  {team.shortName && <span className="club-card-code-pill">{team.shortName}</span>}
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
    );
  };

  const renderTeamRequestsTable = () => (
    <div className="manager-request-list">
      {adminRequests.length === 0 ? (
        <Empty description={t('common.noData')} />
      ) : (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {adminRequests.map((request) => (
            <Alert
              key={request.id}
              type={
                request.status === 'APPROVED'
                  ? 'success'
                  : request.status === 'REJECTED'
                    ? 'error'
                    : 'info'
              }
              showIcon
              message={
                <Space wrap>
                  <Typography.Text strong>
                    {request.requestType === 'CREATE_TEAM'
                      ? `Tạo CLB mới: ${request.proposedTeamName ?? '—'}`
                      : `Nhận quản lý: ${request.team?.name ?? '—'}`}
                  </Typography.Text>
                  <Tag>{request.manager?.email ?? '—'}</Tag>
                  <Tag color={request.status === 'PENDING' ? 'gold' : undefined}>
                    {request.status === 'APPROVED'
                      ? 'Đã duyệt'
                      : request.status === 'REJECTED'
                        ? 'Từ chối'
                        : 'Chờ duyệt'}
                  </Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <span>{request.requestNote || 'Không có ghi chú từ Manager'}</span>
                  {request.adminNote && <span>Ghi chú Admin: {request.adminNote}</span>}
                  <Button
                    type="link"
                    style={{ padding: 0, width: 'fit-content' }}
                    onClick={() => {
                      setReviewingRequest(request);
                      setReviewNote(request.adminNote ?? '');
                    }}
                  >
                    Chi tiết
                  </Button>
                </Space>
              }
            />
          ))}
        </Space>
      )}
    </div>
  );

  return (
    <div className="clubs-page page-stack">
      <PageCover
        className={isManager ? 'teams-manager-cover' : undefined}
        title={t('teams.title')}
        description={t('teams.subtitle')}
        icon={<AppMenuIcon menuKey="teams" />}
        metrics={
          isManager
            ? [
                {
                  label: 'Tổng CLB',
                  value: teams.length.toLocaleString('vi-VN'),
                  icon: <TeamOutlined />,
                },
                {
                  label: 'Chưa có Manager',
                  value: claimableTeams.length.toLocaleString('vi-VN'),
                  icon: <TeamOutlined />,
                },
                {
                  label: 'Đang quản lý',
                  value: (managedTeam ? 1 : 0).toLocaleString('vi-VN'),
                  icon: <TeamOutlined />,
                },
              ]
            : [
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
              ]
        }
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
          {isManager && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setRequestModalOpen(true)}
            >
              Thêm CLB
            </Button>
          )}
          {canEdit && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              {t('teams.addBtn')}
            </Button>
          )}
        </Space>
      </div>

      {isManager ? (
        <Tabs
          className="teams-manager-tabs"
          items={[
            {
              key: 'all',
              label: 'Tất cả đội bóng',
              children: renderTeamCards(filteredTeams),
            },
            {
              key: 'mine',
              label: 'Đội bóng của tôi',
              children: (
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  {requestStatusNode}
                  {renderTeamCards(managerTeams, 'Bạn chưa có CLB được Admin duyệt.')}
                </Space>
              ),
            },
          ]}
        />
      ) : user?.role === 'ADMIN' ? (
        <Tabs
          items={[
            {
              key: 'list',
              label: 'Danh sách đội bóng',
              children: renderTeamCards(filteredTeams),
            },
            {
              key: 'review',
              label: 'Duyệt từ Manager',
              children: renderTeamRequestsTable(),
            },
          ]}
        />
      ) : (
        renderTeamCards(filteredTeams)
      )}

      <Modal
        title="Đề xuất quyền quản lý CLB"
        open={requestModalOpen}
        onCancel={() => setRequestModalOpen(false)}
        footer={null}
        destroyOnClose
        width={760}
      >
        <Tabs
          items={[
            {
              key: 'create',
              label: 'Tạo CLB mới',
              children: (
                <Form form={createRequestForm} layout="vertical" style={{ marginTop: 16 }}>
                  <Row gutter={16}>
                    <Col xs={24} md={16}>
                      <Form.Item
                        name="name"
                        label={t('teams.formName')}
                        rules={[{ required: true, message: t('teams.formNameRequired') }]}
                      >
                        <Input placeholder={t('teams.formNamePlaceholder')} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="shortName" label={t('teams.formShortName')}>
                        <Input maxLength={10} placeholder={t('teams.formShortNamePlaceholder')} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name="city" label={t('teams.formCity')}>
                        <Input placeholder={t('teams.formCityPlaceholder')} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="stadiumId" label={t('teams.formStadium')}>
                        <Select
                          placeholder={t('teams.formStadiumPlaceholder')}
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          options={stadiums.map((stadium) => ({
                            value: stadium.id,
                            label: `${stadium.name} (${stadium.city})`,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="logoUrl" label={t('teams.formLogo')}>
                    <ImageUpload />
                  </Form.Item>
                  <Form.Item name="requestNote" label="Ghi chú gửi Admin">
                    <Input.TextArea rows={3} placeholder="Thông tin bổ sung để Admin xét duyệt" />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      loading={requestSubmitting}
                      onClick={submitCreateTeamRequest}
                    >
                      Gửi yêu cầu tạo CLB
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'claim',
              label: 'Chọn CLB có sẵn',
              children: (
                <Form form={claimRequestForm} layout="vertical" style={{ marginTop: 16 }}>
                  <Typography.Paragraph type="secondary">
                    Chỉ hiển thị các CLB đang hoạt động, chưa có Manager chính thức và chưa có yêu
                    cầu chờ duyệt.
                  </Typography.Paragraph>
                  <Form.Item
                    name="teamId"
                    label="CLB muốn quản lý"
                    rules={[{ required: true, message: 'Vui lòng chọn CLB' }]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="label"
                      placeholder="Chọn CLB"
                      options={claimableTeams.map((team) => ({
                        value: team.id,
                        label: `${team.name}${team.city ? ` (${team.city})` : ''}`,
                      }))}
                    />
                  </Form.Item>
                  <Form.Item name="requestNote" label="Ghi chú gửi Admin">
                    <Input.TextArea rows={3} placeholder="Lý do bạn muốn quản lý CLB này" />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      loading={requestSubmitting}
                      onClick={submitClaimTeamRequest}
                    >
                      Gửi yêu cầu quản lý
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Modal>

      <Modal
        title="Chi tiết yêu cầu CLB"
        open={!!reviewingRequest}
        onCancel={() => setReviewingRequest(null)}
        footer={[
          <Button
            key="reject"
            danger
            loading={reviewing}
            onClick={() => handleReviewTeamRequest('REJECTED')}
          >
            Từ chối
          </Button>,
          <Button
            key="approve"
            type="primary"
            loading={reviewing}
            onClick={() => handleReviewTeamRequest('APPROVED')}
          >
            Duyệt
          </Button>,
        ]}
      >
        {reviewingRequest && (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Typography.Text strong>
              {reviewingRequest.requestType === 'CREATE_TEAM'
                ? reviewingRequest.proposedTeamName
                : reviewingRequest.team?.name}
            </Typography.Text>
            <Typography.Text>Manager: {reviewingRequest.manager?.email ?? '—'}</Typography.Text>
            <Typography.Text>Ghi chú: {reviewingRequest.requestNote || '—'}</Typography.Text>
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú xét duyệt"
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
            />
          </Space>
        )}
      </Modal>

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
