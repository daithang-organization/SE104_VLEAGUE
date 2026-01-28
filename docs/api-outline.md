# API Outline (planned)

## Standings
- GET /standings
  - Response (draft):
    - items: { teamId, teamName, played, win, draw, loss, gf, ga, gd, points, rank }[]

## Reports
- GET /reports/scorers
  - Response (draft):
    - items: { playerId, playerName, teamName, goals }[]

- GET /reports/cards
  - Response (draft):
    - items: { playerId, playerName, teamName, yellow, red }[]

- GET /reports/motm
  - Response (draft):
    - items: { matchId, playerId, playerName, teamName, roundNo }[]
