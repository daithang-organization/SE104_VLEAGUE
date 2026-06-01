import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Descriptions, Input, message, Modal, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  apiGetMyPendingInvitations,
  apiRespondTeamInvitation,
  type TeamInvitation,
} from '../services/teamInvitationApi';

function readRule(invitation: TeamInvitation, key: string, fallback: string) {
  return invitation.regulationsSnapshot?.[key] ?? fallback;
}

function formatVnd(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
  return `${amount.toLocaleString('vi-VN')} VND`;
}

function ComplianceRuleValue({
  children,
  ok,
  alert,
}: {
  children: ReactNode;
  ok?: boolean;
  alert: string;
}) {
  return (
    <Space direction="vertical" size={2}>
      <Space size={8}>
        {ok === undefined ? null : ok ? (
          <CheckCircleOutlined style={{ color: '#52c41a' }} aria-label="Đạt quy định" />
        ) : (
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} aria-label="Không đạt quy định" />
        )}
        <span>{children}</span>
      </Space>
      {ok === false && (
        <Typography.Text type="danger" style={{ fontSize: 12 }}>
          {alert}
        </Typography.Text>
      )}
    </Space>
  );
}

export default function TeamInvitationPopup() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const activeInvitation = invitations[0];

  const loadPendingInvitations = useCallback(async () => {
    if (user?.role !== 'TEAM_MANAGER') return;
    try {
      const data = await apiGetMyPendingInvitations();
      setInvitations(data);
      setOpen(data.length > 0);
    } catch {
      /* silent */
    }
  }, [user?.role]);

  useEffect(() => {
    loadPendingInvitations();
  }, [loadPendingInvitations]);

  const rules = useMemo(() => {
    if (!activeInvitation) return null;
    return {
      fee: formatVnd(readRule(activeInvitation, 'PARTICIPATION_FEE_VND', '1000000000')),
      age: `${readRule(activeInvitation, 'MIN_AGE', '16')} - ${readRule(
        activeInvitation,
        'MAX_AGE',
        '40',
      )} tuổi`,
      roster: `${readRule(activeInvitation, 'MIN_ROSTER', '16')} - ${readRule(
        activeInvitation,
        'MAX_ROSTER',
        '22',
      )} cầu thủ`,
      foreignPlayers: `Tối đa ${readRule(activeInvitation, 'MAX_FOREIGN_PLAYERS', '5')} đăng ký, ${readRule(
        activeInvitation,
        'MAX_FOREIGN_PLAYERS_ON_FIELD',
        '3',
      )} trên sân`,
      stadium: `Tối thiểu ${Number(
        readRule(activeInvitation, 'MIN_STADIUM_CAPACITY', '10000'),
      ).toLocaleString('vi-VN')} chỗ, đạt ít nhất ${readRule(
        activeInvitation,
        'MIN_STADIUM_FIFA_STARS',
        '2',
      )} sao FIFA`,
    };
  }, [activeInvitation]);

  const removeActiveInvitation = () => {
    setInvitations((prev) => {
      const next = prev.slice(1);
      setOpen(next.length > 0);
      return next;
    });
    setDeclining(false);
    setDeclineReason('');
  };

  const respond = async (responseStatus: 'ACCEPTED' | 'DECLINED') => {
    if (!activeInvitation) return;

    setSubmitting(true);
    try {
      await apiRespondTeamInvitation(activeInvitation.id, {
        responseStatus,
        responseReason:
          responseStatus === 'DECLINED' ? declineReason.trim() || undefined : undefined,
      });
      message.success(
        responseStatus === 'ACCEPTED' ? 'Đã xác nhận tham gia mùa giải' : 'Đã gửi phản hồi từ chối',
      );
      removeActiveInvitation();
    } catch {
      message.error('Không thể gửi phản hồi lời mời');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'TEAM_MANAGER' || !activeInvitation || !rules) return null;

  const sourceLabel: Record<string, string> = {
    PREVIOUS_TOP_8: 'Top 8 mùa trước',
    PROMOTED: 'Đội thăng hạng',
    REPLACEMENT: 'Đội thay thế',
  };
  const compliance = activeInvitation.compliance;
  const canAcceptInvitation = compliance
    ? compliance.roster.ok &&
      compliance.foreignPlayers.ok &&
      compliance.age.ok &&
      compliance.stadium.ok
    : true;

  return (
    <Modal
      open={open}
      title={`Lời mời tham dự ${activeInvitation.season?.name ?? 'mùa giải'}`}
      onCancel={() => setOpen(false)}
      width={640}
      footer={
        declining ? (
          <Space>
            <Button onClick={() => setDeclining(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button
              danger
              type="primary"
              icon={<CloseCircleOutlined />}
              loading={submitting}
              onClick={() => respond('DECLINED')}
            >
              Xác nhận từ chối
            </Button>
          </Space>
        ) : (
          <Space>
            <Button onClick={() => setOpen(false)}>Để sau</Button>
            <Button danger icon={<CloseCircleOutlined />} onClick={() => setDeclining(true)}>
              Từ chối
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={submitting}
              disabled={!canAcceptInvitation}
              onClick={() => respond('ACCEPTED')}
            >
              Đồng ý tham gia
            </Button>
          </Space>
        )
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message={`BTC mời ${activeInvitation.team?.name ?? 'CLB'} phản hồi trong 14 ngày kể từ ngày gửi.`}
        />

        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="CLB">
            <Typography.Text strong>
              {activeInvitation.team?.name ?? activeInvitation.teamId}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Nguồn mời">
            <Tag color="blue">{sourceLabel[activeInvitation.sourceType]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Hạn phản hồi">
            {dayjs(activeInvitation.deadlineAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Lệ phí tham dự">{rules.fee}</Descriptions.Item>
          <Descriptions.Item label="Số lượng cầu thủ">
            <ComplianceRuleValue
              ok={compliance?.roster.ok}
              alert="Số lượng cầu thủ hiện tại không đảm bảo quy định"
            >
              {rules.roster}
              {compliance ? ` (hiện tại: ${compliance.roster.current})` : ''}
            </ComplianceRuleValue>
          </Descriptions.Item>
          <Descriptions.Item label="Cầu thủ ngoại">
            <ComplianceRuleValue
              ok={compliance?.foreignPlayers.ok}
              alert="Số lượng cầu thủ ngoại hiện tại không đảm bảo quy định"
            >
              {rules.foreignPlayers}
              {compliance ? ` (hiện tại: ${compliance.foreignPlayers.current})` : ''}
            </ComplianceRuleValue>
          </Descriptions.Item>
          <Descriptions.Item label="Độ tuổi cầu thủ">
            <ComplianceRuleValue
              ok={compliance?.age.ok}
              alert="Độ tuổi cầu thủ hiện tại không đảm bảo quy định"
            >
              {rules.age}
              {compliance
                ? ` (${compliance.age.total - compliance.age.invalidCount}/${compliance.age.total} cầu thủ đạt)`
                : ''}
            </ComplianceRuleValue>
          </Descriptions.Item>
          <Descriptions.Item label="Sân nhà">
            <ComplianceRuleValue
              ok={compliance?.stadium.ok}
              alert="Sân nhà hiện tại không đảm bảo quy định"
            >
              {rules.stadium}
              {compliance?.stadium.stadiumName ? ` (${compliance.stadium.stadiumName})` : ''}
            </ComplianceRuleValue>
          </Descriptions.Item>
        </Descriptions>

        {!canAcceptInvitation && (
          <Typography.Text type="danger">
            Vui lòng đáp ứng đầy đủ các quy định để tham gia mùa giải
          </Typography.Text>
        )}

        {declining && (
          <Input.TextArea
            rows={3}
            value={declineReason}
            onChange={(event) => setDeclineReason(event.target.value)}
            placeholder="Lý do từ chối"
            maxLength={500}
            showCount
          />
        )}
      </Space>
    </Modal>
  );
}
