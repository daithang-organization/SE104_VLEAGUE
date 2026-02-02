# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Stadium management module
- Team-Player relationship management
- Auto-calculated standings
- Goals/Events recording in matches

---

## [1.0.0] - 2026-02-02

### Added

#### Authentication & Authorization
- User registration with email/password
- Email verification with OTP (6-digit code)
- Login/Logout functionality
- JWT-based authentication with access & refresh tokens
- Password reset flow via email OTP
- Change password for authenticated users
- OAuth integration (Google, Facebook)
- Session management (view/revoke active sessions)
- Role-based access control (ADMIN, TEAM_MANAGER, REFEREE, SUPERVISOR, PUBLIC)
- Rate limiting on sensitive endpoints

#### Team Management
- List all registered teams
- Team status tracking (ACTIVE/INACTIVE)

#### Player Management
- List all registered players
- Player info: name, date of birth, nationality, position

#### Match Scheduling
- Auto-generate match schedule
- Publish/unpublish schedule
- View schedule with match details
- Add match events (GOAL, YELLOW_CARD, RED_CARD, SUBSTITUTION)

#### Infrastructure & DevOps
- Docker containerization (API, Web, PostgreSQL)
- Docker Compose for local development
- GitHub Actions CI/CD pipeline
- CodeQL security scanning
- Dependabot for dependency updates
- PR labeling automation

#### Documentation
- Swagger/OpenAPI documentation at `/docs`
- Postman collection export
- Comprehensive README with setup instructions
- Architecture documentation
- Contributing guidelines
- Git workflow documentation

### Technical Stack
- **Backend**: NestJS, Prisma, PostgreSQL, TypeScript
- **Frontend**: React 19, Vite, Ant Design, React Router
- **Tools**: pnpm, Docker, GitHub Actions, ESLint, Prettier

---

## [0.1.0] - 2026-01-15

### Added
- Initial project setup
- Monorepo structure with pnpm workspaces
- Basic NestJS API scaffold
- Basic React frontend scaffold
- PostgreSQL database with Prisma ORM
- Docker Compose configuration

[Unreleased]: https://github.com/daithang-organization/SE104_VLEAGUE/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/daithang-organization/SE104_VLEAGUE/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/daithang-organization/SE104_VLEAGUE/releases/tag/v0.1.0
