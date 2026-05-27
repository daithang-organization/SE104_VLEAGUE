import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Descriptions, Input, message, Modal, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
          <Descriptions.Item label="Số lượng cầu thủ">{rules.roster}</Descriptions.Item>
          <Descriptions.Item label="Cầu thủ ngoại">{rules.foreignPlayers}</Descriptions.Item>
          <Descriptions.Item label="Sân nhà">{rules.stadium}</Descriptions.Item>
        </Descriptions>

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
