import { DeleteOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  Match,
  MatchEvent,
  MatchReport,
  RosterPlayer,
  SubmitMatchReportPayload,
} from '../../services/matchApi';
import {
  SCORING_EVENT_TYPES,
  calculateReportScore,
  isScoringEventType,
  type ScoringEventType,
} from './refereeMatchReportScore';

const { Text } = Typography;

const visuallyHiddenStyle: CSSProperties = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1,
};

type DraftGoalEvent = {
  key: string;
  minute: number;
  type: ScoringEventType;
  teamId?: string;
  playerId?: string;
  note?: string;
};

type RefereeMatchReportPanelProps = {
  match: Match;
  matchReport: MatchReport | null;
  homeRoster: RosterPlayer[];
  awayRoster: RosterPlayer[];
  canSubmit: boolean;
  loading: boolean;
  submitting: boolean;
  onSubmit: (payload: SubmitMatchReportPayload) => Promise<void>;
};

function cleanOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function getEventTeamId(event: MatchEvent) {
  return event.teamId ?? event.team?.id ?? null;
}

function formatTeamName(match: Match, teamId?: string | null) {
  if (teamId === match.homeTeamId) return match.homeTeam?.name ?? 'Home';
  if (teamId === match.awayTeamId) return match.awayTeam?.name ?? 'Away';
  return '—';
}

function formatEventLabel(match: Match, event: MatchEvent | DraftGoalEvent) {
  const teamName = formatTeamName(match, event.teamId);
  const playerId = 'playerId' in event ? event.playerId : undefined;
  const playerName = 'player' in event ? event.player?.fullName : undefined;
  return `${event.minute}' · ${teamName}${playerName || playerId ? ` · ${playerName ?? playerId}` : ''}`;
}

export default function RefereeMatchReportPanel({
  match,
  matchReport,
  homeRoster,
  awayRoster,
  canSubmit,
  loading,
  submitting,
  onSubmit,
}: RefereeMatchReportPanelProps) {
  const { t } = useTranslation();
  const [draftGoals, setDraftGoals] = useState<DraftGoalEvent[]>([]);
  const [bestPlayerId, setBestPlayerId] = useState<string>();
  const [technicalStatsText, setTechnicalStatsText] = useState('');
  const [reportNote, setReportNote] = useState('');

  useEffect(() => {
    setBestPlayerId(matchReport?.bestPlayerId ?? undefined);
    setReportNote(matchReport?.note ?? '');
    setTechnicalStatsText(
      matchReport?.technicalStats ? JSON.stringify(matchReport.technicalStats, null, 2) : '',
    );
    setDraftGoals([]);
  }, [match.id, matchReport]);

  const teamOptions = useMemo(
    () => [
      { value: match.homeTeamId, label: match.homeTeam?.name ?? t('scoreModal.homeDefault') },
      { value: match.awayTeamId, label: match.awayTeam?.name ?? t('scoreModal.awayDefault') },
    ],
    [match.awayTeam?.name, match.awayTeamId, match.homeTeam?.name, match.homeTeamId, t],
  );

  const playerOptions = useMemo(
    () =>
      [...homeRoster, ...awayRoster].map((player) => ({
        value: player.playerId,
        label: `${player.fullName}${player.jerseyNumber ? ` #${player.jerseyNumber}` : ''}`,
      })),
    [awayRoster, homeRoster],
  );

  const savedScoringEvents = useMemo(
    () =>
      (match.events ?? [])
        .filter((event) => isScoringEventType(event.type))
        .map((event) => ({ ...event, teamId: getEventTeamId(event) }))
        .filter((event): event is MatchEvent & { teamId: string } => Boolean(event.teamId)),
    [match.events],
  );

  const reportScore = useMemo(
    () =>
      calculateReportScore(
        [
          ...savedScoringEvents.map((event) => ({ type: event.type, teamId: event.teamId })),
          ...draftGoals.map((event) => ({ type: event.type, teamId: event.teamId })),
        ],
        match,
      ),
    [draftGoals, match, savedScoringEvents],
  );

  const addDraftGoal = () => {
    setDraftGoals((current) => [
      ...current,
      {
        key: `goal-${Date.now()}-${current.length}`,
        minute: 0,
        type: 'GOAL',
      },
    ]);
  };

  const updateDraftGoal = (key: string, patch: Partial<DraftGoalEvent>) => {
    setDraftGoals((current) =>
      current.map((event) =>
        event.key === key
          ? {
              ...event,
              ...patch,
              playerId:
                patch.teamId && patch.teamId !== event.teamId
                  ? undefined
                  : (patch.playerId ?? event.playerId),
            }
          : event,
      ),
    );
  };

  const removeDraftGoal = (key: string) => {
    setDraftGoals((current) => current.filter((event) => event.key !== key));
  };

  const rosterForTeam = (teamId?: string) => {
    if (teamId === match.homeTeamId) return homeRoster;
    if (teamId === match.awayTeamId) return awayRoster;
    return [];
  };

  const parseTechnicalStats = () => {
    const trimmed = technicalStatsText.trim();
    if (!trimmed) return undefined;
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        throw new Error('Technical stats must be an object');
      }
      return parsed as Record<string, unknown>;
    } catch (_err) {
      message.error(t('matchDetail.technicalStatsInvalid'));
      return null;
    }
  };

  const hasInvalidDraftGoal = draftGoals.some((event) => {
    const needsPlayer = event.type !== 'OWN_GOAL' && rosterForTeam(event.teamId).length > 0;
    return event.minute < 0 || !event.teamId || (needsPlayer && !event.playerId);
  });

  const handleSubmit = async () => {
    if (hasInvalidDraftGoal) {
      message.error(t('matchDetail.reportInvalidGoal'));
      return;
    }

    const technicalStats = parseTechnicalStats();
    if (technicalStats === null) return;

    await onSubmit({
      homeScore: reportScore.home,
      awayScore: reportScore.away,
      bestPlayerId,
      technicalStats,
      note: cleanOptional(reportNote),
      events: draftGoals.map((event) => ({
        minute: event.minute,
        type: event.type,
        teamId: event.teamId as string,
        playerId: event.playerId,
        note: cleanOptional(event.note),
      })),
    });
  };

  return (
    <Card
      title={t('matchDetail.refereeReportTitle')}
      size="small"
      loading={loading}
      data-testid="referee-match-report-panel"
    >
      {matchReport && (
        <Alert
          style={{ marginBottom: 12 }}
          type="success"
          showIcon
          title={t('matchDetail.reportedScore', {
            home: matchReport.homeScore,
            away: matchReport.awayScore,
          })}
          description={
            <Space orientation="vertical" size={2}>
              <Text>{t('matchDetail.bestPlayer')}</Text>
              <Text strong>
                {matchReport.bestPlayer?.fullName ??
                  matchReport.bestPlayerId ??
                  t('matchDetail.notSelected')}
              </Text>
            </Space>
          }
        />
      )}

      {canSubmit ? (
        <Space orientation="vertical" size={14} style={{ width: '100%' }}>
          <section>
            <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
              <Text strong>{t('matchDetail.reportGoalsSection')}</Text>
              <Tag color="blue">
                {t('matchDetail.reportCalculatedScore', {
                  home: reportScore.home,
                  away: reportScore.away,
                })}
              </Tag>
            </Flex>

            <div style={{ marginTop: 10 }}>
              <Text type="secondary">{t('matchDetail.reportSavedGoals')}</Text>
              <div style={{ marginTop: 6 }}>
                {savedScoringEvents.length > 0 ? (
                  <Space wrap>
                    {savedScoringEvents.map((event) => (
                      <Tag key={event.id}>{formatEventLabel(match, event)}</Tag>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary">{t('matchDetail.reportNoSavedGoals')}</Text>
                )}
              </div>
            </div>

            <Space orientation="vertical" size={10} style={{ width: '100%', marginTop: 12 }}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
                <Text>{t('matchDetail.reportDraftGoals')}</Text>
                <Button icon={<PlusOutlined />} onClick={addDraftGoal}>
                  {t('matchDetail.reportAddGoal')}
                </Button>
              </Flex>

              {draftGoals.map((event, index) => {
                const eventIndex = index + 1;
                const selectedRoster = rosterForTeam(event.teamId);
                const minuteId = `${event.key}-minute`;
                const typeId = `${event.key}-type`;
                const teamId = `${event.key}-team`;
                const playerId = `${event.key}-player`;
                const noteId = `${event.key}-note`;
                return (
                  <Row key={event.key} gutter={[8, 8]} align="middle">
                    <Col xs={24} sm={6} md={4}>
                      <label htmlFor={minuteId} style={visuallyHiddenStyle}>
                        {t('matchDetail.reportMinuteLabel', { index: eventIndex })}
                      </label>
                      <InputNumber
                        id={minuteId}
                        min={0}
                        max={150}
                        value={event.minute}
                        aria-label={t('matchDetail.reportMinuteLabel', { index: eventIndex })}
                        style={{ width: '100%' }}
                        onChange={(value) =>
                          updateDraftGoal(event.key, { minute: Number(value ?? 0) })
                        }
                      />
                    </Col>
                    <Col xs={24} sm={9} md={5}>
                      <label htmlFor={typeId} style={visuallyHiddenStyle}>
                        {t('matchDetail.reportTypeLabel', { index: eventIndex })}
                      </label>
                      <Select
                        id={typeId}
                        value={event.type}
                        aria-label={t('matchDetail.reportTypeLabel', { index: eventIndex })}
                        style={{ width: '100%' }}
                        onChange={(value) => updateDraftGoal(event.key, { type: value })}
                        options={SCORING_EVENT_TYPES.map((type) => ({
                          value: type,
                          label: t(`eventType.${type}`),
                        }))}
                      />
                    </Col>
                    <Col xs={24} sm={9} md={5}>
                      <label htmlFor={teamId} style={visuallyHiddenStyle}>
                        {t('matchDetail.reportTeamLabel', { index: eventIndex })}
                      </label>
                      <Select
                        id={teamId}
                        value={event.teamId}
                        placeholder={t('eventFormModal.teamLabel')}
                        aria-label={t('matchDetail.reportTeamLabel', { index: eventIndex })}
                        style={{ width: '100%' }}
                        onChange={(teamId) => updateDraftGoal(event.key, { teamId })}
                        options={teamOptions}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <label htmlFor={playerId} style={visuallyHiddenStyle}>
                        {t('matchDetail.reportPlayerLabel', { index: eventIndex })}
                      </label>
                      <Select
                        id={playerId}
                        allowClear
                        showSearch
                        value={event.playerId}
                        aria-label={t('matchDetail.reportPlayerLabel', { index: eventIndex })}
                        optionFilterProp="label"
                        disabled={!event.teamId}
                        style={{ width: '100%' }}
                        onChange={(playerId) => updateDraftGoal(event.key, { playerId })}
                        options={selectedRoster.map((player) => ({
                          value: player.playerId,
                          label: `${player.fullName}${
                            player.jerseyNumber ? ` #${player.jerseyNumber}` : ''
                          }`,
                        }))}
                      />
                    </Col>
                    <Col xs={20} sm={10} md={3}>
                      <label htmlFor={noteId} style={visuallyHiddenStyle}>
                        {t('matchDetail.reportNoteLabel', { index: eventIndex })}
                      </label>
                      <Input
                        id={noteId}
                        value={event.note}
                        aria-label={t('matchDetail.reportNoteLabel', { index: eventIndex })}
                        placeholder={t('eventFormModal.notePlaceholder')}
                        onChange={(inputEvent) =>
                          updateDraftGoal(event.key, { note: inputEvent.target.value })
                        }
                      />
                    </Col>
                    <Col xs={4} sm={2} md={1}>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        aria-label={t('matchDetail.reportRemoveGoal', { index: eventIndex })}
                        onClick={() => removeDraftGoal(event.key)}
                      />
                    </Col>
                  </Row>
                );
              })}
            </Space>
          </section>

          <section>
            <Text strong>{t('matchDetail.reportDetailsSection')}</Text>
            <Space orientation="vertical" size={10} style={{ width: '100%', marginTop: 10 }}>
              <Select
                allowClear
                showSearch
                value={bestPlayerId}
                placeholder={t('matchDetail.bestPlayerPlaceholder')}
                optionFilterProp="label"
                style={{ width: '100%' }}
                onChange={setBestPlayerId}
                options={playerOptions}
              />
              <Input.TextArea
                rows={3}
                value={technicalStatsText}
                placeholder={t('matchDetail.technicalStatsPlaceholder')}
                onChange={(event) => setTechnicalStatsText(event.target.value)}
              />
              <Input.TextArea
                rows={2}
                value={reportNote}
                placeholder={t('matchDetail.refereeReportNotePlaceholder')}
                onChange={(event) => setReportNote(event.target.value)}
              />
            </Space>
          </section>

          <section>
            <Text strong>{t('matchDetail.reportReviewSection')}</Text>
            <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
              <Text type="secondary">
                {t('matchDetail.reportSummary', { goals: draftGoals.length })}
              </Text>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={submitting}
                onClick={handleSubmit}
              >
                {t('matchDetail.submitRefereeReportBtn')}
              </Button>
            </Flex>
          </section>
        </Space>
      ) : (
        <Text type="secondary">{t('matchDetail.refereeReportReadonly')}</Text>
      )}
    </Card>
  );
}
