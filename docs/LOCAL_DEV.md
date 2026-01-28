# Local Development (Docker Compose)

## Start stack

```bash
docker compose up --build
```

## Services

- **Postgres**: localhost:5432
- **API**: http://localhost:8080
- **Web**: http://localhost:5173

## Stop stack

```bash
docker compose down
```

## Reset database (delete volume)

```bash
docker compose down -v
```

## Troubleshooting

### Port already in use

- **5432**: stop local Postgres
- **8080**: stop any service using 8080
- **5173**: stop any Vite dev server

### DB not ready / API can't connect

Check db health:

```bash
docker ps
docker logs vleague_db
```

### Rebuild clean

```bash
docker compose down
docker compose build --no-cache
docker compose up
```
