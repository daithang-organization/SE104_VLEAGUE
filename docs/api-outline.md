# API Outline

## Match
- GET /matches/{id}
  - Response (draft): MatchResponseDto (id, roundNo, kickoffAt, status, teams, score, events[])

- POST /matches/{id}/events
  - Request (draft): { minute, type, playerId?, teamId?, note? }
  - Response (draft): { ok, matchId, createdEvent }
