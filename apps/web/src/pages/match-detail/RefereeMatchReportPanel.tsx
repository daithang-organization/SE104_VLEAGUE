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
  AddMatchEventPayload,
  Match,
  MatchEvent,
  MatchReport,
  RosterPlayer,
  SubmitMatchReportPayload,
} from '../../services/matchApi';
import { calculateReportScore, isScoringEventType } from './refereeMatchReportScore';

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

const REPORT_EVENT_TYPES: AddMatchEventPayload['type'][] = [
  'GOAL',
  'OWN_GOAL',
  'PENALTY',
  'PENALTY_MISS',
  'YELLOW_CARD',
  'RED_CARD',
  'SUBSTITUTION',
];

const GOAL_TYPES = ['NORMAL', 'HEADER', 'FREE_KICK', 'PENALTY_KICK', 'LONG_RANGE'];

type DraftReportEvent = {
  key: string;
  minute: number;
  type: AddMatchEventPayload['type'];
  teamId?: string;
  playerId?: string;
  relatedPlayerId?: string;
  goalType?: string;
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

function eventUsesGoalType(type: AddMatchEventPayload['type']) {
  return type === 'GOAL' || type === 'PENALTY';
}

function eventUsesRelatedPlayer(type: AddMatchEventPayload['type']) {
  return type === 'GOAL' || type === 'PENALTY' || type === 'SUBSTITUTION';
}

function formatEventLabel(match: Match, event: MatchEvent | DraftReportEvent) {
  const teamName = formatTeamName(match, event.teamId);
  const playerId = 'playerId' in event ? event.playerId : undefined;
  const playerName = 'player' in event ? event.player?.fullName : undefined;
  return `${event.minute}' · ${teamName}${playerName || playerId ? ` · ${playerName ?? playerId}` : ''}`;
}

function buildPlayerOptions(roster: RosterPlayer[]) {
  return roster.map((player) => ({
    value: player.playerId,
    label: `${player.fullName}${player.jerseyNumber ? ` #${player.jerseyNumber}` : ''}`,
  }));
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
  const [draftEvents, setDraftEvents] = useState<DraftReportEvent[]>([]);
  const [bestPlayerId, setBestPlayerId] = useState<string>();
  const [technicalStatsText, setTechnicalStatsText] = useState('');
  const [reportNote, setReportNote] = useState('');

  useEffect(() => {
    setBestPlayerId(matchReport?.bestPlayerId ?? undefined);
    setReportNote(matchReport?.note ?? '');
    setTechnicalStatsText(
      matchReport?.technicalStats ? JSON.stringify(matchReport.technicalStats, null, 2) : '',
    );
    setDraftEvents([]);
  }, [match.id, matchReport]);

  const teamOptions = useMemo(
    () => [
      { value: match.homeTeamId, label: match.homeTeam?.name ?? t('scoreModal.homeDefault') },
      { value: match.awayTeamId, label: match.awayTeam?.name ?? t('scoreModal.awayDefault') },
    ],
    [match.awayTeam?.name, match.awayTeamId, match.homeTeam?.name, match.homeTeamId, t],
  );

  const playerOptions = useMemo(
    () => buildPlayerOptions([...homeRoster, ...awayRoster]),
    [awayRoster, homeRoster],
  );

  const savedEvents = useMemo(
    () => (match.events ?? []).map((event) => ({ ...event, teamId: getEventTeamId(event) })),
    [match.events],
  );
  const savedReportEvents = useMemo(
    () => savedEvents.filter((event) => event.source === 'MATCH_REPORT'),
    [savedEvents],
  );

  const savedScoringEvents = useMemo(
    () =>
      savedReportEvents
        .filter((event) => isScoringEventType(event.type))
        .filter((event): event is MatchEvent & { teamId: string } => Boolean(event.teamId)),
    [savedReportEvents],
  );

  const reportScore = useMemo(
    () =>
      calculateReportScore(
        [
          ...savedScoringEvents.map((event) => ({ type: event.type, teamId: event.teamId })),
          ...draftEvents
            .filter((event) => isScoringEventType(event.type))
            .map((event) => ({ type: event.type, teamId: event.teamId })),
        ],
        match,
      ),
    [draftEvents, match, savedScoringEvents],
  );
  const currentScore = {
    home: match.homeScore ?? reportScore.home,
    away: match.awayScore ?? reportScore.away,
  };
  const hasScoreMismatch =
    currentScore.home !== reportScore.home || currentScore.away !== reportScore.away;

  const savedReportEventPayloads = useMemo(
    () =>
      savedReportEvents
        .filter((event): event is MatchEvent & { teamId: string } => Boolean(event.teamId))
        .map((event) => ({
          minute: event.minute,
          type: event.type,
          teamId: event.teamId,
          playerId: event.playerId ?? undefined,
          relatedPlayerId: event.relatedPlayerId ?? undefined,
          goalType: event.goalType ?? undefined,
          note: cleanOptional(event.note ?? undefined),
        })),
    [savedReportEvents],
  );

  const addDraftEvent = () => {
    setDraftEvents((current) => [
      ...current,
      {
        key: `event-${Date.now()}-${current.length}`,
        minute: 0,
        type: 'GOAL',
      },
    ]);
  };

  const updateDraftEvent = (key: string, patch: Partial<DraftReportEvent>) => {
    setDraftEvents((current) =>
      current.map((event) => {
        if (event.key !== key) return event;

        const nextType = patch.type ?? event.type;
        const teamChanged = Boolean(patch.teamId && patch.teamId !== event.teamId);
        return {
          ...event,
          ...patch,
          playerId: teamChanged ? undefined : (patch.playerId ?? event.playerId),
          relatedPlayerId:
            teamChanged || !eventUsesRelatedPlayer(nextType)
              ? undefined
              : (patch.relatedPlayerId ?? event.relatedPlayerId),
          goalType: eventUsesGoalType(nextType) ? (patch.goalType ?? event.goalType) : undefined,
        };
      }),
    );
  };

  const removeDraftEvent = (key: string) => {
    setDraftEvents((current) => current.filter((event) => event.key !== key));
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

  const hasInvalidDraftEvent = draftEvents.some((event) => {
    const selectedRoster = rosterForTeam(event.teamId);
    const needsRosterPlayer = selectedRoster.length > 0;
    const needsRelatedPlayer = event.type === 'SUBSTITUTION' && selectedRoster.length > 0;
    return (
      event.minute < 0 ||
      !event.type ||
      !event.teamId ||
      (needsRosterPlayer && !event.playerId) ||
      (needsRelatedPlayer && !event.relatedPlayerId)
    );
  });

  const handleSubmit = async () => {
    if (hasInvalidDraftEvent) {
      message.error(t('matchDetail.reportInvalidEvent'));
      return;
    }
    if (hasScoreMismatch) {
      message.error(
        t('matchDetail.reportScoreMismatchTitle', {
          expectedHome: currentScore.home,
          expectedAway: currentScore.away,
          eventHome: reportScore.home,
          eventAway: reportScore.away,
        }),
      );
      return;
    }

    const technicalStats = parseTechnicalStats();
    if (technicalStats === null) return;

    await onSubmit({
      homeScore: currentScore.home,
      awayScore: currentScore.away,
      bestPlayerId,
      technicalStats,
      note: cleanOptional(reportNote),
      events: [
        ...savedReportEventPayloads,
        ...draftEvents.map((event) => {
          const payload: AddMatchEventPayload = {
            minute: event.minute,
            type: event.type,
            teamId: event.teamId as string,
            playerId: event.playerId,
            note: cleanOptional(event.note),
          };

          if (eventUsesGoalType(event.type) && event.goalType) {
            payload.goalType = event.goalType;
          }
          if (eventUsesRelatedPlayer(event.type) && event.relatedPlayerId) {
            payload.relatedPlayerId = event.relatedPlayerId;
          }

          return payload;
        }),
      ],
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
            home: currentScore.home,
            away: currentScore.away,
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
              <Text strong>{t('matchDetail.reportEventsSection')}</Text>
              <Tag color="blue">
                {t('matchDetail.reportCalculatedScore', {
                  home: reportScore.home,
                  away: reportScore.away,
                })}
              </Tag>
            </Flex>
            {hasScoreMismatch && (
              <Alert
                style={{ marginTop: 10 }}
                type="warning"
                showIcon
                title={t('matchDetail.reportScoreMismatchTitle', {
                  expectedHome: currentScore.home,
                  expectedAway: currentScore.away,
                  eventHome: reportScore.home,
                  eventAway: reportScore.away,
                })}
                description={t('matchDetail.reportScoreMismatchDescription')}
              />
            )}

            <div style={{ marginTop: 10 }}>
              <Text type="secondary">{t('matchDetail.reportSavedEvents')}</Text>
              <div style={{ marginTop: 6 }}>
                {savedReportEvents.length > 0 ? (
                  <Space wrap>
                    {savedReportEvents.map((event) => (
                      <Tag key={event.id}>
                        {t(`eventType.${event.type}`)} · {formatEventLabel(match, event)}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary">{t('matchDetail.reportNoSavedEvents')}</Text>
                )}
              </div>
            </div>

            <Space orientation="vertical" size={10} style={{ width: '100%', marginTop: 12 }}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
                <Text>{t('matchDetail.reportDraftEvents')}</Text>
                <Button icon={<PlusOutlined />} onClick={addDraftEvent}>
                  {t('matchDetail.reportAddEvent')}
                </Button>
              </Flex>

              {draftEvents.map((event, index) => {
                const eventIndex = index + 1;
                const selectedRoster = rosterForTeam(event.teamId);
                const selectedRosterOptions = buildPlayerOptions(selectedRoster);
                const showGoalType = eventUsesGoalType(event.type);
                const showRelatedPlayer = eventUsesRelatedPlayer(event.type);
                const isSubstitution = event.type === 'SUBSTITUTION';
                const minuteId = `${event.key}-minute`;
                const typeId = `${event.key}-type`;
                const teamId = `${event.key}-team`;
                const playerId = `${event.key}-player`;
                const goalTypeId = `${event.key}-goal-type`;
                const relatedPlayerId = `${event.key}-related-player`;
                const noteId = `${event.key}-note`;
                const playerLabel = isSubstitution
                  ? t('matchDetail.reportSubPlayerInLabel', { index: eventIndex })
                  : t('matchDetail.reportPlayerLabel', { index: eventIndex });
                const relatedPlayerLabel = isSubstitution
                  ? t('matchDetail.reportSubPlayerOutLabel', { index: eventIndex })
                  : t('matchDetail.reportAssistLabel', { index: eventIndex });

                return (
                  <div
                    key={event.key}
                    style={{
                      border: '1px solid var(--ant-color-border-secondary)',
                      borderRadius: 6,
                      padding: 10,
                    }}
                  >
                    <Row gutter={[8, 8]} align="middle">
                      <Col xs={12} sm={6} md={4}>
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
                            updateDraftEvent(event.key, { minute: Number(value ?? 0) })
                          }
                        />
                      </Col>
                      <Col xs={12} sm={9} md={6}>
                        <label htmlFor={typeId} style={visuallyHiddenStyle}>
                          {t('matchDetail.reportTypeLabel', { index: eventIndex })}
                        </label>
                        <Select
                          id={typeId}
                          value={event.type}
                          aria-label={t('matchDetail.reportTypeLabel', { index: eventIndex })}
                          style={{ width: '100%' }}
                          onChange={(type) =>
                            updateDraftEvent(event.key, {
                              type: type as AddMatchEventPayload['type'],
                            })
                          }
                          options={REPORT_EVENT_TYPES.map((type) => ({
                            value: type,
                            label: t(`eventType.${type}`),
                          }))}
                        />
                      </Col>
                      <Col xs={24} sm={9} md={6}>
                        <label htmlFor={teamId} style={visuallyHiddenStyle}>
                          {t('matchDetail.reportTeamLabel', { index: eventIndex })}
                        </label>
                        <Select
                          id={teamId}
                          value={event.teamId}
                          placeholder={t('eventFormModal.teamLabel')}
                          aria-label={t('matchDetail.reportTeamLabel', { index: eventIndex })}
                          style={{ width: '100%' }}
                          onChange={(teamId) => updateDraftEvent(event.key, { teamId })}
                          options={teamOptions}
                        />
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <label htmlFor={playerId} style={visuallyHiddenStyle}>
                          {playerLabel}
                        </label>
                        <Select
                          id={playerId}
                          allowClear
                          showSearch
                          value={event.playerId}
                          aria-label={playerLabel}
                          placeholder={t('eventFormModal.playerPlaceholder')}
                          optionFilterProp="label"
                          disabled={!event.teamId}
                          style={{ width: '100%' }}
                          onChange={(playerId) => updateDraftEvent(event.key, { playerId })}
                          options={selectedRosterOptions}
                        />
                      </Col>
                      {showGoalType && (
                        <Col xs={24} sm={12} md={6}>
                          <label htmlFor={goalTypeId} style={visuallyHiddenStyle}>
                            {t('matchDetail.reportGoalTypeLabel', { index: eventIndex })}
                          </label>
                          <Select
                            id={goalTypeId}
                            allowClear
                            value={event.goalType}
                            aria-label={t('matchDetail.reportGoalTypeLabel', {
                              index: eventIndex,
                            })}
                            placeholder={t('eventFormModal.goalTypePlaceholder')}
                            style={{ width: '100%' }}
                            onChange={(goalType) => updateDraftEvent(event.key, { goalType })}
                            options={GOAL_TYPES.map((goalType) => ({
                              value: goalType,
                              label: t(`goalType.${goalType}`),
                            }))}
                          />
                        </Col>
                      )}
                      {showRelatedPlayer && (
                        <Col xs={24} sm={12} md={6}>
                          <label htmlFor={relatedPlayerId} style={visuallyHiddenStyle}>
                            {relatedPlayerLabel}
                          </label>
                          <Select
                            id={relatedPlayerId}
                            allowClear
                            showSearch
                            value={event.relatedPlayerId}
                            aria-label={relatedPlayerLabel}
                            placeholder={
                              isSubstitution
                                ? t('eventFormModal.subPlayerPlaceholder')
                                : t('eventFormModal.assistPlaceholder')
                            }
                            optionFilterProp="label"
                            disabled={!event.teamId}
                            style={{ width: '100%' }}
                            onChange={(relatedPlayerId) =>
                              updateDraftEvent(event.key, { relatedPlayerId })
                            }
                            options={selectedRosterOptions}
                          />
                        </Col>
                      )}
                      <Col xs={20} sm={showGoalType || showRelatedPlayer ? 10 : 12} md={5}>
                        <label htmlFor={noteId} style={visuallyHiddenStyle}>
                          {t('matchDetail.reportNoteLabel', { index: eventIndex })}
                        </label>
                        <Input
                          id={noteId}
                          value={event.note}
                          aria-label={t('matchDetail.reportNoteLabel', { index: eventIndex })}
                          placeholder={t('eventFormModal.notePlaceholder')}
                          onChange={(inputEvent) =>
                            updateDraftEvent(event.key, { note: inputEvent.target.value })
                          }
                        />
                      </Col>
                      <Col xs={4} sm={2} md={1}>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          aria-label={t('matchDetail.reportRemoveEvent', { index: eventIndex })}
                          onClick={() => removeDraftEvent(event.key)}
                        />
                      </Col>
                    </Row>
                  </div>
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
                {t('matchDetail.reportSummary', { events: draftEvents.length })}
              </Text>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={submitting}
                disabled={hasScoreMismatch}
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
