import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SendOutlined,
  SwapOutlined,
  TeamOutlined,
  UploadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Descriptions,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { AppMenuIcon, PageCover } from '../components';
import {
  apiCreateSeason,
  apiDeleteSeason,
  apiGetSeasons,
  apiUpdateSeason,
  apiUpdateSeasonStatus,
  type CreateSeasonPayload,
  type Season,
} from '../services/seasonApi';
import {
  apiGetSeasonTeams,
  apiRegisterTeam,
  apiRemoveSeasonTeam,
  apiUpdateSeasonTeamStatus,
  type SeasonTeam,
} from '../services/seasonTeamApi';
import { apiGetTeams, type Team } from '../services/teamApi';
import {
  apiGetInvitationCandidates,
  apiGetPromotionCandidates,
  apiGetReplacementCandidates,
  apiGetSeasonInvitations,
  apiImportPromotionCandidates,
  apiDeletePromotionCandidate,
  apiSendTeamInvitation,
  apiUpsertPromotionCandidate,
  type ImportPromotionCandidateRow,
  type InvitationCandidate,
  type InvitationCandidateResult,
  type PromotionCandidate,
  type PromotionQualificationType,
  type ReplacementCandidateResult,
  type TeamInvitation,
  type TeamInvitationSourceType,
} from '../services/teamInvitationApi';
import { getTeamLogoUrl } from '../utils/teamLogos';

const STATUS_OPTIONS = [
  { value: 'UPCOMING', label: 'Sắp diễn ra', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'Đang diễn ra', color: 'green' },
  { value: 'COMPLETED', label: 'Đã kết thúc', color: 'default' },
];

// Generate season year options: e.g. "2024-2025", "2025-2026", etc.
function generateYearOptions() {
  const currentYear = new Date().getFullYear();
  const options = [];
  for (let y = currentYear - 3; y <= currentYear + 3; y++) {
    options.push({
      value: y,
      label: `Mùa giải ${y}-${y + 1}`,
    });
  }
  return options;
}

const TEAM_STATUS_MAP: Record<string, { label: string; color: string }> = {
  REGISTERED: { label: 'Đã đăng ký', color: 'processing' },
  APPROVED: { label: 'Đã duyệt', color: 'success' },
  REJECTED: { label: 'Từ chối', color: 'error' },
  WITHDRAWN: { label: 'Rút lui', color: 'default' },
};

const INVITATION_STATUS_MAP: Record<string, { label: string; color: string }> = {
  SENT: { label: 'Đã gửi', color: 'processing' },
  ACCEPTED: { label: 'Đã đồng ý', color: 'success' },
  DECLINED: { label: 'Đã từ chối', color: 'error' },
  EXPIRED: { label: 'Quá hạn', color: 'default' },
};

const INVITATION_SOURCE_MAP: Record<string, string> = {
  PREVIOUS_TOP_8: 'Top 8 mùa trước',
  PROMOTED: 'Thăng hạng',
  REPLACEMENT: 'Thay thế',
};
const INVITATION_SOURCE_OPTIONS: { value: TeamInvitationSourceType; label: string }[] = [
  { value: 'PROMOTED', label: 'Thăng hạng' },
  { value: 'REPLACEMENT', label: 'Thay thế' },
];
const PROMOTION_QUALIFICATION_OPTIONS: {
  value: PromotionQualificationType;
  label: string;
}[] = [
  { value: 'CHAMPION', label: 'Vô địch' },
  { value: 'RUNNER_UP', label: 'Á quân' },
  { value: 'PLAYOFF', label: 'Play-off' },
  { value: 'REPLACEMENT_POOL', label: 'Dự phòng' },
];

function getSeasonTeamApplicationStatus(record: SeasonTeam, invitation?: TeamInvitation) {
  if (record.status === 'APPROVED') return { label: 'Đã duyệt hồ sơ', color: 'success' };
  if (record.status === 'REJECTED') return { label: 'Bị từ chối', color: 'error' };
  if (record.applicationSubmittedAt) return { label: 'Đã nộp hồ sơ', color: 'processing' };
  if (invitation?.status === 'ACCEPTED') return { label: 'Chờ nộp hồ sơ', color: 'warning' };
  if (invitation?.status === 'SENT') return { label: 'Chờ phản hồi lời mời', color: 'default' };
  if (invitation?.status === 'DECLINED') return { label: 'Đội đã từ chối', color: 'error' };
  return { label: 'Chưa gửi lời mời', color: 'default' };
}

function getBackendErrorMessage(error: unknown) {
  const backendMessage = (error as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(backendMessage)) return backendMessage.join(', ');
  return backendMessage?.trim() || undefined;
}

type PromotionCandidateFormValues = {
  teamId?: string;
  rank?: number;
  sourceCompetition?: string;
  qualificationType?: PromotionQualificationType;
  note?: string;
};
type PromotionImportFormValues = {
  sourceCompetition?: string;
  replaceExisting?: boolean;
  importText?: string;
};
type ReplacementCandidate = ReplacementCandidateResult['candidates'][number];
type PromotionImportField =
  | 'rank'
  | 'teamId'
  | 'teamName'
  | 'sourceCompetition'
  | 'qualificationType'
  | 'status'
  | 'note';

const PROMOTION_IMPORT_TEMPLATE =
  'rank,team,qualificationType,note\n1,PVF-CAND,CHAMPION,Vô địch\n2,Trường Tươi Bình Phước,RUNNER_UP,Á quân';

function normalizeImportToken(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function splitPromotionImportLine(line: string) {
  const delimiter = line.includes('\t') ? '\t' : ',';
  const cells: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === delimiter && !quoted) {
      cells.push(cell.trim());
      cell = '';
      continue;
    }
    cell += char;
  }

  cells.push(cell.trim());
  return cells;
}

function getPromotionImportHeaderField(header: string): PromotionImportField | null {
  const key = normalizeImportToken(header);
  const fields: Record<string, PromotionImportField> = {
    rank: 'rank',
    hang: 'rank',
    position: 'rank',
    teamid: 'teamId',
    idclb: 'teamId',
    clbid: 'teamId',
    team: 'teamName',
    teamname: 'teamName',
    clb: 'teamName',
    club: 'teamName',
    tenclb: 'teamName',
    source: 'sourceCompetition',
    sourcecompetition: 'sourceCompetition',
    nguon: 'sourceCompetition',
    giainguon: 'sourceCompetition',
    qualification: 'qualificationType',
    qualificationtype: 'qualificationType',
    type: 'qualificationType',
    loai: 'qualificationType',
    status: 'status',
    trangthai: 'status',
    note: 'note',
    notes: 'note',
    ghichu: 'note',
  };
  return fields[key] ?? null;
}

function parsePromotionQualification(value?: string) {
  const key = normalizeImportToken(value ?? '');
  if (!key) return undefined;
  const values: Record<string, PromotionQualificationType> = {
    champion: 'CHAMPION',
    vodich: 'CHAMPION',
    runnerup: 'RUNNER_UP',
    aquan: 'RUNNER_UP',
    playoff: 'PLAYOFF',
    playoffwinner: 'PLAYOFF',
    replacementpool: 'REPLACEMENT_POOL',
    replacement: 'REPLACEMENT_POOL',
    duphong: 'REPLACEMENT_POOL',
  };
  return values[key] ?? null;
}

function parsePromotionStatus(value?: string) {
  const key = normalizeImportToken(value ?? '');
  if (!key) return undefined;
  const values = {
    eligible: 'ELIGIBLE',
    invited: 'INVITED',
    accepted: 'ACCEPTED',
    declined: 'DECLINED',
    skipped: 'SKIPPED',
  } as const;
  return values[key as keyof typeof values] ?? null;
}

function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parsePromotionImportText(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const errors: string[] = [];
  const rows: ImportPromotionCandidateRow[] = [];

  if (lines.length === 0) {
    return { rows, errors: ['Chưa có dữ liệu import.'] };
  }

  const firstCells = splitPromotionImportLine(lines[0]);
  const headerFields = firstCells.map(getPromotionImportHeaderField);
  const hasHeader = headerFields.some(Boolean) && headerFields.includes('rank');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  dataLines.forEach((line, index) => {
    const lineNumber = hasHeader ? index + 2 : index + 1;
    const cells = splitPromotionImportLine(line);
    const getCell = (field: PromotionImportField, fallbackIndex?: number) => {
      if (hasHeader) {
        const cellIndex = headerFields.findIndex((candidate) => candidate === field);
        return cellIndex >= 0 ? cells[cellIndex]?.trim() : undefined;
      }
      return fallbackIndex === undefined ? undefined : cells[fallbackIndex]?.trim();
    };
    const rankValue = getCell('rank', 0);
    const teamIdValue = getCell('teamId');
    const teamNameValue = getCell('teamName', 1);
    const sourceCompetition = getCell('sourceCompetition')?.trim();
    const qualificationValue = getCell('qualificationType', 2);
    const statusValue = getCell('status');
    const note = getCell('note', 3)?.trim();
    const rank = Number(rankValue);
    const qualificationType = parsePromotionQualification(qualificationValue);
    const status = parsePromotionStatus(statusValue);

    if (!Number.isInteger(rank) || rank < 1) {
      errors.push(`Dòng ${lineNumber}: hạng không hợp lệ.`);
    }
    if (!teamIdValue && !teamNameValue) {
      errors.push(`Dòng ${lineNumber}: thiếu CLB.`);
    }
    if (qualificationType === null) {
      errors.push(`Dòng ${lineNumber}: loại thăng hạng không hợp lệ.`);
    }
    if (status === null) {
      errors.push(`Dòng ${lineNumber}: trạng thái không hợp lệ.`);
    }

    if (Number.isInteger(rank) && rank >= 1 && (teamIdValue || teamNameValue)) {
      const teamRef = teamIdValue || teamNameValue || '';
      rows.push({
        rank,
        teamId: looksLikeUuid(teamRef) ? teamRef : teamIdValue,
        teamName: looksLikeUuid(teamRef) ? undefined : teamNameValue,
        sourceCompetition: sourceCompetition || undefined,
        qualificationType: qualificationType || undefined,
        status: status || undefined,
        note: note || undefined,
      });
    }
  });

  return { rows, errors };
}

// ─── Season Team Panel (expandable row) ───
function SeasonTeamPanel({ seasonId }: { seasonId: string }) {
  const { t } = useTranslation();
  const [teams, setTeams] = useState<SeasonTeam[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [viewingTeam, setViewingTeam] = useState<SeasonTeam | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();
  const [selectedInvitationSource, setSelectedInvitationSource] =
    useState<TeamInvitationSourceType>('PROMOTED');
  const [candidateResult, setCandidateResult] = useState<InvitationCandidateResult | null>(null);
  const [candidateError, setCandidateError] = useState<string | null>(null);
  const [promotionCandidates, setPromotionCandidates] = useState<PromotionCandidate[]>([]);
  const [promotionSaving, setPromotionSaving] = useState(false);
  const [replacementData, setReplacementData] = useState<ReplacementCandidateResult | null>(null);
  const [replacementModalOpen, setReplacementModalOpen] = useState(false);
  const [promotionNoteInput, setPromotionNoteInput] = useState('');
  const [promotionForm] = Form.useForm<PromotionCandidateFormValues>();
  const [promotionImportForm] = Form.useForm<PromotionImportFormValues>();
  const [promotionImportOpen, setPromotionImportOpen] = useState(false);
  const [promotionImporting, setPromotionImporting] = useState(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const [seasonTeams, teamRes, invitationData, promotionCandidateData] = await Promise.all([
        apiGetSeasonTeams(seasonId),
        apiGetTeams(),
        apiGetSeasonInvitations(seasonId),
        apiGetPromotionCandidates(seasonId),
      ]);
      setTeams(seasonTeams);
      setAllTeams(teamRes.data);
      setInvitations(invitationData);
      setPromotionCandidates(promotionCandidateData);

      try {
        const candidateData = await apiGetInvitationCandidates(seasonId);
        setCandidateResult(candidateData);
        setCandidateError(null);
      } catch (err: unknown) {
        setCandidateResult(null);
        setCandidateError(
          getBackendErrorMessage(err) ||
            'Chưa thể sinh top 8 mùa trước cho mùa giải này. Hãy kiểm tra mùa nguồn đã kết thúc.',
        );
      }

      // Load replacement candidates
      try {
        const repData = await apiGetReplacementCandidates(seasonId);
        setReplacementData(repData);
      } catch (_) {
        setReplacementData(null);
      }
    } catch (_err) {
      message.error(t('seasons.teamPanelLoadError'));
    } finally {
      setLoading(false);
    }
  }, [seasonId, t]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const registeredTeamIds = new Set(teams.map((t) => t.teamId));
  const availableTeams = allTeams.filter(
    (t) => !registeredTeamIds.has(t.id) && t.status === 'ACTIVE',
  );
  const promotionCandidateTeamIds = new Set(
    promotionCandidates.map((candidate) => candidate.teamId),
  );
  const availablePromotionTeams = allTeams.filter(
    (t) => t.status === 'ACTIVE' && !promotionCandidateTeamIds.has(t.id),
  );
  const invitationsByTeamId = new Map(
    invitations.map((invitation) => [invitation.teamId, invitation]),
  );
  const candidateTopCount =
    candidateResult?.candidates.filter((candidate) => candidate.sourceType === 'PREVIOUS_TOP_8')
      .length ?? 0;
  const candidatePromotedCount =
    candidateResult?.candidates.filter((candidate) => candidate.sourceType === 'PROMOTED').length ??
    0;
  const currentInvitationTargets =
    candidateResult?.candidates.filter((candidate) => {
      const invitationStatus =
        invitationsByTeamId.get(candidate.teamId)?.status ?? candidate.invitationStatus;
      return invitationStatus !== 'ACCEPTED';
    }) ?? [];

  const handleAdd = async () => {
    if (!selectedTeamId) return;
    setAdding(true);
    try {
      await apiRegisterTeam(seasonId, selectedTeamId);
      message.success(t('seasons.teamPanelRegSuccess'));
      setSelectedTeamId(undefined);
      fetchTeams();
    } catch (_err) {
      message.error(t('seasons.teamPanelRegError'));
    } finally {
      setAdding(false);
    }
  };

  const handleSendInvitation = async (
    teamId = selectedTeamId,
    sourceType = selectedInvitationSource,
    promotionNote?: string,
  ) => {
    if (!teamId) return;
    setInviting(true);
    try {
      await apiSendTeamInvitation(seasonId, {
        teamId,
        sourceType,
        promotionNote: sourceType === 'PROMOTED' ? promotionNote : undefined,
      });
      message.success('Đã gửi lời mời tham dự đến manager CLB');
      await fetchTeams();
    } catch (_err) {
      message.error('Không thể gửi lời mời. Hãy kiểm tra CLB đã có tài khoản manager cố định.');
    } finally {
      setInviting(false);
    }
  };

  const handleOpenReplacementModal = () => {
    setReplacementModalOpen(true);
  };

  const handleSendReplacement = async (teamId: string) => {
    setInviting(true);
    try {
      await apiSendTeamInvitation(seasonId, {
        teamId,
        sourceType: 'REPLACEMENT',
      });
      message.success('Đã gửi lời mời thay thế');
      await fetchTeams();
      // Refresh replacement data
      try {
        const repData = await apiGetReplacementCandidates(seasonId);
        setReplacementData(repData);
      } catch (_) {
        /* ignore */
      }
    } catch (_err) {
      message.error('Không thể gửi lời mời. Hãy kiểm tra CLB có tài khoản manager.');
    } finally {
      setInviting(false);
    }
  };

  const handleSavePromotionCandidate = async () => {
    const values = await promotionForm.validateFields();
    if (!values.teamId || !values.rank || !values.sourceCompetition) return;

    setPromotionSaving(true);
    try {
      await apiUpsertPromotionCandidate(seasonId, {
        teamId: values.teamId,
        rank: values.rank,
        sourceCompetition: values.sourceCompetition.trim(),
        qualificationType: values.qualificationType ?? 'RUNNER_UP',
        note: values.note?.trim() || undefined,
      });
      message.success('Đã lưu nguồn đội thăng hạng');
      promotionForm.resetFields(['teamId', 'rank', 'note']);
      await fetchTeams();
    } catch (err: unknown) {
      message.error(getBackendErrorMessage(err) || 'Không thể lưu nguồn đội thăng hạng');
    } finally {
      setPromotionSaving(false);
    }
  };

  const handleDeletePromotionCandidate = async (teamId: string) => {
    setPromotionSaving(true);
    try {
      await apiDeletePromotionCandidate(seasonId, teamId);
      message.success('Đã xóa đội khỏi nguồn thăng hạng');
      await fetchTeams();
    } catch (err: unknown) {
      message.error(getBackendErrorMessage(err) || 'Không thể xóa đội thăng hạng');
    } finally {
      setPromotionSaving(false);
    }
  };

  const handleOpenPromotionImport = () => {
    promotionImportForm.setFieldsValue({
      sourceCompetition:
        promotionImportForm.getFieldValue('sourceCompetition') ||
        promotionForm.getFieldValue('sourceCompetition') ||
        'V.League 2 2025',
      replaceExisting: true,
    });
    setPromotionImportOpen(true);
  };

  const handleImportPromotionCandidates = async () => {
    const values = await promotionImportForm.validateFields();
    const parsed = parsePromotionImportText(values.importText ?? '');
    if (parsed.errors.length > 0) {
      promotionImportForm.setFields([{ name: 'importText', errors: parsed.errors.slice(0, 4) }]);
      message.error(parsed.errors[0]);
      return;
    }

    setPromotionImporting(true);
    try {
      const result = await apiImportPromotionCandidates(seasonId, {
        sourceCompetition: values.sourceCompetition?.trim() || undefined,
        replaceExisting: values.replaceExisting,
        rows: parsed.rows,
      });
      message.success(`Đã import ${result.importedCount} đội vào snapshot thăng hạng`);
      setPromotionImportOpen(false);
      promotionImportForm.resetFields(['importText']);
      await fetchTeams();
    } catch (err: unknown) {
      message.error(getBackendErrorMessage(err) || 'Không thể import snapshot thăng hạng');
    } finally {
      setPromotionImporting(false);
    }
  };

  const handleSendCurrentInvitations = async () => {
    if (currentInvitationTargets.length === 0) return;

    setInviting(true);
    try {
      const targets = currentInvitationTargets;
      const results = await Promise.allSettled(
        targets.map((candidate) =>
          apiSendTeamInvitation(seasonId, {
            teamId: candidate.teamId,
            sourceType: candidate.sourceType,
            promotionNote:
              candidate.sourceType === 'PROMOTED'
                ? (candidate.sourceNote ?? candidate.sourceCompetition ?? undefined)
                : undefined,
          }),
        ),
      );
      const sentCount = results.filter((result) => result.status === 'fulfilled').length;
      const failedCount = targets.length - sentCount;

      if (sentCount > 0) {
        message.success(`Đã gửi lời mời đến ${sentCount}/${targets.length} đội hiện tại`);
        await fetchTeams();
      }
      if (failedCount > 0) {
        message.error(
          `Có ${failedCount} đội chưa gửi được lời mời. Hãy kiểm tra tài khoản manager CLB.`,
        );
      }
    } finally {
      setInviting(false);
    }
  };

  const promotionColumns: ColumnsType<PromotionCandidate> = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      width: 64,
      align: 'center',
      render: (rank: number) => <Tag color="green">#{rank}</Tag>,
    },
    {
      title: 'CLB',
      key: 'team',
      render: (_, r) => {
        const logoUrl = getTeamLogoUrl(r.team);
        return (
          <Space size={6}>
            {logoUrl && (
              <img src={logoUrl} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            )}
            <strong>{r.team?.name ?? r.teamId}</strong>
            {r.team?.shortName && <span style={{ color: '#888' }}>({r.team.shortName})</span>}
          </Space>
        );
      },
    },
    {
      title: 'Nguồn',
      key: 'source',
      width: 190,
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          <Typography.Text>{r.sourceCompetition}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {PROMOTION_QUALIFICATION_OPTIONS.find((option) => option.value === r.qualificationType)
              ?.label ?? r.qualificationType}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => <Tag>{status}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      width: 64,
      align: 'right',
      render: (_, r) => (
        <Popconfirm
          title="Xóa đội khỏi nguồn thăng hạng?"
          onConfirm={() => handleDeletePromotionCandidate(r.teamId)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const candidateColumns: ColumnsType<InvitationCandidate> = [
    {
      title: 'Hạng',
      dataIndex: 'sourceRank',
      width: 64,
      align: 'center',
      render: (rank: number, record) => (
        <Tag color={record.sourceType === 'PROMOTED' ? 'green' : 'blue'}>#{rank}</Tag>
      ),
    },
    {
      title: 'Nguồn',
      dataIndex: 'sourceType',
      width: 170,
      render: (sourceType: TeamInvitationSourceType, record) => (
        <Space direction="vertical" size={2}>
          <Tag
            color={sourceType === 'PROMOTED' ? 'green' : 'blue'}
            style={{ width: 'fit-content' }}
          >
            {INVITATION_SOURCE_MAP[sourceType] ?? sourceType}
          </Tag>
          {record.sourceCompetition && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.sourceCompetition}
            </Typography.Text>
          )}
        </Space>
      ),
    },
    {
      title: 'CLB',
      key: 'team',
      render: (_, r) => {
        const logoUrl = getTeamLogoUrl(r.team ?? r.teamName);
        return (
          <Space size={6}>
            {logoUrl && (
              <img src={logoUrl} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            )}
            <strong>{r.teamName}</strong>
            {r.team?.shortName && <span style={{ color: '#888' }}>({r.team.shortName})</span>}
          </Space>
        );
      },
    },
    {
      title: 'Điểm',
      dataIndex: 'points',
      width: 80,
      align: 'center',
      render: (points: number, record) => (record.sourceType === 'PREVIOUS_TOP_8' ? points : '-'),
    },
    {
      title: 'Hiệu số',
      dataIndex: 'goalDifference',
      width: 90,
      align: 'center',
      render: (goalDifference: number, record) => {
        if (record.sourceType !== 'PREVIOUS_TOP_8') return '-';
        return goalDifference > 0 ? `+${goalDifference}` : goalDifference;
      },
    },
    {
      title: 'Lời mời',
      key: 'invitationStatus',
      width: 140,
      render: (_, r) => {
        if (!r.invitationStatus) return <Tag>Chưa gửi</Tag>;
        const status = INVITATION_STATUS_MAP[r.invitationStatus] ?? {
          label: r.invitationStatus,
          color: 'default',
        };
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_, r) => {
        const actionSource =
          r.sourceType === 'PREVIOUS_TOP_8'
            ? 'top 8'
            : r.sourceType === 'PROMOTED'
              ? 'thăng hạng'
              : 'thay thế';
        return (
          <Button
            size="small"
            icon={<SendOutlined />}
            loading={inviting}
            disabled={r.invitationStatus === 'ACCEPTED'}
            onClick={() =>
              handleSendInvitation(
                r.teamId,
                r.sourceType,
                r.sourceType === 'PROMOTED'
                  ? (r.sourceNote ?? r.sourceCompetition ?? undefined)
                  : undefined,
              )
            }
          >
            {r.invitationStatus === 'SENT' ? `Gửi lại ${actionSource}` : `Gửi ${actionSource}`}
          </Button>
        );
      },
    },
  ];

  const handleStatus = async (teamId: string, status: string) => {
    try {
      await apiUpdateSeasonTeamStatus(seasonId, teamId, status);
      message.success(t('seasons.teamPanelStatusSuccess'));
      fetchTeams();
    } catch (err: unknown) {
      message.error(getBackendErrorMessage(err) || t('seasons.teamPanelStatusError'));
    }
  };

  const handleRemove = async (teamId: string) => {
    try {
      await apiRemoveSeasonTeam(seasonId, teamId);
      message.success(t('seasons.teamPanelRemoveSuccess'));
      fetchTeams();
    } catch (_err) {
      message.error(t('seasons.teamPanelRemoveError'));
    }
  };

  const cols: ColumnsType<SeasonTeam> = [
    {
      title: t('seasons.teamPanelColTeam'),
      key: 'team',
      render: (_, r) => {
        const logoUrl = getTeamLogoUrl(r.team);
        return (
          <Space size={6}>
            {logoUrl && (
              <img src={logoUrl} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            )}
            <strong>{r.team.name}</strong>
            {r.team.shortName && <span style={{ color: '#888' }}>({r.team.shortName})</span>}
          </Space>
        );
      },
    },
    {
      title: t('seasons.teamPanelColCity'),
      key: 'city',
      width: 140,
      render: (_, r) => r.team.city ?? '—',
    },
    {
      title: t('seasons.teamPanelColStatus'),
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (s: string) => {
        const m = TEAM_STATUS_MAP[s] ?? { label: s, color: 'default' };
        return <Tag color={m.color}>{m.label}</Tag>;
      },
    },
    {
      title: 'Lời mời BTC',
      key: 'invitation',
      width: 180,
      render: (_, r) => {
        const invitation = invitationsByTeamId.get(r.teamId);
        if (!invitation) return <Tag>Chưa gửi lời mời</Tag>;
        const status = INVITATION_STATUS_MAP[invitation.status] ?? {
          label: invitation.status,
          color: 'default',
        };
        const declineReason = invitation.responseReason?.trim();

        return (
          <div>
            <Tag color={status.color}>{status.label}</Tag>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              {INVITATION_SOURCE_MAP[invitation.sourceType] ?? invitation.sourceType}
              {' · '}
              hạn {dayjs(invitation.deadlineAt).format('DD/MM/YYYY')}
              {invitation.promotionNote && (
                <span style={{ color: '#52c41a' }}> · {invitation.promotionNote}</span>
              )}
            </div>
            {invitation.status === 'DECLINED' && declineReason && (
              <Tooltip title={declineReason}>
                <div style={{ marginTop: 6, whiteSpace: 'normal', lineHeight: 1.45 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 700 }}>
                    Lý do:{' '}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {declineReason}
                  </Typography.Text>
                </div>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'Hồ sơ tham dự',
      key: 'application',
      width: 180,
      render: (_, r) => {
        const status = getSeasonTeamApplicationStatus(r, invitationsByTeamId.get(r.teamId));
        return (
          <Space size={4} wrap>
            <Tag color={status.color}>{status.label}</Tag>
            {r.participationFeePaid && <Tag color="green">Đã nộp phí</Tag>}
          </Space>
        );
      },
    },
    {
      title: t('seasons.teamPanelColRegDate'),
      dataIndex: 'registeredAt',
      width: 120,
      render: (d: string) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: '',
      key: 'actions',
      width: 180,
      render: (_, r) => {
        const invitationSource =
          invitationsByTeamId.get(r.teamId)?.sourceType ?? selectedInvitationSource;
        return (
          <Space size={4}>
            <Tooltip title="Gửi lời mời/popup cho manager CLB">
              <Button
                type="text"
                size="small"
                icon={<SendOutlined />}
                onClick={() => handleSendInvitation(r.teamId, invitationSource)}
              />
            </Tooltip>
            <Tooltip title="Xem hồ sơ tham dự">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                disabled={!r.applicationSubmittedAt}
                onClick={() => setViewingTeam(r)}
              />
            </Tooltip>
            {r.status === 'REGISTERED' && (
              <>
                <Tooltip title={t('seasons.teamPanelApproveTooltip')}>
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    style={{ color: '#52c41a' }}
                    onClick={() => handleStatus(r.teamId, 'APPROVED')}
                  />
                </Tooltip>
                <Tooltip title={t('seasons.teamPanelRejectTooltip')}>
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    danger
                    onClick={() => handleStatus(r.teamId, 'REJECTED')}
                  />
                </Tooltip>
              </>
            )}
            <Popconfirm
              title={t('seasons.teamPanelRemoveConfirm')}
              onConfirm={() => handleRemove(r.teamId)}
              okText={t('seasons.deleteOk')}
              cancelText={t('seasons.deleteCancel')}
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ marginBottom: 16 }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
          <Space direction="vertical" size={0}>
            <Typography.Text strong>Nguồn đội thăng hạng</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Snapshot từ giải hạng dưới để hệ thống lấy 2 đội thăng hạng theo ranking
            </Typography.Text>
          </Space>
          <Button size="small" icon={<UploadOutlined />} onClick={handleOpenPromotionImport}>
            Import CSV
          </Button>
        </Flex>
        <Form
          form={promotionForm}
          layout="inline"
          initialValues={{
            qualificationType: 'RUNNER_UP',
            sourceCompetition: 'V.League 2 2025',
          }}
          style={{ rowGap: 8, marginBottom: 8 }}
        >
          <Form.Item name="teamId" rules={[{ required: true, message: 'Chọn CLB thăng hạng' }]}>
            <Select
              placeholder="CLB thăng hạng"
              style={{ width: 230 }}
              showSearch
              optionFilterProp="label"
              options={availablePromotionTeams.map((team) => ({
                value: team.id,
                label: `${team.name}${team.shortName ? ` (${team.shortName})` : ''}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="rank" rules={[{ required: true, message: 'Nhập hạng' }]}>
            <InputNumber min={1} precision={0} placeholder="Hạng" style={{ width: 88 }} />
          </Form.Item>
          <Form.Item
            name="sourceCompetition"
            rules={[{ required: true, message: 'Nhập giải nguồn' }]}
          >
            <Input placeholder="Giải nguồn" style={{ width: 170 }} />
          </Form.Item>
          <Form.Item name="qualificationType">
            <Select style={{ width: 120 }} options={PROMOTION_QUALIFICATION_OPTIONS} />
          </Form.Item>
          <Form.Item name="note">
            <Input placeholder="Ghi chú" style={{ width: 180 }} allowClear />
          </Form.Item>
          <Button
            size="small"
            icon={<PlusOutlined />}
            loading={promotionSaving}
            onClick={handleSavePromotionCandidate}
          >
            Lưu nguồn
          </Button>
        </Form>
        <Table
          columns={promotionColumns}
          dataSource={promotionCandidates}
          rowKey="id"
          pagination={false}
          size="small"
          loading={loading}
          locale={{ emptyText: 'Chưa có snapshot đội thăng hạng' }}
        />
        <Modal
          title="Import snapshot V.League 2"
          open={promotionImportOpen}
          onCancel={() => setPromotionImportOpen(false)}
          onOk={handleImportPromotionCandidates}
          confirmLoading={promotionImporting}
          okText="Import"
          cancelText="Hủy"
          width={720}
        >
          <Form
            form={promotionImportForm}
            layout="vertical"
            initialValues={{
              sourceCompetition: 'V.League 2 2025',
              replaceExisting: true,
            }}
          >
            <Flex gap={12} align="flex-start">
              <Form.Item
                name="sourceCompetition"
                label="Giải nguồn"
                rules={[{ required: true, message: 'Nhập giải nguồn' }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="V.League 2 2025" />
              </Form.Item>
              <Form.Item name="replaceExisting" valuePropName="checked" style={{ paddingTop: 30 }}>
                <Checkbox>Thay thế snapshot hiện tại</Checkbox>
              </Form.Item>
            </Flex>
            <Form.Item
              name="importText"
              label="Dữ liệu CSV/Excel"
              rules={[{ required: true, message: 'Dán dữ liệu snapshot' }]}
            >
              <Input.TextArea
                rows={8}
                placeholder={PROMOTION_IMPORT_TEMPLATE}
                style={{ fontFamily: 'monospace' }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <div style={{ marginBottom: 12 }}>
        {candidateResult ? (
          <>
            <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
              <Typography.Text strong>Danh sách mời dự kiến</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Nguồn: {candidateResult.previousSeason.name} · Top 8: {candidateTopCount}/
                {candidateResult.requiredTopLeagueSlots} · Thăng hạng: {candidatePromotedCount}/
                {candidateResult.requiredPromotedSlots}
              </Typography.Text>
            </Flex>
            {candidatePromotedCount < candidateResult.requiredPromotedSlots && (
              <Alert
                showIcon
                type="info"
                message="Cần bổ sung đội thăng hạng"
                description="Chọn nguồn Thăng hạng ở khu vực bên dưới để gửi lời mời cho đủ 2 đội thăng hạng."
                style={{ marginBottom: 8 }}
              />
            )}
            <Table
              columns={candidateColumns}
              dataSource={candidateResult.candidates}
              rowKey="teamId"
              pagination={false}
              size="small"
            />
          </>
        ) : (
          candidateError && (
            <Alert
              showIcon
              type="warning"
              message="Danh sách mời dự kiến"
              description={candidateError}
              style={{ marginBottom: 12 }}
            />
          )
        )}
      </div>
      {/* Replacement alert when teams have declined/expired */}
      {replacementData && replacementData.slotsNeeded > 0 && (
        <Alert
          showIcon
          icon={<WarningOutlined />}
          type="warning"
          message={`Có ${replacementData.declinedTeams.length} đội đã từ chối/quá hạn. Cần mời thêm ${replacementData.slotsNeeded} đội thay thế để đủ ${replacementData.totalRequired} đội.`}
          description={
            <Space direction="vertical" size={4} style={{ marginTop: 4 }}>
              {replacementData.declinedTeams.map((inv) => (
                <Typography.Text key={inv.id} type="secondary" style={{ fontSize: 12 }}>
                  <Tag
                    color={inv.status === 'DECLINED' ? 'error' : 'default'}
                    style={{ fontSize: 11 }}
                  >
                    {inv.status === 'DECLINED' ? 'Từ chối' : 'Quá hạn'}
                  </Tag>
                  {inv.team?.name ?? inv.teamId}
                  {inv.responseReason ? ` — ${inv.responseReason}` : ''}
                </Typography.Text>
              ))}
              <Button
                type="primary"
                size="small"
                icon={<SwapOutlined />}
                onClick={handleOpenReplacementModal}
                style={{ marginTop: 4, width: 'fit-content' }}
              >
                Xem đội đề xuất thay thế ({replacementData.candidates.length} đội khả dụng)
              </Button>
            </Space>
          }
          style={{ marginBottom: 12 }}
        />
      )}
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Typography.Text strong>
          <TeamOutlined />{' '}
          {t('seasons.teamPanelTitle', {
            approved: teams.filter((t) => t.status === 'APPROVED').length,
            total: teams.length,
          })}
        </Typography.Text>
        <Space>
          <Select
            value={selectedInvitationSource}
            onChange={setSelectedInvitationSource}
            style={{ width: 140 }}
            options={INVITATION_SOURCE_OPTIONS}
          />
          {candidateResult && (
            <Button
              size="small"
              icon={<SendOutlined />}
              disabled={currentInvitationTargets.length === 0}
              loading={inviting}
              onClick={handleSendCurrentInvitations}
            >
              Gửi {currentInvitationTargets.length} đội hiện tại
            </Button>
          )}
          <Select
            value={selectedTeamId}
            onChange={setSelectedTeamId}
            placeholder={t('seasons.teamPanelAddPlaceholder')}
            style={{ width: 250 }}
            allowClear
            showSearch
            optionFilterProp="label"
            options={availableTeams.map((t) => ({
              value: t.id,
              label: `${t.name}${t.shortName ? ` (${t.shortName})` : ''}`,
            }))}
          />
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            disabled={!selectedTeamId}
            loading={adding}
            onClick={handleAdd}
          >
            {t('seasons.teamPanelAddBtn')}
          </Button>
          <Button
            size="small"
            icon={<SendOutlined />}
            disabled={!selectedTeamId}
            loading={inviting}
            onClick={() =>
              handleSendInvitation(undefined, undefined, promotionNoteInput || undefined)
            }
          >
            Gửi lời mời
          </Button>
        </Space>
      </Flex>
      {/* Promotion note input when source = PROMOTED */}
      {selectedInvitationSource === 'PROMOTED' && (
        <div style={{ marginBottom: 12 }}>
          <Input
            placeholder="Ghi chú thăng hạng (VD: Vô địch V.League 2 2024)"
            value={promotionNoteInput}
            onChange={(e) => setPromotionNoteInput(e.target.value)}
            style={{ width: 400 }}
            size="small"
            allowClear
          />
        </div>
      )}
      <Table
        columns={cols}
        dataSource={teams}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="small"
        locale={{ emptyText: t('seasons.teamPanelEmpty') }}
      />
      <Modal
        title={viewingTeam ? `Hồ sơ tham dự - ${viewingTeam.team.name}` : 'Hồ sơ tham dự'}
        open={!!viewingTeam}
        onCancel={() => setViewingTeam(null)}
        footer={null}
        width={760}
      >
        {viewingTeam && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Cơ quan/công ty chủ quản">
              {viewingTeam.ownerName ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Quốc gia đặt trụ sở">
              {viewingTeam.ownerCountry ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{viewingTeam.ownerAddress ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Áo chính thức">
              {viewingTeam.primaryKit ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Áo dự bị">{viewingTeam.backupKit ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Lệ phí tham dự">
              {viewingTeam.participationFeePaid ? 'Đã nộp' : 'Chưa nộp'}
              {viewingTeam.feeReceiptCode ? ` (${viewingTeam.feeReceiptCode})` : ''}
            </Descriptions.Item>
            <Descriptions.Item label="Chứng từ lệ phí">
              {viewingTeam.feeReceiptUrl ? (
                <a href={viewingTeam.feeReceiptUrl} target="_blank" rel="noreferrer">
                  Mở chứng từ
                </a>
              ) : (
                '—'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Giới thiệu đội">
              {viewingTeam.teamIntroduction ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Lịch giải khác">
              {viewingTeam.externalCompetitionSchedule ?? '—'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
      {/* Replacement candidates modal */}
      <Modal
        title={
          <Space>
            <SwapOutlined />
            <span>Đề xuất đội thay thế</span>
            {replacementData && (
              <Tag color="orange">Cần thêm {replacementData.slotsNeeded} đội</Tag>
            )}
          </Space>
        }
        open={replacementModalOpen}
        onCancel={() => setReplacementModalOpen(false)}
        footer={null}
        width={680}
      >
        {replacementData && replacementData.candidates.length > 0 ? (
          <Table
            dataSource={replacementData.candidates}
            rowKey="id"
            pagination={false}
            size="small"
            columns={[
              {
                title: 'CLB',
                key: 'team',
                render: (_, r) => {
                  const logoUrl = getTeamLogoUrl(r);
                  return (
                    <Space size={6}>
                      {logoUrl && (
                        <img
                          src={logoUrl}
                          alt=""
                          style={{ width: 20, height: 20, objectFit: 'contain' }}
                        />
                      )}
                      <strong>{r.name}</strong>
                      {r.shortName && <span style={{ color: '#888' }}>({r.shortName})</span>}
                    </Space>
                  );
                },
              },
              {
                title: 'Thành phố',
                dataIndex: 'city',
                width: 130,
                render: (city: string | null) => city ?? '—',
              },
              {
                title: 'Nguồn',
                key: 'source',
                width: 150,
                render: (_: unknown, r: ReplacementCandidate) =>
                  r.promotionRank ? (
                    <Space direction="vertical" size={2}>
                      <Tag color="green">#{r.promotionRank} thăng hạng</Tag>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {r.sourceCompetition}
                      </Typography.Text>
                    </Space>
                  ) : (
                    <Tag>Khả dụng</Tag>
                  ),
              },
              {
                title: '',
                key: 'action',
                width: 140,
                align: 'right' as const,
                render: (_: unknown, r: ReplacementCandidate) => (
                  <Button
                    type="primary"
                    size="small"
                    icon={<SendOutlined />}
                    loading={inviting}
                    onClick={() => handleSendReplacement(r.id)}
                  >
                    Gửi thay thế
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <Alert
            type="info"
            showIcon
            message="Không có đội khả dụng để mời thay thế"
            description="Tất cả đội trong hệ thống đã được mời hoặc đăng ký cho mùa giải này."
          />
        )}
      </Modal>
    </div>
  );
}

export default function SeasonsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const yearOptions = generateYearOptions();

  const fetchSeasons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetSeasons();
      setSeasons(data);
    } catch (_err) {
      message.error(t('seasons.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    const currentYear = new Date().getFullYear();
    form.setFieldsValue({
      year: currentYear,
      name: `VLeague ${currentYear}-${currentYear + 1}`,
      status: 'UPCOMING',
    });
    setModalOpen(true);
  };

  const openEdit = (season: Season) => {
    setEditing(season);
    form.setFieldsValue({
      name: season.name,
      year: season.year,
      status: season.status,
      startDate: season.startDate ? dayjs(season.startDate) : undefined,
      endDate: season.endDate ? dayjs(season.endDate) : undefined,
    });
    setModalOpen(true);
  };

  const handleYearChange = (year: number) => {
    if (!editing) {
      form.setFieldValue('name', `VLeague ${year}-${year + 1}`);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (
        values.startDate &&
        values.endDate &&
        (values.startDate as dayjs.Dayjs).isAfter(values.endDate as dayjs.Dayjs, 'day')
      ) {
        form.setFields([
          {
            name: 'startDate',
            errors: ['Ngày bắt đầu không được sau ngày kết thúc'],
          },
          {
            name: 'endDate',
            errors: ['Ngày kết thúc phải sau hoặc bằng ngày bắt đầu'],
          },
        ]);
        message.error('Ngày bắt đầu không được sau ngày kết thúc');
        return;
      }

      setSaving(true);

      const payload: CreateSeasonPayload = {
        name: values.name,
        year: values.year,
        status: values.status,
        startDate: values.startDate ? values.startDate.toISOString() : undefined,
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
      };

      if (editing) {
        await apiUpdateSeason(editing.id, payload);
        message.success(t('seasons.updateSuccess'));
      } else {
        await apiCreateSeason(payload);
        message.success(t('seasons.createSuccess'));
      }

      setModalOpen(false);
      fetchSeasons();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(t('seasons.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteSeason(id);
      message.success(t('seasons.deleteSuccess'));
      fetchSeasons();
    } catch (_err) {
      message.error(t('seasons.deleteError'));
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiUpdateSeasonStatus(id, status);
      message.success(t('seasons.statusUpdateSuccess'));
      fetchSeasons();
    } catch (_err) {
      message.error(t('seasons.statusUpdateError'));
    }
  };

  const columns: ColumnsType<Season> = [
    {
      title: t('seasons.colName'),
      dataIndex: 'name',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: t('seasons.colYear'),
      dataIndex: 'year',
      width: 120,
      align: 'center',
      render: (year: number) => `${year}-${year + 1}`,
    },
    {
      title: t('seasons.colStatus'),
      dataIndex: 'status',
      width: 150,
      align: 'center',
      render: (status: string, record: Season) => {
        const s = STATUS_OPTIONS.find((o) => o.value === status);
        if (isAdmin) {
          return (
            <Select
              value={status}
              onChange={(v) => handleStatusChange(record.id, v)}
              size="small"
              style={{ width: 130 }}
              options={STATUS_OPTIONS.map((o) => ({
                value: o.value,
                label: <Tag color={o.color}>{o.label}</Tag>,
              }))}
            />
          );
        }
        return <Tag color={s?.color}>{s?.label ?? status}</Tag>;
      },
    },
    {
      title: t('seasons.colStartDate'),
      dataIndex: 'startDate',
      width: 140,
      render: (d: string | null) =>
        d ? (
          <Flex align="center" gap={4}>
            <CalendarOutlined style={{ color: '#1677ff', fontSize: 12 }} />
            {dayjs(d).format('DD/MM/YYYY')}
          </Flex>
        ) : (
          <span style={{ color: '#ccc' }}>{t('seasons.notSet')}</span>
        ),
    },
    {
      title: t('seasons.colEndDate'),
      dataIndex: 'endDate',
      width: 140,
      render: (d: string | null) =>
        d ? (
          dayjs(d).format('DD/MM/YYYY')
        ) : (
          <span style={{ color: '#ccc' }}>{t('seasons.notSet')}</span>
        ),
    },
    ...(isAdmin
      ? [
          {
            title: '',
            key: 'actions',
            width: 80,
            render: (_: unknown, record: Season) => (
              <Space size="small">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => openEdit(record)}
                />
                <Popconfirm
                  title={t('seasons.deleteConfirmTitle')}
                  description={t('seasons.deleteConfirmDesc')}
                  onConfirm={() => handleDelete(record.id)}
                  okText={t('seasons.deleteOk')}
                  cancelText={t('seasons.deleteCancel')}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];
  const inProgressCount = seasons.filter((season) => season.status === 'IN_PROGRESS').length;
  const upcomingCount = seasons.filter((season) => season.status === 'UPCOMING').length;

  return (
    <>
      <div className="page-stack">
        <PageCover
          eyebrow={t('menu.seasons')}
          title={t('seasons.title')}
          description={t('seasons.teamPanelTitle', {
            approved: inProgressCount,
            total: seasons.length,
          })}
          icon={<AppMenuIcon menuKey="seasons" />}
          metrics={[
            {
              label: t('common.total'),
              value: seasons.length.toLocaleString('vi-VN'),
              icon: <CalendarOutlined />,
            },
            {
              label: t('seasonStatus.IN_PROGRESS'),
              value: inProgressCount.toLocaleString('vi-VN'),
              icon: <CheckOutlined />,
            },
            {
              label: t('seasonStatus.UPCOMING'),
              value: upcomingCount.toLocaleString('vi-VN'),
              icon: <TeamOutlined />,
            },
          ]}
        />

        {isAdmin && (
          <div className="page-toolbar page-toolbar-end">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t('seasons.createBtn')}
            </Button>
          </div>
        )}

        <Card>
          <Table
            columns={columns}
            dataSource={seasons}
            rowKey="id"
            loading={loading}
            pagination={false}
            size="middle"
            expandable={
              isAdmin
                ? {
                    expandedRowRender: (record) => <SeasonTeamPanel seasonId={record.id} />,
                    expandRowByClick: false,
                  }
                : undefined
            }
          />
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        title={editing ? t('seasons.modalEditTitle') : t('seasons.modalCreateTitle')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? t('common.save') : t('common.create')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="year"
            label={t('seasons.formYear')}
            rules={[{ required: true, message: t('seasons.formYearRequired') }]}
          >
            <Select
              options={yearOptions}
              size="large"
              onChange={handleYearChange}
              placeholder={t('seasons.formYearPlaceholder')}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label={t('seasons.formName')}
            rules={[{ required: true, message: t('seasons.formNameRequired') }]}
          >
            <Input placeholder={t('seasons.formNamePlaceholder')} />
          </Form.Item>

          <Form.Item name="status" label={t('seasons.formStatus')} initialValue="UPCOMING">
            <Select options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
          </Form.Item>

          <Flex gap={16}>
            <Form.Item name="startDate" label={t('seasons.formStartDate')} style={{ flex: 1 }}>
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                placeholder={t('seasons.formStartDatePlaceholder')}
              />
            </Form.Item>
            <Form.Item name="endDate" label={t('seasons.formEndDate')} style={{ flex: 1 }}>
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                placeholder={t('seasons.formEndDatePlaceholder')}
              />
            </Form.Item>
          </Flex>
        </Form>
      </Modal>
    </>
  );
}
