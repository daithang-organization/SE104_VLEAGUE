--
-- PostgreSQL database dump
--

\restrict O39dCWKBxmsg5t4fRJvuePQ2wqWyYLMfsgAAMNBwdLq5ECYLrw7E3gAVTxdmp71

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_managed_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.teams DROP CONSTRAINT IF EXISTS teams_stadium_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_players DROP CONSTRAINT IF EXISTS team_players_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_players DROP CONSTRAINT IF EXISTS team_players_player_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_manager_requests DROP CONSTRAINT IF EXISTS team_manager_requests_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_manager_requests DROP CONSTRAINT IF EXISTS team_manager_requests_reviewed_by_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_manager_requests DROP CONSTRAINT IF EXISTS team_manager_requests_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_manager_assignments DROP CONSTRAINT IF EXISTS team_manager_assignments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_manager_assignments DROP CONSTRAINT IF EXISTS team_manager_assignments_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_manager_assignments DROP CONSTRAINT IF EXISTS team_manager_assignments_season_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_invitations DROP CONSTRAINT IF EXISTS team_invitations_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_invitations DROP CONSTRAINT IF EXISTS team_invitations_season_id_fkey;
ALTER TABLE IF EXISTS ONLY public.standings DROP CONSTRAINT IF EXISTS standings_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.standings DROP CONSTRAINT IF EXISTS standings_season_id_fkey;
ALTER TABLE IF EXISTS ONLY public.season_teams DROP CONSTRAINT IF EXISTS season_teams_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.season_teams DROP CONSTRAINT IF EXISTS season_teams_season_id_fkey;
ALTER TABLE IF EXISTS ONLY public.regulations DROP CONSTRAINT IF EXISTS regulations_season_id_fkey;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.promotion_candidates DROP CONSTRAINT IF EXISTS promotion_candidates_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.promotion_candidates DROP CONSTRAINT IF EXISTS promotion_candidates_season_id_fkey;
ALTER TABLE IF EXISTS ONLY public.player_suspensions DROP CONSTRAINT IF EXISTS player_suspensions_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.player_suspensions DROP CONSTRAINT IF EXISTS player_suspensions_source_match_id_fkey;
ALTER TABLE IF EXISTS ONLY public.player_suspensions DROP CONSTRAINT IF EXISTS player_suspensions_season_id_fkey;
ALTER TABLE IF EXISTS ONLY public.player_suspensions DROP CONSTRAINT IF EXISTS player_suspensions_player_id_fkey;
ALTER TABLE IF EXISTS ONLY public.player_suspensions DROP CONSTRAINT IF EXISTS player_suspensions_effective_match_id_fkey;
ALTER TABLE IF EXISTS ONLY public.otp_codes DROP CONSTRAINT IF EXISTS otp_codes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS matches_stadium_id_fkey;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS matches_season_id_fkey;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS matches_home_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS matches_away_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_team_registrations DROP CONSTRAINT IF EXISTS match_team_registrations_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_team_registrations DROP CONSTRAINT IF EXISTS match_team_registrations_match_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_reports DROP CONSTRAINT IF EXISTS match_reports_match_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_reports DROP CONSTRAINT IF EXISTS match_reports_best_player_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_official_assignments DROP CONSTRAINT IF EXISTS match_official_assignments_official_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_official_assignments DROP CONSTRAINT IF EXISTS match_official_assignments_match_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_lineup_players DROP CONSTRAINT IF EXISTS match_lineup_players_registration_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_lineup_players DROP CONSTRAINT IF EXISTS match_lineup_players_player_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_events DROP CONSTRAINT IF EXISTS match_events_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_events DROP CONSTRAINT IF EXISTS match_events_related_player_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_events DROP CONSTRAINT IF EXISTS match_events_player_id_fkey;
ALTER TABLE IF EXISTS ONLY public.match_events DROP CONSTRAINT IF EXISTS match_events_match_id_fkey;
ALTER TABLE IF EXISTS ONLY public.manager_stadium_requests DROP CONSTRAINT IF EXISTS manager_stadium_requests_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.manager_stadium_requests DROP CONSTRAINT IF EXISTS manager_stadium_requests_stadium_id_fkey;
ALTER TABLE IF EXISTS ONLY public.manager_stadium_requests DROP CONSTRAINT IF EXISTS manager_stadium_requests_reviewed_by_id_fkey;
ALTER TABLE IF EXISTS ONLY public.manager_stadium_requests DROP CONSTRAINT IF EXISTS manager_stadium_requests_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.manager_player_requests DROP CONSTRAINT IF EXISTS manager_player_requests_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.manager_player_requests DROP CONSTRAINT IF EXISTS manager_player_requests_reviewed_by_id_fkey;
ALTER TABLE IF EXISTS ONLY public.manager_player_requests DROP CONSTRAINT IF EXISTS manager_player_requests_player_id_fkey;
ALTER TABLE IF EXISTS ONLY public.manager_player_requests DROP CONSTRAINT IF EXISTS manager_player_requests_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.draw_lot_results DROP CONSTRAINT IF EXISTS draw_lot_results_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.draw_lot_results DROP CONSTRAINT IF EXISTS draw_lot_results_season_id_fkey;
ALTER TABLE IF EXISTS ONLY public.discipline_reports DROP CONSTRAINT IF EXISTS discipline_reports_supervisor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.discipline_reports DROP CONSTRAINT IF EXISTS discipline_reports_match_id_fkey;
DROP INDEX IF EXISTS public.users_role_id_idx;
DROP INDEX IF EXISTS public.users_managed_team_id_idx;
DROP INDEX IF EXISTS public.users_google_id_key;
DROP INDEX IF EXISTS public.users_facebook_id_key;
DROP INDEX IF EXISTS public.users_email_key;
DROP INDEX IF EXISTS public.teams_name_key;
DROP INDEX IF EXISTS public.team_players_team_id_player_id_joined_at_key;
DROP INDEX IF EXISTS public.team_players_team_id_idx;
DROP INDEX IF EXISTS public.team_players_player_id_idx;
DROP INDEX IF EXISTS public.team_manager_requests_team_id_idx;
DROP INDEX IF EXISTS public.team_manager_requests_status_idx;
DROP INDEX IF EXISTS public.team_manager_requests_reviewed_by_id_idx;
DROP INDEX IF EXISTS public.team_manager_requests_request_type_idx;
DROP INDEX IF EXISTS public.team_manager_requests_one_pending_per_manager_idx;
DROP INDEX IF EXISTS public.team_manager_requests_one_pending_claim_per_team_idx;
DROP INDEX IF EXISTS public.team_manager_requests_manager_id_idx;
DROP INDEX IF EXISTS public.team_manager_assignments_user_id_season_id_key;
DROP INDEX IF EXISTS public.team_manager_assignments_team_id_idx;
DROP INDEX IF EXISTS public.team_manager_assignments_season_id_idx;
DROP INDEX IF EXISTS public.team_invitations_team_id_idx;
DROP INDEX IF EXISTS public.team_invitations_status_idx;
DROP INDEX IF EXISTS public.team_invitations_season_id_team_id_key;
DROP INDEX IF EXISTS public.team_invitations_season_id_idx;
DROP INDEX IF EXISTS public.team_invitations_deadline_at_idx;
DROP INDEX IF EXISTS public.standings_season_id_team_id_key;
DROP INDEX IF EXISTS public.standings_season_id_idx;
DROP INDEX IF EXISTS public.stadiums_name_key;
DROP INDEX IF EXISTS public.seasons_name_key;
DROP INDEX IF EXISTS public.season_teams_team_id_idx;
DROP INDEX IF EXISTS public.season_teams_season_id_team_id_key;
DROP INDEX IF EXISTS public.season_teams_season_id_idx;
DROP INDEX IF EXISTS public.roles_name_key;
DROP INDEX IF EXISTS public.regulations_season_id_key_key;
DROP INDEX IF EXISTS public.regulations_season_id_idx;
DROP INDEX IF EXISTS public.refresh_tokens_user_id_idx;
DROP INDEX IF EXISTS public.refresh_tokens_token_hash_key;
DROP INDEX IF EXISTS public.promotion_candidates_status_idx;
DROP INDEX IF EXISTS public.promotion_candidates_season_id_team_id_key;
DROP INDEX IF EXISTS public.promotion_candidates_season_id_rank_key;
DROP INDEX IF EXISTS public.promotion_candidates_season_id_idx;
DROP INDEX IF EXISTS public.players_position_idx;
DROP INDEX IF EXISTS public.players_player_type_idx;
DROP INDEX IF EXISTS public.players_nationality_idx;
DROP INDEX IF EXISTS public.players_full_name_idx;
DROP INDEX IF EXISTS public.player_suspensions_team_id_idx;
DROP INDEX IF EXISTS public.player_suspensions_status_idx;
DROP INDEX IF EXISTS public.player_suspensions_season_id_idx;
DROP INDEX IF EXISTS public.player_suspensions_player_id_source_match_id_effective_matc_key;
DROP INDEX IF EXISTS public.player_suspensions_effective_match_id_idx;
DROP INDEX IF EXISTS public.otp_codes_user_id_idx;
DROP INDEX IF EXISTS public.otp_codes_code_type_idx;
DROP INDEX IF EXISTS public.officials_status_idx;
DROP INDEX IF EXISTS public.notifications_user_id_idx;
DROP INDEX IF EXISTS public.notifications_type_idx;
DROP INDEX IF EXISTS public.notifications_created_at_idx;
DROP INDEX IF EXISTS public.matches_status_idx;
DROP INDEX IF EXISTS public.matches_season_id_round_no_idx;
DROP INDEX IF EXISTS public.matches_season_id_idx;
DROP INDEX IF EXISTS public.matches_round_no_idx;
DROP INDEX IF EXISTS public.matches_kickoff_at_idx;
DROP INDEX IF EXISTS public.matches_home_team_id_idx;
DROP INDEX IF EXISTS public.matches_away_team_id_idx;
DROP INDEX IF EXISTS public.match_team_registrations_team_id_idx;
DROP INDEX IF EXISTS public.match_team_registrations_status_idx;
DROP INDEX IF EXISTS public.match_team_registrations_match_id_team_id_key;
DROP INDEX IF EXISTS public.match_team_registrations_match_id_idx;
DROP INDEX IF EXISTS public.match_reports_submitted_by_user_id_idx;
DROP INDEX IF EXISTS public.match_reports_match_id_key;
DROP INDEX IF EXISTS public.match_reports_best_player_id_idx;
DROP INDEX IF EXISTS public.match_official_assignments_role_idx;
DROP INDEX IF EXISTS public.match_official_assignments_official_id_idx;
DROP INDEX IF EXISTS public.match_official_assignments_match_id_official_id_role_key;
DROP INDEX IF EXISTS public.match_official_assignments_match_id_idx;
DROP INDEX IF EXISTS public.match_lineup_players_role_idx;
DROP INDEX IF EXISTS public.match_lineup_players_registration_id_player_id_key;
DROP INDEX IF EXISTS public.match_lineup_players_player_id_idx;
DROP INDEX IF EXISTS public.match_events_type_idx;
DROP INDEX IF EXISTS public.match_events_team_id_idx;
DROP INDEX IF EXISTS public.match_events_player_id_idx;
DROP INDEX IF EXISTS public.match_events_match_id_source_idx;
DROP INDEX IF EXISTS public.match_events_match_id_idx;
DROP INDEX IF EXISTS public.manager_stadium_requests_team_id_idx;
DROP INDEX IF EXISTS public.manager_stadium_requests_status_idx;
DROP INDEX IF EXISTS public.manager_stadium_requests_stadium_id_idx;
DROP INDEX IF EXISTS public.manager_stadium_requests_reviewed_by_id_idx;
DROP INDEX IF EXISTS public.manager_stadium_requests_request_type_idx;
DROP INDEX IF EXISTS public.manager_stadium_requests_one_pending_per_team_idx;
DROP INDEX IF EXISTS public.manager_stadium_requests_manager_id_idx;
DROP INDEX IF EXISTS public.manager_player_requests_team_id_idx;
DROP INDEX IF EXISTS public.manager_player_requests_status_idx;
DROP INDEX IF EXISTS public.manager_player_requests_reviewed_by_id_idx;
DROP INDEX IF EXISTS public.manager_player_requests_request_type_idx;
DROP INDEX IF EXISTS public.manager_player_requests_player_id_idx;
DROP INDEX IF EXISTS public.manager_player_requests_one_pending_per_player_idx;
DROP INDEX IF EXISTS public.manager_player_requests_manager_id_idx;
DROP INDEX IF EXISTS public.draw_lot_results_season_id_team_id_key;
DROP INDEX IF EXISTS public.draw_lot_results_season_id_idx;
DROP INDEX IF EXISTS public.discipline_reports_supervisor_id_idx;
DROP INDEX IF EXISTS public.discipline_reports_match_id_key;
DROP INDEX IF EXISTS public.audit_logs_user_id_idx;
DROP INDEX IF EXISTS public.audit_logs_entity_idx;
DROP INDEX IF EXISTS public.audit_logs_created_at_idx;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.teams DROP CONSTRAINT IF EXISTS teams_pkey;
ALTER TABLE IF EXISTS ONLY public.team_players DROP CONSTRAINT IF EXISTS team_players_pkey;
ALTER TABLE IF EXISTS ONLY public.team_manager_requests DROP CONSTRAINT IF EXISTS team_manager_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.team_manager_assignments DROP CONSTRAINT IF EXISTS team_manager_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.team_invitations DROP CONSTRAINT IF EXISTS team_invitations_pkey;
ALTER TABLE IF EXISTS ONLY public.standings DROP CONSTRAINT IF EXISTS standings_pkey;
ALTER TABLE IF EXISTS ONLY public.stadiums DROP CONSTRAINT IF EXISTS stadiums_pkey;
ALTER TABLE IF EXISTS ONLY public.seasons DROP CONSTRAINT IF EXISTS seasons_pkey;
ALTER TABLE IF EXISTS ONLY public.season_teams DROP CONSTRAINT IF EXISTS season_teams_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.regulations DROP CONSTRAINT IF EXISTS regulations_pkey;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.promotion_candidates DROP CONSTRAINT IF EXISTS promotion_candidates_pkey;
ALTER TABLE IF EXISTS ONLY public.players DROP CONSTRAINT IF EXISTS players_pkey;
ALTER TABLE IF EXISTS ONLY public.player_suspensions DROP CONSTRAINT IF EXISTS player_suspensions_pkey;
ALTER TABLE IF EXISTS ONLY public.otp_codes DROP CONSTRAINT IF EXISTS otp_codes_pkey;
ALTER TABLE IF EXISTS ONLY public.officials DROP CONSTRAINT IF EXISTS officials_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS matches_pkey;
ALTER TABLE IF EXISTS ONLY public.match_team_registrations DROP CONSTRAINT IF EXISTS match_team_registrations_pkey;
ALTER TABLE IF EXISTS ONLY public.match_reports DROP CONSTRAINT IF EXISTS match_reports_pkey;
ALTER TABLE IF EXISTS ONLY public.match_official_assignments DROP CONSTRAINT IF EXISTS match_official_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.match_lineup_players DROP CONSTRAINT IF EXISTS match_lineup_players_pkey;
ALTER TABLE IF EXISTS ONLY public.match_events DROP CONSTRAINT IF EXISTS match_events_pkey;
ALTER TABLE IF EXISTS ONLY public.manager_stadium_requests DROP CONSTRAINT IF EXISTS manager_stadium_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.manager_player_requests DROP CONSTRAINT IF EXISTS manager_player_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.draw_lot_results DROP CONSTRAINT IF EXISTS draw_lot_results_pkey;
ALTER TABLE IF EXISTS ONLY public.discipline_reports DROP CONSTRAINT IF EXISTS discipline_reports_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.teams;
DROP TABLE IF EXISTS public.team_players;
DROP TABLE IF EXISTS public.team_manager_requests;
DROP TABLE IF EXISTS public.team_manager_assignments;
DROP TABLE IF EXISTS public.team_invitations;
DROP TABLE IF EXISTS public.standings;
DROP TABLE IF EXISTS public.stadiums;
DROP TABLE IF EXISTS public.seasons;
DROP TABLE IF EXISTS public.season_teams;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.regulations;
DROP TABLE IF EXISTS public.refresh_tokens;
DROP TABLE IF EXISTS public.promotion_candidates;
DROP TABLE IF EXISTS public.players;
DROP TABLE IF EXISTS public.player_suspensions;
DROP TABLE IF EXISTS public.otp_codes;
DROP TABLE IF EXISTS public.officials;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.matches;
DROP TABLE IF EXISTS public.match_team_registrations;
DROP TABLE IF EXISTS public.match_reports;
DROP TABLE IF EXISTS public.match_official_assignments;
DROP TABLE IF EXISTS public.match_lineup_players;
DROP TABLE IF EXISTS public.match_events;
DROP TABLE IF EXISTS public.manager_stadium_requests;
DROP TABLE IF EXISTS public.manager_player_requests;
DROP TABLE IF EXISTS public.draw_lot_results;
DROP TABLE IF EXISTS public.discipline_reports;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TYPE IF EXISTS public."UserRole";
DROP TYPE IF EXISTS public."TeamStatus";
DROP TYPE IF EXISTS public."TeamManagerRequestType";
DROP TYPE IF EXISTS public."TeamManagerRequestStatus";
DROP TYPE IF EXISTS public."TeamInvitationStatus";
DROP TYPE IF EXISTS public."TeamInvitationSourceType";
DROP TYPE IF EXISTS public."SeasonTeamStatus";
DROP TYPE IF EXISTS public."SeasonStatus";
DROP TYPE IF EXISTS public."PromotionQualificationType";
DROP TYPE IF EXISTS public."PromotionCandidateStatus";
DROP TYPE IF EXISTS public."PlayerType";
DROP TYPE IF EXISTS public."PlayerSuspensionStatus";
DROP TYPE IF EXISTS public."PlayerPosition";
DROP TYPE IF EXISTS public."OtpType";
DROP TYPE IF EXISTS public."OfficialStatus";
DROP TYPE IF EXISTS public."MatchStatus";
DROP TYPE IF EXISTS public."MatchScoreSource";
DROP TYPE IF EXISTS public."MatchOfficialRole";
DROP TYPE IF EXISTS public."MatchLineupStatus";
DROP TYPE IF EXISTS public."MatchLineupRole";
DROP TYPE IF EXISTS public."MatchKitType";
DROP TYPE IF EXISTS public."ManagerStadiumRequestType";
DROP TYPE IF EXISTS public."ManagerRequestStatus";
DROP TYPE IF EXISTS public."ManagerPlayerRequestType";
DROP TYPE IF EXISTS public."EventType";
--
-- Name: EventType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EventType" AS ENUM (
    'GOAL',
    'OWN_GOAL',
    'YELLOW_CARD',
    'RED_CARD',
    'SUBSTITUTION',
    'PENALTY',
    'PENALTY_MISS'
);


--
-- Name: ManagerPlayerRequestType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ManagerPlayerRequestType" AS ENUM (
    'ADD_PLAYER',
    'UPDATE_PLAYER',
    'REMOVE_FROM_TEAM'
);


--
-- Name: ManagerRequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ManagerRequestStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: ManagerStadiumRequestType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ManagerStadiumRequestType" AS ENUM (
    'CREATE_HOME_STADIUM',
    'UPDATE_HOME_STADIUM',
    'REMOVE_HOME_STADIUM'
);


--
-- Name: MatchKitType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MatchKitType" AS ENUM (
    'PRIMARY',
    'BACKUP'
);


--
-- Name: MatchLineupRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MatchLineupRole" AS ENUM (
    'STARTER',
    'SUBSTITUTE'
);


--
-- Name: MatchLineupStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MatchLineupStatus" AS ENUM (
    'SUBMITTED',
    'APPROVED',
    'REJECTED'
);


--
-- Name: MatchOfficialRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MatchOfficialRole" AS ENUM (
    'MAIN_REFEREE',
    'ASSISTANT_REFEREE',
    'FOURTH_OFFICIAL',
    'SUPERVISOR'
);


--
-- Name: MatchScoreSource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MatchScoreSource" AS ENUM (
    'ADMIN',
    'REFEREE'
);


--
-- Name: MatchStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MatchStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'LOCKED',
    'FINISHED',
    'POSTPONED'
);


--
-- Name: OfficialStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OfficialStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


--
-- Name: OtpType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OtpType" AS ENUM (
    'EMAIL_VERIFICATION',
    'PASSWORD_RESET'
);


--
-- Name: PlayerPosition; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PlayerPosition" AS ENUM (
    'GK',
    'DF',
    'MF',
    'FW'
);


--
-- Name: PlayerSuspensionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PlayerSuspensionStatus" AS ENUM (
    'ACTIVE',
    'SERVED',
    'CANCELLED'
);


--
-- Name: PlayerType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PlayerType" AS ENUM (
    'DOMESTIC',
    'FOREIGN'
);


--
-- Name: PromotionCandidateStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PromotionCandidateStatus" AS ENUM (
    'ELIGIBLE',
    'INVITED',
    'ACCEPTED',
    'DECLINED',
    'SKIPPED'
);


--
-- Name: PromotionQualificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PromotionQualificationType" AS ENUM (
    'CHAMPION',
    'RUNNER_UP',
    'PLAYOFF',
    'REPLACEMENT_POOL'
);


--
-- Name: SeasonStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SeasonStatus" AS ENUM (
    'UPCOMING',
    'IN_PROGRESS',
    'COMPLETED'
);


--
-- Name: SeasonTeamStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SeasonTeamStatus" AS ENUM (
    'REGISTERED',
    'APPROVED',
    'REJECTED',
    'WITHDRAWN'
);


--
-- Name: TeamInvitationSourceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TeamInvitationSourceType" AS ENUM (
    'PREVIOUS_TOP_8',
    'PROMOTED',
    'REPLACEMENT'
);


--
-- Name: TeamInvitationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TeamInvitationStatus" AS ENUM (
    'SENT',
    'ACCEPTED',
    'DECLINED',
    'EXPIRED'
);


--
-- Name: TeamManagerRequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TeamManagerRequestStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: TeamManagerRequestType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TeamManagerRequestType" AS ENUM (
    'CREATE_TEAM',
    'CLAIM_EXISTING_TEAM',
    'UPDATE_MANAGED_TEAM',
    'DELETE_MANAGED_TEAM'
);


--
-- Name: TeamStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TeamStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'TEAM_MANAGER',
    'REFEREE',
    'SUPERVISOR',
    'PUBLIC'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    user_id uuid,
    user_email text,
    action text NOT NULL,
    entity text NOT NULL,
    entity_id text,
    old_value text,
    new_value text,
    ip_address text,
    user_agent text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: discipline_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discipline_reports (
    id uuid NOT NULL,
    match_id uuid NOT NULL,
    supervisor_id uuid NOT NULL,
    organization_rating text NOT NULL,
    referee_issues text,
    player_issues text,
    organizer_issues text,
    notes text,
    sent_to_disciplinary_at timestamp(3) without time zone,
    submitted_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: draw_lot_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.draw_lot_results (
    id uuid NOT NULL,
    season_id uuid NOT NULL,
    team_id uuid NOT NULL,
    resolved_rank integer NOT NULL,
    note text,
    resolved_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved_by text,
    confirmed boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: manager_player_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manager_player_requests (
    id uuid NOT NULL,
    manager_id uuid NOT NULL,
    team_id uuid NOT NULL,
    player_id uuid,
    request_type public."ManagerPlayerRequestType" NOT NULL,
    status public."ManagerRequestStatus" DEFAULT 'PENDING'::public."ManagerRequestStatus" NOT NULL,
    payload jsonb NOT NULL,
    request_note text,
    admin_note text,
    reviewed_by_id uuid,
    reviewed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: manager_stadium_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manager_stadium_requests (
    id uuid NOT NULL,
    manager_id uuid NOT NULL,
    team_id uuid NOT NULL,
    stadium_id uuid,
    request_type public."ManagerStadiumRequestType" NOT NULL,
    status public."ManagerRequestStatus" DEFAULT 'PENDING'::public."ManagerRequestStatus" NOT NULL,
    payload jsonb NOT NULL,
    request_note text,
    admin_note text,
    reviewed_by_id uuid,
    reviewed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: match_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_events (
    id uuid NOT NULL,
    match_id uuid NOT NULL,
    minute integer NOT NULL,
    type public."EventType" NOT NULL,
    goal_type text,
    player_id uuid,
    related_player_id uuid,
    team_id uuid,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    source text DEFAULT 'MANUAL'::text NOT NULL
);


--
-- Name: match_lineup_players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_lineup_players (
    id uuid NOT NULL,
    registration_id uuid NOT NULL,
    player_id uuid NOT NULL,
    role public."MatchLineupRole" NOT NULL,
    "position" public."PlayerPosition",
    shirt_number integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: match_official_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_official_assignments (
    id uuid NOT NULL,
    match_id uuid NOT NULL,
    official_id uuid NOT NULL,
    role public."MatchOfficialRole" NOT NULL,
    published_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: match_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_reports (
    id uuid NOT NULL,
    match_id uuid NOT NULL,
    submitted_by_user_id uuid,
    home_score integer NOT NULL,
    away_score integer NOT NULL,
    best_player_id uuid,
    technical_stats jsonb,
    note text,
    submitted_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: match_team_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match_team_registrations (
    id uuid NOT NULL,
    match_id uuid NOT NULL,
    team_id uuid NOT NULL,
    kit_type public."MatchKitType" DEFAULT 'PRIMARY'::public."MatchKitType" NOT NULL,
    formation text NOT NULL,
    status public."MatchLineupStatus" DEFAULT 'SUBMITTED'::public."MatchLineupStatus" NOT NULL,
    submitted_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reviewed_at timestamp(3) without time zone,
    review_note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matches (
    id uuid NOT NULL,
    round_no integer NOT NULL,
    home_team_id uuid NOT NULL,
    away_team_id uuid NOT NULL,
    stadium_id uuid,
    kickoff_at timestamp(3) without time zone,
    status public."MatchStatus" DEFAULT 'DRAFT'::public."MatchStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    away_score integer,
    home_score integer,
    leg integer DEFAULT 1 NOT NULL,
    season_id uuid,
    score_source public."MatchScoreSource"
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    user_id uuid,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    entity_type text,
    entity_id text,
    read_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: officials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.officials (
    id uuid NOT NULL,
    full_name text NOT NULL,
    email text,
    phone text,
    status public."OfficialStatus" DEFAULT 'ACTIVE'::public."OfficialStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: otp_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp_codes (
    id uuid NOT NULL,
    code text NOT NULL,
    type public."OtpType" NOT NULL,
    user_id uuid NOT NULL,
    used_at timestamp(3) without time zone,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: player_suspensions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.player_suspensions (
    id uuid NOT NULL,
    player_id uuid NOT NULL,
    team_id uuid NOT NULL,
    season_id uuid NOT NULL,
    source_match_id uuid NOT NULL,
    effective_match_id uuid NOT NULL,
    reason text NOT NULL,
    status public."PlayerSuspensionStatus" DEFAULT 'ACTIVE'::public."PlayerSuspensionStatus" NOT NULL,
    served_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.players (
    id uuid NOT NULL,
    full_name text NOT NULL,
    dob timestamp(3) without time zone NOT NULL,
    nationality text NOT NULL,
    "position" public."PlayerPosition" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    birth_place text,
    height_cm integer,
    player_type public."PlayerType" DEFAULT 'DOMESTIC'::public."PlayerType" NOT NULL,
    weight_kg integer,
    career_summary text
);


--
-- Name: promotion_candidates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion_candidates (
    id uuid NOT NULL,
    season_id uuid NOT NULL,
    team_id uuid NOT NULL,
    rank integer NOT NULL,
    source_competition text NOT NULL,
    qualification_type public."PromotionQualificationType" DEFAULT 'RUNNER_UP'::public."PromotionQualificationType" NOT NULL,
    status public."PromotionCandidateStatus" DEFAULT 'ELIGIBLE'::public."PromotionCandidateStatus" NOT NULL,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id uuid NOT NULL,
    token_hash text NOT NULL,
    user_id uuid NOT NULL,
    revoked_at timestamp(3) without time zone,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    device_name text,
    ip_address text,
    last_used_at timestamp(3) without time zone,
    user_agent text
);


--
-- Name: regulations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regulations (
    id uuid NOT NULL,
    season_id uuid NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    value_type text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: season_teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.season_teams (
    id uuid NOT NULL,
    season_id uuid NOT NULL,
    team_id uuid NOT NULL,
    status public."SeasonTeamStatus" DEFAULT 'REGISTERED'::public."SeasonTeamStatus" NOT NULL,
    registered_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approved_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    owner_name text,
    owner_country text,
    owner_address text,
    team_introduction text,
    primary_kit text,
    backup_kit text,
    participation_fee_paid boolean DEFAULT false NOT NULL,
    fee_paid_at timestamp(3) without time zone,
    fee_receipt_code text,
    external_competition_schedule text,
    application_submitted_at timestamp(3) without time zone,
    application_review_note text,
    fee_receipt_url text
);


--
-- Name: seasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seasons (
    id uuid NOT NULL,
    name text NOT NULL,
    year integer NOT NULL,
    status public."SeasonStatus" DEFAULT 'UPCOMING'::public."SeasonStatus" NOT NULL,
    start_date timestamp(3) without time zone,
    end_date timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: stadiums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stadiums (
    id uuid NOT NULL,
    name text NOT NULL,
    address text,
    city text NOT NULL,
    capacity integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    country text DEFAULT 'Việt Nam'::text NOT NULL,
    fifa_stars integer
);


--
-- Name: standings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.standings (
    id uuid NOT NULL,
    season_id uuid NOT NULL,
    team_id uuid NOT NULL,
    played integer DEFAULT 0 NOT NULL,
    win integer DEFAULT 0 NOT NULL,
    draw integer DEFAULT 0 NOT NULL,
    loss integer DEFAULT 0 NOT NULL,
    goals_for integer DEFAULT 0 NOT NULL,
    goals_against integer DEFAULT 0 NOT NULL,
    goal_diff integer DEFAULT 0 NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    rank integer,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: team_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_invitations (
    id uuid NOT NULL,
    season_id uuid NOT NULL,
    team_id uuid NOT NULL,
    source_type public."TeamInvitationSourceType" NOT NULL,
    status public."TeamInvitationStatus" DEFAULT 'SENT'::public."TeamInvitationStatus" NOT NULL,
    sent_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deadline_at timestamp(3) without time zone NOT NULL,
    response_at timestamp(3) without time zone,
    response_reason text,
    regulations_snapshot jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    promotion_note text
);


--
-- Name: team_manager_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_manager_assignments (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    season_id uuid NOT NULL,
    team_id uuid NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: team_manager_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_manager_requests (
    id uuid NOT NULL,
    manager_id uuid NOT NULL,
    request_type public."TeamManagerRequestType" NOT NULL,
    status public."TeamManagerRequestStatus" DEFAULT 'PENDING'::public."TeamManagerRequestStatus" NOT NULL,
    team_id uuid,
    proposed_team_name text,
    proposed_team_short_name text,
    proposed_team_city text,
    proposed_team_logo_url text,
    proposed_stadium_id uuid,
    request_note text,
    admin_note text,
    reviewed_by_id uuid,
    reviewed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    proposed_team_status public."TeamStatus",
    proposed_coach_name text
);


--
-- Name: team_players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_players (
    id uuid NOT NULL,
    team_id uuid NOT NULL,
    player_id uuid NOT NULL,
    jersey_number integer,
    joined_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    left_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id uuid NOT NULL,
    name text NOT NULL,
    status public."TeamStatus" DEFAULT 'ACTIVE'::public."TeamStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    city text,
    logo_url text,
    short_name text,
    stadium_id uuid,
    coach_name text
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    password_hash text,
    role public."UserRole" DEFAULT 'PUBLIC'::public."UserRole" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    avatar_url text,
    google_id text,
    name text,
    facebook_id text,
    role_id uuid,
    managed_team_id uuid
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
bde7d42f-a018-4748-965f-f53efb775d44	43b122bbf6ffd287857d796acd55a542a4d266c5b20b057ae656b2518878a1a0	2026-06-02 11:15:11.912121+00	20260529021040_test	\N	\N	2026-06-02 11:15:11.876636+00	1
a1ebca7b-a44a-4f9c-8d76-e8680b1848f1	1b2b1fc958fa5db9d388125a2137cb8195847b8d0b4cf90a60e26c78badfd168	2026-06-02 11:15:04.63727+00	20260128113243_init_registration	\N	\N	2026-06-02 11:15:04.472075+00	1
bd813dcc-3d36-4870-a7d9-b043b94b6581	65f1a850e73b06a2ff1a6a0ccb7ad3b1d95aba3cd83b317c66db7708d452e519	2026-06-02 11:15:09.784513+00	20260313024832	\N	\N	2026-06-02 11:15:09.617138+00	1
13040fc9-619f-42a7-9f41-644645236678	d9768e64c5672c58473812d2b4311a65bfed40ff1d41039c8de858ad016b7af4	2026-06-02 11:15:04.735167+00	20260128145248_init_matches	\N	\N	2026-06-02 11:15:04.64934+00	1
53128733-06b4-47f9-abb5-72e81b61137d	e4a6f3d68a9dcf818d87e612e7bc73a29e77b277394efcee9d3ae01999c34e80	2026-06-02 11:15:04.942677+00	20260129180318_add_auth_models	\N	\N	2026-06-02 11:15:04.746151+00	1
5b4b655c-2045-407a-a3fa-2034cefb93fd	2bd0fbf2612c9d2682c81d5b4414b9f88de7a0f21e1ee39660685edd2b4b8cd3	2026-06-02 11:15:11.231944+00	20260528101645_add_promotion_note_to_invitation	\N	\N	2026-06-02 11:15:11.221287+00	1
73fa866d-f964-4c0d-af32-63bdfda50232	e38735998f9564854fbab18d95807a4ff3d2f45431b5a1c331a316527951eb98	2026-06-02 11:15:05.052248+00	20260130113531_add_team_manager_referee_roles	\N	\N	2026-06-02 11:15:04.954182+00	1
b96c5f8a-4638-4308-a2ec-ee669a941df4	3a885f7b2fa530b2ca9ecd548ba644d2fdb8eef453835ec129b2d66fa5f45439	2026-06-02 11:15:09.921037+00	20260521000100_add_team_manager_assignments	\N	\N	2026-06-02 11:15:09.795819+00	1
c5031aad-4819-46d8-a5a1-ac025170bb53	bf9bfdbc6d88869398fe37f765a6044bf577e452cf8d351acd781cd8a9f3450c	2026-06-02 11:15:05.177385+00	20260130140141_add_roles_table	\N	\N	2026-06-02 11:15:05.062847+00	1
9b96c30c-c4e2-4bbb-90b7-bdded906ec4f	e8492a2981bc1a1998a415d22b7cbb5c1156a8d5fae2b910527162c58382cdaa	2026-06-02 11:15:05.384766+00	20260131024859_add_otp_and_email_verification	\N	\N	2026-06-02 11:15:05.188401+00	1
bf161b12-6628-41fa-a2b7-ca1d56c5dae3	e9f717e85142594f3581cb223d0889ebc5349c7425693268597cd7c04648e000	2026-06-02 11:15:05.461176+00	20260131035924_add_session_profile_oauth	\N	\N	2026-06-02 11:15:05.394727+00	1
c81e10aa-5aa4-4d94-adc9-f393418f66a5	7b2c6db62366f1e8805fcf0a5e137425293beee1a869b152db33fa065825c622	2026-06-02 11:15:09.967036+00	20260527000100_add_stadium_eligibility_fields	\N	\N	2026-06-02 11:15:09.932232+00	1
742473fe-9d4b-4040-9c7e-c327c2b656ef	7c1a6eadac2baa4945f51ac6bee15b6f4d1469bbeaedf54e857e22c8e2783ced	2026-06-02 11:15:05.934058+00	20260204160153_add_season_stadium_roster_models	\N	\N	2026-06-02 11:15:05.471697+00	1
e303c4b1-fa02-4a50-a42c-85bb6d90449a	04a0239dcf001ea9e484172e8924c184460e2c66f422c85ef32fda968506b685	2026-06-02 11:15:06.369576+00	20260207045930_add_indexes	\N	\N	2026-06-02 11:15:05.937182+00	1
1d940457-b4d7-47d5-919e-c091930c4429	974c68472c2340abf90115d1a7e18bc0ced51f4cf2a5eb0b2489e65210b133e2	2026-06-02 11:15:06.76801+00	20260211054053_add_regulations_season_teams_standings	\N	\N	2026-06-02 11:15:06.374546+00	1
462985ba-6387-4e6e-a81f-ba60a7fe8569	7047f8bbd520a8cac88f7e3a7338ce9147c66d97b56dc2672f4a2c64fa7cec7d	2026-06-02 11:15:10.120206+00	20260527000200_add_team_invitations	\N	\N	2026-06-02 11:15:09.969962+00	1
7d601f64-b49e-403e-b88f-ff795554af01	edba40a610ba41e1a66fe4a9572f20029b716a5f4625e8496913eff723b29dbe	2026-06-02 11:15:09.563648+00	20260211055049_convert_text_to_uuid	\N	\N	2026-06-02 11:15:06.772351+00	1
7c536bc6-3b29-46c4-93c5-b4edea40fc45	6a3f43a6fa0ab2665f9c26eadf20c8dfce9311bd23fb5af0bd457d88893391e5	2026-06-02 11:15:09.581233+00	20260211055859_add_role_id_to_users	\N	\N	2026-06-02 11:15:09.566093+00	1
963368d0-55b1-47b7-8031-8cb0a92a9552	33d46ce300086d9dd3bf3b5402156276c23df7f948cadbec63122314bc15eabc	2026-06-02 11:15:11.325401+00	20260528105130_add_draw_lot_results	\N	\N	2026-06-02 11:15:11.237507+00	1
9ce12fa0-e973-443a-99ab-2171a1578e1f	0fa9fa6a95d7718f4296fd729668bea92b75f1c79ec52aedc7c44d2055870290	2026-06-02 11:15:09.604487+00	20260218085333_add_penalty_event_types	\N	\N	2026-06-02 11:15:09.583425+00	1
1fbe9b4a-4ac8-4dbb-b03b-3ebb12aa58c2	6643a51c6b6c2aa34c05116b5d280e569703da75604345186ad4415bf4728dd5	2026-06-02 11:15:10.16315+00	20260527000300_add_season_team_application_fields	\N	\N	2026-06-02 11:15:10.122481+00	1
9c87def1-3354-43c8-808f-2b3ce97e8aeb	a98ace62df38fa8c6edfd56802e6bdd6a61da01d37a353563ca8ab41473bed3a	2026-06-02 11:15:10.689764+00	20260527000400_add_match_lineups_and_suspensions	\N	\N	2026-06-02 11:15:10.175963+00	1
5c7d97ea-87cb-491f-8a29-d96dc14883ab	f8b812bd3c8a7a43625246d8e06101ba258487a522ab4a4e7a03e0054237551c	2026-06-02 11:15:12.54244+00	20260531000100_add_delete_managed_team_request_type	\N	\N	2026-06-02 11:15:12.509425+00	1
eeaf6f3f-22c2-4fa4-a6df-95e5f81ef0dd	28d5d45a9101f61500b4994e2e2109e4b4b19883a0c81eeeddf7d56e01b94fec	2026-06-02 11:15:11.177667+00	20260527000500_add_match_officials_and_reports	\N	\N	2026-06-02 11:15:10.701799+00	1
3ace57ed-0aaa-4cec-8c48-549e3a1912ae	d9fc43f2526eca950512ee1747545840d32c4235059239f9ee6f011bc81baec2	2026-06-02 11:15:11.536773+00	20260528113000_add_promotion_candidates	\N	\N	2026-06-02 11:15:11.336952+00	1
19adc788-17aa-43a8-8157-594c91a4b127	de97180f5f8b54c0e09677479d5d1475bef08052edf6e51cc7e0e9fdb82e7c79	2026-06-02 11:15:11.215556+00	20260528000100_add_fixed_team_manager_club	\N	\N	2026-06-02 11:15:11.181383+00	1
b870ebe1-bf91-4a09-b7cb-1a020e3a987d	dbf930abd89ed738b65e02eed86e7923899581787af89042bc2f1ab5ff5effe0	2026-06-02 11:15:11.973534+00	20260529081111_test	\N	\N	2026-06-02 11:15:11.924099+00	1
32cc2b68-9421-4174-90d0-87b59266c5b2	258f33df19fde9aba248b490c82e62330882585a2f2f136c97ed9cfd651e0a50	2026-06-02 11:15:11.595094+00	20260529000100_add_requirement_gap_fields	\N	\N	2026-06-02 11:15:11.548614+00	1
b930073a-b5bd-4955-b63e-261b0f7f187b	1268daa3616d01cdb02d76c35939f886f34db4f621fff45531bcf00ae89e79bb	2026-06-02 11:15:11.865623+00	20260529000100_add_team_manager_requests	\N	\N	2026-06-02 11:15:11.606141+00	1
8acd6650-0cf7-45cf-8008-9999a2c022f0	72e88c1fe86ab91486db6655d4b3753944db9db6cf19d9c273c984efdbfee866	2026-06-02 11:15:12.411673+00	20260530000100_add_manager_change_requests	\N	\N	2026-06-02 11:15:12.098242+00	1
7f77b4dd-7645-495e-9418-e20eb65cdf92	dbf930abd89ed738b65e02eed86e7923899581787af89042bc2f1ab5ff5effe0	2026-06-02 11:15:12.019688+00	20260529172838_test	\N	\N	2026-06-02 11:15:11.985427+00	1
8870c30a-b313-4a52-a238-ae0f25285eb8	0946e06766cd04bdd8f70526064d51a0235132564ed92fcdadfd0626195e1bd3	2026-06-02 11:15:12.497032+00	20260530000300_add_update_managed_team_request_type	\N	\N	2026-06-02 11:15:12.467184+00	1
faef0369-bc35-41ba-8d60-22559bf160ef	80f9c2c1027f6d4eed400b651dc41810df7197017ffc456b760503db30923f93	2026-06-02 11:15:12.087274+00	20260530000000_add_match_score_source	\N	\N	2026-06-02 11:15:12.040886+00	1
4e897e4a-09b2-4c33-a3e1-273a5bca84af	4d9a6d3b7bbae482afdb465f49a8bf89759b496900580a477d7d62948fc2b0ef	2026-06-02 11:15:12.456824+00	20260530000200_add_remove_home_stadium_request_type	\N	\N	2026-06-02 11:15:12.422971+00	1
c98e7994-690d-4f2d-978f-7235314df8d3	500e4df170ef8a34f81c00697a1f5bf69e3187cb742c7b730d1665f9e574f612	2026-06-02 11:15:12.578141+00	20260531000100_add_team_coach_name	\N	\N	2026-06-02 11:15:12.553876+00	1
e637e11b-9a31-4537-afa4-e9d062ef182d	b193706c3f4b3eb123c44e8e3e76ce91536bcdd2177c655716219c41e823bd69	2026-06-02 11:15:12.600534+00	20260531000100_allow_same_and_next_match_red_card_suspensions	\N	\N	2026-06-02 11:15:12.579947+00	1
6c59dbe9-b3ef-4326-af9e-60ee7202a53e	3aee16ef9c5839610cdddf10551e501f6769c989632d911676a60208f11a22d1	2026-06-02 11:15:12.636277+00	20260601000100_add_team_manager_request_status	\N	\N	2026-06-02 11:15:12.611507+00	1
d097f3e5-74be-490f-b9bf-085971ee1023	6afa9a25c22049f2920b0539c1e7952f66ed95e306bc44bbc1e7221e19bd4602	2026-06-02 11:15:12.712576+00	20260602031513_add_proposed_coach_name	\N	\N	2026-06-02 11:15:12.647505+00	1
afd436ba-b44b-469f-b626-9683dfceaa74	c8065d39fe2283b571fab19ba7d66a9536955a0c2dc62ed3921282c385e0b54a	2026-06-02 11:15:12.762499+00	20260602060332	\N	\N	2026-06-02 11:15:12.724769+00	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, user_email, action, entity, entity_id, old_value, new_value, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: discipline_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.discipline_reports (id, match_id, supervisor_id, organization_rating, referee_issues, player_issues, organizer_issues, notes, sent_to_disciplinary_at, submitted_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: draw_lot_results; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.draw_lot_results (id, season_id, team_id, resolved_rank, note, resolved_at, resolved_by, confirmed, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: manager_player_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.manager_player_requests (id, manager_id, team_id, player_id, request_type, status, payload, request_note, admin_note, reviewed_by_id, reviewed_at, created_at, updated_at) FROM stdin;
0aac65c2-6fe3-4f5f-a68d-05d14cc33a38	2256d048-d0ac-4c7a-865a-15bbd74ad351	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	\N	REMOVE_FROM_TEAM	APPROVED	{}	\N	\N	041100d4-eb42-4b94-86f4-3a0260d867b0	2026-06-02 11:28:13.721	2026-06-02 11:27:48.856	2026-06-02 11:28:13.724
31225f10-c199-46e9-ab88-4cb7586e5481	796fb41e-1ae7-4cd8-b29e-caecd680e183	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	\N	REMOVE_FROM_TEAM	APPROVED	{}	\N	\N	041100d4-eb42-4b94-86f4-3a0260d867b0	2026-06-02 11:29:26.007	2026-06-02 11:29:12.495	2026-06-02 11:29:26.007
\.


--
-- Data for Name: manager_stadium_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.manager_stadium_requests (id, manager_id, team_id, stadium_id, request_type, status, payload, request_note, admin_note, reviewed_by_id, reviewed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: match_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.match_events (id, match_id, minute, type, goal_type, player_id, related_player_id, team_id, note, created_at, updated_at, source) FROM stdin;
cad3a920-c19e-46f6-95f7-1b91699f4b69	278ae361-ee59-442e-9f4c-d3571eb1e877	15	GOAL	\N	1ca283d1-063e-498f-8db9-11a0dfe58498	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:28.304	2026-06-02 11:15:28.304	MANUAL
bad509ad-b979-4dea-91cc-5e5dc891cb36	278ae361-ee59-442e-9f4c-d3571eb1e877	29	GOAL	\N	6735188e-9843-449f-a895-24aa7c3dd2ce	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:28.326	2026-06-02 11:15:28.326	MANUAL
f07eecf4-a9b3-4911-bbce-4f607b48329d	278ae361-ee59-442e-9f4c-d3571eb1e877	39	GOAL	\N	6735188e-9843-449f-a895-24aa7c3dd2ce	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:28.336	2026-06-02 11:15:28.336	MANUAL
509e35d7-63d4-4238-bc2b-d1625d7e4a49	278ae361-ee59-442e-9f4c-d3571eb1e877	17	GOAL	\N	081b3c23-209e-430c-8b81-7333f0aa79a6	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:28.347	2026-06-02 11:15:28.347	MANUAL
1fe20828-fb20-40c8-bc4d-96e409f3355a	278ae361-ee59-442e-9f4c-d3571eb1e877	19	GOAL	\N	47dddbb3-0986-44bc-ba51-db33bb64ceab	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:28.356	2026-06-02 11:15:28.356	MANUAL
cbde4f9d-08f8-4c5f-9068-489d64a6b0c3	278ae361-ee59-442e-9f4c-d3571eb1e877	29	GOAL	\N	f352b9fc-8849-48e0-9d69-e38f56336616	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:28.367	2026-06-02 11:15:28.367	MANUAL
cd3b4073-3849-4e97-ac10-45f35e31de76	278ae361-ee59-442e-9f4c-d3571eb1e877	47	GOAL	\N	248f3dfb-39e4-48c4-be5c-4411636a2e69	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:28.378	2026-06-02 11:15:28.378	MANUAL
8fa2a73c-f207-477d-8691-df2c99f78291	278ae361-ee59-442e-9f4c-d3571eb1e877	22	YELLOW_CARD	\N	a7549eda-d173-452d-944a-1403d31b2b79	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:28.395	2026-06-02 11:15:28.395	MANUAL
c4894987-351a-4867-bd29-a734dca1d4d1	278ae361-ee59-442e-9f4c-d3571eb1e877	70	YELLOW_CARD	\N	205c6054-edee-4208-91e9-89d2b3134023	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:28.409	2026-06-02 11:15:28.409	MANUAL
92f10654-22d4-47ee-a8e3-76504e728e83	278ae361-ee59-442e-9f4c-d3571eb1e877	67	YELLOW_CARD	\N	ca6d5729-d2bf-40a3-bcbe-6e790c87b295	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:28.42	2026-06-02 11:15:28.42	MANUAL
120c3f5c-ee5b-4e62-8dae-881f8f4583a8	278ae361-ee59-442e-9f4c-d3571eb1e877	23	YELLOW_CARD	\N	6a007a21-a220-4773-b5aa-c2e4223b2c41	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:28.432	2026-06-02 11:15:28.432	MANUAL
5b1f7872-bd27-440f-9eae-2fb00f737c11	d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	28	GOAL	\N	741b421a-ed7e-4167-b718-75f7a69dde85	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:28.483	2026-06-02 11:15:28.483	MANUAL
70160f9e-f924-4ed5-92ea-d1a0b9e01713	d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	64	YELLOW_CARD	\N	973f5ef4-63ca-45ea-93ea-0d541bd3cd0c	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:28.498	2026-06-02 11:15:28.498	MANUAL
eeef2019-4072-4114-a2cd-aaaf23c12c7d	d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	75	YELLOW_CARD	\N	a33f99bd-db4a-432c-bf16-cc9919fb2593	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:28.513	2026-06-02 11:15:28.513	MANUAL
c976e34e-2bd1-44a1-b6b1-f7610e399493	d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	63	YELLOW_CARD	\N	3417e483-f0c7-499f-8d1b-bc919f0e2ee6	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:28.524	2026-06-02 11:15:28.524	MANUAL
c835d888-a198-4274-93b7-0a5764853c3c	d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	50	YELLOW_CARD	\N	7ed15712-6e44-43c5-9fca-874c33ef4ba6	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:28.539	2026-06-02 11:15:28.539	MANUAL
5be3b0a6-0c33-4002-9f15-c4f6d34de7c8	d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	61	YELLOW_CARD	\N	326950ef-6602-41e4-b507-3ee6698dffd2	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:28.555	2026-06-02 11:15:28.555	MANUAL
c0fd899e-e485-463a-87a6-a8d8e95068df	d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	33	YELLOW_CARD	\N	ccc8ef29-bb77-46b1-801d-7c45a725c567	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:28.559	2026-06-02 11:15:28.559	MANUAL
b29bf658-771c-49be-ad00-efd947731a71	53968a22-96c2-4389-a094-3b82360d618c	25	GOAL	\N	4985190f-b59a-431e-a2f5-8929279d1cb7	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:28.576	2026-06-02 11:15:28.576	MANUAL
91ded8b1-143c-449e-8f57-b4afc710eb50	53968a22-96c2-4389-a094-3b82360d618c	50	GOAL	\N	0c0b84f1-27a1-4b72-a1c8-1ec4914b17ca	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:28.594	2026-06-02 11:15:28.594	MANUAL
4396ab4b-21ac-4476-86da-a0811cbdc376	53968a22-96c2-4389-a094-3b82360d618c	81	YELLOW_CARD	\N	e6ba34f6-3257-4a84-870a-a362c6b92209	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:28.6	2026-06-02 11:15:28.6	MANUAL
3ba0744f-acb7-44a3-ab1a-47fd349e06e3	53968a22-96c2-4389-a094-3b82360d618c	27	YELLOW_CARD	\N	51c622e8-af49-4d8a-9572-25be5e508e91	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:28.617	2026-06-02 11:15:28.617	MANUAL
54f0d7ea-1dc4-48ef-91a1-97a96fe112d9	53968a22-96c2-4389-a094-3b82360d618c	24	YELLOW_CARD	\N	7a8d9d41-a57c-43a8-a6ea-fd17bd210051	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:28.627	2026-06-02 11:15:28.627	MANUAL
d3d3c3c3-b6f1-4fe4-a709-aa240fca3358	53968a22-96c2-4389-a094-3b82360d618c	56	YELLOW_CARD	\N	c529f861-b19f-4e5c-ac34-70f5d23ac062	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:28.641	2026-06-02 11:15:28.641	MANUAL
2b91c505-49d2-4034-8b95-fa3670708ed2	53968a22-96c2-4389-a094-3b82360d618c	54	YELLOW_CARD	\N	0f22ec25-66cd-4672-aa2a-57ee4a348e4f	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:28.644	2026-06-02 11:15:28.644	MANUAL
c7e3a32e-68f6-4ebc-aaed-75fc082d1b12	53968a22-96c2-4389-a094-3b82360d618c	23	YELLOW_CARD	\N	72cc0e6c-ea6c-4199-9f76-978a59f33f75	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:28.655	2026-06-02 11:15:28.655	MANUAL
fac95de9-22ec-4827-9df1-4a2c6e03bbe4	e426c356-88e2-409e-b5ff-18ba1608cb7c	20	GOAL	\N	d3453aae-0fc9-4677-8474-db274b83351d	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:28.679	2026-06-02 11:15:28.679	MANUAL
7d32dd63-4590-41b5-8de2-244e6a417094	e426c356-88e2-409e-b5ff-18ba1608cb7c	28	GOAL	\N	35fe4bf2-f604-47cd-8c89-7a427c1d833b	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:28.682	2026-06-02 11:15:28.682	MANUAL
b2a2a649-f2eb-4474-a9fc-5ac0542228f1	e426c356-88e2-409e-b5ff-18ba1608cb7c	55	GOAL	\N	ac16b296-4e56-4599-9677-b0069346e77b	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:28.686	2026-06-02 11:15:28.686	MANUAL
45a7158d-b405-4652-9f41-a9db5dcdee13	e426c356-88e2-409e-b5ff-18ba1608cb7c	58	GOAL	\N	35fe4bf2-f604-47cd-8c89-7a427c1d833b	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:28.693	2026-06-02 11:15:28.693	MANUAL
cd366cf0-c263-447b-962f-eb9c3e8fb0ab	e426c356-88e2-409e-b5ff-18ba1608cb7c	33	GOAL	\N	1ceac09e-367e-4c49-8504-4f2d1446bce8	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:28.698	2026-06-02 11:15:28.698	MANUAL
ddc5fb81-5470-462c-bc8a-94b953aa2b41	e426c356-88e2-409e-b5ff-18ba1608cb7c	22	GOAL	\N	d2f9007d-a97d-4769-8598-88723b2acdcf	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:28.703	2026-06-02 11:15:28.703	MANUAL
01b8993b-927f-4354-9e3f-16b1b2a5ca61	e426c356-88e2-409e-b5ff-18ba1608cb7c	32	YELLOW_CARD	\N	bd4a51ae-53df-4ea4-8e34-14a37b427167	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:28.736	2026-06-02 11:15:28.736	MANUAL
d0e884c5-36b2-4ba7-b9cc-f94c3dea8e2a	e426c356-88e2-409e-b5ff-18ba1608cb7c	59	YELLOW_CARD	\N	e938c0f1-e9bb-474d-9f0a-c7bd21909dea	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:28.758	2026-06-02 11:15:28.758	MANUAL
0ad2b721-7c8a-414b-83fc-4875d12a4692	88fb47fb-0275-4c5b-a71d-c7aa752934da	25	GOAL	\N	18c21802-e0a9-4d9b-8977-3cc5e55f5eb5	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:28.798	2026-06-02 11:15:28.798	MANUAL
9b545dd5-dcba-4b29-9269-08d66a80f003	88fb47fb-0275-4c5b-a71d-c7aa752934da	34	GOAL	\N	45a3236c-a1b5-47b5-8266-36e94c50a9b6	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:28.817	2026-06-02 11:15:28.817	MANUAL
a584705d-3503-4cd3-bd27-335afd702c1f	88fb47fb-0275-4c5b-a71d-c7aa752934da	30	GOAL	\N	34f8950e-7501-406c-bfc1-a87ea63346d9	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:28.827	2026-06-02 11:15:28.827	MANUAL
07abf21b-927c-40e0-a3eb-9f481ea43e2b	88fb47fb-0275-4c5b-a71d-c7aa752934da	19	GOAL	\N	97a58d26-2347-4cdd-9eec-664adf1f9259	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:28.841	2026-06-02 11:15:28.841	MANUAL
895af40b-6564-4a59-94b8-300e7d7a2189	88fb47fb-0275-4c5b-a71d-c7aa752934da	43	GOAL	\N	3e0dce3f-45c9-4ae0-90a0-aeaa26e4ea03	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:28.852	2026-06-02 11:15:28.852	MANUAL
5bea11ff-36a3-4717-bf4c-c7d5043f7a90	88fb47fb-0275-4c5b-a71d-c7aa752934da	33	GOAL	\N	a1b73a7a-e57b-45c3-a9fe-dc2d235bd577	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:28.858	2026-06-02 11:15:28.858	MANUAL
94c7f1bd-c6f4-4b23-bca8-26f1e7a14683	88fb47fb-0275-4c5b-a71d-c7aa752934da	90	YELLOW_CARD	\N	6f3f7407-3a80-4a97-b845-397a7ba67a35	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:28.865	2026-06-02 11:15:28.865	MANUAL
adb6eb8c-6744-4d51-9c98-e0ee1a820a12	88fb47fb-0275-4c5b-a71d-c7aa752934da	30	YELLOW_CARD	\N	ff43cf28-5b09-4b5b-b2d8-c4d6ed65ebb0	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:28.868	2026-06-02 11:15:28.868	MANUAL
14049d99-29eb-400c-ad85-d1c9473ef033	88fb47fb-0275-4c5b-a71d-c7aa752934da	72	YELLOW_CARD	\N	9f0eedf2-f842-4723-906d-b885295b032b	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:28.879	2026-06-02 11:15:28.879	MANUAL
5a5eb229-2b3d-47bd-9c15-5d9dcd82f5ee	88fb47fb-0275-4c5b-a71d-c7aa752934da	24	YELLOW_CARD	\N	d2980b91-de4c-4869-a239-87c629f1ed0b	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:28.891	2026-06-02 11:15:28.891	MANUAL
817c521c-91c7-4a2e-9d66-d6fcf3347fa8	88fb47fb-0275-4c5b-a71d-c7aa752934da	48	RED_CARD	\N	fa224542-f66f-4ef3-bb81-8b4662caaf1d	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:28.904	2026-06-02 11:15:28.904	MANUAL
e9524bfd-1d0a-4af2-953b-ba8f742a88eb	e525bd43-df1d-40bd-8747-d8c10e728681	16	GOAL	\N	eb3c6d80-4872-4e11-82e9-73cca51a56a6	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:28.936	2026-06-02 11:15:28.936	MANUAL
9eead337-8a4e-447b-8382-c8a0424ec344	e525bd43-df1d-40bd-8747-d8c10e728681	22	GOAL	\N	efefb516-da08-4d8f-b9cc-e3c4a9d6ace0	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:28.955	2026-06-02 11:15:28.955	MANUAL
6aba830b-bf54-4c7b-8af8-bb8287dfab96	e525bd43-df1d-40bd-8747-d8c10e728681	40	YELLOW_CARD	\N	724684d4-7a7c-437a-b51b-cf87f8df6611	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:28.969	2026-06-02 11:15:28.969	MANUAL
f415bda9-1698-4506-a8e1-71adcbc2b53d	e525bd43-df1d-40bd-8747-d8c10e728681	84	YELLOW_CARD	\N	efefb516-da08-4d8f-b9cc-e3c4a9d6ace0	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:28.986	2026-06-02 11:15:28.986	MANUAL
e7d56557-e3c6-42a0-8869-67aa077ea911	e525bd43-df1d-40bd-8747-d8c10e728681	61	YELLOW_CARD	\N	6434cbe7-47a4-4108-9e26-142cf2a6827f	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:28.996	2026-06-02 11:15:28.996	MANUAL
6fc9c7a3-567a-4860-b7fc-abaee4a01b71	e525bd43-df1d-40bd-8747-d8c10e728681	45	YELLOW_CARD	\N	2685078f-48ae-4a23-bc94-feb1184fbfe3	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:29.007	2026-06-02 11:15:29.007	MANUAL
07deb200-d38b-4f2a-9d5d-e62aea12ab0b	5818142c-074f-4d84-a482-1e620ad53d18	15	GOAL	\N	ae87d895-59bb-467e-b4a1-b44570b8d9ff	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:29.03	2026-06-02 11:15:29.03	MANUAL
06d2d891-4cad-4210-a76b-dd5f78a39cd3	5818142c-074f-4d84-a482-1e620ad53d18	38	GOAL	\N	a39e3b23-5524-4b6b-bd96-6ceec4a0fed0	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:29.04	2026-06-02 11:15:29.04	MANUAL
0d34df6d-17e8-4bc7-93f6-19d49d435891	5818142c-074f-4d84-a482-1e620ad53d18	32	GOAL	\N	59c80b78-0ea4-4658-ae66-ee440a1acb6b	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:29.051	2026-06-02 11:15:29.051	MANUAL
08294ff1-fd42-405d-a7db-58af5a284b31	5818142c-074f-4d84-a482-1e620ad53d18	50	YELLOW_CARD	\N	e79054d0-faa0-4c5b-ba3a-e547e08edaf4	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:29.066	2026-06-02 11:15:29.066	MANUAL
cebbf16e-9e92-446e-b623-c4cede0e1301	5818142c-074f-4d84-a482-1e620ad53d18	37	RED_CARD	\N	41806643-287a-4b5c-8cbb-cff0f07cd8b3	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:29.083	2026-06-02 11:15:29.083	MANUAL
e1078a2a-77a1-4974-a2ca-44d763b1f83a	3a2be07a-5c14-42f9-af3f-aa76eea68139	16	GOAL	\N	de904f4a-565f-46de-8a3f-076267072212	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:29.118	2026-06-02 11:15:29.118	MANUAL
8deb78ba-8f7e-454b-833a-d7a2eedbc82c	3a2be07a-5c14-42f9-af3f-aa76eea68139	18	GOAL	\N	8f5acf7e-6f07-4060-9ef9-2c9f746ba0ca	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:29.136	2026-06-02 11:15:29.136	MANUAL
eafd975c-7b56-4c06-a4fb-a4336caec22f	3a2be07a-5c14-42f9-af3f-aa76eea68139	48	GOAL	\N	7dba25ec-6c10-41e0-ace7-f51354e3cbc2	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:29.147	2026-06-02 11:15:29.147	MANUAL
965d58a3-7c91-4f67-a3ae-144649db6982	d85cc39e-e33b-4abb-bc25-e6a2f69689d8	25	GOAL	\N	9cf6fefd-f636-48b2-ae2b-ab97e9b910bb	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:29.177	2026-06-02 11:15:29.177	MANUAL
7b965b08-97f5-41c5-be70-0fedd364c921	d85cc39e-e33b-4abb-bc25-e6a2f69689d8	41	YELLOW_CARD	\N	f33bb96a-e2ad-4b28-9486-1be383eec0fe	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:29.183	2026-06-02 11:15:29.183	MANUAL
d24605ba-0f48-4fdf-9ecc-c07cc1d5b4b9	d85cc39e-e33b-4abb-bc25-e6a2f69689d8	73	YELLOW_CARD	\N	e158a991-7474-4d9a-afbd-7a66ef78b014	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:29.186	2026-06-02 11:15:29.186	MANUAL
6a881c4b-632d-4b38-8a60-b2c398874d10	d85cc39e-e33b-4abb-bc25-e6a2f69689d8	55	YELLOW_CARD	\N	c529f861-b19f-4e5c-ac34-70f5d23ac062	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:29.188	2026-06-02 11:15:29.188	MANUAL
229eba64-38f7-4ef7-80bb-010482b1d0f4	d85cc39e-e33b-4abb-bc25-e6a2f69689d8	19	RED_CARD	\N	0efaaaeb-93b5-443f-9bfb-387c68cb22cb	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:29.2	2026-06-02 11:15:29.2	MANUAL
44f67e56-d106-4065-ac12-5a55c30cf4ee	d85cc39e-e33b-4abb-bc25-e6a2f69689d8	39	YELLOW_CARD	\N	083c54e2-0c3b-464b-86e4-fdaa38327498	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:29.213	2026-06-02 11:15:29.213	MANUAL
c3fd8424-98ed-4061-8fe0-a72a908d9de3	d85cc39e-e33b-4abb-bc25-e6a2f69689d8	89	YELLOW_CARD	\N	79ea4510-46eb-4d69-8ef9-362eda885b18	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:29.223	2026-06-02 11:15:29.223	MANUAL
a0247cf3-0353-49b1-bac6-2f735105384b	d85cc39e-e33b-4abb-bc25-e6a2f69689d8	25	YELLOW_CARD	\N	b3dd562c-ebc3-429e-af21-576e797dc54b	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:29.226	2026-06-02 11:15:29.226	MANUAL
1bc38352-21de-424e-8b0b-45a6e46ef510	01398c65-3655-4e63-bdd5-7820f0a78504	36	GOAL	\N	ff43cf28-5b09-4b5b-b2d8-c4d6ed65ebb0	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:29.251	2026-06-02 11:15:29.251	MANUAL
6c16664f-46b4-4ea5-8a62-f0d2bc5ee607	01398c65-3655-4e63-bdd5-7820f0a78504	52	GOAL	\N	3e0dce3f-45c9-4ae0-90a0-aeaa26e4ea03	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:29.254	2026-06-02 11:15:29.254	MANUAL
c994698e-7980-40dc-ae5e-cb982c2c7ee8	01398c65-3655-4e63-bdd5-7820f0a78504	77	YELLOW_CARD	\N	b13c3392-8332-435c-8025-5190f0664c09	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:29.258	2026-06-02 11:15:29.258	MANUAL
6e31fdcd-6602-4420-ad90-babae5df3c87	01398c65-3655-4e63-bdd5-7820f0a78504	32	YELLOW_CARD	\N	cad98842-45b6-4371-beac-fde6d374201a	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:29.268	2026-06-02 11:15:29.268	MANUAL
0d835fc7-64eb-45a7-9cef-08141d3cfb21	01398c65-3655-4e63-bdd5-7820f0a78504	77	YELLOW_CARD	\N	4c660b28-9715-44cb-8d97-6545685890db	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:29.271	2026-06-02 11:15:29.271	MANUAL
ace65ebd-c464-43fb-9bc5-acce971d1915	01398c65-3655-4e63-bdd5-7820f0a78504	32	YELLOW_CARD	\N	886d4630-3234-43c9-8970-b82bf4da2978	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:29.274	2026-06-02 11:15:29.274	MANUAL
957989fc-b0ff-47cd-9bc0-a1e9b2194fc0	01398c65-3655-4e63-bdd5-7820f0a78504	47	RED_CARD	\N	054d97fa-60e2-42e8-afbd-1f85fe38d500	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:29.277	2026-06-02 11:15:29.277	MANUAL
baf57010-a819-413c-bdb1-31abd65523c8	01398c65-3655-4e63-bdd5-7820f0a78504	85	YELLOW_CARD	\N	a1e6e78f-0d43-4fbd-93cc-29becafda938	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:29.281	2026-06-02 11:15:29.281	MANUAL
d20f0576-7115-4c62-91d9-0d648b9cee32	859a7a53-3c30-49bf-86cc-529dbedc0d8a	17	GOAL	\N	fc4feb91-a848-4133-817a-a67f0b9a923b	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:29.312	2026-06-02 11:15:29.312	MANUAL
c720114a-b136-4eaa-9330-fe442e79caf4	859a7a53-3c30-49bf-86cc-529dbedc0d8a	48	GOAL	\N	0c5cdbb0-d4fc-4a99-999a-68ba4aeaf343	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:29.323	2026-06-02 11:15:29.323	MANUAL
22de5fea-033f-40bc-89fd-869b1646a3d8	859a7a53-3c30-49bf-86cc-529dbedc0d8a	16	GOAL	\N	e79054d0-faa0-4c5b-ba3a-e547e08edaf4	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:29.344	2026-06-02 11:15:29.344	MANUAL
5dc31a4d-eadc-4cde-8e61-bcd13bc7cc2c	859a7a53-3c30-49bf-86cc-529dbedc0d8a	28	GOAL	\N	7a8d9d41-a57c-43a8-a6ea-fd17bd210051	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:29.356	2026-06-02 11:15:29.356	MANUAL
c2c9dc49-64ab-4794-a667-a4a1c2127655	859a7a53-3c30-49bf-86cc-529dbedc0d8a	60	GOAL	\N	339858df-7a16-4510-b3b5-ffdf964d6b02	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:29.367	2026-06-02 11:15:29.367	MANUAL
c5f2372e-70df-4434-84ef-ee43d7c55c47	859a7a53-3c30-49bf-86cc-529dbedc0d8a	51	YELLOW_CARD	\N	205c6054-edee-4208-91e9-89d2b3134023	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:29.378	2026-06-02 11:15:29.378	MANUAL
41be6bb4-9c73-456c-939f-a420dd0b1e58	859a7a53-3c30-49bf-86cc-529dbedc0d8a	47	YELLOW_CARD	\N	60011408-bbc0-463a-bf9e-771f84907127	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:29.39	2026-06-02 11:15:29.39	MANUAL
a36e4254-cad5-4fe9-a59e-884b87a48580	859a7a53-3c30-49bf-86cc-529dbedc0d8a	26	YELLOW_CARD	\N	0efdf27a-b364-441a-b019-22919c84b8ff	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:29.399	2026-06-02 11:15:29.399	MANUAL
98ae037e-90c6-4b35-8719-aace590826e2	859a7a53-3c30-49bf-86cc-529dbedc0d8a	71	YELLOW_CARD	\N	07d2f52b-f9f0-407a-921f-f878f17fb3af	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:29.409	2026-06-02 11:15:29.409	MANUAL
79b86870-9d79-4189-879b-bbd557f94f42	b1bf4ea7-da39-4bec-a47c-73595095b785	29	GOAL	\N	d3453aae-0fc9-4677-8474-db274b83351d	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:29.424	2026-06-02 11:15:29.424	MANUAL
cc673c85-81b3-424e-bb3d-a507abfd77ff	b1bf4ea7-da39-4bec-a47c-73595095b785	46	GOAL	\N	35fe4bf2-f604-47cd-8c89-7a427c1d833b	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:29.434	2026-06-02 11:15:29.434	MANUAL
ec9b082d-b7de-422b-b3b7-c4ed1f8912ce	b1bf4ea7-da39-4bec-a47c-73595095b785	65	GOAL	\N	6e13329e-8110-4820-a0b4-4cf2871f9105	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:29.445	2026-06-02 11:15:29.445	MANUAL
27f17631-34f0-4b66-a7ff-b8ec6a0bf9bc	b1bf4ea7-da39-4bec-a47c-73595095b785	51	GOAL	\N	80f9e6eb-3ec4-4fbd-9157-8758e25fb219	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:29.456	2026-06-02 11:15:29.456	MANUAL
88f7dd08-5696-436f-a873-3b5d4e40baa9	b1bf4ea7-da39-4bec-a47c-73595095b785	30	GOAL	\N	60676704-830a-4b5a-b8ad-4e26f7f2f73c	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:29.47	2026-06-02 11:15:29.47	MANUAL
0abc13c1-0a95-4c32-87fa-c211179af4c9	b1bf4ea7-da39-4bec-a47c-73595095b785	25	GOAL	\N	eb3c6d80-4872-4e11-82e9-73cca51a56a6	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:29.488	2026-06-02 11:15:29.488	MANUAL
81ea79fb-b30c-4a05-8bfd-3f53cb857a91	b1bf4ea7-da39-4bec-a47c-73595095b785	75	YELLOW_CARD	\N	de904f4a-565f-46de-8a3f-076267072212	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:29.503	2026-06-02 11:15:29.503	MANUAL
e3dc4e7d-041f-4f0f-a800-487c16e85927	b1bf4ea7-da39-4bec-a47c-73595095b785	73	YELLOW_CARD	\N	ac16b296-4e56-4599-9677-b0069346e77b	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:29.52	2026-06-02 11:15:29.52	MANUAL
e9e7653d-1d4d-47fa-a6ee-229bc8b01ee9	b1bf4ea7-da39-4bec-a47c-73595095b785	81	YELLOW_CARD	\N	6e13329e-8110-4820-a0b4-4cf2871f9105	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:29.531	2026-06-02 11:15:29.531	MANUAL
15959ce5-dd01-4049-af2a-c3bcc976b090	b1bf4ea7-da39-4bec-a47c-73595095b785	66	YELLOW_CARD	\N	85313c8f-cbf4-49e7-a8af-f26b7e798deb	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:29.542	2026-06-02 11:15:29.542	MANUAL
b8e863a9-789d-444b-8bac-e58a1362583c	b1bf4ea7-da39-4bec-a47c-73595095b785	21	YELLOW_CARD	\N	1b9d1863-5a7a-44bf-b94f-b629c8f1d802	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:29.557	2026-06-02 11:15:29.557	MANUAL
d0f70f70-e5e4-4cdb-b8ae-c5aa1f07bf9b	b1bf4ea7-da39-4bec-a47c-73595095b785	35	YELLOW_CARD	\N	a33f99bd-db4a-432c-bf16-cc9919fb2593	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:29.575	2026-06-02 11:15:29.575	MANUAL
1de569ee-96aa-41fd-88cf-399798e4c92b	b1bf4ea7-da39-4bec-a47c-73595095b785	30	RED_CARD	\N	eb3c6d80-4872-4e11-82e9-73cca51a56a6	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:29.587	2026-06-02 11:15:29.587	MANUAL
8cff5a6b-26a5-496a-94e7-294230672847	9f1f3cc6-e65c-430d-a397-f9d38e40c459	24	GOAL	\N	6ad3d924-b654-4369-8665-e47844567ca1	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:29.629	2026-06-02 11:15:29.629	MANUAL
45205c40-7bf4-4100-b3ea-8c2a9f70f01b	9f1f3cc6-e65c-430d-a397-f9d38e40c459	62	GOAL	\N	45a3236c-a1b5-47b5-8266-36e94c50a9b6	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:29.64	2026-06-02 11:15:29.64	MANUAL
468c16bb-bc34-46e5-8b72-e820f5f74caa	9f1f3cc6-e65c-430d-a397-f9d38e40c459	21	GOAL	\N	e9cc0414-19cb-4ce7-86a5-2b8356172b7e	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:29.654	2026-06-02 11:15:29.654	MANUAL
fab78e5a-8013-4cd8-9510-1c6bec1dabc4	9f1f3cc6-e65c-430d-a397-f9d38e40c459	18	GOAL	\N	1e88149c-a80c-4cfb-9cd9-4e9cde03b325	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:29.671	2026-06-02 11:15:29.671	MANUAL
b06bee91-906b-40fa-8908-d42d75c2bc23	9f1f3cc6-e65c-430d-a397-f9d38e40c459	38	GOAL	\N	69396e2d-6c37-4ffa-b852-86f9a51e53ae	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:29.682	2026-06-02 11:15:29.682	MANUAL
a41f183b-392a-4c2a-a5a4-27f76d04077c	9f1f3cc6-e65c-430d-a397-f9d38e40c459	24	YELLOW_CARD	\N	8b907f31-a457-47c8-912f-537d1b685ee2	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:29.696	2026-06-02 11:15:29.696	MANUAL
65947662-3998-4a09-acdb-a217f3615a65	9f1f3cc6-e65c-430d-a397-f9d38e40c459	73	YELLOW_CARD	\N	8ceadd63-55ba-40d2-8f3c-52df24c40c17	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:29.716	2026-06-02 11:15:29.716	MANUAL
6454933f-4860-4367-82a1-c3ae14d87ba1	9f1f3cc6-e65c-430d-a397-f9d38e40c459	65	YELLOW_CARD	\N	ae87d895-59bb-467e-b4a1-b44570b8d9ff	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:29.734	2026-06-02 11:15:29.734	MANUAL
993daabd-47db-4522-99e4-3b752f1a5061	00a34b87-506f-4deb-9d0b-3ebb1d591b36	36	GOAL	\N	a388c17b-7143-48ed-8ec3-24a3e46644ce	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:29.756	2026-06-02 11:15:29.756	MANUAL
ec2ad302-5b66-4e2a-8b97-408bbf9400f4	00a34b87-506f-4deb-9d0b-3ebb1d591b36	19	GOAL	\N	b2760b91-57b7-4d26-909e-c602b8e15c5a	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:29.765	2026-06-02 11:15:29.765	MANUAL
70932a7c-d6c6-4810-88a8-a6b452cd2199	00a34b87-506f-4deb-9d0b-3ebb1d591b36	45	GOAL	\N	715c093a-e1e3-46fc-b6a2-e4d8d366fe88	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:29.777	2026-06-02 11:15:29.777	MANUAL
6387d421-35d4-428e-9c98-8f85cefaf9fd	00a34b87-506f-4deb-9d0b-3ebb1d591b36	22	YELLOW_CARD	\N	d2980b91-de4c-4869-a239-87c629f1ed0b	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:29.789	2026-06-02 11:15:29.789	MANUAL
f8c0b049-f5a2-4f53-ae23-b7406e7dacc5	00a34b87-506f-4deb-9d0b-3ebb1d591b36	46	YELLOW_CARD	\N	b2760b91-57b7-4d26-909e-c602b8e15c5a	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:29.801	2026-06-02 11:15:29.801	MANUAL
ec3d8b6f-c13c-452c-a640-bafb998cc01f	00a34b87-506f-4deb-9d0b-3ebb1d591b36	73	YELLOW_CARD	\N	62827757-6c88-4e49-93b8-110158b08b9a	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:29.818	2026-06-02 11:15:29.818	MANUAL
1771101a-4e27-4f55-9a5c-0afab4e0ab19	8f789f51-0e23-4d07-ba74-1ff4442ae866	29	GOAL	\N	11bf43c2-181c-4ce1-aac5-48456ad3f456	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:29.841	2026-06-02 11:15:29.841	MANUAL
90866234-837a-4049-aaa4-782c496026ce	8f789f51-0e23-4d07-ba74-1ff4442ae866	16	GOAL	\N	054d97fa-60e2-42e8-afbd-1f85fe38d500	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:29.85	2026-06-02 11:15:29.85	MANUAL
aaaa09b1-0e4a-41c4-9c7e-eb72a7430b1a	8f789f51-0e23-4d07-ba74-1ff4442ae866	38	GOAL	\N	0c0b84f1-27a1-4b72-a1c8-1ec4914b17ca	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:29.862	2026-06-02 11:15:29.862	MANUAL
1485fcdf-5c88-4326-bc97-6bdbb7ee54c7	8f789f51-0e23-4d07-ba74-1ff4442ae866	25	GOAL	\N	f33bb96a-e2ad-4b28-9486-1be383eec0fe	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:29.873	2026-06-02 11:15:29.873	MANUAL
4e834bfe-0198-46ee-8ca5-d16a38459675	8f789f51-0e23-4d07-ba74-1ff4442ae866	19	YELLOW_CARD	\N	bcfa46ff-aa79-4a6d-b465-4e2369050a8b	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:29.887	2026-06-02 11:15:29.887	MANUAL
a9b283d8-cc8d-47bf-a90d-b52a10c54525	8f789f51-0e23-4d07-ba74-1ff4442ae866	25	YELLOW_CARD	\N	b13c3392-8332-435c-8025-5190f0664c09	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:29.905	2026-06-02 11:15:29.905	MANUAL
b0e627ea-8759-4c4e-a5d8-7da54a2320ba	8f789f51-0e23-4d07-ba74-1ff4442ae866	73	RED_CARD	\N	0efaaaeb-93b5-443f-9bfb-387c68cb22cb	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:29.918	2026-06-02 11:15:29.918	MANUAL
2c3aa97a-578d-4b0a-b2e2-ccc41dd71ad7	e99cec87-b449-4daa-bc2b-44651da0a41a	27	GOAL	\N	35fe4bf2-f604-47cd-8c89-7a427c1d833b	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:29.934	2026-06-02 11:15:29.934	MANUAL
1de77ffb-56a0-47df-b98c-bf8eff6557cb	e99cec87-b449-4daa-bc2b-44651da0a41a	37	GOAL	\N	68e4189a-bd8f-45a7-b1f8-7b92be25c1de	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:29.945	2026-06-02 11:15:29.945	MANUAL
7eef5f77-8826-4b2e-ae14-f0a549eeb44b	e99cec87-b449-4daa-bc2b-44651da0a41a	23	GOAL	\N	6a007a21-a220-4773-b5aa-c2e4223b2c41	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:29.963	2026-06-02 11:15:29.963	MANUAL
b54b1222-85b4-4e58-bb82-f94fe1953588	e99cec87-b449-4daa-bc2b-44651da0a41a	66	GOAL	\N	fc4feb91-a848-4133-817a-a67f0b9a923b	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:29.974	2026-06-02 11:15:29.974	MANUAL
5a88c12d-7e3d-418f-a0cc-0e042cc64325	e99cec87-b449-4daa-bc2b-44651da0a41a	74	GOAL	\N	0c5cdbb0-d4fc-4a99-999a-68ba4aeaf343	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:29.984	2026-06-02 11:15:29.984	MANUAL
88db33ab-2463-4223-8493-c2553094894d	e99cec87-b449-4daa-bc2b-44651da0a41a	34	YELLOW_CARD	\N	80f9e6eb-3ec4-4fbd-9157-8758e25fb219	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:29.998	2026-06-02 11:15:29.998	MANUAL
012b127d-6397-424c-bd46-f6d76f9764c3	e99cec87-b449-4daa-bc2b-44651da0a41a	77	YELLOW_CARD	\N	6e13329e-8110-4820-a0b4-4cf2871f9105	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:30.016	2026-06-02 11:15:30.016	MANUAL
5f7b52d9-7f90-4e2c-b479-b88b1d2bc4eb	e99cec87-b449-4daa-bc2b-44651da0a41a	86	YELLOW_CARD	\N	43b490ee-e98c-48a3-beba-196babf51752	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:30.026	2026-06-02 11:15:30.026	MANUAL
306d246b-f6ff-40de-b997-475a5e6adc6c	e99cec87-b449-4daa-bc2b-44651da0a41a	28	YELLOW_CARD	\N	558e7a8f-ceab-4c21-9d5f-a3d90abb03c4	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:30.039	2026-06-02 11:15:30.039	MANUAL
dfae2205-c829-44db-a86a-0684fb7638be	e99cec87-b449-4daa-bc2b-44651da0a41a	75	YELLOW_CARD	\N	1ca283d1-063e-498f-8db9-11a0dfe58498	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:30.055	2026-06-02 11:15:30.055	MANUAL
e69b132a-6798-4a55-ada5-e81d54fbd99c	e99cec87-b449-4daa-bc2b-44651da0a41a	27	YELLOW_CARD	\N	1d4e926f-92cc-4175-87e5-210ae50bbef7	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:30.07	2026-06-02 11:15:30.07	MANUAL
f3294c5f-690c-4576-a28c-ce2742d6b919	e99cec87-b449-4daa-bc2b-44651da0a41a	25	YELLOW_CARD	\N	724684d4-7a7c-437a-b51b-cf87f8df6611	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:30.082	2026-06-02 11:15:30.082	MANUAL
a24e5d55-4a39-44f9-be7b-680a6ebc9838	9aae48db-c79b-495b-8647-bd775c4def34	28	GOAL	\N	26373344-5c42-4b61-88b4-e7c1a9384f9c	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:30.105	2026-06-02 11:15:30.105	MANUAL
b53f6a38-debd-43e6-89f3-1e10386eb730	9aae48db-c79b-495b-8647-bd775c4def34	21	GOAL	\N	7a8d9d41-a57c-43a8-a6ea-fd17bd210051	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:30.113	2026-06-02 11:15:30.113	MANUAL
a7044ad7-d182-40a7-b14f-2037c30967e7	9aae48db-c79b-495b-8647-bd775c4def34	22	GOAL	\N	d9a05d94-51e8-417b-80ec-6cf8ce77ce85	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:30.125	2026-06-02 11:15:30.125	MANUAL
32803311-c7c2-4ed9-ba6c-0438affa7bce	9aae48db-c79b-495b-8647-bd775c4def34	36	GOAL	\N	237f4abf-af95-4a91-b823-a0935c5f102c	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:30.13	2026-06-02 11:15:30.13	MANUAL
15f76ea1-f0e1-4b0e-9a95-263be466e8b8	9aae48db-c79b-495b-8647-bd775c4def34	31	GOAL	\N	79ea4510-46eb-4d69-8ef9-362eda885b18	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:30.139	2026-06-02 11:15:30.139	MANUAL
98f5308a-7282-4523-b016-612d00e7fb18	9aae48db-c79b-495b-8647-bd775c4def34	44	GOAL	\N	79ea4510-46eb-4d69-8ef9-362eda885b18	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:30.149	2026-06-02 11:15:30.149	MANUAL
74590dfa-a598-47d3-83b9-03855af04848	9aae48db-c79b-495b-8647-bd775c4def34	41	YELLOW_CARD	\N	3e5f4e61-0f76-4eb8-b360-d33eb6d0df17	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:30.164	2026-06-02 11:15:30.164	MANUAL
853a3e48-7b7a-465e-8072-3e59fda36305	9aae48db-c79b-495b-8647-bd775c4def34	73	YELLOW_CARD	\N	51c622e8-af49-4d8a-9572-25be5e508e91	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:30.18	2026-06-02 11:15:30.18	MANUAL
7cda2dd2-caf7-41f1-a0f9-eca733cac24f	9aae48db-c79b-495b-8647-bd775c4def34	37	YELLOW_CARD	\N	7a8d9d41-a57c-43a8-a6ea-fd17bd210051	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:30.191	2026-06-02 11:15:30.191	MANUAL
9bc3c4f3-05bf-40d4-a63f-ea39840de2f8	9aae48db-c79b-495b-8647-bd775c4def34	69	YELLOW_CARD	\N	72e2df7b-8cb3-4235-9ed9-31fc633e0e53	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:30.201	2026-06-02 11:15:30.201	MANUAL
65fb7c54-999d-4e32-87e1-8e30e252bd14	9aae48db-c79b-495b-8647-bd775c4def34	37	YELLOW_CARD	\N	ead4b0d9-ad83-4530-a9f8-d1d22f3721be	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:30.215	2026-06-02 11:15:30.215	MANUAL
f28fb63c-13d9-4416-9dcb-68d24ffbe718	9aae48db-c79b-495b-8647-bd775c4def34	90	YELLOW_CARD	\N	8ee43ed4-693f-43be-bf47-42e00bb7db49	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:30.218	2026-06-02 11:15:30.218	MANUAL
ca984f8c-cc52-4443-acae-c9bb59b5dab8	73b58df4-b989-4b1d-bcbd-25b92dac3bab	15	GOAL	\N	5fd6264b-e7cd-442f-95b0-332afe96014b	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:30.233	2026-06-02 11:15:30.233	MANUAL
9163f7b2-00f2-4b47-beac-d523ef360eb1	73b58df4-b989-4b1d-bcbd-25b92dac3bab	26	GOAL	\N	555d8e12-17b7-452a-817a-983759cbd245	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:30.244	2026-06-02 11:15:30.244	MANUAL
be60558a-fb0d-4683-b063-868066140803	73b58df4-b989-4b1d-bcbd-25b92dac3bab	51	GOAL	\N	ad6181d5-2c1a-4ef8-9c89-9b8018269fa9	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:30.263	2026-06-02 11:15:30.263	MANUAL
b00a6eae-de1d-408f-b703-54486c6405a1	73b58df4-b989-4b1d-bcbd-25b92dac3bab	69	YELLOW_CARD	\N	eb3c6d80-4872-4e11-82e9-73cca51a56a6	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:30.277	2026-06-02 11:15:30.277	MANUAL
60de0522-68a2-458c-8aa4-7ed613964186	73b58df4-b989-4b1d-bcbd-25b92dac3bab	39	YELLOW_CARD	\N	81c33883-d719-4311-9d72-bb8680c299ff	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:30.294	2026-06-02 11:15:30.294	MANUAL
66abcc20-fa1b-409d-8653-44a6546cb3ae	73b58df4-b989-4b1d-bcbd-25b92dac3bab	63	YELLOW_CARD	\N	a33f99bd-db4a-432c-bf16-cc9919fb2593	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:30.304	2026-06-02 11:15:30.304	MANUAL
16eb92f1-ba23-4042-b65a-b60ba1f6d3c4	73b58df4-b989-4b1d-bcbd-25b92dac3bab	60	YELLOW_CARD	\N	3417e483-f0c7-499f-8d1b-bc919f0e2ee6	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:30.315	2026-06-02 11:15:30.315	MANUAL
77c653af-f34e-4d07-b0aa-d9d6df144817	73b58df4-b989-4b1d-bcbd-25b92dac3bab	42	RED_CARD	\N	4ff0de8a-29b6-41c9-8d7c-d5420a9a2f3e	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:30.325	2026-06-02 11:15:30.325	MANUAL
5a5ea267-0cd9-4b19-b92d-ee9002d02e0a	73b58df4-b989-4b1d-bcbd-25b92dac3bab	54	YELLOW_CARD	\N	adc3e3c3-3089-45f7-94b2-e50e2a0f45b7	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:30.338	2026-06-02 11:15:30.338	MANUAL
100c3390-df77-4dc6-895b-f961f857abaf	73b58df4-b989-4b1d-bcbd-25b92dac3bab	74	YELLOW_CARD	\N	a1e6e78f-0d43-4fbd-93cc-29becafda938	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:30.347	2026-06-02 11:15:30.347	MANUAL
482b0a33-ed12-400d-81ea-b8ae1ba2e619	73b58df4-b989-4b1d-bcbd-25b92dac3bab	63	YELLOW_CARD	\N	1151d340-4c5a-43d9-972b-9d4588f5b161	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:30.358	2026-06-02 11:15:30.358	MANUAL
3ef6a592-1c4c-469e-ab18-750d95667131	73b58df4-b989-4b1d-bcbd-25b92dac3bab	90	YELLOW_CARD	\N	905df635-54dd-4be1-8335-59bb231e197c	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:30.369	2026-06-02 11:15:30.369	MANUAL
53d4360c-774c-4302-82ed-70e14808e731	dbeef7f6-fa0c-4e80-9277-538a2ac142d4	34	GOAL	\N	f352b9fc-8849-48e0-9d69-e38f56336616	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:30.391	2026-06-02 11:15:30.391	MANUAL
e48d8c26-d56c-4963-8b09-fe0684f3384c	dbeef7f6-fa0c-4e80-9277-538a2ac142d4	15	GOAL	\N	59c80b78-0ea4-4658-ae66-ee440a1acb6b	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:30.401	2026-06-02 11:15:30.401	MANUAL
7f569eb7-1781-46ba-8e95-2fb8efbed25f	dbeef7f6-fa0c-4e80-9277-538a2ac142d4	45	GOAL	\N	59c80b78-0ea4-4658-ae66-ee440a1acb6b	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:30.412	2026-06-02 11:15:30.412	MANUAL
fee1e8a3-252b-4f4c-9a27-5f5aef571ce7	dbeef7f6-fa0c-4e80-9277-538a2ac142d4	21	GOAL	\N	55f41c5a-faea-4da5-8da6-903e41e6d2eb	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:30.424	2026-06-02 11:15:30.424	MANUAL
295affd3-69ba-4117-912c-84968454b297	dbeef7f6-fa0c-4e80-9277-538a2ac142d4	47	GOAL	\N	55f41c5a-faea-4da5-8da6-903e41e6d2eb	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:30.434	2026-06-02 11:15:30.434	MANUAL
b9077732-026d-450f-be78-66e7c9fee384	dbeef7f6-fa0c-4e80-9277-538a2ac142d4	56	YELLOW_CARD	\N	3389df71-c069-4fe8-ab83-8bc0cf0434f4	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:30.447	2026-06-02 11:15:30.447	MANUAL
1763a156-0647-4a30-98df-3487d620f6b1	dbeef7f6-fa0c-4e80-9277-538a2ac142d4	18	YELLOW_CARD	\N	c9c51b77-9c7c-43b6-9088-ac378d7fc29b	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:30.469	2026-06-02 11:15:30.469	MANUAL
ae131aa2-b623-4181-b4f3-8da857e598ac	ea39cb69-b7c7-484f-b818-7a2560bed5a4	37	GOAL	\N	e158a991-7474-4d9a-afbd-7a66ef78b014	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:30.497	2026-06-02 11:15:30.497	MANUAL
c433191d-04bf-4f23-9801-eb439a4c32d8	ea39cb69-b7c7-484f-b818-7a2560bed5a4	21	GOAL	\N	0f22ec25-66cd-4672-aa2a-57ee4a348e4f	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:30.507	2026-06-02 11:15:30.507	MANUAL
e63736d6-5eeb-40c6-9008-e6863dae58e8	ea39cb69-b7c7-484f-b818-7a2560bed5a4	65	GOAL	\N	789db303-245e-41ab-ae99-7428d0eec815	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:30.521	2026-06-02 11:15:30.521	MANUAL
d4a521ae-4fd4-4f57-ad2a-4f026736831e	ea39cb69-b7c7-484f-b818-7a2560bed5a4	52	GOAL	\N	6fe67016-7213-4f39-bcc4-6cbaa4d16044	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:30.531	2026-06-02 11:15:30.531	MANUAL
a21d4ced-78bb-45c7-afe3-b2f761d4cead	ea39cb69-b7c7-484f-b818-7a2560bed5a4	56	YELLOW_CARD	\N	62827757-6c88-4e49-93b8-110158b08b9a	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:30.546	2026-06-02 11:15:30.546	MANUAL
6157e816-1a5f-4e2d-b333-4c8d08b053ec	ea39cb69-b7c7-484f-b818-7a2560bed5a4	18	YELLOW_CARD	\N	0efaaaeb-93b5-443f-9bfb-387c68cb22cb	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:30.564	2026-06-02 11:15:30.564	MANUAL
f73e82b6-7f77-4753-aabc-a43d8fcb444a	ea39cb69-b7c7-484f-b818-7a2560bed5a4	50	YELLOW_CARD	\N	fb32cc88-94b0-4ae9-871d-4cc0c3796e82	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:30.581	2026-06-02 11:15:30.581	MANUAL
277dfec0-e74d-4437-bdc6-ff86b5d2dab5	2011a3f3-7df2-4f03-b106-d1eb6fee0fde	19	GOAL	\N	256f7828-b235-42d1-b366-6f2f78ee0a03	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:30.604	2026-06-02 11:15:30.604	MANUAL
a1a915d7-3788-42d4-85e5-82d2426ee76c	2011a3f3-7df2-4f03-b106-d1eb6fee0fde	29	GOAL	\N	6735188e-9843-449f-a895-24aa7c3dd2ce	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:30.613	2026-06-02 11:15:30.613	MANUAL
c79e4f0c-d74f-4705-9e25-9f6aae76b9d1	2011a3f3-7df2-4f03-b106-d1eb6fee0fde	89	YELLOW_CARD	\N	ca6d5729-d2bf-40a3-bcbe-6e790c87b295	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:30.627	2026-06-02 11:15:30.627	MANUAL
4107b581-12f3-4431-8433-5a8d38bc5e48	2011a3f3-7df2-4f03-b106-d1eb6fee0fde	79	YELLOW_CARD	\N	6735188e-9843-449f-a895-24aa7c3dd2ce	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:30.644	2026-06-02 11:15:30.644	MANUAL
55531d4e-bcb1-4162-ad09-33ef3bbaf6a9	2011a3f3-7df2-4f03-b106-d1eb6fee0fde	43	RED_CARD	\N	260f1985-deaa-4613-b9f7-052e204278a9	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:30.654	2026-06-02 11:15:30.654	MANUAL
c5915636-6caa-4bd1-b631-1a07205ce059	2011a3f3-7df2-4f03-b106-d1eb6fee0fde	43	YELLOW_CARD	\N	083c54e2-0c3b-464b-86e4-fdaa38327498	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:30.669	2026-06-02 11:15:30.669	MANUAL
10b24f4b-708c-4a26-9ff5-772256280d9a	2011a3f3-7df2-4f03-b106-d1eb6fee0fde	32	YELLOW_CARD	\N	4c5db777-5925-4259-b331-5cf0ac5450d1	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:30.685	2026-06-02 11:15:30.685	MANUAL
e409437e-6694-4fc2-91fa-094dce57de48	2011a3f3-7df2-4f03-b106-d1eb6fee0fde	36	YELLOW_CARD	\N	34f8950e-7501-406c-bfc1-a87ea63346d9	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:30.695	2026-06-02 11:15:30.695	MANUAL
c8602c02-a32e-4195-aa7d-dbb9e65a195a	33b6f25c-146a-4f5a-8128-124b45fb1a18	23	GOAL	\N	adc3e3c3-3089-45f7-94b2-e50e2a0f45b7	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:30.719	2026-06-02 11:15:30.719	MANUAL
4ebcaa93-8a01-46c1-902e-d056a85331db	33b6f25c-146a-4f5a-8128-124b45fb1a18	45	GOAL	\N	905df635-54dd-4be1-8335-59bb231e197c	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:30.728	2026-06-02 11:15:30.728	MANUAL
0deae05f-8226-4864-82c4-ebb4f593476e	33b6f25c-146a-4f5a-8128-124b45fb1a18	42	GOAL	\N	3e0dce3f-45c9-4ae0-90a0-aeaa26e4ea03	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:30.739	2026-06-02 11:15:30.739	MANUAL
4aefbac9-1484-4d0c-851c-81dd8c2fd207	33b6f25c-146a-4f5a-8128-124b45fb1a18	21	GOAL	\N	bc404298-9f05-41a1-afd4-1b07bf187605	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:30.752	2026-06-02 11:15:30.752	MANUAL
f94dbc1f-958d-460b-b894-f11e89c9950e	33b6f25c-146a-4f5a-8128-124b45fb1a18	33	GOAL	\N	8f5acf7e-6f07-4060-9ef9-2c9f746ba0ca	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:30.769	2026-06-02 11:15:30.769	MANUAL
0ce46da7-ace4-4e31-9939-8cae08848cfa	33b6f25c-146a-4f5a-8128-124b45fb1a18	56	GOAL	\N	6e13329e-8110-4820-a0b4-4cf2871f9105	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:30.78	2026-06-02 11:15:30.78	MANUAL
eb5c20bd-a6d6-4737-aa9e-8b7fe2bfb4e2	33b6f25c-146a-4f5a-8128-124b45fb1a18	43	YELLOW_CARD	\N	2f213449-ff48-4bc2-8563-62de5de3d7cb	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:30.786	2026-06-02 11:15:30.786	MANUAL
b1fe7354-4961-48b5-9f57-def76520ea27	33b6f25c-146a-4f5a-8128-124b45fb1a18	88	YELLOW_CARD	\N	a1e6e78f-0d43-4fbd-93cc-29becafda938	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:30.804	2026-06-02 11:15:30.804	MANUAL
68bdfc0b-801e-494b-9e47-10b234fc102c	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	11	GOAL	\N	886d4630-3234-43c9-8970-b82bf4da2978	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:30.837	2026-06-02 11:15:30.837	MANUAL
ca2e0b6f-bbb1-41be-9f1b-cb7020121d70	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	28	GOAL	\N	11bf43c2-181c-4ce1-aac5-48456ad3f456	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:30.846	2026-06-02 11:15:30.846	MANUAL
b7d17def-87bb-4960-83cf-6ec135829256	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	37	GOAL	\N	60011408-bbc0-463a-bf9e-771f84907127	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:30.858	2026-06-02 11:15:30.858	MANUAL
5dd8a794-75dd-411e-84ef-82ad8de7073c	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	21	GOAL	\N	e79054d0-faa0-4c5b-ba3a-e547e08edaf4	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:30.868	2026-06-02 11:15:30.868	MANUAL
20fd5a9e-6346-455d-beeb-ae905e91e1ee	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	31	GOAL	\N	60011408-bbc0-463a-bf9e-771f84907127	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:30.878	2026-06-02 11:15:30.878	MANUAL
9d3d5818-5255-4bb6-a907-c9f9ad1d7408	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	36	YELLOW_CARD	\N	054d97fa-60e2-42e8-afbd-1f85fe38d500	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:30.891	2026-06-02 11:15:30.891	MANUAL
f53a7025-8ac2-4284-92ff-52774b2b908c	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	50	YELLOW_CARD	\N	e938c0f1-e9bb-474d-9f0a-c7bd21909dea	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:30.909	2026-06-02 11:15:30.909	MANUAL
d8292dc4-550e-4dd1-bc5d-02a96bf00422	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	51	YELLOW_CARD	\N	3f35e406-0db1-4c43-a3e6-b9ad6622a9b3	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:30.92	2026-06-02 11:15:30.92	MANUAL
289b4228-117b-4933-8943-033d7e9cb6f4	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	76	RED_CARD	\N	55f41c5a-faea-4da5-8da6-903e41e6d2eb	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:30.93	2026-06-02 11:15:30.93	MANUAL
6e083bf1-cbfc-4128-9e39-0477b50d2d75	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	88	YELLOW_CARD	\N	e6ba34f6-3257-4a84-870a-a362c6b92209	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:30.943	2026-06-02 11:15:30.943	MANUAL
74bed16d-eddd-4ad8-a52d-00474acd73a4	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	32	RED_CARD	\N	07d2f52b-f9f0-407a-921f-f878f17fb3af	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:30.946	2026-06-02 11:15:30.946	MANUAL
675047e1-39e2-47ae-976f-ced852da4ec7	637c8078-4ee3-48ce-9db4-ad52f10162d6	26	GOAL	\N	6fe67016-7213-4f39-bcc4-6cbaa4d16044	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:30.97	2026-06-02 11:15:30.97	MANUAL
db2128c6-d814-48ba-b717-6d7884ad45e2	637c8078-4ee3-48ce-9db4-ad52f10162d6	43	GOAL	\N	f33bb96a-e2ad-4b28-9486-1be383eec0fe	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:30.978	2026-06-02 11:15:30.978	MANUAL
27ee2a3f-e964-4864-99a5-c12ad2529bac	637c8078-4ee3-48ce-9db4-ad52f10162d6	39	GOAL	\N	789db303-245e-41ab-ae99-7428d0eec815	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:30.987	2026-06-02 11:15:30.987	MANUAL
ecd773d8-147a-49b9-bd5d-9cd7faf12c6c	637c8078-4ee3-48ce-9db4-ad52f10162d6	61	GOAL	\N	5c258961-6034-4bdf-ad36-29b8f222894b	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:31.005	2026-06-02 11:15:31.005	MANUAL
a91999ba-29b2-4608-8d99-995ff75bf3ac	637c8078-4ee3-48ce-9db4-ad52f10162d6	22	GOAL	\N	4ff0de8a-29b6-41c9-8d7c-d5420a9a2f3e	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:31.016	2026-06-02 11:15:31.016	MANUAL
94d6176e-f0e4-4206-8617-0c783fcb11ef	637c8078-4ee3-48ce-9db4-ad52f10162d6	39	GOAL	\N	865fa516-4671-4ec9-985d-a35deb7486cd	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:31.019	2026-06-02 11:15:31.019	MANUAL
55c46234-8b1a-4767-8457-ef8b43754b53	637c8078-4ee3-48ce-9db4-ad52f10162d6	48	GOAL	\N	865fa516-4671-4ec9-985d-a35deb7486cd	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:31.023	2026-06-02 11:15:31.023	MANUAL
6cb530ba-5c0e-4237-8822-935488e1c0ae	637c8078-4ee3-48ce-9db4-ad52f10162d6	39	YELLOW_CARD	\N	5762e75e-38db-4de5-aab9-1ff35cfa932f	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:31.028	2026-06-02 11:15:31.028	MANUAL
d26525b1-2005-4538-bc24-9652d2ed652a	637c8078-4ee3-48ce-9db4-ad52f10162d6	31	YELLOW_CARD	\N	f33bb96a-e2ad-4b28-9486-1be383eec0fe	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:31.03	2026-06-02 11:15:31.03	MANUAL
4e6b0dc2-7d8f-40df-8be5-f02ce2343613	637c8078-4ee3-48ce-9db4-ad52f10162d6	36	YELLOW_CARD	\N	81c33883-d719-4311-9d72-bb8680c299ff	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:31.04	2026-06-02 11:15:31.04	MANUAL
8bf5d6c1-de74-4aba-9bfb-92fea99d46ec	637c8078-4ee3-48ce-9db4-ad52f10162d6	34	YELLOW_CARD	\N	eb3c6d80-4872-4e11-82e9-73cca51a56a6	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:31.049	2026-06-02 11:15:31.049	MANUAL
e4b3d2ea-2a70-4865-ae36-3be177f6d675	637c8078-4ee3-48ce-9db4-ad52f10162d6	42	YELLOW_CARD	\N	4ff0de8a-29b6-41c9-8d7c-d5420a9a2f3e	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:31.061	2026-06-02 11:15:31.061	MANUAL
041415f5-124c-498a-b875-f6fc2a3b6b35	637c8078-4ee3-48ce-9db4-ad52f10162d6	74	RED_CARD	\N	973f5ef4-63ca-45ea-93ea-0d541bd3cd0c	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:31.075	2026-06-02 11:15:31.075	MANUAL
fe1b0443-a1f6-4813-af30-f5e5a85ac198	62c65337-77ae-41c5-8a84-6039c7401a44	11	GOAL	\N	6d3aac5f-9b85-42e6-acdc-40794a182aa8	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:31.101	2026-06-02 11:15:31.101	MANUAL
cf1b623e-1e7d-45e0-b9ed-b837f210b8a8	62c65337-77ae-41c5-8a84-6039c7401a44	26	GOAL	\N	5748dfe1-b83f-4411-a471-279d102cf21f	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:31.112	2026-06-02 11:15:31.112	MANUAL
96e2d7cb-2a80-4708-ac3a-a4226c920f0c	62c65337-77ae-41c5-8a84-6039c7401a44	21	GOAL	\N	e9cc0414-19cb-4ce7-86a5-2b8356172b7e	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:31.127	2026-06-02 11:15:31.127	MANUAL
f082008d-9837-40d5-875e-d030c489568a	62c65337-77ae-41c5-8a84-6039c7401a44	29	GOAL	\N	f352b9fc-8849-48e0-9d69-e38f56336616	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:31.139	2026-06-02 11:15:31.139	MANUAL
13b9d8e5-6630-4184-9b03-d7de9fe1832c	62c65337-77ae-41c5-8a84-6039c7401a44	60	GOAL	\N	47dddbb3-0986-44bc-ba51-db33bb64ceab	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:31.152	2026-06-02 11:15:31.152	MANUAL
aa35c477-81fd-4dd4-a9cb-e2a0ec9cf291	62c65337-77ae-41c5-8a84-6039c7401a44	44	GOAL	\N	47dddbb3-0986-44bc-ba51-db33bb64ceab	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:31.155	2026-06-02 11:15:31.155	MANUAL
55c2e5ff-4d80-48a2-a0f0-df3fc5469a92	62c65337-77ae-41c5-8a84-6039c7401a44	28	YELLOW_CARD	\N	69396e2d-6c37-4ffa-b852-86f9a51e53ae	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:31.161	2026-06-02 11:15:31.161	MANUAL
a192e896-2416-4f7d-bc85-8dca8d468da6	62c65337-77ae-41c5-8a84-6039c7401a44	47	YELLOW_CARD	\N	b3f559ed-95c2-4c77-8731-dc68ff546a6b	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:31.164	2026-06-02 11:15:31.164	MANUAL
270dfb54-b90c-4510-ab59-58f67a5f5d54	62c65337-77ae-41c5-8a84-6039c7401a44	58	YELLOW_CARD	\N	29d1923b-b2c6-4f7e-9a1b-27e6aeb043e9	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:31.167	2026-06-02 11:15:31.167	MANUAL
f1827bca-df5d-4891-afed-970fcc20c4b3	a23e96ef-1533-4c9d-b69d-8bacddc063f1	27	GOAL	\N	555d8e12-17b7-452a-817a-983759cbd245	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:31.195	2026-06-02 11:15:31.195	MANUAL
0aec6ee2-2fac-46b2-ab91-e4567a6ffe2d	a23e96ef-1533-4c9d-b69d-8bacddc063f1	25	GOAL	\N	9f0eedf2-f842-4723-906d-b885295b032b	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:31.217	2026-06-02 11:15:31.217	MANUAL
9993e736-254e-44ba-8c32-9b6fc7fe01af	a23e96ef-1533-4c9d-b69d-8bacddc063f1	38	YELLOW_CARD	\N	1ca283d1-063e-498f-8db9-11a0dfe58498	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:31.235	2026-06-02 11:15:31.235	MANUAL
5fade1bb-6f20-478f-9723-df9ccd723656	a23e96ef-1533-4c9d-b69d-8bacddc063f1	48	YELLOW_CARD	\N	205c6054-edee-4208-91e9-89d2b3134023	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:31.237	2026-06-02 11:15:31.237	MANUAL
803cf676-0002-46ab-92d7-51b7c8e88ac5	a23e96ef-1533-4c9d-b69d-8bacddc063f1	58	YELLOW_CARD	\N	efefb516-da08-4d8f-b9cc-e3c4a9d6ace0	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:31.249	2026-06-02 11:15:31.249	MANUAL
9d851ae4-db11-46ef-ae87-87f8ef015ea0	a23e96ef-1533-4c9d-b69d-8bacddc063f1	66	YELLOW_CARD	\N	a7549eda-d173-452d-944a-1403d31b2b79	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:31.261	2026-06-02 11:15:31.261	MANUAL
74f07ec7-e1c0-4e46-9c14-6ed541f63e62	a23e96ef-1533-4c9d-b69d-8bacddc063f1	74	RED_CARD	\N	6a007a21-a220-4773-b5aa-c2e4223b2c41	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:31.264	2026-06-02 11:15:31.264	MANUAL
2c5deeb8-d3ae-4e4c-abb1-e74b2b416a32	999b3810-edbc-4c00-857b-503a42288ce2	16	GOAL	\N	5d565b26-05f6-426c-b980-8d3713745836	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:31.287	2026-06-02 11:15:31.287	MANUAL
77cc80a4-29de-40ab-957a-aaecba15d58a	999b3810-edbc-4c00-857b-503a42288ce2	38	GOAL	\N	cad98842-45b6-4371-beac-fde6d374201a	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:31.298	2026-06-02 11:15:31.298	MANUAL
50ac813b-2110-4b17-868d-dc5a692ff344	999b3810-edbc-4c00-857b-503a42288ce2	33	GOAL	\N	4c660b28-9715-44cb-8d97-6545685890db	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:31.308	2026-06-02 11:15:31.308	MANUAL
9776064d-1dfe-43de-9d19-aa90ba93fc1d	999b3810-edbc-4c00-857b-503a42288ce2	60	GOAL	\N	3d129cc0-c291-4187-a41e-0c70a9e27a9c	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:31.318	2026-06-02 11:15:31.318	MANUAL
bcd3c6ad-6d27-4d2a-bd02-c62933d81fee	999b3810-edbc-4c00-857b-503a42288ce2	70	YELLOW_CARD	\N	3f35e406-0db1-4c43-a3e6-b9ad6622a9b3	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:31.334	2026-06-02 11:15:31.334	MANUAL
be408d20-7852-4244-b156-342436bcdb9b	999b3810-edbc-4c00-857b-503a42288ce2	43	YELLOW_CARD	\N	d2f9007d-a97d-4769-8598-88723b2acdcf	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:31.352	2026-06-02 11:15:31.352	MANUAL
1e82203b-2426-4e6a-bef0-3e0a5962e6d9	999b3810-edbc-4c00-857b-503a42288ce2	45	YELLOW_CARD	\N	cad98842-45b6-4371-beac-fde6d374201a	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:31.363	2026-06-02 11:15:31.363	MANUAL
506cd558-da72-4973-9e8e-8c0254277925	9086183b-6ea8-4da1-a7a3-68c43db51601	18	GOAL	\N	6a466d46-5ae4-4ae8-b1b8-91063f307b8e	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:31.388	2026-06-02 11:15:31.388	MANUAL
e08fb8be-998b-4946-8d94-0d5495e8bdfd	9086183b-6ea8-4da1-a7a3-68c43db51601	31	GOAL	\N	5762e75e-38db-4de5-aab9-1ff35cfa932f	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:31.393	2026-06-02 11:15:31.393	MANUAL
a64d0c64-0aa0-4a46-b59c-6fce2732353a	9086183b-6ea8-4da1-a7a3-68c43db51601	46	GOAL	\N	5c258961-6034-4bdf-ad36-29b8f222894b	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:31.402	2026-06-02 11:15:31.402	MANUAL
a5fb1c45-5cf1-461c-9865-ebf0eb17b521	9086183b-6ea8-4da1-a7a3-68c43db51601	27	GOAL	\N	c529f861-b19f-4e5c-ac34-70f5d23ac062	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:31.412	2026-06-02 11:15:31.412	MANUAL
fac9507f-6a7e-4d08-a3c1-0cdd9ba8c39c	9086183b-6ea8-4da1-a7a3-68c43db51601	49	GOAL	\N	0c0b84f1-27a1-4b72-a1c8-1ec4914b17ca	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:31.423	2026-06-02 11:15:31.423	MANUAL
c8130796-c2d6-47c4-80d6-8e14fccdb014	9086183b-6ea8-4da1-a7a3-68c43db51601	48	YELLOW_CARD	\N	6e13329e-8110-4820-a0b4-4cf2871f9105	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:31.436	2026-06-02 11:15:31.436	MANUAL
4a7d2585-4850-4d20-bc1a-437bb819d511	9086183b-6ea8-4da1-a7a3-68c43db51601	45	YELLOW_CARD	\N	ac16b296-4e56-4599-9677-b0069346e77b	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:31.453	2026-06-02 11:15:31.453	MANUAL
7173088f-34c5-4f20-bb4a-f5f7db46b0fa	9086183b-6ea8-4da1-a7a3-68c43db51601	52	RED_CARD	\N	b2a0489f-e8a6-4c81-a459-179fa9e10c24	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:31.463	2026-06-02 11:15:31.463	MANUAL
6bdb4d31-0355-47dd-aed4-b8ce0c435612	9086183b-6ea8-4da1-a7a3-68c43db51601	74	YELLOW_CARD	\N	4a03a0ce-c2d9-4722-8eca-1295932cee8a	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:31.478	2026-06-02 11:15:31.478	MANUAL
3fc93ef3-9cf7-4af3-961f-ddf6dd72459a	9086183b-6ea8-4da1-a7a3-68c43db51601	56	YELLOW_CARD	\N	4985190f-b59a-431e-a2f5-8929279d1cb7	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:31.495	2026-06-02 11:15:31.495	MANUAL
23e81a7f-751e-431b-a716-cf1a6f877acc	9086183b-6ea8-4da1-a7a3-68c43db51601	42	YELLOW_CARD	\N	72cc0e6c-ea6c-4199-9f76-978a59f33f75	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:31.497	2026-06-02 11:15:31.497	MANUAL
cbf517da-5355-432a-9c19-2ec2e08af672	9086183b-6ea8-4da1-a7a3-68c43db51601	49	YELLOW_CARD	\N	0f22ec25-66cd-4672-aa2a-57ee4a348e4f	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:31.508	2026-06-02 11:15:31.508	MANUAL
6068c584-0560-4469-a6d6-baf4819ee430	6b0ad60e-7aeb-4e85-86af-4176e67dd633	22	GOAL	\N	60011408-bbc0-463a-bf9e-771f84907127	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:31.531	2026-06-02 11:15:31.531	MANUAL
49e4fe68-43ee-4445-bff0-d10b58668e52	6b0ad60e-7aeb-4e85-86af-4176e67dd633	16	GOAL	\N	e6ba34f6-3257-4a84-870a-a362c6b92209	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:31.541	2026-06-02 11:15:31.541	MANUAL
d5fda9b5-eb4c-4ddf-acf1-a48a21e7fe28	6b0ad60e-7aeb-4e85-86af-4176e67dd633	38	GOAL	\N	3e5f4e61-0f76-4eb8-b360-d33eb6d0df17	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:31.551	2026-06-02 11:15:31.551	MANUAL
268399c9-59dd-4ec6-bc8a-00bb716a67d3	6b0ad60e-7aeb-4e85-86af-4176e67dd633	22	YELLOW_CARD	\N	c12c528c-5ec3-41e9-8250-970149c465fe	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:31.563	2026-06-02 11:15:31.563	MANUAL
48b63552-5881-41cc-815a-8dfe40508763	6b0ad60e-7aeb-4e85-86af-4176e67dd633	48	YELLOW_CARD	\N	7a8d9d41-a57c-43a8-a6ea-fd17bd210051	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:31.572	2026-06-02 11:15:31.572	MANUAL
ecfb50f5-c6d8-4cad-afb5-fd61bb31d967	6b0ad60e-7aeb-4e85-86af-4176e67dd633	80	RED_CARD	\N	60011408-bbc0-463a-bf9e-771f84907127	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:31.584	2026-06-02 11:15:31.584	MANUAL
903a6251-0084-488e-b5ef-f44e1fd771aa	6b0ad60e-7aeb-4e85-86af-4176e67dd633	77	YELLOW_CARD	\N	715c093a-e1e3-46fc-b6a2-e4d8d366fe88	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:31.596	2026-06-02 11:15:31.596	MANUAL
0e0772ea-1665-411e-a297-1f8981df6698	6b0ad60e-7aeb-4e85-86af-4176e67dd633	79	YELLOW_CARD	\N	b9f7457a-c3fc-4add-b1b0-76403194f62b	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:31.604	2026-06-02 11:15:31.604	MANUAL
9ebad5fa-f29d-4530-a4de-989aae2c9983	6b0ad60e-7aeb-4e85-86af-4176e67dd633	45	YELLOW_CARD	\N	60d653ac-eb22-45e0-a9a0-f72bebe8727e	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:31.616	2026-06-02 11:15:31.616	MANUAL
9db5f829-70f3-413c-b37c-38b4700bc339	6b0ad60e-7aeb-4e85-86af-4176e67dd633	51	YELLOW_CARD	\N	f3132686-c696-4c7e-a1fc-e8e11a298cef	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:31.625	2026-06-02 11:15:31.625	MANUAL
622b7ed4-4095-48b8-86a1-12aa238db474	6b0ad60e-7aeb-4e85-86af-4176e67dd633	18	RED_CARD	\N	0ff5133a-2294-49bf-8d84-4e809ff19d7a	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:31.636	2026-06-02 11:15:31.636	MANUAL
ceb70cad-7565-4908-abde-d8d9a75a018f	0a809e4e-bf49-4832-b760-f144bb9583ae	13	GOAL	\N	c735827f-8c62-42a4-9ee6-2abb1f707533	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:31.659	2026-06-02 11:15:31.659	MANUAL
f261adf2-ba6b-4418-946a-bce8ec236607	0a809e4e-bf49-4832-b760-f144bb9583ae	51	GOAL	\N	741b421a-ed7e-4167-b718-75f7a69dde85	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:31.668	2026-06-02 11:15:31.668	MANUAL
a96c632e-af8f-4a4f-812f-fbd1214f6936	0a809e4e-bf49-4832-b760-f144bb9583ae	41	GOAL	\N	5fd6264b-e7cd-442f-95b0-332afe96014b	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:31.678	2026-06-02 11:15:31.678	MANUAL
31c972d1-a6af-453c-8688-cd39d19642e7	0a809e4e-bf49-4832-b760-f144bb9583ae	47	GOAL	\N	741b421a-ed7e-4167-b718-75f7a69dde85	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:31.689	2026-06-02 11:15:31.689	MANUAL
edc29467-22fb-411c-90da-d69644197e0d	0a809e4e-bf49-4832-b760-f144bb9583ae	17	GOAL	\N	ae87d895-59bb-467e-b4a1-b44570b8d9ff	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:31.701	2026-06-02 11:15:31.701	MANUAL
f1e71720-7c57-459b-8b1b-a6bd21079a93	0a809e4e-bf49-4832-b760-f144bb9583ae	49	GOAL	\N	081b3c23-209e-430c-8b81-7333f0aa79a6	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:31.71	2026-06-02 11:15:31.71	MANUAL
afa475e2-589d-4c12-96a6-26e0f8523823	0a809e4e-bf49-4832-b760-f144bb9583ae	53	GOAL	\N	e918c7db-bbc4-4668-9f50-d61758c214f4	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:31.721	2026-06-02 11:15:31.721	MANUAL
bd088f3f-792e-4e22-be37-c7ee58868507	0a809e4e-bf49-4832-b760-f144bb9583ae	64	YELLOW_CARD	\N	ae87d895-59bb-467e-b4a1-b44570b8d9ff	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:31.737	2026-06-02 11:15:31.737	MANUAL
93deb8af-6544-4f3f-a50e-5fd69a2aa256	0a809e4e-bf49-4832-b760-f144bb9583ae	86	YELLOW_CARD	\N	a2e5a8ed-2fa2-45ac-85cd-5d90a336ee74	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:31.752	2026-06-02 11:15:31.752	MANUAL
49d18e62-8761-49c7-9d43-17b16ee7bdba	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	19	GOAL	\N	205c6054-edee-4208-91e9-89d2b3134023	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:31.777	2026-06-02 11:15:31.777	MANUAL
a6b2008e-b7fb-4f50-9e26-5340e30f007e	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	17	GOAL	\N	256f7828-b235-42d1-b366-6f2f78ee0a03	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:31.793	2026-06-02 11:15:31.793	MANUAL
d2113847-3087-4a92-a593-346deeec10ca	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	37	GOAL	\N	bcfa46ff-aa79-4a6d-b465-4e2369050a8b	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:31.805	2026-06-02 11:15:31.805	MANUAL
b107a26c-9742-4bd9-9068-c315029012cb	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	31	GOAL	\N	abe574fc-a574-4180-a66c-9cd8e7c2c480	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:31.814	2026-06-02 11:15:31.814	MANUAL
1319a302-7c82-4174-be25-fdfe3b29d34a	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	61	GOAL	\N	e938c0f1-e9bb-474d-9f0a-c7bd21909dea	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:31.826	2026-06-02 11:15:31.826	MANUAL
9bf57fc2-ab09-4eef-aad9-6b9ece78228e	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	46	GOAL	\N	c9c51b77-9c7c-43b6-9088-ac378d7fc29b	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:31.837	2026-06-02 11:15:31.837	MANUAL
1aa65338-40bb-4ce4-9121-732bceb5331e	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	28	YELLOW_CARD	\N	256f7828-b235-42d1-b366-6f2f78ee0a03	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:31.849	2026-06-02 11:15:31.849	MANUAL
0983b4d0-fc98-44d2-9946-63ddcc5dd292	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	90	YELLOW_CARD	\N	2685078f-48ae-4a23-bc94-feb1184fbfe3	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:31.868	2026-06-02 11:15:31.868	MANUAL
3619a419-d01c-49c6-b1c7-248fe979b183	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	31	YELLOW_CARD	\N	68e4189a-bd8f-45a7-b1f8-7b92be25c1de	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:31.877	2026-06-02 11:15:31.877	MANUAL
23f7bb15-1b2f-4062-8b6d-c2a4f679cfdf	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	61	YELLOW_CARD	\N	55f41c5a-faea-4da5-8da6-903e41e6d2eb	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:31.892	2026-06-02 11:15:31.892	MANUAL
2fb0c2cd-95f0-400e-998a-7ca603be7332	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	84	YELLOW_CARD	\N	886d4630-3234-43c9-8970-b82bf4da2978	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:31.9	2026-06-02 11:15:31.9	MANUAL
751f94fc-e845-4468-9430-9de3b06f7ffa	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	33	RED_CARD	\N	e938c0f1-e9bb-474d-9f0a-c7bd21909dea	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:31.91	2026-06-02 11:15:31.91	MANUAL
a3f80cda-7a14-4a72-9ab1-e07c6406d41b	804c82da-f26b-41ac-9578-acd4179f6e1d	14	GOAL	\N	0c0b84f1-27a1-4b72-a1c8-1ec4914b17ca	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:31.952	2026-06-02 11:15:31.952	MANUAL
c9ea90ff-9a73-4b97-a3af-107bc862c9c8	804c82da-f26b-41ac-9578-acd4179f6e1d	12	GOAL	\N	a1e6e78f-0d43-4fbd-93cc-29becafda938	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:31.964	2026-06-02 11:15:31.964	MANUAL
1b7714ef-a5c3-4a8c-bf8f-893cac4ed1d7	804c82da-f26b-41ac-9578-acd4179f6e1d	23	GOAL	\N	a1e6e78f-0d43-4fbd-93cc-29becafda938	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:31.974	2026-06-02 11:15:31.974	MANUAL
7f5aa5fd-02c2-460d-8db0-dccfdece84b0	804c82da-f26b-41ac-9578-acd4179f6e1d	56	GOAL	\N	fa224542-f66f-4ef3-bb81-8b4662caaf1d	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:31.985	2026-06-02 11:15:31.985	MANUAL
c8be82aa-6a44-4632-9391-938fc3ed607a	804c82da-f26b-41ac-9578-acd4179f6e1d	74	GOAL	\N	3e0dce3f-45c9-4ae0-90a0-aeaa26e4ea03	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:31.995	2026-06-02 11:15:31.995	MANUAL
35b3e455-5198-4fbb-b296-a46d0fc3da25	804c82da-f26b-41ac-9578-acd4179f6e1d	20	YELLOW_CARD	\N	73efed03-f16e-4ed8-98e6-888c7979f07e	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:32.008	2026-06-02 11:15:32.008	MANUAL
174a1c34-a96e-4fd1-85ea-8e023a5c8ed6	804c82da-f26b-41ac-9578-acd4179f6e1d	81	YELLOW_CARD	\N	e158a991-7474-4d9a-afbd-7a66ef78b014	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:32.026	2026-06-02 11:15:32.026	MANUAL
465c81ab-1415-4bee-8821-36acd90d8987	804c82da-f26b-41ac-9578-acd4179f6e1d	51	YELLOW_CARD	\N	4985190f-b59a-431e-a2f5-8929279d1cb7	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:32.036	2026-06-02 11:15:32.036	MANUAL
43a6ba32-d40f-4ccf-bd5d-3d6521298026	804c82da-f26b-41ac-9578-acd4179f6e1d	19	YELLOW_CARD	\N	5c258961-6034-4bdf-ad36-29b8f222894b	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:32.046	2026-06-02 11:15:32.046	MANUAL
f87386d1-5aee-43e3-9fd8-52e926365c9f	804c82da-f26b-41ac-9578-acd4179f6e1d	50	YELLOW_CARD	\N	a1b73a7a-e57b-45c3-a9fe-dc2d235bd577	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:32.06	2026-06-02 11:15:32.06	MANUAL
4036b66d-16ab-43b1-a3a2-76ea9f5cc5bf	804c82da-f26b-41ac-9578-acd4179f6e1d	32	YELLOW_CARD	\N	a1e6e78f-0d43-4fbd-93cc-29becafda938	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:32.078	2026-06-02 11:15:32.078	MANUAL
52500f37-3347-458b-a67d-6914daf8c114	804c82da-f26b-41ac-9578-acd4179f6e1d	73	YELLOW_CARD	\N	905df635-54dd-4be1-8335-59bb231e197c	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:32.088	2026-06-02 11:15:32.088	MANUAL
10bd6e24-3426-4731-8e0b-0db1494ed424	804c82da-f26b-41ac-9578-acd4179f6e1d	62	RED_CARD	\N	2f213449-ff48-4bc2-8563-62de5de3d7cb	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:32.1	2026-06-02 11:15:32.1	MANUAL
1b2551a5-b0c6-4b71-9745-6786ca9ccdd6	5846bf30-13b4-489a-a919-9f8e6f8be675	25	GOAL	\N	7906653e-72a2-4bd1-ac70-947fd7116470	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:32.133	2026-06-02 11:15:32.133	MANUAL
2284b3dc-8090-4949-9b57-43233c79de5a	5846bf30-13b4-489a-a919-9f8e6f8be675	38	GOAL	\N	45a3236c-a1b5-47b5-8266-36e94c50a9b6	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.137	2026-06-02 11:15:32.137	MANUAL
7106128d-1f81-4a24-89c3-09bcff1c0f22	5846bf30-13b4-489a-a919-9f8e6f8be675	27	GOAL	\N	45a3236c-a1b5-47b5-8266-36e94c50a9b6	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.14	2026-06-02 11:15:32.14	MANUAL
5dd29b1f-6cc1-4744-ac49-41e6ccae39a1	5846bf30-13b4-489a-a919-9f8e6f8be675	37	GOAL	\N	83c4fb14-bf49-46ca-89f2-0a0055dc09ef	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.142	2026-06-02 11:15:32.142	MANUAL
6a2c56e8-f830-4aa6-b76c-e2318a752207	5846bf30-13b4-489a-a919-9f8e6f8be675	73	YELLOW_CARD	\N	326950ef-6602-41e4-b507-3ee6698dffd2	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:32.146	2026-06-02 11:15:32.146	MANUAL
8e9b0a6f-3490-4567-9eb3-00be2e88a4e1	5846bf30-13b4-489a-a919-9f8e6f8be675	79	YELLOW_CARD	\N	0ff5133a-2294-49bf-8d84-4e809ff19d7a	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:32.148	2026-06-02 11:15:32.148	MANUAL
c80b3ba1-a835-4919-8f62-7602605641df	5846bf30-13b4-489a-a919-9f8e6f8be675	56	RED_CARD	\N	60d653ac-eb22-45e0-a9a0-f72bebe8727e	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:32.151	2026-06-02 11:15:32.151	MANUAL
54c5710f-3d6f-4f55-a655-0067bcf3c02e	5846bf30-13b4-489a-a919-9f8e6f8be675	84	YELLOW_CARD	\N	6ad3d924-b654-4369-8665-e47844567ca1	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.156	2026-06-02 11:15:32.156	MANUAL
c87cea45-a427-4a07-a44b-5b9a6ce00a46	5846bf30-13b4-489a-a919-9f8e6f8be675	69	YELLOW_CARD	\N	237f4abf-af95-4a91-b823-a0935c5f102c	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.165	2026-06-02 11:15:32.165	MANUAL
359e3654-e73a-4cad-afc1-c7e8e7f0af44	5846bf30-13b4-489a-a919-9f8e6f8be675	57	YELLOW_CARD	\N	083c54e2-0c3b-464b-86e4-fdaa38327498	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.176	2026-06-02 11:15:32.176	MANUAL
2b1c48c3-e545-4e67-81e0-c9fffa889a54	5846bf30-13b4-489a-a919-9f8e6f8be675	89	YELLOW_CARD	\N	b3dd562c-ebc3-429e-af21-576e797dc54b	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.188	2026-06-02 11:15:32.188	MANUAL
b58b0d4e-35ee-4fe0-929f-b83e1415db4f	5846bf30-13b4-489a-a919-9f8e6f8be675	81	RED_CARD	\N	9192f495-0b42-4858-a0ba-6512175743c1	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.2	2026-06-02 11:15:32.2	MANUAL
88b1746c-093d-4dc8-b48e-46d4cd6eb85d	ceffb55c-2c1e-4387-b36f-b4150bd75819	34	GOAL	\N	3389df71-c069-4fe8-ab83-8bc0cf0434f4	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:32.224	2026-06-02 11:15:32.224	MANUAL
c47e883b-c72b-41a1-82c3-cdd92484448f	ceffb55c-2c1e-4387-b36f-b4150bd75819	41	GOAL	\N	a2e5a8ed-2fa2-45ac-85cd-5d90a336ee74	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:32.23	2026-06-02 11:15:32.23	MANUAL
1cc33b34-cedb-43c6-a5ba-837ad2bbc7da	ceffb55c-2c1e-4387-b36f-b4150bd75819	68	GOAL	\N	47dddbb3-0986-44bc-ba51-db33bb64ceab	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:32.234	2026-06-02 11:15:32.234	MANUAL
d0729d5b-f8aa-4976-b1d5-be749416ac2e	ceffb55c-2c1e-4387-b36f-b4150bd75819	34	GOAL	\N	bc404298-9f05-41a1-afd4-1b07bf187605	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:32.247	2026-06-02 11:15:32.247	MANUAL
81bcf0f6-539a-4df2-a714-65ee9e9b0620	ceffb55c-2c1e-4387-b36f-b4150bd75819	32	GOAL	\N	d3453aae-0fc9-4677-8474-db274b83351d	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:32.257	2026-06-02 11:15:32.257	MANUAL
91828cfe-60ce-4d2d-9c75-f08a4669a5e6	ceffb55c-2c1e-4387-b36f-b4150bd75819	39	GOAL	\N	43b490ee-e98c-48a3-beba-196babf51752	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:32.26	2026-06-02 11:15:32.26	MANUAL
b6435259-344b-45da-9053-3a9faa275c9e	ceffb55c-2c1e-4387-b36f-b4150bd75819	26	YELLOW_CARD	\N	3389df71-c069-4fe8-ab83-8bc0cf0434f4	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:32.275	2026-06-02 11:15:32.275	MANUAL
5eed38d6-ebed-4978-a3ca-c1fedea64543	ceffb55c-2c1e-4387-b36f-b4150bd75819	34	YELLOW_CARD	\N	081b3c23-209e-430c-8b81-7333f0aa79a6	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:32.293	2026-06-02 11:15:32.293	MANUAL
71036a8a-d024-4d39-bda7-19ec271f5a0c	ceffb55c-2c1e-4387-b36f-b4150bd75819	87	RED_CARD	\N	b3f559ed-95c2-4c77-8731-dc68ff546a6b	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:32.304	2026-06-02 11:15:32.304	MANUAL
f9111d61-a499-4441-a82e-44a82539391a	f73e99c6-1a2a-45da-9f77-32d25658b080	25	GOAL	\N	962d05f6-1bc4-4f21-98b8-6df6c3f23258	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:32.314	2026-06-02 11:15:32.314	MANUAL
e712a047-91fd-4ec2-974c-5c7fea287fd9	f73e99c6-1a2a-45da-9f77-32d25658b080	38	GOAL	\N	067eaca4-1837-4977-b4d9-dfd8441cedd7	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:32.325	2026-06-02 11:15:32.325	MANUAL
5480d4a6-afd6-446d-91f7-a0706d3f12dd	f73e99c6-1a2a-45da-9f77-32d25658b080	48	GOAL	\N	5fd6264b-e7cd-442f-95b0-332afe96014b	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:32.329	2026-06-02 11:15:32.329	MANUAL
ff275b1c-fb04-47a5-b2e3-58f50eda8e4d	f73e99c6-1a2a-45da-9f77-32d25658b080	23	YELLOW_CARD	\N	60676704-830a-4b5a-b8ad-4e26f7f2f73c	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:32.335	2026-06-02 11:15:32.335	MANUAL
8a84d2a4-897e-4a17-9ef0-c3da39fc0134	f73e99c6-1a2a-45da-9f77-32d25658b080	52	YELLOW_CARD	\N	26373344-5c42-4b61-88b4-e7c1a9384f9c	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:32.349	2026-06-02 11:15:32.349	MANUAL
9393def5-5157-427e-a647-0f39280e551d	f73e99c6-1a2a-45da-9f77-32d25658b080	67	YELLOW_CARD	\N	d9a05d94-51e8-417b-80ec-6cf8ce77ce85	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:32.353	2026-06-02 11:15:32.353	MANUAL
7a932832-2dae-4382-9f4d-d910b6a35842	f73e99c6-1a2a-45da-9f77-32d25658b080	66	YELLOW_CARD	\N	3e5f4e61-0f76-4eb8-b360-d33eb6d0df17	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:32.365	2026-06-02 11:15:32.365	MANUAL
87f8cfd8-ed22-4959-8457-45af5edfba09	f73e99c6-1a2a-45da-9f77-32d25658b080	73	YELLOW_CARD	\N	07d2f52b-f9f0-407a-921f-f878f17fb3af	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:32.371	2026-06-02 11:15:32.371	MANUAL
06acb5dc-17c1-4747-9a76-2d22f70f9a3f	f73e99c6-1a2a-45da-9f77-32d25658b080	83	RED_CARD	\N	c12c528c-5ec3-41e9-8250-970149c465fe	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:32.382	2026-06-02 11:15:32.382	MANUAL
b042836a-f4b6-49d4-ae58-34809b45663f	7989c27b-7fec-480f-beb4-2e8a592b5567	22	GOAL	\N	73efed03-f16e-4ed8-98e6-888c7979f07e	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:32.406	2026-06-02 11:15:32.406	MANUAL
c48e2575-b07c-440c-aa41-c1c8182dd47e	7989c27b-7fec-480f-beb4-2e8a592b5567	31	GOAL	\N	fb32cc88-94b0-4ae9-871d-4cc0c3796e82	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:32.424	2026-06-02 11:15:32.424	MANUAL
9518fece-8cd5-4a5e-ab89-050ee66f7f3c	7989c27b-7fec-480f-beb4-2e8a592b5567	33	GOAL	\N	e158a991-7474-4d9a-afbd-7a66ef78b014	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:32.437	2026-06-02 11:15:32.437	MANUAL
292c6fa9-9984-43e3-917a-464850188360	7989c27b-7fec-480f-beb4-2e8a592b5567	19	GOAL	\N	6434cbe7-47a4-4108-9e26-142cf2a6827f	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:32.451	2026-06-02 11:15:32.451	MANUAL
07b92598-21a1-4d9d-ae28-212849fb5652	7989c27b-7fec-480f-beb4-2e8a592b5567	31	GOAL	\N	256f7828-b235-42d1-b366-6f2f78ee0a03	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:32.459	2026-06-02 11:15:32.459	MANUAL
3a22bba4-5d38-417a-a882-9e149099d47d	7989c27b-7fec-480f-beb4-2e8a592b5567	64	YELLOW_CARD	\N	5762e75e-38db-4de5-aab9-1ff35cfa932f	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:32.473	2026-06-02 11:15:32.473	MANUAL
f0890d49-ac27-40b6-bd54-b6f09055699e	7989c27b-7fec-480f-beb4-2e8a592b5567	90	YELLOW_CARD	\N	6735188e-9843-449f-a895-24aa7c3dd2ce	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:32.495	2026-06-02 11:15:32.495	MANUAL
ff0f94a3-93b5-4830-bd93-19a719ddbef1	0136e3a7-a9cf-4001-9005-ecf924849e74	17	GOAL	\N	bcfa46ff-aa79-4a6d-b465-4e2369050a8b	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:32.544	2026-06-02 11:15:32.544	MANUAL
a2897502-5b97-4738-8c8e-8529159b15cb	0136e3a7-a9cf-4001-9005-ecf924849e74	28	GOAL	\N	55f41c5a-faea-4da5-8da6-903e41e6d2eb	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:32.554	2026-06-02 11:15:32.554	MANUAL
5ac4b9fe-fecb-486b-b321-c26faf5a9ae1	0136e3a7-a9cf-4001-9005-ecf924849e74	17	GOAL	\N	60d653ac-eb22-45e0-a9a0-f72bebe8727e	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:32.569	2026-06-02 11:15:32.569	MANUAL
c20efb19-976a-4618-bd5b-ab9b915c84cc	0136e3a7-a9cf-4001-9005-ecf924849e74	40	YELLOW_CARD	\N	c14a3259-cb2f-4c16-84b5-1654204bfd66	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:32.579	2026-06-02 11:15:32.579	MANUAL
5e854af4-b03a-405a-9bb2-83535a488db6	0136e3a7-a9cf-4001-9005-ecf924849e74	53	YELLOW_CARD	\N	cad98842-45b6-4371-beac-fde6d374201a	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:32.598	2026-06-02 11:15:32.598	MANUAL
3840d5e1-9268-4130-ae23-f37b73af9699	0136e3a7-a9cf-4001-9005-ecf924849e74	86	YELLOW_CARD	\N	4c660b28-9715-44cb-8d97-6545685890db	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:32.609	2026-06-02 11:15:32.609	MANUAL
6d481b3a-9944-4e9c-847a-8f28a0561c06	0136e3a7-a9cf-4001-9005-ecf924849e74	81	YELLOW_CARD	\N	55f41c5a-faea-4da5-8da6-903e41e6d2eb	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:32.622	2026-06-02 11:15:32.622	MANUAL
829f4cbf-8dcd-4ff1-89e2-7eae8c3b20f4	0136e3a7-a9cf-4001-9005-ecf924849e74	88	YELLOW_CARD	\N	b2760b91-57b7-4d26-909e-c602b8e15c5a	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:32.644	2026-06-02 11:15:32.644	MANUAL
c3753ecc-4ec9-428a-8de6-ff517fbf7b0a	0136e3a7-a9cf-4001-9005-ecf924849e74	73	YELLOW_CARD	\N	b9f7457a-c3fc-4add-b1b0-76403194f62b	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:32.661	2026-06-02 11:15:32.661	MANUAL
bbf5478d-146a-4b4f-b574-0af25150e643	0136e3a7-a9cf-4001-9005-ecf924849e74	46	YELLOW_CARD	\N	7ed15712-6e44-43c5-9fca-874c33ef4ba6	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:32.672	2026-06-02 11:15:32.672	MANUAL
afa11cd8-4510-4693-a6ee-ad2f34a2b77a	0136e3a7-a9cf-4001-9005-ecf924849e74	41	YELLOW_CARD	\N	62827757-6c88-4e49-93b8-110158b08b9a	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:32.674	2026-06-02 11:15:32.674	MANUAL
d2858fac-2a42-488e-b120-552d84570d0b	16232c80-727c-4e82-a5bd-d9955d7558fb	20	GOAL	\N	3e0dce3f-45c9-4ae0-90a0-aeaa26e4ea03	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:32.691	2026-06-02 11:15:32.691	MANUAL
c224b3d2-c5bb-4ab8-8d59-15d92efac963	16232c80-727c-4e82-a5bd-d9955d7558fb	44	GOAL	\N	a1b73a7a-e57b-45c3-a9fe-dc2d235bd577	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:32.694	2026-06-02 11:15:32.694	MANUAL
ad3bd569-c76c-4084-83bc-5897212388ba	16232c80-727c-4e82-a5bd-d9955d7558fb	10	GOAL	\N	b3f559ed-95c2-4c77-8731-dc68ff546a6b	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:32.706	2026-06-02 11:15:32.706	MANUAL
2c46e4b7-b42e-43fd-bff8-b545d4bc3adc	16232c80-727c-4e82-a5bd-d9955d7558fb	45	RED_CARD	\N	1151d340-4c5a-43d9-972b-9d4588f5b161	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:32.71	2026-06-02 11:15:32.71	MANUAL
f65010c6-958a-4462-9e28-3feb6d851199	e6f18547-381c-40a3-8586-a27493c8cda8	33	GOAL	\N	dfc9fdea-ed8e-47e5-b64a-69b47f38747e	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.725	2026-06-02 11:15:32.725	MANUAL
909c1298-4ee3-419c-b94e-34ed6dc11e9e	e6f18547-381c-40a3-8586-a27493c8cda8	14	GOAL	\N	9cf6fefd-f636-48b2-ae2b-ab97e9b910bb	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.736	2026-06-02 11:15:32.736	MANUAL
5275af4f-f092-4684-b377-0610aa675900	e6f18547-381c-40a3-8586-a27493c8cda8	27	GOAL	\N	ead4b0d9-ad83-4530-a9f8-d1d22f3721be	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.747	2026-06-02 11:15:32.747	MANUAL
cb01852d-9321-4822-bcd2-c2a1111c3f23	e6f18547-381c-40a3-8586-a27493c8cda8	45	GOAL	\N	5d565b26-05f6-426c-b980-8d3713745836	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.75	2026-06-02 11:15:32.75	MANUAL
5e989d43-6b36-4285-bbb8-17d3bb7293dc	e6f18547-381c-40a3-8586-a27493c8cda8	17	GOAL	\N	68506790-b967-494b-a9e4-dda93f5e7eec	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:32.762	2026-06-02 11:15:32.762	MANUAL
98ae79dd-cbe7-4012-bce8-f01e4870a881	e6f18547-381c-40a3-8586-a27493c8cda8	46	GOAL	\N	22e87d5b-709b-474e-8abe-3df12128c413	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:32.765	2026-06-02 11:15:32.765	MANUAL
dfb0abd7-43f5-4667-b7f6-9ae70860b1fc	e6f18547-381c-40a3-8586-a27493c8cda8	40	GOAL	\N	962d05f6-1bc4-4f21-98b8-6df6c3f23258	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:32.767	2026-06-02 11:15:32.767	MANUAL
0de1819e-d28b-485f-b9b4-60faafdd47b1	e6f18547-381c-40a3-8586-a27493c8cda8	63	GOAL	\N	a33f99bd-db4a-432c-bf16-cc9919fb2593	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:32.779	2026-06-02 11:15:32.779	MANUAL
28cf0b3b-3c93-43a7-8c55-f8261c82aa69	e6f18547-381c-40a3-8586-a27493c8cda8	18	YELLOW_CARD	\N	8b907f31-a457-47c8-912f-537d1b685ee2	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.783	2026-06-02 11:15:32.783	MANUAL
741fa410-1593-4d93-bd82-ffbe46984878	e6f18547-381c-40a3-8586-a27493c8cda8	61	YELLOW_CARD	\N	9cf6fefd-f636-48b2-ae2b-ab97e9b910bb	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.786	2026-06-02 11:15:32.786	MANUAL
459972b8-bc1e-4a4f-b624-f4aefa6a538f	e6f18547-381c-40a3-8586-a27493c8cda8	19	YELLOW_CARD	\N	9192f495-0b42-4858-a0ba-6512175743c1	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:32.797	2026-06-02 11:15:32.797	MANUAL
4eac0fc2-e0da-495d-9027-eea722f58779	e6f18547-381c-40a3-8586-a27493c8cda8	22	YELLOW_CARD	\N	c735827f-8c62-42a4-9ee6-2abb1f707533	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:32.81	2026-06-02 11:15:32.81	MANUAL
2d622510-92b5-49ff-8aab-0f321f9b5e36	e6f18547-381c-40a3-8586-a27493c8cda8	83	YELLOW_CARD	\N	4ff0de8a-29b6-41c9-8d7c-d5420a9a2f3e	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:32.827	2026-06-02 11:15:32.827	MANUAL
41c722a8-33ab-491e-84b8-fce25a0e8e37	e6f18547-381c-40a3-8586-a27493c8cda8	52	YELLOW_CARD	\N	68506790-b967-494b-a9e4-dda93f5e7eec	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:32.838	2026-06-02 11:15:32.838	MANUAL
8113091a-cfaa-4cac-a810-9c556acfabc9	e6f18547-381c-40a3-8586-a27493c8cda8	60	YELLOW_CARD	\N	5d2ed8a3-b293-4f4b-9c13-400e2e8f0b4e	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:32.849	2026-06-02 11:15:32.849	MANUAL
25cfa503-5e00-493b-9863-12c24aacbfca	43b7fc1a-bfa2-43ca-9bd3-0ba3c44e6133	29	GOAL	\N	85313c8f-cbf4-49e7-a8af-f26b7e798deb	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:32.874	2026-06-02 11:15:32.874	MANUAL
97acff26-6b6e-4c9c-bca5-34bc2108bee1	43b7fc1a-bfa2-43ca-9bd3-0ba3c44e6133	44	GOAL	\N	d3453aae-0fc9-4677-8474-db274b83351d	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:32.877	2026-06-02 11:15:32.877	MANUAL
58055b85-08b1-455c-9749-c30d7af2cb07	43b7fc1a-bfa2-43ca-9bd3-0ba3c44e6133	45	GOAL	\N	c12c528c-5ec3-41e9-8250-970149c465fe	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:32.899	2026-06-02 11:15:32.899	MANUAL
b43d06cb-9a5a-4768-8021-7891e1f0f99b	43b7fc1a-bfa2-43ca-9bd3-0ba3c44e6133	36	GOAL	\N	7a8d9d41-a57c-43a8-a6ea-fd17bd210051	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:32.91	2026-06-02 11:15:32.91	MANUAL
781bc72b-ea99-4289-bc1e-d3e140c320fe	43b7fc1a-bfa2-43ca-9bd3-0ba3c44e6133	56	YELLOW_CARD	\N	99f83c09-d112-4bff-bb1a-5dfe0929e4e9	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:32.914	2026-06-02 11:15:32.914	MANUAL
a43df9b8-225e-4ad6-8ddf-eda8251efe07	43b7fc1a-bfa2-43ca-9bd3-0ba3c44e6133	22	YELLOW_CARD	\N	60011408-bbc0-463a-bf9e-771f84907127	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:32.925	2026-06-02 11:15:32.925	MANUAL
262083df-5e80-43b8-85af-5663fc6dec88	c104ad94-093e-4e65-846e-7ef31ca562a8	12	GOAL	\N	efefb516-da08-4d8f-b9cc-e3c4a9d6ace0	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:32.945	2026-06-02 11:15:32.945	MANUAL
c0679623-c829-44f7-be47-f0bb1f34d6a0	c104ad94-093e-4e65-846e-7ef31ca562a8	32	GOAL	\N	256f7828-b235-42d1-b366-6f2f78ee0a03	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:32.955	2026-06-02 11:15:32.955	MANUAL
008fcccf-ee33-4c98-b6b0-ccab1b8a606d	c104ad94-093e-4e65-846e-7ef31ca562a8	59	GOAL	\N	205c6054-edee-4208-91e9-89d2b3134023	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:32.965	2026-06-02 11:15:32.965	MANUAL
5a3af6f8-98c0-48f3-a43a-434d65c09f99	c104ad94-093e-4e65-846e-7ef31ca562a8	41	GOAL	\N	ca6d5729-d2bf-40a3-bcbe-6e790c87b295	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:32.975	2026-06-02 11:15:32.975	MANUAL
ebab5728-6c3c-4587-a346-6d3efe0e2e2e	c104ad94-093e-4e65-846e-7ef31ca562a8	28	GOAL	\N	48b5b5c2-e4d0-490d-8d4d-c0670260696a	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:32.988	2026-06-02 11:15:32.988	MANUAL
54f848a7-4fcf-4e3f-bc4d-9d68c0b9523e	c104ad94-093e-4e65-846e-7ef31ca562a8	44	GOAL	\N	f1c2e107-e5df-4006-a2b4-323fd3ffdd74	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:32.996	2026-06-02 11:15:32.996	MANUAL
72ba7ca7-c10e-4f73-a3a2-34cf08462ea4	c104ad94-093e-4e65-846e-7ef31ca562a8	32	GOAL	\N	715c093a-e1e3-46fc-b6a2-e4d8d366fe88	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:33.007	2026-06-02 11:15:33.007	MANUAL
48a20325-f21f-4e4d-8c60-46f5180a164e	c104ad94-093e-4e65-846e-7ef31ca562a8	64	GOAL	\N	b2760b91-57b7-4d26-909e-c602b8e15c5a	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:33.018	2026-06-02 11:15:33.018	MANUAL
30e17e2d-a605-493c-ade0-8fa051b793cb	c104ad94-093e-4e65-846e-7ef31ca562a8	63	YELLOW_CARD	\N	1d4e926f-92cc-4175-87e5-210ae50bbef7	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:33.031	2026-06-02 11:15:33.031	MANUAL
af85fcc1-f831-4c87-8fd0-046b3fafe202	c104ad94-093e-4e65-846e-7ef31ca562a8	83	YELLOW_CARD	\N	68e4189a-bd8f-45a7-b1f8-7b92be25c1de	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:33.05	2026-06-02 11:15:33.05	MANUAL
2ef63acb-79d4-487a-ad19-60ecc37c03e1	c104ad94-093e-4e65-846e-7ef31ca562a8	55	YELLOW_CARD	\N	a7549eda-d173-452d-944a-1403d31b2b79	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:33.053	2026-06-02 11:15:33.053	MANUAL
49fcf7c4-5f44-4b08-80b4-0833851f262f	c104ad94-093e-4e65-846e-7ef31ca562a8	22	YELLOW_CARD	\N	d812116e-a916-494f-9901-f86015ef14be	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:33.067	2026-06-02 11:15:33.067	MANUAL
89d767a4-4fad-44c0-a7b7-65216cf64b08	c104ad94-093e-4e65-846e-7ef31ca562a8	83	YELLOW_CARD	\N	0ff5133a-2294-49bf-8d84-4e809ff19d7a	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:33.084	2026-06-02 11:15:33.084	MANUAL
ca1276df-96ff-46e6-9abb-bd43f29d56a6	c104ad94-093e-4e65-846e-7ef31ca562a8	69	YELLOW_CARD	\N	b2760b91-57b7-4d26-909e-c602b8e15c5a	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:33.094	2026-06-02 11:15:33.094	MANUAL
21889d75-c43f-4131-898d-2d28b4e48228	bb9c252d-c120-4532-a7ee-169f49422119	29	GOAL	\N	e918c7db-bbc4-4668-9f50-d61758c214f4	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:33.117	2026-06-02 11:15:33.117	MANUAL
8e39e2b9-a0e0-4129-aca8-e3fa3782eaa1	bb9c252d-c120-4532-a7ee-169f49422119	19	GOAL	\N	69396e2d-6c37-4ffa-b852-86f9a51e53ae	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:33.126	2026-06-02 11:15:33.126	MANUAL
540308ef-5b6f-4bd2-9474-c8a1b050ae28	bb9c252d-c120-4532-a7ee-169f49422119	14	GOAL	\N	f33bb96a-e2ad-4b28-9486-1be383eec0fe	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:33.14	2026-06-02 11:15:33.14	MANUAL
b0e07f9d-6f04-42a5-9d9a-01c067c2c17c	bb9c252d-c120-4532-a7ee-169f49422119	26	GOAL	\N	4a03a0ce-c2d9-4722-8eca-1295932cee8a	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:33.151	2026-06-02 11:15:33.151	MANUAL
33c69c55-3324-4875-98cc-e7cddaa4e368	bb9c252d-c120-4532-a7ee-169f49422119	49	GOAL	\N	c529f861-b19f-4e5c-ac34-70f5d23ac062	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:33.164	2026-06-02 11:15:33.164	MANUAL
4ff600b7-90ba-4ec7-86f5-057cde22e05b	bb9c252d-c120-4532-a7ee-169f49422119	26	YELLOW_CARD	\N	29d1923b-b2c6-4f7e-9a1b-27e6aeb043e9	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:33.177	2026-06-02 11:15:33.177	MANUAL
9d64be88-f051-4362-be01-c280bf2c209c	bb9c252d-c120-4532-a7ee-169f49422119	87	YELLOW_CARD	\N	c529f861-b19f-4e5c-ac34-70f5d23ac062	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:33.198	2026-06-02 11:15:33.198	MANUAL
f2c3b179-229c-436a-b653-b678f353c4d6	bb9c252d-c120-4532-a7ee-169f49422119	35	RED_CARD	\N	5c258961-6034-4bdf-ad36-29b8f222894b	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:33.215	2026-06-02 11:15:33.215	MANUAL
76529c0a-8c86-4585-a42f-12e44a7e57a8	44f2124e-144a-427b-9b47-ab3f5d89dd8e	34	GOAL	\N	962d05f6-1bc4-4f21-98b8-6df6c3f23258	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:33.239	2026-06-02 11:15:33.239	MANUAL
33a1238e-1a09-4aa5-b9f2-9c669b89c0d1	44f2124e-144a-427b-9b47-ab3f5d89dd8e	33	GOAL	\N	3417e483-f0c7-499f-8d1b-bc919f0e2ee6	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:33.248	2026-06-02 11:15:33.248	MANUAL
8ea494a5-bccb-4c16-a3f1-28d96a993fef	44f2124e-144a-427b-9b47-ab3f5d89dd8e	62	GOAL	\N	22e87d5b-709b-474e-8abe-3df12128c413	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:33.252	2026-06-02 11:15:33.252	MANUAL
e1f8b96e-8473-4a3e-a0ce-64831331637f	44f2124e-144a-427b-9b47-ab3f5d89dd8e	77	YELLOW_CARD	\N	81c33883-d719-4311-9d72-bb8680c299ff	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:33.267	2026-06-02 11:15:33.267	MANUAL
82c80d29-ba72-43ac-a4fb-1d5125b2c311	44f2124e-144a-427b-9b47-ab3f5d89dd8e	75	YELLOW_CARD	\N	865fa516-4671-4ec9-985d-a35deb7486cd	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:33.276	2026-06-02 11:15:33.276	MANUAL
c2f9a75f-f2f2-431e-886f-8e64f49e3a12	44f2124e-144a-427b-9b47-ab3f5d89dd8e	31	YELLOW_CARD	\N	b5c2c374-3022-4ebe-a30c-80bf81d7d826	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:33.279	2026-06-02 11:15:33.279	MANUAL
6f110c1a-a4cb-4a9a-a53b-3764b79c85f7	44f2124e-144a-427b-9b47-ab3f5d89dd8e	84	YELLOW_CARD	\N	1b9d1863-5a7a-44bf-b94f-b629c8f1d802	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:33.291	2026-06-02 11:15:33.291	MANUAL
fbd9c8d5-8484-44eb-b8e5-f927509bfd7e	44f2124e-144a-427b-9b47-ab3f5d89dd8e	53	YELLOW_CARD	\N	4c660b28-9715-44cb-8d97-6545685890db	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:33.307	2026-06-02 11:15:33.307	MANUAL
c479de7f-db3c-4609-aeb7-f27ef84792dc	44f2124e-144a-427b-9b47-ab3f5d89dd8e	37	YELLOW_CARD	\N	d2f9007d-a97d-4769-8598-88723b2acdcf	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:33.315	2026-06-02 11:15:33.315	MANUAL
69020742-c9c8-4b5f-a86b-1bf6deea3afe	44f2124e-144a-427b-9b47-ab3f5d89dd8e	55	YELLOW_CARD	\N	b13c3392-8332-435c-8025-5190f0664c09	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:33.326	2026-06-02 11:15:33.326	MANUAL
0c7e7aaf-ddfe-46e2-ae9d-a7a784b8add2	e7d5ffbf-27cc-4b47-842c-8c10dcaed302	10	GOAL	\N	d2980b91-de4c-4869-a239-87c629f1ed0b	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:33.343	2026-06-02 11:15:33.343	MANUAL
53314b68-90bb-40d0-aed3-0420620f04da	e7d5ffbf-27cc-4b47-842c-8c10dcaed302	23	GOAL	\N	905df635-54dd-4be1-8335-59bb231e197c	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:33.347	2026-06-02 11:15:33.347	MANUAL
c0833cd0-5116-4e91-9c88-4a01516be42b	e7d5ffbf-27cc-4b47-842c-8c10dcaed302	43	GOAL	\N	905df635-54dd-4be1-8335-59bb231e197c	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:33.357	2026-06-02 11:15:33.357	MANUAL
384ccfb1-de5d-4b15-b6dc-562a7502aebe	e7d5ffbf-27cc-4b47-842c-8c10dcaed302	86	YELLOW_CARD	\N	26373344-5c42-4b61-88b4-e7c1a9384f9c	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:33.371	2026-06-02 11:15:33.371	MANUAL
07dd91d8-58f0-458d-b66f-6b1bfaf4d35f	e7d5ffbf-27cc-4b47-842c-8c10dcaed302	48	YELLOW_CARD	\N	41806643-287a-4b5c-8cbb-cff0f07cd8b3	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:33.379	2026-06-02 11:15:33.379	MANUAL
74ec69cc-246b-4ada-ad16-017d89df5761	e7d5ffbf-27cc-4b47-842c-8c10dcaed302	36	YELLOW_CARD	\N	0efdf27a-b364-441a-b019-22919c84b8ff	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:33.39	2026-06-02 11:15:33.39	MANUAL
2e6b7b54-b732-4e89-bef1-94ae1d7a57d4	e7d5ffbf-27cc-4b47-842c-8c10dcaed302	22	YELLOW_CARD	\N	2f213449-ff48-4bc2-8563-62de5de3d7cb	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:33.405	2026-06-02 11:15:33.405	MANUAL
d9be193d-0531-489c-bef6-06765e73b5bd	e7d5ffbf-27cc-4b47-842c-8c10dcaed302	66	YELLOW_CARD	\N	ff43cf28-5b09-4b5b-b2d8-c4d6ed65ebb0	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:33.413	2026-06-02 11:15:33.413	MANUAL
9eecfae8-b5b9-48ea-b74c-419f79959a81	b9393105-8635-4a6a-9bfa-2a46ce772fa4	28	GOAL	\N	85313c8f-cbf4-49e7-a8af-f26b7e798deb	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:33.438	2026-06-02 11:15:33.438	MANUAL
cba73468-1313-4ba9-9628-ff462a41d66e	b9393105-8635-4a6a-9bfa-2a46ce772fa4	66	GOAL	\N	de904f4a-565f-46de-8a3f-076267072212	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:33.441	2026-06-02 11:15:33.441	MANUAL
d9131107-ff70-424a-8e8b-e3e1b3179ab4	b9393105-8635-4a6a-9bfa-2a46ce772fa4	54	YELLOW_CARD	\N	8f5acf7e-6f07-4060-9ef9-2c9f746ba0ca	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:33.455	2026-06-02 11:15:33.455	MANUAL
287c5d5b-235f-411e-bb7d-5d7610b7884a	b9393105-8635-4a6a-9bfa-2a46ce772fa4	55	YELLOW_CARD	\N	85313c8f-cbf4-49e7-a8af-f26b7e798deb	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:33.458	2026-06-02 11:15:33.458	MANUAL
e15e54cd-738b-4d02-a550-be3d28bf96e0	b9393105-8635-4a6a-9bfa-2a46ce772fa4	79	YELLOW_CARD	\N	237f4abf-af95-4a91-b823-a0935c5f102c	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:33.473	2026-06-02 11:15:33.473	MANUAL
eeeef6f7-ee27-4a2c-881a-f7c7941d16d5	b9393105-8635-4a6a-9bfa-2a46ce772fa4	60	YELLOW_CARD	\N	45a3236c-a1b5-47b5-8266-36e94c50a9b6	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:33.478	2026-06-02 11:15:33.478	MANUAL
6003f6ee-a8fd-4f33-b6e6-32419f1b8953	f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	29	GOAL	\N	1ca283d1-063e-498f-8db9-11a0dfe58498	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:33.493	2026-06-02 11:15:33.493	MANUAL
a5c7aae1-d11c-4e8a-ab1e-8b1506386fbb	f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	41	GOAL	\N	1d4e926f-92cc-4175-87e5-210ae50bbef7	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:33.51	2026-06-02 11:15:33.51	MANUAL
e0f65d71-5e7a-464d-9db7-e178ba039f08	f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	34	GOAL	\N	1d4e926f-92cc-4175-87e5-210ae50bbef7	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:33.522	2026-06-02 11:15:33.522	MANUAL
cde9cdc9-8138-4db2-96bf-905ac64dbaf9	f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	58	GOAL	\N	205c6054-edee-4208-91e9-89d2b3134023	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:33.532	2026-06-02 11:15:33.532	MANUAL
d2c894a2-0318-4d8a-975d-bc36e2287df8	f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	63	YELLOW_CARD	\N	907ab923-9f39-4304-8a68-81030fdf2f01	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:33.546	2026-06-02 11:15:33.546	MANUAL
57d5786c-4456-4a1f-8e61-2260faeb6ddf	f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	81	YELLOW_CARD	\N	ae87d895-59bb-467e-b4a1-b44570b8d9ff	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-06-02 11:15:33.563	2026-06-02 11:15:33.563	MANUAL
c294a782-a4d5-4435-a0d2-7349a48dbe61	f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	38	YELLOW_CARD	\N	1d4e926f-92cc-4175-87e5-210ae50bbef7	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:33.57	2026-06-02 11:15:33.57	MANUAL
e52da9b6-b23a-41ff-ad69-85c2fa61b233	f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	68	YELLOW_CARD	\N	6735188e-9843-449f-a895-24aa7c3dd2ce	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:33.588	2026-06-02 11:15:33.588	MANUAL
98218b78-1c45-44a5-9a5f-95686a41087d	f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	54	YELLOW_CARD	\N	15179ecf-f466-4bef-8b2e-75956c650f70	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:33.606	2026-06-02 11:15:33.606	MANUAL
8cb71df2-74af-48fa-8884-0ea0b000ecfb	f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	49	YELLOW_CARD	\N	724684d4-7a7c-437a-b51b-cf87f8df6611	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:33.611	2026-06-02 11:15:33.611	MANUAL
64d2d1fc-1272-458f-a328-6cb0a5c4aadd	f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	26	RED_CARD	\N	2685078f-48ae-4a23-bc94-feb1184fbfe3	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:33.613	2026-06-02 11:15:33.613	MANUAL
8aed608f-ba58-4b7f-b3f7-77d6c6201795	7bfcdad7-bac4-4d70-bc49-497a9fbe3c1c	14	GOAL	\N	7ed15712-6e44-43c5-9fca-874c33ef4ba6	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:33.624	2026-06-02 11:15:33.624	MANUAL
b97a6fa3-3717-4168-8ec7-3d96107da0cd	7bfcdad7-bac4-4d70-bc49-497a9fbe3c1c	54	YELLOW_CARD	\N	b2760b91-57b7-4d26-909e-c602b8e15c5a	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:33.631	2026-06-02 11:15:33.631	MANUAL
c647414a-935c-42ab-a2c1-95abccf809be	7bfcdad7-bac4-4d70-bc49-497a9fbe3c1c	77	YELLOW_CARD	\N	b9f7457a-c3fc-4add-b1b0-76403194f62b	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:33.635	2026-06-02 11:15:33.635	MANUAL
d12b55c0-d008-4864-a2da-c06b3b807314	7bfcdad7-bac4-4d70-bc49-497a9fbe3c1c	39	YELLOW_CARD	\N	7906653e-72a2-4bd1-ac70-947fd7116470	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:33.655	2026-06-02 11:15:33.655	MANUAL
35f68dad-6b60-4985-bde4-6485ad4d07c6	7bfcdad7-bac4-4d70-bc49-497a9fbe3c1c	60	RED_CARD	\N	ccc8ef29-bb77-46b1-801d-7c45a725c567	\N	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:33.673	2026-06-02 11:15:33.673	MANUAL
4365a434-cb5e-406a-a05d-dee8be559546	9591271f-f07b-4c3f-90e5-e6a5cde14ef9	43	YELLOW_CARD	\N	0efaaaeb-93b5-443f-9bfb-387c68cb22cb	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:33.709	2026-06-02 11:15:33.709	MANUAL
30e47f10-a258-4702-8414-aba8508cd380	9591271f-f07b-4c3f-90e5-e6a5cde14ef9	87	YELLOW_CARD	\N	fb32cc88-94b0-4ae9-871d-4cc0c3796e82	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:33.712	2026-06-02 11:15:33.712	MANUAL
90812a3a-931c-4c7a-a76e-e2c649c61bba	9591271f-f07b-4c3f-90e5-e6a5cde14ef9	34	YELLOW_CARD	\N	72cc0e6c-ea6c-4199-9f76-978a59f33f75	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:33.723	2026-06-02 11:15:33.723	MANUAL
24b326eb-57c3-42fe-b669-8f28c53e210d	58fa8d6a-9824-45ad-a11d-7b8c90c4eb67	30	GOAL	\N	7dba25ec-6c10-41e0-ace7-f51354e3cbc2	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:33.74	2026-06-02 11:15:33.74	MANUAL
8a6f8730-f6df-42cc-9e5d-022cb09462c0	58fa8d6a-9824-45ad-a11d-7b8c90c4eb67	34	GOAL	\N	35fe4bf2-f604-47cd-8c89-7a427c1d833b	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:33.757	2026-06-02 11:15:33.757	MANUAL
7ea7157f-6d1a-4766-bd25-00b3197aa164	58fa8d6a-9824-45ad-a11d-7b8c90c4eb67	20	GOAL	\N	35fe4bf2-f604-47cd-8c89-7a427c1d833b	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:33.771	2026-06-02 11:15:33.771	MANUAL
4f22813a-215a-4006-ab43-9c37bc6f533a	58fa8d6a-9824-45ad-a11d-7b8c90c4eb67	75	GOAL	\N	7dba25ec-6c10-41e0-ace7-f51354e3cbc2	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:33.788	2026-06-02 11:15:33.788	MANUAL
36931f87-a30d-4083-b978-8b56dc7ac7d5	58fa8d6a-9824-45ad-a11d-7b8c90c4eb67	32	YELLOW_CARD	\N	bd4a51ae-53df-4ea4-8e34-14a37b427167	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:33.803	2026-06-02 11:15:33.803	MANUAL
9bb64a10-792f-4673-b286-2c8dfa6e6936	58fa8d6a-9824-45ad-a11d-7b8c90c4eb67	50	YELLOW_CARD	\N	d2f9007d-a97d-4769-8598-88723b2acdcf	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:33.819	2026-06-02 11:15:33.819	MANUAL
f85daf87-f445-486f-96bd-15864782fbfd	58fa8d6a-9824-45ad-a11d-7b8c90c4eb67	60	RED_CARD	\N	c9c51b77-9c7c-43b6-9088-ac378d7fc29b	\N	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:33.826	2026-06-02 11:15:33.826	MANUAL
7e6b4fd7-0b06-4451-8e90-a5c62f7345c0	58fa8d6a-9824-45ad-a11d-7b8c90c4eb67	38	YELLOW_CARD	\N	6a466d46-5ae4-4ae8-b1b8-91063f307b8e	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:33.841	2026-06-02 11:15:33.841	MANUAL
8e30bcff-8a70-4700-9ba2-9e3fcb54a577	58fa8d6a-9824-45ad-a11d-7b8c90c4eb67	77	RED_CARD	\N	558e7a8f-ceab-4c21-9d5f-a3d90abb03c4	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:33.855	2026-06-02 11:15:33.855	MANUAL
be33b428-d831-4cb1-af6b-79613290978b	1c797dce-c2e6-4323-a114-fe1fca5faefe	12	GOAL	\N	a1b73a7a-e57b-45c3-a9fe-dc2d235bd577	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:33.887	2026-06-02 11:15:33.887	MANUAL
b113bb46-5884-41e1-a66d-7661e40d9b43	1c797dce-c2e6-4323-a114-fe1fca5faefe	26	GOAL	\N	9f0eedf2-f842-4723-906d-b885295b032b	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:33.89	2026-06-02 11:15:33.89	MANUAL
bbbd8b8d-3bb4-496d-8fe1-0eea9cc0b55f	1c797dce-c2e6-4323-a114-fe1fca5faefe	44	GOAL	\N	8b907f31-a457-47c8-912f-537d1b685ee2	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:33.907	2026-06-02 11:15:33.907	MANUAL
86b3d1d0-500b-40a0-894c-9e66094528b5	1c797dce-c2e6-4323-a114-fe1fca5faefe	36	GOAL	\N	45a3236c-a1b5-47b5-8266-36e94c50a9b6	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:33.918	2026-06-02 11:15:33.918	MANUAL
ad671da2-70ab-4a81-85f1-4249d3fa4491	1c797dce-c2e6-4323-a114-fe1fca5faefe	45	YELLOW_CARD	\N	1151d340-4c5a-43d9-972b-9d4588f5b161	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:33.932	2026-06-02 11:15:33.932	MANUAL
6402dac7-55b8-409d-855e-4611604608e8	1c797dce-c2e6-4323-a114-fe1fca5faefe	86	YELLOW_CARD	\N	905df635-54dd-4be1-8335-59bb231e197c	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:33.935	2026-06-02 11:15:33.935	MANUAL
71165278-641a-4e90-a41e-2e510b424eba	1c797dce-c2e6-4323-a114-fe1fca5faefe	58	YELLOW_CARD	\N	97a58d26-2347-4cdd-9eec-664adf1f9259	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-06-02 11:15:33.939	2026-06-02 11:15:33.939	MANUAL
1892506f-84e7-47cf-96ce-6c3238743a4d	1c797dce-c2e6-4323-a114-fe1fca5faefe	67	YELLOW_CARD	\N	9192f495-0b42-4858-a0ba-6512175743c1	\N	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:33.945	2026-06-02 11:15:33.945	MANUAL
327fe4e1-6e46-4661-a979-4feaff607d84	278ae361-ee59-442e-9f4c-d3571eb1e877	88	RED_CARD	\N	1ca283d1-063e-498f-8db9-11a0dfe58498	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	Demo treo giò vòng kế tiếp	2026-06-02 11:15:33.968	2026-06-02 11:15:33.968	MANUAL
328144a0-8991-4894-8c01-2f46a64f519a	859a7a53-3c30-49bf-86cc-529dbedc0d8a	4	GOAL	\N	26373344-5c42-4b61-88b4-e7c1a9384f9c	339858df-7a16-4510-b3b5-ffdf964d6b02	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:29.335	2026-06-02 11:15:49.649	MANUAL
9fb6fea8-fd9a-4269-bf6d-5e5d0ee01a19	859a7a53-3c30-49bf-86cc-529dbedc0d8a	4	GOAL	\N	0c5cdbb0-d4fc-4a99-999a-68ba4aeaf343	f233f65b-6da7-44e0-a572-14c271034596	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-06-02 11:15:29.303	2026-06-02 11:15:49.649	MANUAL
e7a3faef-7495-431e-a83c-629dca1054c1	b9393105-8635-4a6a-9bfa-2a46ce772fa4	4	GOAL	\N	558e7a8f-ceab-4c21-9d5f-a3d90abb03c4	e01002bf-fa3b-47ff-bdd5-0ea7cff2df15	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:33.428	2026-06-02 11:15:49.649	MANUAL
72a448ed-e958-4806-9309-ca8ff49e0e6b	3a2be07a-5c14-42f9-af3f-aa76eea68139	5	GOAL	\N	ccc8ef29-bb77-46b1-801d-7c45a725c567	5748dfe1-b83f-4411-a471-279d102cf21f	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:29.106	2026-06-02 11:15:49.649	MANUAL
2956b09d-528d-490b-9125-308f176249e2	9f1f3cc6-e65c-430d-a397-f9d38e40c459	6	GOAL	\N	237f4abf-af95-4a91-b823-a0935c5f102c	dfc9fdea-ed8e-47e5-b64a-69b47f38747e	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:29.61	2026-06-02 11:15:49.649	MANUAL
757e5ef6-c7ef-4b59-998e-d6fda75cab86	804c82da-f26b-41ac-9578-acd4179f6e1d	6	GOAL	\N	5c258961-6034-4bdf-ad36-29b8f222894b	0c0b84f1-27a1-4b72-a1c8-1ec4914b17ca	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2026-06-02 11:15:31.933	2026-06-02 11:15:49.649	MANUAL
a35fe1ba-4a7b-436d-ad8d-0b401f74e5ef	d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	6	GOAL	\N	1b9d1863-5a7a-44bf-b94f-b629c8f1d802	ee067132-4d9c-4eae-b873-a1a7c5c8ead2	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-06-02 11:15:28.465	2026-06-02 11:15:49.649	MANUAL
a474a670-44eb-4b17-b42f-74733df43744	1c797dce-c2e6-4323-a114-fe1fca5faefe	6	GOAL	\N	45a3236c-a1b5-47b5-8266-36e94c50a9b6	dfc9fdea-ed8e-47e5-b64a-69b47f38747e	df825052-1f68-4f44-857f-c2de07315fd2	\N	2026-06-02 11:15:33.903	2026-06-02 11:15:49.649	MANUAL
024e322e-d4b0-4e07-b23e-54ed34662c6f	5846bf30-13b4-489a-a919-9f8e6f8be675	8	GOAL	\N	7ed15712-6e44-43c5-9fca-874c33ef4ba6	5748dfe1-b83f-4411-a471-279d102cf21f	655df04f-5508-45f3-8032-fd657a753360	\N	2026-06-02 11:15:32.123	2026-06-02 11:15:49.649	MANUAL
0613380c-e740-4138-a4d1-3847c144d24f	43b7fc1a-bfa2-43ca-9bd3-0ba3c44e6133	8	GOAL	\N	51c622e8-af49-4d8a-9572-25be5e508e91	339858df-7a16-4510-b3b5-ffdf964d6b02	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-06-02 11:15:32.89	2026-06-02 11:15:49.649	MANUAL
14ea70c1-4f8c-416e-ae07-7b7017c50e9c	43b7fc1a-bfa2-43ca-9bd3-0ba3c44e6133	9	GOAL	\N	80f9e6eb-3ec4-4fbd-9157-8758e25fb219	e01002bf-fa3b-47ff-bdd5-0ea7cff2df15	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2026-06-02 11:15:32.866	2026-06-02 11:15:49.649	MANUAL
588ba20e-82b4-43a7-aeb7-9ea387983aaa	0136e3a7-a9cf-4001-9005-ecf924849e74	9	GOAL	\N	22afd02f-8ed5-44ed-b351-428a57b2f878	84f98b38-e35a-40fa-84a0-d9c22af07c13	c11ee3ba-bcce-424a-994e-6477045af536	\N	2026-06-02 11:15:32.525	2026-06-02 11:15:49.649	MANUAL
42965d1c-c703-4d54-93c1-7bd0def7f879	d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	34	YELLOW_CARD	\N	ee067132-4d9c-4eae-b873-a1a7c5c8ead2	\N	9f54615c-03ae-464b-adb4-50b9c1677d41	report-demo-yellow-home-d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
476fe75f-3fba-4ead-ae2e-e6ca8647d8ef	88fb47fb-0275-4c5b-a71d-c7aa752934da	58	YELLOW_CARD	\N	555d8e12-17b7-452a-817a-983759cbd245	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	report-demo-yellow-away-88fb47fb-0275-4c5b-a71d-c7aa752934da	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
1ba7c267-3d50-49aa-b1a4-b797be52560a	3a2be07a-5c14-42f9-af3f-aa76eea68139	58	YELLOW_CARD	\N	e01002bf-fa3b-47ff-bdd5-0ea7cff2df15	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	report-demo-yellow-away-3a2be07a-5c14-42f9-af3f-aa76eea68139	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
e2435537-d2d1-4278-99d1-1ccc33e1d2fa	5818142c-074f-4d84-a482-1e620ad53d18	58	YELLOW_CARD	\N	339858df-7a16-4510-b3b5-ffdf964d6b02	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	report-demo-yellow-away-5818142c-074f-4d84-a482-1e620ad53d18	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
31ca0561-0613-4939-bbc1-d33e2e9bb0fd	5818142c-074f-4d84-a482-1e620ad53d18	34	YELLOW_CARD	\N	248f3dfb-39e4-48c4-be5c-4411636a2e69	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	report-demo-yellow-home-5818142c-074f-4d84-a482-1e620ad53d18	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
93eb7227-b1d7-427f-b5ec-83dc9eb8e265	278ae361-ee59-442e-9f4c-d3571eb1e877	34	YELLOW_CARD	\N	f233f65b-6da7-44e0-a572-14c271034596	\N	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	report-demo-yellow-home-278ae361-ee59-442e-9f4c-d3571eb1e877	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
a8c10ac2-8d7c-40a0-92a0-e54a35649270	88fb47fb-0275-4c5b-a71d-c7aa752934da	76	RED_CARD	\N	d2980b91-de4c-4869-a239-87c629f1ed0b	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	report-demo-red-away-88fb47fb-0275-4c5b-a71d-c7aa752934da	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
31c55420-edb0-47fd-af1e-2d669855a576	88fb47fb-0275-4c5b-a71d-c7aa752934da	34	YELLOW_CARD	\N	dfc9fdea-ed8e-47e5-b64a-69b47f38747e	\N	df825052-1f68-4f44-857f-c2de07315fd2	report-demo-yellow-home-88fb47fb-0275-4c5b-a71d-c7aa752934da	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
8a3e83a1-71f0-40fc-b844-d9414735f6b8	e426c356-88e2-409e-b5ff-18ba1608cb7c	34	YELLOW_CARD	\N	e01002bf-fa3b-47ff-bdd5-0ea7cff2df15	\N	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	report-demo-yellow-home-e426c356-88e2-409e-b5ff-18ba1608cb7c	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
fb1ff729-48fa-4182-91b1-53ae9b9de49c	01398c65-3655-4e63-bdd5-7820f0a78504	34	YELLOW_CARD	\N	84f98b38-e35a-40fa-84a0-d9c22af07c13	\N	c11ee3ba-bcce-424a-994e-6477045af536	report-demo-yellow-home-01398c65-3655-4e63-bdd5-7820f0a78504	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
d8ea6f58-c034-4e16-b1bd-92727af14272	53968a22-96c2-4389-a094-3b82360d618c	34	YELLOW_CARD	\N	339858df-7a16-4510-b3b5-ffdf964d6b02	\N	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	report-demo-yellow-home-53968a22-96c2-4389-a094-3b82360d618c	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
0496b489-e338-4e8b-8c79-ff46428f88e4	53968a22-96c2-4389-a094-3b82360d618c	58	YELLOW_CARD	\N	0c0b84f1-27a1-4b72-a1c8-1ec4914b17ca	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	report-demo-yellow-away-53968a22-96c2-4389-a094-3b82360d618c	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
ac240b4b-fa15-4009-94d3-97582b6577a6	d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	58	YELLOW_CARD	\N	5748dfe1-b83f-4411-a471-279d102cf21f	\N	655df04f-5508-45f3-8032-fd657a753360	report-demo-yellow-away-d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
c962a86c-05af-4095-b8bc-85e0e8722a89	278ae361-ee59-442e-9f4c-d3571eb1e877	76	RED_CARD	\N	ae87d895-59bb-467e-b4a1-b44570b8d9ff	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	report-demo-red-away-278ae361-ee59-442e-9f4c-d3571eb1e877	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
07503181-8621-478f-99fa-c00de577f823	278ae361-ee59-442e-9f4c-d3571eb1e877	58	YELLOW_CARD	\N	248f3dfb-39e4-48c4-be5c-4411636a2e69	\N	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	report-demo-yellow-away-278ae361-ee59-442e-9f4c-d3571eb1e877	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
801e1933-fada-42a3-96b8-f3af7a6386e6	e426c356-88e2-409e-b5ff-18ba1608cb7c	58	YELLOW_CARD	\N	84f98b38-e35a-40fa-84a0-d9c22af07c13	\N	c11ee3ba-bcce-424a-994e-6477045af536	report-demo-yellow-away-e426c356-88e2-409e-b5ff-18ba1608cb7c	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
77ec2372-3525-4040-921d-33c26c257181	01398c65-3655-4e63-bdd5-7820f0a78504	58	YELLOW_CARD	\N	555d8e12-17b7-452a-817a-983759cbd245	\N	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	report-demo-yellow-away-01398c65-3655-4e63-bdd5-7820f0a78504	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
775be9af-b86e-449d-b5c1-0f5cc359072f	d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	76	RED_CARD	\N	f1c2e107-e5df-4006-a2b4-323fd3ffdd74	\N	655df04f-5508-45f3-8032-fd657a753360	report-demo-red-away-d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
a13e02e9-b723-45e5-9032-14fc5026a70b	53968a22-96c2-4389-a094-3b82360d618c	76	RED_CARD	\N	0f22ec25-66cd-4672-aa2a-57ee4a348e4f	\N	3424bc38-f674-4378-a88c-1c9ec5b9a77c	report-demo-red-away-53968a22-96c2-4389-a094-3b82360d618c	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
a91d001d-3ddb-47d8-b838-bb7743e8ac9e	3a2be07a-5c14-42f9-af3f-aa76eea68139	34	YELLOW_CARD	\N	5748dfe1-b83f-4411-a471-279d102cf21f	\N	655df04f-5508-45f3-8032-fd657a753360	report-demo-yellow-home-3a2be07a-5c14-42f9-af3f-aa76eea68139	2026-06-02 11:15:49.657	2026-06-02 11:15:49.657	MANUAL
\.


--
-- Data for Name: match_lineup_players; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.match_lineup_players (id, registration_id, player_id, role, "position", shirt_number, created_at) FROM stdin;
c4db942f-cf65-40f5-8482-439b514479a6	c2405006-95eb-4b63-bfc4-a4a766cb1830	f233f65b-6da7-44e0-a572-14c271034596	STARTER	GK	1	2026-06-02 11:15:34.044
a695ba87-b8ef-47df-92c0-4788c1fd6eab	c2405006-95eb-4b63-bfc4-a4a766cb1830	68074e2a-d926-45c8-8e53-60d51905cdeb	STARTER	DF	5	2026-06-02 11:15:34.044
a0cbe093-96bc-4eeb-946e-fdb5a139b7ba	c2405006-95eb-4b63-bfc4-a4a766cb1830	c8d3eb2c-026f-4677-b69e-ae81f2843084	STARTER	DF	6	2026-06-02 11:15:34.044
f0df2230-08c7-4e78-9289-962b595d2189	c2405006-95eb-4b63-bfc4-a4a766cb1830	efefb516-da08-4d8f-b9cc-e3c4a9d6ace0	STARTER	DF	7	2026-06-02 11:15:34.044
090199a6-5abd-443b-a2a3-034e39119c83	c2405006-95eb-4b63-bfc4-a4a766cb1830	577fc6f1-69db-441d-a9a3-2c7f36a72834	STARTER	DF	8	2026-06-02 11:15:34.044
e1b7b585-a9ca-4998-9944-7b431214bac2	c2405006-95eb-4b63-bfc4-a4a766cb1830	6434cbe7-47a4-4108-9e26-142cf2a6827f	STARTER	MF	12	2026-06-02 11:15:34.044
6029b6af-92aa-424a-a322-be9c0642fa85	c2405006-95eb-4b63-bfc4-a4a766cb1830	68e4189a-bd8f-45a7-b1f8-7b92be25c1de	STARTER	MF	13	2026-06-02 11:15:34.044
da6983d7-69c8-4603-832d-108b9d1988c6	c2405006-95eb-4b63-bfc4-a4a766cb1830	6735188e-9843-449f-a895-24aa7c3dd2ce	STARTER	MF	14	2026-06-02 11:15:34.044
a5e4785d-8749-4991-990b-48cde1fed997	c2405006-95eb-4b63-bfc4-a4a766cb1830	ca6d5729-d2bf-40a3-bcbe-6e790c87b295	STARTER	MF	15	2026-06-02 11:15:34.044
408b538a-4c28-4946-ab0c-a6eef364a3bb	c2405006-95eb-4b63-bfc4-a4a766cb1830	0c5cdbb0-d4fc-4a99-999a-68ba4aeaf343	STARTER	FW	22	2026-06-02 11:15:34.044
5d0fe572-2686-4804-9468-aa30d59330eb	c2405006-95eb-4b63-bfc4-a4a766cb1830	e6f97d14-e2d4-414c-b0d0-0596bdf9aca4	STARTER	FW	23	2026-06-02 11:15:34.044
a53889e5-4fce-48cf-ae58-29ee2b166838	c2405006-95eb-4b63-bfc4-a4a766cb1830	1ababc07-f4c7-4143-842a-d81766383616	SUBSTITUTE	GK	2	2026-06-02 11:15:34.044
11ad543d-f389-43ae-bc8a-ca7fab7c7654	c2405006-95eb-4b63-bfc4-a4a766cb1830	c4ca4fee-efc5-48fb-a660-bc831bc16872	SUBSTITUTE	GK	3	2026-06-02 11:15:34.044
e696ddea-947f-4f8c-8e39-78fbb213676c	c2405006-95eb-4b63-bfc4-a4a766cb1830	73307118-3330-479d-b300-9d6343b49bf4	SUBSTITUTE	DF	9	2026-06-02 11:15:34.044
23312343-049d-4a8f-ad24-ea4d858f5d0e	c2405006-95eb-4b63-bfc4-a4a766cb1830	6a007a21-a220-4773-b5aa-c2e4223b2c41	SUBSTITUTE	DF	10	2026-06-02 11:15:34.044
0aea7358-c04c-473f-a84c-0d4f8ca90552	c2405006-95eb-4b63-bfc4-a4a766cb1830	205c6054-edee-4208-91e9-89d2b3134023	SUBSTITUTE	DF	11	2026-06-02 11:15:34.044
837d92d4-23f8-4874-a2ab-73e8e2a8d9ac	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	ee067132-4d9c-4eae-b873-a1a7c5c8ead2	STARTER	GK	1	2026-06-02 11:15:34.09
52ee7838-e06f-438b-a1d5-d8b5f249c52b	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	c735827f-8c62-42a4-9ee6-2abb1f707533	STARTER	DF	4	2026-06-02 11:15:34.09
97b75bea-d9ef-4d2b-9425-bdacd7d26e3a	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	81c33883-d719-4311-9d72-bb8680c299ff	STARTER	DF	5	2026-06-02 11:15:34.09
31a1071b-c4e4-460a-b845-672e92775d7a	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	60bd051d-5046-4297-8b53-894913081738	STARTER	DF	6	2026-06-02 11:15:34.09
82a1fc7b-125a-4304-b656-39d540b7c50c	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	7d0687e7-98ae-466d-96b3-3c2c8a99ae25	STARTER	DF	7	2026-06-02 11:15:34.09
e2e6fa19-9ee7-4f03-81e3-eb213223f7fd	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	e0b56077-ef75-42d8-ad91-1c0e44e17a1b	STARTER	MF	12	2026-06-02 11:15:34.09
0da426cf-c361-4165-9785-cf2566a4cd25	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	eb3c6d80-4872-4e11-82e9-73cca51a56a6	STARTER	MF	13	2026-06-02 11:15:34.09
79941538-0433-4191-b425-8a4a3ef3f3da	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	07d82480-e721-46cd-a4b4-510e661b8d6d	STARTER	MF	14	2026-06-02 11:15:34.09
6046457b-825e-443b-8e25-2011170f97cf	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	5d2ed8a3-b293-4f4b-9c13-400e2e8f0b4e	STARTER	MF	15	2026-06-02 11:15:34.09
9a2fb52f-751f-429b-8b06-9bb7cc6156f3	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	4ff0de8a-29b6-41c9-8d7c-d5420a9a2f3e	STARTER	FW	22	2026-06-02 11:15:34.09
197a1fbe-a61a-46cc-90f5-a9d90f298e2d	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	a33f99bd-db4a-432c-bf16-cc9919fb2593	STARTER	FW	23	2026-06-02 11:15:34.09
3f8c814f-480c-4ed7-9c76-6d42fadc5068	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	1f3f1c01-a4db-4c84-857c-93865bd5b469	SUBSTITUTE	GK	2	2026-06-02 11:15:34.09
c94bcfde-d6d7-417e-844e-9fff4744031e	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	c47ca176-d05a-4b51-a1a3-9a8cd54b925b	SUBSTITUTE	GK	3	2026-06-02 11:15:34.09
8a97774f-4707-4af8-a977-d81e2e4c59dd	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	5fd6264b-e7cd-442f-95b0-332afe96014b	SUBSTITUTE	DF	8	2026-06-02 11:15:34.09
85b1115f-d83e-4c7c-977e-e2c4e4ff7249	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	46e19e34-73e3-43e1-a6d0-e048380bb2be	SUBSTITUTE	DF	9	2026-06-02 11:15:34.09
e81d609b-6f31-42c4-ae38-629e30541421	945091bb-e732-481c-8f8b-f9a7ee4b5f4c	68506790-b967-494b-a9e4-dda93f5e7eec	SUBSTITUTE	DF	10	2026-06-02 11:15:34.09
8cd18408-3034-4eff-b1df-e5b7630f0ca1	494c2359-b725-4fb0-9c38-f5bef49afc10	555d8e12-17b7-452a-817a-983759cbd245	STARTER	GK	1	2026-06-02 12:08:36.146
1a51d821-98bb-4172-84e3-2ae4ed701440	494c2359-b725-4fb0-9c38-f5bef49afc10	ad6181d5-2c1a-4ef8-9c89-9b8018269fa9	STARTER	GK	2	2026-06-02 12:08:36.146
43cb2e79-b3d7-45fe-955f-2ae103a5b22e	494c2359-b725-4fb0-9c38-f5bef49afc10	acb8d8d9-813f-4c76-bae6-de89b739ec0c	STARTER	GK	3	2026-06-02 12:08:36.146
d52cf94b-8cd8-4c11-bc9d-14f84c71e612	494c2359-b725-4fb0-9c38-f5bef49afc10	880f4e45-ee17-46ed-b2ff-09652b1b8bee	STARTER	DF	4	2026-06-02 12:08:36.146
55ebc21d-18df-4d00-b06d-8f2de598c9c1	494c2359-b725-4fb0-9c38-f5bef49afc10	377112a3-c42d-45b9-8c25-606053bd0344	STARTER	DF	5	2026-06-02 12:08:36.146
d6e88e51-cadf-49bf-af31-9a8585d9a650	494c2359-b725-4fb0-9c38-f5bef49afc10	c4d9cd6b-f2d9-4681-9a81-d9cb5065b29e	STARTER	DF	6	2026-06-02 12:08:36.146
8d58203c-e3e3-4e02-8f71-342882172017	494c2359-b725-4fb0-9c38-f5bef49afc10	febe55b1-a0da-42e8-8ce6-8fbad18231ba	SUBSTITUTE	DF	7	2026-06-02 12:08:36.146
63e7a7dc-8367-477f-a827-da48a34eb680	494c2359-b725-4fb0-9c38-f5bef49afc10	ecadc2e8-2017-43ee-9652-da8ac444828d	STARTER	DF	8	2026-06-02 12:08:36.146
d0b1c8da-e898-4ba5-a6ef-0c47a27ae04b	494c2359-b725-4fb0-9c38-f5bef49afc10	a1b73a7a-e57b-45c3-a9fe-dc2d235bd577	STARTER	DF	9	2026-06-02 12:08:36.146
7af40255-c32b-47de-8d6c-08d85e82d186	494c2359-b725-4fb0-9c38-f5bef49afc10	af0d3f1f-6bc4-42c0-be7b-d2c4ae7b1daa	STARTER	DF	10	2026-06-02 12:08:36.146
099d826b-c906-43e3-9efd-2b6cb0c9d1c0	494c2359-b725-4fb0-9c38-f5bef49afc10	ceffc772-ad99-4629-a891-cf2e290ff530	STARTER	DF	11	2026-06-02 12:08:36.146
1685bdb5-6c74-4bf8-ac73-f841015256fb	494c2359-b725-4fb0-9c38-f5bef49afc10	97a58d26-2347-4cdd-9eec-664adf1f9259	STARTER	MF	12	2026-06-02 12:08:36.146
d2b37186-ea99-4ce6-a575-8ef2deaa3ed7	494c2359-b725-4fb0-9c38-f5bef49afc10	1400c73a-755b-4fee-a970-5d79bf410597	SUBSTITUTE	MF	13	2026-06-02 12:08:36.146
5b1f30ea-fcd7-4a3e-9c7f-f10d6005614c	494c2359-b725-4fb0-9c38-f5bef49afc10	9f0eedf2-f842-4723-906d-b885295b032b	SUBSTITUTE	MF	14	2026-06-02 12:08:36.146
aeb24b87-55b7-4733-ab02-63ef1612da16	494c2359-b725-4fb0-9c38-f5bef49afc10	3e0dce3f-45c9-4ae0-90a0-aeaa26e4ea03	SUBSTITUTE	MF	15	2026-06-02 12:08:36.146
948e7739-b448-4056-9905-1a79f97ba52a	494c2359-b725-4fb0-9c38-f5bef49afc10	6f3f7407-3a80-4a97-b845-397a7ba67a35	SUBSTITUTE	MF	16	2026-06-02 12:08:36.146
1c945c48-5c12-4de0-8338-6eae18e20f6e	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	84f98b38-e35a-40fa-84a0-d9c22af07c13	STARTER	GK	1	2026-06-02 12:08:45.425
97b1e637-dc40-4fb3-a4ad-9232507f4674	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	3d129cc0-c291-4187-a41e-0c70a9e27a9c	STARTER	GK	2	2026-06-02 12:08:45.425
b1e51f6a-944d-41c0-ac6e-8152cdf2d34e	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	78dadd5b-92db-4792-a687-35c8ff56a733	STARTER	GK	3	2026-06-02 12:08:45.425
ebf89ba3-7125-44f7-85ae-c9fe72218de9	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	abe574fc-a574-4180-a66c-9cd8e7c2c480	STARTER	DF	4	2026-06-02 12:08:45.425
c6dcbd4e-ea5a-481e-b9c4-5b65c60a8646	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	427e7430-7169-4fec-9c43-42928c19aecd	STARTER	DF	5	2026-06-02 12:08:45.425
d982d0e6-2ddc-4208-8961-d1264bce8169	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	11bf43c2-181c-4ce1-aac5-48456ad3f456	STARTER	DF	6	2026-06-02 12:08:45.425
c2039f2d-f1dd-462a-b761-43735c9a40d5	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	d2f9007d-a97d-4769-8598-88723b2acdcf	SUBSTITUTE	DF	7	2026-06-02 12:08:45.425
07e4f6fd-5dd5-48d2-b492-dba77272df7d	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	247a244a-fa89-4bb2-95b9-4eb2d8cf5df9	STARTER	DF	8	2026-06-02 12:08:45.425
c2610a30-fbf2-4c62-9012-8a449cb1b9c3	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	9d67225c-b929-4002-adb8-e03df0a3c78e	STARTER	DF	9	2026-06-02 12:08:45.425
d4f1241b-a001-4774-b837-d70a8c0caf2c	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	bcfa46ff-aa79-4a6d-b465-4e2369050a8b	STARTER	DF	10	2026-06-02 12:08:45.425
32ca295f-796a-431d-bea1-85742ece192d	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	7a0f1e8d-0fa3-4aa3-95a5-4db80d5bfcc6	STARTER	DF	11	2026-06-02 12:08:45.425
ee9bf4a9-ce5a-439b-be19-7790d3239342	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	e938c0f1-e9bb-474d-9f0a-c7bd21909dea	STARTER	MF	12	2026-06-02 12:08:45.425
d4ee8cb1-40f3-4e76-be30-542efd4c2379	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	bd4a51ae-53df-4ea4-8e34-14a37b427167	SUBSTITUTE	MF	13	2026-06-02 12:08:45.425
0927a809-976e-496c-bbcf-a789950e6776	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	c14a3259-cb2f-4c16-84b5-1654204bfd66	SUBSTITUTE	MF	14	2026-06-02 12:08:45.425
c860def0-ec52-48ec-a000-256807474447	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	886d4630-3234-43c9-8970-b82bf4da2978	SUBSTITUTE	MF	15	2026-06-02 12:08:45.425
2e0b0d04-d19b-44a6-97b6-b0ca8155b265	68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	b13c3392-8332-435c-8025-5190f0664c09	SUBSTITUTE	MF	16	2026-06-02 12:08:45.425
\.


--
-- Data for Name: match_official_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.match_official_assignments (id, match_id, official_id, role, published_at, note, created_at, updated_at) FROM stdin;
9708617e-e670-4bca-9b21-8214e56b7247	d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:34.48	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.48	2026-06-02 11:15:34.48
f6993b69-5952-4799-9ea2-a2cee341f5c3	d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:34.499	Giám sát viên trận đấu	2026-06-02 11:15:34.499	2026-06-02 11:15:34.499
0d5c7fcd-7134-44f8-a98c-436a2a6c99d8	53968a22-96c2-4389-a094-3b82360d618c	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:34.519	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.519	2026-06-02 11:15:34.519
7c3a8be0-aacd-43b5-bc35-b6d3da4319bc	53968a22-96c2-4389-a094-3b82360d618c	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:34.529	Giám sát viên trận đấu	2026-06-02 11:15:34.529	2026-06-02 11:15:34.529
06b21a8c-9cf6-4be4-b189-d2e1b5d71111	88fb47fb-0275-4c5b-a71d-c7aa752934da	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:34.539	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.539	2026-06-02 11:15:34.539
55046d6c-e8aa-48d0-b852-5fa2c53da963	88fb47fb-0275-4c5b-a71d-c7aa752934da	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:34.552	Giám sát viên trận đấu	2026-06-02 11:15:34.552	2026-06-02 11:15:34.552
77792fb1-1a0d-4798-94b5-fbe320d8cf1e	278ae361-ee59-442e-9f4c-d3571eb1e877	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:34.571	Trọng tài chính - quốc tế	2026-06-02 11:15:34.571	2026-06-02 11:15:34.571
609db580-909a-48cc-a976-ce11b7a937d5	278ae361-ee59-442e-9f4c-d3571eb1e877	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:34.591	Giám sát viên trận đấu	2026-06-02 11:15:34.591	2026-06-02 11:15:34.591
d7a2e518-21f2-4fca-948d-93013770e391	e426c356-88e2-409e-b5ff-18ba1608cb7c	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:34.595	Trọng tài chính - quốc tế	2026-06-02 11:15:34.595	2026-06-02 11:15:34.595
45622163-3d1c-43a5-9eba-214b5975ef9d	e426c356-88e2-409e-b5ff-18ba1608cb7c	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:34.606	Giám sát viên trận đấu	2026-06-02 11:15:34.606	2026-06-02 11:15:34.606
cbbd8904-4beb-4aea-976a-4f6464f7be32	5818142c-074f-4d84-a482-1e620ad53d18	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:34.619	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.619	2026-06-02 11:15:34.619
f63c2c62-fc04-4acc-a531-1c67bdf0c336	5818142c-074f-4d84-a482-1e620ad53d18	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:34.638	Giám sát viên trận đấu	2026-06-02 11:15:34.638	2026-06-02 11:15:34.638
280d389b-242e-49d7-b9da-5be3c678a910	d85cc39e-e33b-4abb-bc25-e6a2f69689d8	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:34.651	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.651	2026-06-02 11:15:34.651
2c5d9dd7-554d-4390-8341-45010ef4d68c	d85cc39e-e33b-4abb-bc25-e6a2f69689d8	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:34.67	Giám sát viên trận đấu	2026-06-02 11:15:34.67	2026-06-02 11:15:34.67
5eb41eec-e259-4979-8ea6-22c6f5f26cc5	01398c65-3655-4e63-bdd5-7820f0a78504	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:34.674	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.674	2026-06-02 11:15:34.674
771b2f5b-ace8-4a4d-acb1-795a478faa43	01398c65-3655-4e63-bdd5-7820f0a78504	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:34.679	Giám sát viên trận đấu	2026-06-02 11:15:34.679	2026-06-02 11:15:34.679
bf82765a-fc7b-48c0-9fca-2afc2b5ce53f	e525bd43-df1d-40bd-8747-d8c10e728681	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:34.685	Trọng tài chính - quốc tế	2026-06-02 11:15:34.685	2026-06-02 11:15:34.685
359267a7-7505-4ea8-b1f6-c1d44058ceba	e525bd43-df1d-40bd-8747-d8c10e728681	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:34.689	Giám sát viên trận đấu	2026-06-02 11:15:34.689	2026-06-02 11:15:34.689
1230601e-c697-416c-a4f3-048ac8f18ea0	3a2be07a-5c14-42f9-af3f-aa76eea68139	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:34.693	Trọng tài chính - quốc tế	2026-06-02 11:15:34.693	2026-06-02 11:15:34.693
ee351c88-fa71-442a-ba79-0adb8e3e4d46	3a2be07a-5c14-42f9-af3f-aa76eea68139	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:34.704	Giám sát viên trận đấu	2026-06-02 11:15:34.704	2026-06-02 11:15:34.704
e248b300-baef-47db-b22b-f65a3dcad052	b1bf4ea7-da39-4bec-a47c-73595095b785	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:34.714	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.714	2026-06-02 11:15:34.714
4b788f1a-6a3b-4835-90a9-36d4cc0eda7d	b1bf4ea7-da39-4bec-a47c-73595095b785	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:34.724	Giám sát viên trận đấu	2026-06-02 11:15:34.724	2026-06-02 11:15:34.724
87e8486d-2479-4214-96c5-2c85d7e0f262	00a34b87-506f-4deb-9d0b-3ebb1d591b36	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:34.735	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.735	2026-06-02 11:15:34.735
b8d54398-671a-4236-81e7-0aa6fd751324	00a34b87-506f-4deb-9d0b-3ebb1d591b36	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:34.746	Giám sát viên trận đấu	2026-06-02 11:15:34.746	2026-06-02 11:15:34.746
64cb98a0-472e-4dba-827f-132b6b7d2b70	8f789f51-0e23-4d07-ba74-1ff4442ae866	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:34.758	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.758	2026-06-02 11:15:34.758
c36fae7c-3c82-47aa-bc6e-7d23ea5c55b8	8f789f51-0e23-4d07-ba74-1ff4442ae866	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:34.769	Giám sát viên trận đấu	2026-06-02 11:15:34.769	2026-06-02 11:15:34.769
40285a80-15a1-49d4-91e4-db19f1574a8d	859a7a53-3c30-49bf-86cc-529dbedc0d8a	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:34.779	Trọng tài chính - quốc tế	2026-06-02 11:15:34.779	2026-06-02 11:15:34.779
2e8be30f-005e-400c-b14b-325d7edc1489	859a7a53-3c30-49bf-86cc-529dbedc0d8a	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:34.786	Giám sát viên trận đấu	2026-06-02 11:15:34.786	2026-06-02 11:15:34.786
6ab75560-6b1d-444d-8db5-e839d1a2b0fa	9f1f3cc6-e65c-430d-a397-f9d38e40c459	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:34.79	Trọng tài chính - quốc tế	2026-06-02 11:15:34.79	2026-06-02 11:15:34.79
a4f9d833-5bf2-4863-8ec0-7c417054ba8b	9f1f3cc6-e65c-430d-a397-f9d38e40c459	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:34.794	Giám sát viên trận đấu	2026-06-02 11:15:34.794	2026-06-02 11:15:34.794
7cdfa7f4-ffe3-444e-9b50-fcddc10709d1	73b58df4-b989-4b1d-bcbd-25b92dac3bab	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:34.799	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.799	2026-06-02 11:15:34.799
7c8da630-b7bb-4ad6-a393-c967b81e4281	73b58df4-b989-4b1d-bcbd-25b92dac3bab	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:34.804	Giám sát viên trận đấu	2026-06-02 11:15:34.804	2026-06-02 11:15:34.804
ab0f3ff3-b0d5-4e8d-9ea9-d4b985a355e1	ea39cb69-b7c7-484f-b818-7a2560bed5a4	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:34.817	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.817	2026-06-02 11:15:34.817
9de9f7b0-b5d9-4f7d-85ce-bef32107e8ae	ea39cb69-b7c7-484f-b818-7a2560bed5a4	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:34.836	Giám sát viên trận đấu	2026-06-02 11:15:34.836	2026-06-02 11:15:34.836
05d5fb01-6d7d-4bf5-8df3-37a62accb9ed	9aae48db-c79b-495b-8647-bd775c4def34	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:34.849	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.849	2026-06-02 11:15:34.849
18faff3e-8492-41b4-9ee8-661cba307227	9aae48db-c79b-495b-8647-bd775c4def34	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:34.868	Giám sát viên trận đấu	2026-06-02 11:15:34.868	2026-06-02 11:15:34.868
be0fe1a4-cb6c-42d4-8f79-d6d6ea4b1804	e99cec87-b449-4daa-bc2b-44651da0a41a	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:34.889	Trọng tài chính - quốc tế	2026-06-02 11:15:34.889	2026-06-02 11:15:34.889
280463e7-1d65-4916-b5e0-8fe2d7ac8c53	e99cec87-b449-4daa-bc2b-44651da0a41a	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:34.895	Giám sát viên trận đấu	2026-06-02 11:15:34.895	2026-06-02 11:15:34.895
64d0828b-edd0-4431-91c7-8742d38e2136	dbeef7f6-fa0c-4e80-9277-538a2ac142d4	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:34.901	Trọng tài chính - quốc tế	2026-06-02 11:15:34.901	2026-06-02 11:15:34.901
c3d403b1-0778-4a70-aaf9-30236fe5640c	dbeef7f6-fa0c-4e80-9277-538a2ac142d4	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:34.908	Giám sát viên trận đấu	2026-06-02 11:15:34.908	2026-06-02 11:15:34.908
eae648af-43d4-4ffb-ad5d-1510996846e7	2011a3f3-7df2-4f03-b106-d1eb6fee0fde	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:34.927	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.927	2026-06-02 11:15:34.927
dfe17d7f-d033-4579-884e-9a926bae9f94	2011a3f3-7df2-4f03-b106-d1eb6fee0fde	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:34.937	Giám sát viên trận đấu	2026-06-02 11:15:34.937	2026-06-02 11:15:34.937
1f5ea580-d9e3-4ff1-8420-86b7e6a9e749	33b6f25c-146a-4f5a-8128-124b45fb1a18	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:34.951	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.951	2026-06-02 11:15:34.951
1cf724bc-bf73-44bb-b5ff-9c5d9265939f	33b6f25c-146a-4f5a-8128-124b45fb1a18	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:34.969	Giám sát viên trận đấu	2026-06-02 11:15:34.969	2026-06-02 11:15:34.969
3f622e61-d7b0-438d-ad1d-b3ae86716d70	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:34.988	Trọng tài chính - Việt Nam	2026-06-02 11:15:34.988	2026-06-02 11:15:34.988
7efbcec6-b876-4fa1-a77f-4f890a9a9853	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:35	Giám sát viên trận đấu	2026-06-02 11:15:35	2026-06-02 11:15:35
f0d2ad17-b4e2-4d57-817c-4a9d8e3ba647	637c8078-4ee3-48ce-9db4-ad52f10162d6	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:35.007	Trọng tài chính - quốc tế	2026-06-02 11:15:35.007	2026-06-02 11:15:35.007
793fa6a1-64af-4bf0-af7a-979113ebc569	637c8078-4ee3-48ce-9db4-ad52f10162d6	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:35.022	Giám sát viên trận đấu	2026-06-02 11:15:35.022	2026-06-02 11:15:35.022
0233eb3b-3f4f-43f0-80de-df5bf23bf1b8	62c65337-77ae-41c5-8a84-6039c7401a44	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:35.028	Trọng tài chính - quốc tế	2026-06-02 11:15:35.028	2026-06-02 11:15:35.028
8a6332f8-108f-4e72-a587-724e111c4f4e	62c65337-77ae-41c5-8a84-6039c7401a44	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:35.033	Giám sát viên trận đấu	2026-06-02 11:15:35.033	2026-06-02 11:15:35.033
95c073c0-2933-40b8-a755-eee56f651a40	6b0ad60e-7aeb-4e85-86af-4176e67dd633	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:35.044	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.044	2026-06-02 11:15:35.044
aeb2f48a-4f7b-4172-a492-f97bef9a2b7e	6b0ad60e-7aeb-4e85-86af-4176e67dd633	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:35.048	Giám sát viên trận đấu	2026-06-02 11:15:35.048	2026-06-02 11:15:35.048
b51d9562-3195-4e50-9e03-05f1732fdd08	0a809e4e-bf49-4832-b760-f144bb9583ae	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:35.059	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.059	2026-06-02 11:15:35.059
a628ccce-18ac-4c6d-8627-0d6057004b66	0a809e4e-bf49-4832-b760-f144bb9583ae	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:35.07	Giám sát viên trận đấu	2026-06-02 11:15:35.07	2026-06-02 11:15:35.07
05d9188e-158f-41b4-a2e1-c58a5396170e	a23e96ef-1533-4c9d-b69d-8bacddc063f1	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:35.081	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.081	2026-06-02 11:15:35.081
4e2740bf-56d3-4656-90bc-1400aec77832	a23e96ef-1533-4c9d-b69d-8bacddc063f1	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:35.088	Giám sát viên trận đấu	2026-06-02 11:15:35.088	2026-06-02 11:15:35.088
61c9117d-8496-466e-9dd1-39e6d05eacb1	999b3810-edbc-4c00-857b-503a42288ce2	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:35.101	Trọng tài chính - quốc tế	2026-06-02 11:15:35.101	2026-06-02 11:15:35.101
14496ab7-e09e-43ec-85b3-e2155a33051b	999b3810-edbc-4c00-857b-503a42288ce2	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:35.108	Giám sát viên trận đấu	2026-06-02 11:15:35.108	2026-06-02 11:15:35.108
f362d446-9260-43b1-a2cc-728d35f8a7f4	9086183b-6ea8-4da1-a7a3-68c43db51601	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:35.128	Trọng tài chính - quốc tế	2026-06-02 11:15:35.128	2026-06-02 11:15:35.128
fb93dcb9-fa4d-46e0-82a3-dcca940278c3	9086183b-6ea8-4da1-a7a3-68c43db51601	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:35.146	Giám sát viên trận đấu	2026-06-02 11:15:35.146	2026-06-02 11:15:35.146
75c9244c-0ade-4d13-a55d-a3986fe990fa	ceffb55c-2c1e-4387-b36f-b4150bd75819	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:35.152	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.152	2026-06-02 11:15:35.152
17cf5291-d4cb-4ddc-8f5b-a79c7e6d7b24	ceffb55c-2c1e-4387-b36f-b4150bd75819	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:35.161	Giám sát viên trận đấu	2026-06-02 11:15:35.161	2026-06-02 11:15:35.161
1d4fd8ee-9b9a-4b7b-a044-95120827edaa	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:35.164	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.164	2026-06-02 11:15:35.164
5af5d46f-9d85-476a-8335-b67ccb9a7e44	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:35.176	Giám sát viên trận đấu	2026-06-02 11:15:35.176	2026-06-02 11:15:35.176
ffb64869-4e9c-4360-b916-858a2b954860	804c82da-f26b-41ac-9578-acd4179f6e1d	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:35.18	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.18	2026-06-02 11:15:35.18
ec751a08-87a3-4505-bb13-b3db86052588	804c82da-f26b-41ac-9578-acd4179f6e1d	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:35.192	Giám sát viên trận đấu	2026-06-02 11:15:35.192	2026-06-02 11:15:35.192
50bfe5d4-c7ad-4ab1-9717-4cc3928d8832	5846bf30-13b4-489a-a919-9f8e6f8be675	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:35.202	Trọng tài chính - quốc tế	2026-06-02 11:15:35.202	2026-06-02 11:15:35.202
410bea20-39ff-4319-96eb-21603b7b9c56	5846bf30-13b4-489a-a919-9f8e6f8be675	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:35.223	Giám sát viên trận đấu	2026-06-02 11:15:35.223	2026-06-02 11:15:35.223
f47a3143-20fb-40cc-954f-2c923192a3b1	f73e99c6-1a2a-45da-9f77-32d25658b080	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:35.241	Trọng tài chính - quốc tế	2026-06-02 11:15:35.241	2026-06-02 11:15:35.241
6f780588-3ee8-4836-9610-7d99449cadb2	f73e99c6-1a2a-45da-9f77-32d25658b080	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:35.259	Giám sát viên trận đấu	2026-06-02 11:15:35.259	2026-06-02 11:15:35.259
3e269590-0985-4b26-b77b-b6af59e9721d	e6f18547-381c-40a3-8586-a27493c8cda8	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:35.262	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.262	2026-06-02 11:15:35.262
2d98d2b4-1395-4a2d-87c2-42f4a723bcd4	e6f18547-381c-40a3-8586-a27493c8cda8	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:35.274	Giám sát viên trận đấu	2026-06-02 11:15:35.274	2026-06-02 11:15:35.274
f71003f6-5c12-479d-94bc-cad4af83af2a	7989c27b-7fec-480f-beb4-2e8a592b5567	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:35.292	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.292	2026-06-02 11:15:35.292
46a36284-7337-4a94-9a4d-bb98da25a00d	7989c27b-7fec-480f-beb4-2e8a592b5567	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:35.304	Giám sát viên trận đấu	2026-06-02 11:15:35.304	2026-06-02 11:15:35.304
e9122e4a-3054-4647-9e13-364992d97dd3	0136e3a7-a9cf-4001-9005-ecf924849e74	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:35.322	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.322	2026-06-02 11:15:35.322
b4273bc8-dce6-420a-b3b7-8fc7fb05c5c3	0136e3a7-a9cf-4001-9005-ecf924849e74	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:35.325	Giám sát viên trận đấu	2026-06-02 11:15:35.325	2026-06-02 11:15:35.325
89a438b2-4fa6-4785-8fa1-50d8a72a3b9c	16232c80-727c-4e82-a5bd-d9955d7558fb	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:35.344	Trọng tài chính - quốc tế	2026-06-02 11:15:35.344	2026-06-02 11:15:35.344
569da671-4488-4799-9ef5-ff3453aa13ca	16232c80-727c-4e82-a5bd-d9955d7558fb	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:35.355	Giám sát viên trận đấu	2026-06-02 11:15:35.355	2026-06-02 11:15:35.355
94a40e8c-446e-42e2-8e31-76a5c0ca6450	43b7fc1a-bfa2-43ca-9bd3-0ba3c44e6133	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:35.36	Trọng tài chính - quốc tế	2026-06-02 11:15:35.36	2026-06-02 11:15:35.36
8629ec6d-aee4-4937-9d09-ea9932a3e7eb	43b7fc1a-bfa2-43ca-9bd3-0ba3c44e6133	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:35.364	Giám sát viên trận đấu	2026-06-02 11:15:35.364	2026-06-02 11:15:35.364
ea98608e-6a0f-4e36-b37d-224a743cd628	bb9c252d-c120-4532-a7ee-169f49422119	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:35.37	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.37	2026-06-02 11:15:35.37
55c68220-cf94-4c05-8f57-6a6598284d59	bb9c252d-c120-4532-a7ee-169f49422119	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:35.375	Giám sát viên trận đấu	2026-06-02 11:15:35.375	2026-06-02 11:15:35.375
bbb4883d-8470-449a-8a32-576ff6080d83	b9393105-8635-4a6a-9bfa-2a46ce772fa4	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:35.38	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.38	2026-06-02 11:15:35.38
5de3e835-0d98-4fae-b8d3-f1784d837701	b9393105-8635-4a6a-9bfa-2a46ce772fa4	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:35.385	Giám sát viên trận đấu	2026-06-02 11:15:35.385	2026-06-02 11:15:35.385
2107b28f-120a-4174-a504-06fb8f35e9ff	44f2124e-144a-427b-9b47-ab3f5d89dd8e	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:35.389	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.389	2026-06-02 11:15:35.389
e332fc20-58db-4cd8-8172-3bfba9eefa05	44f2124e-144a-427b-9b47-ab3f5d89dd8e	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:35.395	Giám sát viên trận đấu	2026-06-02 11:15:35.395	2026-06-02 11:15:35.395
8542f528-5ec2-400d-b6b3-ddc7af07a5b1	c104ad94-093e-4e65-846e-7ef31ca562a8	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:35.397	Trọng tài chính - quốc tế	2026-06-02 11:15:35.397	2026-06-02 11:15:35.397
39101b01-3b87-4e06-a396-3b675222ecbe	c104ad94-093e-4e65-846e-7ef31ca562a8	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:35.402	Giám sát viên trận đấu	2026-06-02 11:15:35.402	2026-06-02 11:15:35.402
f14b0069-be8a-4e18-8b39-9749558edceb	e7d5ffbf-27cc-4b47-842c-8c10dcaed302	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:35.409	Trọng tài chính - quốc tế	2026-06-02 11:15:35.409	2026-06-02 11:15:35.409
124596f9-a9a9-4cbd-bf08-b6c64ae2be25	e7d5ffbf-27cc-4b47-842c-8c10dcaed302	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:35.417	Giám sát viên trận đấu	2026-06-02 11:15:35.417	2026-06-02 11:15:35.417
0c49e63e-0183-4193-a49e-1afe5f5fffe5	f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:35.42	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.42	2026-06-02 11:15:35.42
99f73e55-e8f2-4a90-b5c6-e8041f095679	f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:35.428	Giám sát viên trận đấu	2026-06-02 11:15:35.428	2026-06-02 11:15:35.428
669c629e-ee08-4d2d-9aac-7aab26abf9b9	7bfcdad7-bac4-4d70-bc49-497a9fbe3c1c	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:35.433	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.433	2026-06-02 11:15:35.433
8023014a-6c94-4ef6-8c47-130702485db5	7bfcdad7-bac4-4d70-bc49-497a9fbe3c1c	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:35.444	Giám sát viên trận đấu	2026-06-02 11:15:35.444	2026-06-02 11:15:35.444
1f32f374-ccfa-482a-a17a-864f268ed78a	9591271f-f07b-4c3f-90e5-e6a5cde14ef9	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:35.45	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.45	2026-06-02 11:15:35.45
dad06c66-7cdf-43a9-a4ec-cf8de4292fd7	9591271f-f07b-4c3f-90e5-e6a5cde14ef9	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:35.454	Giám sát viên trận đấu	2026-06-02 11:15:35.454	2026-06-02 11:15:35.454
26065aea-abb8-4756-b2a4-b85580b60c69	58fa8d6a-9824-45ad-a11d-7b8c90c4eb67	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:35.46	Trọng tài chính - quốc tế	2026-06-02 11:15:35.46	2026-06-02 11:15:35.46
299a2d61-f328-4647-ad5a-f3f4b58aac63	58fa8d6a-9824-45ad-a11d-7b8c90c4eb67	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:35.465	Giám sát viên trận đấu	2026-06-02 11:15:35.465	2026-06-02 11:15:35.465
1f84f944-e5f8-40c1-a6b7-22d1012acfc7	1c797dce-c2e6-4323-a114-fe1fca5faefe	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:35.469	Trọng tài chính - quốc tế	2026-06-02 11:15:35.469	2026-06-02 11:15:35.469
3b4636a1-9764-4f63-810c-2331b7c8b7da	1c797dce-c2e6-4323-a114-fe1fca5faefe	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:35.474	Giám sát viên trận đấu	2026-06-02 11:15:35.474	2026-06-02 11:15:35.474
0c104494-9323-443d-8a31-d2a618f4caae	c97af97c-874e-4691-aa62-c732a52057e0	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:35.48	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.48	2026-06-02 11:15:35.48
11340f51-bb0b-40e3-b6e2-a7485247a802	c97af97c-874e-4691-aa62-c732a52057e0	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:35.486	Giám sát viên trận đấu	2026-06-02 11:15:35.486	2026-06-02 11:15:35.486
c1903539-616c-4cdd-8bcc-7739b58ef6ef	39b57771-0c2f-4329-a0dc-1bb6ea277347	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:35.49	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.49	2026-06-02 11:15:35.49
6dff2945-8993-4d91-9ca9-c2ee7fe8a12e	39b57771-0c2f-4329-a0dc-1bb6ea277347	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:35.496	Giám sát viên trận đấu	2026-06-02 11:15:35.496	2026-06-02 11:15:35.496
f3bf070f-4844-4c1d-a36f-e62940bd70e0	7109811b-020c-4d61-bf8b-a128e2ce43a3	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:35.502	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.502	2026-06-02 11:15:35.502
0af7ceb3-1c33-4603-93c3-b18b4bff2cbe	7109811b-020c-4d61-bf8b-a128e2ce43a3	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:35.505	Giám sát viên trận đấu	2026-06-02 11:15:35.505	2026-06-02 11:15:35.505
d5b6f300-de28-4f0f-95a4-65f033f58bce	3206dc46-3d1f-4597-a4f8-217f31b2d576	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:35.51	Trọng tài chính - quốc tế	2026-06-02 11:15:35.51	2026-06-02 11:15:35.51
5bf53610-05e0-447d-af33-2c9f50909592	3206dc46-3d1f-4597-a4f8-217f31b2d576	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:35.516	Giám sát viên trận đấu	2026-06-02 11:15:35.516	2026-06-02 11:15:35.516
5b4c5bf5-7ec8-42af-bfd9-37e7adacaa7f	3f960273-e4ca-4132-9e74-94b5df17903a	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:35.523	Trọng tài chính - quốc tế	2026-06-02 11:15:35.523	2026-06-02 11:15:35.523
8fdb4ec3-c54d-44f3-aad1-e9484870c106	3f960273-e4ca-4132-9e74-94b5df17903a	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:35.531	Giám sát viên trận đấu	2026-06-02 11:15:35.531	2026-06-02 11:15:35.531
16d1ced2-cd3d-4f85-b953-379957b404b8	e41b1e65-1c00-4a1f-a801-c5221ac7e726	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:35.536	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.536	2026-06-02 11:15:35.536
eff51be2-8827-484f-9d8a-a9e2e3e31511	e41b1e65-1c00-4a1f-a801-c5221ac7e726	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:35.544	Giám sát viên trận đấu	2026-06-02 11:15:35.544	2026-06-02 11:15:35.544
ffcbdd66-3feb-4f0f-ba0f-14043dbae15a	dcc6eab6-9b33-42ff-b959-f8082608b69d	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:35.555	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.555	2026-06-02 11:15:35.555
d36c509e-5319-49a2-aa3a-44f6539e896d	dcc6eab6-9b33-42ff-b959-f8082608b69d	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:35.56	Giám sát viên trận đấu	2026-06-02 11:15:35.56	2026-06-02 11:15:35.56
d2faa2d5-887a-4b80-812f-1c959ba7bf42	4070ccc1-6b2c-48d2-abff-97c9392a26b1	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:35.564	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.564	2026-06-02 11:15:35.564
dcfe899d-eec8-44b7-9bec-a188ab6c0619	4070ccc1-6b2c-48d2-abff-97c9392a26b1	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:35.57	Giám sát viên trận đấu	2026-06-02 11:15:35.57	2026-06-02 11:15:35.57
73976c57-1467-4d02-9350-2c5ce55c36f5	58cf5557-ecd7-4299-92fd-be69b8912030	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:35.578	Trọng tài chính - quốc tế	2026-06-02 11:15:35.578	2026-06-02 11:15:35.578
bbf584a1-efde-4828-8e6c-a28724a4932f	58cf5557-ecd7-4299-92fd-be69b8912030	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:35.581	Giám sát viên trận đấu	2026-06-02 11:15:35.581	2026-06-02 11:15:35.581
e8191b00-68e7-44fe-8053-9198bef3b78e	87bc4a52-59f2-4122-9fce-9ddb7a1c3f41	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:35.585	Trọng tài chính - quốc tế	2026-06-02 11:15:35.585	2026-06-02 11:15:35.585
c32da451-7046-4c4e-8857-42bb5e4e8e61	87bc4a52-59f2-4122-9fce-9ddb7a1c3f41	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:35.589	Giám sát viên trận đấu	2026-06-02 11:15:35.589	2026-06-02 11:15:35.589
f5650164-a5aa-47ca-9205-1ad8f9e009c5	98ad2685-3660-4e08-b917-643a7961dd00	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:35.595	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.595	2026-06-02 11:15:35.595
0f400d7c-d2f2-4632-9973-1b01fcbce84c	98ad2685-3660-4e08-b917-643a7961dd00	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:35.601	Giám sát viên trận đấu	2026-06-02 11:15:35.601	2026-06-02 11:15:35.601
9a7b9478-2acb-4b5d-bf9d-e0124ccd42d3	edccb96a-9983-4079-8502-b9a97828771d	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:35.605	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.605	2026-06-02 11:15:35.605
ae0c26dc-a4b7-44f5-9a67-d2a65d8bf512	edccb96a-9983-4079-8502-b9a97828771d	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:35.612	Giám sát viên trận đấu	2026-06-02 11:15:35.612	2026-06-02 11:15:35.612
3158c6b3-560e-453c-ac4d-9807e47b526f	6973f9db-d246-4078-bcbb-482d260003be	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:35.617	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.617	2026-06-02 11:15:35.617
d870471f-5e00-4b15-9e0e-3f3b84722ab7	6973f9db-d246-4078-bcbb-482d260003be	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:35.622	Giám sát viên trận đấu	2026-06-02 11:15:35.622	2026-06-02 11:15:35.622
c1b02fe6-d420-4ed3-8de2-1704f7f080a6	7cb77c1e-a47e-4a60-8e70-2725c271455c	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:35.629	Trọng tài chính - quốc tế	2026-06-02 11:15:35.629	2026-06-02 11:15:35.629
593411d8-d4f2-4c6e-8069-ca134d6672f5	7cb77c1e-a47e-4a60-8e70-2725c271455c	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:35.634	Giám sát viên trận đấu	2026-06-02 11:15:35.634	2026-06-02 11:15:35.634
fe2af864-d69e-478d-8a4e-2cf167e1e264	a3bc1edb-d3a4-4aa6-b81b-f5d7f689ff46	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:35.64	Trọng tài chính - quốc tế	2026-06-02 11:15:35.64	2026-06-02 11:15:35.64
3756f78d-710f-4944-949e-0d59febfa90e	a3bc1edb-d3a4-4aa6-b81b-f5d7f689ff46	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:35.646	Giám sát viên trận đấu	2026-06-02 11:15:35.646	2026-06-02 11:15:35.646
b98e2bfd-ab44-452d-937e-e812ac4aa2e7	45eed773-c0ef-4521-8ea7-58080fd0acf8	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:35.652	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.652	2026-06-02 11:15:35.652
25f7badd-a6f1-4579-9e09-a1cbb7b2ee19	45eed773-c0ef-4521-8ea7-58080fd0acf8	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:35.656	Giám sát viên trận đấu	2026-06-02 11:15:35.656	2026-06-02 11:15:35.656
699a428b-fac4-4bbe-b90a-13b3ea4d4d8d	bbd86b35-cda2-41b6-89a4-96d61a9c7d2a	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:35.66	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.66	2026-06-02 11:15:35.66
95c75eb5-c570-4fbc-9280-69fc4e2e7a98	bbd86b35-cda2-41b6-89a4-96d61a9c7d2a	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:35.664	Giám sát viên trận đấu	2026-06-02 11:15:35.664	2026-06-02 11:15:35.664
6bc0d637-3845-402c-9fac-d277ee2cc678	5010116c-ba1f-4284-bc90-91baf6962e49	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:35.668	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.668	2026-06-02 11:15:35.668
47884eeb-259c-4d3c-9b1a-bd4b04a5b2f5	5010116c-ba1f-4284-bc90-91baf6962e49	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:35.672	Giám sát viên trận đấu	2026-06-02 11:15:35.672	2026-06-02 11:15:35.672
267aeddd-ec2f-4597-8bb6-26e8213c6097	3dc4762f-ecb0-4fae-b22f-b5cb0f652fb8	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:35.677	Trọng tài chính - quốc tế	2026-06-02 11:15:35.677	2026-06-02 11:15:35.677
4462eb36-e582-4129-b8c9-4605ee803266	3dc4762f-ecb0-4fae-b22f-b5cb0f652fb8	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:35.684	Giám sát viên trận đấu	2026-06-02 11:15:35.684	2026-06-02 11:15:35.684
c2eeb1c0-9551-4b82-9dd1-d5dcdf6836ae	10892dac-0efd-4078-b4ec-42fa20cbf812	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:35.69	Trọng tài chính - quốc tế	2026-06-02 11:15:35.69	2026-06-02 11:15:35.69
08989618-d2c7-4d1e-9d09-b6dac8d62627	10892dac-0efd-4078-b4ec-42fa20cbf812	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:35.696	Giám sát viên trận đấu	2026-06-02 11:15:35.696	2026-06-02 11:15:35.696
21daca85-6be1-48d3-aac0-8be613239cf8	f66c0564-6257-4c89-8be8-9bd28ba1f551	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:35.701	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.701	2026-06-02 11:15:35.701
5b6e4a5e-a427-4077-b782-d9a9c71fb19c	f66c0564-6257-4c89-8be8-9bd28ba1f551	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:35.707	Giám sát viên trận đấu	2026-06-02 11:15:35.707	2026-06-02 11:15:35.707
3fb53852-8fcb-4205-b6ae-d3677f07afd9	af84dc04-3572-4b83-b855-632fd0768082	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:35.713	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.713	2026-06-02 11:15:35.713
a6f74d6d-1824-435c-b300-205f3e9ef18c	af84dc04-3572-4b83-b855-632fd0768082	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:35.718	Giám sát viên trận đấu	2026-06-02 11:15:35.718	2026-06-02 11:15:35.718
66366a0f-163e-4f66-bb47-b288859815ab	21f2133a-bd05-49f2-ab27-7863fc47fdb8	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:35.723	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.723	2026-06-02 11:15:35.723
69de98f3-01f1-4512-b319-aabd767f1b8f	21f2133a-bd05-49f2-ab27-7863fc47fdb8	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:35.732	Giám sát viên trận đấu	2026-06-02 11:15:35.732	2026-06-02 11:15:35.732
ae010e62-75fa-4261-a769-e497110b66d1	e211698f-024c-453b-a77e-9bc7bef925a1	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:35.74	Trọng tài chính - quốc tế	2026-06-02 11:15:35.74	2026-06-02 11:15:35.74
b3ac6c75-2110-4549-9aa1-2da0ca763c0f	e211698f-024c-453b-a77e-9bc7bef925a1	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:35.746	Giám sát viên trận đấu	2026-06-02 11:15:35.746	2026-06-02 11:15:35.746
03cab685-ce71-4cb4-b255-30267867ff8b	7399ad83-1c3a-43a3-971a-fcf99eee8fc6	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:35.751	Trọng tài chính - quốc tế	2026-06-02 11:15:35.751	2026-06-02 11:15:35.751
915d0394-137e-4b9a-8410-aa79d77de6ef	7399ad83-1c3a-43a3-971a-fcf99eee8fc6	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:35.755	Giám sát viên trận đấu	2026-06-02 11:15:35.755	2026-06-02 11:15:35.755
fdc4e873-a0c2-4afc-83ef-fc73122fdd7d	112b56e2-bb9e-48b6-9e1f-e612ba73e58b	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:35.76	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.76	2026-06-02 11:15:35.76
2bb64c23-0934-4ee9-a388-98ba52fdef5f	112b56e2-bb9e-48b6-9e1f-e612ba73e58b	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:35.765	Giám sát viên trận đấu	2026-06-02 11:15:35.765	2026-06-02 11:15:35.765
cd7d478d-27b9-4ca3-b034-205867e57e52	a33d0af0-864a-448d-b643-fcdde0036d33	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:35.771	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.771	2026-06-02 11:15:35.771
d7b1892b-173e-4a09-81f9-d045c7c5ce5c	a33d0af0-864a-448d-b643-fcdde0036d33	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:35.776	Giám sát viên trận đấu	2026-06-02 11:15:35.776	2026-06-02 11:15:35.776
f85324f5-d4de-42dc-ac7f-16075fd6f587	77297a56-1ee8-444f-ac21-735cd7c87694	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:35.78	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.78	2026-06-02 11:15:35.78
4571eca3-5162-4968-894b-446240a3c387	77297a56-1ee8-444f-ac21-735cd7c87694	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:35.785	Giám sát viên trận đấu	2026-06-02 11:15:35.785	2026-06-02 11:15:35.785
8304b9bc-672a-4d37-adc6-61cebe2f0afb	feee7176-875d-4bfa-9e87-1fc96a9ff0c4	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:35.791	Trọng tài chính - quốc tế	2026-06-02 11:15:35.791	2026-06-02 11:15:35.791
fd32eeb3-64ad-461c-b93a-4e532171d8d9	feee7176-875d-4bfa-9e87-1fc96a9ff0c4	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:35.796	Giám sát viên trận đấu	2026-06-02 11:15:35.796	2026-06-02 11:15:35.796
63b8f6ab-f0c3-46c4-90c1-0a8721f8621f	dca6bb7b-e453-48d7-8e86-d500af25ab09	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:35.801	Trọng tài chính - quốc tế	2026-06-02 11:15:35.801	2026-06-02 11:15:35.801
62b8312f-7c8d-4842-afde-65d9fef956ac	dca6bb7b-e453-48d7-8e86-d500af25ab09	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:35.806	Giám sát viên trận đấu	2026-06-02 11:15:35.806	2026-06-02 11:15:35.806
0002596c-fcc2-48c6-af3d-df687d6d6463	8c2b5ca0-3d84-4a86-b7b1-74f2b4b5050f	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:35.812	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.812	2026-06-02 11:15:35.812
0b55c144-85cd-4f75-ace7-cb098f08bf42	8c2b5ca0-3d84-4a86-b7b1-74f2b4b5050f	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:35.815	Giám sát viên trận đấu	2026-06-02 11:15:35.815	2026-06-02 11:15:35.815
4e30522a-7742-4e8e-ae8e-2ff4c9951f9a	d24f5c09-da4a-4a11-aecf-8ae05c7290cd	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:35.821	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.821	2026-06-02 11:15:35.821
3497fe18-39e2-42f2-9d24-28745ecb04db	d24f5c09-da4a-4a11-aecf-8ae05c7290cd	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:35.827	Giám sát viên trận đấu	2026-06-02 11:15:35.827	2026-06-02 11:15:35.827
e5b1d13a-5df2-452e-b467-8309924b7c9f	9026f56c-a3f3-4c2d-b0e4-6d058a964392	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:35.83	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.83	2026-06-02 11:15:35.83
a4dc69ad-03c5-4ac9-9bbe-4c28f87f9ea8	9026f56c-a3f3-4c2d-b0e4-6d058a964392	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:35.833	Giám sát viên trận đấu	2026-06-02 11:15:35.833	2026-06-02 11:15:35.833
8479e551-bd65-4a09-b7e7-b8a07a94e281	1c2499a9-4deb-4b21-bce1-8cbbf8cee05f	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:35.836	Trọng tài chính - quốc tế	2026-06-02 11:15:35.836	2026-06-02 11:15:35.836
2018f80c-ee07-476f-a0b0-869af66a6e68	1c2499a9-4deb-4b21-bce1-8cbbf8cee05f	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:35.841	Giám sát viên trận đấu	2026-06-02 11:15:35.841	2026-06-02 11:15:35.841
5ec78b50-8f87-46c0-9089-c5fd459d80b4	353f93d6-97e9-401f-a8b3-d45638676c2b	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:35.844	Trọng tài chính - quốc tế	2026-06-02 11:15:35.844	2026-06-02 11:15:35.844
26db930b-94e6-4c41-9e80-2c0d20b72747	353f93d6-97e9-401f-a8b3-d45638676c2b	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:35.846	Giám sát viên trận đấu	2026-06-02 11:15:35.846	2026-06-02 11:15:35.846
c583a428-4a25-48c3-a7bc-1b5d6dafc8ce	31dd41b5-eeb3-440f-9cc4-cad6273e695a	7a99c1af-c31a-47ed-bcf2-b5233af5af89	MAIN_REFEREE	2026-06-02 11:15:35.849	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.849	2026-06-02 11:15:35.849
2358d58d-e086-43fa-913c-8054005e727b	31dd41b5-eeb3-440f-9cc4-cad6273e695a	424351e1-c6a1-4f5e-a724-f395ff9d92ef	SUPERVISOR	2026-06-02 11:15:35.852	Giám sát viên trận đấu	2026-06-02 11:15:35.852	2026-06-02 11:15:35.852
1efffcfe-f8ec-402b-991b-018b42af6255	3ff98bd7-cf11-41d9-99a6-809cd6d92de8	8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	MAIN_REFEREE	2026-06-02 11:15:35.857	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.857	2026-06-02 11:15:35.857
d1d49ea5-eabe-470b-ad5b-bb7f7bb69a67	3ff98bd7-cf11-41d9-99a6-809cd6d92de8	771e566c-9623-45b0-81e6-a40251fceba8	SUPERVISOR	2026-06-02 11:15:35.863	Giám sát viên trận đấu	2026-06-02 11:15:35.863	2026-06-02 11:15:35.863
e5d65560-ff64-43da-a0f0-f4c6c11f01b7	30bd3072-84c1-49fb-b3fe-56cef0ece5e0	b90a9100-c087-4f64-a122-1bcdcb60bd67	MAIN_REFEREE	2026-06-02 11:15:35.868	Trọng tài chính - Việt Nam	2026-06-02 11:15:35.868	2026-06-02 11:15:35.868
0bc0566f-4ced-4193-8c03-0dde670a87ec	30bd3072-84c1-49fb-b3fe-56cef0ece5e0	4b750196-2c7d-491f-8b83-4a6769653077	SUPERVISOR	2026-06-02 11:15:35.875	Giám sát viên trận đấu	2026-06-02 11:15:35.875	2026-06-02 11:15:35.875
7cf6d68b-f383-49f2-a940-ecb6811d4589	72e8e51a-2077-4722-8397-8d8869084fc7	54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	MAIN_REFEREE	2026-06-02 11:15:35.88	Trọng tài chính - quốc tế	2026-06-02 11:15:35.88	2026-06-02 11:15:35.88
459618cd-2104-435d-a061-cae8cd39a1d2	72e8e51a-2077-4722-8397-8d8869084fc7	31b3dc24-ecff-4883-9831-232eb63fe01f	SUPERVISOR	2026-06-02 11:15:35.885	Giám sát viên trận đấu	2026-06-02 11:15:35.885	2026-06-02 11:15:35.885
cb06331f-0074-4f3d-bbcf-da430395a239	e7d8bfb6-e95a-4277-8e12-999eb15a7790	4ab4996a-6fce-42df-aec6-13d8b8c004fa	MAIN_REFEREE	2026-06-02 11:15:35.89	Trọng tài chính - quốc tế	2026-06-02 11:15:35.89	2026-06-02 11:15:35.89
215c239f-9d9e-4864-beae-1cbf092d6e10	e7d8bfb6-e95a-4277-8e12-999eb15a7790	b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	SUPERVISOR	2026-06-02 11:15:35.894	Giám sát viên trận đấu	2026-06-02 11:15:35.894	2026-06-02 11:15:35.894
\.


--
-- Data for Name: match_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.match_reports (id, match_id, submitted_by_user_id, home_score, away_score, best_player_id, technical_stats, note, submitted_at, created_at, updated_at) FROM stdin;
72ed96b3-802d-4892-964e-b25493242ddc	00a34b87-506f-4deb-9d0b-3ebb1d591b36	\N	0	3	b2760b91-57b7-4d26-909e-c602b8e15c5a	{}	report-demo-player-of-match	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671
d76d3688-5436-4dad-8951-8b4430ddb831	0136e3a7-a9cf-4001-9005-ecf924849e74	\N	3	1	22afd02f-8ed5-44ed-b351-428a57b2f878	{}	report-demo-player-of-match	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671
fa7c156f-f47d-4ea4-8c2b-e7390f683002	01398c65-3655-4e63-bdd5-7820f0a78504	\N	0	2	ff43cf28-5b09-4b5b-b2d8-c4d6ed65ebb0	{}	report-demo-player-of-match	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671
6f90fe80-a4ad-4d48-88b8-e53fc49d5ddf	0a809e4e-bf49-4832-b760-f144bb9583ae	\N	4	3	c735827f-8c62-42a4-9ee6-2abb1f707533	{}	report-demo-player-of-match	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671
c2b3bf29-ecd2-4e64-abb4-53f9b61d981d	16232c80-727c-4e82-a5bd-d9955d7558fb	\N	2	1	b3f559ed-95c2-4c77-8731-dc68ff546a6b	{}	report-demo-player-of-match	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671
77b49922-9067-4ac0-a41d-e773d680fe55	1c797dce-c2e6-4323-a114-fe1fca5faefe	\N	2	3	45a3236c-a1b5-47b5-8266-36e94c50a9b6	{}	report-demo-player-of-match	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671
8628db94-7e6f-4bb6-97e6-1062792261c7	2011a3f3-7df2-4f03-b106-d1eb6fee0fde	\N	2	0	256f7828-b235-42d1-b366-6f2f78ee0a03	{}	report-demo-player-of-match	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671
5cfd3f38-574f-46e1-a80a-27702bc0c5a0	278ae361-ee59-442e-9f4c-d3571eb1e877	\N	3	4	1ca283d1-063e-498f-8db9-11a0dfe58498	{}	report-demo-player-of-match	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671	2026-06-02 11:15:49.671
\.


--
-- Data for Name: match_team_registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.match_team_registrations (id, match_id, team_id, kit_type, formation, status, submitted_at, reviewed_at, review_note, created_at, updated_at) FROM stdin;
c2405006-95eb-4b63-bfc4-a4a766cb1830	3f960273-e4ca-4132-9e74-94b5df17903a	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	PRIMARY	4-4-2	APPROVED	2026-06-02 11:15:34.004	2026-06-02 11:15:34.004	\N	2026-06-02 11:15:34.044	2026-06-02 11:15:34.044
945091bb-e732-481c-8f8b-f9a7ee4b5f4c	3f960273-e4ca-4132-9e74-94b5df17903a	9f54615c-03ae-464b-adb4-50b9c1677d41	BACKUP	4-4-2	APPROVED	2026-06-02 11:15:34.076	2026-06-02 11:15:34.076	\N	2026-06-02 11:15:34.09	2026-06-02 11:15:34.09
494c2359-b725-4fb0-9c38-f5bef49afc10	3206dc46-3d1f-4597-a4f8-217f31b2d576	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	PRIMARY	4-4-2	APPROVED	2026-06-02 12:08:36.107	2026-06-02 12:08:37.562	\N	2026-06-02 12:08:36.146	2026-06-02 12:08:37.57
68c3b6a0-5569-4ce8-93d6-e1e400c0baf9	3206dc46-3d1f-4597-a4f8-217f31b2d576	c11ee3ba-bcce-424a-994e-6477045af536	PRIMARY	4-4-2	APPROVED	2026-06-02 12:08:45.422	2026-06-02 12:09:53.532	\N	2026-06-02 12:08:45.425	2026-06-02 12:09:53.534
\.


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.matches (id, round_no, home_team_id, away_team_id, stadium_id, kickoff_at, status, created_at, updated_at, away_score, home_score, leg, season_id, score_source) FROM stdin;
c97af97c-874e-4691-aa62-c732a52057e0	11	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2024-11-23 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
39b57771-0c2f-4329-a0dc-1bb6ea277347	11	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	655df04f-5508-45f3-8032-fd657a753360	\N	2024-11-23 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
7109811b-020c-4d61-bf8b-a128e2ce43a3	11	df825052-1f68-4f44-857f-c2de07315fd2	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2024-11-23 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
3206dc46-3d1f-4597-a4f8-217f31b2d576	11	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	c11ee3ba-bcce-424a-994e-6477045af536	\N	2024-11-23 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	1	9f54615c-03ae-464b-adb4-50b9c1677d41	655df04f-5508-45f3-8032-fd657a753360	\N	2024-09-14 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.445	0	2	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
53968a22-96c2-4389-a094-3b82360d618c	1	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2024-09-14 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.57	2	0	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
88fb47fb-0275-4c5b-a71d-c7aa752934da	1	df825052-1f68-4f44-857f-c2de07315fd2	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2024-09-14 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.777	3	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
e525bd43-df1d-40bd-8747-d8c10e728681	2	9f54615c-03ae-464b-adb4-50b9c1677d41	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2024-09-21 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.922	1	1	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
5818142c-074f-4d84-a482-1e620ad53d18	2	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2024-09-21 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:29.019	0	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
3a2be07a-5c14-42f9-af3f-aa76eea68139	2	655df04f-5508-45f3-8032-fd657a753360	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2024-09-21 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:29.093	3	1	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
d85cc39e-e33b-4abb-bc25-e6a2f69689d8	2	3424bc38-f674-4378-a88c-1c9ec5b9a77c	df825052-1f68-4f44-857f-c2de07315fd2	\N	2024-09-21 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:29.173	1	0	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
01398c65-3655-4e63-bdd5-7820f0a78504	2	c11ee3ba-bcce-424a-994e-6477045af536	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2024-09-21 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:29.237	2	0	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
859a7a53-3c30-49bf-86cc-529dbedc0d8a	3	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2024-09-28 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:29.291	4	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
b1bf4ea7-da39-4bec-a47c-73595095b785	3	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2024-09-28 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:29.421	2	4	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
9f1f3cc6-e65c-430d-a397-f9d38e40c459	3	df825052-1f68-4f44-857f-c2de07315fd2	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2024-09-28 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:29.598	3	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
00a34b87-506f-4deb-9d0b-3ebb1d591b36	3	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	655df04f-5508-45f3-8032-fd657a753360	\N	2024-09-28 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:29.744	3	0	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
8f789f51-0e23-4d07-ba74-1ff4442ae866	3	c11ee3ba-bcce-424a-994e-6477045af536	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2024-09-28 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:29.829	2	2	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
e99cec87-b449-4daa-bc2b-44651da0a41a	4	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2024-10-05 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:29.92	4	1	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
73b58df4-b989-4b1d-bcbd-25b92dac3bab	4	9f54615c-03ae-464b-adb4-50b9c1677d41	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2024-10-05 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:30.22	2	1	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
dbeef7f6-fa0c-4e80-9277-538a2ac142d4	4	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	c11ee3ba-bcce-424a-994e-6477045af536	\N	2024-10-05 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:30.379	2	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
ea39cb69-b7c7-484f-b818-7a2560bed5a4	4	655df04f-5508-45f3-8032-fd657a753360	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2024-10-05 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:30.486	4	0	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
2011a3f3-7df2-4f03-b106-d1eb6fee0fde	5	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	df825052-1f68-4f44-857f-c2de07315fd2	\N	2024-10-12 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:30.592	0	2	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
33b6f25c-146a-4f5a-8128-124b45fb1a18	5	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2024-10-12 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:30.706	3	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	5	c11ee3ba-bcce-424a-994e-6477045af536	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2024-10-12 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:30.819	3	2	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
637c8078-4ee3-48ce-9db4-ad52f10162d6	5	3424bc38-f674-4378-a88c-1c9ec5b9a77c	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2024-10-12 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:30.957	3	4	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
62c65337-77ae-41c5-8a84-6039c7401a44	5	655df04f-5508-45f3-8032-fd657a753360	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2024-10-12 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:31.087	4	2	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
a23e96ef-1533-4c9d-b69d-8bacddc063f1	6	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2024-10-19 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:31.18	0	2	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
999b3810-edbc-4c00-857b-503a42288ce2	6	df825052-1f68-4f44-857f-c2de07315fd2	c11ee3ba-bcce-424a-994e-6477045af536	\N	2024-10-19 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:31.276	3	1	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
9086183b-6ea8-4da1-a7a3-68c43db51601	6	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2024-10-19 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:31.374	4	1	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
6b0ad60e-7aeb-4e85-86af-4176e67dd633	6	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	655df04f-5508-45f3-8032-fd657a753360	\N	2024-10-19 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:31.518	0	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	7	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	c11ee3ba-bcce-424a-994e-6477045af536	\N	2024-10-26 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:31.763	4	2	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
804c82da-f26b-41ac-9578-acd4179f6e1d	7	3424bc38-f674-4378-a88c-1c9ec5b9a77c	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2024-10-26 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:31.921	4	2	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
5846bf30-13b4-489a-a919-9f8e6f8be675	7	655df04f-5508-45f3-8032-fd657a753360	df825052-1f68-4f44-857f-c2de07315fd2	\N	2024-10-26 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:32.111	3	2	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
ceffb55c-2c1e-4387-b36f-b4150bd75819	7	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2024-10-26 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:32.211	3	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
f73e99c6-1a2a-45da-9f77-32d25658b080	7	9f54615c-03ae-464b-adb4-50b9c1677d41	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2024-10-26 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:32.31	0	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
7989c27b-7fec-480f-beb4-2e8a592b5567	8	3424bc38-f674-4378-a88c-1c9ec5b9a77c	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2024-11-02 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:32.392	2	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
0136e3a7-a9cf-4001-9005-ecf924849e74	8	c11ee3ba-bcce-424a-994e-6477045af536	655df04f-5508-45f3-8032-fd657a753360	\N	2024-11-02 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:32.511	1	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
16232c80-727c-4e82-a5bd-d9955d7558fb	8	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2024-11-02 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:32.687	1	2	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
e6f18547-381c-40a3-8586-a27493c8cda8	8	df825052-1f68-4f44-857f-c2de07315fd2	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2024-11-02 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:32.723	4	4	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
43b7fc1a-bfa2-43ca-9bd3-0ba3c44e6133	8	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2024-11-02 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:32.852	3	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
c104ad94-093e-4e65-846e-7ef31ca562a8	9	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	655df04f-5508-45f3-8032-fd657a753360	\N	2024-11-09 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:32.934	4	4	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
bb9c252d-c120-4532-a7ee-169f49422119	9	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2024-11-09 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:33.105	3	2	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
e7d5ffbf-27cc-4b47-842c-8c10dcaed302	9	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2024-11-09 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:33.338	3	0	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
b9393105-8635-4a6a-9bfa-2a46ce772fa4	9	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	df825052-1f68-4f44-857f-c2de07315fd2	\N	2024-11-09 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:33.424	0	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	10	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2024-11-16 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:33.486	4	0	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
7bfcdad7-bac4-4d70-bc49-497a9fbe3c1c	10	655df04f-5508-45f3-8032-fd657a753360	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2024-11-16 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:33.617	0	1	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
9591271f-f07b-4c3f-90e5-e6a5cde14ef9	10	3424bc38-f674-4378-a88c-1c9ec5b9a77c	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2024-11-16 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:33.688	0	0	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
58fa8d6a-9824-45ad-a11d-7b8c90c4eb67	10	c11ee3ba-bcce-424a-994e-6477045af536	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2024-11-16 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:33.729	4	0	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
1c797dce-c2e6-4323-a114-fe1fca5faefe	10	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	df825052-1f68-4f44-857f-c2de07315fd2	\N	2024-11-16 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:33.866	3	2	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
3f960273-e4ca-4132-9e74-94b5df17903a	11	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2024-11-23 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:33.963	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
e41b1e65-1c00-4a1f-a801-c5221ac7e726	12	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2024-11-30 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
dcc6eab6-9b33-42ff-b959-f8082608b69d	12	9f54615c-03ae-464b-adb4-50b9c1677d41	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2024-11-30 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
4070ccc1-6b2c-48d2-abff-97c9392a26b1	12	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	df825052-1f68-4f44-857f-c2de07315fd2	\N	2024-11-30 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
58cf5557-ecd7-4299-92fd-be69b8912030	12	655df04f-5508-45f3-8032-fd657a753360	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2024-11-30 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
87bc4a52-59f2-4122-9fce-9ddb7a1c3f41	12	3424bc38-f674-4378-a88c-1c9ec5b9a77c	c11ee3ba-bcce-424a-994e-6477045af536	\N	2024-11-30 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
98ad2685-3660-4e08-b917-643a7961dd00	13	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2024-12-07 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
edccb96a-9983-4079-8502-b9a97828771d	13	df825052-1f68-4f44-857f-c2de07315fd2	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2024-12-07 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
6973f9db-d246-4078-bcbb-482d260003be	13	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2024-12-07 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
7cb77c1e-a47e-4a60-8e70-2725c271455c	13	c11ee3ba-bcce-424a-994e-6477045af536	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2024-12-07 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
a3bc1edb-d3a4-4aa6-b81b-f5d7f689ff46	13	3424bc38-f674-4378-a88c-1c9ec5b9a77c	655df04f-5508-45f3-8032-fd657a753360	\N	2024-12-07 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
45eed773-c0ef-4521-8ea7-58080fd0acf8	14	df825052-1f68-4f44-857f-c2de07315fd2	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2024-12-14 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
bbd86b35-cda2-41b6-89a4-96d61a9c7d2a	14	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2024-12-14 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
5010116c-ba1f-4284-bc90-91baf6962e49	14	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	c11ee3ba-bcce-424a-994e-6477045af536	\N	2024-12-14 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
3dc4762f-ecb0-4fae-b22f-b5cb0f652fb8	14	9f54615c-03ae-464b-adb4-50b9c1677d41	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2024-12-14 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
10892dac-0efd-4078-b4ec-42fa20cbf812	14	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	655df04f-5508-45f3-8032-fd657a753360	\N	2024-12-14 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
f66c0564-6257-4c89-8be8-9bd28ba1f551	15	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2024-12-21 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
af84dc04-3572-4b83-b855-632fd0768082	15	c11ee3ba-bcce-424a-994e-6477045af536	df825052-1f68-4f44-857f-c2de07315fd2	\N	2024-12-21 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
21f2133a-bd05-49f2-ab27-7863fc47fdb8	15	3424bc38-f674-4378-a88c-1c9ec5b9a77c	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2024-12-21 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
e211698f-024c-453b-a77e-9bc7bef925a1	15	655df04f-5508-45f3-8032-fd657a753360	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2024-12-21 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
7399ad83-1c3a-43a3-971a-fcf99eee8fc6	15	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2024-12-21 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
112b56e2-bb9e-48b6-9e1f-e612ba73e58b	16	c11ee3ba-bcce-424a-994e-6477045af536	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2024-12-28 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
a33d0af0-864a-448d-b643-fcdde0036d33	16	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2024-12-28 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
77297a56-1ee8-444f-ac21-735cd7c87694	16	df825052-1f68-4f44-857f-c2de07315fd2	655df04f-5508-45f3-8032-fd657a753360	\N	2024-12-28 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
feee7176-875d-4bfa-9e87-1fc96a9ff0c4	16	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2024-12-28 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
dca6bb7b-e453-48d7-8e86-d500af25ab09	16	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2024-12-28 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
8c2b5ca0-3d84-4a86-b7b1-74f2b4b5050f	17	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2025-01-04 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
353f93d6-97e9-401f-a8b3-d45638676c2b	17	655df04f-5508-45f3-8032-fd657a753360	c11ee3ba-bcce-424a-994e-6477045af536	\N	2025-01-04 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
1c2499a9-4deb-4b21-bce1-8cbbf8cee05f	17	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2025-01-04 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
9026f56c-a3f3-4c2d-b0e4-6d058a964392	17	9f54615c-03ae-464b-adb4-50b9c1677d41	df825052-1f68-4f44-857f-c2de07315fd2	\N	2025-01-04 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
d24f5c09-da4a-4a11-aecf-8ae05c7290cd	17	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2025-01-04 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
31dd41b5-eeb3-440f-9cc4-cad6273e695a	18	655df04f-5508-45f3-8032-fd657a753360	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2025-01-11 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
3ff98bd7-cf11-41d9-99a6-809cd6d92de8	18	3424bc38-f674-4378-a88c-1c9ec5b9a77c	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2025-01-11 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
30bd3072-84c1-49fb-b3fe-56cef0ece5e0	18	c11ee3ba-bcce-424a-994e-6477045af536	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2025-01-11 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
72e8e51a-2077-4722-8397-8d8869084fc7	18	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2025-01-11 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
e7d8bfb6-e95a-4277-8e12-999eb15a7790	18	df825052-1f68-4f44-857f-c2de07315fd2	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2025-01-11 00:00:00	PUBLISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.224	\N	\N	2	8d447186-52eb-472a-a97a-d721be7936d6	\N
278ae361-ee59-442e-9f4c-d3571eb1e877	1	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2024-09-14 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.299	4	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
e426c356-88e2-409e-b5ff-18ba1608cb7c	1	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	c11ee3ba-bcce-424a-994e-6477045af536	\N	2024-09-14 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:28.667	2	4	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
9aae48db-c79b-495b-8647-bd775c4def34	4	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	df825052-1f68-4f44-857f-c2de07315fd2	\N	2024-10-05 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:30.092	3	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
0a809e4e-bf49-4832-b760-f144bb9583ae	6	9f54615c-03ae-464b-adb4-50b9c1677d41	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2024-10-19 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:31.646	3	4	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
44f2124e-144a-427b-9b47-ab3f5d89dd8e	9	9f54615c-03ae-464b-adb4-50b9c1677d41	c11ee3ba-bcce-424a-994e-6477045af536	\N	2024-11-09 00:00:00	FINISHED	2026-06-02 11:15:28.224	2026-06-02 11:15:33.226	0	3	1	8d447186-52eb-472a-a97a-d721be7936d6	\N
188d980d-e259-4a1d-b649-62653bc51434	1	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2025-09-06 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
ccc1fd08-56ec-46b9-8a2f-56b40f21d689	1	9f54615c-03ae-464b-adb4-50b9c1677d41	655df04f-5508-45f3-8032-fd657a753360	\N	2025-09-06 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
e7ff3406-bbc5-4df8-b167-8ea2e8c81b55	1	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2025-09-06 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
47921a70-c99d-4316-a772-dfd31ad0fe1f	1	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2025-09-06 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
7f603eac-a891-4add-9949-27cb67c21152	1	c11ee3ba-bcce-424a-994e-6477045af536	df825052-1f68-4f44-857f-c2de07315fd2	\N	2025-09-06 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
19b5c1da-cf90-432f-a434-66321a9f85fb	2	9f54615c-03ae-464b-adb4-50b9c1677d41	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2025-09-13 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
c5e35652-ea93-435d-b6d8-1dae16fe4583	2	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2025-09-13 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
c9d2fea4-5243-46d4-94aa-c00c4d0110d4	2	655df04f-5508-45f3-8032-fd657a753360	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2025-09-13 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
a218fbd4-9494-4f66-abaa-c6c530ebbc52	2	3424bc38-f674-4378-a88c-1c9ec5b9a77c	c11ee3ba-bcce-424a-994e-6477045af536	\N	2025-09-13 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
73cb81b3-3288-4ef9-9f3a-3f95afede52c	2	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	df825052-1f68-4f44-857f-c2de07315fd2	\N	2025-09-13 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
2a98ac31-2de8-4516-8c4e-66996e4062e6	3	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2025-09-20 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
5f0f5c51-be77-42c4-a8e3-dd2a14bd8856	3	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2025-09-20 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
71fe3b07-9e60-47e9-aa3b-a9a0333849a9	3	c11ee3ba-bcce-424a-994e-6477045af536	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2025-09-20 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
ad909c06-931e-4446-b650-95766005c987	3	df825052-1f68-4f44-857f-c2de07315fd2	655df04f-5508-45f3-8032-fd657a753360	\N	2025-09-20 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
5ef90d2d-ec62-4846-acbb-b36351e3c3a0	3	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2025-09-20 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
7b262847-beb4-443c-9842-09f8dd6408a2	4	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2025-09-27 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
dbf89c3e-8099-4d98-a7d5-3939edd11f33	4	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	c11ee3ba-bcce-424a-994e-6477045af536	\N	2025-09-27 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
aefe417e-7aba-4f0d-8de6-e4b8f91bc75b	4	9f54615c-03ae-464b-adb4-50b9c1677d41	df825052-1f68-4f44-857f-c2de07315fd2	\N	2025-09-27 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
0a771c73-a336-4419-8d95-e4cfa5418386	4	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2025-09-27 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
4d752a27-a68b-4c7e-9fc6-98bf06c9cba8	4	655df04f-5508-45f3-8032-fd657a753360	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2025-09-27 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
03fb129e-ac4d-48de-8a8c-325a78c915d5	5	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	c11ee3ba-bcce-424a-994e-6477045af536	\N	2025-10-04 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
a7247aae-279d-4d6f-a467-17375d525080	5	df825052-1f68-4f44-857f-c2de07315fd2	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2025-10-04 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
e76ae8c3-06b8-4c0e-a777-3bcde69a2071	5	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2025-10-04 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
7175b010-e017-45cc-a1cf-abbcdda9fd08	5	3424bc38-f674-4378-a88c-1c9ec5b9a77c	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2025-10-04 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
22798787-81dc-452c-b185-7ca105ceecb6	5	655df04f-5508-45f3-8032-fd657a753360	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2025-10-04 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
59afffc5-580b-4252-b9df-948d0bc2c3c6	6	df825052-1f68-4f44-857f-c2de07315fd2	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2025-10-11 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
d1467514-db2c-4360-a9a4-a75178f9e997	6	c11ee3ba-bcce-424a-994e-6477045af536	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2025-10-11 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
475c9867-a853-410b-a5c4-99710546f97c	6	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2025-10-11 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
a0b43422-b48c-4807-b92f-c3d1f174b69f	6	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	655df04f-5508-45f3-8032-fd657a753360	\N	2025-10-11 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
d464feb4-9367-481f-bd1f-1a8abefcdaaf	6	9f54615c-03ae-464b-adb4-50b9c1677d41	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2025-10-11 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
0d7cea88-8c10-409d-9649-b1c2f04f4360	7	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2025-10-18 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
b31334a8-b518-41fe-bbd9-7c24d256442b	7	3424bc38-f674-4378-a88c-1c9ec5b9a77c	df825052-1f68-4f44-857f-c2de07315fd2	\N	2025-10-18 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
f47f3f16-df25-4c45-82bf-1f40c9553643	7	655df04f-5508-45f3-8032-fd657a753360	c11ee3ba-bcce-424a-994e-6477045af536	\N	2025-10-18 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
6f583ba2-e536-40ee-9324-9dd4c8edf589	7	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2025-10-18 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
a28fa9be-e4b4-4a7c-8b96-df932e10c4e0	7	9f54615c-03ae-464b-adb4-50b9c1677d41	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2025-10-18 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
6618e114-28b2-467f-9f92-c9e3a6880a63	8	3424bc38-f674-4378-a88c-1c9ec5b9a77c	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2025-10-25 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
ceebff22-dc1c-44b7-8b08-56350002ecaa	8	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	655df04f-5508-45f3-8032-fd657a753360	\N	2025-10-25 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
0adbd883-f704-46a6-8341-28c2502ebe2a	8	df825052-1f68-4f44-857f-c2de07315fd2	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2025-10-25 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
902cc130-0ba1-44f2-b9df-61e11f5cf537	8	c11ee3ba-bcce-424a-994e-6477045af536	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2025-10-25 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
25ac54ff-2bff-41a8-b8c5-b14190737bf2	8	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2025-10-25 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
9244a30f-2245-44cf-b9f9-24cd3e095a46	9	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	655df04f-5508-45f3-8032-fd657a753360	\N	2025-11-01 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
0a40ffdc-9c9d-4f1a-aa8c-544c820fd9da	9	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2025-11-01 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
cfe51aef-e6b8-4fcf-b05f-37459b149e70	9	9f54615c-03ae-464b-adb4-50b9c1677d41	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2025-11-01 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
b83bd965-b572-44d3-81f9-7f1d3d5d5f9a	9	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	df825052-1f68-4f44-857f-c2de07315fd2	\N	2025-11-01 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
3b0ea9ee-a6cf-4013-8169-296e001856cb	9	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	c11ee3ba-bcce-424a-994e-6477045af536	\N	2025-11-01 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
25d27a83-73fd-4c78-9f1e-a270c38dd403	10	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2025-11-08 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
b741817b-acda-4573-a5d6-a52e0e300d85	10	655df04f-5508-45f3-8032-fd657a753360	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2025-11-08 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
5faf3f0a-870c-4413-a980-5536fd170cca	10	3424bc38-f674-4378-a88c-1c9ec5b9a77c	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2025-11-08 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
e2bdec17-e07b-496e-a909-f738af19ed63	10	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2025-11-08 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
731479a2-55ea-4619-b4ee-52a90b3bdc08	10	df825052-1f68-4f44-857f-c2de07315fd2	c11ee3ba-bcce-424a-994e-6477045af536	\N	2025-11-08 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
5433ba84-ac74-43f3-945b-4d66e1dce871	11	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2025-11-15 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
1160a25e-0da7-4b24-9de4-317d716f57cc	11	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2025-11-15 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
9573c53e-a2ce-4fee-b708-a76bbb32ad5e	11	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	655df04f-5508-45f3-8032-fd657a753360	\N	2025-11-15 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
29b5dfff-f4ed-4767-bdba-3d48b08b492f	11	c11ee3ba-bcce-424a-994e-6477045af536	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2025-11-15 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
26eacf1b-7b67-4b5a-b14c-175223011c3e	11	df825052-1f68-4f44-857f-c2de07315fd2	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2025-11-15 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
4f704412-50fd-47fa-be8e-a5f75b5427ae	12	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2025-11-22 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
c8c390f8-5e4b-4475-8af5-f19e6167a7bc	12	9f54615c-03ae-464b-adb4-50b9c1677d41	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2025-11-22 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
8f1b3465-668a-4b77-91d9-b3900e6b2359	12	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	c11ee3ba-bcce-424a-994e-6477045af536	\N	2025-11-22 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
2bf404c0-c9b2-4de3-bf9c-a64729509231	12	655df04f-5508-45f3-8032-fd657a753360	df825052-1f68-4f44-857f-c2de07315fd2	\N	2025-11-22 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
208ed11b-8c89-475e-9028-e41dd47eb54d	12	3424bc38-f674-4378-a88c-1c9ec5b9a77c	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2025-11-22 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
055c453e-2e96-4bba-bc1e-a8631390fb0c	13	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2025-11-29 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
89a4e4c9-2e4b-41b8-8801-b5deb1d42109	13	c11ee3ba-bcce-424a-994e-6477045af536	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2025-11-29 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
27fccb71-d4f8-40e7-81de-56844b0a166d	13	df825052-1f68-4f44-857f-c2de07315fd2	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2025-11-29 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
7b088db5-c0b1-4a2d-b300-c0e18c71ecd4	13	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2025-11-29 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
4e564ab6-8156-4640-ac78-51a65b64a730	13	3424bc38-f674-4378-a88c-1c9ec5b9a77c	655df04f-5508-45f3-8032-fd657a753360	\N	2025-11-29 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
86cfe925-10e8-4e42-844a-45beee4a0ef5	14	c11ee3ba-bcce-424a-994e-6477045af536	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2025-12-06 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
5d6b68e3-8305-43cd-89d6-d3d8d855a1b9	14	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	df825052-1f68-4f44-857f-c2de07315fd2	\N	2025-12-06 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
2779d8c7-d89f-4eb8-ad55-5fe9f1994f74	14	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2025-12-06 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
76c1c5de-8080-4959-95db-086af07bd041	14	9f54615c-03ae-464b-adb4-50b9c1677d41	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2025-12-06 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
17a8b710-44ea-4e35-8d22-d48eecf8f73f	14	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	655df04f-5508-45f3-8032-fd657a753360	\N	2025-12-06 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
b165a74a-78af-4eac-b711-4cced3406dec	15	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	df825052-1f68-4f44-857f-c2de07315fd2	\N	2025-12-13 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
1a288764-98bd-42d2-9a73-3b379c78425c	15	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	c11ee3ba-bcce-424a-994e-6477045af536	\N	2025-12-13 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
bcd8ce72-ada3-4a8b-a9ee-dec507b25bea	15	3424bc38-f674-4378-a88c-1c9ec5b9a77c	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2025-12-13 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
d0f81ea6-276a-4012-8970-991a4e5dac2c	15	655df04f-5508-45f3-8032-fd657a753360	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2025-12-13 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
624fb6c7-5ed2-4577-ad0c-980db039370c	15	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2025-12-13 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
0b0d4eb6-c1c6-427a-8820-359e575ed588	16	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2025-12-20 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
286ae7a1-799c-46e2-bebe-f795cac70371	16	df825052-1f68-4f44-857f-c2de07315fd2	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2025-12-20 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
034a8fe0-1c4c-4be3-b5fb-c8823a6a327a	16	c11ee3ba-bcce-424a-994e-6477045af536	655df04f-5508-45f3-8032-fd657a753360	\N	2025-12-20 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
14373ec0-1212-4e16-9852-3e9a49a3ffec	16	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2025-12-20 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
0287032e-01c3-48a0-9942-c2b13f2560bd	16	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2025-12-20 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
7a9c3322-61ce-45f8-838e-d8bc1b38be2a	17	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	3424bc38-f674-4378-a88c-1c9ec5b9a77c	\N	2025-12-27 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	2	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
e6fa0f05-49e7-4813-a9ec-cfcce43c9212	17	655df04f-5508-45f3-8032-fd657a753360	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	\N	2025-12-27 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	2	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
b365ae97-bc0e-4ca1-9b42-01c005f3cb80	17	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	df825052-1f68-4f44-857f-c2de07315fd2	\N	2025-12-27 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
74fc4fdb-e8e8-4b12-9bc6-4e4817e875a3	17	9f54615c-03ae-464b-adb4-50b9c1677d41	c11ee3ba-bcce-424a-994e-6477045af536	\N	2025-12-27 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
fabd0a52-794c-42ef-a6d2-9e67e49758df	17	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2025-12-27 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	0	3	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
3a051936-481d-42f9-b55e-35f6e370b332	18	655df04f-5508-45f3-8032-fd657a753360	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	\N	2026-01-03 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
044beae0-9e66-4b24-9c52-132c6df21dda	18	3424bc38-f674-4378-a88c-1c9ec5b9a77c	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	\N	2026-01-03 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
fc5d5e14-2e61-4b5b-9301-32e156bcfde6	18	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	9f54615c-03ae-464b-adb4-50b9c1677d41	\N	2026-01-03 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
db528e90-aede-40a0-b36e-f1ea75ce470d	18	df825052-1f68-4f44-857f-c2de07315fd2	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	\N	2026-01-03 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
67523a2f-411f-4d4d-9da0-3783b7e7b40d	18	c11ee3ba-bcce-424a-994e-6477045af536	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	\N	2026-01-03 11:00:00	FINISHED	2026-06-02 11:15:39.301	2026-06-02 11:15:39.301	3	0	2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	\N
8a802a96-f2ca-4991-a811-91ac7eaebb4e	1	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	d34f8d8f-99ae-4260-bf5d-910f24be3336	2022-09-03 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
38949372-bcd7-4ca2-9390-4c00ec060538	1	9f54615c-03ae-464b-adb4-50b9c1677d41	655df04f-5508-45f3-8032-fd657a753360	e0922349-6ef9-4456-9acf-05ad869d581c	2022-09-03 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
d81d8e99-7e8c-4ad0-861a-9ba74690022f	1	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	3424bc38-f674-4378-a88c-1c9ec5b9a77c	91e98957-387a-4441-99ac-616cdc690608	2022-09-03 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
fe0ee621-0b81-4f10-b747-045f70dfd6b7	1	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	c11ee3ba-bcce-424a-994e-6477045af536	1a93e748-8884-4c17-be23-43980ffe7608	2022-09-03 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
ce7c497a-e6ed-4ab7-86f3-264ba2cb07e4	1	df825052-1f68-4f44-857f-c2de07315fd2	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2022-09-03 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
1a42cfd8-7e96-4a09-9905-78c8aea56e54	2	9f54615c-03ae-464b-adb4-50b9c1677d41	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	e0922349-6ef9-4456-9acf-05ad869d581c	2022-09-10 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	3	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
8367556d-b3d3-47c7-80a6-737f55f752e7	2	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	e0922349-6ef9-4456-9acf-05ad869d581c	2022-09-10 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
14964a62-0156-4c4d-b6d6-904993303c34	2	655df04f-5508-45f3-8032-fd657a753360	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	8178046b-f654-4344-9434-e4b9ec71fd1b	2022-09-10 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
210b7688-1a25-4ad8-9021-d55e3251a6ef	2	3424bc38-f674-4378-a88c-1c9ec5b9a77c	df825052-1f68-4f44-857f-c2de07315fd2	c81e244b-13f9-423c-aabb-b06cea5aeccb	2022-09-10 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
d3de30ac-383b-4ada-96e8-b98ebba5ac71	2	c11ee3ba-bcce-424a-994e-6477045af536	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	e8098118-bcb9-4905-8b88-4452a6d843fc	2022-09-10 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
208a32ac-5c6e-4a9f-80dc-cae30e719170	3	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	d34f8d8f-99ae-4260-bf5d-910f24be3336	2022-09-17 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	3	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
2cbc2c6c-e1be-4dba-a41e-0f7142ec8235	3	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	9f54615c-03ae-464b-adb4-50b9c1677d41	1a93e748-8884-4c17-be23-43980ffe7608	2022-09-17 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
c2041984-aa24-46b2-949c-2496a8501103	3	df825052-1f68-4f44-857f-c2de07315fd2	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2022-09-17 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
21c579e5-d59b-4920-9c17-27e93835e223	3	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	655df04f-5508-45f3-8032-fd657a753360	c1649f16-5f82-4079-822e-58d09dfba4df	2022-09-17 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
b729ea41-0c53-4f13-a315-1f2866e5c1d0	3	c11ee3ba-bcce-424a-994e-6477045af536	3424bc38-f674-4378-a88c-1c9ec5b9a77c	e8098118-bcb9-4905-8b88-4452a6d843fc	2022-09-17 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
f7759e01-1cda-4414-82d7-8534a05e626d	4	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	1a93e748-8884-4c17-be23-43980ffe7608	2022-09-24 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	3	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
e8918642-f2c3-423d-b9cd-5a8319186b9f	4	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	df825052-1f68-4f44-857f-c2de07315fd2	91e98957-387a-4441-99ac-616cdc690608	2022-09-24 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
240ee01a-5fc0-4e13-b7aa-46e71e34b1be	4	9f54615c-03ae-464b-adb4-50b9c1677d41	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	e0922349-6ef9-4456-9acf-05ad869d581c	2022-09-24 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
dd4f4023-c1f6-4656-b59f-d2e28132aafa	4	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	c11ee3ba-bcce-424a-994e-6477045af536	e0922349-6ef9-4456-9acf-05ad869d581c	2022-09-24 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
e9545239-fcfe-4773-89c1-56be985ed7a9	4	655df04f-5508-45f3-8032-fd657a753360	3424bc38-f674-4378-a88c-1c9ec5b9a77c	8178046b-f654-4344-9434-e4b9ec71fd1b	2022-09-24 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
9a3fdb15-434d-42f4-9552-8517d5f8a47c	5	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	df825052-1f68-4f44-857f-c2de07315fd2	d34f8d8f-99ae-4260-bf5d-910f24be3336	2022-10-01 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	3	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
3f264bd1-fa45-4f00-b1f6-da9f035003eb	5	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	c1649f16-5f82-4079-822e-58d09dfba4df	2022-10-01 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
ff68cbba-5f07-440c-9414-18c1c48061a6	5	c11ee3ba-bcce-424a-994e-6477045af536	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	e8098118-bcb9-4905-8b88-4452a6d843fc	2022-10-01 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
24b6dd5a-e9b3-41e4-a49c-e128ee34074f	5	3424bc38-f674-4378-a88c-1c9ec5b9a77c	9f54615c-03ae-464b-adb4-50b9c1677d41	c81e244b-13f9-423c-aabb-b06cea5aeccb	2022-10-01 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
b4d0151c-745f-439c-8f6b-5872138bab64	5	655df04f-5508-45f3-8032-fd657a753360	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	8178046b-f654-4344-9434-e4b9ec71fd1b	2022-10-01 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
ac1e6f28-627f-445e-9269-5a5e6c92e8ee	6	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	c1649f16-5f82-4079-822e-58d09dfba4df	2022-10-08 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	3	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
1cd421fa-3b64-41d1-a060-6a1139d3a7e6	6	df825052-1f68-4f44-857f-c2de07315fd2	c11ee3ba-bcce-424a-994e-6477045af536	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2022-10-08 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
90958a08-66b6-4acb-ad5a-9e889be5baec	6	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	3424bc38-f674-4378-a88c-1c9ec5b9a77c	1a93e748-8884-4c17-be23-43980ffe7608	2022-10-08 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
5e38354f-ce2b-456e-a70a-20734a112666	6	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	655df04f-5508-45f3-8032-fd657a753360	91e98957-387a-4441-99ac-616cdc690608	2022-10-08 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
8319340b-1fb6-42d0-8500-7edf05db9872	6	9f54615c-03ae-464b-adb4-50b9c1677d41	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	e0922349-6ef9-4456-9acf-05ad869d581c	2022-10-08 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
d6c21fdd-30b5-4417-bad1-c3605c17e6fe	7	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	c11ee3ba-bcce-424a-994e-6477045af536	d34f8d8f-99ae-4260-bf5d-910f24be3336	2022-10-15 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	3	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
cf73790b-57a8-4ae1-8ec4-e52777835b3a	7	3424bc38-f674-4378-a88c-1c9ec5b9a77c	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	c81e244b-13f9-423c-aabb-b06cea5aeccb	2022-10-15 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
3d94095e-e231-4ab0-85ca-d26a7f2c376a	7	655df04f-5508-45f3-8032-fd657a753360	df825052-1f68-4f44-857f-c2de07315fd2	8178046b-f654-4344-9434-e4b9ec71fd1b	2022-10-15 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
b950d629-75ee-4cb7-aa84-795cfe6c7164	7	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	e0922349-6ef9-4456-9acf-05ad869d581c	2022-10-15 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
fa74315f-def7-419e-8b43-6376f0d0dcbc	7	9f54615c-03ae-464b-adb4-50b9c1677d41	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	e0922349-6ef9-4456-9acf-05ad869d581c	2022-10-15 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
94bd3adb-b5f5-4186-ae69-a1416a3131fa	8	3424bc38-f674-4378-a88c-1c9ec5b9a77c	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	c81e244b-13f9-423c-aabb-b06cea5aeccb	2022-10-22 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	3	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
16b5e9ef-36b8-49df-a939-67d387cc0539	8	c11ee3ba-bcce-424a-994e-6477045af536	655df04f-5508-45f3-8032-fd657a753360	e8098118-bcb9-4905-8b88-4452a6d843fc	2022-10-22 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
660fc02a-5ed4-4222-9dc6-92a4878b5b29	8	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	c1649f16-5f82-4079-822e-58d09dfba4df	2022-10-22 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
d2b8c464-3b4c-41ef-8a31-c22b755cf11c	8	df825052-1f68-4f44-857f-c2de07315fd2	9f54615c-03ae-464b-adb4-50b9c1677d41	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2022-10-22 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
3bb71647-92e8-41a0-9671-670de985fc56	8	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	1a93e748-8884-4c17-be23-43980ffe7608	2022-10-22 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
46a8512d-7c99-49d7-93de-8d9776a6f4b5	9	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	655df04f-5508-45f3-8032-fd657a753360	d34f8d8f-99ae-4260-bf5d-910f24be3336	2022-10-29 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	3	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
6e2820f5-d805-4f4c-b160-53d27db68b7a	9	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	3424bc38-f674-4378-a88c-1c9ec5b9a77c	e0922349-6ef9-4456-9acf-05ad869d581c	2022-10-29 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
54cbf350-8dec-428b-b185-41e1bd9660be	9	9f54615c-03ae-464b-adb4-50b9c1677d41	c11ee3ba-bcce-424a-994e-6477045af536	e0922349-6ef9-4456-9acf-05ad869d581c	2022-10-29 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
a50ced86-e068-4bbd-80e9-ebcaec87d7bb	9	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	91e98957-387a-4441-99ac-616cdc690608	2022-10-29 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
9fcf221c-9695-47f6-aa55-0240de458d6a	9	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	df825052-1f68-4f44-857f-c2de07315fd2	1a93e748-8884-4c17-be23-43980ffe7608	2022-10-29 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
b39ded0f-8c62-4bba-a05f-fc80902bbf49	10	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	e0922349-6ef9-4456-9acf-05ad869d581c	2022-11-05 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
15e14b3e-b1b9-4dde-93fb-665646affa16	10	655df04f-5508-45f3-8032-fd657a753360	9f54615c-03ae-464b-adb4-50b9c1677d41	8178046b-f654-4344-9434-e4b9ec71fd1b	2022-11-05 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
8ec27889-226f-4857-ae95-21d0b3c6c2dc	10	3424bc38-f674-4378-a88c-1c9ec5b9a77c	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	c81e244b-13f9-423c-aabb-b06cea5aeccb	2022-11-05 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
421a5565-5134-443c-924c-48c8cb564572	10	c11ee3ba-bcce-424a-994e-6477045af536	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	e8098118-bcb9-4905-8b88-4452a6d843fc	2022-11-05 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
c8e22c27-4b63-414d-b6ac-22797da249b5	10	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	df825052-1f68-4f44-857f-c2de07315fd2	c1649f16-5f82-4079-822e-58d09dfba4df	2022-11-05 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
9896a7a3-0934-43da-90d9-00c0ecd76d1c	11	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	9f54615c-03ae-464b-adb4-50b9c1677d41	d34f8d8f-99ae-4260-bf5d-910f24be3336	2022-11-12 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	3	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
047d73f9-4d79-45e7-878b-66e34a00d241	11	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	91e98957-387a-4441-99ac-616cdc690608	2022-11-12 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
a921ef00-5912-406e-8af4-33d9fd7a0092	11	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	655df04f-5508-45f3-8032-fd657a753360	1a93e748-8884-4c17-be23-43980ffe7608	2022-11-12 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
45c4358c-fb0e-4b6e-9ec2-973621ade4f9	11	df825052-1f68-4f44-857f-c2de07315fd2	3424bc38-f674-4378-a88c-1c9ec5b9a77c	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2022-11-12 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
973fabf9-f595-4063-9a43-7a55ba71d8bd	11	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	c11ee3ba-bcce-424a-994e-6477045af536	c1649f16-5f82-4079-822e-58d09dfba4df	2022-11-12 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
e059e0d6-c48e-4ee5-9193-d6bfc1dbb1c7	12	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	91e98957-387a-4441-99ac-616cdc690608	2022-11-19 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	3	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
2e1054fe-0f69-4dba-99d7-37a9b29bf8cb	12	9f54615c-03ae-464b-adb4-50b9c1677d41	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	e0922349-6ef9-4456-9acf-05ad869d581c	2022-11-19 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
21626ac4-cbef-4a39-aa4a-726b7adc9fad	12	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	df825052-1f68-4f44-857f-c2de07315fd2	e0922349-6ef9-4456-9acf-05ad869d581c	2022-11-19 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
ba03f05d-290d-4ab5-a194-07461dda2a67	12	655df04f-5508-45f3-8032-fd657a753360	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	8178046b-f654-4344-9434-e4b9ec71fd1b	2022-11-19 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
6ecf4b20-c85f-4873-bf53-5a920db96a79	12	3424bc38-f674-4378-a88c-1c9ec5b9a77c	c11ee3ba-bcce-424a-994e-6477045af536	c81e244b-13f9-423c-aabb-b06cea5aeccb	2022-11-19 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
35bd2bed-6e19-4678-99e5-e4d260eeb7a3	13	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	d34f8d8f-99ae-4260-bf5d-910f24be3336	2022-11-26 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	3	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
efce0fa4-4f64-48c7-b42d-386204791498	13	df825052-1f68-4f44-857f-c2de07315fd2	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2022-11-26 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
d972fea3-e165-4c9c-beaa-ab9c82f3d076	13	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	9f54615c-03ae-464b-adb4-50b9c1677d41	c1649f16-5f82-4079-822e-58d09dfba4df	2022-11-26 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
fd27afc1-9c46-41d9-98d8-6fc56bd7423f	13	c11ee3ba-bcce-424a-994e-6477045af536	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	e8098118-bcb9-4905-8b88-4452a6d843fc	2022-11-26 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
cc30be64-8f89-4da3-993f-aa4ac001b25d	13	3424bc38-f674-4378-a88c-1c9ec5b9a77c	655df04f-5508-45f3-8032-fd657a753360	c81e244b-13f9-423c-aabb-b06cea5aeccb	2022-11-26 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
644e9271-0c74-4792-a8ce-826d36f2d379	14	df825052-1f68-4f44-857f-c2de07315fd2	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2022-12-03 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	3	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
5f363e24-2285-4257-afe6-7547ffec601f	14	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	1a93e748-8884-4c17-be23-43980ffe7608	2022-12-03 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
d0dbe163-ea68-4199-9442-ff6577e7ee1c	14	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	c11ee3ba-bcce-424a-994e-6477045af536	91e98957-387a-4441-99ac-616cdc690608	2022-12-03 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
8065e030-213d-4832-ace6-bb748399e91d	14	9f54615c-03ae-464b-adb4-50b9c1677d41	3424bc38-f674-4378-a88c-1c9ec5b9a77c	e0922349-6ef9-4456-9acf-05ad869d581c	2022-12-03 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
212f79c3-39dc-4978-8d83-2c05b3e973b2	14	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	655df04f-5508-45f3-8032-fd657a753360	e0922349-6ef9-4456-9acf-05ad869d581c	2022-12-03 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
b268e542-9903-4257-a923-e85314374438	15	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	d34f8d8f-99ae-4260-bf5d-910f24be3336	2022-12-10 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	3	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
55ac37f4-66da-4654-b085-105cca372ab6	15	c11ee3ba-bcce-424a-994e-6477045af536	df825052-1f68-4f44-857f-c2de07315fd2	e8098118-bcb9-4905-8b88-4452a6d843fc	2022-12-10 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
ceb175fd-2d75-4e25-9c3b-f997c95c3d1f	15	3424bc38-f674-4378-a88c-1c9ec5b9a77c	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	c81e244b-13f9-423c-aabb-b06cea5aeccb	2022-12-10 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
0982ec50-1b07-495f-b38e-8b1a26274255	15	655df04f-5508-45f3-8032-fd657a753360	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	8178046b-f654-4344-9434-e4b9ec71fd1b	2022-12-10 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
9a8240fb-253b-4b6d-bab5-8bcd2d401b05	15	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	9f54615c-03ae-464b-adb4-50b9c1677d41	e0922349-6ef9-4456-9acf-05ad869d581c	2022-12-10 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
22865ca8-2a05-41c5-947f-0a40ebf73dc0	16	c11ee3ba-bcce-424a-994e-6477045af536	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	e8098118-bcb9-4905-8b88-4452a6d843fc	2022-12-17 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	3	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
7c041d52-cb20-49a5-b861-a83f621cd2b4	16	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	3424bc38-f674-4378-a88c-1c9ec5b9a77c	c1649f16-5f82-4079-822e-58d09dfba4df	2022-12-17 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
a528503a-1510-43ac-92b2-7b40b9d5801b	16	df825052-1f68-4f44-857f-c2de07315fd2	655df04f-5508-45f3-8032-fd657a753360	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2022-12-17 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
63d8d979-70e0-46c1-ab47-18dc9f34ceba	16	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	1a93e748-8884-4c17-be23-43980ffe7608	2022-12-17 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
c7ac6194-85d2-48b4-a1d4-d597b8099684	16	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	9f54615c-03ae-464b-adb4-50b9c1677d41	91e98957-387a-4441-99ac-616cdc690608	2022-12-17 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
ce973d90-272f-464d-8775-14e3763cf519	17	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	3424bc38-f674-4378-a88c-1c9ec5b9a77c	d34f8d8f-99ae-4260-bf5d-910f24be3336	2022-12-24 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	3	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
e5e16b5e-3e97-46e6-bf18-97e95985f79b	17	655df04f-5508-45f3-8032-fd657a753360	c11ee3ba-bcce-424a-994e-6477045af536	8178046b-f654-4344-9434-e4b9ec71fd1b	2022-12-24 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
4c3c39fd-89e0-42a5-8418-a4c607a047af	17	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	e0922349-6ef9-4456-9acf-05ad869d581c	2022-12-24 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
5f48615b-91de-4561-aa3a-e650ad51b8db	17	9f54615c-03ae-464b-adb4-50b9c1677d41	df825052-1f68-4f44-857f-c2de07315fd2	e0922349-6ef9-4456-9acf-05ad869d581c	2022-12-24 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
48dceb31-6a78-4d01-89e3-2f4abd07d59b	17	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	91e98957-387a-4441-99ac-616cdc690608	2022-12-24 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	0	1	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
4da17093-f604-49bf-9300-6c2241d12d5c	18	655df04f-5508-45f3-8032-fd657a753360	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	8178046b-f654-4344-9434-e4b9ec71fd1b	2022-12-31 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	3	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
9101b52f-4e50-4cf1-9a39-545f2d4aa578	18	3424bc38-f674-4378-a88c-1c9ec5b9a77c	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	c81e244b-13f9-423c-aabb-b06cea5aeccb	2022-12-31 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
f1695869-98db-4d5a-a415-269b1ae1b503	18	c11ee3ba-bcce-424a-994e-6477045af536	9f54615c-03ae-464b-adb4-50b9c1677d41	e8098118-bcb9-4905-8b88-4452a6d843fc	2022-12-31 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
bc390f4d-2e55-49f2-8ed1-98ca779856d3	18	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	c1649f16-5f82-4079-822e-58d09dfba4df	2022-12-31 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
a7b04eb6-fc38-47ee-b5b1-c77537d8a4de	18	df825052-1f68-4f44-857f-c2de07315fd2	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2022-12-31 11:00:00	FINISHED	2026-06-02 11:15:46.098	2026-06-02 11:15:46.098	1	0	2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ADMIN
19ec58b7-203d-4d31-80e4-39d97748d16c	1	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	d34f8d8f-99ae-4260-bf5d-910f24be3336	2023-09-02 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
6e85d044-fb6c-4f29-bbf4-9566b80d4bc2	1	9f54615c-03ae-464b-adb4-50b9c1677d41	655df04f-5508-45f3-8032-fd657a753360	e0922349-6ef9-4456-9acf-05ad869d581c	2023-09-02 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
aed339fc-f532-4184-bdd7-b8d2d41afe19	1	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	3424bc38-f674-4378-a88c-1c9ec5b9a77c	91e98957-387a-4441-99ac-616cdc690608	2023-09-02 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
4523dde8-5c16-41c9-9f6c-e73c42d96d7a	1	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	c11ee3ba-bcce-424a-994e-6477045af536	1a93e748-8884-4c17-be23-43980ffe7608	2023-09-02 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
be1978b8-53d5-4cbd-8d3e-393c29d9ed06	1	df825052-1f68-4f44-857f-c2de07315fd2	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2023-09-02 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
fab31ba1-c1bb-4766-8e21-8ea717ccbe71	2	9f54615c-03ae-464b-adb4-50b9c1677d41	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	e0922349-6ef9-4456-9acf-05ad869d581c	2023-09-09 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
306fd27d-a1b0-4194-ab55-f97ae73838dc	2	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	e0922349-6ef9-4456-9acf-05ad869d581c	2023-09-09 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
051e525c-e92a-4873-8075-7455d1ab3ab9	2	655df04f-5508-45f3-8032-fd657a753360	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	8178046b-f654-4344-9434-e4b9ec71fd1b	2023-09-09 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
77d33c65-4677-46c1-8a78-e21e718e5c08	2	3424bc38-f674-4378-a88c-1c9ec5b9a77c	df825052-1f68-4f44-857f-c2de07315fd2	c81e244b-13f9-423c-aabb-b06cea5aeccb	2023-09-09 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
68c2b0e3-364e-4a53-abec-cfd0a2237e94	2	c11ee3ba-bcce-424a-994e-6477045af536	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	e8098118-bcb9-4905-8b88-4452a6d843fc	2023-09-09 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
8cd29373-fd5f-4408-8c4b-3b55a7db6e29	3	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	d34f8d8f-99ae-4260-bf5d-910f24be3336	2023-09-16 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
ee1497e4-c9d7-4d82-b752-82a226bc5cfc	3	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	9f54615c-03ae-464b-adb4-50b9c1677d41	1a93e748-8884-4c17-be23-43980ffe7608	2023-09-16 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
0ddae69e-bbc6-4bf6-9c3a-f82c1fea9608	3	df825052-1f68-4f44-857f-c2de07315fd2	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2023-09-16 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
bc3c10e0-b71e-41d4-8c29-714e94a1f0c3	3	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	655df04f-5508-45f3-8032-fd657a753360	c1649f16-5f82-4079-822e-58d09dfba4df	2023-09-16 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
035f813c-b99a-4b0c-8d8b-8594338b3a81	3	c11ee3ba-bcce-424a-994e-6477045af536	3424bc38-f674-4378-a88c-1c9ec5b9a77c	e8098118-bcb9-4905-8b88-4452a6d843fc	2023-09-16 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
a96f9b5c-854f-46f5-9cf2-3c2d4d4bb4ee	4	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	1a93e748-8884-4c17-be23-43980ffe7608	2023-09-23 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
3075bac3-b3db-4004-9e44-ff32bd4e957c	4	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	df825052-1f68-4f44-857f-c2de07315fd2	91e98957-387a-4441-99ac-616cdc690608	2023-09-23 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
ddd0ebeb-255e-4a24-9e01-2ca9a66b339a	4	9f54615c-03ae-464b-adb4-50b9c1677d41	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	e0922349-6ef9-4456-9acf-05ad869d581c	2023-09-23 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
f2aa4c09-c366-4f89-b125-857de5b8050a	4	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	c11ee3ba-bcce-424a-994e-6477045af536	e0922349-6ef9-4456-9acf-05ad869d581c	2023-09-23 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
5abc8fd5-b006-4450-a868-4970a8c7f4e2	4	655df04f-5508-45f3-8032-fd657a753360	3424bc38-f674-4378-a88c-1c9ec5b9a77c	8178046b-f654-4344-9434-e4b9ec71fd1b	2023-09-23 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
e48d1ac3-4e39-48a5-92e1-fc875a372734	5	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	df825052-1f68-4f44-857f-c2de07315fd2	d34f8d8f-99ae-4260-bf5d-910f24be3336	2023-09-30 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
f5f665d8-9876-417b-99d9-263c9d8dcd1a	5	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	c1649f16-5f82-4079-822e-58d09dfba4df	2023-09-30 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
083a75f3-a12b-41b1-949b-148a67098f96	5	c11ee3ba-bcce-424a-994e-6477045af536	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	e8098118-bcb9-4905-8b88-4452a6d843fc	2023-09-30 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
a49df344-3cd8-4e40-8e32-515ad453e77e	5	3424bc38-f674-4378-a88c-1c9ec5b9a77c	9f54615c-03ae-464b-adb4-50b9c1677d41	c81e244b-13f9-423c-aabb-b06cea5aeccb	2023-09-30 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
a9b349b9-55e9-4be2-8c12-e1ab488777fb	5	655df04f-5508-45f3-8032-fd657a753360	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	8178046b-f654-4344-9434-e4b9ec71fd1b	2023-09-30 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
4c4a41e9-d3bd-45eb-981f-71251981b9ba	6	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	c1649f16-5f82-4079-822e-58d09dfba4df	2023-10-07 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
5caf03e4-984c-4221-8c4c-03c17b23b8c3	6	df825052-1f68-4f44-857f-c2de07315fd2	c11ee3ba-bcce-424a-994e-6477045af536	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2023-10-07 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
2385501f-d7e6-4c1a-9b62-74cad5fa0294	6	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	3424bc38-f674-4378-a88c-1c9ec5b9a77c	1a93e748-8884-4c17-be23-43980ffe7608	2023-10-07 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
9692d90d-7b95-4acf-8a6b-5a30e34d5f44	6	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	655df04f-5508-45f3-8032-fd657a753360	91e98957-387a-4441-99ac-616cdc690608	2023-10-07 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
d80069f7-d3bb-48f1-8afc-65d71fc032fe	6	9f54615c-03ae-464b-adb4-50b9c1677d41	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	e0922349-6ef9-4456-9acf-05ad869d581c	2023-10-07 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
90abe1c8-9229-4bdf-8d0c-292e60ba51d3	7	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	c11ee3ba-bcce-424a-994e-6477045af536	d34f8d8f-99ae-4260-bf5d-910f24be3336	2023-10-14 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
f8877d94-c763-4eb0-9e26-534ccde9acb9	7	3424bc38-f674-4378-a88c-1c9ec5b9a77c	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	c81e244b-13f9-423c-aabb-b06cea5aeccb	2023-10-14 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
0d70be1a-515e-4777-8e98-a22f22cedd7e	7	655df04f-5508-45f3-8032-fd657a753360	df825052-1f68-4f44-857f-c2de07315fd2	8178046b-f654-4344-9434-e4b9ec71fd1b	2023-10-14 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
8eb27abc-ea84-4fe5-a0ec-6b14b8ca724d	7	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	e0922349-6ef9-4456-9acf-05ad869d581c	2023-10-14 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
a8dfea8a-2ddc-4d37-9321-b9be529e2b47	7	9f54615c-03ae-464b-adb4-50b9c1677d41	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	e0922349-6ef9-4456-9acf-05ad869d581c	2023-10-14 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
3be25d29-0dcd-4495-a992-9849247fc1c2	8	3424bc38-f674-4378-a88c-1c9ec5b9a77c	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	c81e244b-13f9-423c-aabb-b06cea5aeccb	2023-10-21 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
c4155415-22d2-4b98-a2c2-3a735bd57dea	8	c11ee3ba-bcce-424a-994e-6477045af536	655df04f-5508-45f3-8032-fd657a753360	e8098118-bcb9-4905-8b88-4452a6d843fc	2023-10-21 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
4246ad06-57be-40ee-a043-207616c35e07	8	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	c1649f16-5f82-4079-822e-58d09dfba4df	2023-10-21 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
2cf65b6f-aee4-40cf-b350-f0318f87a109	8	df825052-1f68-4f44-857f-c2de07315fd2	9f54615c-03ae-464b-adb4-50b9c1677d41	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2023-10-21 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
61d92e9f-3925-4ab5-83f9-e820aab1ddf0	8	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	1a93e748-8884-4c17-be23-43980ffe7608	2023-10-21 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
6b2fbba7-24c0-4c5d-8068-44e6cb6b4f90	9	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	655df04f-5508-45f3-8032-fd657a753360	d34f8d8f-99ae-4260-bf5d-910f24be3336	2023-10-28 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
f6681060-aecb-4410-934f-58040068aac4	9	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	3424bc38-f674-4378-a88c-1c9ec5b9a77c	e0922349-6ef9-4456-9acf-05ad869d581c	2023-10-28 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
b6ff0e58-813e-4697-bab3-fe64c949fdfe	9	9f54615c-03ae-464b-adb4-50b9c1677d41	c11ee3ba-bcce-424a-994e-6477045af536	e0922349-6ef9-4456-9acf-05ad869d581c	2023-10-28 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
bf9807ee-11bf-4c52-ab7b-89b5124f9908	9	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	91e98957-387a-4441-99ac-616cdc690608	2023-10-28 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
7d372ec4-6dd5-4540-8e17-432aea4aab91	9	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	df825052-1f68-4f44-857f-c2de07315fd2	1a93e748-8884-4c17-be23-43980ffe7608	2023-10-28 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	1	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
d28f0d17-7c5d-49ab-b805-4acab28260bf	10	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	e0922349-6ef9-4456-9acf-05ad869d581c	2023-11-04 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
2cd094b4-55bf-497f-91f7-58feb4d64253	10	655df04f-5508-45f3-8032-fd657a753360	9f54615c-03ae-464b-adb4-50b9c1677d41	8178046b-f654-4344-9434-e4b9ec71fd1b	2023-11-04 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
1d2ff274-2f05-4a82-9e8a-b0fdf0da0168	10	3424bc38-f674-4378-a88c-1c9ec5b9a77c	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	c81e244b-13f9-423c-aabb-b06cea5aeccb	2023-11-04 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
4ed43ecc-37b3-4d40-9c06-5fa9c9bf68f2	10	c11ee3ba-bcce-424a-994e-6477045af536	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	e8098118-bcb9-4905-8b88-4452a6d843fc	2023-11-04 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
eeccb3c9-c99f-4f1b-8a9e-e1f6ac8ecdea	10	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	df825052-1f68-4f44-857f-c2de07315fd2	c1649f16-5f82-4079-822e-58d09dfba4df	2023-11-04 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
8e7775e1-2066-43ef-b657-1d1a7efa61d9	11	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	9f54615c-03ae-464b-adb4-50b9c1677d41	d34f8d8f-99ae-4260-bf5d-910f24be3336	2023-11-11 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
6e118390-db4f-441c-a018-c0719a1ec480	11	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	91e98957-387a-4441-99ac-616cdc690608	2023-11-11 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
07d1bb65-7392-46e0-b49f-5dd944883207	11	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	655df04f-5508-45f3-8032-fd657a753360	1a93e748-8884-4c17-be23-43980ffe7608	2023-11-11 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
e88882ac-a949-42bb-9882-68de5179514d	11	df825052-1f68-4f44-857f-c2de07315fd2	3424bc38-f674-4378-a88c-1c9ec5b9a77c	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2023-11-11 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
9964ecaf-fa31-41b4-83e9-bc20eb0e84e1	11	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	c11ee3ba-bcce-424a-994e-6477045af536	c1649f16-5f82-4079-822e-58d09dfba4df	2023-11-11 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
3b17cf4c-3b2c-438b-8523-4a602e4d44fc	12	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	91e98957-387a-4441-99ac-616cdc690608	2023-11-18 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
64fa521b-58af-4336-ac4a-274850f5ad76	12	9f54615c-03ae-464b-adb4-50b9c1677d41	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	e0922349-6ef9-4456-9acf-05ad869d581c	2023-11-18 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
3d91999a-7a7c-4a24-b20c-b679f07513db	12	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	df825052-1f68-4f44-857f-c2de07315fd2	e0922349-6ef9-4456-9acf-05ad869d581c	2023-11-18 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
99e5600a-f8aa-46e5-b073-9d6548589d73	12	655df04f-5508-45f3-8032-fd657a753360	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	8178046b-f654-4344-9434-e4b9ec71fd1b	2023-11-18 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
f96629a2-108c-4a97-bde8-b5f96d599337	12	3424bc38-f674-4378-a88c-1c9ec5b9a77c	c11ee3ba-bcce-424a-994e-6477045af536	c81e244b-13f9-423c-aabb-b06cea5aeccb	2023-11-18 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
fd8fcb2e-edf0-44b4-85ab-2dea436fb25d	13	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	d34f8d8f-99ae-4260-bf5d-910f24be3336	2023-11-25 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
759530dd-5fc7-4023-a9f1-f27cf77e9201	13	df825052-1f68-4f44-857f-c2de07315fd2	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2023-11-25 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
b6009bbe-7dc8-48b0-b912-2a984868eab7	13	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	9f54615c-03ae-464b-adb4-50b9c1677d41	c1649f16-5f82-4079-822e-58d09dfba4df	2023-11-25 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
cacb9f0f-090e-4815-995d-273c0224ff78	13	c11ee3ba-bcce-424a-994e-6477045af536	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	e8098118-bcb9-4905-8b88-4452a6d843fc	2023-11-25 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
5f7fdda8-0d39-4782-8668-0ace0f41132b	13	3424bc38-f674-4378-a88c-1c9ec5b9a77c	655df04f-5508-45f3-8032-fd657a753360	c81e244b-13f9-423c-aabb-b06cea5aeccb	2023-11-25 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
84affb02-9653-4bb3-b126-8990ec44cfe9	14	df825052-1f68-4f44-857f-c2de07315fd2	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2023-12-02 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
4c40b9f3-aac9-430e-aaa8-cfed80856b50	14	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	1a93e748-8884-4c17-be23-43980ffe7608	2023-12-02 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
8081362c-38ac-4394-a826-496fb5ae345f	14	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	c11ee3ba-bcce-424a-994e-6477045af536	91e98957-387a-4441-99ac-616cdc690608	2023-12-02 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
84860467-591c-4011-95ea-93962d3335cd	14	9f54615c-03ae-464b-adb4-50b9c1677d41	3424bc38-f674-4378-a88c-1c9ec5b9a77c	e0922349-6ef9-4456-9acf-05ad869d581c	2023-12-02 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
90ae20aa-92ff-4b61-914e-f8f1fe2949f2	14	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	655df04f-5508-45f3-8032-fd657a753360	e0922349-6ef9-4456-9acf-05ad869d581c	2023-12-02 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
540d1b15-bb75-49c8-9b17-ccc4d4b8003f	15	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	d34f8d8f-99ae-4260-bf5d-910f24be3336	2023-12-09 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
51fc1082-7c29-4850-abab-5fc6d571d937	15	c11ee3ba-bcce-424a-994e-6477045af536	df825052-1f68-4f44-857f-c2de07315fd2	e8098118-bcb9-4905-8b88-4452a6d843fc	2023-12-09 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
a0aa1ffc-6d95-40df-8e6d-5711100dffdc	15	3424bc38-f674-4378-a88c-1c9ec5b9a77c	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	c81e244b-13f9-423c-aabb-b06cea5aeccb	2023-12-09 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
8c7bb410-8ad0-4180-a651-46909c1fe348	15	655df04f-5508-45f3-8032-fd657a753360	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	8178046b-f654-4344-9434-e4b9ec71fd1b	2023-12-09 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
76ac42ed-6f07-4ece-8582-b26d753909e2	15	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	9f54615c-03ae-464b-adb4-50b9c1677d41	e0922349-6ef9-4456-9acf-05ad869d581c	2023-12-09 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
b7285c4c-3ff9-42e3-b7c6-2066ba2188e3	16	c11ee3ba-bcce-424a-994e-6477045af536	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	e8098118-bcb9-4905-8b88-4452a6d843fc	2023-12-16 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
6cf3c743-1ec1-4ac5-ac63-a660e5521c6e	16	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	3424bc38-f674-4378-a88c-1c9ec5b9a77c	c1649f16-5f82-4079-822e-58d09dfba4df	2023-12-16 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
21f880b4-8e78-433e-b549-defe28eaadb2	16	df825052-1f68-4f44-857f-c2de07315fd2	655df04f-5508-45f3-8032-fd657a753360	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2023-12-16 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
b7db404a-1335-4fd7-9d66-86805d2dc8c1	16	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	1a93e748-8884-4c17-be23-43980ffe7608	2023-12-16 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
06b1e21c-f141-4102-bbcc-8ab3e063ed37	16	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	9f54615c-03ae-464b-adb4-50b9c1677d41	91e98957-387a-4441-99ac-616cdc690608	2023-12-16 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
c134ec7a-94e1-4655-90ea-833946f3bc56	17	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	3424bc38-f674-4378-a88c-1c9ec5b9a77c	d34f8d8f-99ae-4260-bf5d-910f24be3336	2023-12-23 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
6821b212-dbc2-4c96-955b-1aecd7a02eab	17	655df04f-5508-45f3-8032-fd657a753360	c11ee3ba-bcce-424a-994e-6477045af536	8178046b-f654-4344-9434-e4b9ec71fd1b	2023-12-23 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
73f8cf71-5978-411d-8629-e1229d47cda2	17	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	e0922349-6ef9-4456-9acf-05ad869d581c	2023-12-23 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	2	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
def7f3d9-680a-4fed-bc99-beab578beb19	17	9f54615c-03ae-464b-adb4-50b9c1677d41	df825052-1f68-4f44-857f-c2de07315fd2	e0922349-6ef9-4456-9acf-05ad869d581c	2023-12-23 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
30e9b78d-4c5b-4199-9e5c-4b55addfa2e0	17	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	91e98957-387a-4441-99ac-616cdc690608	2023-12-23 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	0	1	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
2203bfe6-b2a9-4623-bbe0-09262a63ea66	18	655df04f-5508-45f3-8032-fd657a753360	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	8178046b-f654-4344-9434-e4b9ec71fd1b	2023-12-30 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
12e54916-4eb4-4cfc-a8d5-b55a8f7305b0	18	3424bc38-f674-4378-a88c-1c9ec5b9a77c	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	c81e244b-13f9-423c-aabb-b06cea5aeccb	2023-12-30 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	2	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
a5b3c2d3-dff2-4cf3-a9cc-94dbf66e0f18	18	c11ee3ba-bcce-424a-994e-6477045af536	9f54615c-03ae-464b-adb4-50b9c1677d41	e8098118-bcb9-4905-8b88-4452a6d843fc	2023-12-30 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
e53e84b4-0de6-4577-b074-5c85ac21f237	18	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	c1649f16-5f82-4079-822e-58d09dfba4df	2023-12-30 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
a4138b82-4ae7-45c9-a123-467da56496d2	18	df825052-1f68-4f44-857f-c2de07315fd2	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	2023-12-30 11:00:00	FINISHED	2026-06-02 11:15:46.509	2026-06-02 11:15:46.509	1	0	2	51316183-ef63-4701-a4c2-6230228ac886	ADMIN
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, title, message, type, entity_type, entity_id, read_at, created_at) FROM stdin;
fad55853-4b73-4bfd-af12-3a34c04b79f8	f514705f-4213-4507-8a48-16db52cddec9	Lời mời tham dự V.League 2024-2025	BTC mời MerryLand Quy Nhơn Bình Định tham dự V.League 2024-2025. Hạn phản hồi: 14 ngày sau ngày gửi. Lệ phí tham dự: 1.000.000.000 VND.	TEAM_INVITATION	team_invitation	c275e34f-a3c3-4820-9e21-d9d11ee59f04	\N	2026-06-02 11:15:28.13
5b428a78-39ad-4afe-ba6e-23ebcae21a76	fd494442-817b-4b95-b3eb-9575eb2dd167	Lời mời tham dự V.League 2024-2025	BTC mời Quảng Nam FC tham dự V.League 2024-2025. Hạn phản hồi: 14 ngày sau ngày gửi. Lệ phí tham dự: 1.000.000.000 VND.	TEAM_INVITATION	team_invitation	7309e6e3-65fc-47ea-9ce7-c6f01119a9d2	\N	2026-06-02 11:15:28.162
df707a2b-3b41-40dc-b22a-cb9b8ceea795	650c9c30-95ba-4528-807b-2c9213d16831	Lời mời tham dự V.League 2024-2025	BTC mời Hồng Lĩnh Hà Tĩnh tham dự V.League 2024-2025. Hạn phản hồi: 14 ngày sau ngày gửi. Lệ phí tham dự: 1.000.000.000 VND.	TEAM_INVITATION	team_invitation	7f76e4d2-544d-490a-8f57-8bdb1a8155d8	\N	2026-06-02 11:15:28.169
3bd598ee-7dc4-492d-9591-d3bf443a49c5	8485183b-0911-46fc-9a13-32672eb606e8	Lời mời tham dự V.League 2024-2025	BTC mời SHB Đà Nẵng tham dự V.League 2024-2025. Hạn phản hồi: 14 ngày sau ngày gửi. Lệ phí tham dự: 1.000.000.000 VND.	TEAM_INVITATION	team_invitation	4291bd94-8b32-4b9a-97ab-de55dab829f6	\N	2026-06-02 11:15:28.184
27751a68-a522-408a-9264-b5594471c5fc	041100d4-eb42-4b94-86f4-3a0260d867b0	Yêu cầu thay đổi cầu thủ	Manager Manager Long An FC vừa gửi một yêu cầu thêm/sửa/xóa cầu thủ.	SYSTEM	player_request	0aac65c2-6fe3-4f5f-a68d-05d14cc33a38	2026-06-02 11:28:03.928	2026-06-02 11:27:48.882
004d725b-a3b5-4d95-90b5-b44e978a8af9	2256d048-d0ac-4c7a-865a-15bbd74ad351	Yêu cầu thay đổi cầu thủ đã được duyệt	Admin đã chấp nhận yêu cầu thay đổi cầu thủ của bạn.	STATUS_CHANGE	player_request	0aac65c2-6fe3-4f5f-a68d-05d14cc33a38	\N	2026-06-02 11:28:13.75
48ce088e-ca96-4273-9dc1-ed994840715b	796fb41e-1ae7-4cd8-b29e-caecd680e183	Yêu cầu thay đổi cầu thủ đã được duyệt	Admin đã chấp nhận yêu cầu thay đổi cầu thủ của bạn.	STATUS_CHANGE	player_request	31225f10-c199-46e9-ab88-4cb7586e5481	\N	2026-06-02 11:29:26.025
48700c24-6a79-4707-aaa3-8594b674bc45	041100d4-eb42-4b94-86f4-3a0260d867b0	Yêu cầu thay đổi cầu thủ	Manager Manager Bắc Ninh FC vừa gửi một yêu cầu thêm/sửa/xóa cầu thủ.	SYSTEM	player_request	31225f10-c199-46e9-ab88-4cb7586e5481	2026-06-02 13:01:50.585	2026-06-02 11:29:12.513
\.


--
-- Data for Name: officials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.officials (id, full_name, email, phone, status, created_at, updated_at) FROM stdin;
7a99c1af-c31a-47ed-bcf2-b5233af5af89	Trần Minh Khang	referee.tran.minh.khang@demo.local	\N	ACTIVE	2026-06-02 11:15:34.203	2026-06-02 11:15:34.203
8ae96a9b-b97a-466c-8a7a-71f9fe6a49e3	Lê Hoàng Duy	referee.le.hoang.duy@demo.local	\N	ACTIVE	2026-06-02 11:15:34.235	2026-06-02 11:15:34.235
b90a9100-c087-4f64-a122-1bcdcb60bd67	Phạm Đức Thành	referee.pham.duc.thanh@demo.local	\N	ACTIVE	2026-06-02 11:15:34.26	2026-06-02 11:15:34.26
54c5ed7c-0f8f-467c-a7f7-03bd012c8d16	Michael Andersson	referee.michael.andersson@demo.local	\N	ACTIVE	2026-06-02 11:15:34.286	2026-06-02 11:15:34.286
4ab4996a-6fce-42df-aec6-13d8b8c004fa	Carlos Mendes	referee.carlos.mendes@demo.local	\N	ACTIVE	2026-06-02 11:15:34.315	2026-06-02 11:15:34.315
424351e1-c6a1-4f5e-a724-f395ff9d92ef	Đỗ Quốc Hưng	supervisor.do.quoc.hung@demo.local	\N	ACTIVE	2026-06-02 11:15:34.329	2026-06-02 11:15:34.329
771e566c-9623-45b0-81e6-a40251fceba8	Võ Thành Luân	supervisor.vo.thanh.luan@demo.local	\N	ACTIVE	2026-06-02 11:15:34.356	2026-06-02 11:15:34.356
4b750196-2c7d-491f-8b83-4a6769653077	Bùi Anh Tuấn	supervisor.bui.anh.tuan@demo.local	\N	ACTIVE	2026-06-02 11:15:34.396	2026-06-02 11:15:34.396
31b3dc24-ecff-4883-9831-232eb63fe01f	Huỳnh Gia Bảo	supervisor.huynh.gia.bao@demo.local	\N	ACTIVE	2026-06-02 11:15:34.407	2026-06-02 11:15:34.407
b5bf5c1d-72d6-4e7e-b90a-5d85cead3f26	Nguyễn Hữu Phước	supervisor.nguyen.huu.phuoc@demo.local	\N	ACTIVE	2026-06-02 11:15:34.458	2026-06-02 11:15:34.458
\.


--
-- Data for Name: player_suspensions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.player_suspensions (id, player_id, team_id, season_id, source_match_id, effective_match_id, reason, status, served_at, created_at, updated_at) FROM stdin;
edb1e4d7-f324-44e0-9d1a-b7f1c96aed1a	1ca283d1-063e-498f-8db9-11a0dfe58498	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	8d447186-52eb-472a-a97a-d721be7936d6	278ae361-ee59-442e-9f4c-d3571eb1e877	3f960273-e4ca-4132-9e74-94b5df17903a	RED_CARD	ACTIVE	\N	2026-06-02 11:15:33.975	2026-06-02 11:15:33.975
6c285115-7ae4-4343-a34e-37f37ff2d145	f1c2e107-e5df-4006-a2b4-323fd3ffdd74	655df04f-5508-45f3-8032-fd657a753360	8d447186-52eb-472a-a97a-d721be7936d6	d4d4b6c5-3822-4d2e-b84d-bcd9b443712d	3a2be07a-5c14-42f9-af3f-aa76eea68139	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
76e04a71-3106-4033-93bf-42d70d10710e	0f22ec25-66cd-4672-aa2a-57ee4a348e4f	3424bc38-f674-4378-a88c-1c9ec5b9a77c	8d447186-52eb-472a-a97a-d721be7936d6	53968a22-96c2-4389-a094-3b82360d618c	d85cc39e-e33b-4abb-bc25-e6a2f69689d8	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
d6cccd23-67c0-49e8-b31d-32d01063804d	fa224542-f66f-4ef3-bb81-8b4662caaf1d	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	8d447186-52eb-472a-a97a-d721be7936d6	88fb47fb-0275-4c5b-a71d-c7aa752934da	01398c65-3655-4e63-bdd5-7820f0a78504	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
8d65f2a7-4b9e-49da-be5d-f65a5729578d	d2980b91-de4c-4869-a239-87c629f1ed0b	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	8d447186-52eb-472a-a97a-d721be7936d6	88fb47fb-0275-4c5b-a71d-c7aa752934da	01398c65-3655-4e63-bdd5-7820f0a78504	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
9899bc58-f0f5-48f0-96d7-30b01de0afc7	41806643-287a-4b5c-8cbb-cff0f07cd8b3	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	8d447186-52eb-472a-a97a-d721be7936d6	5818142c-074f-4d84-a482-1e620ad53d18	859a7a53-3c30-49bf-86cc-529dbedc0d8a	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
d2fac608-72dd-4d93-af25-ee44c43053d7	0efaaaeb-93b5-443f-9bfb-387c68cb22cb	3424bc38-f674-4378-a88c-1c9ec5b9a77c	8d447186-52eb-472a-a97a-d721be7936d6	d85cc39e-e33b-4abb-bc25-e6a2f69689d8	8f789f51-0e23-4d07-ba74-1ff4442ae866	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
c020aaba-4423-451b-848a-f6441cf6e811	054d97fa-60e2-42e8-afbd-1f85fe38d500	c11ee3ba-bcce-424a-994e-6477045af536	8d447186-52eb-472a-a97a-d721be7936d6	01398c65-3655-4e63-bdd5-7820f0a78504	8f789f51-0e23-4d07-ba74-1ff4442ae866	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
b473ad53-3834-4706-96b2-85d0f2bca607	eb3c6d80-4872-4e11-82e9-73cca51a56a6	9f54615c-03ae-464b-adb4-50b9c1677d41	8d447186-52eb-472a-a97a-d721be7936d6	b1bf4ea7-da39-4bec-a47c-73595095b785	73b58df4-b989-4b1d-bcbd-25b92dac3bab	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
2d8b7abe-9591-4a97-9d51-478a918578db	0efaaaeb-93b5-443f-9bfb-387c68cb22cb	3424bc38-f674-4378-a88c-1c9ec5b9a77c	8d447186-52eb-472a-a97a-d721be7936d6	8f789f51-0e23-4d07-ba74-1ff4442ae866	ea39cb69-b7c7-484f-b818-7a2560bed5a4	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
d060084c-a809-4ccb-ab27-8c6548c3006e	4ff0de8a-29b6-41c9-8d7c-d5420a9a2f3e	9f54615c-03ae-464b-adb4-50b9c1677d41	8d447186-52eb-472a-a97a-d721be7936d6	73b58df4-b989-4b1d-bcbd-25b92dac3bab	637c8078-4ee3-48ce-9db4-ad52f10162d6	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
fbe2002f-6dc8-4235-870a-5ec713986784	260f1985-deaa-4613-b9f7-052e204278a9	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	8d447186-52eb-472a-a97a-d721be7936d6	2011a3f3-7df2-4f03-b106-d1eb6fee0fde	a23e96ef-1533-4c9d-b69d-8bacddc063f1	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
f7ba5058-7b50-417d-9775-5ac8fa213df7	55f41c5a-faea-4da5-8da6-903e41e6d2eb	c11ee3ba-bcce-424a-994e-6477045af536	8d447186-52eb-472a-a97a-d721be7936d6	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	999b3810-edbc-4c00-857b-503a42288ce2	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
26267e85-574a-44fd-b7ae-c5a4a8932f57	07d2f52b-f9f0-407a-921f-f878f17fb3af	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	8d447186-52eb-472a-a97a-d721be7936d6	4f6766fe-afa3-49db-a4f1-e787ab7f6bd3	6b0ad60e-7aeb-4e85-86af-4176e67dd633	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
89bba398-8cf2-481e-ae35-6efcf6f186f1	973f5ef4-63ca-45ea-93ea-0d541bd3cd0c	9f54615c-03ae-464b-adb4-50b9c1677d41	8d447186-52eb-472a-a97a-d721be7936d6	637c8078-4ee3-48ce-9db4-ad52f10162d6	0a809e4e-bf49-4832-b760-f144bb9583ae	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
732d34ea-b941-42b5-a2b3-dd5b7fc72fc4	6a007a21-a220-4773-b5aa-c2e4223b2c41	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	8d447186-52eb-472a-a97a-d721be7936d6	a23e96ef-1533-4c9d-b69d-8bacddc063f1	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
d3d6b78c-bbfc-488f-b001-27ad293f0da1	b2a0489f-e8a6-4c81-a459-179fa9e10c24	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	8d447186-52eb-472a-a97a-d721be7936d6	9086183b-6ea8-4da1-a7a3-68c43db51601	ceffb55c-2c1e-4387-b36f-b4150bd75819	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
fbd91d39-214b-44ea-8cb6-382b2a9c6152	60011408-bbc0-463a-bf9e-771f84907127	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	8d447186-52eb-472a-a97a-d721be7936d6	6b0ad60e-7aeb-4e85-86af-4176e67dd633	f73e99c6-1a2a-45da-9f77-32d25658b080	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
7fe49e3e-9655-48c9-978f-ef9f8f1f2091	0ff5133a-2294-49bf-8d84-4e809ff19d7a	655df04f-5508-45f3-8032-fd657a753360	8d447186-52eb-472a-a97a-d721be7936d6	6b0ad60e-7aeb-4e85-86af-4176e67dd633	5846bf30-13b4-489a-a919-9f8e6f8be675	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
2a06d764-8a84-408d-ab0d-54320b6ffff1	e938c0f1-e9bb-474d-9f0a-c7bd21909dea	c11ee3ba-bcce-424a-994e-6477045af536	8d447186-52eb-472a-a97a-d721be7936d6	aa7a870d-9b0c-4047-ad1f-5bf3fa36f0de	0136e3a7-a9cf-4001-9005-ecf924849e74	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
3c5785ff-bede-4879-8104-97c1c305188d	2f213449-ff48-4bc2-8563-62de5de3d7cb	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	8d447186-52eb-472a-a97a-d721be7936d6	804c82da-f26b-41ac-9578-acd4179f6e1d	16232c80-727c-4e82-a5bd-d9955d7558fb	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
1424b53b-bc00-4eab-8f1f-a1e1ea418b46	60d653ac-eb22-45e0-a9a0-f72bebe8727e	655df04f-5508-45f3-8032-fd657a753360	8d447186-52eb-472a-a97a-d721be7936d6	5846bf30-13b4-489a-a919-9f8e6f8be675	0136e3a7-a9cf-4001-9005-ecf924849e74	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
a38ea90c-b232-4445-83c5-33baa4618691	9192f495-0b42-4858-a0ba-6512175743c1	df825052-1f68-4f44-857f-c2de07315fd2	8d447186-52eb-472a-a97a-d721be7936d6	5846bf30-13b4-489a-a919-9f8e6f8be675	e6f18547-381c-40a3-8586-a27493c8cda8	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
2d189a59-1abb-4c09-b664-7fb853285fa9	b3f559ed-95c2-4c77-8731-dc68ff546a6b	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	8d447186-52eb-472a-a97a-d721be7936d6	ceffb55c-2c1e-4387-b36f-b4150bd75819	16232c80-727c-4e82-a5bd-d9955d7558fb	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
6cb337cd-e7f6-4c2f-9d9f-7c9cdbf4c104	c12c528c-5ec3-41e9-8250-970149c465fe	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	8d447186-52eb-472a-a97a-d721be7936d6	f73e99c6-1a2a-45da-9f77-32d25658b080	43b7fc1a-bfa2-43ca-9bd3-0ba3c44e6133	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
ee2b7474-bef0-4a49-8a23-833f6da0fc36	1151d340-4c5a-43d9-972b-9d4588f5b161	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	8d447186-52eb-472a-a97a-d721be7936d6	16232c80-727c-4e82-a5bd-d9955d7558fb	e7d5ffbf-27cc-4b47-842c-8c10dcaed302	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
23e84b13-bd91-47d2-9665-bc5657ca3d84	5c258961-6034-4bdf-ad36-29b8f222894b	3424bc38-f674-4378-a88c-1c9ec5b9a77c	8d447186-52eb-472a-a97a-d721be7936d6	bb9c252d-c120-4532-a7ee-169f49422119	9591271f-f07b-4c3f-90e5-e6a5cde14ef9	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
64df0fa9-c0a4-462f-9e54-78cb683a4dd1	2685078f-48ae-4a23-bc94-feb1184fbfe3	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	8d447186-52eb-472a-a97a-d721be7936d6	f4ccfdfe-121d-4d63-9bab-9f6fbcda13b9	3f960273-e4ca-4132-9e74-94b5df17903a	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
f23ab990-a8c7-431c-960a-8b731215c3f0	ccc8ef29-bb77-46b1-801d-7c45a725c567	655df04f-5508-45f3-8032-fd657a753360	8d447186-52eb-472a-a97a-d721be7936d6	7bfcdad7-bac4-4d70-bc49-497a9fbe3c1c	39b57771-0c2f-4329-a0dc-1bb6ea277347	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
29b46816-80ef-4e7a-be23-e445bce6d79f	c9c51b77-9c7c-43b6-9088-ac378d7fc29b	c11ee3ba-bcce-424a-994e-6477045af536	8d447186-52eb-472a-a97a-d721be7936d6	58fa8d6a-9824-45ad-a11d-7b8c90c4eb67	3206dc46-3d1f-4597-a4f8-217f31b2d576	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
368b37af-677c-4a85-b0a1-1d4aa42f8b4c	558e7a8f-ceab-4c21-9d5f-a3d90abb03c4	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	8d447186-52eb-472a-a97a-d721be7936d6	58fa8d6a-9824-45ad-a11d-7b8c90c4eb67	39b57771-0c2f-4329-a0dc-1bb6ea277347	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
ae42d78f-a0f0-482f-8ca5-018416599b81	ae87d895-59bb-467e-b4a1-b44570b8d9ff	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	8d447186-52eb-472a-a97a-d721be7936d6	278ae361-ee59-442e-9f4c-d3571eb1e877	5818142c-074f-4d84-a482-1e620ad53d18	RED_CARD	ACTIVE	\N	2026-06-02 11:15:49.685	2026-06-02 11:15:49.685
\.


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.players (id, full_name, dob, nationality, "position", created_at, updated_at, birth_place, height_cm, player_type, weight_kg, career_summary) FROM stdin;
e01002bf-fa3b-47ff-bdd5-0ea7cff2df15	Vũ Quốc Khoa	1999-09-30 17:00:00	Việt Nam	GK	2026-06-02 11:15:16.977	2026-06-02 11:15:16.977	\N	184	DOMESTIC	72	\N
a84be76e-2772-4707-8a4b-549a3b628338	Dương Minh Minh	2000-07-14 17:00:00	Việt Nam	GK	2026-06-02 11:15:16.999	2026-06-02 11:15:16.999	\N	181	DOMESTIC	61	\N
79f6b0f2-ab89-4e53-9b6f-989882764602	Dương Văn Sơn	1995-02-14 17:00:00	Việt Nam	GK	2026-06-02 11:15:17.02	2026-06-02 11:15:17.02	\N	172	DOMESTIC	64	\N
8f5acf7e-6f07-4060-9ef9-2c9f746ba0ca	Đặng Hữu Hiếu	2003-01-24 17:00:00	Việt Nam	DF	2026-06-02 11:15:17.099	2026-06-02 11:15:17.099	\N	179	DOMESTIC	65	\N
43b490ee-e98c-48a3-beba-196babf51752	Vũ Hữu Hiếu	1995-06-10 17:00:00	Việt Nam	DF	2026-06-02 11:15:17.12	2026-06-02 11:15:17.12	\N	178	DOMESTIC	69	\N
c045c3cc-aaa8-4e01-947e-825a4c5d7005	Phan Đức Nam	2000-11-25 17:00:00	Việt Nam	DF	2026-06-02 11:15:17.137	2026-06-02 11:15:17.137	\N	173	DOMESTIC	76	\N
9975f5c2-fa30-4e4d-b2c0-3a4d109dc769	Hồ Minh Thắng	1994-05-05 17:00:00	Việt Nam	DF	2026-06-02 11:15:17.155	2026-06-02 11:15:17.155	\N	182	DOMESTIC	66	\N
7ab87531-7fd9-4dab-87c9-464b9995a1eb	Vũ Hữu Lâm	1996-05-01 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.166	2026-06-02 11:15:17.166	\N	174	DOMESTIC	74	\N
35fe4bf2-f604-47cd-8c89-7a427c1d833b	Phan Tiến Thiện	2003-10-17 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.177	2026-06-02 11:15:17.177	\N	168	DOMESTIC	75	\N
6a466d46-5ae4-4ae8-b1b8-91063f307b8e	Trần Văn Minh	2000-12-15 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.187	2026-06-02 11:15:17.187	\N	178	DOMESTIC	72	\N
85313c8f-cbf4-49e7-a8af-f26b7e798deb	Đinh Xuân Trung	2001-10-21 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.198	2026-06-02 11:15:17.198	\N	173	DOMESTIC	71	\N
2b5f5b67-8801-4c75-bbf4-aed321042ff6	Nguyễn Tiến Nam	1997-01-13 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.208	2026-06-02 11:15:17.208	\N	181	DOMESTIC	68	\N
ac16b296-4e56-4599-9677-b0069346e77b	Nguyễn Công Cường	2001-01-27 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.219	2026-06-02 11:15:17.219	\N	169	DOMESTIC	75	\N
558e7a8f-ceab-4c21-9d5f-a3d90abb03c4	Phạm Quốc Tài	1995-01-13 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.224	2026-06-02 11:15:17.224	\N	184	DOMESTIC	68	\N
b6760f9c-1b2b-4131-9d2d-2d42b29e2659	Phan Anh Hoàng	2002-07-08 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.241	2026-06-02 11:15:17.241	\N	177	DOMESTIC	70	\N
99f83c09-d112-4bff-bb1a-5dfe0929e4e9	Đỗ Văn Phúc	2002-07-07 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.259	2026-06-02 11:15:17.259	\N	173	DOMESTIC	75	\N
c86ab57e-995d-492b-8e8b-ba7a97773662	Đinh Anh Tùng	1996-04-17 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.269	2026-06-02 11:15:17.269	\N	174	DOMESTIC	79	\N
37566fad-d160-4c5b-8306-b8d3ba0ec595	Huỳnh Văn Khánh	2003-03-17 17:00:00	Việt Nam	FW	2026-06-02 11:15:17.281	2026-06-02 11:15:17.281	\N	166	DOMESTIC	73	\N
80f9e6eb-3ec4-4fbd-9157-8758e25fb219	Võ Xuân Quang	1996-09-02 17:00:00	Việt Nam	FW	2026-06-02 11:15:17.29	2026-06-02 11:15:17.29	\N	172	DOMESTIC	63	\N
b9f853ea-149f-4226-a80e-815c55c3bbe6	Ngô Tấn An	2003-01-03 17:00:00	Việt Nam	FW	2026-06-02 11:15:17.301	2026-06-02 11:15:17.301	\N	176	DOMESTIC	68	\N
d3453aae-0fc9-4677-8474-db274b83351d	Phan Công Kiên	2000-02-17 17:00:00	Việt Nam	FW	2026-06-02 11:15:17.31	2026-06-02 11:15:17.31	\N	181	DOMESTIC	78	\N
d0a76915-8b65-455c-b94d-8bdfdc8f5873	Dương Anh Bình	1995-12-02 17:00:00	Việt Nam	FW	2026-06-02 11:15:17.32	2026-06-02 11:15:17.32	\N	183	DOMESTIC	74	\N
7dba25ec-6c10-41e0-ace7-f51354e3cbc2	Rimario Gordon	1998-03-10 17:00:00	Brazil	DF	2026-06-02 11:15:17.331	2026-06-02 11:15:17.331	\N	178	FOREIGN	75	\N
de904f4a-565f-46de-8a3f-076267072212	Hendrio Silva	2004-04-03 17:00:00	Nigeria	MF	2026-06-02 11:15:17.351	2026-06-02 11:15:17.351	\N	182	FOREIGN	75	\N
b2a0489f-e8a6-4c81-a459-179fa9e10c24	Bruno Cunha	1997-02-14 17:00:00	Brazil	FW	2026-06-02 11:15:17.371	2026-06-02 11:15:17.371	\N	179	FOREIGN	66	\N
ee067132-4d9c-4eae-b873-a1a7c5c8ead2	Đinh Quốc Trường	2002-06-16 17:00:00	Việt Nam	GK	2026-06-02 11:15:17.678	2026-06-02 11:15:17.678	\N	182	DOMESTIC	78	\N
1f3f1c01-a4db-4c84-857c-93865bd5b469	Nguyễn Hữu Tùng	1993-02-22 17:00:00	Việt Nam	GK	2026-06-02 11:15:17.682	2026-06-02 11:15:17.682	\N	167	DOMESTIC	68	\N
c47ca176-d05a-4b51-a1a3-9a8cd54b925b	Bùi Xuân Minh	2003-09-05 17:00:00	Việt Nam	GK	2026-06-02 11:15:17.688	2026-06-02 11:15:17.688	\N	176	DOMESTIC	77	\N
5fd6264b-e7cd-442f-95b0-332afe96014b	Đinh Hữu Hùng	1993-03-13 17:00:00	Việt Nam	DF	2026-06-02 11:15:17.706	2026-06-02 11:15:17.706	\N	174	DOMESTIC	79	\N
46e19e34-73e3-43e1-a6d0-e048380bb2be	Hồ Tiến Mạnh	2003-03-01 17:00:00	Việt Nam	DF	2026-06-02 11:15:17.708	2026-06-02 11:15:17.708	\N	173	DOMESTIC	76	\N
68506790-b967-494b-a9e4-dda93f5e7eec	Lê Xuân Thiện	1999-06-16 17:00:00	Việt Nam	DF	2026-06-02 11:15:17.716	2026-06-02 11:15:17.716	\N	167	DOMESTIC	60	\N
b5c2c374-3022-4ebe-a30c-80bf81d7d826	Vũ Tấn Bình	1993-02-25 17:00:00	Việt Nam	DF	2026-06-02 11:15:17.72	2026-06-02 11:15:17.72	\N	183	DOMESTIC	70	\N
e0b56077-ef75-42d8-ad91-1c0e44e17a1b	Nguyễn Tấn Bình	2003-04-04 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.725	2026-06-02 11:15:17.725	\N	176	DOMESTIC	73	\N
eb3c6d80-4872-4e11-82e9-73cca51a56a6	Đỗ Quốc Thành	1996-09-02 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.73	2026-06-02 11:15:17.73	\N	167	DOMESTIC	65	\N
07d82480-e721-46cd-a4b4-510e661b8d6d	Lê Hữu Hùng	1994-05-18 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.737	2026-06-02 11:15:17.737	\N	173	DOMESTIC	73	\N
5d2ed8a3-b293-4f4b-9c13-400e2e8f0b4e	Huỳnh Anh Thành	1997-08-17 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.741	2026-06-02 11:15:17.741	\N	177	DOMESTIC	66	\N
741b421a-ed7e-4167-b718-75f7a69dde85	Dương Tấn Hiếu	1997-06-01 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.747	2026-06-02 11:15:17.747	\N	173	DOMESTIC	67	\N
60676704-830a-4b5a-b8ad-4e26f7f2f73c	Đỗ Anh Phong	2004-04-13 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.752	2026-06-02 11:15:17.752	\N	176	DOMESTIC	65	\N
22e87d5b-709b-474e-8abe-3df12128c413	Ngô Quốc Vũ	1995-05-24 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.756	2026-06-02 11:15:17.756	\N	176	DOMESTIC	60	\N
3417e483-f0c7-499f-8d1b-bc919f0e2ee6	Phan Xuân Đức	1999-02-11 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.759	2026-06-02 11:15:17.759	\N	176	DOMESTIC	76	\N
ea25ab2e-4cdc-4073-a1ad-5d56428fbaba	Vũ Tiến Vũ	1994-09-25 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.764	2026-06-02 11:15:17.764	\N	172	DOMESTIC	77	\N
973f5ef4-63ca-45ea-93ea-0d541bd3cd0c	Trần Tấn Trí	1996-01-09 17:00:00	Việt Nam	MF	2026-06-02 11:15:17.77	2026-06-02 11:15:17.77	\N	170	DOMESTIC	64	\N
4ff0de8a-29b6-41c9-8d7c-d5420a9a2f3e	Phạm Tấn Nghĩa	1994-06-09 17:00:00	Việt Nam	FW	2026-06-02 11:15:17.775	2026-06-02 11:15:17.775	\N	173	DOMESTIC	60	\N
a33f99bd-db4a-432c-bf16-cc9919fb2593	Lý Văn Bình	1999-05-22 17:00:00	Việt Nam	FW	2026-06-02 11:15:17.781	2026-06-02 11:15:17.781	\N	184	DOMESTIC	78	\N
53a972f4-687e-481b-a63b-ccdf507c7c8c	Phan Xuân Thiện	1994-09-23 17:00:00	Việt Nam	FW	2026-06-02 11:15:17.787	2026-06-02 11:15:17.787	\N	180	DOMESTIC	75	\N
962d05f6-1bc4-4f21-98b8-6df6c3f23258	Đặng Tấn Thắng	1994-11-01 17:00:00	Việt Nam	FW	2026-06-02 11:15:17.79	2026-06-02 11:15:17.79	\N	175	DOMESTIC	74	\N
067eaca4-1837-4977-b4d9-dfd8441cedd7	Huỳnh Công Kiên	2001-03-19 17:00:00	Việt Nam	FW	2026-06-02 11:15:17.796	2026-06-02 11:15:17.796	\N	181	DOMESTIC	60	\N
1debf467-3f4b-4d39-92be-07f68d5a22d4	Lucas Souza	2004-07-19 17:00:00	Brazil	DF	2026-06-02 11:15:17.803	2026-06-02 11:15:17.803	\N	177	FOREIGN	66	\N
1b9d1863-5a7a-44bf-b94f-b629c8f1d802	Rafaelson	1999-08-27 17:00:00	Nigeria	MF	2026-06-02 11:15:17.807	2026-06-02 11:15:17.807	\N	173	FOREIGN	74	\N
865fa516-4671-4ec9-985d-a35deb7486cd	Geovane Magno	2000-07-06 17:00:00	Brazil	FW	2026-06-02 11:15:17.811	2026-06-02 11:15:17.811	\N	176	FOREIGN	69	\N
555d8e12-17b7-452a-817a-983759cbd245	Đỗ Tiến Hoàng	1999-02-18 17:00:00	Việt Nam	GK	2026-06-02 11:15:17.996	2026-06-02 11:15:17.996	\N	175	DOMESTIC	64	\N
ad6181d5-2c1a-4ef8-9c89-9b8018269fa9	Đặng Công Thiện	2003-01-03 17:00:00	Việt Nam	GK	2026-06-02 11:15:18.001	2026-06-02 11:15:18.001	\N	172	DOMESTIC	67	\N
acb8d8d9-813f-4c76-bae6-de89b739ec0c	Đặng Quốc Tuấn	2001-09-05 17:00:00	Việt Nam	GK	2026-06-02 11:15:18.009	2026-06-02 11:15:18.009	\N	167	DOMESTIC	79	\N
81c33883-d719-4311-9d72-bb8680c299ff	Huỳnh Xuân Trung	1993-05-13 17:00:00	Nigeria	DF	2026-06-02 11:15:17.694	2026-06-02 11:15:38.375	Nigeria	171	FOREIGN	76	\N
7d0687e7-98ae-466d-96b3-3c2c8a99ae25	Phan Quốc Vinh	2002-12-24 17:00:00	Nigeria	DF	2026-06-02 11:15:17.701	2026-06-02 11:15:38.398	Nigeria	167	FOREIGN	62	\N
880f4e45-ee17-46ed-b2ff-09652b1b8bee	Đỗ Hữu Lâm	2002-03-24 17:00:00	Brazil	DF	2026-06-02 11:15:18.014	2026-06-02 11:15:38.628	Brazil	184	FOREIGN	75	\N
377112a3-c42d-45b9-8c25-606053bd0344	Trần Văn Phong	1997-02-19 17:00:00	Nigeria	DF	2026-06-02 11:15:18.018	2026-06-02 11:15:38.634	Nigeria	165	FOREIGN	77	\N
6e13329e-8110-4820-a0b4-4cf2871f9105	Phạm Quốc Trung	1998-05-24 17:00:00	Brazil	DF	2026-06-02 11:15:17.05	2026-06-02 11:15:39.094	Brazil	183	FOREIGN	62	\N
ae2d0df3-32c4-4972-ab77-1fea86c05500	Hoàng Quốc Hưng	1993-07-11 17:00:00	Nigeria	DF	2026-06-02 11:15:17.066	2026-06-02 11:15:39.096	Nigeria	165	FOREIGN	61	\N
bc404298-9f05-41a1-afd4-1b07bf187605	Dương Anh Bảo	1993-01-01 17:00:00	Brazil	DF	2026-06-02 11:15:17.088	2026-06-02 11:15:39.098	Brazil	184	FOREIGN	79	\N
b579bd7b-bd19-417a-8928-53ba02ffae94	Hồ Tiến Phong	2000-12-09 17:00:00	Nigeria	DF	2026-06-02 11:15:17.093	2026-06-02 11:15:39.102	Nigeria	182	FOREIGN	75	\N
ecadc2e8-2017-43ee-9652-da8ac444828d	Phan Đức Phúc	1993-04-07 17:00:00	Việt Nam	DF	2026-06-02 11:15:18.032	2026-06-02 11:15:18.032	\N	179	DOMESTIC	71	\N
a1b73a7a-e57b-45c3-a9fe-dc2d235bd577	Bùi Anh Phúc	2002-03-20 17:00:00	Việt Nam	DF	2026-06-02 11:15:18.038	2026-06-02 11:15:18.038	\N	182	DOMESTIC	67	\N
af0d3f1f-6bc4-42c0-be7b-d2c4ae7b1daa	Bùi Hữu Minh	1996-02-05 17:00:00	Việt Nam	DF	2026-06-02 11:15:18.042	2026-06-02 11:15:18.042	\N	175	DOMESTIC	78	\N
ceffc772-ad99-4629-a891-cf2e290ff530	Hoàng Quốc Bình	1996-04-24 17:00:00	Việt Nam	DF	2026-06-02 11:15:18.046	2026-06-02 11:15:18.046	\N	179	DOMESTIC	63	\N
97a58d26-2347-4cdd-9eec-664adf1f9259	Hoàng Tiến Trung	1994-08-14 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.051	2026-06-02 11:15:18.051	\N	166	DOMESTIC	75	\N
1400c73a-755b-4fee-a970-5d79bf410597	Vũ Xuân Linh	2001-04-23 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.055	2026-06-02 11:15:18.055	\N	179	DOMESTIC	62	\N
9f0eedf2-f842-4723-906d-b885295b032b	Lê Xuân Sơn	1999-03-22 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.059	2026-06-02 11:15:18.059	\N	169	DOMESTIC	75	\N
3e0dce3f-45c9-4ae0-90a0-aeaa26e4ea03	Đặng Hữu Linh	2001-08-16 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.063	2026-06-02 11:15:18.063	\N	170	DOMESTIC	64	\N
6f3f7407-3a80-4a97-b845-397a7ba67a35	Lê Văn Hải	2003-08-31 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.068	2026-06-02 11:15:18.068	\N	176	DOMESTIC	62	\N
22aeb6bd-366e-4ae0-8d6f-e58210fccbd7	Lý Tấn Nam	1996-02-05 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.071	2026-06-02 11:15:18.071	\N	182	DOMESTIC	71	\N
adc3e3c3-3089-45f7-94b2-e50e2a0f45b7	Phan Công Trí	2004-02-25 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.076	2026-06-02 11:15:18.076	\N	176	DOMESTIC	71	\N
fa224542-f66f-4ef3-bb81-8b4662caaf1d	Huỳnh Đức Phong	1996-07-13 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.196	2026-06-02 11:15:18.196	\N	166	DOMESTIC	70	\N
1151d340-4c5a-43d9-972b-9d4588f5b161	Vũ Tiến Kiên	2002-05-10 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.37	2026-06-02 11:15:18.37	\N	178	DOMESTIC	71	\N
99cc25fd-51c4-4272-bb12-40c7d12b2529	Đỗ Văn Vũ	1994-07-02 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.376	2026-06-02 11:15:18.376	\N	170	DOMESTIC	68	\N
d2980b91-de4c-4869-a239-87c629f1ed0b	Bùi Công Hoàng	1997-07-27 17:00:00	Việt Nam	FW	2026-06-02 11:15:18.382	2026-06-02 11:15:18.382	\N	165	DOMESTIC	70	\N
04f90a4f-db7e-4bdb-8b2d-4635a6d074c7	Ngô Xuân Linh	1996-03-23 17:00:00	Việt Nam	FW	2026-06-02 11:15:18.388	2026-06-02 11:15:18.388	\N	169	DOMESTIC	72	\N
2f0d0915-69e1-470c-9bcd-f1878174d1ae	Hồ Hữu Thành	1999-12-08 17:00:00	Việt Nam	FW	2026-06-02 11:15:18.394	2026-06-02 11:15:18.394	\N	166	DOMESTIC	65	\N
ff43cf28-5b09-4b5b-b2d8-c4d6ed65ebb0	Hồ Anh Linh	2003-03-18 17:00:00	Việt Nam	FW	2026-06-02 11:15:18.401	2026-06-02 11:15:18.401	\N	184	DOMESTIC	68	\N
905df635-54dd-4be1-8335-59bb231e197c	Đặng Xuân Hưng	2001-03-02 17:00:00	Việt Nam	FW	2026-06-02 11:15:18.407	2026-06-02 11:15:18.407	\N	183	DOMESTIC	70	\N
a1e6e78f-0d43-4fbd-93cc-29becafda938	Diego Fagan	1996-02-21 17:00:00	Brazil	DF	2026-06-02 11:15:18.413	2026-06-02 11:15:18.413	\N	171	FOREIGN	73	\N
2f213449-ff48-4bc2-8563-62de5de3d7cb	Olaha Friday	2002-07-10 17:00:00	Nigeria	MF	2026-06-02 11:15:18.418	2026-06-02 11:15:18.418	\N	182	FOREIGN	79	\N
6c0f62fb-a50d-4334-bbb0-d24597d5f84a	Janclesio Santos	2004-02-07 17:00:00	Brazil	FW	2026-06-02 11:15:18.427	2026-06-02 11:15:18.427	\N	172	FOREIGN	81	\N
dfc9fdea-ed8e-47e5-b64a-69b47f38747e	Đinh Xuân Hùng	1993-10-05 17:00:00	Việt Nam	GK	2026-06-02 11:15:18.776	2026-06-02 11:15:18.776	\N	172	DOMESTIC	78	\N
9cfbe386-836b-46b0-b580-a8afa83348d3	Hồ Quốc Bảo	2003-09-25 17:00:00	Việt Nam	GK	2026-06-02 11:15:18.785	2026-06-02 11:15:18.785	\N	167	DOMESTIC	62	\N
83c4fb14-bf49-46ca-89f2-0a0055dc09ef	Vũ Minh Thành	2002-07-03 17:00:00	Việt Nam	GK	2026-06-02 11:15:18.801	2026-06-02 11:15:18.801	\N	181	DOMESTIC	77	\N
45a3236c-a1b5-47b5-8266-36e94c50a9b6	Bùi Văn Mạnh	1996-07-13 17:00:00	Việt Nam	DF	2026-06-02 11:15:18.85	2026-06-02 11:15:18.85	\N	182	DOMESTIC	72	\N
9cf6fefd-f636-48b2-ae2b-ab97e9b910bb	Phan Tấn Tài	2004-03-22 17:00:00	Việt Nam	DF	2026-06-02 11:15:18.856	2026-06-02 11:15:18.856	\N	170	DOMESTIC	62	\N
9192f495-0b42-4858-a0ba-6512175743c1	Võ Đức Đạt	1999-09-17 17:00:00	Việt Nam	DF	2026-06-02 11:15:18.861	2026-06-02 11:15:18.861	\N	165	DOMESTIC	73	\N
44f8fa9f-d948-44fa-8995-110f7077fe60	Lý Quốc Bảo	1995-08-16 17:00:00	Việt Nam	DF	2026-06-02 11:15:18.87	2026-06-02 11:15:18.87	\N	177	DOMESTIC	76	\N
8b907f31-a457-47c8-912f-537d1b685ee2	Hồ Tiến Tùng	2002-08-12 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.873	2026-06-02 11:15:18.873	\N	178	DOMESTIC	69	\N
34f8950e-7501-406c-bfc1-a87ea63346d9	Đặng Công Hoàng	1993-09-21 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.884	2026-06-02 11:15:18.884	\N	166	DOMESTIC	60	\N
5d565b26-05f6-426c-b980-8d3713745836	Võ Tiến Linh	2001-09-20 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.896	2026-06-02 11:15:18.896	\N	183	DOMESTIC	65	\N
b8d8baaf-eee1-4ac8-b175-3197369211fd	Hoàng Anh Hải	1998-09-20 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.906	2026-06-02 11:15:18.906	\N	178	DOMESTIC	75	\N
6ad3d924-b654-4369-8665-e47844567ca1	Đỗ Văn Nam	2002-11-06 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.917	2026-06-02 11:15:18.917	\N	169	DOMESTIC	62	\N
b3dd562c-ebc3-429e-af21-576e797dc54b	Võ Anh Khải	2002-02-25 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.928	2026-06-02 11:15:18.928	\N	184	DOMESTIC	70	\N
083c54e2-0c3b-464b-86e4-fdaa38327498	Đinh Công Lâm	2003-08-07 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.939	2026-06-02 11:15:18.939	\N	172	DOMESTIC	61	\N
a31c2086-405e-4586-adce-63c0f495c538	Võ Minh Quang	2001-08-08 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.942	2026-06-02 11:15:18.942	\N	165	DOMESTIC	76	\N
ead4b0d9-ad83-4530-a9f8-d1d22f3721be	Đinh Công Tuấn	1997-12-16 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.954	2026-06-02 11:15:18.954	\N	184	DOMESTIC	72	\N
7ad4e7a3-ee22-4363-abcc-41e5acf0624a	Đỗ Tấn Bảo	2004-02-08 17:00:00	Việt Nam	MF	2026-06-02 11:15:18.957	2026-06-02 11:15:18.957	\N	184	DOMESTIC	73	\N
18c21802-e0a9-4d9b-8977-3cc5e55f5eb5	Phan Tấn Hùng	2003-03-24 17:00:00	Việt Nam	FW	2026-06-02 11:15:18.968	2026-06-02 11:15:18.968	\N	172	DOMESTIC	71	\N
5f7e4cf9-fded-4049-a929-a867c6cb2161	Đinh Minh Bình	1993-05-21 17:00:00	Việt Nam	FW	2026-06-02 11:15:18.979	2026-06-02 11:15:18.979	\N	166	DOMESTIC	72	\N
cd17f34a-1a87-4a95-8505-20728b3f2c6d	Hoàng Tấn Trung	1993-02-24 17:00:00	Việt Nam	FW	2026-06-02 11:15:18.989	2026-06-02 11:15:18.989	\N	176	DOMESTIC	70	\N
2ff5c134-c2e4-477b-842f-b84cbb9ea0a7	Phan Công Tài	2001-11-02 17:00:00	Việt Nam	FW	2026-06-02 11:15:19	2026-06-02 11:15:19	\N	183	DOMESTIC	61	\N
bb5a986b-eb19-4751-a10f-2f42113c5e41	Đỗ Xuân Tuấn	1999-02-11 17:00:00	Việt Nam	FW	2026-06-02 11:15:19.01	2026-06-02 11:15:19.01	\N	178	DOMESTIC	64	\N
858b9386-c81f-41c6-982f-7aaf8be2a641	Pedro Paulo	1994-09-15 17:00:00	Brazil	DF	2026-06-02 11:15:19.021	2026-06-02 11:15:19.021	\N	171	FOREIGN	72	\N
79ea4510-46eb-4d69-8ef9-362eda885b18	Anderson Lima	1994-04-13 17:00:00	Nigeria	MF	2026-06-02 11:15:19.031	2026-06-02 11:15:19.031	\N	175	FOREIGN	79	\N
cbed92cc-3988-4480-ba0a-5b7519fa52d9	Josue Homma	2003-08-07 17:00:00	Brazil	FW	2026-06-02 11:15:19.042	2026-06-02 11:15:19.042	\N	179	FOREIGN	82	\N
248f3dfb-39e4-48c4-be5c-4411636a2e69	Huỳnh Tiến Linh	1996-12-10 17:00:00	Việt Nam	GK	2026-06-02 11:15:19.362	2026-06-02 11:15:19.362	\N	182	DOMESTIC	73	\N
8e04d47a-04ff-4c0c-981e-71c716104844	Võ Công Khoa	2001-04-20 17:00:00	Việt Nam	GK	2026-06-02 11:15:19.372	2026-06-02 11:15:19.372	\N	168	DOMESTIC	70	\N
59c80b78-0ea4-4658-ae66-ee440a1acb6b	Phạm Tấn Phong	1995-10-02 17:00:00	Việt Nam	GK	2026-06-02 11:15:19.376	2026-06-02 11:15:19.376	\N	178	DOMESTIC	76	\N
30e59fa3-e0df-473c-b976-4fe0aebe1c4d	Phạm Tấn Hoàng	1997-09-05 17:00:00	Việt Nam	DF	2026-06-02 11:15:19.43	2026-06-02 11:15:19.43	\N	165	DOMESTIC	71	\N
e9cc0414-19cb-4ce7-86a5-2b8356172b7e	Nguyễn Tấn Thắng	1996-08-08 17:00:00	Việt Nam	DF	2026-06-02 11:15:19.441	2026-06-02 11:15:19.441	\N	174	DOMESTIC	71	\N
abcdcb4b-ce4d-4c4a-9244-993b93f12a4b	Đặng Quốc Vũ	2002-10-13 17:00:00	Việt Nam	DF	2026-06-02 11:15:19.452	2026-06-02 11:15:19.452	\N	182	DOMESTIC	79	\N
a2e5a8ed-2fa2-45ac-85cd-5d90a336ee74	Huỳnh Anh Phúc	1998-12-04 17:00:00	Nigeria	DF	2026-06-02 11:15:19.398	2026-06-02 11:15:38.298	Nigeria	184	FOREIGN	62	\N
081b3c23-209e-430c-8b81-7333f0aa79a6	Hồ Minh Nhật	1993-03-15 17:00:00	Brazil	DF	2026-06-02 11:15:19.409	2026-06-02 11:15:38.307	Brazil	170	FOREIGN	66	\N
8ceadd63-55ba-40d2-8f3c-52df24c40c17	Dương Tấn Toàn	2001-03-05 17:00:00	Nigeria	DF	2026-06-02 11:15:19.42	2026-06-02 11:15:38.311	Nigeria	166	FOREIGN	77	\N
c4d9cd6b-f2d9-4681-9a81-d9cb5065b29e	Bùi Minh Minh	1996-10-17 17:00:00	Brazil	DF	2026-06-02 11:15:18.023	2026-06-02 11:15:38.659	Brazil	171	FOREIGN	66	\N
4c5db777-5925-4259-b331-5cf0ac5450d1	Huỳnh Đức Lâm	1993-02-14 17:00:00	Brazil	DF	2026-06-02 11:15:18.812	2026-06-02 11:15:38.958	Brazil	176	FOREIGN	74	\N
237f4abf-af95-4a91-b823-a0935c5f102c	Nguyễn Anh Toàn	2000-03-20 17:00:00	Nigeria	DF	2026-06-02 11:15:18.823	2026-06-02 11:15:38.971	Nigeria	166	FOREIGN	67	\N
48445a7d-7827-4574-82c3-87541339f9a9	Phạm Minh Thiện	1996-12-25 17:00:00	Brazil	DF	2026-06-02 11:15:18.834	2026-06-02 11:15:38.99	Brazil	178	FOREIGN	72	\N
8ee43ed4-693f-43be-bf47-42e00bb7db49	Võ Tấn Thành	1994-10-05 17:00:00	Nigeria	DF	2026-06-02 11:15:18.845	2026-06-02 11:15:39.009	Nigeria	172	FOREIGN	64	\N
6a48f670-e91a-48e3-a792-f35ce0a77c37	Nguyễn Đức Toàn	1994-02-26 17:00:00	Việt Nam	DF	2026-06-02 11:15:19.463	2026-06-02 11:15:19.463	\N	183	DOMESTIC	69	\N
cfc148bb-d849-4178-a703-931e79cacf61	Đặng Tấn Bảo	1996-08-07 17:00:00	Việt Nam	MF	2026-06-02 11:15:19.474	2026-06-02 11:15:19.474	\N	184	DOMESTIC	68	\N
1e88149c-a80c-4cfb-9cd9-4e9cde03b325	Phan Minh Bảo	1997-08-14 17:00:00	Việt Nam	MF	2026-06-02 11:15:19.486	2026-06-02 11:15:19.486	\N	169	DOMESTIC	65	\N
3389df71-c069-4fe8-ab83-8bc0cf0434f4	Lý Quốc An	2002-07-16 17:00:00	Việt Nam	MF	2026-06-02 11:15:19.506	2026-06-02 11:15:19.506	\N	168	DOMESTIC	77	\N
907ab923-9f39-4304-8a68-81030fdf2f01	Đỗ Quốc Bình	2003-02-02 17:00:00	Việt Nam	MF	2026-06-02 11:15:19.518	2026-06-02 11:15:19.518	\N	176	DOMESTIC	76	\N
ed0c2cc6-cb90-4ad6-ae77-36cc5a102e95	Hoàng Xuân Thành	1995-04-12 17:00:00	Việt Nam	MF	2026-06-02 11:15:19.528	2026-06-02 11:15:19.528	\N	177	DOMESTIC	76	\N
b3f559ed-95c2-4c77-8731-dc68ff546a6b	Bùi Đức Phong	1997-03-18 17:00:00	Việt Nam	MF	2026-06-02 11:15:19.539	2026-06-02 11:15:19.539	\N	177	DOMESTIC	76	\N
3c6f9ffc-7c59-4fed-860a-3f43bac6833d	Trần Hữu Tùng	1997-02-12 17:00:00	Việt Nam	MF	2026-06-02 11:15:19.551	2026-06-02 11:15:19.551	\N	167	DOMESTIC	72	\N
29d1923b-b2c6-4f7e-9a1b-27e6aeb043e9	Hoàng Công Khải	2001-01-09 17:00:00	Việt Nam	MF	2026-06-02 11:15:19.562	2026-06-02 11:15:19.562	\N	172	DOMESTIC	60	\N
76e4673c-256a-4fac-8a1f-aea34e7eee38	Đỗ Tiến Bình	2000-11-27 17:00:00	Việt Nam	MF	2026-06-02 11:15:19.574	2026-06-02 11:15:19.574	\N	165	DOMESTIC	62	\N
1f7c9e5f-4864-4efc-a778-e111fcd2166b	Phan Hữu Hoàng	1999-10-10 17:00:00	Việt Nam	MF	2026-06-02 11:15:19.586	2026-06-02 11:15:19.586	\N	181	DOMESTIC	76	\N
ae87d895-59bb-467e-b4a1-b44570b8d9ff	Ngô Công Hải	1999-03-01 17:00:00	Việt Nam	FW	2026-06-02 11:15:19.596	2026-06-02 11:15:19.596	\N	179	DOMESTIC	77	\N
9f42e218-3ae5-4cdf-a3ee-c0d039740532	Đặng Anh Thắng	2002-05-14 17:00:00	Việt Nam	FW	2026-06-02 11:15:19.607	2026-06-02 11:15:19.607	\N	169	DOMESTIC	65	\N
e0e7f768-901f-4907-9664-9aebea9b1be9	Bùi Hữu Bình	2002-08-21 17:00:00	Việt Nam	FW	2026-06-02 11:15:19.617	2026-06-02 11:15:19.617	\N	179	DOMESTIC	69	\N
f352b9fc-8849-48e0-9d69-e38f56336616	Đặng Tấn Hải	2001-02-16 17:00:00	Việt Nam	FW	2026-06-02 11:15:19.629	2026-06-02 11:15:19.629	\N	169	DOMESTIC	62	\N
a39e3b23-5524-4b6b-bd96-6ceec4a0fed0	Phạm Minh Thắng	1997-07-13 17:00:00	Việt Nam	FW	2026-06-02 11:15:19.639	2026-06-02 11:15:19.639	\N	183	DOMESTIC	63	\N
69396e2d-6c37-4ffa-b852-86f9a51e53ae	Felipe Martins	1996-02-14 17:00:00	Brazil	DF	2026-06-02 11:15:19.651	2026-06-02 11:15:19.651	\N	183	FOREIGN	74	\N
e918c7db-bbc4-4668-9f50-d61758c214f4	Caique Oliveira	2004-05-04 17:00:00	Nigeria	MF	2026-06-02 11:15:19.672	2026-06-02 11:15:19.672	\N	179	FOREIGN	65	\N
47dddbb3-0986-44bc-ba51-db33bb64ceab	Negueba	2004-08-09 17:00:00	Brazil	FW	2026-06-02 11:15:19.692	2026-06-02 11:15:19.692	\N	174	FOREIGN	76	\N
f3d7511b-0149-460a-9d29-e123f68762c3	Phạm Tiến Mạnh	2003-12-14 17:00:00	Việt Nam	GK	2026-06-02 11:15:20.099	2026-06-02 11:15:20.099	\N	174	DOMESTIC	79	\N
e009f693-1bad-4058-b095-f5598bc66d32	Huỳnh Quốc Phong	1995-08-25 17:00:00	Việt Nam	GK	2026-06-02 11:15:20.103	2026-06-02 11:15:20.103	\N	179	DOMESTIC	63	\N
c15776a3-09b3-4db5-a77c-396eb7ee328c	Ngô Đức Phúc	2003-02-20 17:00:00	Việt Nam	GK	2026-06-02 11:15:20.113	2026-06-02 11:15:20.113	\N	178	DOMESTIC	74	\N
485a6775-f9b8-4fc8-a106-b01b013f79e5	Đinh Quốc Vũ	1999-12-04 17:00:00	Việt Nam	DF	2026-06-02 11:15:20.124	2026-06-02 11:15:20.124	\N	169	DOMESTIC	78	\N
0dc48db9-e0e0-4cae-8b73-b00e1d10fa8a	Phan Công Khánh	2003-01-21 17:00:00	Việt Nam	DF	2026-06-02 11:15:20.136	2026-06-02 11:15:20.136	\N	181	DOMESTIC	69	\N
e7de7f7b-e1c5-4839-8aad-d3afa1f7a55a	Lê Tấn Tài	1995-06-09 17:00:00	Việt Nam	DF	2026-06-02 11:15:20.146	2026-06-02 11:15:20.146	\N	171	DOMESTIC	62	\N
d7e79452-437a-4cef-bdcd-d058084a3ee1	Vũ Tấn Khoa	1999-11-10 17:00:00	Việt Nam	DF	2026-06-02 11:15:20.157	2026-06-02 11:15:20.157	\N	181	DOMESTIC	74	\N
68082ca4-faba-4bf1-a7c5-4f3dec332aac	Lê Anh Linh	1996-04-24 17:00:00	Việt Nam	DF	2026-06-02 11:15:20.169	2026-06-02 11:15:20.169	\N	182	DOMESTIC	76	\N
a78cfbb4-a51a-4956-a2a2-c43af04ae698	Đinh Văn Hưng	2000-09-21 17:00:00	Việt Nam	DF	2026-06-02 11:15:20.18	2026-06-02 11:15:20.18	\N	167	DOMESTIC	68	\N
5c9314fc-9b76-4f82-93e9-9cf96315b61c	Lý Xuân Tuấn	2004-10-03 17:00:00	Việt Nam	DF	2026-06-02 11:15:20.191	2026-06-02 11:15:20.191	\N	177	DOMESTIC	66	\N
14cf2ee6-34c5-4231-8dfa-40c58471f102	Vũ Xuân Dũng	1999-02-20 17:00:00	Việt Nam	DF	2026-06-02 11:15:20.202	2026-06-02 11:15:20.202	\N	167	DOMESTIC	62	\N
04a89b6a-23b9-48eb-ad18-ffb44597415f	Đỗ Hữu Tùng	1993-10-03 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.205	2026-06-02 11:15:20.205	\N	170	DOMESTIC	75	\N
6bd95540-bd71-4771-92d1-10d0382ff2b0	Lê Tiến Sơn	2003-09-17 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.216	2026-06-02 11:15:20.216	\N	165	DOMESTIC	69	\N
8a267388-283f-49f8-b73a-96e49994f43e	Ngô Xuân Nhật	2004-08-04 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.227	2026-06-02 11:15:20.227	\N	170	DOMESTIC	62	\N
47b7b3a3-7216-4ee9-9a24-7124efa5e906	Đỗ Quốc Khải	1998-03-09 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.238	2026-06-02 11:15:20.238	\N	168	DOMESTIC	74	\N
5c606a29-d7bd-43ad-8a90-e85625b99ef6	Phạm Tấn An	1996-12-13 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.249	2026-06-02 11:15:20.249	\N	168	DOMESTIC	67	\N
d4fe5813-8f6d-4160-b9ce-45f8af950cac	Vũ Hữu Đức	2000-09-04 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.259	2026-06-02 11:15:20.259	\N	178	DOMESTIC	71	\N
c10f55fc-a21e-4d29-b215-8fd430eab4f8	Dương Minh An	2002-05-22 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.27	2026-06-02 11:15:20.27	\N	166	DOMESTIC	72	\N
c4a91735-df6a-489d-a219-f843f3fc1457	Hồ Minh Khánh	1996-09-08 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.281	2026-06-02 11:15:20.281	\N	166	DOMESTIC	63	\N
d55699f3-00da-4b14-8525-c5212a301877	Đinh Công Trường	1999-08-23 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.292	2026-06-02 11:15:20.292	\N	167	DOMESTIC	71	\N
042429c6-8a34-47d3-a518-c379960f5146	Dương Đức Nghĩa	2004-11-26 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.303	2026-06-02 11:15:20.303	\N	179	DOMESTIC	68	\N
92ae7803-28a5-4d92-befa-0d3ecd76ac56	Hồ Tiến Trung	1996-04-30 17:00:00	Việt Nam	FW	2026-06-02 11:15:20.313	2026-06-02 11:15:20.313	\N	177	DOMESTIC	68	\N
60aabe13-2f04-48ca-8ee6-7a7742750940	Hoàng Tấn Bảo	1998-08-10 17:00:00	Việt Nam	FW	2026-06-02 11:15:20.325	2026-06-02 11:15:20.325	\N	179	DOMESTIC	77	\N
03379d9a-3192-4042-916b-ae0a13e980a2	Nguyễn Hữu Trung	2000-11-09 17:00:00	Việt Nam	FW	2026-06-02 11:15:20.336	2026-06-02 11:15:20.336	\N	181	DOMESTIC	78	\N
27eb8fd2-634f-47a7-8063-89e864c3e595	Ngô Quốc Kiên	2000-07-09 17:00:00	Việt Nam	FW	2026-06-02 11:15:20.347	2026-06-02 11:15:20.347	\N	178	DOMESTIC	79	\N
f055d1cd-a93c-46ba-87a2-beb0d3bae494	Lý Đức Hùng	1995-07-05 17:00:00	Việt Nam	FW	2026-06-02 11:15:20.358	2026-06-02 11:15:20.358	\N	182	DOMESTIC	74	\N
adc2b998-763a-4335-91ff-6d513aa2f4d7	Dayo Olalekan	1993-07-24 17:00:00	Brazil	DF	2026-06-02 11:15:20.369	2026-06-02 11:15:20.369	\N	175	FOREIGN	74	\N
e0b1faa0-d545-4d81-aa68-c483773ae46c	Mpande Kalombo	1993-06-05 17:00:00	Nigeria	MF	2026-06-02 11:15:20.379	2026-06-02 11:15:20.379	\N	184	FOREIGN	69	\N
06bbe80f-d2f3-4920-a789-3646f006d425	Ewerton Silva	2003-02-20 17:00:00	Brazil	FW	2026-06-02 11:15:20.392	2026-06-02 11:15:20.392	\N	181	FOREIGN	72	\N
84f98b38-e35a-40fa-84a0-d9c22af07c13	Hoàng Tiến Kiên	2001-12-22 17:00:00	Việt Nam	GK	2026-06-02 11:15:20.72	2026-06-02 11:15:20.72	\N	181	DOMESTIC	66	\N
3d129cc0-c291-4187-a41e-0c70a9e27a9c	Đặng Xuân Linh	2000-06-14 17:00:00	Việt Nam	GK	2026-06-02 11:15:20.738	2026-06-02 11:15:20.738	\N	168	DOMESTIC	78	\N
78dadd5b-92db-4792-a687-35c8ff56a733	Đặng Tiến Tuấn	2000-01-11 17:00:00	Việt Nam	GK	2026-06-02 11:15:20.751	2026-06-02 11:15:20.751	\N	183	DOMESTIC	62	\N
247a244a-fa89-4bb2-95b9-4eb2d8cf5df9	Bùi Công Khánh	2002-11-18 17:00:00	Việt Nam	DF	2026-06-02 11:15:20.806	2026-06-02 11:15:20.806	\N	168	DOMESTIC	70	\N
9d67225c-b929-4002-adb8-e03df0a3c78e	Phan Quốc Lâm	2003-12-22 17:00:00	Việt Nam	DF	2026-06-02 11:15:20.816	2026-06-02 11:15:20.816	\N	177	DOMESTIC	78	\N
bcfa46ff-aa79-4a6d-b465-4e2369050a8b	Lý Hữu Mạnh	1995-07-06 17:00:00	Việt Nam	DF	2026-06-02 11:15:20.826	2026-06-02 11:15:20.826	\N	183	DOMESTIC	60	\N
7a0f1e8d-0fa3-4aa3-95a5-4db80d5bfcc6	Đặng Xuân Nghĩa	2002-10-21 17:00:00	Việt Nam	DF	2026-06-02 11:15:20.838	2026-06-02 11:15:20.838	\N	169	DOMESTIC	61	\N
e938c0f1-e9bb-474d-9f0a-c7bd21909dea	Trần Công Tài	1993-08-14 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.849	2026-06-02 11:15:20.849	\N	174	DOMESTIC	67	\N
bd4a51ae-53df-4ea4-8e34-14a37b427167	Lý Hữu Vinh	1993-06-15 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.86	2026-06-02 11:15:20.86	\N	177	DOMESTIC	79	\N
c14a3259-cb2f-4c16-84b5-1654204bfd66	Bùi Hữu Kiên	1997-04-25 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.871	2026-06-02 11:15:20.871	\N	180	DOMESTIC	63	\N
427e7430-7169-4fec-9c43-42928c19aecd	Lê Đức Nghĩa	1999-12-04 17:00:00	Nigeria	DF	2026-06-02 11:15:20.772	2026-06-02 11:15:38.824	Nigeria	166	FOREIGN	63	\N
11bf43c2-181c-4ce1-aac5-48456ad3f456	Hồ Hữu Nghĩa	2004-03-24 17:00:00	Brazil	DF	2026-06-02 11:15:20.784	2026-06-02 11:15:38.836	Brazil	174	FOREIGN	60	\N
d2f9007d-a97d-4769-8598-88723b2acdcf	Đỗ Hữu Đạt	1993-09-12 17:00:00	Nigeria	DF	2026-06-02 11:15:20.794	2026-06-02 11:15:38.847	Nigeria	175	FOREIGN	77	\N
886d4630-3234-43c9-8970-b82bf4da2978	Võ Minh Khoa	1993-10-21 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.882	2026-06-02 11:15:20.882	\N	184	DOMESTIC	61	\N
b13c3392-8332-435c-8025-5190f0664c09	Vũ Quốc Nghĩa	2003-07-22 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.893	2026-06-02 11:15:20.893	\N	181	DOMESTIC	65	\N
cad98842-45b6-4371-beac-fde6d374201a	Dương Văn Hoàng	2004-10-04 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.903	2026-06-02 11:15:20.903	\N	184	DOMESTIC	71	\N
3f35e406-0db1-4c43-a3e6-b9ad6622a9b3	Lý Công An	1995-09-30 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.914	2026-06-02 11:15:20.914	\N	175	DOMESTIC	73	\N
55f41c5a-faea-4da5-8da6-903e41e6d2eb	Đặng Tấn Nghĩa	1993-05-02 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.925	2026-06-02 11:15:20.925	\N	180	DOMESTIC	66	\N
441784fb-114c-4c17-8c8c-98938b562a55	Trần Văn Tuấn	2003-05-03 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.936	2026-06-02 11:15:20.936	\N	171	DOMESTIC	78	\N
b25fe588-90e3-4b0e-b361-c2b174c6840c	Võ Minh Khải	1998-01-02 17:00:00	Việt Nam	MF	2026-06-02 11:15:20.947	2026-06-02 11:15:20.947	\N	172	DOMESTIC	76	\N
22afd02f-8ed5-44ed-b351-428a57b2f878	Bùi Minh Nhật	1999-08-15 17:00:00	Việt Nam	FW	2026-06-02 11:15:20.958	2026-06-02 11:15:20.958	\N	175	DOMESTIC	67	\N
3a082d06-554b-4cb5-97d7-02257f892eb5	Dương Tấn Tùng	1999-05-09 17:00:00	Việt Nam	FW	2026-06-02 11:15:20.969	2026-06-02 11:15:20.969	\N	165	DOMESTIC	65	\N
90378a10-4f09-4fae-99ab-7351964b27bd	Lý Minh Thành	1999-04-07 17:00:00	Việt Nam	FW	2026-06-02 11:15:20.98	2026-06-02 11:15:20.98	\N	181	DOMESTIC	76	\N
4c660b28-9715-44cb-8d97-6545685890db	Trần Anh Tùng	1994-11-10 17:00:00	Việt Nam	FW	2026-06-02 11:15:20.991	2026-06-02 11:15:20.991	\N	178	DOMESTIC	77	\N
0d230b83-5893-4b2c-a906-32fa91cabcad	Hồ Tấn Lâm	1995-01-26 17:00:00	Việt Nam	FW	2026-06-02 11:15:21.001	2026-06-02 11:15:21.001	\N	178	DOMESTIC	70	\N
054d97fa-60e2-42e8-afbd-1f85fe38d500	Kevin Njoku	2002-08-07 17:00:00	Brazil	DF	2026-06-02 11:15:21.012	2026-06-02 11:15:21.012	\N	177	FOREIGN	80	\N
c9c51b77-9c7c-43b6-9088-ac378d7fc29b	Alan Grafite	1996-06-10 17:00:00	Nigeria	MF	2026-06-02 11:15:21.023	2026-06-02 11:15:21.023	\N	174	FOREIGN	73	\N
1ceac09e-367e-4c49-8504-4f2d1446bce8	Vitor Araújo	2003-08-20 17:00:00	Brazil	FW	2026-06-02 11:15:21.034	2026-06-02 11:15:21.034	\N	184	FOREIGN	68	\N
e4619ca4-9999-490f-97e5-cb1295bcf5ee	Hoàng Công Vũ	2002-09-20 17:00:00	Việt Nam	GK	2026-06-02 11:15:21.357	2026-06-02 11:15:21.357	\N	184	DOMESTIC	75	\N
6bdbf8f8-c852-4a86-afc4-033930f26ce4	Trần Tiến Tài	1997-01-24 17:00:00	Việt Nam	GK	2026-06-02 11:15:21.368	2026-06-02 11:15:21.368	\N	180	DOMESTIC	75	\N
64fc8592-2f2d-45aa-8b30-2e2d8674b253	Phan Văn Linh	1994-08-07 17:00:00	Việt Nam	GK	2026-06-02 11:15:21.379	2026-06-02 11:15:21.379	\N	170	DOMESTIC	70	\N
465dcaa9-61f7-4102-9aba-a1a0bb7b58db	Hồ Tiến Minh	2001-07-03 17:00:00	Việt Nam	DF	2026-06-02 11:15:21.389	2026-06-02 11:15:21.389	\N	183	DOMESTIC	61	\N
26f2ed96-bd60-4192-9724-3582648db489	Hồ Quốc Nghĩa	1998-04-30 17:00:00	Việt Nam	DF	2026-06-02 11:15:21.4	2026-06-02 11:15:21.4	\N	171	DOMESTIC	71	\N
ab042577-336a-4e6e-ad17-1fec730dc6e6	Đinh Quốc An	1994-02-20 17:00:00	Việt Nam	DF	2026-06-02 11:15:21.412	2026-06-02 11:15:21.412	\N	178	DOMESTIC	77	\N
ffba20c7-55b4-435f-8e30-0093c64dbe54	Phạm Đức Quang	2001-02-25 17:00:00	Việt Nam	DF	2026-06-02 11:15:21.423	2026-06-02 11:15:21.423	\N	177	DOMESTIC	77	\N
e235c198-41a1-411f-b8b2-419f1d017112	Vũ Anh Minh	2002-07-13 17:00:00	Việt Nam	DF	2026-06-02 11:15:21.433	2026-06-02 11:15:21.433	\N	169	DOMESTIC	67	\N
412f1f29-f975-46fc-85d8-3ad2a7d276c8	Lê Tấn Tùng	2000-03-16 17:00:00	Việt Nam	DF	2026-06-02 11:15:21.444	2026-06-02 11:15:21.444	\N	181	DOMESTIC	61	\N
eac642be-2525-4090-94e5-05ee89f511d7	Lê Công Khải	2000-03-16 17:00:00	Việt Nam	DF	2026-06-02 11:15:21.455	2026-06-02 11:15:21.455	\N	171	DOMESTIC	62	\N
1b79df93-9cf4-4a47-b84f-ab0fd6278eab	Lê Anh Khánh	2004-04-02 17:00:00	Việt Nam	DF	2026-06-02 11:15:21.467	2026-06-02 11:15:21.467	\N	172	DOMESTIC	63	\N
aaaf63da-8cc7-4050-895a-075d11d4a609	Bùi Tiến Hưng	1993-07-12 17:00:00	Việt Nam	MF	2026-06-02 11:15:21.487	2026-06-02 11:15:21.487	\N	169	DOMESTIC	64	\N
62d301f0-a38d-4920-9aee-f790ca8e6478	Lê Công Quang	1998-06-25 17:00:00	Việt Nam	MF	2026-06-02 11:15:21.512	2026-06-02 11:15:21.512	\N	176	DOMESTIC	66	\N
3d18e554-f905-43d5-a181-d1d86aa36761	Đặng Tiến Mạnh	2002-01-01 17:00:00	Việt Nam	MF	2026-06-02 11:15:21.53	2026-06-02 11:15:21.53	\N	183	DOMESTIC	63	\N
e2918551-9ba8-4815-9a81-cc757c0132a1	Trần Quốc Nhật	2002-08-18 17:00:00	Việt Nam	MF	2026-06-02 11:15:21.543	2026-06-02 11:15:21.543	\N	176	DOMESTIC	63	\N
16af1e87-be6f-4272-8b46-ad2b9d160a8d	Nguyễn Công Dũng	2004-10-22 17:00:00	Việt Nam	MF	2026-06-02 11:15:21.556	2026-06-02 11:15:21.556	\N	182	DOMESTIC	73	\N
b3a6ed76-ce99-4334-bf06-d52bead21b9f	Nguyễn Hữu Hùng	2002-01-06 17:00:00	Việt Nam	MF	2026-06-02 11:15:21.574	2026-06-02 11:15:21.574	\N	167	DOMESTIC	64	\N
2991043d-a4e0-4814-9087-94727e52f927	Vũ Xuân Lâm	1994-07-20 17:00:00	Việt Nam	MF	2026-06-02 11:15:21.586	2026-06-02 11:15:21.586	\N	168	DOMESTIC	62	\N
81335c7f-ed9b-490c-aad5-7292892bec0f	Lê Tiến Tuấn	2000-07-20 17:00:00	Việt Nam	MF	2026-06-02 11:15:21.596	2026-06-02 11:15:21.596	\N	168	DOMESTIC	77	\N
786d0945-57a2-4dc4-a955-7c4f3028cf68	Phạm Quốc Khánh	2004-12-14 17:00:00	Việt Nam	MF	2026-06-02 11:15:21.607	2026-06-02 11:15:21.607	\N	179	DOMESTIC	72	\N
a7a49fda-8fbd-42dd-b26d-93b99d4c20fe	Huỳnh Xuân Tài	1995-06-21 17:00:00	Việt Nam	MF	2026-06-02 11:15:21.619	2026-06-02 11:15:21.619	\N	184	DOMESTIC	74	\N
d9d68dbb-68da-4703-a029-f089e0130d7d	Hồ Xuân Toàn	1997-08-14 17:00:00	Việt Nam	FW	2026-06-02 11:15:21.628	2026-06-02 11:15:21.628	\N	184	DOMESTIC	66	\N
afdf29ea-bd88-4e29-9ce4-3f3d66282ae7	Phan Văn Thiện	1995-02-24 17:00:00	Việt Nam	FW	2026-06-02 11:15:21.639	2026-06-02 11:15:21.639	\N	173	DOMESTIC	73	\N
9b982e6d-a187-4126-a2e1-75e8e44d15ea	Bùi Minh Nghĩa	2002-03-15 17:00:00	Việt Nam	FW	2026-06-02 11:15:21.65	2026-06-02 11:15:21.65	\N	173	DOMESTIC	77	\N
9d24e63f-316f-4c22-a6c6-db2ce93a6f02	Dương Anh Linh	1995-07-12 17:00:00	Việt Nam	FW	2026-06-02 11:15:21.67	2026-06-02 11:15:21.67	\N	177	DOMESTIC	77	\N
cfa39bb6-ab57-4a3d-91e9-db9740449e5f	Võ Xuân Hải	1996-04-12 17:00:00	Việt Nam	FW	2026-06-02 11:15:21.681	2026-06-02 11:15:21.681	\N	172	DOMESTIC	64	\N
455cbffc-8269-4de9-8986-59b106deb4a4	Stefan Mueller	1996-05-13 17:00:00	Brazil	DF	2026-06-02 11:15:21.692	2026-06-02 11:15:21.692	\N	180	FOREIGN	72	\N
cf61afe5-d36e-40a8-a72a-3d0887d81710	Carlos Bernal	2004-05-09 17:00:00	Nigeria	MF	2026-06-02 11:15:21.703	2026-06-02 11:15:21.703	\N	180	FOREIGN	76	\N
879c0b69-828f-45e3-b71b-02564a45051e	Adriano Costa	1996-11-05 17:00:00	Brazil	FW	2026-06-02 11:15:21.715	2026-06-02 11:15:21.715	\N	171	FOREIGN	78	\N
733c793e-df84-43be-a5ce-14f70d58bd53	Võ Đức Hưng	2001-12-07 17:00:00	Việt Nam	GK	2026-06-02 11:15:22.103	2026-06-02 11:15:22.103	\N	183	DOMESTIC	79	\N
49d096b8-9326-42ff-a5de-5b331ead3452	Vũ Quốc Phúc	1999-06-04 17:00:00	Việt Nam	GK	2026-06-02 11:15:22.112	2026-06-02 11:15:22.112	\N	168	DOMESTIC	68	\N
90cd3f86-e077-450c-a3e1-2ffbc7b221e7	Phạm Đức Khánh	2001-05-12 17:00:00	Việt Nam	GK	2026-06-02 11:15:22.124	2026-06-02 11:15:22.124	\N	179	DOMESTIC	64	\N
a71116fd-82f9-40ce-a73d-ca7288763c21	Dương Minh Phong	2003-06-03 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.134	2026-06-02 11:15:22.134	\N	177	DOMESTIC	73	\N
9f91c368-aa53-4b92-81a6-40f4103cb573	Bùi Đức Tài	1994-01-24 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.146	2026-06-02 11:15:22.146	\N	171	DOMESTIC	66	\N
6e7ecc93-0506-46af-81c0-dfa9d9feb781	Dương Tấn Nghĩa	1999-05-10 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.156	2026-06-02 11:15:22.156	\N	184	DOMESTIC	68	\N
da75e6aa-dc5d-4f90-85a9-d1fba68845f8	Hoàng Minh Kiên	1994-07-20 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.168	2026-06-02 11:15:22.168	\N	179	DOMESTIC	78	\N
fa34f770-e86f-43ce-91c0-7f6e8bf006bf	Lê Anh Dũng	1997-10-03 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.178	2026-06-02 11:15:22.178	\N	177	DOMESTIC	77	\N
90abc425-1253-4732-9760-14db74acaa2b	Bùi Tấn Vinh	1998-02-17 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.189	2026-06-02 11:15:22.189	\N	180	DOMESTIC	63	\N
5038c0b6-3c98-4f0c-b303-f5d8b2047ee1	Đinh Minh Hải	1995-08-04 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.199	2026-06-02 11:15:22.199	\N	174	DOMESTIC	71	\N
f108dbb1-1749-4c4f-8a6c-6c8f2b5273ec	Võ Công Toàn	1998-05-10 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.21	2026-06-02 11:15:22.21	\N	179	DOMESTIC	60	\N
cfada4f7-a862-41be-a771-17ab522e097a	Lý Minh Trí	1999-04-10 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.22	2026-06-02 11:15:22.22	\N	177	DOMESTIC	76	\N
d02e4eca-2c01-4f4e-99c1-ec88efd7d8a0	Huỳnh Công Thiện	1996-12-01 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.231	2026-06-02 11:15:22.231	\N	175	DOMESTIC	60	\N
14b6b012-fa0b-424b-baab-8feead68817f	Nguyễn Tiến Thiện	1993-11-12 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.241	2026-06-02 11:15:22.241	\N	167	DOMESTIC	75	\N
0a3353f1-bddc-4c33-b549-7294b952d015	Đặng Tấn Hùng	2002-07-06 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.252	2026-06-02 11:15:22.252	\N	174	DOMESTIC	78	\N
b2d6ba6a-97fa-4c8c-89f3-14cd57d97aa6	Đinh Minh Đạt	2003-02-07 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.263	2026-06-02 11:15:22.263	\N	165	DOMESTIC	71	\N
2d213b29-28f2-4d05-8712-34ac643873e9	Hoàng Anh Trung	1994-11-19 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.274	2026-06-02 11:15:22.274	\N	183	DOMESTIC	79	\N
10883240-45af-43cc-9f07-5d666d593465	Lê Xuân Khánh	1996-06-01 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.284	2026-06-02 11:15:22.284	\N	172	DOMESTIC	75	\N
d11134c3-4f32-4a58-ae24-b64e54ccdec7	Bùi Xuân Khoa	1998-02-21 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.288	2026-06-02 11:15:22.288	\N	175	DOMESTIC	68	\N
f59b5942-3a94-451e-a016-754d823c9684	Phạm Công Minh	1993-06-13 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.29	2026-06-02 11:15:22.29	\N	180	DOMESTIC	75	\N
3908eadf-c626-4ffd-89d1-1c75c4db4ff9	Phan Minh Tuấn	2000-10-07 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.292	2026-06-02 11:15:22.292	\N	180	DOMESTIC	76	\N
2b779364-e3b0-4940-96f8-9dea42657bd5	Huỳnh Tấn Trường	1997-11-01 17:00:00	Việt Nam	FW	2026-06-02 11:15:22.303	2026-06-02 11:15:22.303	\N	168	DOMESTIC	63	\N
3c8c3b51-d05c-4242-b5a2-b3bb4c27dee2	Võ Tiến Cường	1996-01-01 17:00:00	Việt Nam	FW	2026-06-02 11:15:22.314	2026-06-02 11:15:22.314	\N	170	DOMESTIC	73	\N
ff9fb1e3-e546-43e1-a5f7-2ee775175348	Hoàng Anh Thiện	2000-12-03 17:00:00	Việt Nam	FW	2026-06-02 11:15:22.317	2026-06-02 11:15:22.317	\N	166	DOMESTIC	76	\N
c0fef05b-c1ea-4746-b97d-faff423efc5c	Vũ Công Nam	1995-09-25 17:00:00	Việt Nam	FW	2026-06-02 11:15:22.329	2026-06-02 11:15:22.329	\N	173	DOMESTIC	75	\N
713b331f-d4c6-47eb-ab9b-3b9992010774	Trần Công Thành	2000-05-23 17:00:00	Việt Nam	FW	2026-06-02 11:15:22.342	2026-06-02 11:15:22.342	\N	177	DOMESTIC	64	\N
b9867eb5-f1a4-46ae-8d97-76ea02325929	Moses Oloya	2000-12-22 17:00:00	Brazil	DF	2026-06-02 11:15:22.344	2026-06-02 11:15:22.344	\N	183	FOREIGN	71	\N
17f594fd-6c98-49d8-9b4c-747a1dc97783	Abass Mohammed	1993-04-24 17:00:00	Nigeria	MF	2026-06-02 11:15:22.356	2026-06-02 11:15:22.356	\N	177	FOREIGN	81	\N
41caebc5-389c-4dab-8ffc-390c29ab4502	Oseni Ibrahim	1998-01-16 17:00:00	Brazil	FW	2026-06-02 11:15:22.36	2026-06-02 11:15:22.36	\N	176	FOREIGN	73	\N
ebeddb0a-95c1-4acb-bf5f-37c82a813d59	Đỗ Hữu Cường	1993-01-11 17:00:00	Việt Nam	GK	2026-06-02 11:15:22.765	2026-06-02 11:15:22.765	\N	171	DOMESTIC	66	\N
e9d00416-9609-4bb0-8383-490f0fe736c3	Phạm Xuân Trí	2002-09-15 17:00:00	Việt Nam	GK	2026-06-02 11:15:22.783	2026-06-02 11:15:22.783	\N	165	DOMESTIC	69	\N
8fb5e76c-85ac-42e3-8ac6-e7af128616a8	Phan Hữu Quang	2004-08-13 17:00:00	Việt Nam	GK	2026-06-02 11:15:22.795	2026-06-02 11:15:22.795	\N	173	DOMESTIC	61	\N
0fc4f521-f1e9-4c66-9c0b-c535340c1f73	Phan Tấn Hiếu	2003-12-22 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.806	2026-06-02 11:15:22.806	\N	165	DOMESTIC	75	\N
7184343d-0f86-482d-a5b9-d82f01638424	Vũ Đức Khải	2001-01-11 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.816	2026-06-02 11:15:22.816	\N	166	DOMESTIC	65	\N
ef580708-0a02-4c2b-9070-b8ccd902c0c1	Lý Tiến An	2001-03-23 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.827	2026-06-02 11:15:22.827	\N	174	DOMESTIC	63	\N
19c81171-93a8-4fc3-8902-ec420a4a5940	Huỳnh Đức Hoàng	1995-07-26 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.838	2026-06-02 11:15:22.838	\N	167	DOMESTIC	73	\N
06dca56c-172d-42b3-bef6-8cc85050136c	Võ Tiến Hải	1993-01-31 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.847	2026-06-02 11:15:22.847	\N	179	DOMESTIC	76	\N
b18604f6-bcb0-44ca-b93a-16606f2e6e06	Dương Xuân Vinh	2003-06-03 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.858	2026-06-02 11:15:22.858	\N	178	DOMESTIC	78	\N
2191bab4-781a-456a-9dd5-642e25ed2dfc	Hồ Tấn Nghĩa	1998-09-22 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.87	2026-06-02 11:15:22.87	\N	184	DOMESTIC	69	\N
0e05907b-1e0e-4606-8de6-7481fcd7fcc8	Bùi Xuân Quang	1994-04-03 17:00:00	Việt Nam	DF	2026-06-02 11:15:22.872	2026-06-02 11:15:22.872	\N	172	DOMESTIC	70	\N
13cf1a65-765c-4797-8ddf-730cd859e98a	Huỳnh Minh Đạt	1997-03-19 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.883	2026-06-02 11:15:22.883	\N	170	DOMESTIC	69	\N
3a1b4857-9b59-4d9d-9643-13615a27eb34	Trần Quốc Nghĩa	2004-07-18 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.893	2026-06-02 11:15:22.893	\N	176	DOMESTIC	75	\N
066a93fd-6fa1-4192-bfe4-6e84927167e4	Nguyễn Đức Vũ	2003-02-22 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.905	2026-06-02 11:15:22.905	\N	168	DOMESTIC	66	\N
1b2ed9ca-9556-4ea9-a7e5-0ce172ee52e5	Bùi Tấn Hải	2000-11-12 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.916	2026-06-02 11:15:22.916	\N	183	DOMESTIC	64	\N
ecaa60a7-e486-4342-80b6-177e857b55f6	Bùi Tấn Hoàng	1995-07-20 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.927	2026-06-02 11:15:22.927	\N	182	DOMESTIC	63	\N
9531fd48-8862-4753-bbbb-b138cefa7483	Hoàng Hữu Tùng	2002-01-18 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.937	2026-06-02 11:15:22.937	\N	171	DOMESTIC	73	\N
b15089cf-cce8-44a5-8876-cb9f076b0340	Dương Tiến Trí	1993-04-04 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.947	2026-06-02 11:15:22.947	\N	168	DOMESTIC	66	\N
e43654ae-9143-47eb-ade5-54bc5e183faa	Ngô Tiến Toàn	2004-03-13 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.958	2026-06-02 11:15:22.958	\N	171	DOMESTIC	69	\N
5071aa13-700d-4492-8ed5-9397ee7cd136	Huỳnh Tấn Minh	1994-01-01 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.969	2026-06-02 11:15:22.969	\N	182	DOMESTIC	76	\N
ca9ccb6d-96e3-44e7-8d1c-9e03cc4a3f1d	Võ Hữu Hoàng	2003-08-03 17:00:00	Việt Nam	MF	2026-06-02 11:15:22.98	2026-06-02 11:15:22.98	\N	180	DOMESTIC	71	\N
80d980f6-e83f-490e-a062-aecd63557582	Hồ Xuân Thiện	2001-01-27 17:00:00	Việt Nam	FW	2026-06-02 11:15:22.991	2026-06-02 11:15:22.991	\N	170	DOMESTIC	68	\N
a4f5f9b8-1425-4ee0-868d-b3dfb5961e1b	Huỳnh Tấn Tùng	1995-07-19 17:00:00	Việt Nam	FW	2026-06-02 11:15:23.002	2026-06-02 11:15:23.002	\N	167	DOMESTIC	66	\N
be829c7e-7041-4515-b3e1-8af22fce0b6c	Đỗ Hữu Kiên	1995-09-18 17:00:00	Việt Nam	FW	2026-06-02 11:15:23.012	2026-06-02 11:15:23.012	\N	173	DOMESTIC	77	\N
cbe62dfe-8b87-42e4-a19d-f70ad64dcea0	Lê Tiến Hưng	1998-06-04 17:00:00	Việt Nam	FW	2026-06-02 11:15:23.024	2026-06-02 11:15:23.024	\N	183	DOMESTIC	66	\N
0643141d-d465-4788-873e-7064df997caf	Võ Anh Long	1998-09-09 17:00:00	Việt Nam	FW	2026-06-02 11:15:23.035	2026-06-02 11:15:23.035	\N	168	DOMESTIC	68	\N
dd7a6034-a059-42e8-98c2-82f048b0d3cf	John Mary	2003-08-10 17:00:00	Brazil	DF	2026-06-02 11:15:23.045	2026-06-02 11:15:23.045	\N	181	FOREIGN	82	\N
2af2ce13-9066-468c-9946-e4846c686c00	Emmanuel Nduka	2000-06-12 17:00:00	Nigeria	MF	2026-06-02 11:15:23.056	2026-06-02 11:15:23.056	\N	176	FOREIGN	67	\N
b2a32c86-3807-4d1d-a368-f036a4beb969	Brandon Aguilera	1995-06-27 17:00:00	Brazil	FW	2026-06-02 11:15:23.068	2026-06-02 11:15:23.068	\N	170	FOREIGN	82	\N
5748dfe1-b83f-4411-a471-279d102cf21f	Bùi Minh Dũng	1999-04-02 17:00:00	Việt Nam	GK	2026-06-02 11:15:23.505	2026-06-02 11:15:23.505	\N	168	DOMESTIC	72	\N
48b5b5c2-e4d0-490d-8d4d-c0670260696a	Võ Xuân Nghĩa	1995-06-19 17:00:00	Việt Nam	GK	2026-06-02 11:15:23.521	2026-06-02 11:15:23.521	\N	182	DOMESTIC	68	\N
5510f37e-84f6-46b8-ac69-d660da055626	Đặng Tấn Mạnh	2003-08-25 17:00:00	Việt Nam	GK	2026-06-02 11:15:23.532	2026-06-02 11:15:23.532	\N	181	DOMESTIC	66	\N
62827757-6c88-4e49-93b8-110158b08b9a	Vũ Đức Thắng	2002-05-16 17:00:00	Việt Nam	DF	2026-06-02 11:15:23.588	2026-06-02 11:15:23.588	\N	176	DOMESTIC	68	\N
6d3aac5f-9b85-42e6-acdc-40794a182aa8	Hoàng Hữu Toàn	1999-05-10 17:00:00	Việt Nam	DF	2026-06-02 11:15:23.601	2026-06-02 11:15:23.601	\N	179	DOMESTIC	70	\N
b2760b91-57b7-4d26-909e-c602b8e15c5a	Đặng Quốc Hải	1999-12-25 17:00:00	Việt Nam	DF	2026-06-02 11:15:23.613	2026-06-02 11:15:23.613	\N	169	DOMESTIC	71	\N
d3e29d3f-8a3d-4364-a715-c313ddcf85dc	Hồ Tiến Thắng	2004-03-12 17:00:00	Việt Nam	DF	2026-06-02 11:15:23.626	2026-06-02 11:15:23.626	\N	174	DOMESTIC	64	\N
60d653ac-eb22-45e0-a9a0-f72bebe8727e	Lê Anh Phong	1998-04-05 17:00:00	Việt Nam	MF	2026-06-02 11:15:23.639	2026-06-02 11:15:23.639	\N	180	DOMESTIC	68	\N
f3132686-c696-4c7e-a1fc-e8e11a298cef	Võ Minh Thắng	1996-02-13 17:00:00	Việt Nam	MF	2026-06-02 11:15:23.65	2026-06-02 11:15:23.65	\N	179	DOMESTIC	71	\N
9760daa4-706c-4b70-988a-d9d965559743	Trần Quốc Toàn	2004-09-04 17:00:00	Việt Nam	MF	2026-06-02 11:15:23.662	2026-06-02 11:15:23.662	\N	166	DOMESTIC	70	\N
d034c5ad-e4b1-4f5a-9113-a18af03082b0	Hồ Tấn An	1998-12-10 17:00:00	Việt Nam	MF	2026-06-02 11:15:23.674	2026-06-02 11:15:23.674	\N	182	DOMESTIC	79	\N
2240ab78-2f83-4fd4-afb7-a2b87d81f50a	Đỗ Quốc Trung	1995-04-20 17:00:00	Việt Nam	MF	2026-06-02 11:15:23.683	2026-06-02 11:15:23.683	\N	176	DOMESTIC	68	\N
46ecf59b-7858-423c-aee4-3ae874e36da0	Huỳnh Tấn Nam	1997-09-18 17:00:00	Việt Nam	MF	2026-06-02 11:15:23.694	2026-06-02 11:15:23.694	\N	181	DOMESTIC	60	\N
0ff5133a-2294-49bf-8d84-4e809ff19d7a	Hoàng Công Khánh	2002-10-25 17:00:00	Việt Nam	MF	2026-06-02 11:15:23.706	2026-06-02 11:15:23.706	\N	171	DOMESTIC	70	\N
d5d18539-697f-4606-99d5-c4bc16b5022d	Phạm Văn Dũng	2002-03-27 17:00:00	Việt Nam	MF	2026-06-02 11:15:23.716	2026-06-02 11:15:23.716	\N	177	DOMESTIC	63	\N
ea2f1dfe-065c-46c0-8e6d-a1397cee92af	Đặng Đức Khải	2004-11-06 17:00:00	Việt Nam	MF	2026-06-02 11:15:23.727	2026-06-02 11:15:23.727	\N	166	DOMESTIC	61	\N
55840af5-76c5-4439-b196-737c54bacafd	Phạm Anh Hải	2003-09-18 17:00:00	Việt Nam	MF	2026-06-02 11:15:23.739	2026-06-02 11:15:23.739	\N	174	DOMESTIC	64	\N
f1c2e107-e5df-4006-a2b4-323fd3ffdd74	Lê Xuân Khải	2004-05-18 17:00:00	Việt Nam	FW	2026-06-02 11:15:23.75	2026-06-02 11:15:23.75	\N	180	DOMESTIC	63	\N
a388c17b-7143-48ed-8ec3-24a3e46644ce	Đỗ Minh Vinh	1996-01-18 17:00:00	Việt Nam	FW	2026-06-02 11:15:23.771	2026-06-02 11:15:23.771	\N	182	DOMESTIC	72	\N
ccc8ef29-bb77-46b1-801d-7c45a725c567	Đỗ Quốc Nghĩa	1995-11-22 17:00:00	Nigeria	DF	2026-06-02 11:15:23.554	2026-06-02 11:15:39.208	Nigeria	166	FOREIGN	67	\N
37fd4b43-f2ad-468f-acab-f023cc526ddc	Lê Văn Dũng	1999-06-04 17:00:00	Brazil	DF	2026-06-02 11:15:23.565	2026-06-02 11:15:39.211	Brazil	168	FOREIGN	62	\N
7ed15712-6e44-43c5-9fca-874c33ef4ba6	Vũ Hữu Long	1998-07-20 17:00:00	Nigeria	DF	2026-06-02 11:15:23.576	2026-06-02 11:15:39.215	Nigeria	184	FOREIGN	78	\N
c02a48a7-5ee1-432b-ba3f-e13275053e71	Hoàng Hữu Linh	2001-11-30 17:00:00	Việt Nam	FW	2026-06-02 11:15:23.782	2026-06-02 11:15:23.782	\N	177	DOMESTIC	67	\N
7906653e-72a2-4bd1-ac70-947fd7116470	Đặng Công Bình	1994-10-05 17:00:00	Việt Nam	FW	2026-06-02 11:15:23.793	2026-06-02 11:15:23.793	\N	165	DOMESTIC	63	\N
326950ef-6602-41e4-b507-3ee6698dffd2	Vũ Tiến Long	2001-09-15 17:00:00	Việt Nam	FW	2026-06-02 11:15:23.805	2026-06-02 11:15:23.805	\N	166	DOMESTIC	73	\N
b9f7457a-c3fc-4add-b1b0-76403194f62b	Rimario Gordon	2001-02-08 17:00:00	Brazil	DF	2026-06-02 11:15:23.818	2026-06-02 11:15:23.818	\N	173	FOREIGN	74	\N
814963ea-e0be-4e9e-9b44-0d20f9a3f271	Hendrio Silva	2002-03-21 17:00:00	Nigeria	MF	2026-06-02 11:15:23.843	2026-06-02 11:15:23.843	\N	175	FOREIGN	70	\N
d812116e-a916-494f-9901-f86015ef14be	Bruno Cunha	1998-11-07 17:00:00	Brazil	FW	2026-06-02 11:15:23.851	2026-06-02 11:15:23.851	\N	176	FOREIGN	81	\N
339858df-7a16-4510-b3b5-ffdf964d6b02	Lê Tiến Khải	2002-04-20 17:00:00	Việt Nam	GK	2026-06-02 11:15:24.147	2026-06-02 11:15:24.147	\N	178	DOMESTIC	67	\N
857a3ee4-f283-4a80-8e23-b956b79533eb	Vũ Minh Dũng	2003-05-25 17:00:00	Việt Nam	GK	2026-06-02 11:15:24.157	2026-06-02 11:15:24.157	\N	170	DOMESTIC	62	\N
33c69484-7925-4967-95e7-ffb38c20991c	Lý Tiến Khoa	2000-04-07 17:00:00	Việt Nam	GK	2026-06-02 11:15:24.17	2026-06-02 11:15:24.17	\N	180	DOMESTIC	67	\N
e6ba34f6-3257-4a84-870a-a362c6b92209	Huỳnh Văn Minh	2000-11-12 17:00:00	Việt Nam	DF	2026-06-02 11:15:24.233	2026-06-02 11:15:24.233	\N	177	DOMESTIC	62	\N
340eacb1-a3ab-41db-a1f8-80e3e674f254	Bùi Tiến An	2002-10-06 17:00:00	Việt Nam	DF	2026-06-02 11:15:24.237	2026-06-02 11:15:24.237	\N	176	DOMESTIC	79	\N
7a8d9d41-a57c-43a8-a6ea-fd17bd210051	Nguyễn Tiến Đức	2004-01-06 17:00:00	Việt Nam	DF	2026-06-02 11:15:24.248	2026-06-02 11:15:24.248	\N	176	DOMESTIC	61	\N
e79054d0-faa0-4c5b-ba3a-e547e08edaf4	Trần Tiến Mạnh	1997-10-06 17:00:00	Việt Nam	DF	2026-06-02 11:15:24.258	2026-06-02 11:15:24.258	\N	176	DOMESTIC	79	\N
72e2df7b-8cb3-4235-9ed9-31fc633e0e53	Đỗ Tiến Vinh	2001-10-26 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.27	2026-06-02 11:15:24.27	\N	171	DOMESTIC	71	\N
07d2f52b-f9f0-407a-921f-f878f17fb3af	Võ Đức Trung	1995-01-02 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.279	2026-06-02 11:15:24.279	\N	182	DOMESTIC	67	\N
fa1fc00c-cfcb-4234-b9f2-b99ab0c038a4	Đặng Văn Phong	1997-09-05 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.29	2026-06-02 11:15:24.29	\N	167	DOMESTIC	74	\N
c12c528c-5ec3-41e9-8250-970149c465fe	Dương Xuân Thành	1998-02-09 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.301	2026-06-02 11:15:24.301	\N	173	DOMESTIC	75	\N
0efdf27a-b364-441a-b019-22919c84b8ff	Lý Quốc Trường	2004-09-30 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.311	2026-06-02 11:15:24.311	\N	168	DOMESTIC	64	\N
e2a11975-b132-400c-9d96-9085a6e073f4	Dương Đức Hùng	1995-05-27 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.322	2026-06-02 11:15:24.322	\N	172	DOMESTIC	76	\N
dc3cb859-9ef4-495e-a47b-0d2fd8c14931	Đặng Xuân Khoa	1996-05-13 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.333	2026-06-02 11:15:24.333	\N	165	DOMESTIC	73	\N
1655cdf9-8bf6-4082-a6ab-0f343b7f38a5	Đinh Minh Long	2002-10-08 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.343	2026-06-02 11:15:24.343	\N	174	DOMESTIC	69	\N
e9e3df2d-af39-4165-bb6f-c56b7f2ee9d3	Phan Anh Tuấn	1997-12-01 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.354	2026-06-02 11:15:24.354	\N	182	DOMESTIC	76	\N
c75a95e1-aa54-49e6-be76-443dbc968317	Phạm Xuân Khải	2000-05-14 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.356	2026-06-02 11:15:24.356	\N	181	DOMESTIC	76	\N
60011408-bbc0-463a-bf9e-771f84907127	Dương Tấn Lâm	1996-09-03 17:00:00	Việt Nam	FW	2026-06-02 11:15:24.37	2026-06-02 11:15:24.37	\N	176	DOMESTIC	60	\N
9fceef55-15db-4df0-b7ea-af2a2ef56a6c	Đỗ Hữu Phong	1993-10-20 17:00:00	Việt Nam	FW	2026-06-02 11:15:24.39	2026-06-02 11:15:24.39	\N	166	DOMESTIC	78	\N
41806643-287a-4b5c-8cbb-cff0f07cd8b3	Ngô Đức Dũng	1993-04-20 17:00:00	Việt Nam	FW	2026-06-02 11:15:24.399	2026-06-02 11:15:24.399	\N	173	DOMESTIC	73	\N
454d3b9a-3b63-4dfd-a938-d041d360f95d	Hoàng Hữu Hoàng	2002-07-16 17:00:00	Việt Nam	FW	2026-06-02 11:15:24.404	2026-06-02 11:15:24.404	\N	180	DOMESTIC	68	\N
26373344-5c42-4b61-88b4-e7c1a9384f9c	Huỳnh Minh Nghĩa	2003-07-05 17:00:00	Việt Nam	FW	2026-06-02 11:15:24.414	2026-06-02 11:15:24.414	\N	165	DOMESTIC	76	\N
fd4a10e4-a979-49c2-9389-d00121c34fd4	Lucas Souza	1999-09-21 17:00:00	Brazil	DF	2026-06-02 11:15:24.425	2026-06-02 11:15:24.425	\N	184	FOREIGN	84	\N
00960590-ed20-45f3-a1a1-2c55e57c088f	Rafaelson	1995-06-24 17:00:00	Nigeria	MF	2026-06-02 11:15:24.437	2026-06-02 11:15:24.437	\N	182	FOREIGN	84	\N
c65b4310-946b-4bdf-b8ab-6867731f876d	Geovane Magno	1996-03-31 17:00:00	Brazil	FW	2026-06-02 11:15:24.449	2026-06-02 11:15:24.449	\N	172	FOREIGN	77	\N
f233f65b-6da7-44e0-a572-14c271034596	Đặng Anh Thành	1994-04-15 17:00:00	Việt Nam	GK	2026-06-02 11:15:24.809	2026-06-02 11:15:24.809	\N	166	DOMESTIC	69	\N
1ababc07-f4c7-4143-842a-d81766383616	Phạm Anh Nghĩa	2004-03-10 17:00:00	Việt Nam	GK	2026-06-02 11:15:24.812	2026-06-02 11:15:24.812	\N	184	DOMESTIC	60	\N
c4ca4fee-efc5-48fb-a660-bc831bc16872	Đỗ Tấn Thắng	1996-05-02 17:00:00	Việt Nam	GK	2026-06-02 11:15:24.814	2026-06-02 11:15:24.814	\N	174	DOMESTIC	62	\N
577fc6f1-69db-441d-a9a3-2c7f36a72834	Đặng Xuân Khánh	2001-06-03 17:00:00	Việt Nam	DF	2026-06-02 11:15:24.827	2026-06-02 11:15:24.827	\N	173	DOMESTIC	65	\N
73307118-3330-479d-b300-9d6343b49bf4	Phạm Tiến Phong	2000-10-08 17:00:00	Việt Nam	DF	2026-06-02 11:15:24.832	2026-06-02 11:15:24.832	\N	181	DOMESTIC	64	\N
6a007a21-a220-4773-b5aa-c2e4223b2c41	Phan Công Phúc	1995-06-26 17:00:00	Việt Nam	DF	2026-06-02 11:15:24.835	2026-06-02 11:15:24.835	\N	175	DOMESTIC	78	\N
205c6054-edee-4208-91e9-89d2b3134023	Huỳnh Đức Vinh	2001-11-14 17:00:00	Việt Nam	DF	2026-06-02 11:15:24.838	2026-06-02 11:15:24.838	\N	184	DOMESTIC	64	\N
6434cbe7-47a4-4108-9e26-142cf2a6827f	Đinh Văn Dũng	1996-09-01 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.84	2026-06-02 11:15:24.84	\N	184	DOMESTIC	68	\N
68e4189a-bd8f-45a7-b1f8-7b92be25c1de	Bùi Tấn Tuấn	1994-07-25 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.842	2026-06-02 11:15:24.842	\N	166	DOMESTIC	60	\N
6735188e-9843-449f-a895-24aa7c3dd2ce	Hồ Tiến Khoa	2002-12-13 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.854	2026-06-02 11:15:24.854	\N	165	DOMESTIC	64	\N
ca6d5729-d2bf-40a3-bcbe-6e790c87b295	Lý Văn Toàn	1998-07-25 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.857	2026-06-02 11:15:24.857	\N	174	DOMESTIC	61	\N
fc4feb91-a848-4133-817a-a67f0b9a923b	Nguyễn Văn Vinh	1993-05-15 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.868	2026-06-02 11:15:24.868	\N	173	DOMESTIC	63	\N
0ed6b2e6-433a-4c5f-a631-fbc458fa3785	Vũ Công Hưng	1996-03-12 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.879	2026-06-02 11:15:24.879	\N	170	DOMESTIC	69	\N
15179ecf-f466-4bef-8b2e-75956c650f70	Đỗ Anh Kiên	1998-12-14 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.89	2026-06-02 11:15:24.89	\N	166	DOMESTIC	68	\N
2685078f-48ae-4a23-bc94-feb1184fbfe3	Võ Quốc Tài	1994-09-17 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.901	2026-06-02 11:15:24.901	\N	178	DOMESTIC	79	\N
256f7828-b235-42d1-b366-6f2f78ee0a03	Đặng Minh Phong	1999-06-18 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.911	2026-06-02 11:15:24.911	\N	184	DOMESTIC	62	\N
260f1985-deaa-4613-b9f7-052e204278a9	Lý Quốc Khoa	2003-12-03 17:00:00	Việt Nam	MF	2026-06-02 11:15:24.922	2026-06-02 11:15:24.922	\N	165	DOMESTIC	76	\N
0c5cdbb0-d4fc-4a99-999a-68ba4aeaf343	Bùi Tấn Bình	1997-03-05 17:00:00	Việt Nam	FW	2026-06-02 11:15:24.933	2026-06-02 11:15:24.933	\N	183	DOMESTIC	67	\N
e6f97d14-e2d4-414c-b0d0-0596bdf9aca4	Phạm Công Hưng	2003-12-05 17:00:00	Việt Nam	FW	2026-06-02 11:15:24.944	2026-06-02 11:15:24.944	\N	182	DOMESTIC	72	\N
a7549eda-d173-452d-944a-1403d31b2b79	Dương Văn Đức	1994-02-20 17:00:00	Việt Nam	FW	2026-06-02 11:15:24.954	2026-06-02 11:15:24.954	\N	177	DOMESTIC	67	\N
724684d4-7a7c-437a-b51b-cf87f8df6611	Huỳnh Công Dũng	2001-04-15 17:00:00	Việt Nam	FW	2026-06-02 11:15:24.965	2026-06-02 11:15:24.965	\N	165	DOMESTIC	65	\N
6a716f73-7b20-4c69-a47c-e7f79c45047c	Phạm Minh Hùng	1998-05-18 17:00:00	Việt Nam	FW	2026-06-02 11:15:24.968	2026-06-02 11:15:24.968	\N	171	DOMESTIC	62	\N
903c5f28-0f36-4ea4-9c64-c92437cfe919	Diego Fagan	1993-10-01 17:00:00	Brazil	DF	2026-06-02 11:15:24.971	2026-06-02 11:15:24.971	\N	175	FOREIGN	82	\N
b8196f61-7740-439f-9091-6f254704fc28	Olaha Friday	1999-10-03 17:00:00	Nigeria	MF	2026-06-02 11:15:24.973	2026-06-02 11:15:24.973	\N	178	FOREIGN	73	\N
68074e2a-d926-45c8-8e53-60d51905cdeb	Đinh Anh Sơn	1996-03-22 17:00:00	Nigeria	DF	2026-06-02 11:15:24.82	2026-06-02 11:15:38.175	Nigeria	173	FOREIGN	68	\N
c8d3eb2c-026f-4677-b69e-ae81f2843084	Bùi Văn Tài	2003-09-02 17:00:00	Brazil	DF	2026-06-02 11:15:24.822	2026-06-02 11:15:38.178	Brazil	169	FOREIGN	69	\N
efefb516-da08-4d8f-b9cc-e3c4a9d6ace0	Ngô Hữu Linh	1999-06-07 17:00:00	Nigeria	DF	2026-06-02 11:15:24.825	2026-06-02 11:15:38.181	Nigeria	176	FOREIGN	71	\N
3e5f4e61-0f76-4eb8-b360-d33eb6d0df17	Lê Anh Trí	1998-03-11 17:00:00	Brazil	DF	2026-06-02 11:15:24.19	2026-06-02 11:15:38.473	Brazil	177	FOREIGN	76	\N
eec36e26-fea5-45d1-94ac-b3771daae57c	Đỗ Minh Nam	1995-06-02 17:00:00	Brazil	DF	2026-06-02 11:15:24.211	2026-06-02 11:15:38.519	Brazil	168	FOREIGN	71	\N
d9a05d94-51e8-417b-80ec-6cf8ce77ce85	Đỗ Đức Phúc	1995-04-13 17:00:00	Nigeria	DF	2026-06-02 11:15:24.222	2026-06-02 11:15:38.533	Nigeria	166	FOREIGN	69	\N
1d4e926f-92cc-4175-87e5-210ae50bbef7	Janclesio Santos	1998-04-27 17:00:00	Brazil	FW	2026-06-02 11:15:24.974	2026-06-02 11:15:24.974	\N	181	FOREIGN	80	\N
0c0b84f1-27a1-4b72-a1c8-1ec4914b17ca	Lê Quốc Thành	1997-03-16 17:00:00	Việt Nam	GK	2026-06-02 11:15:25.262	2026-06-02 11:15:25.262	\N	179	DOMESTIC	72	\N
6fe67016-7213-4f39-bcc4-6cbaa4d16044	Hoàng Quốc Tài	1996-03-08 17:00:00	Việt Nam	GK	2026-06-02 11:15:25.272	2026-06-02 11:15:25.272	\N	165	DOMESTIC	73	\N
53ccd45b-bca5-4c43-8d59-8309856d8f02	Đinh Quốc Quang	2001-11-22 17:00:00	Việt Nam	GK	2026-06-02 11:15:25.283	2026-06-02 11:15:25.283	\N	175	DOMESTIC	66	\N
5762e75e-38db-4de5-aab9-1ff35cfa932f	Ngô Quốc Hùng	1993-01-31 17:00:00	Việt Nam	DF	2026-06-02 11:15:25.336	2026-06-02 11:15:25.336	\N	171	DOMESTIC	62	\N
32d99eb0-0324-496f-baeb-6c897a59a435	Hồ Văn Dũng	1997-02-05 17:00:00	Việt Nam	DF	2026-06-02 11:15:25.347	2026-06-02 11:15:25.347	\N	165	DOMESTIC	79	\N
72cc0e6c-ea6c-4199-9f76-978a59f33f75	Ngô Công Nam	2000-04-25 17:00:00	Việt Nam	DF	2026-06-02 11:15:25.358	2026-06-02 11:15:25.358	\N	177	DOMESTIC	68	\N
6286c67c-11f2-4977-ba12-04500354f293	Võ Hữu Linh	1994-07-09 17:00:00	Việt Nam	DF	2026-06-02 11:15:25.368	2026-06-02 11:15:25.368	\N	180	DOMESTIC	73	\N
789db303-245e-41ab-ae99-7428d0eec815	Lê Anh Đức	1994-06-23 17:00:00	Việt Nam	MF	2026-06-02 11:15:25.379	2026-06-02 11:15:25.379	\N	183	DOMESTIC	62	\N
f33bb96a-e2ad-4b28-9486-1be383eec0fe	Hoàng Quốc Trung	2001-12-01 17:00:00	Việt Nam	MF	2026-06-02 11:15:25.39	2026-06-02 11:15:25.39	\N	169	DOMESTIC	62	\N
0139489f-4648-4942-ab49-b0078826c816	Bùi Tiến Tuấn	1998-06-26 17:00:00	Việt Nam	MF	2026-06-02 11:15:25.401	2026-06-02 11:15:25.401	\N	177	DOMESTIC	63	\N
20fa23b4-1fbe-4f58-97ea-ea63ca89b6cf	Đỗ Công Tùng	1997-12-08 17:00:00	Việt Nam	MF	2026-06-02 11:15:25.412	2026-06-02 11:15:25.412	\N	170	DOMESTIC	68	\N
a5a12acd-3a82-4c7a-9d4e-922dc8638222	Hoàng Công Quang	2004-01-10 17:00:00	Việt Nam	MF	2026-06-02 11:15:25.422	2026-06-02 11:15:25.422	\N	181	DOMESTIC	68	\N
4a03a0ce-c2d9-4722-8eca-1295932cee8a	Võ Minh Hiếu	2000-07-18 17:00:00	Việt Nam	MF	2026-06-02 11:15:25.433	2026-06-02 11:15:25.433	\N	168	DOMESTIC	63	\N
afbbd223-03dc-4807-ab1e-c4847aa43fcf	Nguyễn Tấn Mạnh	2001-11-16 17:00:00	Việt Nam	MF	2026-06-02 11:15:25.445	2026-06-02 11:15:25.445	\N	168	DOMESTIC	63	\N
b625c7b1-bb7f-4614-8dca-3963f3840d20	Huỳnh Văn Đạt	1994-07-10 17:00:00	Việt Nam	MF	2026-06-02 11:15:25.456	2026-06-02 11:15:25.456	\N	173	DOMESTIC	68	\N
c529f861-b19f-4e5c-ac34-70f5d23ac062	Hồ Công Dũng	2002-10-13 17:00:00	Việt Nam	MF	2026-06-02 11:15:25.466	2026-06-02 11:15:25.466	\N	168	DOMESTIC	62	\N
4985190f-b59a-431e-a2f5-8929279d1cb7	Võ Tấn Bảo	2004-06-16 17:00:00	Việt Nam	MF	2026-06-02 11:15:25.478	2026-06-02 11:15:25.478	\N	184	DOMESTIC	67	\N
0f22ec25-66cd-4672-aa2a-57ee4a348e4f	Phạm Đức Bảo	2002-03-07 17:00:00	Việt Nam	FW	2026-06-02 11:15:25.489	2026-06-02 11:15:25.489	\N	181	DOMESTIC	77	\N
8aadfde9-edb6-4e22-8549-fded1918d6a2	Huỳnh Công Thắng	1995-11-15 17:00:00	Việt Nam	FW	2026-06-02 11:15:25.499	2026-06-02 11:15:25.499	\N	166	DOMESTIC	66	\N
5c258961-6034-4bdf-ad36-29b8f222894b	Hoàng Tiến Tuấn	2004-10-16 17:00:00	Việt Nam	FW	2026-06-02 11:15:25.509	2026-06-02 11:15:25.509	\N	173	DOMESTIC	71	\N
1e4202c0-2350-4343-9295-523878a2307b	Phạm Quốc Nam	1998-11-17 17:00:00	Việt Nam	FW	2026-06-02 11:15:25.521	2026-06-02 11:15:25.521	\N	171	DOMESTIC	78	\N
236855f1-6e4c-4b06-8996-5b4bcc3c10ae	Dương Tiến Thiện	2000-02-25 17:00:00	Việt Nam	FW	2026-06-02 11:15:25.532	2026-06-02 11:15:25.532	\N	166	DOMESTIC	72	\N
a730d085-8b1c-46f1-a6f8-a93611dcb7c4	Pedro Paulo	1996-02-20 17:00:00	Brazil	DF	2026-06-02 11:15:25.543	2026-06-02 11:15:25.543	\N	176	FOREIGN	67	\N
0efaaaeb-93b5-443f-9bfb-387c68cb22cb	Anderson Lima	1996-12-04 17:00:00	Nigeria	MF	2026-06-02 11:15:25.555	2026-06-02 11:15:25.555	\N	175	FOREIGN	84	\N
73efed03-f16e-4ed8-98e6-888c7979f07e	Josue Homma	2001-11-08 17:00:00	Brazil	FW	2026-06-02 11:15:25.565	2026-06-02 11:15:25.565	\N	175	FOREIGN	69	\N
1ca283d1-063e-498f-8db9-11a0dfe58498	Dương Anh Lâm	1993-05-18 17:00:00	Brazil	DF	2026-06-02 11:15:24.817	2026-06-02 11:15:38.167	Brazil	173	FOREIGN	69	\N
b7af4cd6-5f29-4972-9636-284404455bac	Đinh Xuân Nhật	1996-11-13 17:00:00	Brazil	DF	2026-06-02 11:15:19.388	2026-06-02 11:15:38.293	Brazil	182	FOREIGN	71	\N
c735827f-8c62-42a4-9ee6-2abb1f707533	Đặng Công Dũng	1996-10-24 17:00:00	Brazil	DF	2026-06-02 11:15:17.691	2026-06-02 11:15:38.368	Brazil	179	FOREIGN	61	\N
60bd051d-5046-4297-8b53-894913081738	Đỗ Công Trường	2002-09-24 17:00:00	Brazil	DF	2026-06-02 11:15:17.697	2026-06-02 11:15:38.389	Brazil	175	FOREIGN	76	\N
51c622e8-af49-4d8a-9572-25be5e508e91	Võ Đức Kiên	1996-10-03 17:00:00	Nigeria	DF	2026-06-02 11:15:24.2	2026-06-02 11:15:38.494	Nigeria	166	FOREIGN	76	\N
febe55b1-a0da-42e8-8ce6-8fbad18231ba	Hồ Tiến Hải	1999-11-23 17:00:00	Nigeria	DF	2026-06-02 11:15:18.027	2026-06-02 11:15:38.67	Nigeria	166	FOREIGN	75	\N
abe574fc-a574-4180-a66c-9cd8e7c2c480	Hồ Tấn Thành	2003-04-25 17:00:00	Brazil	DF	2026-06-02 11:15:20.762	2026-06-02 11:15:38.817	Brazil	168	FOREIGN	65	\N
e158a991-7474-4d9a-afbd-7a66ef78b014	Lý Hữu Phong	1995-09-30 17:00:00	Brazil	DF	2026-06-02 11:15:25.293	2026-06-02 11:15:39.151	Brazil	172	FOREIGN	68	\N
5faf3487-35bb-4cf6-9c3e-86c33e59ceba	Hồ Tấn Phong	1996-09-20 17:00:00	Nigeria	DF	2026-06-02 11:15:25.304	2026-06-02 11:15:39.154	Nigeria	165	FOREIGN	60	\N
9a9fc034-479e-4704-8ee8-4f778e8aabb7	Huỳnh Hữu An	1994-12-22 17:00:00	Brazil	DF	2026-06-02 11:15:25.315	2026-06-02 11:15:39.156	Brazil	166	FOREIGN	61	\N
fb32cc88-94b0-4ae9-871d-4cc0c3796e82	Đặng Đức Dũng	1995-08-18 17:00:00	Nigeria	DF	2026-06-02 11:15:25.325	2026-06-02 11:15:39.158	Nigeria	173	FOREIGN	62	\N
715c093a-e1e3-46fc-b6a2-e4d8d366fe88	Bùi Tiến Linh	2004-01-04 17:00:00	Brazil	DF	2026-06-02 11:15:23.544	2026-06-02 11:15:39.205	Brazil	182	FOREIGN	75	\N
a07b457b-a7d1-43f1-b7ac-8918537ee1d8	BN Academy GK 1	1997-02-02 00:00:00	Việt Nam	GK	2026-06-02 11:15:39.516	2026-06-02 11:15:39.516	Bắc Ninh FC	171	DOMESTIC	65	BN Academy GK 1 thuộc danh sách đăng ký demo của Bắc Ninh FC.
00e551e9-cf80-43b6-998e-974e2ef940ba	BN Academy GK 2	1998-03-03 00:00:00	Việt Nam	GK	2026-06-02 11:15:39.531	2026-06-02 11:15:39.531	Bắc Ninh FC	172	DOMESTIC	66	BN Academy GK 2 thuộc danh sách đăng ký demo của Bắc Ninh FC.
1fcc3535-c455-431f-8076-8b030ea870ce	BN Academy DF 3	1999-04-04 00:00:00	Việt Nam	DF	2026-06-02 11:15:39.575	2026-06-02 11:15:39.575	Bắc Ninh FC	173	DOMESTIC	67	BN Academy DF 3 thuộc danh sách đăng ký demo của Bắc Ninh FC.
5940b1ed-9c97-4d54-9892-29703cbb0fff	BN Academy DF 4	2000-05-05 00:00:00	Việt Nam	DF	2026-06-02 11:15:39.599	2026-06-02 11:15:39.599	Bắc Ninh FC	174	DOMESTIC	68	BN Academy DF 4 thuộc danh sách đăng ký demo của Bắc Ninh FC.
5016323c-5321-44dc-9b3f-3531c214a196	BN Academy DF 5	2001-06-06 00:00:00	Việt Nam	DF	2026-06-02 11:15:39.624	2026-06-02 11:15:39.624	Bắc Ninh FC	175	DOMESTIC	69	BN Academy DF 5 thuộc danh sách đăng ký demo của Bắc Ninh FC.
18efa90f-599e-48cb-9bf9-9bf68ab45a6e	BN Academy DF 6	2002-07-07 00:00:00	Việt Nam	DF	2026-06-02 11:15:39.658	2026-06-02 11:15:39.658	Bắc Ninh FC	176	DOMESTIC	70	BN Academy DF 6 thuộc danh sách đăng ký demo của Bắc Ninh FC.
db48942a-9977-4975-aca3-3a86c8d30a56	BN Academy DF 7	2003-08-08 00:00:00	Việt Nam	DF	2026-06-02 11:15:39.683	2026-06-02 11:15:39.683	Bắc Ninh FC	177	DOMESTIC	71	BN Academy DF 7 thuộc danh sách đăng ký demo của Bắc Ninh FC.
efc0e6fa-6b95-4948-ba04-7910c62c69f6	BN Academy DF 8	1996-09-09 00:00:00	Việt Nam	DF	2026-06-02 11:15:39.716	2026-06-02 11:15:39.716	Bắc Ninh FC	178	DOMESTIC	72	BN Academy DF 8 thuộc danh sách đăng ký demo của Bắc Ninh FC.
7319c8d1-cdaf-4bdb-b4f4-08fcbc65d684	BN Foreign DF 9	1997-10-10 00:00:00	Brazil	DF	2026-06-02 11:15:39.726	2026-06-02 11:15:39.726	Brazil	179	FOREIGN	73	BN Foreign DF 9 thuộc danh sách đăng ký demo của Bắc Ninh FC.
968e177e-8b8e-4ba3-911c-5d4161811c66	BN Academy MF 11	1999-12-12 00:00:00	Việt Nam	MF	2026-06-02 11:15:39.76	2026-06-02 11:15:39.76	Bắc Ninh FC	181	DOMESTIC	75	BN Academy MF 11 thuộc danh sách đăng ký demo của Bắc Ninh FC.
712620ca-401a-4905-9a60-e1fc82bd573a	BN Academy MF 12	2000-01-13 00:00:00	Việt Nam	MF	2026-06-02 11:15:39.794	2026-06-02 11:15:39.794	Bắc Ninh FC	182	DOMESTIC	76	BN Academy MF 12 thuộc danh sách đăng ký demo của Bắc Ninh FC.
adf7db12-390c-41e2-9dc5-0ab4ba3e9c21	BN Academy MF 13	2001-02-14 00:00:00	Việt Nam	MF	2026-06-02 11:15:39.823	2026-06-02 11:15:39.823	Bắc Ninh FC	183	DOMESTIC	77	BN Academy MF 13 thuộc danh sách đăng ký demo của Bắc Ninh FC.
c597247e-6f69-4373-bf57-268d478f7511	BN Academy MF 14	2002-03-15 00:00:00	Việt Nam	MF	2026-06-02 11:15:39.84	2026-06-02 11:15:39.84	Bắc Ninh FC	184	DOMESTIC	78	BN Academy MF 14 thuộc danh sách đăng ký demo của Bắc Ninh FC.
a5ab5319-0fb7-4df3-906a-5d29beee6197	BN Academy MF 15	2003-04-16 00:00:00	Việt Nam	MF	2026-06-02 11:15:39.858	2026-06-02 11:15:39.858	Bắc Ninh FC	185	DOMESTIC	79	BN Academy MF 15 thuộc danh sách đăng ký demo của Bắc Ninh FC.
f3b0246f-24c4-41e1-9fa5-94c209765037	BN Foreign MF 16	1996-05-17 00:00:00	Nigeria	MF	2026-06-02 11:15:39.871	2026-06-02 11:15:39.871	Nigeria	170	FOREIGN	80	BN Foreign MF 16 thuộc danh sách đăng ký demo của Bắc Ninh FC.
1e8ba6bb-ba82-48f2-8afd-b9a6c182f8fa	BN Foreign MF 17	1997-06-18 00:00:00	Nigeria	MF	2026-06-02 11:15:39.882	2026-06-02 11:15:39.882	Nigeria	171	FOREIGN	81	BN Foreign MF 17 thuộc danh sách đăng ký demo của Bắc Ninh FC.
7a6d3117-9ce0-4fa2-92a1-ae0d3acac071	BN Academy FW 18	1998-07-19 00:00:00	Việt Nam	FW	2026-06-02 11:15:39.899	2026-06-02 11:15:39.899	Bắc Ninh FC	172	DOMESTIC	64	BN Academy FW 18 thuộc danh sách đăng ký demo của Bắc Ninh FC.
17b424c3-5507-4641-a0c1-2e016dc64044	BN Academy FW 19	1999-08-20 00:00:00	Việt Nam	FW	2026-06-02 11:15:39.911	2026-06-02 11:15:39.911	Bắc Ninh FC	173	DOMESTIC	65	BN Academy FW 19 thuộc danh sách đăng ký demo của Bắc Ninh FC.
b116eacf-dd0e-4ebe-b6c2-a88cd0e2b43f	BN Academy FW 20	2000-09-21 00:00:00	Việt Nam	FW	2026-06-02 11:15:39.929	2026-06-02 11:15:39.929	Bắc Ninh FC	174	DOMESTIC	66	BN Academy FW 20 thuộc danh sách đăng ký demo của Bắc Ninh FC.
0eada5e5-77a1-427d-8521-1ecefca5d9ea	BN Academy FW 21	2001-10-22 00:00:00	Việt Nam	FW	2026-06-02 11:15:39.937	2026-06-02 11:15:39.937	Bắc Ninh FC	175	DOMESTIC	67	BN Academy FW 21 thuộc danh sách đăng ký demo của Bắc Ninh FC.
1b42266b-1108-4cc5-aa2e-ae2327044383	BN Foreign FW 22	2002-11-23 00:00:00	Brazil	FW	2026-06-02 11:15:39.967	2026-06-02 11:15:39.967	Brazil	176	FOREIGN	68	BN Foreign FW 22 thuộc danh sách đăng ký demo của Bắc Ninh FC.
71c2b098-02cd-446a-acb8-cc9a526ed606	LA Academy GK 1	1997-02-02 00:00:00	Việt Nam	GK	2026-06-02 11:15:40.031	2026-06-02 11:15:40.031	Long An FC	171	DOMESTIC	65	LA Academy GK 1 thuộc danh sách đăng ký demo của Long An FC.
47bfa3e8-46cc-40fe-934a-4635fb6d5903	LA Academy GK 2	1998-03-03 00:00:00	Việt Nam	GK	2026-06-02 11:15:40.039	2026-06-02 11:15:40.039	Long An FC	172	DOMESTIC	66	LA Academy GK 2 thuộc danh sách đăng ký demo của Long An FC.
415e6a74-c873-4beb-81b8-64d89e55fb03	LA Academy DF 3	1999-04-04 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.045	2026-06-02 11:15:40.045	Long An FC	173	DOMESTIC	67	LA Academy DF 3 thuộc danh sách đăng ký demo của Long An FC.
a0a867ce-244b-41af-84ef-ea299d32cc3b	LA Academy DF 4	2000-05-05 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.051	2026-06-02 11:15:40.051	Long An FC	174	DOMESTIC	68	LA Academy DF 4 thuộc danh sách đăng ký demo của Long An FC.
1a01fada-8a80-49af-87b2-018eb340323e	LA Academy DF 5	2001-06-06 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.057	2026-06-02 11:15:40.057	Long An FC	175	DOMESTIC	69	LA Academy DF 5 thuộc danh sách đăng ký demo của Long An FC.
f9ad35f4-b443-4902-bc6c-1acbb892ed5d	LA Academy DF 6	2002-07-07 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.063	2026-06-02 11:15:40.063	Long An FC	176	DOMESTIC	70	LA Academy DF 6 thuộc danh sách đăng ký demo của Long An FC.
02470155-2867-4d6d-b591-3a91ba1e9f3c	LA Academy DF 7	2003-08-08 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.07	2026-06-02 11:15:40.07	Long An FC	177	DOMESTIC	71	LA Academy DF 7 thuộc danh sách đăng ký demo của Long An FC.
66d0047d-98ab-49ac-adeb-ffc736a0284b	LA Academy DF 8	1996-09-09 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.079	2026-06-02 11:15:40.079	Long An FC	178	DOMESTIC	72	LA Academy DF 8 thuộc danh sách đăng ký demo của Long An FC.
3797aed5-09d9-4efe-af60-1716f82ffefc	LA Foreign DF 9	1997-10-10 00:00:00	Brazil	DF	2026-06-02 11:15:40.089	2026-06-02 11:15:40.089	Brazil	179	FOREIGN	73	LA Foreign DF 9 thuộc danh sách đăng ký demo của Long An FC.
04e7a397-5c79-4389-8614-ffcf852eb8b5	LA Academy MF 11	1999-12-12 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.113	2026-06-02 11:15:40.113	Long An FC	181	DOMESTIC	75	LA Academy MF 11 thuộc danh sách đăng ký demo của Long An FC.
44090201-f6b6-40a8-a198-a9ebb359f4e9	LA Academy MF 12	2000-01-13 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.121	2026-06-02 11:15:40.121	Long An FC	182	DOMESTIC	76	LA Academy MF 12 thuộc danh sách đăng ký demo của Long An FC.
94b3e3ec-88b9-4a27-9097-da2f2fbe4e22	LA Academy MF 13	2001-02-14 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.128	2026-06-02 11:15:40.128	Long An FC	183	DOMESTIC	77	LA Academy MF 13 thuộc danh sách đăng ký demo của Long An FC.
74556eef-90fd-4444-ad56-6ec8333ca444	LA Academy MF 14	2002-03-15 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.145	2026-06-02 11:15:40.145	Long An FC	184	DOMESTIC	78	LA Academy MF 14 thuộc danh sách đăng ký demo của Long An FC.
0a0765a7-7822-490b-ae43-ee9cd907b746	LA Academy MF 15	2003-04-16 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.153	2026-06-02 11:15:40.153	Long An FC	185	DOMESTIC	79	LA Academy MF 15 thuộc danh sách đăng ký demo của Long An FC.
257f4ccc-9efc-4066-a019-e6583f39cafb	LA Foreign MF 16	1996-05-17 00:00:00	Nigeria	MF	2026-06-02 11:15:40.171	2026-06-02 11:15:40.171	Nigeria	170	FOREIGN	80	LA Foreign MF 16 thuộc danh sách đăng ký demo của Long An FC.
9f1f08dc-ee75-44d8-8f95-6f0755046152	LA Foreign MF 17	1997-06-18 00:00:00	Nigeria	MF	2026-06-02 11:15:40.179	2026-06-02 11:15:40.179	Nigeria	171	FOREIGN	81	LA Foreign MF 17 thuộc danh sách đăng ký demo của Long An FC.
675475fc-9d9f-46cf-bc5e-a41f6f9b52d6	LA Academy FW 18	1998-07-19 00:00:00	Việt Nam	FW	2026-06-02 11:15:40.187	2026-06-02 11:15:40.187	Long An FC	172	DOMESTIC	64	LA Academy FW 18 thuộc danh sách đăng ký demo của Long An FC.
c1f5f44d-0c9c-40f3-a2a2-15de111b2b3e	LA Academy FW 19	1999-08-20 00:00:00	Việt Nam	FW	2026-06-02 11:15:40.197	2026-06-02 11:15:40.197	Long An FC	173	DOMESTIC	65	LA Academy FW 19 thuộc danh sách đăng ký demo của Long An FC.
edfa91fe-10b5-4ac6-8134-7035a39ccf69	LA Academy FW 20	2000-09-21 00:00:00	Việt Nam	FW	2026-06-02 11:15:40.214	2026-06-02 11:15:40.214	Long An FC	174	DOMESTIC	66	LA Academy FW 20 thuộc danh sách đăng ký demo của Long An FC.
5622ae18-5359-4bc9-98e6-60b47a33c28f	LA Academy FW 21	2001-10-22 00:00:00	Việt Nam	FW	2026-06-02 11:15:40.222	2026-06-02 11:15:40.222	Long An FC	175	DOMESTIC	67	LA Academy FW 21 thuộc danh sách đăng ký demo của Long An FC.
a9e90f17-817e-45ff-aca2-572d4c3962f8	LA Foreign FW 22	2002-11-23 00:00:00	Brazil	FW	2026-06-02 11:15:40.238	2026-06-02 11:15:40.238	Brazil	176	FOREIGN	68	LA Foreign FW 22 thuộc danh sách đăng ký demo của Long An FC.
7bebf77d-4b3e-47c9-bba2-21caec489934	QNU Academy GK 1	1997-02-02 00:00:00	Việt Nam	GK	2026-06-02 11:15:40.281	2026-06-02 11:15:40.281	Quy Nhơn United	171	DOMESTIC	65	QNU Academy GK 1 thuộc danh sách đăng ký demo của Quy Nhơn United.
af57aec8-dcae-440d-ae32-a6f384d15ccf	QNU Academy GK 2	1998-03-03 00:00:00	Việt Nam	GK	2026-06-02 11:15:40.29	2026-06-02 11:15:40.29	Quy Nhơn United	172	DOMESTIC	66	QNU Academy GK 2 thuộc danh sách đăng ký demo của Quy Nhơn United.
15b3a75a-a22a-425e-8537-2584244970ed	QNU Academy DF 3	1999-04-04 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.303	2026-06-02 11:15:40.303	Quy Nhơn United	173	DOMESTIC	67	QNU Academy DF 3 thuộc danh sách đăng ký demo của Quy Nhơn United.
42ab0f13-cbe7-42e6-9938-a752cdc84138	QNU Academy DF 4	2000-05-05 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.311	2026-06-02 11:15:40.311	Quy Nhơn United	174	DOMESTIC	68	QNU Academy DF 4 thuộc danh sách đăng ký demo của Quy Nhơn United.
e12635e5-b64a-42d5-a055-af2fe6addaeb	QNU Academy DF 5	2001-06-06 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.318	2026-06-02 11:15:40.318	Quy Nhơn United	175	DOMESTIC	69	QNU Academy DF 5 thuộc danh sách đăng ký demo của Quy Nhơn United.
b6be58ce-d149-4961-bf9b-1b94923549e9	QNU Academy DF 6	2002-07-07 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.329	2026-06-02 11:15:40.329	Quy Nhơn United	176	DOMESTIC	70	QNU Academy DF 6 thuộc danh sách đăng ký demo của Quy Nhơn United.
e881998a-7c02-4fcd-a10a-94fbe54731da	QNU Academy DF 7	2003-08-08 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.34	2026-06-02 11:15:40.34	Quy Nhơn United	177	DOMESTIC	71	QNU Academy DF 7 thuộc danh sách đăng ký demo của Quy Nhơn United.
0cae3a05-edf3-4955-bbcb-e2774605c43a	QNU Academy DF 8	1996-09-09 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.347	2026-06-02 11:15:40.347	Quy Nhơn United	178	DOMESTIC	72	QNU Academy DF 8 thuộc danh sách đăng ký demo của Quy Nhơn United.
c48cf810-b0cd-47b0-8795-33469bc0899c	QNU Foreign DF 9	1997-10-10 00:00:00	Brazil	DF	2026-06-02 11:15:40.356	2026-06-02 11:15:40.356	Brazil	179	FOREIGN	73	QNU Foreign DF 9 thuộc danh sách đăng ký demo của Quy Nhơn United.
d5b7d429-9025-49ea-a4f3-8c0fbd4e02cf	QNU Academy MF 10	1998-11-11 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.363	2026-06-02 11:15:40.363	Quy Nhơn United	180	DOMESTIC	74	QNU Academy MF 10 thuộc danh sách đăng ký demo của Quy Nhơn United.
ff64cb3e-aa09-47c5-b61c-01d21311459f	QNU Academy MF 11	1999-12-12 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.385	2026-06-02 11:15:40.385	Quy Nhơn United	181	DOMESTIC	75	QNU Academy MF 11 thuộc danh sách đăng ký demo của Quy Nhơn United.
878bb9d4-6966-40b9-9be1-f4b0c4ffb363	QNU Academy MF 12	2000-01-13 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.395	2026-06-02 11:15:40.395	Quy Nhơn United	182	DOMESTIC	76	QNU Academy MF 12 thuộc danh sách đăng ký demo của Quy Nhơn United.
e92d09d9-4dad-4a8c-b8af-2ccc0d43d756	QNU Academy MF 13	2001-02-14 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.407	2026-06-02 11:15:40.407	Quy Nhơn United	183	DOMESTIC	77	QNU Academy MF 13 thuộc danh sách đăng ký demo của Quy Nhơn United.
a58c4c70-257c-4bdf-a1f5-db91fe5ffca8	QNU Academy MF 14	2002-03-15 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.414	2026-06-02 11:15:40.414	Quy Nhơn United	184	DOMESTIC	78	QNU Academy MF 14 thuộc danh sách đăng ký demo của Quy Nhơn United.
1622290f-528c-4253-8f0b-fd7940714460	QNU Academy MF 15	2003-04-16 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.425	2026-06-02 11:15:40.425	Quy Nhơn United	185	DOMESTIC	79	QNU Academy MF 15 thuộc danh sách đăng ký demo của Quy Nhơn United.
237e4e91-22df-4cd8-9b20-8e0387ae4df6	QNU Foreign MF 16	1996-05-17 00:00:00	Nigeria	MF	2026-06-02 11:15:40.431	2026-06-02 11:15:40.431	Nigeria	170	FOREIGN	80	QNU Foreign MF 16 thuộc danh sách đăng ký demo của Quy Nhơn United.
416bfbfe-ce7d-48e2-bd7c-eaef37783ff1	QNU Foreign MF 17	1997-06-18 00:00:00	Nigeria	MF	2026-06-02 11:15:40.441	2026-06-02 11:15:40.441	Nigeria	171	FOREIGN	81	QNU Foreign MF 17 thuộc danh sách đăng ký demo của Quy Nhơn United.
0e0b9969-e6ed-465e-b75f-7376dcfc5bf1	QNU Academy FW 18	1998-07-19 00:00:00	Việt Nam	FW	2026-06-02 11:15:40.447	2026-06-02 11:15:40.447	Quy Nhơn United	172	DOMESTIC	64	QNU Academy FW 18 thuộc danh sách đăng ký demo của Quy Nhơn United.
16be0e8e-ad02-4807-ba57-9d808b7c0556	QNU Academy FW 19	1999-08-20 00:00:00	Việt Nam	FW	2026-06-02 11:15:40.465	2026-06-02 11:15:40.465	Quy Nhơn United	173	DOMESTIC	65	QNU Academy FW 19 thuộc danh sách đăng ký demo của Quy Nhơn United.
ccc5e5d1-b6a3-4a44-b3a9-1a9cf2bf5fe3	QNU Academy FW 20	2000-09-21 00:00:00	Việt Nam	FW	2026-06-02 11:15:40.481	2026-06-02 11:15:40.481	Quy Nhơn United	174	DOMESTIC	66	QNU Academy FW 20 thuộc danh sách đăng ký demo của Quy Nhơn United.
8a567658-1e95-4b71-abab-e61e21521f00	QNU Academy FW 21	2001-10-22 00:00:00	Việt Nam	FW	2026-06-02 11:15:40.491	2026-06-02 11:15:40.491	Quy Nhơn United	175	DOMESTIC	67	QNU Academy FW 21 thuộc danh sách đăng ký demo của Quy Nhơn United.
64dd2be9-6120-447d-8eaa-2be9cabceac8	QNU Foreign FW 22	2002-11-23 00:00:00	Brazil	FW	2026-06-02 11:15:40.498	2026-06-02 11:15:40.498	Brazil	176	FOREIGN	68	QNU Foreign FW 22 thuộc danh sách đăng ký demo của Quy Nhơn United.
71b6543e-ba51-4dfe-9427-c4d13d5407d2	QNINH Academy GK 1	1997-02-02 00:00:00	Việt Nam	GK	2026-06-02 11:15:40.539	2026-06-02 11:15:40.539	Quảng Ninh FC	171	DOMESTIC	65	QNINH Academy GK 1 thuộc danh sách đăng ký demo của Quảng Ninh FC.
80959eaf-be9e-46cb-93fa-2047199b168c	QNINH Academy GK 2	1998-03-03 00:00:00	Việt Nam	GK	2026-06-02 11:15:40.546	2026-06-02 11:15:40.546	Quảng Ninh FC	172	DOMESTIC	66	QNINH Academy GK 2 thuộc danh sách đăng ký demo của Quảng Ninh FC.
e2c84f35-bae0-49b9-aa4f-5f79aa83600a	QNINH Academy DF 3	1999-04-04 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.555	2026-06-02 11:15:40.555	Quảng Ninh FC	173	DOMESTIC	67	QNINH Academy DF 3 thuộc danh sách đăng ký demo của Quảng Ninh FC.
095bf727-1323-44f9-9045-b9e2fb164237	QNINH Academy DF 4	2000-05-05 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.572	2026-06-02 11:15:40.572	Quảng Ninh FC	174	DOMESTIC	68	QNINH Academy DF 4 thuộc danh sách đăng ký demo của Quảng Ninh FC.
fc9d4e85-c4fb-4647-9be3-aac22508fa48	QNINH Academy DF 5	2001-06-06 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.581	2026-06-02 11:15:40.581	Quảng Ninh FC	175	DOMESTIC	69	QNINH Academy DF 5 thuộc danh sách đăng ký demo của Quảng Ninh FC.
b7a230f4-cf88-4e53-9ad3-75cde7320d08	QNINH Academy DF 6	2002-07-07 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.59	2026-06-02 11:15:40.59	Quảng Ninh FC	176	DOMESTIC	70	QNINH Academy DF 6 thuộc danh sách đăng ký demo của Quảng Ninh FC.
3ef34e15-293a-461b-98ac-a9cf286f7649	QNINH Academy DF 7	2003-08-08 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.597	2026-06-02 11:15:40.597	Quảng Ninh FC	177	DOMESTIC	71	QNINH Academy DF 7 thuộc danh sách đăng ký demo của Quảng Ninh FC.
479d99b1-8d05-48e9-a2d4-ca49a914582f	QNINH Academy DF 8	1996-09-09 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.605	2026-06-02 11:15:40.605	Quảng Ninh FC	178	DOMESTIC	72	QNINH Academy DF 8 thuộc danh sách đăng ký demo của Quảng Ninh FC.
2f5033d0-2802-48e4-8f2c-fe3e9f9977c2	QNINH Foreign DF 9	1997-10-10 00:00:00	Brazil	DF	2026-06-02 11:15:40.614	2026-06-02 11:15:40.614	Brazil	179	FOREIGN	73	QNINH Foreign DF 9 thuộc danh sách đăng ký demo của Quảng Ninh FC.
c83b042c-f0aa-444f-b76b-a6eb912f5180	QNINH Academy MF 10	1998-11-11 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.622	2026-06-02 11:15:40.622	Quảng Ninh FC	180	DOMESTIC	74	QNINH Academy MF 10 thuộc danh sách đăng ký demo của Quảng Ninh FC.
93421834-8cc6-4d5b-b09f-8c8abbd35daa	QNINH Academy MF 11	1999-12-12 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.629	2026-06-02 11:15:40.629	Quảng Ninh FC	181	DOMESTIC	75	QNINH Academy MF 11 thuộc danh sách đăng ký demo của Quảng Ninh FC.
18e41bc7-ff86-4a10-b39b-2c44f5d8e391	QNINH Academy MF 12	2000-01-13 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.636	2026-06-02 11:15:40.636	Quảng Ninh FC	182	DOMESTIC	76	QNINH Academy MF 12 thuộc danh sách đăng ký demo của Quảng Ninh FC.
28025437-5953-4d5d-820a-4bb51bdb6340	QNINH Academy MF 13	2001-02-14 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.642	2026-06-02 11:15:40.642	Quảng Ninh FC	183	DOMESTIC	77	QNINH Academy MF 13 thuộc danh sách đăng ký demo của Quảng Ninh FC.
1f316637-bba6-43de-a08d-32988bfa5dd5	QNINH Academy MF 14	2002-03-15 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.649	2026-06-02 11:15:40.649	Quảng Ninh FC	184	DOMESTIC	78	QNINH Academy MF 14 thuộc danh sách đăng ký demo của Quảng Ninh FC.
e3148fa9-6630-4cc5-a414-a68d45bd9982	QNINH Academy MF 15	2003-04-16 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.655	2026-06-02 11:15:40.655	Quảng Ninh FC	185	DOMESTIC	79	QNINH Academy MF 15 thuộc danh sách đăng ký demo của Quảng Ninh FC.
9164fbee-f820-43cf-a96d-c58f835d38e6	QNINH Foreign MF 16	1996-05-17 00:00:00	Nigeria	MF	2026-06-02 11:15:40.661	2026-06-02 11:15:40.661	Nigeria	170	FOREIGN	80	QNINH Foreign MF 16 thuộc danh sách đăng ký demo của Quảng Ninh FC.
ca3d7754-e45c-4bfd-b27b-ceed331a39d6	QNINH Foreign MF 17	1997-06-18 00:00:00	Nigeria	MF	2026-06-02 11:15:40.668	2026-06-02 11:15:40.668	Nigeria	171	FOREIGN	81	QNINH Foreign MF 17 thuộc danh sách đăng ký demo của Quảng Ninh FC.
f1f71be4-2891-4866-a71b-081edfc39231	QNINH Academy FW 18	1998-07-19 00:00:00	Việt Nam	FW	2026-06-02 11:15:40.675	2026-06-02 11:15:40.675	Quảng Ninh FC	172	DOMESTIC	64	QNINH Academy FW 18 thuộc danh sách đăng ký demo của Quảng Ninh FC.
0647cd85-8948-469b-84b0-e3cd49c14429	QNINH Academy FW 19	1999-08-20 00:00:00	Việt Nam	FW	2026-06-02 11:15:40.7	2026-06-02 11:15:40.7	Quảng Ninh FC	173	DOMESTIC	65	QNINH Academy FW 19 thuộc danh sách đăng ký demo của Quảng Ninh FC.
481ba811-6a1f-4b5c-8cd1-0e1a45f09f20	QNINH Academy FW 20	2000-09-21 00:00:00	Việt Nam	FW	2026-06-02 11:15:40.707	2026-06-02 11:15:40.707	Quảng Ninh FC	174	DOMESTIC	66	QNINH Academy FW 20 thuộc danh sách đăng ký demo của Quảng Ninh FC.
ec0a729c-949b-4f66-b91e-e018176efefb	QNINH Academy FW 21	2001-10-22 00:00:00	Việt Nam	FW	2026-06-02 11:15:40.713	2026-06-02 11:15:40.713	Quảng Ninh FC	175	DOMESTIC	67	QNINH Academy FW 21 thuộc danh sách đăng ký demo của Quảng Ninh FC.
51902b20-c477-4604-9e27-ebe83b1b321d	QNINH Foreign FW 22	2002-11-23 00:00:00	Brazil	FW	2026-06-02 11:15:40.72	2026-06-02 11:15:40.72	Brazil	176	FOREIGN	68	QNINH Foreign FW 22 thuộc danh sách đăng ký demo của Quảng Ninh FC.
dbc381b9-b7dc-4151-a797-866a4756b76e	SKH Academy GK 1	1997-02-02 00:00:00	Việt Nam	GK	2026-06-02 11:15:40.776	2026-06-02 11:15:40.776	Sanna Khánh Hòa FC	171	DOMESTIC	65	SKH Academy GK 1 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
0ecbfa78-3a29-4148-8319-f2253ba9fcfa	SKH Academy GK 2	1998-03-03 00:00:00	Việt Nam	GK	2026-06-02 11:15:40.797	2026-06-02 11:15:40.797	Sanna Khánh Hòa FC	172	DOMESTIC	66	SKH Academy GK 2 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
375d007c-ad1b-42cc-ac30-895e900b9e44	SKH Academy DF 3	1999-04-04 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.819	2026-06-02 11:15:40.819	Sanna Khánh Hòa FC	173	DOMESTIC	67	SKH Academy DF 3 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
d978e2ca-a638-4945-9423-a0db67bb80ab	SKH Academy DF 4	2000-05-05 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.828	2026-06-02 11:15:40.828	Sanna Khánh Hòa FC	174	DOMESTIC	68	SKH Academy DF 4 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
153fb8d5-6040-4565-bf55-5694453dd4ba	SKH Academy DF 5	2001-06-06 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.84	2026-06-02 11:15:40.84	Sanna Khánh Hòa FC	175	DOMESTIC	69	SKH Academy DF 5 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
eae1ff89-2355-4067-a576-d5b5627b92f9	SKH Academy DF 6	2002-07-07 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.849	2026-06-02 11:15:40.849	Sanna Khánh Hòa FC	176	DOMESTIC	70	SKH Academy DF 6 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
067e901e-2515-4d1b-bce0-b809e7265efa	SKH Academy DF 7	2003-08-08 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.874	2026-06-02 11:15:40.874	Sanna Khánh Hòa FC	177	DOMESTIC	71	SKH Academy DF 7 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
df2f8063-4264-42e8-b32e-6fc168e8648c	SKH Academy DF 8	1996-09-09 00:00:00	Việt Nam	DF	2026-06-02 11:15:40.881	2026-06-02 11:15:40.881	Sanna Khánh Hòa FC	178	DOMESTIC	72	SKH Academy DF 8 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
6357e566-aac1-4c8d-bf76-493b6d9e9d66	SKH Foreign DF 9	1997-10-10 00:00:00	Brazil	DF	2026-06-02 11:15:40.892	2026-06-02 11:15:40.892	Brazil	179	FOREIGN	73	SKH Foreign DF 9 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
1bc1ee5c-9e7d-4fb2-b4f0-b74422aa9358	SKH Academy MF 10	1998-11-11 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.898	2026-06-02 11:15:40.898	Sanna Khánh Hòa FC	180	DOMESTIC	74	SKH Academy MF 10 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
6e9e1c60-d9f6-4333-a77b-c920d344a8d7	SKH Academy MF 11	1999-12-12 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.912	2026-06-02 11:15:40.912	Sanna Khánh Hòa FC	181	DOMESTIC	75	SKH Academy MF 11 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
c94c1e93-d0f7-4cdf-a27b-396674d0862a	SKH Academy MF 12	2000-01-13 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.925	2026-06-02 11:15:40.925	Sanna Khánh Hòa FC	182	DOMESTIC	76	SKH Academy MF 12 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
1169cb14-ebd4-442c-8d4a-7a7f86958bf7	SKH Academy MF 13	2001-02-14 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.932	2026-06-02 11:15:40.932	Sanna Khánh Hòa FC	183	DOMESTIC	77	SKH Academy MF 13 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
d10d5eee-d834-4826-b130-cd9ba3a09111	SKH Academy MF 14	2002-03-15 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.952	2026-06-02 11:15:40.952	Sanna Khánh Hòa FC	184	DOMESTIC	78	SKH Academy MF 14 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
548a2c87-52c1-404f-a284-c3f6a6a8149d	SKH Academy MF 15	2003-04-16 00:00:00	Việt Nam	MF	2026-06-02 11:15:40.976	2026-06-02 11:15:40.976	Sanna Khánh Hòa FC	185	DOMESTIC	79	SKH Academy MF 15 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
453c8104-f588-4507-afe8-8d6d7e04008b	SKH Foreign MF 16	1996-05-17 00:00:00	Nigeria	MF	2026-06-02 11:15:41.012	2026-06-02 11:15:41.012	Nigeria	170	FOREIGN	80	SKH Foreign MF 16 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
75964202-f2f2-4cf4-9ebb-ff75fe7c5ae5	SKH Foreign MF 17	1997-06-18 00:00:00	Nigeria	MF	2026-06-02 11:15:41.039	2026-06-02 11:15:41.039	Nigeria	171	FOREIGN	81	SKH Foreign MF 17 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
20d22fe8-2a0d-412b-897f-45c9b4050f27	SKH Academy FW 18	1998-07-19 00:00:00	Việt Nam	FW	2026-06-02 11:15:41.071	2026-06-02 11:15:41.071	Sanna Khánh Hòa FC	172	DOMESTIC	64	SKH Academy FW 18 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
95fb29d2-81fb-43f4-a33f-5bc508fcb98e	SKH Academy FW 19	1999-08-20 00:00:00	Việt Nam	FW	2026-06-02 11:15:41.094	2026-06-02 11:15:41.094	Sanna Khánh Hòa FC	173	DOMESTIC	65	SKH Academy FW 19 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
be2ca5bb-c1e7-47eb-97f2-799171d4f9b6	SKH Academy FW 20	2000-09-21 00:00:00	Việt Nam	FW	2026-06-02 11:15:41.117	2026-06-02 11:15:41.117	Sanna Khánh Hòa FC	174	DOMESTIC	66	SKH Academy FW 20 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
9b673f4f-7e84-4189-b178-de03db479232	SKH Academy FW 21	2001-10-22 00:00:00	Việt Nam	FW	2026-06-02 11:15:41.14	2026-06-02 11:15:41.14	Sanna Khánh Hòa FC	175	DOMESTIC	67	SKH Academy FW 21 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
5b822f22-f904-420f-b27d-989b20ab9c90	SKH Foreign FW 22	2002-11-23 00:00:00	Brazil	FW	2026-06-02 11:15:41.172	2026-06-02 11:15:41.172	Brazil	176	FOREIGN	68	SKH Foreign FW 22 thuộc danh sách đăng ký demo của Sanna Khánh Hòa FC.
44a57381-9a32-47eb-a1e5-b7ac7930bde9	TNHCM Academy GK 1	1997-02-02 00:00:00	Việt Nam	GK	2026-06-02 11:15:41.262	2026-06-02 11:15:41.262	Thanh Niên TP Hồ Chí Minh FC	171	DOMESTIC	65	TNHCM Academy GK 1 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
27e0fe6e-ff68-4037-9958-9ad431c70743	TNHCM Academy GK 2	1998-03-03 00:00:00	Việt Nam	GK	2026-06-02 11:15:41.291	2026-06-02 11:15:41.291	Thanh Niên TP Hồ Chí Minh FC	172	DOMESTIC	66	TNHCM Academy GK 2 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
b5891723-34bc-4d26-a4a6-ffc21bc6098d	TNHCM Academy DF 3	1999-04-04 00:00:00	Việt Nam	DF	2026-06-02 11:15:41.313	2026-06-02 11:15:41.313	Thanh Niên TP Hồ Chí Minh FC	173	DOMESTIC	67	TNHCM Academy DF 3 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
da210168-d897-4d4c-8976-74fd5da637e5	TNHCM Academy DF 4	2000-05-05 00:00:00	Việt Nam	DF	2026-06-02 11:15:41.34	2026-06-02 11:15:41.34	Thanh Niên TP Hồ Chí Minh FC	174	DOMESTIC	68	TNHCM Academy DF 4 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
154c06fb-17c5-4afe-991a-80d6edb7293f	TNHCM Academy DF 5	2001-06-06 00:00:00	Việt Nam	DF	2026-06-02 11:15:41.352	2026-06-02 11:15:41.352	Thanh Niên TP Hồ Chí Minh FC	175	DOMESTIC	69	TNHCM Academy DF 5 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
2e868acb-916b-493e-8671-65355c057f1e	TNHCM Academy DF 6	2002-07-07 00:00:00	Việt Nam	DF	2026-06-02 11:15:41.371	2026-06-02 11:15:41.371	Thanh Niên TP Hồ Chí Minh FC	176	DOMESTIC	70	TNHCM Academy DF 6 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
29f5c580-d3c3-4f44-ab39-afe9695e6ea3	TNHCM Academy DF 7	2003-08-08 00:00:00	Việt Nam	DF	2026-06-02 11:15:41.414	2026-06-02 11:15:41.414	Thanh Niên TP Hồ Chí Minh FC	177	DOMESTIC	71	TNHCM Academy DF 7 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
7259f9a7-f6dc-4944-8ba3-392b01b4fc67	TNHCM Academy DF 8	1996-09-09 00:00:00	Việt Nam	DF	2026-06-02 11:15:41.456	2026-06-02 11:15:41.456	Thanh Niên TP Hồ Chí Minh FC	178	DOMESTIC	72	TNHCM Academy DF 8 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
bd0c801c-49bd-4e6a-a214-3c56700c9957	TNHCM Foreign DF 9	1997-10-10 00:00:00	Brazil	DF	2026-06-02 11:15:41.489	2026-06-02 11:15:41.489	Brazil	179	FOREIGN	73	TNHCM Foreign DF 9 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
b8ad528a-514d-4909-9df5-9113e6602dff	TNHCM Academy MF 10	1998-11-11 00:00:00	Việt Nam	MF	2026-06-02 11:15:41.523	2026-06-02 11:15:41.523	Thanh Niên TP Hồ Chí Minh FC	180	DOMESTIC	74	TNHCM Academy MF 10 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
0ea67e15-9257-40ae-ba44-151a71989a06	TNHCM Academy MF 11	1999-12-12 00:00:00	Việt Nam	MF	2026-06-02 11:15:41.555	2026-06-02 11:15:41.555	Thanh Niên TP Hồ Chí Minh FC	181	DOMESTIC	75	TNHCM Academy MF 11 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
66892360-1818-4050-a7c2-fc0c4d249641	TNHCM Academy MF 12	2000-01-13 00:00:00	Việt Nam	MF	2026-06-02 11:15:41.59	2026-06-02 11:15:41.59	Thanh Niên TP Hồ Chí Minh FC	182	DOMESTIC	76	TNHCM Academy MF 12 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
47d9bd8e-5b4a-44f9-8d9f-897e335411f3	TNHCM Academy MF 13	2001-02-14 00:00:00	Việt Nam	MF	2026-06-02 11:15:41.622	2026-06-02 11:15:41.622	Thanh Niên TP Hồ Chí Minh FC	183	DOMESTIC	77	TNHCM Academy MF 13 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
6f0a1ff0-1547-49b3-994f-db0caf4dcfa9	TNHCM Academy MF 14	2002-03-15 00:00:00	Việt Nam	MF	2026-06-02 11:15:41.652	2026-06-02 11:15:41.652	Thanh Niên TP Hồ Chí Minh FC	184	DOMESTIC	78	TNHCM Academy MF 14 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
f5d684e2-ac2b-4f76-86f3-3bd94ea23afc	TNHCM Academy MF 15	2003-04-16 00:00:00	Việt Nam	MF	2026-06-02 11:15:41.676	2026-06-02 11:15:41.676	Thanh Niên TP Hồ Chí Minh FC	185	DOMESTIC	79	TNHCM Academy MF 15 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
cf765b9d-6ae9-4622-bcc7-7a51a102254e	TNHCM Foreign MF 16	1996-05-17 00:00:00	Nigeria	MF	2026-06-02 11:15:41.698	2026-06-02 11:15:41.698	Nigeria	170	FOREIGN	80	TNHCM Foreign MF 16 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
04bc1615-52c1-4602-87e4-09667b7c9610	TNHCM Foreign MF 17	1997-06-18 00:00:00	Nigeria	MF	2026-06-02 11:15:41.725	2026-06-02 11:15:41.725	Nigeria	171	FOREIGN	81	TNHCM Foreign MF 17 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
f81166a4-659a-472c-b15c-9a8b6633b15f	TNHCM Academy FW 18	1998-07-19 00:00:00	Việt Nam	FW	2026-06-02 11:15:41.749	2026-06-02 11:15:41.749	Thanh Niên TP Hồ Chí Minh FC	172	DOMESTIC	64	TNHCM Academy FW 18 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
866a8335-6f78-47b3-b331-8c22ab5dc4d4	TNHCM Academy FW 19	1999-08-20 00:00:00	Việt Nam	FW	2026-06-02 11:15:41.782	2026-06-02 11:15:41.782	Thanh Niên TP Hồ Chí Minh FC	173	DOMESTIC	65	TNHCM Academy FW 19 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
33c2b628-0823-40a5-aaa9-d5be37789386	TNHCM Academy FW 20	2000-09-21 00:00:00	Việt Nam	FW	2026-06-02 11:15:41.826	2026-06-02 11:15:41.826	Thanh Niên TP Hồ Chí Minh FC	174	DOMESTIC	66	TNHCM Academy FW 20 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
d8cd9c50-2885-4ae8-b3c5-1b2f39484bcf	TNHCM Academy FW 21	2001-10-22 00:00:00	Việt Nam	FW	2026-06-02 11:15:41.859	2026-06-02 11:15:41.859	Thanh Niên TP Hồ Chí Minh FC	175	DOMESTIC	67	TNHCM Academy FW 21 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
d4a4b563-fab1-4277-a445-af8e4299dacd	TNHCM Foreign FW 22	2002-11-23 00:00:00	Brazil	FW	2026-06-02 11:15:41.892	2026-06-02 11:15:41.892	Brazil	176	FOREIGN	68	TNHCM Foreign FW 22 thuộc danh sách đăng ký demo của Thanh Niên TP Hồ Chí Minh FC.
ef67c7b7-aef0-4a9d-af7d-50965466011e	TTDN Academy GK 2	1998-03-03 00:00:00	Việt Nam	GK	2026-06-02 11:15:42.024	2026-06-02 11:15:42.024	Trường Tươi Đồng Nai	172	DOMESTIC	66	TTDN Academy GK 2 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
6b893640-69c6-4fac-9035-412298f532ac	TTDN Academy DF 3	1999-04-04 00:00:00	Việt Nam	DF	2026-06-02 11:15:42.058	2026-06-02 11:15:42.058	Trường Tươi Đồng Nai	173	DOMESTIC	67	TTDN Academy DF 3 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
f176673b-54f3-4793-9dbf-a2a4aabb9526	TTDN Academy DF 4	2000-05-05 00:00:00	Việt Nam	DF	2026-06-02 11:15:42.098	2026-06-02 11:15:42.098	Trường Tươi Đồng Nai	174	DOMESTIC	68	TTDN Academy DF 4 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
cc1e8d5a-d180-4c5b-b440-d411f4a733fd	TTDN Academy DF 5	2001-06-06 00:00:00	Việt Nam	DF	2026-06-02 11:15:42.138	2026-06-02 11:15:42.138	Trường Tươi Đồng Nai	175	DOMESTIC	69	TTDN Academy DF 5 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
e691dcf4-7d6d-46fe-af63-879d5c1dce8f	TTDN Academy DF 6	2002-07-07 00:00:00	Việt Nam	DF	2026-06-02 11:15:42.16	2026-06-02 11:15:42.16	Trường Tươi Đồng Nai	176	DOMESTIC	70	TTDN Academy DF 6 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
d236aef2-59d3-4d20-b8b6-490ee1f64111	TTDN Academy DF 7	2003-08-08 00:00:00	Việt Nam	DF	2026-06-02 11:15:42.192	2026-06-02 11:15:42.192	Trường Tươi Đồng Nai	177	DOMESTIC	71	TTDN Academy DF 7 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
d84df371-66f6-4842-963b-0b221edcee55	TTDN Academy DF 8	1996-09-09 00:00:00	Việt Nam	DF	2026-06-02 11:15:42.214	2026-06-02 11:15:42.214	Trường Tươi Đồng Nai	178	DOMESTIC	72	TTDN Academy DF 8 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
b9f8f85c-3a2c-4358-ae73-17f6d456d5a1	TTDN Foreign DF 9	1997-10-10 00:00:00	Brazil	DF	2026-06-02 11:15:42.236	2026-06-02 11:15:42.236	Brazil	179	FOREIGN	73	TTDN Foreign DF 9 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
6113739d-38e0-4849-9444-4c5f3f6495d7	TTDN Academy MF 10	1998-11-11 00:00:00	Việt Nam	MF	2026-06-02 11:15:42.256	2026-06-02 11:15:42.256	Trường Tươi Đồng Nai	180	DOMESTIC	74	TTDN Academy MF 10 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
77c8725d-c727-49dd-ae81-ac3a98791291	TTDN Academy MF 11	1999-12-12 00:00:00	Việt Nam	MF	2026-06-02 11:15:42.287	2026-06-02 11:15:42.287	Trường Tươi Đồng Nai	181	DOMESTIC	75	TTDN Academy MF 11 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
d1749321-89a1-4b45-a2fa-e8c0c0680fed	TTDN Academy MF 12	2000-01-13 00:00:00	Việt Nam	MF	2026-06-02 11:15:42.311	2026-06-02 11:15:42.311	Trường Tươi Đồng Nai	182	DOMESTIC	76	TTDN Academy MF 12 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
8f0c6f44-fa5f-4e17-8234-1a8ba6f0f9fd	TTDN Academy MF 13	2001-02-14 00:00:00	Việt Nam	MF	2026-06-02 11:15:42.318	2026-06-02 11:15:42.318	Trường Tươi Đồng Nai	183	DOMESTIC	77	TTDN Academy MF 13 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
36b9900f-c99f-43e1-bcde-6a83dde036de	TTDN Academy MF 14	2002-03-15 00:00:00	Việt Nam	MF	2026-06-02 11:15:42.325	2026-06-02 11:15:42.325	Trường Tươi Đồng Nai	184	DOMESTIC	78	TTDN Academy MF 14 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
ea601d18-5216-43b9-9ef7-015b18e80c1f	TTDN Academy MF 15	2003-04-16 00:00:00	Việt Nam	MF	2026-06-02 11:15:42.331	2026-06-02 11:15:42.331	Trường Tươi Đồng Nai	185	DOMESTIC	79	TTDN Academy MF 15 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
490319ef-16ea-4f53-9dd4-31adfa9ea3bd	TTDN Foreign MF 16	1996-05-17 00:00:00	Nigeria	MF	2026-06-02 11:15:42.348	2026-06-02 11:15:42.348	Nigeria	170	FOREIGN	80	TTDN Foreign MF 16 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
81d8e725-5128-4c19-9c6b-21a2b53c47cb	TTDN Foreign MF 17	1997-06-18 00:00:00	Nigeria	MF	2026-06-02 11:15:42.363	2026-06-02 11:15:42.363	Nigeria	171	FOREIGN	81	TTDN Foreign MF 17 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
d690dd3b-b00a-4d90-9063-07244e875b29	TTDN Academy FW 18	1998-07-19 00:00:00	Việt Nam	FW	2026-06-02 11:15:42.38	2026-06-02 11:15:42.38	Trường Tươi Đồng Nai	172	DOMESTIC	64	TTDN Academy FW 18 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
be4d921e-d8e1-4ec0-8968-90b026d4b10c	TTDN Academy FW 19	1999-08-20 00:00:00	Việt Nam	FW	2026-06-02 11:15:42.392	2026-06-02 11:15:42.392	Trường Tươi Đồng Nai	173	DOMESTIC	65	TTDN Academy FW 19 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
d1b34a3b-7c6d-4ce1-8133-e45c75310f3a	TTDN Academy FW 20	2000-09-21 00:00:00	Việt Nam	FW	2026-06-02 11:15:42.399	2026-06-02 11:15:42.399	Trường Tươi Đồng Nai	174	DOMESTIC	66	TTDN Academy FW 20 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
17e881b7-26c0-4d6f-a511-dbb5c94f5dc5	TTDN Academy FW 21	2001-10-22 00:00:00	Việt Nam	FW	2026-06-02 11:15:42.409	2026-06-02 11:15:42.409	Trường Tươi Đồng Nai	175	DOMESTIC	67	TTDN Academy FW 21 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
270ded75-2473-4605-8fd8-28b2d0d1be7f	TTDN Foreign FW 22	2002-11-23 00:00:00	Brazil	FW	2026-06-02 11:15:42.419	2026-06-02 11:15:42.419	Brazil	176	FOREIGN	68	TTDN Foreign FW 22 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
20f92b15-4f61-4f7d-bb28-e7a90e84fa89	PVF Academy GK 1	1997-02-02 00:00:00	Việt Nam	GK	2026-06-02 11:15:42.529	2026-06-02 11:15:42.529	Trẻ PVF CAND	171	DOMESTIC	65	PVF Academy GK 1 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
6ef3c8cb-33cd-4cbd-bb56-1820ee2c2c5a	PVF Academy GK 2	1998-03-03 00:00:00	Việt Nam	GK	2026-06-02 11:15:42.565	2026-06-02 11:15:42.565	Trẻ PVF CAND	172	DOMESTIC	66	PVF Academy GK 2 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
71c6373c-da12-45ec-9f49-a33612416ad8	PVF Academy DF 3	1999-04-04 00:00:00	Việt Nam	DF	2026-06-02 11:15:42.59	2026-06-02 11:15:42.59	Trẻ PVF CAND	173	DOMESTIC	67	PVF Academy DF 3 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
49110e14-c0a3-45aa-bac3-3c92a93e69ce	PVF Academy DF 4	2000-05-05 00:00:00	Việt Nam	DF	2026-06-02 11:15:42.613	2026-06-02 11:15:42.613	Trẻ PVF CAND	174	DOMESTIC	68	PVF Academy DF 4 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
9c94b743-2765-4806-84c0-dc15f56cb097	PVF Academy DF 5	2001-06-06 00:00:00	Việt Nam	DF	2026-06-02 11:15:42.636	2026-06-02 11:15:42.636	Trẻ PVF CAND	175	DOMESTIC	69	PVF Academy DF 5 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
1efcb023-28fb-400f-9d2b-3bb60ca025f8	PVF Academy DF 6	2002-07-07 00:00:00	Việt Nam	DF	2026-06-02 11:15:42.659	2026-06-02 11:15:42.659	Trẻ PVF CAND	176	DOMESTIC	70	PVF Academy DF 6 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
3fb9fadd-8296-413f-8da7-2ef2b653389d	PVF Academy DF 7	2003-08-08 00:00:00	Việt Nam	DF	2026-06-02 11:15:42.686	2026-06-02 11:15:42.686	Trẻ PVF CAND	177	DOMESTIC	71	PVF Academy DF 7 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
1a086f59-119f-4847-ac85-d97956b717ce	PVF Academy DF 8	1996-09-09 00:00:00	Việt Nam	DF	2026-06-02 11:15:42.708	2026-06-02 11:15:42.708	Trẻ PVF CAND	178	DOMESTIC	72	PVF Academy DF 8 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
18f5012f-2db2-4420-b3b7-d20ca49fc91d	PVF Foreign DF 9	1997-10-10 00:00:00	Brazil	DF	2026-06-02 11:15:42.732	2026-06-02 11:15:42.732	Brazil	179	FOREIGN	73	PVF Foreign DF 9 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
0a9ab0af-4a31-4e82-acef-faa0084edcb6	PVF Academy MF 10	1998-11-11 00:00:00	Việt Nam	MF	2026-06-02 11:15:42.755	2026-06-02 11:15:42.755	Trẻ PVF CAND	180	DOMESTIC	74	PVF Academy MF 10 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
c63720ce-da71-4aca-a43e-f2293df85484	PVF Academy MF 11	1999-12-12 00:00:00	Việt Nam	MF	2026-06-02 11:15:42.777	2026-06-02 11:15:42.777	Trẻ PVF CAND	181	DOMESTIC	75	PVF Academy MF 11 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
4ebd60d0-2be5-4ed4-bd86-dfb98659316b	PVF Academy MF 12	2000-01-13 00:00:00	Việt Nam	MF	2026-06-02 11:15:42.798	2026-06-02 11:15:42.798	Trẻ PVF CAND	182	DOMESTIC	76	PVF Academy MF 12 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
c9655bec-0ab1-41ac-a5fc-261788c240d3	PVF Academy MF 13	2001-02-14 00:00:00	Việt Nam	MF	2026-06-02 11:15:42.82	2026-06-02 11:15:42.82	Trẻ PVF CAND	183	DOMESTIC	77	PVF Academy MF 13 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
ec434b4d-416c-40e7-bc17-b65ca576a873	PVF Academy MF 14	2002-03-15 00:00:00	Việt Nam	MF	2026-06-02 11:15:42.841	2026-06-02 11:15:42.841	Trẻ PVF CAND	184	DOMESTIC	78	PVF Academy MF 14 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
ca5b61d5-516e-44b2-b91a-f435cd5ca8f8	PVF Academy MF 15	2003-04-16 00:00:00	Việt Nam	MF	2026-06-02 11:15:42.863	2026-06-02 11:15:42.863	Trẻ PVF CAND	185	DOMESTIC	79	PVF Academy MF 15 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
d2c50be5-366d-4fbd-9727-fa2b1dd87519	PVF Foreign MF 16	1996-05-17 00:00:00	Nigeria	MF	2026-06-02 11:15:42.887	2026-06-02 11:15:42.887	Nigeria	170	FOREIGN	80	PVF Foreign MF 16 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
49832289-0a10-499a-ab3c-047152adbf7b	PVF Foreign MF 17	1997-06-18 00:00:00	Nigeria	MF	2026-06-02 11:15:42.909	2026-06-02 11:15:42.909	Nigeria	171	FOREIGN	81	PVF Foreign MF 17 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
097703f4-aef3-4f53-9698-b52388c91b28	PVF Academy FW 18	1998-07-19 00:00:00	Việt Nam	FW	2026-06-02 11:15:42.931	2026-06-02 11:15:42.931	Trẻ PVF CAND	172	DOMESTIC	64	PVF Academy FW 18 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
e1d9e0e8-e498-470f-94bf-3b35d7d4fca4	PVF Academy FW 19	1999-08-20 00:00:00	Việt Nam	FW	2026-06-02 11:15:42.954	2026-06-02 11:15:42.954	Trẻ PVF CAND	173	DOMESTIC	65	PVF Academy FW 19 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
2fd625ab-ed34-44f6-80a8-470803b20fb6	PVF Academy FW 20	2000-09-21 00:00:00	Việt Nam	FW	2026-06-02 11:15:42.978	2026-06-02 11:15:42.978	Trẻ PVF CAND	174	DOMESTIC	66	PVF Academy FW 20 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
0c32f6fd-4f23-4da5-9b30-11fe7efeecaa	PVF Academy FW 21	2001-10-22 00:00:00	Việt Nam	FW	2026-06-02 11:15:43.001	2026-06-02 11:15:43.001	Trẻ PVF CAND	175	DOMESTIC	67	PVF Academy FW 21 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
4e8f6a9c-cc0b-4459-9127-5b23eb0a9fc2	PVF Foreign FW 22	2002-11-23 00:00:00	Brazil	FW	2026-06-02 11:15:43.023	2026-06-02 11:15:43.023	Brazil	176	FOREIGN	68	PVF Foreign FW 22 thuộc danh sách đăng ký demo của Trẻ PVF CAND.
e8004612-48c4-419b-a310-8386ac0bde90	PT Academy GK 2	1998-03-03 00:00:00	Việt Nam	GK	2026-06-02 11:15:43.153	2026-06-02 11:15:43.153	Xuân Thiện Phú Thọ FC	172	DOMESTIC	66	PT Academy GK 2 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
b4f07604-c273-4c4c-b862-b543b440b307	PT Academy DF 3	1999-04-04 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.175	2026-06-02 11:15:43.175	Xuân Thiện Phú Thọ FC	173	DOMESTIC	67	PT Academy DF 3 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
d8795277-200e-4a8a-8c60-f5bdef0b7800	PT Academy DF 4	2000-05-05 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.197	2026-06-02 11:15:43.197	Xuân Thiện Phú Thọ FC	174	DOMESTIC	68	PT Academy DF 4 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
cf713531-03f8-450e-be8c-3a9d41cf0039	PT Academy DF 5	2001-06-06 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.238	2026-06-02 11:15:43.238	Xuân Thiện Phú Thọ FC	175	DOMESTIC	69	PT Academy DF 5 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
527527d8-401a-4118-adb8-b6b6520743f7	PT Academy DF 6	2002-07-07 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.27	2026-06-02 11:15:43.27	Xuân Thiện Phú Thọ FC	176	DOMESTIC	70	PT Academy DF 6 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
161543cf-d8cf-41ca-bf81-4276a01dfbb9	PT Academy DF 7	2003-08-08 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.309	2026-06-02 11:15:43.309	Xuân Thiện Phú Thọ FC	177	DOMESTIC	71	PT Academy DF 7 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
fd3222cc-dd75-4932-ba8f-900686e1c0f8	PT Academy DF 8	1996-09-09 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.331	2026-06-02 11:15:43.331	Xuân Thiện Phú Thọ FC	178	DOMESTIC	72	PT Academy DF 8 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
e50a983b-9737-412d-b920-02791f950049	PT Foreign DF 9	1997-10-10 00:00:00	Brazil	DF	2026-06-02 11:15:43.354	2026-06-02 11:15:43.354	Brazil	179	FOREIGN	73	PT Foreign DF 9 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
389ae91a-58ef-4fb2-ac0a-e416c63e64a2	PT Academy MF 10	1998-11-11 00:00:00	Việt Nam	MF	2026-06-02 11:15:43.376	2026-06-02 11:15:43.376	Xuân Thiện Phú Thọ FC	180	DOMESTIC	74	PT Academy MF 10 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
088f7b48-45d7-458f-a774-49901c1311d4	PT Academy MF 11	1999-12-12 00:00:00	Việt Nam	MF	2026-06-02 11:15:43.391	2026-06-02 11:15:43.391	Xuân Thiện Phú Thọ FC	181	DOMESTIC	75	PT Academy MF 11 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
99b3d90d-c984-4a18-81a5-4fccd11f4fa5	PT Academy MF 12	2000-01-13 00:00:00	Việt Nam	MF	2026-06-02 11:15:43.396	2026-06-02 11:15:43.396	Xuân Thiện Phú Thọ FC	182	DOMESTIC	76	PT Academy MF 12 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
8c8a4f03-1751-4566-acc8-c573d44515c4	PT Academy MF 13	2001-02-14 00:00:00	Việt Nam	MF	2026-06-02 11:15:43.403	2026-06-02 11:15:43.403	Xuân Thiện Phú Thọ FC	183	DOMESTIC	77	PT Academy MF 13 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
a6d451a4-e3d4-4476-982d-c63eb154d308	PT Academy MF 14	2002-03-15 00:00:00	Việt Nam	MF	2026-06-02 11:15:43.408	2026-06-02 11:15:43.408	Xuân Thiện Phú Thọ FC	184	DOMESTIC	78	PT Academy MF 14 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
b6e87068-680c-4e89-a123-8bcef5ce1db4	PT Academy MF 15	2003-04-16 00:00:00	Việt Nam	MF	2026-06-02 11:15:43.414	2026-06-02 11:15:43.414	Xuân Thiện Phú Thọ FC	185	DOMESTIC	79	PT Academy MF 15 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
e55e9c67-a9f9-4aef-99f6-3c3b3ceb6ce9	PT Foreign MF 16	1996-05-17 00:00:00	Nigeria	MF	2026-06-02 11:15:43.43	2026-06-02 11:15:43.43	Nigeria	170	FOREIGN	80	PT Foreign MF 16 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
be43e627-9978-4944-82e2-a630f477b104	PT Foreign MF 17	1997-06-18 00:00:00	Nigeria	MF	2026-06-02 11:15:43.463	2026-06-02 11:15:43.463	Nigeria	171	FOREIGN	81	PT Foreign MF 17 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
ed9a94ed-0237-44b5-b951-9486e2f5d215	PT Academy FW 18	1998-07-19 00:00:00	Việt Nam	FW	2026-06-02 11:15:43.485	2026-06-02 11:15:43.485	Xuân Thiện Phú Thọ FC	172	DOMESTIC	64	PT Academy FW 18 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
7d1d7e50-0e0d-4999-b254-0a7203dbf72e	PT Academy FW 19	1999-08-20 00:00:00	Việt Nam	FW	2026-06-02 11:15:43.502	2026-06-02 11:15:43.502	Xuân Thiện Phú Thọ FC	173	DOMESTIC	65	PT Academy FW 19 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
028e5745-b80b-4934-b2e9-822e38716365	DT Academy MF 12	2000-01-13 00:00:00	Việt Nam	MF	2026-06-02 11:15:44.115	2026-06-02 11:15:44.115	Đồng Tháp FC	182	DOMESTIC	76	DT Academy MF 12 thuộc danh sách đăng ký demo của Đồng Tháp FC.
a2ed25ab-253e-42b6-99ba-463a48ba9253	PT Academy FW 20	2000-09-21 00:00:00	Việt Nam	FW	2026-06-02 11:15:43.519	2026-06-02 11:15:43.519	Xuân Thiện Phú Thọ FC	174	DOMESTIC	66	PT Academy FW 20 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
38518774-db66-401b-8679-e2994581f86a	PT Academy FW 21	2001-10-22 00:00:00	Việt Nam	FW	2026-06-02 11:15:43.528	2026-06-02 11:15:43.528	Xuân Thiện Phú Thọ FC	175	DOMESTIC	67	PT Academy FW 21 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
6174eb6e-ca5f-44c5-ae0b-be7dce92ec83	PT Foreign FW 22	2002-11-23 00:00:00	Brazil	FW	2026-06-02 11:15:43.537	2026-06-02 11:15:43.537	Brazil	176	FOREIGN	68	PT Foreign FW 22 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
47fe421f-a2cb-4d81-81a9-b116d19d5237	VHU Academy GK 1	1997-02-02 00:00:00	Việt Nam	GK	2026-06-02 11:15:43.587	2026-06-02 11:15:43.587	Đại học Văn Hiến FC	171	DOMESTIC	65	VHU Academy GK 1 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
1c1aaf18-7ac9-457b-9366-b02b51935448	VHU Academy GK 2	1998-03-03 00:00:00	Việt Nam	GK	2026-06-02 11:15:43.615	2026-06-02 11:15:43.615	Đại học Văn Hiến FC	172	DOMESTIC	66	VHU Academy GK 2 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
56be21cf-7f79-4533-a3a3-fd297aad02f6	VHU Academy DF 3	1999-04-04 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.639	2026-06-02 11:15:43.639	Đại học Văn Hiến FC	173	DOMESTIC	67	VHU Academy DF 3 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
1b4015e3-5749-4192-99cb-0e3f1eb5d83a	VHU Academy DF 4	2000-05-05 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.646	2026-06-02 11:15:43.646	Đại học Văn Hiến FC	174	DOMESTIC	68	VHU Academy DF 4 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
f381d450-6e67-410e-b932-ac180c4d0083	VHU Academy DF 5	2001-06-06 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.655	2026-06-02 11:15:43.655	Đại học Văn Hiến FC	175	DOMESTIC	69	VHU Academy DF 5 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
47cf0a86-b72e-4c24-8161-a12498c32294	VHU Academy DF 6	2002-07-07 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.67	2026-06-02 11:15:43.67	Đại học Văn Hiến FC	176	DOMESTIC	70	VHU Academy DF 6 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
04707ddf-1049-4e9a-97f6-05365507539e	VHU Academy DF 7	2003-08-08 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.686	2026-06-02 11:15:43.686	Đại học Văn Hiến FC	177	DOMESTIC	71	VHU Academy DF 7 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
89a0721e-9a48-471a-a188-bc0a056ca571	VHU Academy DF 8	1996-09-09 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.694	2026-06-02 11:15:43.694	Đại học Văn Hiến FC	178	DOMESTIC	72	VHU Academy DF 8 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
8471639e-015a-4d02-b2bb-17794040912b	VHU Foreign DF 9	1997-10-10 00:00:00	Brazil	DF	2026-06-02 11:15:43.701	2026-06-02 11:15:43.701	Brazil	179	FOREIGN	73	VHU Foreign DF 9 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
b61564ef-47a1-4f64-ac04-ab713c0ffb6a	VHU Academy MF 10	1998-11-11 00:00:00	Việt Nam	MF	2026-06-02 11:15:43.708	2026-06-02 11:15:43.708	Đại học Văn Hiến FC	180	DOMESTIC	74	VHU Academy MF 10 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
23f80bd8-70df-4b27-bbff-581a04dcde2c	VHU Academy MF 11	1999-12-12 00:00:00	Việt Nam	MF	2026-06-02 11:15:43.716	2026-06-02 11:15:43.716	Đại học Văn Hiến FC	181	DOMESTIC	75	VHU Academy MF 11 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
bb4ca178-5144-476f-8edd-e3ae122a522e	VHU Academy MF 12	2000-01-13 00:00:00	Việt Nam	MF	2026-06-02 11:15:43.725	2026-06-02 11:15:43.725	Đại học Văn Hiến FC	182	DOMESTIC	76	VHU Academy MF 12 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
1b3b2aa7-ce4f-4491-b67b-c98a2a5477da	VHU Academy MF 13	2001-02-14 00:00:00	Việt Nam	MF	2026-06-02 11:15:43.732	2026-06-02 11:15:43.732	Đại học Văn Hiến FC	183	DOMESTIC	77	VHU Academy MF 13 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
d819b7d2-a0b5-48a6-83bd-49593d1970f9	VHU Academy MF 14	2002-03-15 00:00:00	Việt Nam	MF	2026-06-02 11:15:43.751	2026-06-02 11:15:43.751	Đại học Văn Hiến FC	184	DOMESTIC	78	VHU Academy MF 14 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
901ac6ab-66f2-4f5e-8e39-927556bcf961	VHU Academy MF 15	2003-04-16 00:00:00	Việt Nam	MF	2026-06-02 11:15:43.758	2026-06-02 11:15:43.758	Đại học Văn Hiến FC	185	DOMESTIC	79	VHU Academy MF 15 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
23f3409d-1c00-4726-85d7-3d560ac0c5af	VHU Foreign MF 16	1996-05-17 00:00:00	Nigeria	MF	2026-06-02 11:15:43.764	2026-06-02 11:15:43.764	Nigeria	170	FOREIGN	80	VHU Foreign MF 16 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
9228c785-f4b9-4f98-b305-ea8417d1fbf5	VHU Foreign MF 17	1997-06-18 00:00:00	Nigeria	MF	2026-06-02 11:15:43.771	2026-06-02 11:15:43.771	Nigeria	171	FOREIGN	81	VHU Foreign MF 17 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
adac649b-0a5d-478e-a5b5-9201ed46acde	VHU Academy FW 18	1998-07-19 00:00:00	Việt Nam	FW	2026-06-02 11:15:43.778	2026-06-02 11:15:43.778	Đại học Văn Hiến FC	172	DOMESTIC	64	VHU Academy FW 18 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
44a63603-707a-4e81-8346-8d4f04df323b	VHU Academy FW 19	1999-08-20 00:00:00	Việt Nam	FW	2026-06-02 11:15:43.785	2026-06-02 11:15:43.785	Đại học Văn Hiến FC	173	DOMESTIC	65	VHU Academy FW 19 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
816dcc60-beed-429b-a76a-74e5c72192cb	VHU Academy FW 20	2000-09-21 00:00:00	Việt Nam	FW	2026-06-02 11:15:43.792	2026-06-02 11:15:43.792	Đại học Văn Hiến FC	174	DOMESTIC	66	VHU Academy FW 20 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
4b4c5357-d369-4d53-9e14-2ffbbaa7453e	VHU Academy FW 21	2001-10-22 00:00:00	Việt Nam	FW	2026-06-02 11:15:43.8	2026-06-02 11:15:43.8	Đại học Văn Hiến FC	175	DOMESTIC	67	VHU Academy FW 21 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
f532de2b-7181-4248-a3a8-5e1a23a2b90b	VHU Foreign FW 22	2002-11-23 00:00:00	Brazil	FW	2026-06-02 11:15:43.806	2026-06-02 11:15:43.806	Brazil	176	FOREIGN	68	VHU Foreign FW 22 thuộc danh sách đăng ký demo của Đại học Văn Hiến FC.
58a56ed1-c2ae-4629-a7dd-8f03a66605b1	DT Academy GK 1	1997-02-02 00:00:00	Việt Nam	GK	2026-06-02 11:15:43.872	2026-06-02 11:15:43.872	Đồng Tháp FC	171	DOMESTIC	65	DT Academy GK 1 thuộc danh sách đăng ký demo của Đồng Tháp FC.
e026e3ef-a4e7-4a83-b9f0-4332590d9520	DT Academy GK 2	1998-03-03 00:00:00	Việt Nam	GK	2026-06-02 11:15:43.892	2026-06-02 11:15:43.892	Đồng Tháp FC	172	DOMESTIC	66	DT Academy GK 2 thuộc danh sách đăng ký demo của Đồng Tháp FC.
d5506a01-1cca-4d40-9b61-056843d231a4	DT Academy DF 3	1999-04-04 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.908	2026-06-02 11:15:43.908	Đồng Tháp FC	173	DOMESTIC	67	DT Academy DF 3 thuộc danh sách đăng ký demo của Đồng Tháp FC.
5e6dc45c-4355-4c25-99ef-f67c17e60d84	DT Academy DF 4	2000-05-05 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.945	2026-06-02 11:15:43.945	Đồng Tháp FC	174	DOMESTIC	68	DT Academy DF 4 thuộc danh sách đăng ký demo của Đồng Tháp FC.
266249e1-1f57-4f70-afa6-021b10c63a56	DT Academy DF 5	2001-06-06 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.969	2026-06-02 11:15:43.969	Đồng Tháp FC	175	DOMESTIC	69	DT Academy DF 5 thuộc danh sách đăng ký demo của Đồng Tháp FC.
3d46469d-47ae-4095-85d9-3b8773bb12f0	DT Academy DF 6	2002-07-07 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.977	2026-06-02 11:15:43.977	Đồng Tháp FC	176	DOMESTIC	70	DT Academy DF 6 thuộc danh sách đăng ký demo của Đồng Tháp FC.
9fa7fe3d-26c4-4baa-91d8-10a6c6411698	DT Academy DF 7	2003-08-08 00:00:00	Việt Nam	DF	2026-06-02 11:15:43.99	2026-06-02 11:15:43.99	Đồng Tháp FC	177	DOMESTIC	71	DT Academy DF 7 thuộc danh sách đăng ký demo của Đồng Tháp FC.
b76c02b5-7b22-4cc8-ae85-2615ea01f766	DT Academy DF 8	1996-09-09 00:00:00	Việt Nam	DF	2026-06-02 11:15:44.025	2026-06-02 11:15:44.025	Đồng Tháp FC	178	DOMESTIC	72	DT Academy DF 8 thuộc danh sách đăng ký demo của Đồng Tháp FC.
4568bee7-d107-41b1-8795-63757139f47d	DT Foreign DF 9	1997-10-10 00:00:00	Brazil	DF	2026-06-02 11:15:44.06	2026-06-02 11:15:44.06	Brazil	179	FOREIGN	73	DT Foreign DF 9 thuộc danh sách đăng ký demo của Đồng Tháp FC.
d9496bce-4335-4a2c-a950-c6613dae1c41	DT Academy MF 10	1998-11-11 00:00:00	Việt Nam	MF	2026-06-02 11:15:44.082	2026-06-02 11:15:44.082	Đồng Tháp FC	180	DOMESTIC	74	DT Academy MF 10 thuộc danh sách đăng ký demo của Đồng Tháp FC.
206cd43a-488d-4ddd-9ab5-970312f40dc2	DT Academy MF 11	1999-12-12 00:00:00	Việt Nam	MF	2026-06-02 11:15:44.108	2026-06-02 11:15:44.108	Đồng Tháp FC	181	DOMESTIC	75	DT Academy MF 11 thuộc danh sách đăng ký demo của Đồng Tháp FC.
3e69a5bf-4ae2-4a62-b0db-79cf581fca20	DT Academy MF 13	2001-02-14 00:00:00	Việt Nam	MF	2026-06-02 11:15:44.126	2026-06-02 11:15:44.126	Đồng Tháp FC	183	DOMESTIC	77	DT Academy MF 13 thuộc danh sách đăng ký demo của Đồng Tháp FC.
d3468927-fcfa-42bf-83af-9f4db6f89f09	DT Academy MF 14	2002-03-15 00:00:00	Việt Nam	MF	2026-06-02 11:15:44.132	2026-06-02 11:15:44.132	Đồng Tháp FC	184	DOMESTIC	78	DT Academy MF 14 thuộc danh sách đăng ký demo của Đồng Tháp FC.
f7afafc9-7aca-499b-a0f7-259a9281a683	DT Academy MF 15	2003-04-16 00:00:00	Việt Nam	MF	2026-06-02 11:15:44.149	2026-06-02 11:15:44.149	Đồng Tháp FC	185	DOMESTIC	79	DT Academy MF 15 thuộc danh sách đăng ký demo của Đồng Tháp FC.
f827dbb5-aaae-402d-bbf0-d79389d780c7	DT Foreign MF 16	1996-05-17 00:00:00	Nigeria	MF	2026-06-02 11:15:44.173	2026-06-02 11:15:44.173	Nigeria	170	FOREIGN	80	DT Foreign MF 16 thuộc danh sách đăng ký demo của Đồng Tháp FC.
19b4c718-38df-42b1-8abc-aaf7dfa8d57f	DT Foreign MF 17	1997-06-18 00:00:00	Nigeria	MF	2026-06-02 11:15:44.195	2026-06-02 11:15:44.195	Nigeria	171	FOREIGN	81	DT Foreign MF 17 thuộc danh sách đăng ký demo của Đồng Tháp FC.
a8ba6643-a896-46ce-9e7a-59b838b09d28	DT Academy FW 18	1998-07-19 00:00:00	Việt Nam	FW	2026-06-02 11:15:44.217	2026-06-02 11:15:44.217	Đồng Tháp FC	172	DOMESTIC	64	DT Academy FW 18 thuộc danh sách đăng ký demo của Đồng Tháp FC.
1ad12fa6-c425-4e5f-b37b-2aea5fff5932	DT Academy FW 19	1999-08-20 00:00:00	Việt Nam	FW	2026-06-02 11:15:44.239	2026-06-02 11:15:44.239	Đồng Tháp FC	173	DOMESTIC	65	DT Academy FW 19 thuộc danh sách đăng ký demo của Đồng Tháp FC.
3c9064d4-8485-4db6-ba01-56ff3361be65	DT Academy FW 20	2000-09-21 00:00:00	Việt Nam	FW	2026-06-02 11:15:44.261	2026-06-02 11:15:44.261	Đồng Tháp FC	174	DOMESTIC	66	DT Academy FW 20 thuộc danh sách đăng ký demo của Đồng Tháp FC.
d520bafc-b2d4-4134-b6cc-02b723a2b481	DT Academy FW 21	2001-10-22 00:00:00	Việt Nam	FW	2026-06-02 11:15:44.284	2026-06-02 11:15:44.284	Đồng Tháp FC	175	DOMESTIC	67	DT Academy FW 21 thuộc danh sách đăng ký demo của Đồng Tháp FC.
86446010-358b-46c2-bc24-35164ff40dcf	DT Foreign FW 22	2002-11-23 00:00:00	Brazil	FW	2026-06-02 11:15:44.308	2026-06-02 11:15:44.308	Brazil	176	FOREIGN	68	DT Foreign FW 22 thuộc danh sách đăng ký demo của Đồng Tháp FC.
7ea02a8f-54a9-421c-965b-bb4b97407fee	PVF Rule Case Player 23	2005-12-24 00:00:00	Viet Nam	FW	2026-06-02 11:15:48.257	2026-06-02 11:15:48.257	Hưng Yên	181	DOMESTIC	73	PVF Rule Case Player 23 is generated for invitation rule testing.
ada6bd22-7476-4c9c-a598-71b7362342e5	TTDN Rule Case 45yo	1981-06-02 00:00:00	Viet Nam	GK	2026-06-02 11:15:42	2026-06-02 11:15:48.285	Đồng Nai	171	DOMESTIC	65	TTDN Academy GK 1 thuộc danh sách đăng ký demo của Trường Tươi Đồng Nai.
cc72af5c-a7a9-40a9-b9a5-651d379d9369	PT Rule Case 9yo	2017-06-02 00:00:00	Viet Nam	GK	2026-06-02 11:15:43.113	2026-06-02 11:15:48.292	Phú Thọ	171	DOMESTIC	65	PT Academy GK 1 thuộc danh sách đăng ký demo của Xuân Thiện Phú Thọ FC.
\.


--
-- Data for Name: promotion_candidates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotion_candidates (id, season_id, team_id, rank, source_competition, qualification_type, status, note, created_at, updated_at) FROM stdin;
3bea14cd-5963-4bf9-ac56-bd6663ab397f	8d447186-52eb-472a-a97a-d721be7936d6	3424bc38-f674-4378-a88c-1c9ec5b9a77c	1	V.League 2 2024	CHAMPION	ACCEPTED	Vô địch V.League 2 2024	2026-06-02 11:15:27.973	2026-06-02 11:15:27.973
77a4aafa-70a2-43c7-aef6-e4cfdc98fb48	8d447186-52eb-472a-a97a-d721be7936d6	655df04f-5508-45f3-8032-fd657a753360	2	V.League 2 2024	RUNNER_UP	ACCEPTED	Á quân V.League 2 2024	2026-06-02 11:15:27.985	2026-06-02 11:15:27.985
838b38d9-77a1-476a-9aeb-fa75a265a28f	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	1	V.League 2 2025-26	CHAMPION	ELIGIBLE	Vô địch V.League 2 2025-26	2026-06-02 11:15:39.998	2026-06-02 11:15:51.016
a18152ad-68e5-474e-b041-9b4613a2cd5e	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	2	V.League 2 2025-26	RUNNER_UP	ELIGIBLE	Á quân V.League 2 2025-26	2026-06-02 11:15:40.258	2026-06-02 11:15:51.067
dca9b800-15b2-40ec-837f-31f45659a5f3	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	812bcf01-a79f-4d7c-971a-68d2f79dedbf	3	V.League 2 2025-26	PLAYOFF	ELIGIBLE	Suất play-off V.League 2 2025-26	2026-06-02 11:15:40.514	2026-06-02 11:15:51.115
05547212-1ef7-4571-af8e-fd24e8722715	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	bbaf22f6-6fd6-4198-a731-2293dff5361f	4	V.League 2 2025-26	REPLACEMENT_POOL	ELIGIBLE	Danh sách dự phòng thăng hạng	2026-06-02 11:15:40.747	2026-06-02 11:15:51.17
abb6df1b-465c-4f35-941a-de87b8bc2c3f	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	3abf3147-a30b-45a7-801d-0d494314736f	5	V.League 2 2025-26	REPLACEMENT_POOL	ELIGIBLE	Danh sách dự phòng thăng hạng	2026-06-02 11:15:41.221	2026-06-02 11:15:51.227
2a3adb35-e20e-4ddf-8fb1-04165e40ad3a	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	c4488d60-4eb1-49af-b503-1bce07a2548e	6	V.League 2 2025-26	REPLACEMENT_POOL	ELIGIBLE	Danh sách dự phòng thăng hạng	2026-06-02 11:15:41.959	2026-06-02 11:15:51.285
e8faac53-c65c-4f79-9256-69f1d44bae9b	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	3979babb-d543-4433-92e8-e2fc59ea6ae6	7	V.League 2 2025-26	REPLACEMENT_POOL	ELIGIBLE	Danh sách dự phòng thăng hạng	2026-06-02 11:15:42.487	2026-06-02 11:15:51.341
0df617de-26a0-4edb-84f8-78e0db2dc01c	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	171c9c8d-b7f6-4831-bc9a-1e33ef451497	8	V.League 2 2025-26	REPLACEMENT_POOL	ELIGIBLE	Danh sách dự phòng thăng hạng	2026-06-02 11:15:43.076	2026-06-02 11:15:51.395
273edff1-bdfb-484f-a3b8-ed23510e4d26	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	9	V.League 2 2025-26	REPLACEMENT_POOL	ELIGIBLE	Danh sách dự phòng thăng hạng	2026-06-02 11:15:43.556	2026-06-02 11:15:51.451
02b743bf-997c-4cc9-b5c5-e4ba26c721f5	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	7ac6674c-a0a6-444e-854b-65bc7a85772d	10	V.League 2 2025-26	REPLACEMENT_POOL	ELIGIBLE	Danh sách dự phòng thăng hạng	2026-06-02 11:15:43.838	2026-06-02 11:15:51.517
c5c3098f-0085-4901-842a-fd7708bbeddf	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	11	V.League 2 2025-26	REPLACEMENT_POOL	ELIGIBLE	Danh sách dự phòng thăng hạng	2026-06-02 11:15:44.382	2026-06-02 11:15:51.575
\.


--
-- Data for Name: regulations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.regulations (id, season_id, key, value, value_type, created_at, updated_at) FROM stdin;
c2681cd4-786b-4dfd-977d-b065c69fbd9e	8d447186-52eb-472a-a97a-d721be7936d6	MIN_AGE	16	number	2026-06-02 11:15:27.083	2026-06-02 11:15:27.083
a7a32b33-cdb4-4297-a7e9-19a30e25dbfc	8d447186-52eb-472a-a97a-d721be7936d6	MAX_AGE	40	number	2026-06-02 11:15:27.095	2026-06-02 11:15:27.095
adb93a78-ff1c-4700-8f79-9ab6e43c422f	8d447186-52eb-472a-a97a-d721be7936d6	MIN_ROSTER	16	number	2026-06-02 11:15:27.106	2026-06-02 11:15:27.106
845b6ea1-b358-4b76-981f-b0ce9533a6d1	8d447186-52eb-472a-a97a-d721be7936d6	MAX_ROSTER	22	number	2026-06-02 11:15:27.118	2026-06-02 11:15:27.118
32792e42-bf12-43d5-8134-faa609e7f814	8d447186-52eb-472a-a97a-d721be7936d6	MAX_FOREIGN_PLAYERS	5	number	2026-06-02 11:15:27.128	2026-06-02 11:15:27.128
42552c81-a1c2-424f-bdd6-b4bfd3f0be5e	8d447186-52eb-472a-a97a-d721be7936d6	MAX_FOREIGN_PLAYERS_ON_FIELD	3	number	2026-06-02 11:15:27.139	2026-06-02 11:15:27.139
17d78eb2-42e4-4fae-a08d-80ec2286cc1f	8d447186-52eb-472a-a97a-d721be7936d6	MIN_STADIUM_CAPACITY	10000	number	2026-06-02 11:15:27.151	2026-06-02 11:15:27.151
642021f0-5697-4754-9e82-d06d1703d57c	8d447186-52eb-472a-a97a-d721be7936d6	MIN_STADIUM_FIFA_STARS	2	number	2026-06-02 11:15:27.162	2026-06-02 11:15:27.162
fb174ec3-1960-466f-96d5-df757cf99fc3	8d447186-52eb-472a-a97a-d721be7936d6	PARTICIPATION_FEE_VND	1000000000	number	2026-06-02 11:15:27.167	2026-06-02 11:15:27.167
19fbac19-aeab-4637-bc9c-fd900ba0a3e9	8d447186-52eb-472a-a97a-d721be7936d6	WIN_POINTS	3	number	2026-06-02 11:15:27.179	2026-06-02 11:15:27.179
4b60a832-666d-4acb-b4d3-54422b23425a	8d447186-52eb-472a-a97a-d721be7936d6	DRAW_POINTS	1	number	2026-06-02 11:15:27.19	2026-06-02 11:15:27.19
90ec2b46-e87a-4055-8431-e99aa409f173	8d447186-52eb-472a-a97a-d721be7936d6	LOSS_POINTS	0	number	2026-06-02 11:15:27.214	2026-06-02 11:15:27.214
a143aa31-8324-4279-a9a6-923ccb242fc9	8d447186-52eb-472a-a97a-d721be7936d6	MAX_GOAL_TIME	96	number	2026-06-02 11:15:27.234	2026-06-02 11:15:27.234
ea97f944-046b-4978-85da-a0b81d5d28e6	0c9d20cf-500b-4ff6-8822-cd1819c0297e	MIN_AGE	16	number	2026-06-02 11:15:37.627	2026-06-02 11:15:37.627
47f47b76-bec1-480c-8848-fdae58db03e1	0c9d20cf-500b-4ff6-8822-cd1819c0297e	MAX_AGE	40	number	2026-06-02 11:15:37.647	2026-06-02 11:15:37.647
3a3f5fba-f47d-4e6b-ac55-428aecf500c4	0c9d20cf-500b-4ff6-8822-cd1819c0297e	MIN_ROSTER	16	number	2026-06-02 11:15:37.658	2026-06-02 11:15:37.658
a06664bd-cdd4-44b4-b976-1120f07bffa4	0c9d20cf-500b-4ff6-8822-cd1819c0297e	MAX_ROSTER	22	number	2026-06-02 11:15:37.662	2026-06-02 11:15:37.662
5c6e9002-ec38-47be-910c-f6ddd128498c	0c9d20cf-500b-4ff6-8822-cd1819c0297e	MAX_FOREIGN_PLAYERS	5	number	2026-06-02 11:15:37.665	2026-06-02 11:15:37.665
2129bbda-57cb-4eab-a2a8-17ff9ffc93a9	0c9d20cf-500b-4ff6-8822-cd1819c0297e	MAX_FOREIGN_PLAYERS_ON_FIELD	3	number	2026-06-02 11:15:37.677	2026-06-02 11:15:37.677
689c9c9c-c006-4a68-91c5-399bb49423a0	0c9d20cf-500b-4ff6-8822-cd1819c0297e	MIN_STADIUM_CAPACITY	10000	number	2026-06-02 11:15:37.68	2026-06-02 11:15:37.68
ce7b5289-21f8-43cc-bd5d-d149878f2655	0c9d20cf-500b-4ff6-8822-cd1819c0297e	MIN_STADIUM_FIFA_STARS	2	number	2026-06-02 11:15:37.685	2026-06-02 11:15:37.685
05f86470-3364-4984-8b85-6b3b3a0411fe	0c9d20cf-500b-4ff6-8822-cd1819c0297e	PARTICIPATION_FEE_VND	1000000000	number	2026-06-02 11:15:37.695	2026-06-02 11:15:37.695
85da9bf8-66a8-4c43-b9a4-88db1d0f1e14	0c9d20cf-500b-4ff6-8822-cd1819c0297e	WIN_POINTS	3	number	2026-06-02 11:15:37.708	2026-06-02 11:15:37.708
79279f60-5b6b-49a5-bece-47fb65468b89	0c9d20cf-500b-4ff6-8822-cd1819c0297e	DRAW_POINTS	1	number	2026-06-02 11:15:37.723	2026-06-02 11:15:37.723
f404a30c-bf1c-44c9-b8c4-5cda55b114e0	0c9d20cf-500b-4ff6-8822-cd1819c0297e	LOSS_POINTS	0	number	2026-06-02 11:15:37.738	2026-06-02 11:15:37.738
00318b85-dc21-484d-abc0-5e907334eb23	0c9d20cf-500b-4ff6-8822-cd1819c0297e	MAX_GOAL_TIME	96	number	2026-06-02 11:15:37.747	2026-06-02 11:15:37.747
8ec9c5b0-66ba-43ac-94b8-3fc7fb9f4ff0	0c9d20cf-500b-4ff6-8822-cd1819c0297e	TOTAL_LEGS	2	number	2026-06-02 11:15:37.75	2026-06-02 11:15:37.75
c76d364f-551d-4678-a4c5-fc3c73d3d1d6	0c9d20cf-500b-4ff6-8822-cd1819c0297e	ROUNDS_PER_SEASON	18	number	2026-06-02 11:15:37.757	2026-06-02 11:15:37.757
582c8a64-8787-433a-aa94-827ff55c3013	0c9d20cf-500b-4ff6-8822-cd1819c0297e	MATCHES_PER_ROUND	5	number	2026-06-02 11:15:37.771	2026-06-02 11:15:37.771
fd4a2456-4555-4671-960c-c2078a5531f9	0c9d20cf-500b-4ff6-8822-cd1819c0297e	RANK_TIEBREAK_ORDER_FINAL	["points","goal_diff","head_to_head","draw_lot"]	json	2026-06-02 11:15:37.776	2026-06-02 11:15:37.776
3eea453c-8cf4-4bdc-b92c-b45de1d42ed5	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	MIN_AGE	16	number	2026-06-02 11:15:37.779	2026-06-02 11:15:37.779
67ca179e-725b-4a47-b079-2ef609bccff9	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	MIN_ROSTER	16	number	2026-06-02 11:15:37.793	2026-06-02 11:15:37.793
dbc7571c-9faa-41ed-bd87-163e47769652	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	MAX_ROSTER	22	number	2026-06-02 11:15:37.807	2026-06-02 11:15:37.807
9659649a-ebbb-4e71-a6e3-452e2e848763	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	MAX_FOREIGN_PLAYERS	5	number	2026-06-02 11:15:37.819	2026-06-02 11:15:37.819
e118fd93-3048-44df-bdb8-a939f4c4a315	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	MAX_FOREIGN_PLAYERS_ON_FIELD	3	number	2026-06-02 11:15:37.844	2026-06-02 11:15:37.844
71896cd0-505b-4449-82e6-ca53c6fd7bbf	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	MIN_STADIUM_CAPACITY	10000	number	2026-06-02 11:15:37.861	2026-06-02 11:15:37.861
ab607d95-1be7-4bfd-a17a-a5a44c249698	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	MIN_STADIUM_FIFA_STARS	2	number	2026-06-02 11:15:37.875	2026-06-02 11:15:37.875
7f0d3b8e-80dd-43be-90e7-d2c497434b1e	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	PARTICIPATION_FEE_VND	1000000000	number	2026-06-02 11:15:37.894	2026-06-02 11:15:37.894
149023e8-afa9-45ce-94aa-5e442376c384	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	WIN_POINTS	3	number	2026-06-02 11:15:37.908	2026-06-02 11:15:37.908
42429f76-22e5-4220-b120-5173e10fd0f8	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	DRAW_POINTS	1	number	2026-06-02 11:15:37.921	2026-06-02 11:15:37.921
04479146-b452-475c-9276-05869744e6c7	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	LOSS_POINTS	0	number	2026-06-02 11:15:37.932	2026-06-02 11:15:37.932
3d0a9fca-024b-4cae-878c-d30f03e61751	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	MAX_GOAL_TIME	96	number	2026-06-02 11:15:37.945	2026-06-02 11:15:37.945
93740243-1c25-41aa-8875-89ee67ac5f09	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	TOTAL_LEGS	2	number	2026-06-02 11:15:37.949	2026-06-02 11:15:37.949
8a8f0038-58c4-4824-bb03-98064a103e04	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	ROUNDS_PER_SEASON	18	number	2026-06-02 11:15:37.96	2026-06-02 11:15:37.96
17e36ebc-6135-4588-a065-5c559466ed4a	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	MATCHES_PER_ROUND	5	number	2026-06-02 11:15:37.978	2026-06-02 11:15:37.978
1b3f0c35-521b-4b8f-a60c-0bd7ab9bfedf	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	RANK_TIEBREAK_ORDER_FINAL	["points","goal_diff","head_to_head","draw_lot"]	json	2026-06-02 11:15:37.98	2026-06-02 11:15:37.98
c5ba888b-b532-4a9d-8826-02abdfd346c0	181a0613-5783-4f1c-a0ef-6ceeab4959d8	MIN_AGE	16	number	2026-06-02 11:15:45.857	2026-06-02 11:15:45.857
2ddab8f3-6214-47df-b59e-d2e759ed2426	181a0613-5783-4f1c-a0ef-6ceeab4959d8	MAX_AGE	40	number	2026-06-02 11:15:45.878	2026-06-02 11:15:45.878
ba3f924e-04f1-48f8-819e-2f373343a750	181a0613-5783-4f1c-a0ef-6ceeab4959d8	MIN_ROSTER	16	number	2026-06-02 11:15:45.896	2026-06-02 11:15:45.896
1ddc9961-055b-4a19-8c49-35ca0137d710	181a0613-5783-4f1c-a0ef-6ceeab4959d8	MAX_ROSTER	22	number	2026-06-02 11:15:45.91	2026-06-02 11:15:45.91
7296a632-483d-4f9e-bbd8-7e7e8601d576	181a0613-5783-4f1c-a0ef-6ceeab4959d8	MAX_FOREIGN_PLAYERS	5	number	2026-06-02 11:15:45.929	2026-06-02 11:15:45.929
0a7ea4ff-6155-4739-999b-59420915de43	181a0613-5783-4f1c-a0ef-6ceeab4959d8	MAX_FOREIGN_PLAYERS_ON_FIELD	3	number	2026-06-02 11:15:45.941	2026-06-02 11:15:45.941
e44eb862-3a34-48a8-ac94-0daad91f9425	181a0613-5783-4f1c-a0ef-6ceeab4959d8	MIN_STADIUM_CAPACITY	10000	number	2026-06-02 11:15:45.953	2026-06-02 11:15:45.953
b2722632-809d-4909-9272-338aca6325d2	181a0613-5783-4f1c-a0ef-6ceeab4959d8	MIN_STADIUM_FIFA_STARS	2	number	2026-06-02 11:15:45.957	2026-06-02 11:15:45.957
f7c57ca9-8cc6-41b3-be07-424736dd73d6	181a0613-5783-4f1c-a0ef-6ceeab4959d8	PARTICIPATION_FEE_VND	1000000000	number	2026-06-02 11:15:45.96	2026-06-02 11:15:45.96
0ee9db18-c1cd-4c71-b9b0-487a633d1247	181a0613-5783-4f1c-a0ef-6ceeab4959d8	WIN_POINTS	3	number	2026-06-02 11:15:45.963	2026-06-02 11:15:45.963
fef663c4-3d62-4ffc-84bc-c6b672bc4f08	181a0613-5783-4f1c-a0ef-6ceeab4959d8	DRAW_POINTS	1	number	2026-06-02 11:15:45.965	2026-06-02 11:15:45.965
8748f02d-bc97-4c42-beb2-408607881d56	181a0613-5783-4f1c-a0ef-6ceeab4959d8	LOSS_POINTS	0	number	2026-06-02 11:15:45.969	2026-06-02 11:15:45.969
a0e507a2-6df8-409e-a638-c752f452b972	181a0613-5783-4f1c-a0ef-6ceeab4959d8	MAX_GOAL_TIME	96	number	2026-06-02 11:15:45.972	2026-06-02 11:15:45.972
50298b58-d8c4-42cc-9c4f-2f935929fdfc	181a0613-5783-4f1c-a0ef-6ceeab4959d8	TOTAL_LEGS	2	number	2026-06-02 11:15:45.975	2026-06-02 11:15:45.975
90a01268-a2c4-42f6-9d0c-e182907ff2e1	181a0613-5783-4f1c-a0ef-6ceeab4959d8	ROUNDS_PER_SEASON	18	number	2026-06-02 11:15:45.987	2026-06-02 11:15:45.987
9245d582-7780-4c0d-8a37-5960c2a69d7b	181a0613-5783-4f1c-a0ef-6ceeab4959d8	MATCHES_PER_ROUND	5	number	2026-06-02 11:15:45.999	2026-06-02 11:15:45.999
e315cc4d-a7ef-4662-8f84-32997d355fa7	181a0613-5783-4f1c-a0ef-6ceeab4959d8	RANK_TIEBREAK_ORDER_FINAL	["points","goal_diff","head_to_head","draw_lot"]	json	2026-06-02 11:15:46.01	2026-06-02 11:15:46.01
8e1d2a23-98f7-423d-b1a2-8108e2f74f87	51316183-ef63-4701-a4c2-6230228ac886	MIN_AGE	16	number	2026-06-02 11:15:46.204	2026-06-02 11:15:46.204
2a2de1c2-1959-488d-8d2e-3d93839304d6	51316183-ef63-4701-a4c2-6230228ac886	MAX_AGE	40	number	2026-06-02 11:15:46.22	2026-06-02 11:15:46.22
457f65fe-2d8c-47dc-83f7-6e17340e0fb7	51316183-ef63-4701-a4c2-6230228ac886	MIN_ROSTER	16	number	2026-06-02 11:15:46.231	2026-06-02 11:15:46.231
8680a390-ba2b-4971-8cef-415e24d8bfec	51316183-ef63-4701-a4c2-6230228ac886	MAX_ROSTER	22	number	2026-06-02 11:15:46.242	2026-06-02 11:15:46.242
4783a389-67fb-4b50-8134-ce86063ddfe4	51316183-ef63-4701-a4c2-6230228ac886	MAX_FOREIGN_PLAYERS	5	number	2026-06-02 11:15:46.256	2026-06-02 11:15:46.256
72454dd2-be18-466a-928e-c32e0cb90bb1	51316183-ef63-4701-a4c2-6230228ac886	MAX_FOREIGN_PLAYERS_ON_FIELD	3	number	2026-06-02 11:15:46.276	2026-06-02 11:15:46.276
cc195f7c-f867-4aa5-befa-81d7ac3e7be0	51316183-ef63-4701-a4c2-6230228ac886	MIN_STADIUM_CAPACITY	10000	number	2026-06-02 11:15:46.289	2026-06-02 11:15:46.289
c9957f5f-374b-4d21-8a61-8c5e0e2cec25	51316183-ef63-4701-a4c2-6230228ac886	MIN_STADIUM_FIFA_STARS	2	number	2026-06-02 11:15:46.309	2026-06-02 11:15:46.309
f1cd01d7-541f-45d6-9fe9-1c054ed96d0c	51316183-ef63-4701-a4c2-6230228ac886	PARTICIPATION_FEE_VND	1000000000	number	2026-06-02 11:15:46.322	2026-06-02 11:15:46.322
fd0853d8-ef64-4572-8dff-4fe4b2d0d04a	51316183-ef63-4701-a4c2-6230228ac886	WIN_POINTS	3	number	2026-06-02 11:15:46.344	2026-06-02 11:15:46.344
afbfcf74-a387-4d5f-9feb-528f901edbce	51316183-ef63-4701-a4c2-6230228ac886	DRAW_POINTS	1	number	2026-06-02 11:15:46.358	2026-06-02 11:15:46.358
9793dd1f-833b-4885-aecd-44bee099e046	51316183-ef63-4701-a4c2-6230228ac886	LOSS_POINTS	0	number	2026-06-02 11:15:46.371	2026-06-02 11:15:46.371
afe92712-cecd-43bf-a2a4-7a1315fa984b	51316183-ef63-4701-a4c2-6230228ac886	MAX_GOAL_TIME	96	number	2026-06-02 11:15:46.391	2026-06-02 11:15:46.391
039cba55-4cb6-42e9-a300-96578b60c85b	51316183-ef63-4701-a4c2-6230228ac886	TOTAL_LEGS	2	number	2026-06-02 11:15:46.406	2026-06-02 11:15:46.406
4ea60ae4-1bf3-40ab-938a-7d5962a50c36	51316183-ef63-4701-a4c2-6230228ac886	ROUNDS_PER_SEASON	18	number	2026-06-02 11:15:46.426	2026-06-02 11:15:46.426
34f0b066-0e9a-4828-81bb-36b1224fe146	51316183-ef63-4701-a4c2-6230228ac886	MATCHES_PER_ROUND	5	number	2026-06-02 11:15:46.44	2026-06-02 11:15:46.44
af8959fb-2a65-4634-ade1-a53764f1012a	51316183-ef63-4701-a4c2-6230228ac886	RANK_TIEBREAK_ORDER_FINAL	["points","goal_diff","head_to_head","draw_lot"]	json	2026-06-02 11:15:46.449	2026-06-02 11:15:46.449
10f1c87b-5314-4149-8a48-273d40d46854	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	MAX_AGE	45	number	2026-06-02 11:15:37.781	2026-06-02 11:48:24.541
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name, description, created_at, updated_at) FROM stdin;
4ccdf53a-eb21-45ba-96c7-3c7b3b9ef9b7	REFEREE	Trọng tài	2026-06-02 11:15:34.157	2026-06-02 11:15:34.296
10f4a5d7-9395-4491-b117-13c5514506bd	SUPERVISOR	Giám sát viên	2026-06-02 11:15:34.318	2026-06-02 11:15:34.418
eec657f6-c35f-45ca-9d82-9a5ed436256d	ADMIN	Quản trị viên hệ thống	2026-06-02 11:15:34.11	2026-06-02 11:15:37.479
a1ba5111-ce13-4365-80a7-354001c79305	TEAM_MANAGER	Quản lý đội bóng	2026-06-02 11:15:27.429	2026-06-02 11:15:44.343
\.


--
-- Data for Name: season_teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.season_teams (id, season_id, team_id, status, registered_at, approved_at, created_at, updated_at, owner_name, owner_country, owner_address, team_introduction, primary_kit, backup_kit, participation_fee_paid, fee_paid_at, fee_receipt_code, external_competition_schedule, application_submitted_at, application_review_note, fee_receipt_url) FROM stdin;
03e90200-e1a5-4227-9ae1-5ef104fa502a	8d447186-52eb-472a-a97a-d721be7936d6	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	APPROVED	2026-06-02 11:15:27.793	2026-06-02 11:15:27.789	2026-06-02 11:15:27.793	2026-06-02 11:15:27.793	Công ty chủ quản Thép Xanh Nam Định	Việt Nam	Nam Định	Thép Xanh Nam Định đăng ký tham dự V.League 2024-2025.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2026-06-02 11:15:27.789	FEE-THEP.XANH.NAM.DINH	Cúp Quốc gia 2024-2025	2026-06-02 11:15:27.789	\N	\N
4f67ef33-120a-4fbc-9cb7-c3ffe7b68cd7	8d447186-52eb-472a-a97a-d721be7936d6	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	APPROVED	2026-06-02 11:15:27.812	2026-06-02 11:15:27.811	2026-06-02 11:15:27.812	2026-06-02 11:15:27.812	Công ty chủ quản Hà Nội FC	Việt Nam	Hà Nội	Hà Nội FC đăng ký tham dự V.League 2024-2025.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2026-06-02 11:15:27.811	FEE-HA.NOI.FC	Cúp Quốc gia 2024-2025	2026-06-02 11:15:27.811	\N	\N
89b7133d-28a9-459e-be45-263f6dfac1ce	8d447186-52eb-472a-a97a-d721be7936d6	9f54615c-03ae-464b-adb4-50b9c1677d41	APPROVED	2026-06-02 11:15:27.825	2026-06-02 11:15:27.822	2026-06-02 11:15:27.825	2026-06-02 11:15:27.825	Công ty chủ quản Công An Hà Nội	Việt Nam	Hà Nội	Công An Hà Nội đăng ký tham dự V.League 2024-2025.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2026-06-02 11:15:27.822	FEE-CONG.AN.HA.NOI	Cúp Quốc gia 2024-2025	2026-06-02 11:15:27.822	\N	\N
c4c54b16-70ab-476a-99dc-5ff359ad5cf5	8d447186-52eb-472a-a97a-d721be7936d6	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	APPROVED	2026-06-02 11:15:27.843	2026-06-02 11:15:27.842	2026-06-02 11:15:27.843	2026-06-02 11:15:27.843	Công ty chủ quản Thể Công-Viettel	Việt Nam	Hà Nội	Thể Công-Viettel đăng ký tham dự V.League 2024-2025.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2026-06-02 11:15:27.842	FEE-THE.CONG.VIETTEL	Cúp Quốc gia 2024-2025	2026-06-02 11:15:27.842	\N	\N
7070526b-a004-4f6a-87fe-cac6a20dd1b0	8d447186-52eb-472a-a97a-d721be7936d6	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	APPROVED	2026-06-02 11:15:27.853	2026-06-02 11:15:27.853	2026-06-02 11:15:27.853	2026-06-02 11:15:27.853	Công ty chủ quản Becamex Bình Dương	Việt Nam	Thủ Dầu Một	Becamex Bình Dương đăng ký tham dự V.League 2024-2025.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2026-06-02 11:15:27.853	FEE-BECAMEX.BINH.DUONG	Cúp Quốc gia 2024-2025	2026-06-02 11:15:27.853	\N	\N
9893c096-2fa9-48d8-80b7-741dd4a7d263	8d447186-52eb-472a-a97a-d721be7936d6	df825052-1f68-4f44-857f-c2de07315fd2	APPROVED	2026-06-02 11:15:27.863	2026-06-02 11:15:27.863	2026-06-02 11:15:27.863	2026-06-02 11:15:27.863	Công ty chủ quản Hải Phòng FC	Việt Nam	Hải Phòng	Hải Phòng FC đăng ký tham dự V.League 2024-2025.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2026-06-02 11:15:27.863	FEE-HAI.PHONG.FC	Cúp Quốc gia 2024-2025	2026-06-02 11:15:27.863	\N	\N
b7c72905-d402-494f-bf7a-fe1619771fb1	8d447186-52eb-472a-a97a-d721be7936d6	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	APPROVED	2026-06-02 11:15:27.875	2026-06-02 11:15:27.875	2026-06-02 11:15:27.875	2026-06-02 11:15:27.875	Công ty chủ quản Đông Á Thanh Hóa	Việt Nam	Thanh Hóa	Đông Á Thanh Hóa đăng ký tham dự V.League 2024-2025.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2026-06-02 11:15:27.875	FEE-DONG.A.THANH.HOA	Cúp Quốc gia 2024-2025	2026-06-02 11:15:27.875	\N	\N
0c7598bb-92db-4feb-91fa-21d86878e219	8d447186-52eb-472a-a97a-d721be7936d6	c11ee3ba-bcce-424a-994e-6477045af536	APPROVED	2026-06-02 11:15:27.887	2026-06-02 11:15:27.886	2026-06-02 11:15:27.887	2026-06-02 11:15:27.887	Công ty chủ quản LPBank Hoàng Anh Gia Lai	Việt Nam	Pleiku	LPBank Hoàng Anh Gia Lai đăng ký tham dự V.League 2024-2025.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2026-06-02 11:15:27.886	FEE-LPBANK.HOANG.ANH.GIA.LAI	Cúp Quốc gia 2024-2025	2026-06-02 11:15:27.886	\N	\N
7d075f86-3b7f-4290-a9a9-483cf75ad0ef	8d447186-52eb-472a-a97a-d721be7936d6	3424bc38-f674-4378-a88c-1c9ec5b9a77c	APPROVED	2026-06-02 11:15:27.906	2026-06-02 11:15:27.906	2026-06-02 11:15:27.906	2026-06-02 11:15:27.906	Công ty chủ quản TP.HCM FC	Việt Nam	TP. Hồ Chí Minh	TP.HCM FC đăng ký tham dự V.League 2024-2025.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2026-06-02 11:15:27.906	FEE-TP.HCM.FC	Cúp Quốc gia 2024-2025	2026-06-02 11:15:27.906	\N	\N
e37d870f-fb3d-47c6-8b6f-28e649c12060	8d447186-52eb-472a-a97a-d721be7936d6	655df04f-5508-45f3-8032-fd657a753360	APPROVED	2026-06-02 11:15:27.917	2026-06-02 11:15:27.917	2026-06-02 11:15:27.917	2026-06-02 11:15:27.917	Công ty chủ quản Sông Lam Nghệ An	Việt Nam	Vinh	Sông Lam Nghệ An đăng ký tham dự V.League 2024-2025.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2026-06-02 11:15:27.917	FEE-SONG.LAM.NGHE.AN	Cúp Quốc gia 2024-2025	2026-06-02 11:15:27.917	\N	\N
53fd0f08-f8ba-43e1-8e0c-a4f3522a78b7	8d447186-52eb-472a-a97a-d721be7936d6	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	REGISTERED	2026-06-02 11:15:27.928	\N	2026-06-02 11:15:27.928	2026-06-02 11:15:27.928	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N
a0939809-2f96-4418-b9ca-2fd51a3c24ef	8d447186-52eb-472a-a97a-d721be7936d6	d41cdb24-5257-4d1c-96fc-20140a2314ed	REGISTERED	2026-06-02 11:15:27.939	\N	2026-06-02 11:15:27.939	2026-06-02 11:15:27.939	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N
21c814d5-4861-48e6-8b5e-24da50c0504a	8d447186-52eb-472a-a97a-d721be7936d6	83988147-bd67-49d5-81d3-0acb83dbc90c	REGISTERED	2026-06-02 11:15:27.949	\N	2026-06-02 11:15:27.949	2026-06-02 11:15:27.949	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N
565a0b32-db66-43be-857c-b5952d70bd8d	8d447186-52eb-472a-a97a-d721be7936d6	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	REGISTERED	2026-06-02 11:15:27.96	\N	2026-06-02 11:15:27.96	2026-06-02 11:15:27.96	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N
3230fbee-56a2-42be-a0ab-0b58f5a42cb0	0c9d20cf-500b-4ff6-8822-cd1819c0297e	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	APPROVED	2025-08-01 00:00:00	2025-08-15 00:00:00	2026-06-02 11:15:39.237	2026-06-02 11:15:39.237	Công ty chủ quản Thép Xanh Nam Định	Việt Nam	Thép Xanh Nam Định	Thép Xanh Nam Định tham dự V.League 2025-2026.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2025-08-10 00:00:00	FEE-2025-THEP.XANH.NAM.DINH	Cúp Quốc gia 2025-2026	2025-08-01 00:00:00	\N	\N
66e44ccc-410e-4837-ad7c-c7029e45da1a	0c9d20cf-500b-4ff6-8822-cd1819c0297e	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	APPROVED	2025-08-01 00:00:00	2025-08-15 00:00:00	2026-06-02 11:15:39.241	2026-06-02 11:15:39.241	Công ty chủ quản Hà Nội FC	Việt Nam	Hà Nội FC	Hà Nội FC tham dự V.League 2025-2026.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2025-08-10 00:00:00	FEE-2025-HA.NOI.FC	Cúp Quốc gia 2025-2026	2025-08-01 00:00:00	\N	\N
ac7a4e3c-f82a-44be-8113-f0ae649d921d	0c9d20cf-500b-4ff6-8822-cd1819c0297e	9f54615c-03ae-464b-adb4-50b9c1677d41	APPROVED	2025-08-01 00:00:00	2025-08-15 00:00:00	2026-06-02 11:15:39.244	2026-06-02 11:15:39.244	Công ty chủ quản Công An Hà Nội	Việt Nam	Công An Hà Nội	Công An Hà Nội tham dự V.League 2025-2026.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2025-08-10 00:00:00	FEE-2025-CONG.AN.HA.NOI	Cúp Quốc gia 2025-2026	2025-08-01 00:00:00	\N	\N
d46f87ed-15aa-450e-bca2-af5fbb9c88fb	0c9d20cf-500b-4ff6-8822-cd1819c0297e	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	APPROVED	2025-08-01 00:00:00	2025-08-15 00:00:00	2026-06-02 11:15:39.247	2026-06-02 11:15:39.247	Công ty chủ quản Thể Công-Viettel	Việt Nam	Thể Công-Viettel	Thể Công-Viettel tham dự V.League 2025-2026.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2025-08-10 00:00:00	FEE-2025-THE.CONG.VIETTEL	Cúp Quốc gia 2025-2026	2025-08-01 00:00:00	\N	\N
42ceecf6-9ab0-4901-9fd4-77e493a3ad09	0c9d20cf-500b-4ff6-8822-cd1819c0297e	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	APPROVED	2025-08-01 00:00:00	2025-08-15 00:00:00	2026-06-02 11:15:39.25	2026-06-02 11:15:39.25	Công ty chủ quản Đông Á Thanh Hóa	Việt Nam	Đông Á Thanh Hóa	Đông Á Thanh Hóa tham dự V.League 2025-2026.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2025-08-10 00:00:00	FEE-2025-DONG.A.THANH.HOA	Cúp Quốc gia 2025-2026	2025-08-01 00:00:00	\N	\N
f83898a7-1eab-4752-bab5-b8b98284b1c0	0c9d20cf-500b-4ff6-8822-cd1819c0297e	c11ee3ba-bcce-424a-994e-6477045af536	APPROVED	2025-08-01 00:00:00	2025-08-15 00:00:00	2026-06-02 11:15:39.253	2026-06-02 11:15:39.253	Công ty chủ quản LPBank Hoàng Anh Gia Lai	Việt Nam	LPBank Hoàng Anh Gia Lai	LPBank Hoàng Anh Gia Lai tham dự V.League 2025-2026.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2025-08-10 00:00:00	FEE-2025-LPBANK.HOANG.ANH.GIA.LAI	Cúp Quốc gia 2025-2026	2025-08-01 00:00:00	\N	\N
ec2b1f59-d3c0-43b2-a13e-baebd24376b3	0c9d20cf-500b-4ff6-8822-cd1819c0297e	df825052-1f68-4f44-857f-c2de07315fd2	APPROVED	2025-08-01 00:00:00	2025-08-15 00:00:00	2026-06-02 11:15:39.256	2026-06-02 11:15:39.256	Công ty chủ quản Hải Phòng FC	Việt Nam	Hải Phòng FC	Hải Phòng FC tham dự V.League 2025-2026.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2025-08-10 00:00:00	FEE-2025-HAI.PHONG.FC	Cúp Quốc gia 2025-2026	2025-08-01 00:00:00	\N	\N
850746ec-c22f-47fa-a0a9-b5a843007d61	0c9d20cf-500b-4ff6-8822-cd1819c0297e	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	APPROVED	2025-08-01 00:00:00	2025-08-15 00:00:00	2026-06-02 11:15:39.26	2026-06-02 11:15:39.26	Công ty chủ quản Becamex Bình Dương	Việt Nam	Becamex Bình Dương	Becamex Bình Dương tham dự V.League 2025-2026.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2025-08-10 00:00:00	FEE-2025-BECAMEX.BINH.DUONG	Cúp Quốc gia 2025-2026	2025-08-01 00:00:00	\N	\N
b902095b-3749-41d1-bc39-684e8d9fdf45	0c9d20cf-500b-4ff6-8822-cd1819c0297e	3424bc38-f674-4378-a88c-1c9ec5b9a77c	APPROVED	2025-08-01 00:00:00	2025-08-15 00:00:00	2026-06-02 11:15:39.262	2026-06-02 11:15:39.262	Công ty chủ quản TP.HCM FC	Việt Nam	TP.HCM FC	TP.HCM FC tham dự V.League 2025-2026.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2025-08-10 00:00:00	FEE-2025-TP.HCM.FC	Cúp Quốc gia 2025-2026	2025-08-01 00:00:00	\N	\N
696877a4-b523-4ab5-b64f-f8e9ce4fb862	0c9d20cf-500b-4ff6-8822-cd1819c0297e	655df04f-5508-45f3-8032-fd657a753360	APPROVED	2025-08-01 00:00:00	2025-08-15 00:00:00	2026-06-02 11:15:39.264	2026-06-02 11:15:39.264	Công ty chủ quản Sông Lam Nghệ An	Việt Nam	Sông Lam Nghệ An	Sông Lam Nghệ An tham dự V.League 2025-2026.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2025-08-10 00:00:00	FEE-2025-SONG.LAM.NGHE.AN	Cúp Quốc gia 2025-2026	2025-08-01 00:00:00	\N	\N
f5e97841-3695-4815-a43d-2340984c406b	181a0613-5783-4f1c-a0ef-6ceeab4959d8	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	APPROVED	2022-08-01 00:00:00	2022-08-15 00:00:00	2026-06-02 11:15:46.041	2026-06-02 11:15:46.041	Công ty chủ quản Thép Xanh Nam Định	Việt Nam	Nam Định	Thép Xanh Nam Định participates in V.League 2022-2023 - Equal Points Different GD.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2022-08-10 00:00:00	TIE-2022-TXND	Cúp Quốc gia	2022-08-01 00:00:00	\N	\N
15605522-ffa9-4257-ab0f-67484433d4ff	181a0613-5783-4f1c-a0ef-6ceeab4959d8	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	APPROVED	2022-08-01 00:00:00	2022-08-15 00:00:00	2026-06-02 11:15:46.041	2026-06-02 11:15:46.041	Công ty chủ quản Hà Nội FC	Việt Nam	Hà Nội	Hà Nội FC participates in V.League 2022-2023 - Equal Points Different GD.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2022-08-10 00:00:00	TIE-2022-HN	Cúp Quốc gia	2022-08-01 00:00:00	\N	\N
78e01e21-179b-46c9-9ef2-6e78c696b6fc	181a0613-5783-4f1c-a0ef-6ceeab4959d8	9f54615c-03ae-464b-adb4-50b9c1677d41	APPROVED	2022-08-01 00:00:00	2022-08-15 00:00:00	2026-06-02 11:15:46.041	2026-06-02 11:15:46.041	Công ty chủ quản Công An Hà Nội	Việt Nam	Hà Nội	Công An Hà Nội participates in V.League 2022-2023 - Equal Points Different GD.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2022-08-10 00:00:00	TIE-2022-CAHN	Cúp Quốc gia	2022-08-01 00:00:00	\N	\N
0b7719b4-949f-48c5-b3e7-32c85880657d	181a0613-5783-4f1c-a0ef-6ceeab4959d8	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	APPROVED	2022-08-01 00:00:00	2022-08-15 00:00:00	2026-06-02 11:15:46.041	2026-06-02 11:15:46.041	Công ty chủ quản Thể Công-Viettel	Việt Nam	Hà Nội	Thể Công-Viettel participates in V.League 2022-2023 - Equal Points Different GD.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2022-08-10 00:00:00	TIE-2022-TCVT	Cúp Quốc gia	2022-08-01 00:00:00	\N	\N
e5458954-cf74-4765-92ab-6725cdd5e915	181a0613-5783-4f1c-a0ef-6ceeab4959d8	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	APPROVED	2022-08-01 00:00:00	2022-08-15 00:00:00	2026-06-02 11:15:46.041	2026-06-02 11:15:46.041	Công ty chủ quản Becamex Bình Dương	Việt Nam	Thủ Dầu Một	Becamex Bình Dương participates in V.League 2022-2023 - Equal Points Different GD.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2022-08-10 00:00:00	TIE-2022-BBD	Cúp Quốc gia	2022-08-01 00:00:00	\N	\N
6f02f9a7-1ea3-4d7f-bc31-61a8c462daa9	181a0613-5783-4f1c-a0ef-6ceeab4959d8	df825052-1f68-4f44-857f-c2de07315fd2	APPROVED	2022-08-01 00:00:00	2022-08-15 00:00:00	2026-06-02 11:15:46.041	2026-06-02 11:15:46.041	Công ty chủ quản Hải Phòng FC	Việt Nam	Hải Phòng	Hải Phòng FC participates in V.League 2022-2023 - Equal Points Different GD.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2022-08-10 00:00:00	TIE-2022-HP	Cúp Quốc gia	2022-08-01 00:00:00	\N	\N
e3d01163-7b62-436d-b670-c74194a4ea0b	181a0613-5783-4f1c-a0ef-6ceeab4959d8	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	APPROVED	2022-08-01 00:00:00	2022-08-15 00:00:00	2026-06-02 11:15:46.041	2026-06-02 11:15:46.041	Công ty chủ quản Đông Á Thanh Hóa	Việt Nam	Thanh Hóa	Đông Á Thanh Hóa participates in V.League 2022-2023 - Equal Points Different GD.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2022-08-10 00:00:00	TIE-2022-DATH	Cúp Quốc gia	2022-08-01 00:00:00	\N	\N
41d0158e-23e9-49f4-8dc4-322242a3c344	181a0613-5783-4f1c-a0ef-6ceeab4959d8	c11ee3ba-bcce-424a-994e-6477045af536	APPROVED	2022-08-01 00:00:00	2022-08-15 00:00:00	2026-06-02 11:15:46.041	2026-06-02 11:15:46.041	Công ty chủ quản LPBank Hoàng Anh Gia Lai	Việt Nam	Pleiku	LPBank Hoàng Anh Gia Lai participates in V.League 2022-2023 - Equal Points Different GD.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2022-08-10 00:00:00	TIE-2022-HAGL	Cúp Quốc gia	2022-08-01 00:00:00	\N	\N
06b25d53-7345-416e-a4a9-1648abaf6619	181a0613-5783-4f1c-a0ef-6ceeab4959d8	3424bc38-f674-4378-a88c-1c9ec5b9a77c	APPROVED	2022-08-01 00:00:00	2022-08-15 00:00:00	2026-06-02 11:15:46.041	2026-06-02 11:15:46.041	Công ty chủ quản TP.HCM FC	Việt Nam	TP. Hồ Chí Minh	TP.HCM FC participates in V.League 2022-2023 - Equal Points Different GD.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2022-08-10 00:00:00	TIE-2022-HCM	Cúp Quốc gia	2022-08-01 00:00:00	\N	\N
f6660b17-0260-4d3a-a7f2-2666de23975f	181a0613-5783-4f1c-a0ef-6ceeab4959d8	655df04f-5508-45f3-8032-fd657a753360	APPROVED	2022-08-01 00:00:00	2022-08-15 00:00:00	2026-06-02 11:15:46.041	2026-06-02 11:15:46.041	Công ty chủ quản Sông Lam Nghệ An	Việt Nam	Vinh	Sông Lam Nghệ An participates in V.League 2022-2023 - Equal Points Different GD.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2022-08-10 00:00:00	TIE-2022-SLNA	Cúp Quốc gia	2022-08-01 00:00:00	\N	\N
57d27e3d-a60e-4086-9e09-6a1007fb8fde	51316183-ef63-4701-a4c2-6230228ac886	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	APPROVED	2023-08-01 00:00:00	2023-08-15 00:00:00	2026-06-02 11:15:46.467	2026-06-02 11:15:46.467	Công ty chủ quản Thép Xanh Nam Định	Việt Nam	Nam Định	Thép Xanh Nam Định participates in V.League 2023-2024 - Draw Lot Required.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2023-08-10 00:00:00	TIE-2023-TXND	Cúp Quốc gia	2023-08-01 00:00:00	\N	\N
f95da4ac-982f-42ec-88f2-a00c81fbba6f	51316183-ef63-4701-a4c2-6230228ac886	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	APPROVED	2023-08-01 00:00:00	2023-08-15 00:00:00	2026-06-02 11:15:46.467	2026-06-02 11:15:46.467	Công ty chủ quản Hà Nội FC	Việt Nam	Hà Nội	Hà Nội FC participates in V.League 2023-2024 - Draw Lot Required.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2023-08-10 00:00:00	TIE-2023-HN	Cúp Quốc gia	2023-08-01 00:00:00	\N	\N
03831d68-4831-4f18-ab20-6823db4c1374	51316183-ef63-4701-a4c2-6230228ac886	9f54615c-03ae-464b-adb4-50b9c1677d41	APPROVED	2023-08-01 00:00:00	2023-08-15 00:00:00	2026-06-02 11:15:46.467	2026-06-02 11:15:46.467	Công ty chủ quản Công An Hà Nội	Việt Nam	Hà Nội	Công An Hà Nội participates in V.League 2023-2024 - Draw Lot Required.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2023-08-10 00:00:00	TIE-2023-CAHN	Cúp Quốc gia	2023-08-01 00:00:00	\N	\N
9eafd4e5-002a-41c9-b0d3-ae3d84dd2dd8	51316183-ef63-4701-a4c2-6230228ac886	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	APPROVED	2023-08-01 00:00:00	2023-08-15 00:00:00	2026-06-02 11:15:46.467	2026-06-02 11:15:46.467	Công ty chủ quản Thể Công-Viettel	Việt Nam	Hà Nội	Thể Công-Viettel participates in V.League 2023-2024 - Draw Lot Required.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2023-08-10 00:00:00	TIE-2023-TCVT	Cúp Quốc gia	2023-08-01 00:00:00	\N	\N
3dfc4caf-c008-4dc8-8151-fed18975b95d	51316183-ef63-4701-a4c2-6230228ac886	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	APPROVED	2023-08-01 00:00:00	2023-08-15 00:00:00	2026-06-02 11:15:46.467	2026-06-02 11:15:46.467	Công ty chủ quản Becamex Bình Dương	Việt Nam	Thủ Dầu Một	Becamex Bình Dương participates in V.League 2023-2024 - Draw Lot Required.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2023-08-10 00:00:00	TIE-2023-BBD	Cúp Quốc gia	2023-08-01 00:00:00	\N	\N
7da4b7b5-9faa-45ad-a99d-6f96662f781b	51316183-ef63-4701-a4c2-6230228ac886	df825052-1f68-4f44-857f-c2de07315fd2	APPROVED	2023-08-01 00:00:00	2023-08-15 00:00:00	2026-06-02 11:15:46.467	2026-06-02 11:15:46.467	Công ty chủ quản Hải Phòng FC	Việt Nam	Hải Phòng	Hải Phòng FC participates in V.League 2023-2024 - Draw Lot Required.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2023-08-10 00:00:00	TIE-2023-HP	Cúp Quốc gia	2023-08-01 00:00:00	\N	\N
c1fc20ca-edb8-476c-99ba-57ce7c49d847	51316183-ef63-4701-a4c2-6230228ac886	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	APPROVED	2023-08-01 00:00:00	2023-08-15 00:00:00	2026-06-02 11:15:46.467	2026-06-02 11:15:46.467	Công ty chủ quản Đông Á Thanh Hóa	Việt Nam	Thanh Hóa	Đông Á Thanh Hóa participates in V.League 2023-2024 - Draw Lot Required.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2023-08-10 00:00:00	TIE-2023-DATH	Cúp Quốc gia	2023-08-01 00:00:00	\N	\N
580598fa-2696-40d8-9888-ac0c003f44ea	51316183-ef63-4701-a4c2-6230228ac886	c11ee3ba-bcce-424a-994e-6477045af536	APPROVED	2023-08-01 00:00:00	2023-08-15 00:00:00	2026-06-02 11:15:46.467	2026-06-02 11:15:46.467	Công ty chủ quản LPBank Hoàng Anh Gia Lai	Việt Nam	Pleiku	LPBank Hoàng Anh Gia Lai participates in V.League 2023-2024 - Draw Lot Required.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2023-08-10 00:00:00	TIE-2023-HAGL	Cúp Quốc gia	2023-08-01 00:00:00	\N	\N
c121ed3a-b434-4d5c-97e8-8dbc71164646	51316183-ef63-4701-a4c2-6230228ac886	3424bc38-f674-4378-a88c-1c9ec5b9a77c	APPROVED	2023-08-01 00:00:00	2023-08-15 00:00:00	2026-06-02 11:15:46.467	2026-06-02 11:15:46.467	Công ty chủ quản TP.HCM FC	Việt Nam	TP. Hồ Chí Minh	TP.HCM FC participates in V.League 2023-2024 - Draw Lot Required.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2023-08-10 00:00:00	TIE-2023-HCM	Cúp Quốc gia	2023-08-01 00:00:00	\N	\N
d126a581-c308-46a0-896c-00b1a037dfb3	51316183-ef63-4701-a4c2-6230228ac886	655df04f-5508-45f3-8032-fd657a753360	APPROVED	2023-08-01 00:00:00	2023-08-15 00:00:00	2026-06-02 11:15:46.467	2026-06-02 11:15:46.467	Công ty chủ quản Sông Lam Nghệ An	Việt Nam	Vinh	Sông Lam Nghệ An participates in V.League 2023-2024 - Draw Lot Required.	Áo màu chính thức theo nhận diện CLB	Áo dự bị màu tương phản	t	2023-08-10 00:00:00	TIE-2023-SLNA	Cúp Quốc gia	2023-08-01 00:00:00	\N	\N
\.


--
-- Data for Name: seasons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seasons (id, name, year, status, start_date, end_date, created_at, updated_at) FROM stdin;
8d447186-52eb-472a-a97a-d721be7936d6	V.League 2024-2025	2024	IN_PROGRESS	2024-09-14 00:00:00	2025-06-21 00:00:00	2026-06-02 11:15:27.061	2026-06-02 11:15:27.061
b9bac06d-ee70-4f36-9217-e8b1925fb7b1	VLeague 2026-2027	2026	UPCOMING	2026-09-01 00:00:00	2027-06-30 00:00:00	2026-06-02 11:15:37.614	2026-06-02 11:15:37.614
0c9d20cf-500b-4ff6-8822-cd1819c0297e	V.League 2025-2026	2025	COMPLETED	2025-09-01 00:00:00	2026-05-24 12:00:00	2026-06-02 11:15:37.597	2026-06-02 11:15:44.394
181a0613-5783-4f1c-a0ef-6ceeab4959d8	V.League 2022-2023 - Equal Points Different GD	2022	COMPLETED	2022-09-03 00:00:00	2023-05-27 00:00:00	2026-06-02 11:15:45.821	2026-06-02 11:15:45.821
51316183-ef63-4701-a4c2-6230228ac886	V.League 2023-2024 - Draw Lot Required	2023	COMPLETED	2023-09-02 00:00:00	2024-05-25 00:00:00	2026-06-02 11:15:46.196	2026-06-02 11:15:46.196
\.


--
-- Data for Name: stadiums; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stadiums (id, name, address, city, capacity, created_at, updated_at, country, fifa_stars) FROM stdin;
804a089e-bab7-4b13-b25f-f42c6d21954a	Sân vận động Hòa Xuân	Cẩm Lệ, Đà Nẵng	Đà Nẵng	20500	2026-06-02 11:15:14.218	2026-06-02 11:15:14.218	Việt Nam	2
7fb9e7fa-4706-4d12-8503-0832095a8e3c	Sân vận động Cần Thơ	Ninh Kiều, TP. Cần Thơ	Cần Thơ	50000	2026-06-02 11:15:14.259	2026-06-02 11:15:14.259	Việt Nam	2
bde5a9c5-a012-4e72-9238-c65980b935f1	Sân vận động Tự Do	TP. Huế, Thừa Thiên Huế	Huế	25000	2026-06-02 11:15:14.281	2026-06-02 11:15:14.281	Việt Nam	2
ab1bf38a-6c67-4852-9a93-9e98bc3416e9	Sân vận động Hà Tĩnh	TP Hà Tĩnh, Hà Tĩnh	Hà Tĩnh	18000	2026-06-02 11:15:14.336	2026-06-02 11:15:14.336	Việt Nam	2
0c6e0bdc-cdb0-4208-be76-c10e0349f123	Sân vận động Tam Kỳ	P. Tam Kỳ, Đà Nẵng	Đà Nẵng	15000	2026-06-02 11:15:14.346	2026-06-02 11:15:14.346	Việt Nam	2
d34f8d8f-99ae-4260-bf5d-910f24be3336	Sân vận động Thiên Trường	P. Nam Định, Ninh Bình	Ninh Bình	30000	2026-06-02 11:15:14.196	2026-06-02 11:15:38.055	Việt Nam	2
d2b67ed7-948f-466e-afc9-8d148ec45cdf	Sân vận động 19 Tháng 8	TP. Nha Trang, Khánh Hòa	Khánh Hòa	18000	2026-06-02 11:15:14.303	2026-06-02 11:15:51.183	Việt Nam	2
e0922349-6ef9-4456-9acf-05ad869d581c	Sân vận động Hàng Đẫy	Trịnh Hoài Đức, Đống Đa, Hà Nội	Hà Nội	22500	2026-06-02 11:15:14.168	2026-06-02 11:15:38.346	Việt Nam	2
91e98957-387a-4441-99ac-616cdc690608	Sân vận động Mỹ Đình	Nam Từ Liêm, Hà Nội	Hà Nội	40192	2026-06-02 11:15:14.089	2026-06-02 11:15:38.428	Việt Nam	2
c1649f16-5f82-4079-822e-58d09dfba4df	Sân vận động Thanh Hóa	TP. Thanh Hóa	Thanh Hóa	14000	2026-06-02 11:15:14.252	2026-06-02 11:15:38.573	Việt Nam	2
e8098118-bcb9-4905-8b88-4452a6d843fc	Sân vận động Pleiku	TP. Pleiku, Gia Lai	Gia Lai	12000	2026-06-02 11:15:14.206	2026-06-02 11:15:51.239	Việt Nam	2
c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	Sân vận động Lạch Tray	Lê Lợi, Ngô Quyền, Hải Phòng	Hải Phòng	30000	2026-06-02 11:15:14.185	2026-06-02 11:15:38.905	Việt Nam	2
1a93e748-8884-4c17-be23-43980ffe7608	Sân vận động Gò Đậu	P. Thủ Dầu Một, TP. Hồ Chí Minh	TP. Hồ Chí Minh	18250	2026-06-02 11:15:14.255	2026-06-02 11:15:39.062	Việt Nam	2
c81e244b-13f9-423c-aabb-b06cea5aeccb	Sân vận động Thống Nhất	Quận 10, TP. Hồ Chí Minh	TP. Hồ Chí Minh	25000	2026-06-02 11:15:14.174	2026-06-02 11:15:39.135	Việt Nam	2
8178046b-f654-4344-9434-e4b9ec71fd1b	Sân vận động Vinh	P. Vinh, Nghệ An	Nghệ An	18000	2026-06-02 11:15:14.228	2026-06-02 11:15:39.183	Việt Nam	2
09a7bb01-e75d-4581-8da7-4b0442bf2a60	Sân vận động Bình Phước	P. Bình Phước, Đồng Nai	Đồng Nai	11000	2026-06-02 11:15:14.378	2026-06-02 11:15:51.297	Việt Nam	2
fd0e9812-028b-499e-b7f1-d7cc8991273a	Sân vận động PVF	Nghĩa Trụ, Hưng Yên	Hưng Yên	4600	2026-06-02 11:15:14.388	2026-06-02 11:15:51.352	Việt Nam	2
fb411a6f-f820-4ae7-9af2-3ecfae59ab15	Sân vận động Việt Trì	Thanh Miếu, Phú Thọ	Phú Thọ	20000	2026-06-02 11:15:14.313	2026-06-02 11:15:51.406	Việt Nam	2
a01d605b-1706-46bf-a8f5-6d60675dc9d6	Sân vận động Bà Rịa	P. Bà Rịa, TP. Hồ Chí Minh	TP. Hồ Chí Minh	16000	2026-06-02 11:15:14.27	2026-06-02 11:15:51.461	Việt Nam	2
968ff955-98cf-4f13-87c2-72b02ee140e6	Sân vận động Việt Yên	Việt Yên, Bắc Ninh	Bắc Ninh	18000	2026-06-02 11:15:14.356	2026-06-02 11:15:50.966	Việt Nam	2
dd464e52-0bd3-4b1b-94c9-401ceb5dff7d	Sân vận động Long An	P. Long An, Tây Ninh	Tây Ninh	19975	2026-06-02 11:15:14.291	2026-06-02 11:15:51.021	Việt Nam	2
22f1bd88-c028-43f8-930d-986b8543d5ed	Sân vận động Quy Nhơn	Quy Nhơn, Gia Lai	Gia Lai	20000	2026-06-02 11:15:14.239	2026-06-02 11:15:51.077	Việt Nam	2
1347ef6d-b633-4460-988a-db0d0e58e186	Sân vận động Cẩm Phả	Cẩm Phả, Quảng Ninh	Quảng Ninh	16000	2026-06-02 11:15:14.369	2026-06-02 11:15:51.125	Việt Nam	2
205769dc-f6e9-41b3-b54d-3b92715341c6	Sân vận động Cao Lãnh	Mỹ Trà, Đồng Tháp	Đồng Tháp	23000	2026-06-02 11:15:14.324	2026-06-02 11:15:51.529	Việt Nam	2
\.


--
-- Data for Name: standings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.standings (id, season_id, team_id, played, win, draw, loss, goals_for, goals_against, goal_diff, points, rank, updated_at) FROM stdin;
496ea015-db52-49a3-8241-c7115e59898c	0c9d20cf-500b-4ff6-8822-cd1819c0297e	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	18	18	0	0	46	0	46	54	1	2026-06-02 11:15:39.365
606a59b0-ea6e-4701-924e-0b1a32020e99	0c9d20cf-500b-4ff6-8822-cd1819c0297e	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	18	16	0	2	40	6	34	48	2	2026-06-02 11:15:39.374
8d7b33c1-1d57-45e9-ad37-113a556632ff	0c9d20cf-500b-4ff6-8822-cd1819c0297e	9f54615c-03ae-464b-adb4-50b9c1677d41	18	14	0	4	36	10	26	42	3	2026-06-02 11:15:39.387
02eca4b7-6497-4ac8-bdc9-d2f1fa27e0de	0c9d20cf-500b-4ff6-8822-cd1819c0297e	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	18	12	0	6	30	16	14	36	4	2026-06-02 11:15:39.397
8eca4ae6-fde1-4c80-bfae-03b35d650579	0c9d20cf-500b-4ff6-8822-cd1819c0297e	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	18	10	0	8	26	20	6	30	5	2026-06-02 11:15:39.41
faa5b54e-e46a-4e24-abe1-91b8014813a2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	c11ee3ba-bcce-424a-994e-6477045af536	18	8	0	10	20	26	-6	24	6	2026-06-02 11:15:39.422
c4df4448-fb01-4fbb-acee-825ab40d8dc2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	df825052-1f68-4f44-857f-c2de07315fd2	18	6	0	12	16	30	-14	18	7	2026-06-02 11:15:39.437
8b8e3563-9548-46f4-a280-0c9db7246f60	0c9d20cf-500b-4ff6-8822-cd1819c0297e	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	18	4	0	14	10	36	-26	12	8	2026-06-02 11:15:39.447
10733abb-9980-4746-b76b-41cb122a4847	0c9d20cf-500b-4ff6-8822-cd1819c0297e	3424bc38-f674-4378-a88c-1c9ec5b9a77c	18	2	0	16	6	40	-34	6	9	2026-06-02 11:15:39.457
2e794a26-9f2e-491d-ab06-11656b678c3d	0c9d20cf-500b-4ff6-8822-cd1819c0297e	655df04f-5508-45f3-8032-fd657a753360	18	0	0	18	0	46	-46	0	10	2026-06-02 11:15:39.466
44266a2d-9f1b-43c4-8e63-db0e88d7db60	181a0613-5783-4f1c-a0ef-6ceeab4959d8	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	18	16	2	0	50	2	48	50	1	2026-06-02 11:15:46.175
2903f835-557c-44ca-8d23-edf7cdac2394	181a0613-5783-4f1c-a0ef-6ceeab4959d8	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	18	16	2	0	18	2	16	50	2	2026-06-02 11:15:46.175
ddaf3e33-ac47-40cc-934c-1f361e5fdded	181a0613-5783-4f1c-a0ef-6ceeab4959d8	9f54615c-03ae-464b-adb4-50b9c1677d41	18	14	0	4	14	8	6	42	3	2026-06-02 11:15:46.175
68465d99-9b83-4cee-9014-c83fd390e3f4	181a0613-5783-4f1c-a0ef-6ceeab4959d8	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	18	12	0	6	12	10	2	36	4	2026-06-02 11:15:46.175
8fedb762-32b3-4b62-ad64-0a6e36991197	181a0613-5783-4f1c-a0ef-6ceeab4959d8	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	18	10	0	8	10	12	-2	30	5	2026-06-02 11:15:46.175
21ae13c7-51c3-4e8b-8782-3890439ae742	181a0613-5783-4f1c-a0ef-6ceeab4959d8	df825052-1f68-4f44-857f-c2de07315fd2	18	8	0	10	8	14	-6	24	6	2026-06-02 11:15:46.175
f5200d64-46bd-4e99-beb0-0b4077b0d877	181a0613-5783-4f1c-a0ef-6ceeab4959d8	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	18	6	0	12	6	16	-10	18	7	2026-06-02 11:15:46.175
a9fdbef8-a654-457f-aa16-33b70947ac98	181a0613-5783-4f1c-a0ef-6ceeab4959d8	c11ee3ba-bcce-424a-994e-6477045af536	18	4	0	14	4	18	-14	12	8	2026-06-02 11:15:46.175
22ea4aa5-c29b-4816-b396-9d67a96578cc	181a0613-5783-4f1c-a0ef-6ceeab4959d8	3424bc38-f674-4378-a88c-1c9ec5b9a77c	18	2	0	16	2	20	-18	6	9	2026-06-02 11:15:46.175
c888d675-4254-4a0c-a5e3-bbc9b666906d	181a0613-5783-4f1c-a0ef-6ceeab4959d8	655df04f-5508-45f3-8032-fd657a753360	18	0	0	18	0	22	-22	0	10	2026-06-02 11:15:46.175
d6bcf337-d9ce-403e-b4cb-8b249db7034f	51316183-ef63-4701-a4c2-6230228ac886	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	18	17	0	1	33	1	32	51	1	2026-06-02 11:15:46.575
3c9cca6e-0278-4695-8e3a-901960c9eea3	51316183-ef63-4701-a4c2-6230228ac886	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	18	17	0	1	33	1	32	51	1	2026-06-02 11:15:46.575
dc006792-c2e4-451e-806f-2e7c92bb4c6c	51316183-ef63-4701-a4c2-6230228ac886	9f54615c-03ae-464b-adb4-50b9c1677d41	18	14	0	4	14	8	6	42	3	2026-06-02 11:15:46.575
6b14e541-2e00-485e-ac0b-6423b516cf4b	51316183-ef63-4701-a4c2-6230228ac886	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	18	12	0	6	12	10	2	36	4	2026-06-02 11:15:46.575
e2eb0fa3-89d6-466a-88a3-f742e3736ae8	51316183-ef63-4701-a4c2-6230228ac886	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	18	10	0	8	10	12	-2	30	5	2026-06-02 11:15:46.575
9c977b85-b7e0-4dd4-97e1-dd19a92648da	51316183-ef63-4701-a4c2-6230228ac886	df825052-1f68-4f44-857f-c2de07315fd2	18	8	0	10	8	14	-6	24	6	2026-06-02 11:15:46.575
1c254f2d-4f6d-4411-8751-6ab1b29e80f6	51316183-ef63-4701-a4c2-6230228ac886	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	18	6	0	12	6	16	-10	18	7	2026-06-02 11:15:46.575
743ae83c-c360-43ed-a6d3-6009214c038a	51316183-ef63-4701-a4c2-6230228ac886	c11ee3ba-bcce-424a-994e-6477045af536	18	4	0	14	4	18	-14	12	8	2026-06-02 11:15:46.575
3138192c-9d0e-4ce7-8af5-d0081ac257df	51316183-ef63-4701-a4c2-6230228ac886	3424bc38-f674-4378-a88c-1c9ec5b9a77c	18	2	0	16	2	20	-18	6	9	2026-06-02 11:15:46.575
5030d469-725b-4e71-b4fd-d66fa3868975	51316183-ef63-4701-a4c2-6230228ac886	655df04f-5508-45f3-8032-fd657a753360	18	0	0	18	0	22	-22	0	10	2026-06-02 11:15:46.575
\.


--
-- Data for Name: team_invitations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_invitations (id, season_id, team_id, source_type, status, sent_at, deadline_at, response_at, response_reason, regulations_snapshot, created_at, updated_at, promotion_note) FROM stdin;
2d05d5ed-3aa4-4190-9e71-48d49623696a	8d447186-52eb-472a-a97a-d721be7936d6	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	PREVIOUS_TOP_8	ACCEPTED	2026-06-02 11:15:27.995	2026-06-16 11:15:27.995	2026-06-02 11:15:27.995	\N	{"MAX_ROSTER": "22", "MIN_ROSTER": "16", "MAX_FOREIGN_PLAYERS": "5", "MIN_STADIUM_CAPACITY": "10000", "PARTICIPATION_FEE_VND": "1000000000", "MIN_STADIUM_FIFA_STARS": "2", "MAX_FOREIGN_PLAYERS_ON_FIELD": "3"}	2026-06-02 11:15:27.997	2026-06-02 11:15:27.997	\N
810fbc31-ef81-4219-9d8a-2072255cb6f5	8d447186-52eb-472a-a97a-d721be7936d6	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	PREVIOUS_TOP_8	ACCEPTED	2026-06-02 11:15:27.995	2026-06-16 11:15:27.995	2026-06-02 11:15:27.995	\N	{"MAX_ROSTER": "22", "MIN_ROSTER": "16", "MAX_FOREIGN_PLAYERS": "5", "MIN_STADIUM_CAPACITY": "10000", "PARTICIPATION_FEE_VND": "1000000000", "MIN_STADIUM_FIFA_STARS": "2", "MAX_FOREIGN_PLAYERS_ON_FIELD": "3"}	2026-06-02 11:15:28.019	2026-06-02 11:15:28.019	\N
b5914ac7-23b2-4f29-aa48-e47fe53c2709	8d447186-52eb-472a-a97a-d721be7936d6	9f54615c-03ae-464b-adb4-50b9c1677d41	PREVIOUS_TOP_8	ACCEPTED	2026-06-02 11:15:27.995	2026-06-16 11:15:27.995	2026-06-02 11:15:27.995	\N	{"MAX_ROSTER": "22", "MIN_ROSTER": "16", "MAX_FOREIGN_PLAYERS": "5", "MIN_STADIUM_CAPACITY": "10000", "PARTICIPATION_FEE_VND": "1000000000", "MIN_STADIUM_FIFA_STARS": "2", "MAX_FOREIGN_PLAYERS_ON_FIELD": "3"}	2026-06-02 11:15:28.03	2026-06-02 11:15:28.03	\N
73bbb0fd-89b3-4de1-98ff-0f141f73245f	8d447186-52eb-472a-a97a-d721be7936d6	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	PREVIOUS_TOP_8	ACCEPTED	2026-06-02 11:15:27.995	2026-06-16 11:15:27.995	2026-06-02 11:15:27.995	\N	{"MAX_ROSTER": "22", "MIN_ROSTER": "16", "MAX_FOREIGN_PLAYERS": "5", "MIN_STADIUM_CAPACITY": "10000", "PARTICIPATION_FEE_VND": "1000000000", "MIN_STADIUM_FIFA_STARS": "2", "MAX_FOREIGN_PLAYERS_ON_FIELD": "3"}	2026-06-02 11:15:28.04	2026-06-02 11:15:28.04	\N
d01ad78c-bca5-4201-a640-f9edb7241528	8d447186-52eb-472a-a97a-d721be7936d6	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	PREVIOUS_TOP_8	ACCEPTED	2026-06-02 11:15:27.995	2026-06-16 11:15:27.995	2026-06-02 11:15:27.995	\N	{"MAX_ROSTER": "22", "MIN_ROSTER": "16", "MAX_FOREIGN_PLAYERS": "5", "MIN_STADIUM_CAPACITY": "10000", "PARTICIPATION_FEE_VND": "1000000000", "MIN_STADIUM_FIFA_STARS": "2", "MAX_FOREIGN_PLAYERS_ON_FIELD": "3"}	2026-06-02 11:15:28.05	2026-06-02 11:15:28.05	\N
d9eb1ef4-51c5-40d3-aab3-dc0ee6dd19e0	8d447186-52eb-472a-a97a-d721be7936d6	df825052-1f68-4f44-857f-c2de07315fd2	PREVIOUS_TOP_8	ACCEPTED	2026-06-02 11:15:27.995	2026-06-16 11:15:27.995	2026-06-02 11:15:27.995	\N	{"MAX_ROSTER": "22", "MIN_ROSTER": "16", "MAX_FOREIGN_PLAYERS": "5", "MIN_STADIUM_CAPACITY": "10000", "PARTICIPATION_FEE_VND": "1000000000", "MIN_STADIUM_FIFA_STARS": "2", "MAX_FOREIGN_PLAYERS_ON_FIELD": "3"}	2026-06-02 11:15:28.061	2026-06-02 11:15:28.061	\N
8a90eeac-7eb2-4cf7-b0ba-5344183de4fa	8d447186-52eb-472a-a97a-d721be7936d6	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	PREVIOUS_TOP_8	ACCEPTED	2026-06-02 11:15:27.995	2026-06-16 11:15:27.995	2026-06-02 11:15:27.995	\N	{"MAX_ROSTER": "22", "MIN_ROSTER": "16", "MAX_FOREIGN_PLAYERS": "5", "MIN_STADIUM_CAPACITY": "10000", "PARTICIPATION_FEE_VND": "1000000000", "MIN_STADIUM_FIFA_STARS": "2", "MAX_FOREIGN_PLAYERS_ON_FIELD": "3"}	2026-06-02 11:15:28.072	2026-06-02 11:15:28.072	\N
3100dc2e-50ad-44e6-914c-2711c419c96e	8d447186-52eb-472a-a97a-d721be7936d6	c11ee3ba-bcce-424a-994e-6477045af536	PREVIOUS_TOP_8	ACCEPTED	2026-06-02 11:15:27.995	2026-06-16 11:15:27.995	2026-06-02 11:15:27.995	\N	{"MAX_ROSTER": "22", "MIN_ROSTER": "16", "MAX_FOREIGN_PLAYERS": "5", "MIN_STADIUM_CAPACITY": "10000", "PARTICIPATION_FEE_VND": "1000000000", "MIN_STADIUM_FIFA_STARS": "2", "MAX_FOREIGN_PLAYERS_ON_FIELD": "3"}	2026-06-02 11:15:28.083	2026-06-02 11:15:28.083	\N
e3d66d77-4a1e-4358-9f00-7b1d32030bc6	8d447186-52eb-472a-a97a-d721be7936d6	3424bc38-f674-4378-a88c-1c9ec5b9a77c	PROMOTED	ACCEPTED	2026-06-02 11:15:27.995	2026-06-16 11:15:27.995	2026-06-02 11:15:27.995	\N	{"MAX_ROSTER": "22", "MIN_ROSTER": "16", "MAX_FOREIGN_PLAYERS": "5", "MIN_STADIUM_CAPACITY": "10000", "PARTICIPATION_FEE_VND": "1000000000", "MIN_STADIUM_FIFA_STARS": "2", "MAX_FOREIGN_PLAYERS_ON_FIELD": "3"}	2026-06-02 11:15:28.094	2026-06-02 11:15:28.094	Vô địch V.League 2 2024
f2f2cff1-58fa-4122-92cd-5d9b99b88baa	8d447186-52eb-472a-a97a-d721be7936d6	655df04f-5508-45f3-8032-fd657a753360	PROMOTED	ACCEPTED	2026-06-02 11:15:27.995	2026-06-16 11:15:27.995	2026-06-02 11:15:27.995	\N	{"MAX_ROSTER": "22", "MIN_ROSTER": "16", "MAX_FOREIGN_PLAYERS": "5", "MIN_STADIUM_CAPACITY": "10000", "PARTICIPATION_FEE_VND": "1000000000", "MIN_STADIUM_FIFA_STARS": "2", "MAX_FOREIGN_PLAYERS_ON_FIELD": "3"}	2026-06-02 11:15:28.104	2026-06-02 11:15:28.104	Á quân V.League 2 2024
c275e34f-a3c3-4820-9e21-d9d11ee59f04	8d447186-52eb-472a-a97a-d721be7936d6	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	REPLACEMENT	SENT	2026-06-02 11:15:27.995	2026-06-16 11:15:27.995	\N	\N	{"MAX_ROSTER": "22", "MIN_ROSTER": "16", "MAX_FOREIGN_PLAYERS": "5", "MIN_STADIUM_CAPACITY": "10000", "PARTICIPATION_FEE_VND": "1000000000", "MIN_STADIUM_FIFA_STARS": "2", "MAX_FOREIGN_PLAYERS_ON_FIELD": "3"}	2026-06-02 11:15:28.116	2026-06-02 11:15:28.116	\N
7309e6e3-65fc-47ea-9ce7-c6f01119a9d2	8d447186-52eb-472a-a97a-d721be7936d6	d41cdb24-5257-4d1c-96fc-20140a2314ed	REPLACEMENT	SENT	2026-06-02 11:15:27.995	2026-06-16 11:15:27.995	\N	\N	{"MAX_ROSTER": "22", "MIN_ROSTER": "16", "MAX_FOREIGN_PLAYERS": "5", "MIN_STADIUM_CAPACITY": "10000", "PARTICIPATION_FEE_VND": "1000000000", "MIN_STADIUM_FIFA_STARS": "2", "MAX_FOREIGN_PLAYERS_ON_FIELD": "3"}	2026-06-02 11:15:28.15	2026-06-02 11:15:28.15	\N
7f76e4d2-544d-490a-8f57-8bdb1a8155d8	8d447186-52eb-472a-a97a-d721be7936d6	83988147-bd67-49d5-81d3-0acb83dbc90c	REPLACEMENT	SENT	2026-06-02 11:15:27.995	2026-06-16 11:15:27.995	\N	\N	{"MAX_ROSTER": "22", "MIN_ROSTER": "16", "MAX_FOREIGN_PLAYERS": "5", "MIN_STADIUM_CAPACITY": "10000", "PARTICIPATION_FEE_VND": "1000000000", "MIN_STADIUM_FIFA_STARS": "2", "MAX_FOREIGN_PLAYERS_ON_FIELD": "3"}	2026-06-02 11:15:28.165	2026-06-02 11:15:28.165	\N
4291bd94-8b32-4b9a-97ab-de55dab829f6	8d447186-52eb-472a-a97a-d721be7936d6	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	REPLACEMENT	SENT	2026-06-02 11:15:27.995	2026-06-16 11:15:27.995	\N	\N	{"MAX_ROSTER": "22", "MIN_ROSTER": "16", "MAX_FOREIGN_PLAYERS": "5", "MIN_STADIUM_CAPACITY": "10000", "PARTICIPATION_FEE_VND": "1000000000", "MIN_STADIUM_FIFA_STARS": "2", "MAX_FOREIGN_PLAYERS_ON_FIELD": "3"}	2026-06-02 11:15:28.171	2026-06-02 11:15:28.171	\N
\.


--
-- Data for Name: team_manager_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_manager_assignments (id, user_id, season_id, team_id, created_at, updated_at) FROM stdin;
e965706b-c830-4e4d-ab77-281e99e00138	c503a297-efc7-479a-b4c9-9ca5774a54f0	8d447186-52eb-472a-a97a-d721be7936d6	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	2026-06-02 11:15:27.526	2026-06-02 11:15:27.526
5104658c-9075-4a6b-9c5d-6234d463e590	19a956fd-ed26-464f-9a01-c7d4f592ec63	8d447186-52eb-472a-a97a-d721be7936d6	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	2026-06-02 11:15:27.547	2026-06-02 11:15:27.547
cd0026a3-3dbe-4f8e-bbb5-018cd3046294	0b80d838-d87e-4724-8109-2875070c84b2	8d447186-52eb-472a-a97a-d721be7936d6	9f54615c-03ae-464b-adb4-50b9c1677d41	2026-06-02 11:15:27.571	2026-06-02 11:15:27.571
453b69b3-a490-472f-baa8-ad8f1e4acf91	4e40a754-cbc7-4d3c-a3b0-1a769d7240b6	8d447186-52eb-472a-a97a-d721be7936d6	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	2026-06-02 11:15:27.602	2026-06-02 11:15:27.602
ed39886b-2fae-47c3-9ac4-999096108836	b7d25a35-d644-49c5-85fc-b7e532aacc0f	8d447186-52eb-472a-a97a-d721be7936d6	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	2026-06-02 11:15:27.624	2026-06-02 11:15:27.624
95b557c7-8dcd-4898-a531-f3240627032a	105861c6-5d52-4f9e-9c0d-a1f3cbba19c0	8d447186-52eb-472a-a97a-d721be7936d6	df825052-1f68-4f44-857f-c2de07315fd2	2026-06-02 11:15:27.646	2026-06-02 11:15:27.646
982be375-6047-4faf-82f8-8487d03f21cd	6b278b18-4371-48ed-81d2-67eecedae0ab	8d447186-52eb-472a-a97a-d721be7936d6	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	2026-06-02 11:15:27.669	2026-06-02 11:15:27.669
68ad6b87-1eaa-43d1-8b29-e40fb6a7be72	1fbe0a37-0d6b-4b66-a9d4-a66f81569fe7	8d447186-52eb-472a-a97a-d721be7936d6	c11ee3ba-bcce-424a-994e-6477045af536	2026-06-02 11:15:27.675	2026-06-02 11:15:27.675
e5eb1968-40c1-4269-acac-485e48f8234c	108783ff-b6b0-47e0-bcc8-f034971caddb	8d447186-52eb-472a-a97a-d721be7936d6	3424bc38-f674-4378-a88c-1c9ec5b9a77c	2026-06-02 11:15:27.682	2026-06-02 11:15:27.682
f987d62b-31c2-48eb-9fb5-a77ceb0fc1a5	ab721b2b-87f3-4eb5-9af7-2cfa6ad59031	8d447186-52eb-472a-a97a-d721be7936d6	655df04f-5508-45f3-8032-fd657a753360	2026-06-02 11:15:27.689	2026-06-02 11:15:27.689
d9a451bf-f472-40ed-ada1-38b99fb08f01	f514705f-4213-4507-8a48-16db52cddec9	8d447186-52eb-472a-a97a-d721be7936d6	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	2026-06-02 11:15:27.696	2026-06-02 11:15:27.696
c7e5d93f-223e-43d7-8af9-89a0e4d677b4	fd494442-817b-4b95-b3eb-9575eb2dd167	8d447186-52eb-472a-a97a-d721be7936d6	d41cdb24-5257-4d1c-96fc-20140a2314ed	2026-06-02 11:15:27.722	2026-06-02 11:15:27.722
23b6205f-9b25-4c49-a4cc-41d0355b3001	650c9c30-95ba-4528-807b-2c9213d16831	8d447186-52eb-472a-a97a-d721be7936d6	83988147-bd67-49d5-81d3-0acb83dbc90c	2026-06-02 11:15:27.756	2026-06-02 11:15:27.756
26813f8f-ed74-4fdf-ab3e-327c1c385223	8485183b-0911-46fc-9a13-32672eb606e8	8d447186-52eb-472a-a97a-d721be7936d6	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	2026-06-02 11:15:27.778	2026-06-02 11:15:27.778
ba7ac1fd-57da-4848-a285-8a3c63727532	c503a297-efc7-479a-b4c9-9ca5774a54f0	0c9d20cf-500b-4ff6-8822-cd1819c0297e	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	2026-06-02 11:15:38.209	2026-06-02 11:15:38.209
c592cf5d-fe79-4f63-ba3b-8294574a8eb2	c503a297-efc7-479a-b4c9-9ca5774a54f0	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	2026-06-02 11:15:38.228	2026-06-02 11:15:38.228
aef08dfd-0f0e-46a6-bb11-acc37c23b156	19a956fd-ed26-464f-9a01-c7d4f592ec63	0c9d20cf-500b-4ff6-8822-cd1819c0297e	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	2026-06-02 11:15:38.326	2026-06-02 11:15:38.326
3e036901-48a0-4195-9782-f26f754506fb	19a956fd-ed26-464f-9a01-c7d4f592ec63	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	2026-06-02 11:15:38.343	2026-06-02 11:15:38.343
ff28ba3c-4b76-4248-b12e-55405a59ef7e	0b80d838-d87e-4724-8109-2875070c84b2	0c9d20cf-500b-4ff6-8822-cd1819c0297e	9f54615c-03ae-464b-adb4-50b9c1677d41	2026-06-02 11:15:38.414	2026-06-02 11:15:38.414
94d7b95c-c936-4efd-974c-bf8fd625e53b	0b80d838-d87e-4724-8109-2875070c84b2	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	9f54615c-03ae-464b-adb4-50b9c1677d41	2026-06-02 11:15:38.419	2026-06-02 11:15:38.419
ffed97c0-a19c-4e8f-9236-6155188525fc	4e40a754-cbc7-4d3c-a3b0-1a769d7240b6	0c9d20cf-500b-4ff6-8822-cd1819c0297e	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	2026-06-02 11:15:38.56	2026-06-02 11:15:38.56
bd6a15a0-90f4-489d-961c-2fdb0d42bb26	4e40a754-cbc7-4d3c-a3b0-1a769d7240b6	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	2026-06-02 11:15:38.565	2026-06-02 11:15:38.565
4311c67c-73b5-41b4-ac6a-d3fe42619213	6b278b18-4371-48ed-81d2-67eecedae0ab	0c9d20cf-500b-4ff6-8822-cd1819c0297e	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	2026-06-02 11:15:38.727	2026-06-02 11:15:38.727
18539ece-e349-4cdc-8a00-abf92f2c2d37	6b278b18-4371-48ed-81d2-67eecedae0ab	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	2026-06-02 11:15:38.742	2026-06-02 11:15:38.742
bb02467d-8b76-44b0-9453-c553abe46d5c	1fbe0a37-0d6b-4b66-a9d4-a66f81569fe7	0c9d20cf-500b-4ff6-8822-cd1819c0297e	c11ee3ba-bcce-424a-994e-6477045af536	2026-06-02 11:15:38.882	2026-06-02 11:15:38.882
1d9bae4d-5bf3-483f-b7eb-8ee4beb7ddd3	1fbe0a37-0d6b-4b66-a9d4-a66f81569fe7	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	c11ee3ba-bcce-424a-994e-6477045af536	2026-06-02 11:15:38.894	2026-06-02 11:15:38.894
cab09d37-07f2-4986-8bde-521c377bb299	105861c6-5d52-4f9e-9c0d-a1f3cbba19c0	0c9d20cf-500b-4ff6-8822-cd1819c0297e	df825052-1f68-4f44-857f-c2de07315fd2	2026-06-02 11:15:39.045	2026-06-02 11:15:39.045
2408c0c6-0f86-4ed9-9d4d-7138de687c4b	105861c6-5d52-4f9e-9c0d-a1f3cbba19c0	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	df825052-1f68-4f44-857f-c2de07315fd2	2026-06-02 11:15:39.049	2026-06-02 11:15:39.049
79ca18d1-dd91-49a3-87ed-b96c85432acd	b7d25a35-d644-49c5-85fc-b7e532aacc0f	0c9d20cf-500b-4ff6-8822-cd1819c0297e	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	2026-06-02 11:15:39.129	2026-06-02 11:15:39.129
79f7ebd9-5115-4324-8de4-aaad1a2b9c50	b7d25a35-d644-49c5-85fc-b7e532aacc0f	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	2026-06-02 11:15:39.132	2026-06-02 11:15:39.132
9f3b5809-8013-4145-a1c6-740bbcb5c94f	108783ff-b6b0-47e0-bcc8-f034971caddb	0c9d20cf-500b-4ff6-8822-cd1819c0297e	3424bc38-f674-4378-a88c-1c9ec5b9a77c	2026-06-02 11:15:39.177	2026-06-02 11:15:39.177
5303f42e-128e-49d0-bc7b-29d567f7fc81	108783ff-b6b0-47e0-bcc8-f034971caddb	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	3424bc38-f674-4378-a88c-1c9ec5b9a77c	2026-06-02 11:15:39.18	2026-06-02 11:15:39.18
80a76ada-6c03-442b-81c9-f68e6bd72165	ab721b2b-87f3-4eb5-9af7-2cfa6ad59031	0c9d20cf-500b-4ff6-8822-cd1819c0297e	655df04f-5508-45f3-8032-fd657a753360	2026-06-02 11:15:39.223	2026-06-02 11:15:39.223
4411d1e3-1a3b-494f-b8be-94e9849b05b8	ab721b2b-87f3-4eb5-9af7-2cfa6ad59031	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	655df04f-5508-45f3-8032-fd657a753360	2026-06-02 11:15:39.225	2026-06-02 11:15:39.225
e807a26f-3748-42b3-9aa3-77dc9728b028	796fb41e-1ae7-4cd8-b29e-caecd680e183	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	2026-06-02 11:15:39.993	2026-06-02 11:15:51.005
adc5f099-a603-4b92-99fa-24d8d2cdb1dd	2256d048-d0ac-4c7a-865a-15bbd74ad351	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	2026-06-02 11:15:40.255	2026-06-02 11:15:51.054
a9dd39f5-7252-4e5d-a454-aaae57a74c39	ea06c527-a2f7-4bfc-bdf0-94fbb4596ea8	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	812bcf01-a79f-4d7c-971a-68d2f79dedbf	2026-06-02 11:15:40.511	2026-06-02 11:15:51.111
fbe572cc-3861-4079-b7c6-1645b0eda44f	c15d34d8-4c53-477a-ac25-3c09a5b57bf4	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	bbaf22f6-6fd6-4198-a731-2293dff5361f	2026-06-02 11:15:40.742	2026-06-02 11:15:51.159
f60f8604-ffb1-4618-a008-d5f8c617881a	fbb44b5b-5266-45e6-ac73-856d68827a3a	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	3abf3147-a30b-45a7-801d-0d494314736f	2026-06-02 11:15:41.21	2026-06-02 11:15:51.216
4882880f-2901-4c5a-a0ea-8082ebb5d474	7d621cc7-b8f4-485b-b3a1-53cc5ca7093f	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	c4488d60-4eb1-49af-b503-1bce07a2548e	2026-06-02 11:15:41.947	2026-06-02 11:15:51.274
d4d562a2-e031-4ff1-a3c4-d16c7dab7b84	f766efe0-5273-497c-8ad5-d52d5aa577e8	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	3979babb-d543-4433-92e8-e2fc59ea6ae6	2026-06-02 11:15:42.474	2026-06-02 11:15:51.329
11babce4-7d2f-4bd7-88f1-53f17c75ed76	790f0156-6b4d-4418-bde9-fc2b2f62bde6	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	171c9c8d-b7f6-4831-bc9a-1e33ef451497	2026-06-02 11:15:43.065	2026-06-02 11:15:51.384
8436a8ae-36ef-4d9b-9e70-187a38c1b806	37b8e0e7-f4e5-4062-b9b3-45d9801cf614	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	2026-06-02 11:15:43.553	2026-06-02 11:15:51.439
89e0b00d-50fe-43e9-a71e-26a83ebe286b	588a6cd1-0027-48bd-805b-8f51919f85da	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	7ac6674c-a0a6-444e-854b-65bc7a85772d	2026-06-02 11:15:43.835	2026-06-02 11:15:51.499
6989db13-548e-449e-8635-dff992161277	aa4aaa00-b1ad-4665-9ebb-1386905ecfee	b9bac06d-ee70-4f36-9217-e8b1925fb7b1	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	2026-06-02 11:15:44.371	2026-06-02 11:15:51.563
e33a4a51-b947-4c44-a860-9849a206a900	796fb41e-1ae7-4cd8-b29e-caecd680e183	8d447186-52eb-472a-a97a-d721be7936d6	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	2026-06-02 11:29:29.1	2026-06-02 11:29:29.138
\.


--
-- Data for Name: team_manager_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_manager_requests (id, manager_id, request_type, status, team_id, proposed_team_name, proposed_team_short_name, proposed_team_city, proposed_team_logo_url, proposed_stadium_id, request_note, admin_note, reviewed_by_id, reviewed_at, created_at, updated_at, proposed_team_status, proposed_coach_name) FROM stdin;
\.


--
-- Data for Name: team_players; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_players (id, team_id, player_id, jersey_number, joined_at, left_at, created_at, updated_at) FROM stdin;
9aa8f128-e6ed-42c9-bf7e-96cef66b9fc9	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	e01002bf-fa3b-47ff-bdd5-0ea7cff2df15	1	2026-06-02 11:15:17.376	\N	2026-06-02 11:15:17.376	2026-06-02 11:15:17.376
adb146f8-c138-4912-ad9d-69a4afde4aa6	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	a84be76e-2772-4707-8a4b-549a3b628338	2	2026-06-02 11:15:17.396	\N	2026-06-02 11:15:17.396	2026-06-02 11:15:17.396
833a600c-03ad-451c-a5ae-303361467f40	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	79f6b0f2-ab89-4e53-9b6f-989882764602	3	2026-06-02 11:15:17.406	\N	2026-06-02 11:15:17.406	2026-06-02 11:15:17.406
69d2dbe4-ad2c-45d9-91a5-b6fefe92f8d4	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	6e13329e-8110-4820-a0b4-4cf2871f9105	4	2026-06-02 11:15:17.419	\N	2026-06-02 11:15:17.419	2026-06-02 11:15:17.419
b0a547e6-e15e-4c00-ac15-3e429d3fb5b8	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	ae2d0df3-32c4-4972-ab77-1fea86c05500	5	2026-06-02 11:15:17.436	\N	2026-06-02 11:15:17.436	2026-06-02 11:15:17.436
891cb6f0-6299-4f81-8cac-06c113bbd644	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	bc404298-9f05-41a1-afd4-1b07bf187605	6	2026-06-02 11:15:17.455	\N	2026-06-02 11:15:17.455	2026-06-02 11:15:17.455
d9bfc73c-1626-4602-94b4-9289d9ad2b4b	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	b579bd7b-bd19-417a-8928-53ba02ffae94	7	2026-06-02 11:15:17.476	\N	2026-06-02 11:15:17.476	2026-06-02 11:15:17.476
49271972-05c4-439e-8c50-e2ee5c9f8508	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	8f5acf7e-6f07-4060-9ef9-2c9f746ba0ca	8	2026-06-02 11:15:17.495	\N	2026-06-02 11:15:17.495	2026-06-02 11:15:17.495
92827ede-f4af-4bb0-b209-aa9d9a34481c	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	43b490ee-e98c-48a3-beba-196babf51752	9	2026-06-02 11:15:17.506	\N	2026-06-02 11:15:17.506	2026-06-02 11:15:17.506
c2548088-2b58-4403-beb5-88055ee3dbca	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	c045c3cc-aaa8-4e01-947e-825a4c5d7005	10	2026-06-02 11:15:17.513	\N	2026-06-02 11:15:17.513	2026-06-02 11:15:17.513
f68fde00-e4f6-4cb7-970c-571217ee5c17	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	9975f5c2-fa30-4e4d-b2c0-3a4d109dc769	11	2026-06-02 11:15:17.518	\N	2026-06-02 11:15:17.518	2026-06-02 11:15:17.518
e0ef4355-499f-45cf-b23b-73968b3e8a34	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	7ab87531-7fd9-4dab-87c9-464b9995a1eb	12	2026-06-02 11:15:17.537	\N	2026-06-02 11:15:17.537	2026-06-02 11:15:17.537
0ba32547-603a-40bc-9eb1-a75f087923ad	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	35fe4bf2-f604-47cd-8c89-7a427c1d833b	13	2026-06-02 11:15:17.548	\N	2026-06-02 11:15:17.548	2026-06-02 11:15:17.548
4261310d-18c5-47a0-a763-e8b77c464456	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	6a466d46-5ae4-4ae8-b1b8-91063f307b8e	14	2026-06-02 11:15:17.566	\N	2026-06-02 11:15:17.566	2026-06-02 11:15:17.566
3b254776-aeae-4860-9379-85a4cd483541	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	85313c8f-cbf4-49e7-a8af-f26b7e798deb	15	2026-06-02 11:15:17.583	\N	2026-06-02 11:15:17.583	2026-06-02 11:15:17.583
07e6d7ea-9165-444f-ae75-254035749905	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	2b5f5b67-8801-4c75-bbf4-aed321042ff6	16	2026-06-02 11:15:17.599	\N	2026-06-02 11:15:17.599	2026-06-02 11:15:17.599
2dcdaca0-d226-4c79-97be-ebc788491514	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	ac16b296-4e56-4599-9677-b0069346e77b	17	2026-06-02 11:15:17.609	\N	2026-06-02 11:15:17.609	2026-06-02 11:15:17.609
4497a9b2-60a8-44e3-b5a0-f439fc13fd9d	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	558e7a8f-ceab-4c21-9d5f-a3d90abb03c4	18	2026-06-02 11:15:17.616	\N	2026-06-02 11:15:17.616	2026-06-02 11:15:17.616
35d96c1c-faad-473b-8a43-07bc3e8e1a49	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	b6760f9c-1b2b-4131-9d2d-2d42b29e2659	19	2026-06-02 11:15:17.623	\N	2026-06-02 11:15:17.623	2026-06-02 11:15:17.623
0c2980ba-af3b-4a3a-981d-d0e48257d212	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	99f83c09-d112-4bff-bb1a-5dfe0929e4e9	20	2026-06-02 11:15:17.63	\N	2026-06-02 11:15:17.63	2026-06-02 11:15:17.63
a78c1287-2955-4a7b-aa6e-484f9b66a1fa	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	c86ab57e-995d-492b-8e8b-ba7a97773662	21	2026-06-02 11:15:17.639	\N	2026-06-02 11:15:17.639	2026-06-02 11:15:17.639
a1b516ef-272c-45b9-ba8a-a3df35431923	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	37566fad-d160-4c5b-8306-b8d3ba0ec595	22	2026-06-02 11:15:17.643	\N	2026-06-02 11:15:17.643	2026-06-02 11:15:17.643
e5dc91ab-2ae2-47b2-b67e-b9d5540a3b8a	9f54615c-03ae-464b-adb4-50b9c1677d41	ee067132-4d9c-4eae-b873-a1a7c5c8ead2	1	2026-06-02 11:15:17.816	\N	2026-06-02 11:15:17.816	2026-06-02 11:15:17.816
f19a01e6-3f9e-4dfc-b482-b4ae2223be23	9f54615c-03ae-464b-adb4-50b9c1677d41	1f3f1c01-a4db-4c84-857c-93865bd5b469	2	2026-06-02 11:15:17.821	\N	2026-06-02 11:15:17.821	2026-06-02 11:15:17.821
c927192d-6ce1-4da9-942f-ad2ee2679208	9f54615c-03ae-464b-adb4-50b9c1677d41	c47ca176-d05a-4b51-a1a3-9a8cd54b925b	3	2026-06-02 11:15:17.825	\N	2026-06-02 11:15:17.825	2026-06-02 11:15:17.825
59139853-933f-4cd1-bd91-a77c4070175c	9f54615c-03ae-464b-adb4-50b9c1677d41	c735827f-8c62-42a4-9ee6-2abb1f707533	4	2026-06-02 11:15:17.829	\N	2026-06-02 11:15:17.829	2026-06-02 11:15:17.829
1a0d3ab2-ed14-40bb-ab06-ee6136f37f12	9f54615c-03ae-464b-adb4-50b9c1677d41	81c33883-d719-4311-9d72-bb8680c299ff	5	2026-06-02 11:15:17.834	\N	2026-06-02 11:15:17.834	2026-06-02 11:15:17.834
acc06ab8-61a7-412e-9215-fa3036a014b6	9f54615c-03ae-464b-adb4-50b9c1677d41	60bd051d-5046-4297-8b53-894913081738	6	2026-06-02 11:15:17.841	\N	2026-06-02 11:15:17.841	2026-06-02 11:15:17.841
bc85473a-5574-4780-9eef-34925834a098	9f54615c-03ae-464b-adb4-50b9c1677d41	7d0687e7-98ae-466d-96b3-3c2c8a99ae25	7	2026-06-02 11:15:17.846	\N	2026-06-02 11:15:17.846	2026-06-02 11:15:17.846
5dc16bc4-ba0a-4dd3-a287-3bb0a8059d81	9f54615c-03ae-464b-adb4-50b9c1677d41	5fd6264b-e7cd-442f-95b0-332afe96014b	8	2026-06-02 11:15:17.852	\N	2026-06-02 11:15:17.852	2026-06-02 11:15:17.852
f77daa94-5c80-4826-8641-7006c10d80fe	9f54615c-03ae-464b-adb4-50b9c1677d41	46e19e34-73e3-43e1-a6d0-e048380bb2be	9	2026-06-02 11:15:17.856	\N	2026-06-02 11:15:17.856	2026-06-02 11:15:17.856
8c9fe9f5-1c44-4d49-b677-28f6f47b9829	9f54615c-03ae-464b-adb4-50b9c1677d41	68506790-b967-494b-a9e4-dda93f5e7eec	10	2026-06-02 11:15:17.86	\N	2026-06-02 11:15:17.86	2026-06-02 11:15:17.86
16752ecc-7120-4f62-94a2-4c5efe25ffa4	9f54615c-03ae-464b-adb4-50b9c1677d41	b5c2c374-3022-4ebe-a30c-80bf81d7d826	11	2026-06-02 11:15:17.867	\N	2026-06-02 11:15:17.867	2026-06-02 11:15:17.867
e299e76e-ada9-4cef-8c99-1acd6b0f9d80	9f54615c-03ae-464b-adb4-50b9c1677d41	e0b56077-ef75-42d8-ad91-1c0e44e17a1b	12	2026-06-02 11:15:17.871	\N	2026-06-02 11:15:17.871	2026-06-02 11:15:17.871
74e005a1-ce5a-4a30-b317-00ab00bb71f7	9f54615c-03ae-464b-adb4-50b9c1677d41	eb3c6d80-4872-4e11-82e9-73cca51a56a6	13	2026-06-02 11:15:17.875	\N	2026-06-02 11:15:17.875	2026-06-02 11:15:17.875
afa5d8dc-5a64-4788-aafb-beb80694074a	9f54615c-03ae-464b-adb4-50b9c1677d41	07d82480-e721-46cd-a4b4-510e661b8d6d	14	2026-06-02 11:15:17.881	\N	2026-06-02 11:15:17.881	2026-06-02 11:15:17.881
a88eec96-e86a-4162-9666-eefccb936787	9f54615c-03ae-464b-adb4-50b9c1677d41	5d2ed8a3-b293-4f4b-9c13-400e2e8f0b4e	15	2026-06-02 11:15:17.89	\N	2026-06-02 11:15:17.89	2026-06-02 11:15:17.89
76311ea3-0b57-44aa-a0ac-74ffb61d2d5f	9f54615c-03ae-464b-adb4-50b9c1677d41	741b421a-ed7e-4167-b718-75f7a69dde85	16	2026-06-02 11:15:17.894	\N	2026-06-02 11:15:17.894	2026-06-02 11:15:17.894
1b7b5f1d-e04e-412b-aa69-cee60e17f01b	9f54615c-03ae-464b-adb4-50b9c1677d41	60676704-830a-4b5a-b8ad-4e26f7f2f73c	17	2026-06-02 11:15:17.9	\N	2026-06-02 11:15:17.9	2026-06-02 11:15:17.9
a4466c9c-452a-4452-82d7-21d8d8b76264	9f54615c-03ae-464b-adb4-50b9c1677d41	22e87d5b-709b-474e-8abe-3df12128c413	18	2026-06-02 11:15:17.906	\N	2026-06-02 11:15:17.906	2026-06-02 11:15:17.906
1550da8d-a106-491e-9afd-68d6b5c16e51	9f54615c-03ae-464b-adb4-50b9c1677d41	3417e483-f0c7-499f-8d1b-bc919f0e2ee6	19	2026-06-02 11:15:17.911	\N	2026-06-02 11:15:17.911	2026-06-02 11:15:17.911
cbc60275-4ed4-4301-8f53-3469c3438acf	9f54615c-03ae-464b-adb4-50b9c1677d41	ea25ab2e-4cdc-4073-a1ad-5d56428fbaba	20	2026-06-02 11:15:17.92	\N	2026-06-02 11:15:17.92	2026-06-02 11:15:17.92
49bdbcac-f414-4989-a7f4-28080c178a76	9f54615c-03ae-464b-adb4-50b9c1677d41	973f5ef4-63ca-45ea-93ea-0d541bd3cd0c	21	2026-06-02 11:15:17.931	\N	2026-06-02 11:15:17.931	2026-06-02 11:15:17.931
13539c16-b2a7-46a8-88d2-49548efa2305	9f54615c-03ae-464b-adb4-50b9c1677d41	4ff0de8a-29b6-41c9-8d7c-d5420a9a2f3e	22	2026-06-02 11:15:17.939	\N	2026-06-02 11:15:17.939	2026-06-02 11:15:17.939
80e80b97-2045-4d71-9228-dec5b7631829	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	555d8e12-17b7-452a-817a-983759cbd245	1	2026-06-02 11:15:18.431	\N	2026-06-02 11:15:18.431	2026-06-02 11:15:18.431
3c24c1ed-aa5c-4e00-a12a-ef88457d435f	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	ad6181d5-2c1a-4ef8-9c89-9b8018269fa9	2	2026-06-02 11:15:18.442	\N	2026-06-02 11:15:18.442	2026-06-02 11:15:18.442
ca2cd00e-aabe-4d1a-a0ab-6e1644ad316a	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	acb8d8d9-813f-4c76-bae6-de89b739ec0c	3	2026-06-02 11:15:18.454	\N	2026-06-02 11:15:18.454	2026-06-02 11:15:18.454
94b27e25-ca92-41a0-96c2-1321f55624c9	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	880f4e45-ee17-46ed-b2ff-09652b1b8bee	4	2026-06-02 11:15:18.465	\N	2026-06-02 11:15:18.465	2026-06-02 11:15:18.465
8e0a5fe3-4a6a-483f-9522-9e4afe12d10a	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	377112a3-c42d-45b9-8c25-606053bd0344	5	2026-06-02 11:15:18.47	\N	2026-06-02 11:15:18.47	2026-06-02 11:15:18.47
d7a53aa5-0d9d-4f8d-ac0b-50c87d63cfb0	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	c4d9cd6b-f2d9-4681-9a81-d9cb5065b29e	6	2026-06-02 11:15:18.481	\N	2026-06-02 11:15:18.481	2026-06-02 11:15:18.481
88eb1e2a-f014-4374-b31d-6fda4ebadfa4	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	febe55b1-a0da-42e8-8ce6-8fbad18231ba	7	2026-06-02 11:15:18.503	\N	2026-06-02 11:15:18.503	2026-06-02 11:15:18.503
9f061b23-3b7c-41d5-a909-3d17dd9a1330	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	ecadc2e8-2017-43ee-9652-da8ac444828d	8	2026-06-02 11:15:18.523	\N	2026-06-02 11:15:18.523	2026-06-02 11:15:18.523
172a43e9-140c-4231-ad5c-aef43ffc098e	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	a1b73a7a-e57b-45c3-a9fe-dc2d235bd577	9	2026-06-02 11:15:18.542	\N	2026-06-02 11:15:18.542	2026-06-02 11:15:18.542
df46e52c-64a9-4d12-9187-3ca4b1f294f9	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	af0d3f1f-6bc4-42c0-be7b-d2c4ae7b1daa	10	2026-06-02 11:15:18.554	\N	2026-06-02 11:15:18.554	2026-06-02 11:15:18.554
cc343ef3-5ac6-41c5-b2cb-dde011208d69	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	ceffc772-ad99-4629-a891-cf2e290ff530	11	2026-06-02 11:15:18.566	\N	2026-06-02 11:15:18.566	2026-06-02 11:15:18.566
7f621183-d0aa-4997-aaaf-8eceb93b561d	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	97a58d26-2347-4cdd-9eec-664adf1f9259	12	2026-06-02 11:15:18.587	\N	2026-06-02 11:15:18.587	2026-06-02 11:15:18.587
f2c4e585-b866-4640-8e2d-48b29dd8a55f	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	1400c73a-755b-4fee-a970-5d79bf410597	13	2026-06-02 11:15:18.592	\N	2026-06-02 11:15:18.592	2026-06-02 11:15:18.592
84e59609-b8da-41ce-8eb0-757c8dd136ac	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	9f0eedf2-f842-4723-906d-b885295b032b	14	2026-06-02 11:15:18.602	\N	2026-06-02 11:15:18.602	2026-06-02 11:15:18.602
6d3b2a13-7ae1-49ec-868f-897acbd0e50c	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	3e0dce3f-45c9-4ae0-90a0-aeaa26e4ea03	15	2026-06-02 11:15:18.612	\N	2026-06-02 11:15:18.612	2026-06-02 11:15:18.612
091e9ce0-be5a-4562-b1c6-a4af02d52904	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	6f3f7407-3a80-4a97-b845-397a7ba67a35	16	2026-06-02 11:15:18.623	\N	2026-06-02 11:15:18.623	2026-06-02 11:15:18.623
25eccfe1-ae87-4114-8df9-932bae0b8e5c	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	22aeb6bd-366e-4ae0-8d6f-e58210fccbd7	17	2026-06-02 11:15:18.634	\N	2026-06-02 11:15:18.634	2026-06-02 11:15:18.634
452134e0-d63d-4fa9-b290-53f2f6e8c8a9	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	80f9e6eb-3ec4-4fbd-9157-8758e25fb219	23	2026-06-02 11:15:17.649	2026-05-24 12:00:00	2026-06-02 11:15:17.649	2026-06-02 11:15:39.081
a633cf33-8a01-462f-b694-f3a9a5df33c8	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	b9f853ea-149f-4226-a80e-815c55c3bbe6	24	2026-06-02 11:15:17.655	2026-05-24 12:00:00	2026-06-02 11:15:17.655	2026-06-02 11:15:39.081
04791ffb-4978-4311-9294-33c0113e9d1a	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	d3453aae-0fc9-4677-8474-db274b83351d	25	2026-06-02 11:15:17.658	2026-05-24 12:00:00	2026-06-02 11:15:17.658	2026-06-02 11:15:39.081
ea4142f9-4846-4302-b94d-0f45423b8d10	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	d0a76915-8b65-455c-b94d-8bdfdc8f5873	26	2026-06-02 11:15:17.662	2026-05-24 12:00:00	2026-06-02 11:15:17.662	2026-06-02 11:15:39.081
6fdd274b-2c98-4d00-8d10-6795bd91d7e4	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	7dba25ec-6c10-41e0-ace7-f51354e3cbc2	27	2026-06-02 11:15:17.667	2026-05-24 12:00:00	2026-06-02 11:15:17.667	2026-06-02 11:15:39.081
45e0bb16-1644-438f-b0e7-ffdd8bc999c6	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	de904f4a-565f-46de-8a3f-076267072212	28	2026-06-02 11:15:17.672	2026-05-24 12:00:00	2026-06-02 11:15:17.672	2026-06-02 11:15:39.081
1cb93d6e-8b24-474d-9740-80da530c1c77	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	adc3e3c3-3089-45f7-94b2-e50e2a0f45b7	18	2026-06-02 11:15:18.644	\N	2026-06-02 11:15:18.644	2026-06-02 11:15:18.644
1e175ba4-cf68-42e1-9053-900242308a23	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	fa224542-f66f-4ef3-bb81-8b4662caaf1d	19	2026-06-02 11:15:18.655	\N	2026-06-02 11:15:18.655	2026-06-02 11:15:18.655
282613dc-3794-4831-92c1-b2161ddfc78f	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	1151d340-4c5a-43d9-972b-9d4588f5b161	20	2026-06-02 11:15:18.667	\N	2026-06-02 11:15:18.667	2026-06-02 11:15:18.667
f1b2fa50-aaed-4e93-981d-c214a41f034c	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	99cc25fd-51c4-4272-bb12-40c7d12b2529	21	2026-06-02 11:15:18.678	\N	2026-06-02 11:15:18.678	2026-06-02 11:15:18.678
2cd36360-b7a3-4f7f-9d3f-fd0f01bba057	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	d2980b91-de4c-4869-a239-87c629f1ed0b	22	2026-06-02 11:15:18.689	\N	2026-06-02 11:15:18.689	2026-06-02 11:15:18.689
4c218a61-415f-4da9-8059-dd4e4846b21c	df825052-1f68-4f44-857f-c2de07315fd2	dfc9fdea-ed8e-47e5-b64a-69b47f38747e	1	2026-06-02 11:15:19.053	\N	2026-06-02 11:15:19.053	2026-06-02 11:15:19.053
fb6b98b5-60cf-4959-ad7e-58293556eee2	df825052-1f68-4f44-857f-c2de07315fd2	9cfbe386-836b-46b0-b580-a8afa83348d3	2	2026-06-02 11:15:19.063	\N	2026-06-02 11:15:19.063	2026-06-02 11:15:19.063
9aff7346-6296-4669-a9b7-f944370e5fe8	df825052-1f68-4f44-857f-c2de07315fd2	83c4fb14-bf49-46ca-89f2-0a0055dc09ef	3	2026-06-02 11:15:19.074	\N	2026-06-02 11:15:19.074	2026-06-02 11:15:19.074
05bd9f4d-29b5-4ee5-907b-048e72f06cdd	df825052-1f68-4f44-857f-c2de07315fd2	4c5db777-5925-4259-b331-5cf0ac5450d1	4	2026-06-02 11:15:19.085	\N	2026-06-02 11:15:19.085	2026-06-02 11:15:19.085
4372e0e9-c591-49c9-a5c1-3e5ff18c21a8	df825052-1f68-4f44-857f-c2de07315fd2	237f4abf-af95-4a91-b823-a0935c5f102c	5	2026-06-02 11:15:19.096	\N	2026-06-02 11:15:19.096	2026-06-02 11:15:19.096
8133992a-13b7-49ae-a937-66c11d15d3f0	df825052-1f68-4f44-857f-c2de07315fd2	48445a7d-7827-4574-82c3-87541339f9a9	6	2026-06-02 11:15:19.107	\N	2026-06-02 11:15:19.107	2026-06-02 11:15:19.107
97e64cc3-2244-4296-97bc-8bad3bb97e5e	df825052-1f68-4f44-857f-c2de07315fd2	8ee43ed4-693f-43be-bf47-42e00bb7db49	7	2026-06-02 11:15:19.118	\N	2026-06-02 11:15:19.118	2026-06-02 11:15:19.118
0982bc9f-b902-4aee-9113-cfe48d880f2d	df825052-1f68-4f44-857f-c2de07315fd2	45a3236c-a1b5-47b5-8266-36e94c50a9b6	8	2026-06-02 11:15:19.129	\N	2026-06-02 11:15:19.129	2026-06-02 11:15:19.129
678dcfa8-b630-4cd5-8d82-ffe75d4744c6	df825052-1f68-4f44-857f-c2de07315fd2	9cf6fefd-f636-48b2-ae2b-ab97e9b910bb	9	2026-06-02 11:15:19.14	\N	2026-06-02 11:15:19.14	2026-06-02 11:15:19.14
3cbd5c21-a60f-48e2-bbbd-8b2860c13c04	df825052-1f68-4f44-857f-c2de07315fd2	9192f495-0b42-4858-a0ba-6512175743c1	10	2026-06-02 11:15:19.154	\N	2026-06-02 11:15:19.154	2026-06-02 11:15:19.154
e43f3781-687e-4161-a730-7f0f2ff97cc7	df825052-1f68-4f44-857f-c2de07315fd2	44f8fa9f-d948-44fa-8995-110f7077fe60	11	2026-06-02 11:15:19.176	\N	2026-06-02 11:15:19.176	2026-06-02 11:15:19.176
83010c7e-f9a0-4e1d-9b6e-d25272e64747	df825052-1f68-4f44-857f-c2de07315fd2	8b907f31-a457-47c8-912f-537d1b685ee2	12	2026-06-02 11:15:19.184	\N	2026-06-02 11:15:19.184	2026-06-02 11:15:19.184
918e2049-b2f3-4ea2-9772-2d62a795ebff	df825052-1f68-4f44-857f-c2de07315fd2	34f8950e-7501-406c-bfc1-a87ea63346d9	13	2026-06-02 11:15:19.189	\N	2026-06-02 11:15:19.189	2026-06-02 11:15:19.189
10517e5b-ebc2-4632-b0c4-f252c8615a95	df825052-1f68-4f44-857f-c2de07315fd2	5d565b26-05f6-426c-b980-8d3713745836	14	2026-06-02 11:15:19.203	\N	2026-06-02 11:15:19.203	2026-06-02 11:15:19.203
f92fda28-0caa-4f7e-9957-cffae12dbc77	df825052-1f68-4f44-857f-c2de07315fd2	b8d8baaf-eee1-4ac8-b175-3197369211fd	15	2026-06-02 11:15:19.213	\N	2026-06-02 11:15:19.213	2026-06-02 11:15:19.213
44145fde-3e7a-4940-8c2c-2b38b80394c9	df825052-1f68-4f44-857f-c2de07315fd2	6ad3d924-b654-4369-8665-e47844567ca1	16	2026-06-02 11:15:19.226	\N	2026-06-02 11:15:19.226	2026-06-02 11:15:19.226
69a3db03-5a73-45b2-9a37-5bafc6b2621f	df825052-1f68-4f44-857f-c2de07315fd2	b3dd562c-ebc3-429e-af21-576e797dc54b	17	2026-06-02 11:15:19.229	\N	2026-06-02 11:15:19.229	2026-06-02 11:15:19.229
2e734521-b755-435d-964b-640a1dd4fabb	df825052-1f68-4f44-857f-c2de07315fd2	083c54e2-0c3b-464b-86e4-fdaa38327498	18	2026-06-02 11:15:19.242	\N	2026-06-02 11:15:19.242	2026-06-02 11:15:19.242
bcfafb65-c9cb-4b94-818d-93764695ff4e	df825052-1f68-4f44-857f-c2de07315fd2	a31c2086-405e-4586-adce-63c0f495c538	19	2026-06-02 11:15:19.246	\N	2026-06-02 11:15:19.246	2026-06-02 11:15:19.246
1f91f679-bf9e-431c-8ad7-cf828ed59032	df825052-1f68-4f44-857f-c2de07315fd2	ead4b0d9-ad83-4530-a9f8-d1d22f3721be	20	2026-06-02 11:15:19.257	\N	2026-06-02 11:15:19.257	2026-06-02 11:15:19.257
9cb94e62-fc97-4a5d-9b5d-aecdcee0c666	df825052-1f68-4f44-857f-c2de07315fd2	7ad4e7a3-ee22-4363-abcc-41e5acf0624a	21	2026-06-02 11:15:19.269	\N	2026-06-02 11:15:19.269	2026-06-02 11:15:19.269
57db6161-9a2d-42de-9ff1-6184c67c50c7	df825052-1f68-4f44-857f-c2de07315fd2	18c21802-e0a9-4d9b-8977-3cc5e55f5eb5	22	2026-06-02 11:15:19.279	\N	2026-06-02 11:15:19.279	2026-06-02 11:15:19.279
37055177-32c7-42e1-b076-c21ca1a4c0e2	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	248f3dfb-39e4-48c4-be5c-4411636a2e69	1	2026-06-02 11:15:19.697	\N	2026-06-02 11:15:19.697	2026-06-02 11:15:19.697
1d86b2cd-6ca3-4caa-8032-ffd26d7de267	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	8e04d47a-04ff-4c0c-981e-71c716104844	2	2026-06-02 11:15:19.708	\N	2026-06-02 11:15:19.708	2026-06-02 11:15:19.708
20cd80db-96ed-49f9-a0da-90baedefb220	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	59c80b78-0ea4-4658-ae66-ee440a1acb6b	3	2026-06-02 11:15:19.72	\N	2026-06-02 11:15:19.72	2026-06-02 11:15:19.72
a5c9dd9c-6aa4-45ab-980b-1c02961a6873	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	b7af4cd6-5f29-4972-9636-284404455bac	4	2026-06-02 11:15:19.74	\N	2026-06-02 11:15:19.74	2026-06-02 11:15:19.74
5c803a31-3fe7-4960-b6bf-28e11ef31c3d	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	a2e5a8ed-2fa2-45ac-85cd-5d90a336ee74	5	2026-06-02 11:15:19.755	\N	2026-06-02 11:15:19.755	2026-06-02 11:15:19.755
8036269a-b967-487a-aa50-24a7defb3fd7	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	081b3c23-209e-430c-8b81-7333f0aa79a6	6	2026-06-02 11:15:19.773	\N	2026-06-02 11:15:19.773	2026-06-02 11:15:19.773
845bbb94-9d96-4ced-8fa3-fbcb8aa5bcb7	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	8ceadd63-55ba-40d2-8f3c-52df24c40c17	7	2026-06-02 11:15:19.794	\N	2026-06-02 11:15:19.794	2026-06-02 11:15:19.794
d63c3399-b8f6-4413-8636-e35494ac7e43	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	30e59fa3-e0df-473c-b976-4fe0aebe1c4d	8	2026-06-02 11:15:19.803	\N	2026-06-02 11:15:19.803	2026-06-02 11:15:19.803
65f872eb-2853-4269-b5c2-8fcc2c84c304	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	e9cc0414-19cb-4ce7-86a5-2b8356172b7e	9	2026-06-02 11:15:19.823	\N	2026-06-02 11:15:19.823	2026-06-02 11:15:19.823
f400bda2-a891-4771-b246-e821c51dde27	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	abcdcb4b-ce4d-4c4a-9244-993b93f12a4b	10	2026-06-02 11:15:19.828	\N	2026-06-02 11:15:19.828	2026-06-02 11:15:19.828
f30688e6-ff6d-49c8-998e-075f95795a21	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	6a48f670-e91a-48e3-a792-f35ce0a77c37	11	2026-06-02 11:15:19.838	\N	2026-06-02 11:15:19.838	2026-06-02 11:15:19.838
c3b59641-5d2c-4727-925f-3892b69641c0	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	cfc148bb-d849-4178-a703-931e79cacf61	12	2026-06-02 11:15:19.85	\N	2026-06-02 11:15:19.85	2026-06-02 11:15:19.85
3436026f-53c3-4cf3-a5f6-5928bfca3275	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	1e88149c-a80c-4cfb-9cd9-4e9cde03b325	13	2026-06-02 11:15:19.871	\N	2026-06-02 11:15:19.871	2026-06-02 11:15:19.871
6fde41c1-62b6-4a0d-96fa-46efa645ffb4	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	3389df71-c069-4fe8-ab83-8bc0cf0434f4	14	2026-06-02 11:15:19.89	\N	2026-06-02 11:15:19.89	2026-06-02 11:15:19.89
7eee89aa-be6c-47cd-8ddd-e353506aa92e	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	907ab923-9f39-4304-8a68-81030fdf2f01	15	2026-06-02 11:15:19.902	\N	2026-06-02 11:15:19.902	2026-06-02 11:15:19.902
f1468f3c-7ffe-4c56-a294-49c003e38ad3	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	ed0c2cc6-cb90-4ad6-ae77-36cc5a102e95	16	2026-06-02 11:15:19.912	\N	2026-06-02 11:15:19.912	2026-06-02 11:15:19.912
4c471ac1-05dc-450a-ad75-c3dc619fb093	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	b3f559ed-95c2-4c77-8731-dc68ff546a6b	17	2026-06-02 11:15:19.923	\N	2026-06-02 11:15:19.923	2026-06-02 11:15:19.923
ba5cecf5-1347-4207-8d75-322523315603	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	3c6f9ffc-7c59-4fed-860a-3f43bac6833d	18	2026-06-02 11:15:19.935	\N	2026-06-02 11:15:19.935	2026-06-02 11:15:19.935
6e8f9922-a4c9-40aa-8f3d-57eba2f05bc3	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	29d1923b-b2c6-4f7e-9a1b-27e6aeb043e9	19	2026-06-02 11:15:19.954	\N	2026-06-02 11:15:19.954	2026-06-02 11:15:19.954
99f2894b-bd6d-445d-926a-ad50fd60fd67	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	76e4673c-256a-4fac-8a1f-aea34e7eee38	20	2026-06-02 11:15:19.966	\N	2026-06-02 11:15:19.966	2026-06-02 11:15:19.966
dcfee4bd-39d4-43ee-8116-de530a523cab	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	1f7c9e5f-4864-4efc-a778-e111fcd2166b	21	2026-06-02 11:15:19.995	\N	2026-06-02 11:15:19.995	2026-06-02 11:15:19.995
80bfd7c2-ac72-418f-8a83-cf1e146e456e	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	ae87d895-59bb-467e-b4a1-b44570b8d9ff	22	2026-06-02 11:15:20	\N	2026-06-02 11:15:20	2026-06-02 11:15:20
6b55a630-c8cb-4751-8830-d6cde7cf2e7b	83988147-bd67-49d5-81d3-0acb83dbc90c	f3d7511b-0149-460a-9d29-e123f68762c3	1	2026-06-02 11:15:20.402	\N	2026-06-02 11:15:20.402	2026-06-02 11:15:20.402
b4b8100b-5514-4ef7-9ccb-4c2e19d7e5b4	83988147-bd67-49d5-81d3-0acb83dbc90c	e009f693-1bad-4058-b095-f5598bc66d32	2	2026-06-02 11:15:20.413	\N	2026-06-02 11:15:20.413	2026-06-02 11:15:20.413
e532dd85-53fb-4bfc-aa28-69128726417e	83988147-bd67-49d5-81d3-0acb83dbc90c	c15776a3-09b3-4db5-a77c-396eb7ee328c	3	2026-06-02 11:15:20.425	\N	2026-06-02 11:15:20.425	2026-06-02 11:15:20.425
23a96593-22bf-4b3e-be69-f989a74c076e	83988147-bd67-49d5-81d3-0acb83dbc90c	485a6775-f9b8-4fc8-a106-b01b013f79e5	4	2026-06-02 11:15:20.436	\N	2026-06-02 11:15:20.436	2026-06-02 11:15:20.436
b6c06089-463a-459e-bca3-a7f5a05684c5	83988147-bd67-49d5-81d3-0acb83dbc90c	0dc48db9-e0e0-4cae-8b73-b00e1d10fa8a	5	2026-06-02 11:15:20.447	\N	2026-06-02 11:15:20.447	2026-06-02 11:15:20.447
62ffa4f6-3cf2-40c0-b121-94c3459697ba	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	04f90a4f-db7e-4bdb-8b2d-4635a6d074c7	23	2026-06-02 11:15:18.699	2026-05-24 12:00:00	2026-06-02 11:15:18.699	2026-06-02 11:15:38.598
e7142602-5d50-418d-939d-8aa4b565001e	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	2f0d0915-69e1-470c-9bcd-f1878174d1ae	24	2026-06-02 11:15:18.71	2026-05-24 12:00:00	2026-06-02 11:15:18.71	2026-06-02 11:15:38.598
5c4590c6-19e5-4243-843b-976a60a045d0	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	ff43cf28-5b09-4b5b-b2d8-c4d6ed65ebb0	25	2026-06-02 11:15:18.721	2026-05-24 12:00:00	2026-06-02 11:15:18.721	2026-06-02 11:15:38.598
892839c8-dc6c-4ef2-a8f0-9e41ef442d7a	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	905df635-54dd-4be1-8335-59bb231e197c	26	2026-06-02 11:15:18.732	2026-05-24 12:00:00	2026-06-02 11:15:18.732	2026-06-02 11:15:38.598
6f1a8d2b-0dd9-4a02-aabc-3fa8babc1bc8	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	a1e6e78f-0d43-4fbd-93cc-29becafda938	27	2026-06-02 11:15:18.742	2026-05-24 12:00:00	2026-06-02 11:15:18.742	2026-06-02 11:15:38.598
0a1b9fbc-d370-4903-9161-04b18e99be84	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	2f213449-ff48-4bc2-8563-62de5de3d7cb	28	2026-06-02 11:15:18.753	2026-05-24 12:00:00	2026-06-02 11:15:18.753	2026-06-02 11:15:38.598
b59ddc45-ee1c-4bfe-8925-97a214a1a71e	df825052-1f68-4f44-857f-c2de07315fd2	5f7e4cf9-fded-4049-a929-a867c6cb2161	23	2026-06-02 11:15:19.29	2026-05-24 12:00:00	2026-06-02 11:15:19.29	2026-06-02 11:15:38.939
e13154b8-d0a0-4958-a50a-0b57e93629bc	df825052-1f68-4f44-857f-c2de07315fd2	cd17f34a-1a87-4a95-8505-20728b3f2c6d	24	2026-06-02 11:15:19.302	2026-05-24 12:00:00	2026-06-02 11:15:19.302	2026-06-02 11:15:38.939
c37998b7-3688-4357-8696-96414eb3986f	df825052-1f68-4f44-857f-c2de07315fd2	2ff5c134-c2e4-477b-842f-b84cbb9ea0a7	25	2026-06-02 11:15:19.313	2026-05-24 12:00:00	2026-06-02 11:15:19.313	2026-06-02 11:15:38.939
f9fc372a-67f7-4530-a96b-e0cb9e417d98	df825052-1f68-4f44-857f-c2de07315fd2	bb5a986b-eb19-4751-a10f-2f42113c5e41	26	2026-06-02 11:15:19.324	2026-05-24 12:00:00	2026-06-02 11:15:19.324	2026-06-02 11:15:38.939
a6a7fd3f-c284-4ab9-b772-f086f74b89d0	df825052-1f68-4f44-857f-c2de07315fd2	858b9386-c81f-41c6-982f-7aaf8be2a641	27	2026-06-02 11:15:19.336	2026-05-24 12:00:00	2026-06-02 11:15:19.336	2026-06-02 11:15:38.939
6cf9c96b-9a81-4783-a4ef-de959d1954ec	df825052-1f68-4f44-857f-c2de07315fd2	79ea4510-46eb-4d69-8ef9-362eda885b18	28	2026-06-02 11:15:19.339	2026-05-24 12:00:00	2026-06-02 11:15:19.339	2026-06-02 11:15:38.939
cf9b347c-3726-4b30-bb7a-1745ddbb00dc	df825052-1f68-4f44-857f-c2de07315fd2	cbed92cc-3988-4480-ba0a-5b7519fa52d9	29	2026-06-02 11:15:19.352	2026-05-24 12:00:00	2026-06-02 11:15:19.352	2026-06-02 11:15:38.939
eb1bd283-d9f7-4b46-8439-3ff4d6bcc7ba	83988147-bd67-49d5-81d3-0acb83dbc90c	e7de7f7b-e1c5-4839-8aad-d3afa1f7a55a	6	2026-06-02 11:15:20.458	\N	2026-06-02 11:15:20.458	2026-06-02 11:15:20.458
deb3531d-3acd-43e6-b2d1-c02a69df6c88	83988147-bd67-49d5-81d3-0acb83dbc90c	d7e79452-437a-4cef-bdcd-d058084a3ee1	7	2026-06-02 11:15:20.469	\N	2026-06-02 11:15:20.469	2026-06-02 11:15:20.469
7dee1f88-470e-4f48-975e-9db50a057c5c	83988147-bd67-49d5-81d3-0acb83dbc90c	68082ca4-faba-4bf1-a7c5-4f3dec332aac	8	2026-06-02 11:15:20.479	\N	2026-06-02 11:15:20.479	2026-06-02 11:15:20.479
44106265-0311-4b16-ab21-2088c25ee241	83988147-bd67-49d5-81d3-0acb83dbc90c	a78cfbb4-a51a-4956-a2a2-c43af04ae698	9	2026-06-02 11:15:20.49	\N	2026-06-02 11:15:20.49	2026-06-02 11:15:20.49
a3620e43-0851-4253-bc84-145593f561db	83988147-bd67-49d5-81d3-0acb83dbc90c	5c9314fc-9b76-4f82-93e9-9cf96315b61c	10	2026-06-02 11:15:20.501	\N	2026-06-02 11:15:20.501	2026-06-02 11:15:20.501
81a108e8-a7b6-4712-aa25-12708025c474	83988147-bd67-49d5-81d3-0acb83dbc90c	14cf2ee6-34c5-4231-8dfa-40c58471f102	11	2026-06-02 11:15:20.513	\N	2026-06-02 11:15:20.513	2026-06-02 11:15:20.513
0d74d400-1512-47d8-a1c0-7e8b67876e53	83988147-bd67-49d5-81d3-0acb83dbc90c	04a89b6a-23b9-48eb-ad18-ffb44597415f	12	2026-06-02 11:15:20.523	\N	2026-06-02 11:15:20.523	2026-06-02 11:15:20.523
645ec96c-09ca-438c-b3b2-0c3564062770	83988147-bd67-49d5-81d3-0acb83dbc90c	6bd95540-bd71-4771-92d1-10d0382ff2b0	13	2026-06-02 11:15:20.535	\N	2026-06-02 11:15:20.535	2026-06-02 11:15:20.535
4d596e2d-479e-46ad-8176-f28eb5705d50	83988147-bd67-49d5-81d3-0acb83dbc90c	8a267388-283f-49f8-b73a-96e49994f43e	14	2026-06-02 11:15:20.547	\N	2026-06-02 11:15:20.547	2026-06-02 11:15:20.547
7b7da652-386f-4450-ab7c-cb4037856bd7	83988147-bd67-49d5-81d3-0acb83dbc90c	47b7b3a3-7216-4ee9-9a24-7124efa5e906	15	2026-06-02 11:15:20.557	\N	2026-06-02 11:15:20.557	2026-06-02 11:15:20.557
161b78c3-eae5-47ef-bc66-b7821e6d9f81	83988147-bd67-49d5-81d3-0acb83dbc90c	5c606a29-d7bd-43ad-8a90-e85625b99ef6	16	2026-06-02 11:15:20.568	\N	2026-06-02 11:15:20.568	2026-06-02 11:15:20.568
820b2fd4-f7db-4dea-8c95-72583136db2d	83988147-bd67-49d5-81d3-0acb83dbc90c	d4fe5813-8f6d-4160-b9ce-45f8af950cac	17	2026-06-02 11:15:20.58	\N	2026-06-02 11:15:20.58	2026-06-02 11:15:20.58
8e05e3bf-b1fa-4760-976f-04c2d1d39f6e	83988147-bd67-49d5-81d3-0acb83dbc90c	c10f55fc-a21e-4d29-b215-8fd430eab4f8	18	2026-06-02 11:15:20.591	\N	2026-06-02 11:15:20.591	2026-06-02 11:15:20.591
3dd64670-fb39-4c6d-81b7-f6da12cdfcb9	83988147-bd67-49d5-81d3-0acb83dbc90c	c4a91735-df6a-489d-a219-f843f3fc1457	19	2026-06-02 11:15:20.602	\N	2026-06-02 11:15:20.602	2026-06-02 11:15:20.602
78c2d9fb-a490-4ca1-88ce-85501b5f52d6	83988147-bd67-49d5-81d3-0acb83dbc90c	d55699f3-00da-4b14-8525-c5212a301877	20	2026-06-02 11:15:20.613	\N	2026-06-02 11:15:20.613	2026-06-02 11:15:20.613
fc4e629d-30eb-4bc4-a84e-f35625598973	83988147-bd67-49d5-81d3-0acb83dbc90c	042429c6-8a34-47d3-a518-c379960f5146	21	2026-06-02 11:15:20.618	\N	2026-06-02 11:15:20.618	2026-06-02 11:15:20.618
afe0f398-b46c-4b4f-9f32-69b974b83369	83988147-bd67-49d5-81d3-0acb83dbc90c	92ae7803-28a5-4d92-befa-0d3ecd76ac56	22	2026-06-02 11:15:20.629	\N	2026-06-02 11:15:20.629	2026-06-02 11:15:20.629
16f1768d-0aaa-4deb-ac7a-333b6cc15b75	83988147-bd67-49d5-81d3-0acb83dbc90c	60aabe13-2f04-48ca-8ee6-7a7742750940	23	2026-06-02 11:15:20.64	\N	2026-06-02 11:15:20.64	2026-06-02 11:15:20.64
983f4387-3b91-41d9-a1df-ab6f4e5f4f02	83988147-bd67-49d5-81d3-0acb83dbc90c	03379d9a-3192-4042-916b-ae0a13e980a2	24	2026-06-02 11:15:20.651	\N	2026-06-02 11:15:20.651	2026-06-02 11:15:20.651
c9ed9b00-d837-4520-ba2c-582bfc4a66fb	83988147-bd67-49d5-81d3-0acb83dbc90c	27eb8fd2-634f-47a7-8063-89e864c3e595	25	2026-06-02 11:15:20.662	\N	2026-06-02 11:15:20.662	2026-06-02 11:15:20.662
70047383-ea75-4145-b5fd-b753e6d513e1	83988147-bd67-49d5-81d3-0acb83dbc90c	f055d1cd-a93c-46ba-87a2-beb0d3bae494	26	2026-06-02 11:15:20.673	\N	2026-06-02 11:15:20.673	2026-06-02 11:15:20.673
2d93a9f1-ba4d-4ff4-a7c7-549df6d5b945	83988147-bd67-49d5-81d3-0acb83dbc90c	adc2b998-763a-4335-91ff-6d513aa2f4d7	27	2026-06-02 11:15:20.685	\N	2026-06-02 11:15:20.685	2026-06-02 11:15:20.685
9ba3bf1b-7bef-4235-8c62-04dc20d2c6bd	83988147-bd67-49d5-81d3-0acb83dbc90c	e0b1faa0-d545-4d81-aa68-c483773ae46c	28	2026-06-02 11:15:20.696	\N	2026-06-02 11:15:20.696	2026-06-02 11:15:20.696
7f02d248-fec7-4a99-b598-18e2627632e2	83988147-bd67-49d5-81d3-0acb83dbc90c	06bbe80f-d2f3-4920-a789-3646f006d425	29	2026-06-02 11:15:20.707	\N	2026-06-02 11:15:20.707	2026-06-02 11:15:20.707
f3d88a7e-9279-4402-bfc8-b6a3b9a96731	c11ee3ba-bcce-424a-994e-6477045af536	84f98b38-e35a-40fa-84a0-d9c22af07c13	1	2026-06-02 11:15:21.044	\N	2026-06-02 11:15:21.044	2026-06-02 11:15:21.044
5d3a1ad5-be3b-4adf-95ee-6866ec7b248f	c11ee3ba-bcce-424a-994e-6477045af536	3d129cc0-c291-4187-a41e-0c70a9e27a9c	2	2026-06-02 11:15:21.055	\N	2026-06-02 11:15:21.055	2026-06-02 11:15:21.055
d4d66894-45e8-4ed2-a355-7efe722e0581	c11ee3ba-bcce-424a-994e-6477045af536	78dadd5b-92db-4792-a687-35c8ff56a733	3	2026-06-02 11:15:21.067	\N	2026-06-02 11:15:21.067	2026-06-02 11:15:21.067
2c54a9c3-000a-4335-832e-a765d36eadfe	c11ee3ba-bcce-424a-994e-6477045af536	abe574fc-a574-4180-a66c-9cd8e7c2c480	4	2026-06-02 11:15:21.077	\N	2026-06-02 11:15:21.077	2026-06-02 11:15:21.077
91e91963-dba0-4b60-b1bc-3dbb73d4322f	c11ee3ba-bcce-424a-994e-6477045af536	427e7430-7169-4fec-9c43-42928c19aecd	5	2026-06-02 11:15:21.088	\N	2026-06-02 11:15:21.088	2026-06-02 11:15:21.088
626c03a4-33f8-49f8-8c64-7df48d362f58	c11ee3ba-bcce-424a-994e-6477045af536	11bf43c2-181c-4ce1-aac5-48456ad3f456	6	2026-06-02 11:15:21.1	\N	2026-06-02 11:15:21.1	2026-06-02 11:15:21.1
692d7ed2-f846-49d4-b990-b092817849c9	c11ee3ba-bcce-424a-994e-6477045af536	d2f9007d-a97d-4769-8598-88723b2acdcf	7	2026-06-02 11:15:21.111	\N	2026-06-02 11:15:21.111	2026-06-02 11:15:21.111
8a94d5e6-6e66-4e31-9498-d66da0e52a51	c11ee3ba-bcce-424a-994e-6477045af536	247a244a-fa89-4bb2-95b9-4eb2d8cf5df9	8	2026-06-02 11:15:21.122	\N	2026-06-02 11:15:21.122	2026-06-02 11:15:21.122
829f53a9-f2f6-4c67-a846-6a8b89e5f7cc	c11ee3ba-bcce-424a-994e-6477045af536	9d67225c-b929-4002-adb8-e03df0a3c78e	9	2026-06-02 11:15:21.135	\N	2026-06-02 11:15:21.135	2026-06-02 11:15:21.135
70d3d4ca-75c9-4f10-9898-250f725dbd8a	c11ee3ba-bcce-424a-994e-6477045af536	bcfa46ff-aa79-4a6d-b465-4e2369050a8b	10	2026-06-02 11:15:21.145	\N	2026-06-02 11:15:21.145	2026-06-02 11:15:21.145
a25b3c67-a3f4-4859-928d-a473a29d4c04	c11ee3ba-bcce-424a-994e-6477045af536	7a0f1e8d-0fa3-4aa3-95a5-4db80d5bfcc6	11	2026-06-02 11:15:21.156	\N	2026-06-02 11:15:21.156	2026-06-02 11:15:21.156
6a99da9a-a4f4-40aa-9626-bf539a3eaae6	c11ee3ba-bcce-424a-994e-6477045af536	e938c0f1-e9bb-474d-9f0a-c7bd21909dea	12	2026-06-02 11:15:21.167	\N	2026-06-02 11:15:21.167	2026-06-02 11:15:21.167
762701dd-f2f4-4330-be04-dbef61211a50	c11ee3ba-bcce-424a-994e-6477045af536	bd4a51ae-53df-4ea4-8e34-14a37b427167	13	2026-06-02 11:15:21.177	\N	2026-06-02 11:15:21.177	2026-06-02 11:15:21.177
6e08bd87-d828-4c38-b441-4b7dd2b9756f	c11ee3ba-bcce-424a-994e-6477045af536	c14a3259-cb2f-4c16-84b5-1654204bfd66	14	2026-06-02 11:15:21.188	\N	2026-06-02 11:15:21.188	2026-06-02 11:15:21.188
4d8385bd-2f58-4be5-90e6-590eaf5e0b02	c11ee3ba-bcce-424a-994e-6477045af536	886d4630-3234-43c9-8970-b82bf4da2978	15	2026-06-02 11:15:21.199	\N	2026-06-02 11:15:21.199	2026-06-02 11:15:21.199
6084db46-a2f5-48b3-b770-c5971ee541bf	c11ee3ba-bcce-424a-994e-6477045af536	b13c3392-8332-435c-8025-5190f0664c09	16	2026-06-02 11:15:21.21	\N	2026-06-02 11:15:21.21	2026-06-02 11:15:21.21
7da8e077-834c-437b-a333-24f2f93bd0e7	c11ee3ba-bcce-424a-994e-6477045af536	cad98842-45b6-4371-beac-fde6d374201a	17	2026-06-02 11:15:21.22	\N	2026-06-02 11:15:21.22	2026-06-02 11:15:21.22
1b0615d0-63a7-4f26-9536-71f4269b7c4c	c11ee3ba-bcce-424a-994e-6477045af536	3f35e406-0db1-4c43-a3e6-b9ad6622a9b3	18	2026-06-02 11:15:21.233	\N	2026-06-02 11:15:21.233	2026-06-02 11:15:21.233
494f4682-a07e-45eb-a7e4-f8636859284d	c11ee3ba-bcce-424a-994e-6477045af536	55f41c5a-faea-4da5-8da6-903e41e6d2eb	19	2026-06-02 11:15:21.244	\N	2026-06-02 11:15:21.244	2026-06-02 11:15:21.244
be82e1cc-f994-449a-a572-06505d4ca6d9	c11ee3ba-bcce-424a-994e-6477045af536	441784fb-114c-4c17-8c8c-98938b562a55	20	2026-06-02 11:15:21.247	\N	2026-06-02 11:15:21.247	2026-06-02 11:15:21.247
b3011029-af3a-4239-8b38-f3d6928ac171	c11ee3ba-bcce-424a-994e-6477045af536	b25fe588-90e3-4b0e-b361-c2b174c6840c	21	2026-06-02 11:15:21.259	\N	2026-06-02 11:15:21.259	2026-06-02 11:15:21.259
153982cf-e7c5-42f1-a79b-c73a344b6184	c11ee3ba-bcce-424a-994e-6477045af536	22afd02f-8ed5-44ed-b351-428a57b2f878	22	2026-06-02 11:15:21.27	\N	2026-06-02 11:15:21.27	2026-06-02 11:15:21.27
492c6866-4692-44f3-90fe-6b5efacb9121	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	e4619ca4-9999-490f-97e5-cb1295bcf5ee	1	2026-06-02 11:15:21.718	\N	2026-06-02 11:15:21.718	2026-06-02 11:15:21.718
4fb6569c-0a46-4f72-bf7a-34eb66369bbe	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	6bdbf8f8-c852-4a86-afc4-033930f26ce4	2	2026-06-02 11:15:21.726	\N	2026-06-02 11:15:21.726	2026-06-02 11:15:21.726
1ce6ee63-50cd-4db4-9deb-c64bc3a7b666	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	64fc8592-2f2d-45aa-8b30-2e2d8674b253	3	2026-06-02 11:15:21.733	\N	2026-06-02 11:15:21.733	2026-06-02 11:15:21.733
081c90ff-0e2c-428b-84f8-048e397c9502	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	465dcaa9-61f7-4102-9aba-a1a0bb7b58db	4	2026-06-02 11:15:21.741	\N	2026-06-02 11:15:21.741	2026-06-02 11:15:21.741
c6b05699-0410-4ecd-aae1-eede528f2828	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	26f2ed96-bd60-4192-9724-3582648db489	5	2026-06-02 11:15:21.751	\N	2026-06-02 11:15:21.751	2026-06-02 11:15:21.751
7619f836-301f-4e10-8627-ca37de396689	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	ab042577-336a-4e6e-ad17-1fec730dc6e6	6	2026-06-02 11:15:21.761	\N	2026-06-02 11:15:21.761	2026-06-02 11:15:21.761
1dcde597-520b-466e-b78f-8d82f205b6ae	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	ffba20c7-55b4-435f-8e30-0093c64dbe54	7	2026-06-02 11:15:21.768	\N	2026-06-02 11:15:21.768	2026-06-02 11:15:21.768
861d3b38-5ae6-4eaf-991a-98fea176c834	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	e235c198-41a1-411f-b8b2-419f1d017112	8	2026-06-02 11:15:21.78	\N	2026-06-02 11:15:21.78	2026-06-02 11:15:21.78
4394e521-b2ac-4dc9-993e-b396e3886481	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	412f1f29-f975-46fc-85d8-3ad2a7d276c8	9	2026-06-02 11:15:21.792	\N	2026-06-02 11:15:21.792	2026-06-02 11:15:21.792
931b1f56-980c-4d07-9dd3-c5e84eb7df86	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	eac642be-2525-4090-94e5-05ee89f511d7	10	2026-06-02 11:15:21.807	\N	2026-06-02 11:15:21.807	2026-06-02 11:15:21.807
600d4c60-4dfa-4647-be95-2e528e9a760d	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	1b79df93-9cf4-4a47-b84f-ab0fd6278eab	11	2026-06-02 11:15:21.825	\N	2026-06-02 11:15:21.825	2026-06-02 11:15:21.825
e9e5f100-3d7a-4752-a243-b7268f5ee4f1	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	aaaf63da-8cc7-4050-895a-075d11d4a609	12	2026-06-02 11:15:21.84	\N	2026-06-02 11:15:21.84	2026-06-02 11:15:21.84
1ff8198d-1ab4-4299-baa0-3b0eed6ad118	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	62d301f0-a38d-4920-9aee-f790ca8e6478	13	2026-06-02 11:15:21.858	\N	2026-06-02 11:15:21.858	2026-06-02 11:15:21.858
6e40c8f0-4412-49f7-97e2-a7952cbefad7	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	3d18e554-f905-43d5-a181-d1d86aa36761	14	2026-06-02 11:15:21.872	\N	2026-06-02 11:15:21.872	2026-06-02 11:15:21.872
6faf3d5f-5bb8-4a81-ab4d-6485e89f7b75	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	e2918551-9ba8-4815-9a81-cc757c0132a1	15	2026-06-02 11:15:21.89	\N	2026-06-02 11:15:21.89	2026-06-02 11:15:21.89
33769fff-fe34-4d21-9a37-1444602b0b13	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	16af1e87-be6f-4272-8b46-ad2b9d160a8d	16	2026-06-02 11:15:21.905	\N	2026-06-02 11:15:21.905	2026-06-02 11:15:21.905
98d3da0a-4d08-45ee-9b97-5bf77c13f5aa	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	b3a6ed76-ce99-4334-bf06-d52bead21b9f	17	2026-06-02 11:15:21.908	\N	2026-06-02 11:15:21.908	2026-06-02 11:15:21.908
42b556fa-0c48-44af-b74f-1ffb1bef9fe6	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	2991043d-a4e0-4814-9087-94727e52f927	18	2026-06-02 11:15:21.924	\N	2026-06-02 11:15:21.924	2026-06-02 11:15:21.924
0308834f-bf64-4b78-9110-57bc48d95079	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	81335c7f-ed9b-490c-aad5-7292892bec0f	19	2026-06-02 11:15:21.944	\N	2026-06-02 11:15:21.944	2026-06-02 11:15:21.944
0bf575de-9fc0-4c41-91c4-cb260fc8d480	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	786d0945-57a2-4dc4-a955-7c4f3028cf68	20	2026-06-02 11:15:21.955	\N	2026-06-02 11:15:21.955	2026-06-02 11:15:21.955
6bc5611b-4172-4358-bc6f-5a75946436f7	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	a7a49fda-8fbd-42dd-b26d-93b99d4c20fe	21	2026-06-02 11:15:21.976	\N	2026-06-02 11:15:21.976	2026-06-02 11:15:21.976
a330c9af-c68a-4d1b-aae3-7b569bb21f3d	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	d9d68dbb-68da-4703-a029-f089e0130d7d	22	2026-06-02 11:15:21.996	\N	2026-06-02 11:15:21.996	2026-06-02 11:15:21.996
2d4514e2-d67b-42c5-9492-39e619ad39ed	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	afdf29ea-bd88-4e29-9ce4-3f3d66282ae7	23	2026-06-02 11:15:22.007	\N	2026-06-02 11:15:22.007	2026-06-02 11:15:22.007
76d7dea4-9d6c-47b3-842b-f7b38e03c98e	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	9b982e6d-a187-4126-a2e1-75e8e44d15ea	24	2026-06-02 11:15:22.019	\N	2026-06-02 11:15:22.019	2026-06-02 11:15:22.019
3934eb6f-d1f5-408f-9dbd-d567a6575e12	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	9d24e63f-316f-4c22-a6c6-db2ce93a6f02	25	2026-06-02 11:15:22.038	\N	2026-06-02 11:15:22.038	2026-06-02 11:15:22.038
ce38da51-8428-48db-b8ac-a53f63e85859	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	cfa39bb6-ab57-4a3d-91e9-db9740449e5f	26	2026-06-02 11:15:22.05	\N	2026-06-02 11:15:22.05	2026-06-02 11:15:22.05
e962ae0b-d33c-47a1-b70b-31e68a68c87d	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	455cbffc-8269-4de9-8986-59b106deb4a4	27	2026-06-02 11:15:22.07	\N	2026-06-02 11:15:22.07	2026-06-02 11:15:22.07
8f32d68f-50f2-46a6-9e22-38abd314f23e	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	cf61afe5-d36e-40a8-a72a-3d0887d81710	28	2026-06-02 11:15:22.079	\N	2026-06-02 11:15:22.079	2026-06-02 11:15:22.079
7c1d597b-e13b-4f71-a0be-bf92146de7ee	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	879c0b69-828f-45e3-b71b-02564a45051e	29	2026-06-02 11:15:22.09	\N	2026-06-02 11:15:22.09	2026-06-02 11:15:22.09
f42ef071-1e40-4786-a91e-b03c86895fd4	d41cdb24-5257-4d1c-96fc-20140a2314ed	733c793e-df84-43be-a5ce-14f70d58bd53	1	2026-06-02 11:15:22.373	\N	2026-06-02 11:15:22.373	2026-06-02 11:15:22.373
c56ad51e-9e4d-451e-957c-94f5c6b01af2	d41cdb24-5257-4d1c-96fc-20140a2314ed	49d096b8-9326-42ff-a5de-5b331ead3452	2	2026-06-02 11:15:22.382	\N	2026-06-02 11:15:22.382	2026-06-02 11:15:22.382
39134cad-4bbd-40c3-a77e-eddb8f4a3068	d41cdb24-5257-4d1c-96fc-20140a2314ed	90cd3f86-e077-450c-a3e1-2ffbc7b221e7	3	2026-06-02 11:15:22.404	\N	2026-06-02 11:15:22.404	2026-06-02 11:15:22.404
dc291a37-d97d-4af6-86f9-afd98cb81b94	d41cdb24-5257-4d1c-96fc-20140a2314ed	a71116fd-82f9-40ce-a73d-ca7288763c21	4	2026-06-02 11:15:22.428	\N	2026-06-02 11:15:22.428	2026-06-02 11:15:22.428
da111eef-584b-4161-806d-d8182b89e578	d41cdb24-5257-4d1c-96fc-20140a2314ed	9f91c368-aa53-4b92-81a6-40f4103cb573	5	2026-06-02 11:15:22.437	\N	2026-06-02 11:15:22.437	2026-06-02 11:15:22.437
65e7d5db-5652-43f9-b8ef-4bfef36e90ed	d41cdb24-5257-4d1c-96fc-20140a2314ed	6e7ecc93-0506-46af-81c0-dfa9d9feb781	6	2026-06-02 11:15:22.452	\N	2026-06-02 11:15:22.452	2026-06-02 11:15:22.452
7ad7ce28-b103-4d18-aea1-40924096b71d	d41cdb24-5257-4d1c-96fc-20140a2314ed	da75e6aa-dc5d-4f90-85a9-d1fba68845f8	7	2026-06-02 11:15:22.471	\N	2026-06-02 11:15:22.471	2026-06-02 11:15:22.471
803fbe4b-3d56-4660-9fb5-098c5529f5a7	d41cdb24-5257-4d1c-96fc-20140a2314ed	fa34f770-e86f-43ce-91c0-7f6e8bf006bf	8	2026-06-02 11:15:22.499	\N	2026-06-02 11:15:22.499	2026-06-02 11:15:22.499
fb7a7c5d-ba71-4d9f-8b5e-92c7a01645a7	d41cdb24-5257-4d1c-96fc-20140a2314ed	90abc425-1253-4732-9760-14db74acaa2b	9	2026-06-02 11:15:22.514	\N	2026-06-02 11:15:22.514	2026-06-02 11:15:22.514
5021de56-2b3a-46e3-87fe-7cf16f0b5466	d41cdb24-5257-4d1c-96fc-20140a2314ed	5038c0b6-3c98-4f0c-b303-f5d8b2047ee1	10	2026-06-02 11:15:22.522	\N	2026-06-02 11:15:22.522	2026-06-02 11:15:22.522
fed3e46b-496b-419b-b8ca-7c76dd436f88	d41cdb24-5257-4d1c-96fc-20140a2314ed	f108dbb1-1749-4c4f-8a6c-6c8f2b5273ec	11	2026-06-02 11:15:22.533	\N	2026-06-02 11:15:22.533	2026-06-02 11:15:22.533
a4b41477-824f-4f92-91a1-67b4df3742c2	d41cdb24-5257-4d1c-96fc-20140a2314ed	cfada4f7-a862-41be-a771-17ab522e097a	12	2026-06-02 11:15:22.558	\N	2026-06-02 11:15:22.558	2026-06-02 11:15:22.558
6fc322f9-52dd-499f-a7f2-65bf92711b07	d41cdb24-5257-4d1c-96fc-20140a2314ed	d02e4eca-2c01-4f4e-99c1-ec88efd7d8a0	13	2026-06-02 11:15:22.572	\N	2026-06-02 11:15:22.572	2026-06-02 11:15:22.572
b22e77c3-c5e2-4c15-b4e3-52cecc121450	d41cdb24-5257-4d1c-96fc-20140a2314ed	14b6b012-fa0b-424b-baab-8feead68817f	14	2026-06-02 11:15:22.587	\N	2026-06-02 11:15:22.587	2026-06-02 11:15:22.587
d4c59a48-715e-4cf8-b544-1ca8b4251e24	d41cdb24-5257-4d1c-96fc-20140a2314ed	0a3353f1-bddc-4c33-b549-7294b952d015	15	2026-06-02 11:15:22.6	\N	2026-06-02 11:15:22.6	2026-06-02 11:15:22.6
7277d07b-e9ea-4814-9109-442f9aa56f6b	d41cdb24-5257-4d1c-96fc-20140a2314ed	b2d6ba6a-97fa-4c8c-89f3-14cd57d97aa6	16	2026-06-02 11:15:22.613	\N	2026-06-02 11:15:22.613	2026-06-02 11:15:22.613
bc63a6bb-c706-4c86-9aff-e847c593ba11	d41cdb24-5257-4d1c-96fc-20140a2314ed	2d213b29-28f2-4d05-8712-34ac643873e9	17	2026-06-02 11:15:22.615	\N	2026-06-02 11:15:22.615	2026-06-02 11:15:22.615
9a043cb4-a2fd-4377-9c4d-f65b4d99b744	d41cdb24-5257-4d1c-96fc-20140a2314ed	10883240-45af-43cc-9f07-5d666d593465	18	2026-06-02 11:15:22.629	\N	2026-06-02 11:15:22.629	2026-06-02 11:15:22.629
5e8799d5-d063-4bce-8377-2d378b0ff7c0	d41cdb24-5257-4d1c-96fc-20140a2314ed	d11134c3-4f32-4a58-ae24-b64e54ccdec7	19	2026-06-02 11:15:22.64	\N	2026-06-02 11:15:22.64	2026-06-02 11:15:22.64
f28a4ba4-38dd-4d75-a0c8-b3047529e496	d41cdb24-5257-4d1c-96fc-20140a2314ed	f59b5942-3a94-451e-a016-754d823c9684	20	2026-06-02 11:15:22.651	\N	2026-06-02 11:15:22.651	2026-06-02 11:15:22.651
212c5df4-bb6d-4a89-a9a0-46ff51c75a89	d41cdb24-5257-4d1c-96fc-20140a2314ed	3908eadf-c626-4ffd-89d1-1c75c4db4ff9	21	2026-06-02 11:15:22.663	\N	2026-06-02 11:15:22.663	2026-06-02 11:15:22.663
3789d850-1e48-4140-be5a-919f758236f4	d41cdb24-5257-4d1c-96fc-20140a2314ed	2b779364-e3b0-4940-96f8-9dea42657bd5	22	2026-06-02 11:15:22.673	\N	2026-06-02 11:15:22.673	2026-06-02 11:15:22.673
2f01d453-7c6c-4ea6-9614-b0988cbc0d58	d41cdb24-5257-4d1c-96fc-20140a2314ed	3c8c3b51-d05c-4242-b5a2-b3bb4c27dee2	23	2026-06-02 11:15:22.685	\N	2026-06-02 11:15:22.685	2026-06-02 11:15:22.685
8b61e615-f95c-4214-9f81-c48238bae88a	d41cdb24-5257-4d1c-96fc-20140a2314ed	ff9fb1e3-e546-43e1-a5f7-2ee775175348	24	2026-06-02 11:15:22.695	\N	2026-06-02 11:15:22.695	2026-06-02 11:15:22.695
4bc00656-8b9c-4a6e-b56e-553c3ff1e6d0	d41cdb24-5257-4d1c-96fc-20140a2314ed	c0fef05b-c1ea-4746-b97d-faff423efc5c	25	2026-06-02 11:15:22.707	\N	2026-06-02 11:15:22.707	2026-06-02 11:15:22.707
3355bda5-09e8-422a-b1f9-ed45558b976c	d41cdb24-5257-4d1c-96fc-20140a2314ed	713b331f-d4c6-47eb-ab9b-3b9992010774	26	2026-06-02 11:15:22.718	\N	2026-06-02 11:15:22.718	2026-06-02 11:15:22.718
1371f3ae-380f-47ab-a534-43f23abf16c6	d41cdb24-5257-4d1c-96fc-20140a2314ed	b9867eb5-f1a4-46ae-8d97-76ea02325929	27	2026-06-02 11:15:22.729	\N	2026-06-02 11:15:22.729	2026-06-02 11:15:22.729
3016448d-38c9-4798-8a17-fe40a270d052	d41cdb24-5257-4d1c-96fc-20140a2314ed	17f594fd-6c98-49d8-9b4c-747a1dc97783	28	2026-06-02 11:15:22.74	\N	2026-06-02 11:15:22.74	2026-06-02 11:15:22.74
b93b930e-adf4-416a-95c3-35293f8b5884	d41cdb24-5257-4d1c-96fc-20140a2314ed	41caebc5-389c-4dab-8ffc-390c29ab4502	29	2026-06-02 11:15:22.752	\N	2026-06-02 11:15:22.752	2026-06-02 11:15:22.752
2a45d1c3-3d29-46f2-8d37-216468ab68d1	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	ebeddb0a-95c1-4acb-bf5f-37c82a813d59	1	2026-06-02 11:15:23.079	\N	2026-06-02 11:15:23.079	2026-06-02 11:15:23.079
78a85345-6229-461e-bce6-84e5881e50d0	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	e9d00416-9609-4bb0-8383-490f0fe736c3	2	2026-06-02 11:15:23.091	\N	2026-06-02 11:15:23.091	2026-06-02 11:15:23.091
5275f941-a7db-4101-ad03-62240d943678	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	8fb5e76c-85ac-42e3-8ac6-e7af128616a8	3	2026-06-02 11:15:23.102	\N	2026-06-02 11:15:23.102	2026-06-02 11:15:23.102
02d73aad-409d-49cc-b681-190e88dc391e	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	0fc4f521-f1e9-4c66-9c0b-c535340c1f73	4	2026-06-02 11:15:23.122	\N	2026-06-02 11:15:23.122	2026-06-02 11:15:23.122
bce200f8-e999-4c35-b710-9ca77ca293d7	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	7184343d-0f86-482d-a5b9-d82f01638424	5	2026-06-02 11:15:23.14	\N	2026-06-02 11:15:23.14	2026-06-02 11:15:23.14
ebfc4b62-547f-4c8b-92cd-8ed7e33b99f9	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	ef580708-0a02-4c2b-9070-b8ccd902c0c1	6	2026-06-02 11:15:23.16	\N	2026-06-02 11:15:23.16	2026-06-02 11:15:23.16
33e339fa-bab3-499c-8d6c-531a283e73a0	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	19c81171-93a8-4fc3-8902-ec420a4a5940	7	2026-06-02 11:15:23.175	\N	2026-06-02 11:15:23.175	2026-06-02 11:15:23.175
24cff905-61c7-4f41-9506-18299677bd77	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	06dca56c-172d-42b3-bef6-8cc85050136c	8	2026-06-02 11:15:23.194	\N	2026-06-02 11:15:23.194	2026-06-02 11:15:23.194
9d15e2be-bc70-4427-b36f-397a8e3f324d	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	b18604f6-bcb0-44ca-b93a-16606f2e6e06	9	2026-06-02 11:15:23.214	\N	2026-06-02 11:15:23.214	2026-06-02 11:15:23.214
3e997bf0-c688-423b-b1cb-a3754f626896	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	2191bab4-781a-456a-9dd5-642e25ed2dfc	10	2026-06-02 11:15:23.227	\N	2026-06-02 11:15:23.227	2026-06-02 11:15:23.227
fa80b62a-93de-47be-9723-37298920676f	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	0e05907b-1e0e-4606-8de6-7481fcd7fcc8	11	2026-06-02 11:15:23.241	\N	2026-06-02 11:15:23.241	2026-06-02 11:15:23.241
f6b88c58-6781-4db3-8586-def77591b3ff	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	13cf1a65-765c-4797-8ddf-730cd859e98a	12	2026-06-02 11:15:23.26	\N	2026-06-02 11:15:23.26	2026-06-02 11:15:23.26
6c4204a1-0ca2-4abc-82eb-1f482e7ea1f2	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	3a1b4857-9b59-4d9d-9643-13615a27eb34	13	2026-06-02 11:15:23.273	\N	2026-06-02 11:15:23.273	2026-06-02 11:15:23.273
a959253f-a805-4f8c-bdd2-e8cc7c612858	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	066a93fd-6fa1-4192-bfe4-6e84927167e4	14	2026-06-02 11:15:23.284	\N	2026-06-02 11:15:23.284	2026-06-02 11:15:23.284
b790eb69-b927-4bfe-b981-ac3fb107da9c	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	1b2ed9ca-9556-4ea9-a7e5-0ce172ee52e5	15	2026-06-02 11:15:23.295	\N	2026-06-02 11:15:23.295	2026-06-02 11:15:23.295
70ea212d-739e-43f2-9881-863e0152da43	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	ecaa60a7-e486-4342-80b6-177e857b55f6	16	2026-06-02 11:15:23.306	\N	2026-06-02 11:15:23.306	2026-06-02 11:15:23.306
be698800-e6a1-4c2a-a400-7ee9e84deddc	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	9531fd48-8862-4753-bbbb-b138cefa7483	17	2026-06-02 11:15:23.319	\N	2026-06-02 11:15:23.319	2026-06-02 11:15:23.319
813f51cb-54f0-4b96-bab5-53c4225a4dd5	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	b15089cf-cce8-44a5-8876-cb9f076b0340	18	2026-06-02 11:15:23.338	\N	2026-06-02 11:15:23.338	2026-06-02 11:15:23.338
a80e4405-9260-43ce-a87e-4d36f9a8bd3e	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	e43654ae-9143-47eb-ade5-54bc5e183faa	19	2026-06-02 11:15:23.351	\N	2026-06-02 11:15:23.351	2026-06-02 11:15:23.351
6cef72ab-e7cf-44eb-aef0-9ab13288a458	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	5071aa13-700d-4492-8ed5-9397ee7cd136	20	2026-06-02 11:15:23.361	\N	2026-06-02 11:15:23.361	2026-06-02 11:15:23.361
bd06815f-5714-474c-adb6-295111ff8942	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	ca9ccb6d-96e3-44e7-8d1c-9e03cc4a3f1d	21	2026-06-02 11:15:23.376	\N	2026-06-02 11:15:23.376	2026-06-02 11:15:23.376
51ae71e7-a98e-4f7f-8ecb-b49606889fbb	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	80d980f6-e83f-490e-a062-aecd63557582	22	2026-06-02 11:15:23.395	\N	2026-06-02 11:15:23.395	2026-06-02 11:15:23.395
d54417e4-4465-4253-b981-981c63766e1a	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	a4f5f9b8-1425-4ee0-868d-b3dfb5961e1b	23	2026-06-02 11:15:23.411	\N	2026-06-02 11:15:23.411	2026-06-02 11:15:23.411
92593c84-259f-4086-8a7d-2efcbca65b90	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	be829c7e-7041-4515-b3e1-8af22fce0b6c	24	2026-06-02 11:15:23.431	\N	2026-06-02 11:15:23.431	2026-06-02 11:15:23.431
b765fee2-0df8-4324-9b60-a48dac35b9eb	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	cbe62dfe-8b87-42e4-a19d-f70ad64dcea0	25	2026-06-02 11:15:23.45	\N	2026-06-02 11:15:23.45	2026-06-02 11:15:23.45
256e11db-2ff7-4611-ad32-09deb2b9e992	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	0643141d-d465-4788-873e-7064df997caf	26	2026-06-02 11:15:23.472	\N	2026-06-02 11:15:23.472	2026-06-02 11:15:23.472
7b9b503f-b4ec-415b-8eae-a474a0375fad	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	dd7a6034-a059-42e8-98c2-82f048b0d3cf	27	2026-06-02 11:15:23.482	\N	2026-06-02 11:15:23.482	2026-06-02 11:15:23.482
f42d96f2-bb3a-454b-ae2d-318f60c71709	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	2af2ce13-9066-468c-9946-e4846c686c00	28	2026-06-02 11:15:23.487	\N	2026-06-02 11:15:23.487	2026-06-02 11:15:23.487
e0da21c7-353e-432b-b389-9becac6df6d0	c2373827-86a5-49de-8e7c-aecfc5e3a7a4	b2a32c86-3807-4d1d-a368-f036a4beb969	29	2026-06-02 11:15:23.497	\N	2026-06-02 11:15:23.497	2026-06-02 11:15:23.497
2d543358-fcf5-421b-aebb-5892e74eb303	655df04f-5508-45f3-8032-fd657a753360	5748dfe1-b83f-4411-a471-279d102cf21f	1	2026-06-02 11:15:23.863	\N	2026-06-02 11:15:23.863	2026-06-02 11:15:23.863
7b0fb20d-0ccf-4c6d-9d9d-103418eb92d1	655df04f-5508-45f3-8032-fd657a753360	48b5b5c2-e4d0-490d-8d4d-c0670260696a	2	2026-06-02 11:15:23.867	\N	2026-06-02 11:15:23.867	2026-06-02 11:15:23.867
54e2e2fb-4402-4d0e-993e-14a83a32985c	655df04f-5508-45f3-8032-fd657a753360	5510f37e-84f6-46b8-ac69-d660da055626	3	2026-06-02 11:15:23.891	\N	2026-06-02 11:15:23.891	2026-06-02 11:15:23.891
7b8ba57a-8a0d-408e-b589-aeeaee0e1ed3	655df04f-5508-45f3-8032-fd657a753360	715c093a-e1e3-46fc-b6a2-e4d8d366fe88	4	2026-06-02 11:15:23.899	\N	2026-06-02 11:15:23.899	2026-06-02 11:15:23.899
76636eea-0603-4b94-a58c-1e059ed4ea54	655df04f-5508-45f3-8032-fd657a753360	ccc8ef29-bb77-46b1-801d-7c45a725c567	5	2026-06-02 11:15:23.91	\N	2026-06-02 11:15:23.91	2026-06-02 11:15:23.91
cfed23fe-3b32-4649-bd8f-b45cdd9ea8e0	655df04f-5508-45f3-8032-fd657a753360	37fd4b43-f2ad-468f-acab-f023cc526ddc	6	2026-06-02 11:15:23.923	\N	2026-06-02 11:15:23.923	2026-06-02 11:15:23.923
6b1b3c27-973a-4ea8-b44a-ced524dae2f1	655df04f-5508-45f3-8032-fd657a753360	7ed15712-6e44-43c5-9fca-874c33ef4ba6	7	2026-06-02 11:15:23.934	\N	2026-06-02 11:15:23.934	2026-06-02 11:15:23.934
7a0e96f6-332c-4f63-ae22-a0f8ba4a0324	655df04f-5508-45f3-8032-fd657a753360	62827757-6c88-4e49-93b8-110158b08b9a	8	2026-06-02 11:15:23.955	\N	2026-06-02 11:15:23.955	2026-06-02 11:15:23.955
970f87ac-4811-4b10-ad37-3a07b8297b80	655df04f-5508-45f3-8032-fd657a753360	6d3aac5f-9b85-42e6-acdc-40794a182aa8	9	2026-06-02 11:15:23.966	\N	2026-06-02 11:15:23.966	2026-06-02 11:15:23.966
7bdadb61-ed50-4012-9926-3157b1d24f96	655df04f-5508-45f3-8032-fd657a753360	b2760b91-57b7-4d26-909e-c602b8e15c5a	10	2026-06-02 11:15:23.977	\N	2026-06-02 11:15:23.977	2026-06-02 11:15:23.977
c575fa11-2283-4e49-8e93-e201a56c8126	655df04f-5508-45f3-8032-fd657a753360	d3e29d3f-8a3d-4364-a715-c313ddcf85dc	11	2026-06-02 11:15:23.991	\N	2026-06-02 11:15:23.991	2026-06-02 11:15:23.991
b2402aee-e422-460f-863e-f543f844a84f	655df04f-5508-45f3-8032-fd657a753360	60d653ac-eb22-45e0-a9a0-f72bebe8727e	12	2026-06-02 11:15:23.995	\N	2026-06-02 11:15:23.995	2026-06-02 11:15:23.995
0280537c-66f2-4682-85ea-3bd0d1eb7ddc	655df04f-5508-45f3-8032-fd657a753360	f3132686-c696-4c7e-a1fc-e8e11a298cef	13	2026-06-02 11:15:24.007	\N	2026-06-02 11:15:24.007	2026-06-02 11:15:24.007
da263d27-c45e-4c21-ad49-e256965007cd	655df04f-5508-45f3-8032-fd657a753360	9760daa4-706c-4b70-988a-d9d965559743	14	2026-06-02 11:15:24.01	\N	2026-06-02 11:15:24.01	2026-06-02 11:15:24.01
e63f9072-1155-4d9d-83f2-3aea59c8f5c9	655df04f-5508-45f3-8032-fd657a753360	d034c5ad-e4b1-4f5a-9113-a18af03082b0	15	2026-06-02 11:15:24.013	\N	2026-06-02 11:15:24.013	2026-06-02 11:15:24.013
d18ed5a7-108f-4a18-bb2a-fb251a058abc	655df04f-5508-45f3-8032-fd657a753360	2240ab78-2f83-4fd4-afb7-a2b87d81f50a	16	2026-06-02 11:15:24.016	\N	2026-06-02 11:15:24.016	2026-06-02 11:15:24.016
f81e7c2f-b18c-41e6-a127-5deed22bfcf7	655df04f-5508-45f3-8032-fd657a753360	46ecf59b-7858-423c-aee4-3ae874e36da0	17	2026-06-02 11:15:24.02	\N	2026-06-02 11:15:24.02	2026-06-02 11:15:24.02
5d6ed952-acca-47bb-85cf-62a05219c378	655df04f-5508-45f3-8032-fd657a753360	0ff5133a-2294-49bf-8d84-4e809ff19d7a	18	2026-06-02 11:15:24.032	\N	2026-06-02 11:15:24.032	2026-06-02 11:15:24.032
f9c51c4e-323e-486f-92c7-bb69a2cf8d82	655df04f-5508-45f3-8032-fd657a753360	d5d18539-697f-4606-99d5-c4bc16b5022d	19	2026-06-02 11:15:24.037	\N	2026-06-02 11:15:24.037	2026-06-02 11:15:24.037
e8d52a95-86ee-4449-8a4c-7de8a4a63e96	655df04f-5508-45f3-8032-fd657a753360	ea2f1dfe-065c-46c0-8e6d-a1397cee92af	20	2026-06-02 11:15:24.047	\N	2026-06-02 11:15:24.047	2026-06-02 11:15:24.047
d0ca8ea3-ab81-4f7b-a08b-53e71a55a43e	655df04f-5508-45f3-8032-fd657a753360	55840af5-76c5-4439-b196-737c54bacafd	21	2026-06-02 11:15:24.057	\N	2026-06-02 11:15:24.057	2026-06-02 11:15:24.057
70c2c296-7c6e-49bf-bc91-9160796d9a4b	655df04f-5508-45f3-8032-fd657a753360	f1c2e107-e5df-4006-a2b4-323fd3ffdd74	22	2026-06-02 11:15:24.068	\N	2026-06-02 11:15:24.068	2026-06-02 11:15:24.068
4bd6b82c-91a8-4651-8e92-b79a6faf7b06	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	339858df-7a16-4510-b3b5-ffdf964d6b02	1	2026-06-02 11:15:24.454	\N	2026-06-02 11:15:24.454	2026-06-02 11:15:24.454
0c68827b-42f1-4120-89c2-543aa4c4eaf8	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	857a3ee4-f283-4a80-8e23-b956b79533eb	2	2026-06-02 11:15:24.479	\N	2026-06-02 11:15:24.479	2026-06-02 11:15:24.479
bca8f5fd-d168-47e7-8a5d-914687bd7be1	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	33c69484-7925-4967-95e7-ffb38c20991c	3	2026-06-02 11:15:24.495	\N	2026-06-02 11:15:24.495	2026-06-02 11:15:24.495
4188f33d-e512-4158-8257-de4e99cea36c	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	3e5f4e61-0f76-4eb8-b360-d33eb6d0df17	4	2026-06-02 11:15:24.507	\N	2026-06-02 11:15:24.507	2026-06-02 11:15:24.507
55475b79-661d-4fad-8976-e1244933f262	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	51c622e8-af49-4d8a-9572-25be5e508e91	5	2026-06-02 11:15:24.519	\N	2026-06-02 11:15:24.519	2026-06-02 11:15:24.519
88c452ff-d462-4cf9-881f-92843c50c2ce	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	eec36e26-fea5-45d1-94ac-b3771daae57c	6	2026-06-02 11:15:24.539	\N	2026-06-02 11:15:24.539	2026-06-02 11:15:24.539
73385710-a36c-42a2-8f5c-7715eba7a47b	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	d9a05d94-51e8-417b-80ec-6cf8ce77ce85	7	2026-06-02 11:15:24.553	\N	2026-06-02 11:15:24.553	2026-06-02 11:15:24.553
442b48ff-0c52-44f5-83e3-0a245fbe9f0d	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	e6ba34f6-3257-4a84-870a-a362c6b92209	8	2026-06-02 11:15:24.574	\N	2026-06-02 11:15:24.574	2026-06-02 11:15:24.574
e28aaf75-6074-464e-9d8f-54a17ff5a3e3	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	340eacb1-a3ab-41db-a1f8-80e3e674f254	9	2026-06-02 11:15:24.591	\N	2026-06-02 11:15:24.591	2026-06-02 11:15:24.591
6ebd744f-7374-4197-a656-d5bc260ba7e2	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	7a8d9d41-a57c-43a8-a6ea-fd17bd210051	10	2026-06-02 11:15:24.606	\N	2026-06-02 11:15:24.606	2026-06-02 11:15:24.606
23ed6232-c5ee-4f82-b967-8a04ae84e5e4	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	e79054d0-faa0-4c5b-ba3a-e547e08edaf4	11	2026-06-02 11:15:24.625	\N	2026-06-02 11:15:24.625	2026-06-02 11:15:24.625
78d67884-db01-4f01-9568-1c731f291f28	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	72e2df7b-8cb3-4235-9ed9-31fc633e0e53	12	2026-06-02 11:15:24.636	\N	2026-06-02 11:15:24.636	2026-06-02 11:15:24.636
3f56b9f9-f4b3-4cfc-a075-f6a3b9d12489	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	07d2f52b-f9f0-407a-921f-f878f17fb3af	13	2026-06-02 11:15:24.658	\N	2026-06-02 11:15:24.658	2026-06-02 11:15:24.658
c180743f-709b-459f-9579-86c9b9e0aab3	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	fa1fc00c-cfcb-4234-b9f2-b99ab0c038a4	14	2026-06-02 11:15:24.668	\N	2026-06-02 11:15:24.668	2026-06-02 11:15:24.668
4e849cc7-3bb2-4008-9a17-d4b68aa1824e	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	c12c528c-5ec3-41e9-8250-970149c465fe	15	2026-06-02 11:15:24.673	\N	2026-06-02 11:15:24.673	2026-06-02 11:15:24.673
611fca29-b023-4add-9106-f0c02d6e3593	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	0efdf27a-b364-441a-b019-22919c84b8ff	16	2026-06-02 11:15:24.685	\N	2026-06-02 11:15:24.685	2026-06-02 11:15:24.685
9617da87-2594-40e3-b720-4de670c21971	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	e2a11975-b132-400c-9d96-9085a6e073f4	17	2026-06-02 11:15:24.688	\N	2026-06-02 11:15:24.688	2026-06-02 11:15:24.688
f5766cef-1dba-485a-b271-93ab64297afe	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	dc3cb859-9ef4-495e-a47b-0d2fd8c14931	18	2026-06-02 11:15:24.699	\N	2026-06-02 11:15:24.699	2026-06-02 11:15:24.699
9cb428a1-ac05-4db5-ad9a-6dd91565a3e5	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	1655cdf9-8bf6-4082-a6ab-0f343b7f38a5	19	2026-06-02 11:15:24.711	\N	2026-06-02 11:15:24.711	2026-06-02 11:15:24.711
6d404bbc-4b06-4d33-a862-44a20765bb87	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	e9e3df2d-af39-4165-bb6f-c56b7f2ee9d3	20	2026-06-02 11:15:24.722	\N	2026-06-02 11:15:24.722	2026-06-02 11:15:24.722
24a4ab81-c1ff-4681-9bd8-06aad949a4b8	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	c75a95e1-aa54-49e6-be76-443dbc968317	21	2026-06-02 11:15:24.741	\N	2026-06-02 11:15:24.741	2026-06-02 11:15:24.741
064eb911-22ad-4293-bc01-a3460b250324	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	60011408-bbc0-463a-bf9e-771f84907127	22	2026-06-02 11:15:24.752	\N	2026-06-02 11:15:24.752	2026-06-02 11:15:24.752
9ef8d747-9c5f-4f49-8e2d-40695c03d8b9	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	f233f65b-6da7-44e0-a572-14c271034596	1	2026-06-02 11:15:24.976	\N	2026-06-02 11:15:24.976	2026-06-02 11:15:24.976
d9a7aeb5-c43e-4840-b676-9bee99fa6204	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	1ababc07-f4c7-4143-842a-d81766383616	2	2026-06-02 11:15:24.978	\N	2026-06-02 11:15:24.978	2026-06-02 11:15:24.978
454fbc1a-33cf-449f-a4ef-643977154c77	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	c4ca4fee-efc5-48fb-a660-bc831bc16872	3	2026-06-02 11:15:24.98	\N	2026-06-02 11:15:24.98	2026-06-02 11:15:24.98
73250f9e-984a-4f39-a143-a222643f9adb	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	1ca283d1-063e-498f-8db9-11a0dfe58498	4	2026-06-02 11:15:24.982	\N	2026-06-02 11:15:24.982	2026-06-02 11:15:24.982
a598273e-0dbe-4b39-a839-388e6dfd1389	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	68074e2a-d926-45c8-8e53-60d51905cdeb	5	2026-06-02 11:15:24.996	\N	2026-06-02 11:15:24.996	2026-06-02 11:15:24.996
fa4ea0da-4c1a-4d60-8fed-efc67698c95a	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	c8d3eb2c-026f-4677-b69e-ae81f2843084	6	2026-06-02 11:15:25.008	\N	2026-06-02 11:15:25.008	2026-06-02 11:15:25.008
70c76808-b0f2-48b7-83a9-04ca526f3e96	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	efefb516-da08-4d8f-b9cc-e3c4a9d6ace0	7	2026-06-02 11:15:25.011	\N	2026-06-02 11:15:25.011	2026-06-02 11:15:25.011
b6cbdaef-d5fd-4863-bf5c-5ba74375adc8	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	577fc6f1-69db-441d-a9a3-2c7f36a72834	8	2026-06-02 11:15:25.022	\N	2026-06-02 11:15:25.022	2026-06-02 11:15:25.022
e5d68984-d9e6-4680-a19c-bedddbdba9ed	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	73307118-3330-479d-b300-9d6343b49bf4	9	2026-06-02 11:15:25.033	\N	2026-06-02 11:15:25.033	2026-06-02 11:15:25.033
8d862974-9be6-48ab-80a2-d8a50e99e562	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	6a007a21-a220-4773-b5aa-c2e4223b2c41	10	2026-06-02 11:15:25.045	\N	2026-06-02 11:15:25.045	2026-06-02 11:15:25.045
402e4c6a-588d-43f6-95a0-5a2da063455d	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	205c6054-edee-4208-91e9-89d2b3134023	11	2026-06-02 11:15:25.055	\N	2026-06-02 11:15:25.055	2026-06-02 11:15:25.055
3e63544f-b673-4688-81a8-a5e70adf789b	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	6434cbe7-47a4-4108-9e26-142cf2a6827f	12	2026-06-02 11:15:25.065	\N	2026-06-02 11:15:25.065	2026-06-02 11:15:25.065
4e17fc72-794a-4151-ae16-b7cb624735eb	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	68e4189a-bd8f-45a7-b1f8-7b92be25c1de	13	2026-06-02 11:15:25.076	\N	2026-06-02 11:15:25.076	2026-06-02 11:15:25.076
11702686-c031-4057-8467-c9330d2dd77d	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	6735188e-9843-449f-a895-24aa7c3dd2ce	14	2026-06-02 11:15:25.087	\N	2026-06-02 11:15:25.087	2026-06-02 11:15:25.087
470dc1cc-f0d4-4bc8-b8bc-440c19ecbcdb	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	ca6d5729-d2bf-40a3-bcbe-6e790c87b295	15	2026-06-02 11:15:25.098	\N	2026-06-02 11:15:25.098	2026-06-02 11:15:25.098
36bf4953-e4dd-4e82-85c9-ce7db00d87a5	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	fc4feb91-a848-4133-817a-a67f0b9a923b	16	2026-06-02 11:15:25.109	\N	2026-06-02 11:15:25.109	2026-06-02 11:15:25.109
978ea8ef-3285-40a4-b718-e0abb487b721	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	0ed6b2e6-433a-4c5f-a631-fbc458fa3785	17	2026-06-02 11:15:25.12	\N	2026-06-02 11:15:25.12	2026-06-02 11:15:25.12
47894f71-b20b-4e1c-b3be-c40868df90f0	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	15179ecf-f466-4bef-8b2e-75956c650f70	18	2026-06-02 11:15:25.131	\N	2026-06-02 11:15:25.131	2026-06-02 11:15:25.131
0c1a4362-5fc6-4632-8a62-413fd9c77fbd	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	2685078f-48ae-4a23-bc94-feb1184fbfe3	19	2026-06-02 11:15:25.142	\N	2026-06-02 11:15:25.142	2026-06-02 11:15:25.142
179111b2-715e-45aa-8bda-a498146b8116	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	256f7828-b235-42d1-b366-6f2f78ee0a03	20	2026-06-02 11:15:25.152	\N	2026-06-02 11:15:25.152	2026-06-02 11:15:25.152
1eefd1e2-2bc8-4eaf-a6e2-816be97d5074	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	260f1985-deaa-4613-b9f7-052e204278a9	21	2026-06-02 11:15:25.163	\N	2026-06-02 11:15:25.163	2026-06-02 11:15:25.163
17b0efe9-cf8e-4b45-83d7-16a7d8db4c50	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	0c5cdbb0-d4fc-4a99-999a-68ba4aeaf343	22	2026-06-02 11:15:25.175	\N	2026-06-02 11:15:25.175	2026-06-02 11:15:25.175
a632f1cd-3675-442d-950e-447aac40cdab	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	9fceef55-15db-4df0-b7ea-af2a2ef56a6c	23	2026-06-02 11:15:24.763	2026-05-24 12:00:00	2026-06-02 11:15:24.763	2026-06-02 11:15:38.447
1a37f307-663d-49f0-879a-b8a4caf62a7e	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	41806643-287a-4b5c-8cbb-cff0f07cd8b3	24	2026-06-02 11:15:24.774	2026-05-24 12:00:00	2026-06-02 11:15:24.774	2026-06-02 11:15:38.447
e9ac63ed-3d6d-4df1-a8d5-5c9eea524019	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	454d3b9a-3b63-4dfd-a938-d041d360f95d	25	2026-06-02 11:15:24.784	2026-05-24 12:00:00	2026-06-02 11:15:24.784	2026-06-02 11:15:38.447
691c5a7b-3e1b-4cc4-b3b1-331a16c00c52	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	26373344-5c42-4b61-88b4-e7c1a9384f9c	26	2026-06-02 11:15:24.795	2026-05-24 12:00:00	2026-06-02 11:15:24.795	2026-06-02 11:15:38.447
9b84a616-d8ed-45db-ac4c-54e6f4d3f8ba	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	fd4a10e4-a979-49c2-9389-d00121c34fd4	27	2026-06-02 11:15:24.799	2026-05-24 12:00:00	2026-06-02 11:15:24.799	2026-06-02 11:15:38.447
53cd2972-d5a1-4309-9e26-997dc005e5a7	655df04f-5508-45f3-8032-fd657a753360	a388c17b-7143-48ed-8ec3-24a3e46644ce	23	2026-06-02 11:15:24.08	2026-05-24 12:00:00	2026-06-02 11:15:24.08	2026-06-02 11:15:39.192
db7b7dc8-2fc2-48aa-a518-bce11b712d84	655df04f-5508-45f3-8032-fd657a753360	c02a48a7-5ee1-432b-ba3f-e13275053e71	24	2026-06-02 11:15:24.086	2026-05-24 12:00:00	2026-06-02 11:15:24.086	2026-06-02 11:15:39.192
2d7afff7-3bb1-47e4-860a-81cc963eed7e	655df04f-5508-45f3-8032-fd657a753360	7906653e-72a2-4bd1-ac70-947fd7116470	25	2026-06-02 11:15:24.089	2026-05-24 12:00:00	2026-06-02 11:15:24.089	2026-06-02 11:15:39.192
67b5b7b4-489e-4f44-b7fc-7738f98ab46f	655df04f-5508-45f3-8032-fd657a753360	326950ef-6602-41e4-b507-3ee6698dffd2	26	2026-06-02 11:15:24.101	2026-05-24 12:00:00	2026-06-02 11:15:24.101	2026-06-02 11:15:39.192
7c68d06a-d729-49ac-bded-2c64bc655f90	655df04f-5508-45f3-8032-fd657a753360	b9f7457a-c3fc-4add-b1b0-76403194f62b	27	2026-06-02 11:15:24.111	2026-05-24 12:00:00	2026-06-02 11:15:24.111	2026-06-02 11:15:39.192
fc6c6d8d-5d06-4717-a4ac-04535e989ebd	655df04f-5508-45f3-8032-fd657a753360	814963ea-e0be-4e9e-9b44-0d20f9a3f271	28	2026-06-02 11:15:24.13	2026-05-24 12:00:00	2026-06-02 11:15:24.13	2026-06-02 11:15:39.192
08509980-795e-4c9a-a522-35106c2c8137	3424bc38-f674-4378-a88c-1c9ec5b9a77c	0c0b84f1-27a1-4b72-a1c8-1ec4914b17ca	1	2026-06-02 11:15:25.575	\N	2026-06-02 11:15:25.575	2026-06-02 11:15:25.575
77cec83a-0feb-4be9-8850-4339f8c69084	3424bc38-f674-4378-a88c-1c9ec5b9a77c	6fe67016-7213-4f39-bcc4-6cbaa4d16044	2	2026-06-02 11:15:25.586	\N	2026-06-02 11:15:25.586	2026-06-02 11:15:25.586
a5a8b89f-c55d-4c20-b0ab-7aba69aee163	3424bc38-f674-4378-a88c-1c9ec5b9a77c	53ccd45b-bca5-4c43-8d59-8309856d8f02	3	2026-06-02 11:15:25.597	\N	2026-06-02 11:15:25.597	2026-06-02 11:15:25.597
49bc0841-c038-4498-bbf6-0f1f62b16786	3424bc38-f674-4378-a88c-1c9ec5b9a77c	e158a991-7474-4d9a-afbd-7a66ef78b014	4	2026-06-02 11:15:25.609	\N	2026-06-02 11:15:25.609	2026-06-02 11:15:25.609
d49253ea-7dcb-4421-be89-7a7bb2b37618	3424bc38-f674-4378-a88c-1c9ec5b9a77c	5faf3487-35bb-4cf6-9c3e-86c33e59ceba	5	2026-06-02 11:15:25.62	\N	2026-06-02 11:15:25.62	2026-06-02 11:15:25.62
e7711d4b-adf8-4fbb-b8e7-277a3497fd59	3424bc38-f674-4378-a88c-1c9ec5b9a77c	9a9fc034-479e-4704-8ee8-4f778e8aabb7	6	2026-06-02 11:15:25.632	\N	2026-06-02 11:15:25.632	2026-06-02 11:15:25.632
83688012-aaec-4a67-936c-3f2065e34050	3424bc38-f674-4378-a88c-1c9ec5b9a77c	fb32cc88-94b0-4ae9-871d-4cc0c3796e82	7	2026-06-02 11:15:25.643	\N	2026-06-02 11:15:25.643	2026-06-02 11:15:25.643
1024c881-65a6-4530-a748-3210485aa65d	3424bc38-f674-4378-a88c-1c9ec5b9a77c	5762e75e-38db-4de5-aab9-1ff35cfa932f	8	2026-06-02 11:15:25.654	\N	2026-06-02 11:15:25.654	2026-06-02 11:15:25.654
fdbf466f-32bb-4763-9e31-6341a2184bf7	3424bc38-f674-4378-a88c-1c9ec5b9a77c	32d99eb0-0324-496f-baeb-6c897a59a435	9	2026-06-02 11:15:25.665	\N	2026-06-02 11:15:25.665	2026-06-02 11:15:25.665
72ad05a5-3633-4a60-b1e0-0e1fa54782de	3424bc38-f674-4378-a88c-1c9ec5b9a77c	72cc0e6c-ea6c-4199-9f76-978a59f33f75	10	2026-06-02 11:15:25.676	\N	2026-06-02 11:15:25.676	2026-06-02 11:15:25.676
f092c2aa-79ea-472d-909d-af1f8e8d9560	3424bc38-f674-4378-a88c-1c9ec5b9a77c	6286c67c-11f2-4977-ba12-04500354f293	11	2026-06-02 11:15:25.686	\N	2026-06-02 11:15:25.686	2026-06-02 11:15:25.686
593a6173-5251-4daa-9f3c-db1619020920	3424bc38-f674-4378-a88c-1c9ec5b9a77c	789db303-245e-41ab-ae99-7428d0eec815	12	2026-06-02 11:15:25.697	\N	2026-06-02 11:15:25.697	2026-06-02 11:15:25.697
866ff989-25bd-42e6-8107-97f8a36f6d8a	3424bc38-f674-4378-a88c-1c9ec5b9a77c	f33bb96a-e2ad-4b28-9486-1be383eec0fe	13	2026-06-02 11:15:25.709	\N	2026-06-02 11:15:25.709	2026-06-02 11:15:25.709
9e701503-cbac-4bc1-9b18-c44f5c35941b	3424bc38-f674-4378-a88c-1c9ec5b9a77c	0139489f-4648-4942-ab49-b0078826c816	14	2026-06-02 11:15:25.72	\N	2026-06-02 11:15:25.72	2026-06-02 11:15:25.72
7c2c42bb-5ff6-41b2-b667-fa6e3b8a5579	3424bc38-f674-4378-a88c-1c9ec5b9a77c	20fa23b4-1fbe-4f58-97ea-ea63ca89b6cf	15	2026-06-02 11:15:25.731	\N	2026-06-02 11:15:25.731	2026-06-02 11:15:25.731
d5641aee-90fb-4b94-9361-3d24d238de3e	3424bc38-f674-4378-a88c-1c9ec5b9a77c	a5a12acd-3a82-4c7a-9d4e-922dc8638222	16	2026-06-02 11:15:25.742	\N	2026-06-02 11:15:25.742	2026-06-02 11:15:25.742
50a59135-5a09-4175-998e-723d5a085b7b	3424bc38-f674-4378-a88c-1c9ec5b9a77c	4a03a0ce-c2d9-4722-8eca-1295932cee8a	17	2026-06-02 11:15:25.753	\N	2026-06-02 11:15:25.753	2026-06-02 11:15:25.753
8eebe616-9f54-4227-ac8f-8a1d1dbf06b9	3424bc38-f674-4378-a88c-1c9ec5b9a77c	afbbd223-03dc-4807-ab1e-c4847aa43fcf	18	2026-06-02 11:15:25.765	\N	2026-06-02 11:15:25.765	2026-06-02 11:15:25.765
8b85db7e-b4cd-491b-8a9d-209a9a808c9d	3424bc38-f674-4378-a88c-1c9ec5b9a77c	b625c7b1-bb7f-4614-8dca-3963f3840d20	19	2026-06-02 11:15:25.776	\N	2026-06-02 11:15:25.776	2026-06-02 11:15:25.776
0d7992a3-915f-4f79-931e-0ab33d24a1fa	3424bc38-f674-4378-a88c-1c9ec5b9a77c	c529f861-b19f-4e5c-ac34-70f5d23ac062	20	2026-06-02 11:15:25.788	\N	2026-06-02 11:15:25.788	2026-06-02 11:15:25.788
6acb78dd-449d-4ced-96ff-b7f29e942975	3424bc38-f674-4378-a88c-1c9ec5b9a77c	4985190f-b59a-431e-a2f5-8929279d1cb7	21	2026-06-02 11:15:25.798	\N	2026-06-02 11:15:25.798	2026-06-02 11:15:25.798
29944fa5-3d72-4fe7-b365-92c99e8c85bd	3424bc38-f674-4378-a88c-1c9ec5b9a77c	0f22ec25-66cd-4672-aa2a-57ee4a348e4f	22	2026-06-02 11:15:25.809	\N	2026-06-02 11:15:25.809	2026-06-02 11:15:25.809
9d6b1e91-a684-4437-b128-679fd6a60f4a	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	e6f97d14-e2d4-414c-b0d0-0596bdf9aca4	23	2026-06-02 11:15:25.185	2026-05-24 12:00:00	2026-06-02 11:15:25.185	2026-06-02 11:15:38.125
957f61d4-709b-4a65-abcd-e779628416a1	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	a7549eda-d173-452d-944a-1403d31b2b79	24	2026-06-02 11:15:25.195	2026-05-24 12:00:00	2026-06-02 11:15:25.195	2026-06-02 11:15:38.125
121d060d-45eb-4744-9338-952c4af4461b	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	724684d4-7a7c-437a-b51b-cf87f8df6611	25	2026-06-02 11:15:25.206	2026-05-24 12:00:00	2026-06-02 11:15:25.206	2026-06-02 11:15:38.125
cb4a7847-e381-4793-959d-227baf919015	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	6a716f73-7b20-4c69-a47c-e7f79c45047c	26	2026-06-02 11:15:25.218	2026-05-24 12:00:00	2026-06-02 11:15:25.218	2026-06-02 11:15:38.125
e4f0856e-1196-41f7-b679-e1388eda6635	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	903c5f28-0f36-4ea4-9c64-c92437cfe919	27	2026-06-02 11:15:25.228	2026-05-24 12:00:00	2026-06-02 11:15:25.228	2026-06-02 11:15:38.125
e6d22102-ca16-40cd-bc25-7d074ac6911a	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	b8196f61-7740-439f-9091-6f254704fc28	28	2026-06-02 11:15:25.239	2026-05-24 12:00:00	2026-06-02 11:15:25.239	2026-06-02 11:15:38.125
85f2db74-664e-4568-b7aa-c02a296e9082	bdeeccbd-ea54-46ee-9ffb-a9b93005697b	1d4e926f-92cc-4175-87e5-210ae50bbef7	29	2026-06-02 11:15:25.25	2026-05-24 12:00:00	2026-06-02 11:15:25.25	2026-06-02 11:15:38.125
b73edf94-e9be-4821-b59b-1105cb5ad24d	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	9f42e218-3ae5-4cdf-a3ee-c0d039740532	23	2026-06-02 11:15:20.019	2026-05-24 12:00:00	2026-06-02 11:15:20.019	2026-06-02 11:15:38.273
e83f5993-6ff7-4a2a-b9c3-8d3845118eaf	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	e0e7f768-901f-4907-9664-9aebea9b1be9	24	2026-06-02 11:15:20.03	2026-05-24 12:00:00	2026-06-02 11:15:20.03	2026-06-02 11:15:38.273
76882efe-f48e-499b-b72b-fa19bf9cb6b5	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	f352b9fc-8849-48e0-9d69-e38f56336616	25	2026-06-02 11:15:20.041	2026-05-24 12:00:00	2026-06-02 11:15:20.041	2026-06-02 11:15:38.273
81a6cf80-aea4-4b4b-87aa-1a383c040593	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	a39e3b23-5524-4b6b-bd96-6ceec4a0fed0	26	2026-06-02 11:15:20.053	2026-05-24 12:00:00	2026-06-02 11:15:20.053	2026-06-02 11:15:38.273
6941603c-11df-4f35-9e98-41006a8247a5	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	69396e2d-6c37-4ffa-b852-86f9a51e53ae	27	2026-06-02 11:15:20.063	2026-05-24 12:00:00	2026-06-02 11:15:20.063	2026-06-02 11:15:38.273
5a4cdcfa-7c38-4c2e-b418-2360d383f546	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	e918c7db-bbc4-4668-9f50-d61758c214f4	28	2026-06-02 11:15:20.074	2026-05-24 12:00:00	2026-06-02 11:15:20.074	2026-06-02 11:15:38.273
7166d564-c573-4997-bb52-eaaecc8db694	9e3f1dd9-6002-4e6c-bf61-687805f8f16c	47dddbb3-0986-44bc-ba51-db33bb64ceab	29	2026-06-02 11:15:20.085	2026-05-24 12:00:00	2026-06-02 11:15:20.085	2026-06-02 11:15:38.273
84c9dc20-0313-40a6-a106-4f339e2ccd04	9f54615c-03ae-464b-adb4-50b9c1677d41	a33f99bd-db4a-432c-bf16-cc9919fb2593	23	2026-06-02 11:15:17.945	2026-05-24 12:00:00	2026-06-02 11:15:17.945	2026-06-02 11:15:38.36
f635293d-ebe4-4115-8382-97638f284a49	9f54615c-03ae-464b-adb4-50b9c1677d41	53a972f4-687e-481b-a63b-ccdf507c7c8c	24	2026-06-02 11:15:17.953	2026-05-24 12:00:00	2026-06-02 11:15:17.953	2026-06-02 11:15:38.36
ab9df10c-af5f-4467-a38e-3e7c920e5aff	9f54615c-03ae-464b-adb4-50b9c1677d41	962d05f6-1bc4-4f21-98b8-6df6c3f23258	25	2026-06-02 11:15:17.958	2026-05-24 12:00:00	2026-06-02 11:15:17.958	2026-06-02 11:15:38.36
62646e2e-8501-4022-bd9b-7938ed648652	9f54615c-03ae-464b-adb4-50b9c1677d41	067eaca4-1837-4977-b4d9-dfd8441cedd7	26	2026-06-02 11:15:17.963	2026-05-24 12:00:00	2026-06-02 11:15:17.963	2026-06-02 11:15:38.36
b3a8f170-97e4-4a24-a31e-369468617308	9f54615c-03ae-464b-adb4-50b9c1677d41	1debf467-3f4b-4d39-92be-07f68d5a22d4	27	2026-06-02 11:15:17.973	2026-05-24 12:00:00	2026-06-02 11:15:17.973	2026-06-02 11:15:38.36
04638daa-afcc-48c4-ae19-cd573f9a605d	9f54615c-03ae-464b-adb4-50b9c1677d41	1b9d1863-5a7a-44bf-b94f-b629c8f1d802	28	2026-06-02 11:15:17.979	2026-05-24 12:00:00	2026-06-02 11:15:17.979	2026-06-02 11:15:38.36
0dc97b38-2477-48b4-a733-c08ed152f853	9f54615c-03ae-464b-adb4-50b9c1677d41	865fa516-4671-4ec9-985d-a35deb7486cd	29	2026-06-02 11:15:17.987	2026-05-24 12:00:00	2026-06-02 11:15:17.987	2026-06-02 11:15:38.36
a46a9089-adaf-49ee-ad59-ce7b0bd25bca	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	00960590-ed20-45f3-a1a1-2c55e57c088f	28	2026-06-02 11:15:24.802	2026-05-24 12:00:00	2026-06-02 11:15:24.802	2026-06-02 11:15:38.447
44409a9d-fc2a-4b2d-90ae-9f1977812706	5a0b9311-e70c-4525-9b1b-48c1cdf15d33	c65b4310-946b-4bdf-b8ab-6867731f876d	29	2026-06-02 11:15:24.805	2026-05-24 12:00:00	2026-06-02 11:15:24.805	2026-06-02 11:15:38.447
ae99204f-e38f-4923-9962-54fd836d4aa1	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	6c0f62fb-a50d-4334-bbb0-d24597d5f84a	29	2026-06-02 11:15:18.764	2026-05-24 12:00:00	2026-06-02 11:15:18.764	2026-06-02 11:15:38.598
c0436cba-f730-47ed-8292-30a97326e807	c11ee3ba-bcce-424a-994e-6477045af536	3a082d06-554b-4cb5-97d7-02257f892eb5	23	2026-06-02 11:15:21.281	2026-05-24 12:00:00	2026-06-02 11:15:21.281	2026-06-02 11:15:38.801
a8611429-4c36-4982-9e05-b635537ad5d5	c11ee3ba-bcce-424a-994e-6477045af536	90378a10-4f09-4fae-99ab-7351964b27bd	24	2026-06-02 11:15:21.292	2026-05-24 12:00:00	2026-06-02 11:15:21.292	2026-06-02 11:15:38.801
0e42bbb2-7d0b-4070-bce5-6e4e1740d9ab	c11ee3ba-bcce-424a-994e-6477045af536	4c660b28-9715-44cb-8d97-6545685890db	25	2026-06-02 11:15:21.303	2026-05-24 12:00:00	2026-06-02 11:15:21.303	2026-06-02 11:15:38.801
83a8c455-a08e-49f7-acf8-b11e309b99b3	c11ee3ba-bcce-424a-994e-6477045af536	0d230b83-5893-4b2c-a906-32fa91cabcad	26	2026-06-02 11:15:21.314	2026-05-24 12:00:00	2026-06-02 11:15:21.314	2026-06-02 11:15:38.801
771f6c04-ea0c-4f0d-a547-6fee2527397d	c11ee3ba-bcce-424a-994e-6477045af536	054d97fa-60e2-42e8-afbd-1f85fe38d500	27	2026-06-02 11:15:21.324	2026-05-24 12:00:00	2026-06-02 11:15:21.324	2026-06-02 11:15:38.801
740feec8-5faa-4a69-94c1-3da6621b2348	c11ee3ba-bcce-424a-994e-6477045af536	c9c51b77-9c7c-43b6-9088-ac378d7fc29b	28	2026-06-02 11:15:21.335	2026-05-24 12:00:00	2026-06-02 11:15:21.335	2026-06-02 11:15:38.801
12565a3e-eade-4e8b-b9c4-d7f6187fd794	c11ee3ba-bcce-424a-994e-6477045af536	1ceac09e-367e-4c49-8504-4f2d1446bce8	29	2026-06-02 11:15:21.345	2026-05-24 12:00:00	2026-06-02 11:15:21.345	2026-06-02 11:15:38.801
83579516-f9ad-4396-a5af-5c4d23cc1eb6	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	b2a0489f-e8a6-4c81-a459-179fa9e10c24	29	2026-06-02 11:15:17.675	2026-05-24 12:00:00	2026-06-02 11:15:17.675	2026-06-02 11:15:39.081
97f0558b-caa1-41c6-92de-7786863031d5	3424bc38-f674-4378-a88c-1c9ec5b9a77c	8aadfde9-edb6-4e22-8549-fded1918d6a2	23	2026-06-02 11:15:25.821	2026-05-24 12:00:00	2026-06-02 11:15:25.821	2026-06-02 11:15:39.143
815d39ff-45ae-486a-b110-a84cd270a96e	3424bc38-f674-4378-a88c-1c9ec5b9a77c	5c258961-6034-4bdf-ad36-29b8f222894b	24	2026-06-02 11:15:25.831	2026-05-24 12:00:00	2026-06-02 11:15:25.831	2026-06-02 11:15:39.143
bd619e07-b215-4dd5-ad17-fb969f3b9eab	3424bc38-f674-4378-a88c-1c9ec5b9a77c	1e4202c0-2350-4343-9295-523878a2307b	25	2026-06-02 11:15:25.834	2026-05-24 12:00:00	2026-06-02 11:15:25.834	2026-06-02 11:15:39.143
8a0814ae-2d70-464e-ba11-e7f2ed888f21	3424bc38-f674-4378-a88c-1c9ec5b9a77c	236855f1-6e4c-4b06-8996-5b4bcc3c10ae	26	2026-06-02 11:15:25.836	2026-05-24 12:00:00	2026-06-02 11:15:25.836	2026-06-02 11:15:39.143
da6f1d42-f35f-4279-9d36-6fdb91a50b87	3424bc38-f674-4378-a88c-1c9ec5b9a77c	a730d085-8b1c-46f1-a6f8-a93611dcb7c4	27	2026-06-02 11:15:25.838	2026-05-24 12:00:00	2026-06-02 11:15:25.838	2026-06-02 11:15:39.143
6b63ffcd-f060-4076-86db-b8ba28bc954c	3424bc38-f674-4378-a88c-1c9ec5b9a77c	0efaaaeb-93b5-443f-9bfb-387c68cb22cb	28	2026-06-02 11:15:25.851	2026-05-24 12:00:00	2026-06-02 11:15:25.851	2026-06-02 11:15:39.143
5b27455d-479c-451c-9953-0e351f8cdb64	3424bc38-f674-4378-a88c-1c9ec5b9a77c	73efed03-f16e-4ed8-98e6-888c7979f07e	29	2026-06-02 11:15:25.853	2026-05-24 12:00:00	2026-06-02 11:15:25.853	2026-06-02 11:15:39.143
43260427-cb54-4a8b-9c87-e71807ffb45e	655df04f-5508-45f3-8032-fd657a753360	d812116e-a916-494f-9901-f86015ef14be	29	2026-06-02 11:15:24.142	2026-05-24 12:00:00	2026-06-02 11:15:24.142	2026-06-02 11:15:39.192
066c79aa-4855-4734-9429-8bc97548b0a4	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	a07b457b-a7d1-43f1-b7ac-8918537ee1d8	1	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.526	2026-06-02 11:15:39.526
3c4066a1-332b-4ede-b568-5831029cea3c	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	00e551e9-cf80-43b6-998e-974e2ef940ba	2	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.555	2026-06-02 11:15:39.555
45798f0a-7c60-4f2f-a19f-7ecaa8f19240	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	1fcc3535-c455-431f-8076-8b030ea870ce	3	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.592	2026-06-02 11:15:39.592
7b725113-ba4d-4a38-9655-d5a13b0816d3	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	5940b1ed-9c97-4d54-9892-29703cbb0fff	4	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.61	2026-06-02 11:15:39.61
0aaa185e-9236-46a0-95ea-d609bd1af5e6	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	5016323c-5321-44dc-9b3f-3531c214a196	5	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.643	2026-06-02 11:15:39.643
6be3dd87-0b59-4f0f-9d3c-df5105e82bd0	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	18efa90f-599e-48cb-9bf9-9bf68ab45a6e	6	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.677	2026-06-02 11:15:39.677
13fb975b-9a8f-47b6-97ea-d6dd11610e0f	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	db48942a-9977-4975-aca3-3a86c8d30a56	7	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.705	2026-06-02 11:15:39.705
1a6543e1-d028-46f9-9d84-7efaf858b841	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	efc0e6fa-6b95-4948-ba04-7910c62c69f6	8	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.72	2026-06-02 11:15:39.72
5ebe52db-cbae-4c5f-82ca-453b7c36a6a8	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	7319c8d1-cdaf-4bdb-b4f4-08fcbc65d684	9	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.731	2026-06-02 11:15:39.731
bb06dfd2-1140-4279-a44e-760c8a981434	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	968e177e-8b8e-4ba3-911c-5d4161811c66	11	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.775	2026-06-02 11:15:39.775
ff32e3e1-92ef-4084-8743-4ca4b5934f33	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	712620ca-401a-4905-9a60-e1fc82bd573a	12	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.815	2026-06-02 11:15:39.815
ca4438e8-59a2-4fea-a09e-1681a22527bd	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	adf7db12-390c-41e2-9dc5-0ab4ba3e9c21	13	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.835	2026-06-02 11:15:39.835
33b98acd-f448-46cd-a970-750f93cde539	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	c597247e-6f69-4373-bf57-268d478f7511	14	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.846	2026-06-02 11:15:39.846
960fca41-930c-458f-a0a1-9a47235f82ba	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	a5ab5319-0fb7-4df3-906a-5d29beee6197	15	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.866	2026-06-02 11:15:39.866
61d155bd-ad3b-48e4-9c17-f6f21b924782	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	f3b0246f-24c4-41e1-9fa5-94c209765037	16	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.876	2026-06-02 11:15:39.876
12369281-78db-4873-b2b0-1c6b0b27722e	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	1e8ba6bb-ba82-48f2-8afd-b9a6c182f8fa	17	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.887	2026-06-02 11:15:39.887
3b17f326-3cc7-447e-83f4-8925282cd7f7	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	7a6d3117-9ce0-4fa2-92a1-ae0d3acac071	18	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.904	2026-06-02 11:15:39.904
7ff05796-044c-4568-af90-88b66c47d326	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	17b424c3-5507-4641-a0c1-2e016dc64044	19	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.922	2026-06-02 11:15:39.922
95c26889-db89-4d86-8562-b525fc2e106a	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	b116eacf-dd0e-4ebe-b6c2-a88cd0e2b43f	20	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.933	2026-06-02 11:15:39.933
12b86e99-b1c8-4804-9198-7fafaf220b16	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	0eada5e5-77a1-427d-8521-1ecefca5d9ea	21	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.95	2026-06-02 11:15:39.95
bb26760d-835e-45ca-be74-e33450ed0466	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	1b42266b-1108-4cc5-aa2e-ae2327044383	22	2026-07-01 00:00:00	\N	2026-06-02 11:15:39.978	2026-06-02 11:15:39.978
7ae222d6-118c-42cd-869b-9dc029fb9ac0	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	71c2b098-02cd-446a-acb8-cc9a526ed606	1	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.035	2026-06-02 11:15:40.035
c29dd25b-eb6d-4735-a93b-e7b73917bd5d	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	47bfa3e8-46cc-40fe-934a-4635fb6d5903	2	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.042	2026-06-02 11:15:40.042
ada14724-bf5e-4731-9433-f84948baa41b	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	415e6a74-c873-4beb-81b8-64d89e55fb03	3	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.048	2026-06-02 11:15:40.048
7c189e5e-d7bf-4f9a-af94-606988cc1f3f	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	a0a867ce-244b-41af-84ef-ea299d32cc3b	4	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.054	2026-06-02 11:15:40.054
1f03ec1a-3ca8-4598-8085-5da9b7f74cb9	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	1a01fada-8a80-49af-87b2-018eb340323e	5	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.06	2026-06-02 11:15:40.06
7bbdd449-4a6c-439b-b487-c5688620985a	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	f9ad35f4-b443-4902-bc6c-1acbb892ed5d	6	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.067	2026-06-02 11:15:40.067
70602966-75b4-48e8-b928-714a85d8e4f7	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	02470155-2867-4d6d-b591-3a91ba1e9f3c	7	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.075	2026-06-02 11:15:40.075
775649ce-a4b8-4ca7-8671-3e32d96ddb60	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	66d0047d-98ab-49ac-adeb-ffc736a0284b	8	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.084	2026-06-02 11:15:40.084
959b3a32-e32f-4241-9098-e97bc59c5472	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	3797aed5-09d9-4efe-af60-1716f82ffefc	9	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.093	2026-06-02 11:15:40.093
f0874773-4830-46ac-860c-b03bc9d3f930	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	04e7a397-5c79-4389-8614-ffcf852eb8b5	11	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.118	2026-06-02 11:15:40.118
6bff3eed-96d0-4a63-b7ec-9275962653c6	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	44090201-f6b6-40a8-a198-a9ebb359f4e9	12	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.124	2026-06-02 11:15:40.124
6d58ae05-af36-48a5-923a-4cae32a3527e	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	94b3e3ec-88b9-4a27-9097-da2f2fbe4e22	13	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.131	2026-06-02 11:15:40.131
22ede869-3a65-46a8-9b2d-b92c8dfa196a	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	74556eef-90fd-4444-ad56-6ec8333ca444	14	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.149	2026-06-02 11:15:40.149
e337881f-d9c7-42be-a0ac-d32068481894	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	0a0765a7-7822-490b-ae43-ee9cd907b746	15	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.158	2026-06-02 11:15:40.158
095a1742-de8b-4a6d-84fb-c202c9d3bc87	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	257f4ccc-9efc-4066-a019-e6583f39cafb	16	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.175	2026-06-02 11:15:40.175
ff95c051-21fb-4032-9e18-2414518ed98c	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	9f1f08dc-ee75-44d8-8f95-6f0755046152	17	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.183	2026-06-02 11:15:40.183
9330f891-a6ad-42ac-96d1-0efd15e7134c	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	675475fc-9d9f-46cf-bc5e-a41f6f9b52d6	18	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.191	2026-06-02 11:15:40.191
d894a75f-264e-4862-87a5-617e01e7bc3d	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	c1f5f44d-0c9c-40f3-a2a2-15de111b2b3e	19	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.209	2026-06-02 11:15:40.209
9272f483-b299-40f3-8f5c-041fe94a5fe1	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	edfa91fe-10b5-4ac6-8134-7035a39ccf69	20	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.217	2026-06-02 11:15:40.217
ae756481-a3a8-4d1c-8776-713a5b5cd3cc	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	5622ae18-5359-4bc9-98e6-60b47a33c28f	21	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.226	2026-06-02 11:15:40.226
50e71575-5033-4d23-b2ac-d52163b24b9f	28a116e7-7f26-4a9e-95b0-8ada489dc4c6	a9e90f17-817e-45ff-aca2-572d4c3962f8	22	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.243	2026-06-02 11:15:40.243
77889fd1-7eaf-4d37-8548-a465b19b3f7b	812bcf01-a79f-4d7c-971a-68d2f79dedbf	7bebf77d-4b3e-47c9-bba2-21caec489934	1	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.285	2026-06-02 11:15:40.285
1c5ce2ce-e881-42b7-bbf0-c6795c38150b	812bcf01-a79f-4d7c-971a-68d2f79dedbf	af57aec8-dcae-440d-ae32-a6f384d15ccf	2	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.297	2026-06-02 11:15:40.297
11eb4bfc-08fd-4c54-a2f5-5d735830f060	812bcf01-a79f-4d7c-971a-68d2f79dedbf	15b3a75a-a22a-425e-8537-2584244970ed	3	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.306	2026-06-02 11:15:40.306
5241e245-0478-402c-8b3c-a7c6643853c2	812bcf01-a79f-4d7c-971a-68d2f79dedbf	42ab0f13-cbe7-42e6-9938-a752cdc84138	4	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.314	2026-06-02 11:15:40.314
dce392ee-2ef0-44ae-aa84-de631cf92f16	812bcf01-a79f-4d7c-971a-68d2f79dedbf	e12635e5-b64a-42d5-a055-af2fe6addaeb	5	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.322	2026-06-02 11:15:40.322
7e02fa28-026c-45f2-970a-332aca7820b0	812bcf01-a79f-4d7c-971a-68d2f79dedbf	b6be58ce-d149-4961-bf9b-1b94923549e9	6	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.333	2026-06-02 11:15:40.333
4012fb74-a969-40b5-ad9a-d1b6192fe823	812bcf01-a79f-4d7c-971a-68d2f79dedbf	e881998a-7c02-4fcd-a10a-94fbe54731da	7	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.344	2026-06-02 11:15:40.344
75cc681b-d581-48e7-a654-d4cd77430d03	812bcf01-a79f-4d7c-971a-68d2f79dedbf	0cae3a05-edf3-4955-bbcb-e2774605c43a	8	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.352	2026-06-02 11:15:40.352
5fc3afd0-e58d-4f47-bb50-f199fd6b59fa	812bcf01-a79f-4d7c-971a-68d2f79dedbf	c48cf810-b0cd-47b0-8795-33469bc0899c	9	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.359	2026-06-02 11:15:40.359
a79d414e-a059-4f0b-96d4-72bffe5570ad	812bcf01-a79f-4d7c-971a-68d2f79dedbf	d5b7d429-9025-49ea-a4f3-8c0fbd4e02cf	10	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.379	2026-06-02 11:15:40.379
be8fddc0-996b-4b35-8830-a8527a1bc333	812bcf01-a79f-4d7c-971a-68d2f79dedbf	ff64cb3e-aa09-47c5-b61c-01d21311459f	11	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.392	2026-06-02 11:15:40.392
fd323110-c014-42c4-a0f3-dd5dc66539cb	812bcf01-a79f-4d7c-971a-68d2f79dedbf	878bb9d4-6966-40b9-9be1-f4b0c4ffb363	12	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.399	2026-06-02 11:15:40.399
f62d5410-de1e-4efe-bc28-12a43c0cad8d	812bcf01-a79f-4d7c-971a-68d2f79dedbf	e92d09d9-4dad-4a8c-b8af-2ccc0d43d756	13	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.411	2026-06-02 11:15:40.411
10b6158b-f647-41a0-8210-c73ed12064b5	812bcf01-a79f-4d7c-971a-68d2f79dedbf	a58c4c70-257c-4bdf-a1f5-db91fe5ffca8	14	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.419	2026-06-02 11:15:40.419
b0af70cf-2fb4-411e-b0dc-df1a9408a85f	812bcf01-a79f-4d7c-971a-68d2f79dedbf	1622290f-528c-4253-8f0b-fd7940714460	15	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.427	2026-06-02 11:15:40.427
bd9b4b4d-a1dd-41fe-b07b-744432fb7c6f	812bcf01-a79f-4d7c-971a-68d2f79dedbf	237e4e91-22df-4cd8-9b20-8e0387ae4df6	16	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.437	2026-06-02 11:15:40.437
ff17deb3-2a15-4960-8ec6-8c87c630c274	812bcf01-a79f-4d7c-971a-68d2f79dedbf	416bfbfe-ce7d-48e2-bd7c-eaef37783ff1	17	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.444	2026-06-02 11:15:40.444
365503e9-f8c2-45a4-92c7-eef3d2853b80	812bcf01-a79f-4d7c-971a-68d2f79dedbf	0e0b9969-e6ed-465e-b75f-7376dcfc5bf1	18	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.461	2026-06-02 11:15:40.461
eaafb93c-83aa-4d44-812d-41d625c9b2bf	812bcf01-a79f-4d7c-971a-68d2f79dedbf	16be0e8e-ad02-4807-ba57-9d808b7c0556	19	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.47	2026-06-02 11:15:40.47
ad6615fb-5595-439b-98d6-0ce9f19c2b76	812bcf01-a79f-4d7c-971a-68d2f79dedbf	ccc5e5d1-b6a3-4a44-b3a9-1a9cf2bf5fe3	20	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.487	2026-06-02 11:15:40.487
71e18bb3-ce2c-4bb7-9d31-4ff4d67f93e2	812bcf01-a79f-4d7c-971a-68d2f79dedbf	8a567658-1e95-4b71-abab-e61e21521f00	21	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.495	2026-06-02 11:15:40.495
be73cc1b-0f84-49e0-a4d6-7b001f9a5f46	812bcf01-a79f-4d7c-971a-68d2f79dedbf	64dd2be9-6120-447d-8eaa-2be9cabceac8	22	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.502	2026-06-02 11:15:40.502
540528fd-a805-47ce-8723-4fdf81839558	bbaf22f6-6fd6-4198-a731-2293dff5361f	71b6543e-ba51-4dfe-9427-c4d13d5407d2	1	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.543	2026-06-02 11:15:40.543
1de1ea34-5013-4b45-a5f1-affe4a49c2e8	bbaf22f6-6fd6-4198-a731-2293dff5361f	80959eaf-be9e-46cb-93fa-2047199b168c	2	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.551	2026-06-02 11:15:40.551
a50008d7-f3a4-449b-b6eb-abf1cf0e2420	bbaf22f6-6fd6-4198-a731-2293dff5361f	e2c84f35-bae0-49b9-aa4f-5f79aa83600a	3	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.56	2026-06-02 11:15:40.56
5eff3246-21ae-4007-9131-882aa36e1c71	bbaf22f6-6fd6-4198-a731-2293dff5361f	095bf727-1323-44f9-9045-b9e2fb164237	4	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.576	2026-06-02 11:15:40.576
dca93388-e002-47b6-9f7e-e07720eaf2ba	bbaf22f6-6fd6-4198-a731-2293dff5361f	fc9d4e85-c4fb-4647-9be3-aac22508fa48	5	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.586	2026-06-02 11:15:40.586
1f68825b-9d36-4dd1-a51b-1fc3d46a59e0	bbaf22f6-6fd6-4198-a731-2293dff5361f	b7a230f4-cf88-4e53-9ad3-75cde7320d08	6	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.593	2026-06-02 11:15:40.593
9933dd5e-93ef-44ea-84f5-7cec58670fcf	bbaf22f6-6fd6-4198-a731-2293dff5361f	3ef34e15-293a-461b-98ac-a9cf286f7649	7	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.601	2026-06-02 11:15:40.601
6dbf49fe-52af-4d6b-a1c1-ac141f61b4a6	bbaf22f6-6fd6-4198-a731-2293dff5361f	479d99b1-8d05-48e9-a2d4-ca49a914582f	8	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.61	2026-06-02 11:15:40.61
29eda634-2411-4481-9c52-aa0de4b37864	bbaf22f6-6fd6-4198-a731-2293dff5361f	2f5033d0-2802-48e4-8f2c-fe3e9f9977c2	9	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.618	2026-06-02 11:15:40.618
2d7c9215-59f4-4feb-8ceb-60192646046a	bbaf22f6-6fd6-4198-a731-2293dff5361f	c83b042c-f0aa-444f-b76b-a6eb912f5180	10	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.625	2026-06-02 11:15:40.625
48c01250-345a-4317-9b46-3c40bf3a3c80	bbaf22f6-6fd6-4198-a731-2293dff5361f	93421834-8cc6-4d5b-b09f-8c8abbd35daa	11	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.633	2026-06-02 11:15:40.633
a1ebf714-25d1-42bd-b933-1aed5b57bf0d	bbaf22f6-6fd6-4198-a731-2293dff5361f	18e41bc7-ff86-4a10-b39b-2c44f5d8e391	12	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.639	2026-06-02 11:15:40.639
05745e64-1998-4c49-897f-a8b3ce42763f	bbaf22f6-6fd6-4198-a731-2293dff5361f	28025437-5953-4d5d-820a-4bb51bdb6340	13	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.646	2026-06-02 11:15:40.646
6c58fe50-9f30-421d-8fd7-e9c128c5e6c6	bbaf22f6-6fd6-4198-a731-2293dff5361f	1f316637-bba6-43de-a08d-32988bfa5dd5	14	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.652	2026-06-02 11:15:40.652
a5a2db1a-b32c-40ff-9a87-b1c763e69218	bbaf22f6-6fd6-4198-a731-2293dff5361f	e3148fa9-6630-4cc5-a414-a68d45bd9982	15	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.658	2026-06-02 11:15:40.658
f42a7205-8ec1-4298-8243-2721508dff0f	bbaf22f6-6fd6-4198-a731-2293dff5361f	9164fbee-f820-43cf-a96d-c58f835d38e6	16	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.664	2026-06-02 11:15:40.664
33d69330-6461-4675-913d-37fbe3f2de07	bbaf22f6-6fd6-4198-a731-2293dff5361f	ca3d7754-e45c-4bfd-b27b-ceed331a39d6	17	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.672	2026-06-02 11:15:40.672
e648766c-99c3-4119-b474-2d7d99597ffa	bbaf22f6-6fd6-4198-a731-2293dff5361f	f1f71be4-2891-4866-a71b-081edfc39231	18	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.687	2026-06-02 11:15:40.687
140a9926-786a-4cb0-9d1b-8bd367edf296	bbaf22f6-6fd6-4198-a731-2293dff5361f	0647cd85-8948-469b-84b0-e3cd49c14429	19	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.704	2026-06-02 11:15:40.704
e6ac212a-26c7-4f76-a8ab-58dd3f9c66dd	bbaf22f6-6fd6-4198-a731-2293dff5361f	481ba811-6a1f-4b5c-8cd1-0e1a45f09f20	20	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.711	2026-06-02 11:15:40.711
8fef6fbb-7d7d-4796-9c89-e9c40baad1b0	bbaf22f6-6fd6-4198-a731-2293dff5361f	ec0a729c-949b-4f66-b91e-e018176efefb	21	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.717	2026-06-02 11:15:40.717
53f75e09-756f-403d-a688-133bfb47e50c	bbaf22f6-6fd6-4198-a731-2293dff5361f	51902b20-c477-4604-9e27-ebe83b1b321d	22	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.733	2026-06-02 11:15:40.733
3daf056a-ad86-4a14-9ea6-ce8ae3b40625	3abf3147-a30b-45a7-801d-0d494314736f	dbc381b9-b7dc-4151-a797-866a4756b76e	1	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.784	2026-06-02 11:15:40.784
f0e2acbb-4fbb-4537-9b6a-892f17108952	3abf3147-a30b-45a7-801d-0d494314736f	0ecbfa78-3a29-4148-8319-f2253ba9fcfa	2	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.805	2026-06-02 11:15:40.805
b9439744-3c84-45ca-8001-17189131268d	3abf3147-a30b-45a7-801d-0d494314736f	375d007c-ad1b-42cc-ac30-895e900b9e44	3	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.823	2026-06-02 11:15:40.823
b4a9911b-5a13-4c1d-8041-6ce67f45f1b7	3abf3147-a30b-45a7-801d-0d494314736f	d978e2ca-a638-4945-9423-a0db67bb80ab	4	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.832	2026-06-02 11:15:40.832
c96d9088-19b8-4e60-a274-08ad4c708a21	3abf3147-a30b-45a7-801d-0d494314736f	153fb8d5-6040-4565-bf55-5694453dd4ba	5	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.844	2026-06-02 11:15:40.844
1453ab28-8b8a-409a-b0a5-b2b2f7f5cf84	3abf3147-a30b-45a7-801d-0d494314736f	eae1ff89-2355-4067-a576-d5b5627b92f9	6	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.858	2026-06-02 11:15:40.858
0a2a8e3e-a6c2-46a7-8f3c-4b3c3de7d980	3abf3147-a30b-45a7-801d-0d494314736f	067e901e-2515-4d1b-bce0-b809e7265efa	7	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.878	2026-06-02 11:15:40.878
9e8c7c66-119f-4dfe-a694-16bbcb6ba8ab	3abf3147-a30b-45a7-801d-0d494314736f	df2f8063-4264-42e8-b32e-6fc168e8648c	8	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.885	2026-06-02 11:15:40.885
5a239088-98c5-4a44-8989-1dbc2315e4f3	3abf3147-a30b-45a7-801d-0d494314736f	6357e566-aac1-4c8d-bf76-493b6d9e9d66	9	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.896	2026-06-02 11:15:40.896
1777f4a0-e532-47cb-9f99-cebd36229d10	3abf3147-a30b-45a7-801d-0d494314736f	1bc1ee5c-9e7d-4fb2-b4f0-b74422aa9358	10	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.908	2026-06-02 11:15:40.908
ed6475bd-7082-4a4e-b217-8e432b74f672	3abf3147-a30b-45a7-801d-0d494314736f	6e9e1c60-d9f6-4333-a77b-c920d344a8d7	11	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.916	2026-06-02 11:15:40.916
ca39fcde-e3b3-4b01-923e-165fbfa90b99	3abf3147-a30b-45a7-801d-0d494314736f	c94c1e93-d0f7-4cdf-a27b-396674d0862a	12	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.928	2026-06-02 11:15:40.928
a82e86bb-7b3b-4b00-8b96-5dabc62b8d9f	3abf3147-a30b-45a7-801d-0d494314736f	1169cb14-ebd4-442c-8d4a-7a7f86958bf7	13	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.94	2026-06-02 11:15:40.94
8f6b29ca-3b1b-4bf4-8fcf-6bc46b0dc1ab	3abf3147-a30b-45a7-801d-0d494314736f	d10d5eee-d834-4826-b130-cd9ba3a09111	14	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.959	2026-06-02 11:15:40.959
ea150ac7-5dbf-4869-84c0-c59e14598a9c	3abf3147-a30b-45a7-801d-0d494314736f	548a2c87-52c1-404f-a284-c3f6a6a8149d	15	2026-07-01 00:00:00	\N	2026-06-02 11:15:40.992	2026-06-02 11:15:40.992
0d636a54-79bd-43dc-ba06-b683d1b4f60d	3abf3147-a30b-45a7-801d-0d494314736f	453c8104-f588-4507-afe8-8d6d7e04008b	16	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.025	2026-06-02 11:15:41.025
abc27b8b-2daf-4149-8252-9a7335617441	3abf3147-a30b-45a7-801d-0d494314736f	75964202-f2f2-4cf4-9ebb-ff75fe7c5ae5	17	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.059	2026-06-02 11:15:41.059
0bd76f48-2e24-4f5e-836a-80b0806bca54	3abf3147-a30b-45a7-801d-0d494314736f	20d22fe8-2a0d-412b-897f-45c9b4050f27	18	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.082	2026-06-02 11:15:41.082
ee3c6379-b251-408a-8206-976e384d8655	3abf3147-a30b-45a7-801d-0d494314736f	95fb29d2-81fb-43f4-a33f-5bc508fcb98e	19	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.105	2026-06-02 11:15:41.105
07d16be0-642a-432f-9d7a-577d60d91ef8	3abf3147-a30b-45a7-801d-0d494314736f	be2ca5bb-c1e7-47eb-97f2-799171d4f9b6	20	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.128	2026-06-02 11:15:41.128
254dc92b-37bd-4d8c-8be5-1fcaee39e3e2	3abf3147-a30b-45a7-801d-0d494314736f	9b673f4f-7e84-4189-b178-de03db479232	21	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.152	2026-06-02 11:15:41.152
1560ff54-643a-46f7-963a-d862e1d74eb8	3abf3147-a30b-45a7-801d-0d494314736f	5b822f22-f904-420f-b27d-989b20ab9c90	22	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.176	2026-06-02 11:15:41.176
fec6175a-479a-40eb-b079-2d98da7c34b9	c4488d60-4eb1-49af-b503-1bce07a2548e	44a57381-9a32-47eb-a1e5-b7ac7930bde9	1	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.279	2026-06-02 11:15:41.279
f6b89f44-cee8-43fd-bcd3-88c9787cb8a2	c4488d60-4eb1-49af-b503-1bce07a2548e	27e0fe6e-ff68-4037-9958-9ad431c70743	2	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.306	2026-06-02 11:15:41.306
083fca61-7095-4824-a916-a364f4557fb8	c4488d60-4eb1-49af-b503-1bce07a2548e	b5891723-34bc-4d26-a4a6-ffc21bc6098d	3	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.326	2026-06-02 11:15:41.326
1f795676-1ece-460b-9a9f-184240443cfb	c4488d60-4eb1-49af-b503-1bce07a2548e	da210168-d897-4d4c-8976-74fd5da637e5	4	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.345	2026-06-02 11:15:41.345
65075574-8d7b-4ea0-8103-d7c85ea8feaa	c4488d60-4eb1-49af-b503-1bce07a2548e	154c06fb-17c5-4afe-991a-80d6edb7293f	5	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.356	2026-06-02 11:15:41.356
7499c017-0287-4cc2-9c1c-c9a3344cf06d	c4488d60-4eb1-49af-b503-1bce07a2548e	2e868acb-916b-493e-8671-65355c057f1e	6	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.393	2026-06-02 11:15:41.393
56994107-d2d1-48cc-868f-f154bf4a47bb	c4488d60-4eb1-49af-b503-1bce07a2548e	29f5c580-d3c3-4f44-ab39-afe9695e6ea3	7	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.434	2026-06-02 11:15:41.434
137236f7-04fa-4ea1-88c5-026e908f6a93	c4488d60-4eb1-49af-b503-1bce07a2548e	7259f9a7-f6dc-4944-8ba3-392b01b4fc67	8	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.474	2026-06-02 11:15:41.474
63175c65-04f4-4862-8aa6-0afc6581aa48	c4488d60-4eb1-49af-b503-1bce07a2548e	bd0c801c-49bd-4e6a-a214-3c56700c9957	9	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.507	2026-06-02 11:15:41.507
b9d63afe-5c38-4b23-bb00-484b7282ae2b	c4488d60-4eb1-49af-b503-1bce07a2548e	b8ad528a-514d-4909-9df5-9113e6602dff	10	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.542	2026-06-02 11:15:41.542
b4029ff3-7083-479c-b89b-a7a8611896ff	c4488d60-4eb1-49af-b503-1bce07a2548e	0ea67e15-9257-40ae-ba44-151a71989a06	11	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.575	2026-06-02 11:15:41.575
5b01515b-a276-4e61-9438-342e81a0597b	c4488d60-4eb1-49af-b503-1bce07a2548e	66892360-1818-4050-a7c2-fc0c4d249641	12	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.609	2026-06-02 11:15:41.609
b9968926-9140-4aaf-9ece-e9989523b836	c4488d60-4eb1-49af-b503-1bce07a2548e	47d9bd8e-5b4a-44f9-8d9f-897e335411f3	13	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.642	2026-06-02 11:15:41.642
0df4c575-8c22-456d-97b1-9df5bb0ffb4b	c4488d60-4eb1-49af-b503-1bce07a2548e	6f0a1ff0-1547-49b3-994f-db0caf4dcfa9	14	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.664	2026-06-02 11:15:41.664
eabcb755-f5a4-4d9e-a3b1-fd3665d56eb1	c4488d60-4eb1-49af-b503-1bce07a2548e	f5d684e2-ac2b-4f76-86f3-3bd94ea23afc	15	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.687	2026-06-02 11:15:41.687
87584b21-214e-4586-bad0-07d381f9ae85	c4488d60-4eb1-49af-b503-1bce07a2548e	cf765b9d-6ae9-4622-bcc7-7a51a102254e	16	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.709	2026-06-02 11:15:41.709
c6dfc19b-cd60-4b08-a91d-fb5ea2c85d01	c4488d60-4eb1-49af-b503-1bce07a2548e	04bc1615-52c1-4602-87e4-09667b7c9610	17	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.738	2026-06-02 11:15:41.738
ea55be21-e459-49d3-a9ed-e6163ef60818	c4488d60-4eb1-49af-b503-1bce07a2548e	f81166a4-659a-472c-b15c-9a8b6633b15f	18	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.762	2026-06-02 11:15:41.762
d764335b-0564-4b1b-a5d6-a0ad82ad37d2	c4488d60-4eb1-49af-b503-1bce07a2548e	866a8335-6f78-47b3-b331-8c22ab5dc4d4	19	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.811	2026-06-02 11:15:41.811
7c421e24-f6f4-493f-9198-f37ab92fb35c	c4488d60-4eb1-49af-b503-1bce07a2548e	33c2b628-0823-40a5-aaa9-d5be37789386	20	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.846	2026-06-02 11:15:41.846
9c31e125-e9fa-4a2a-86d1-49c863493444	c4488d60-4eb1-49af-b503-1bce07a2548e	d8cd9c50-2885-4ae8-b3c5-1b2f39484bcf	21	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.874	2026-06-02 11:15:41.874
499227b8-dab0-4730-ba2c-ad51f43ca603	c4488d60-4eb1-49af-b503-1bce07a2548e	d4a4b563-fab1-4277-a445-af8e4299dacd	22	2026-07-01 00:00:00	\N	2026-06-02 11:15:41.908	2026-06-02 11:15:41.908
188bc676-6e67-421a-a49f-58346c5e9852	3979babb-d543-4433-92e8-e2fc59ea6ae6	ada6bd22-7476-4c9c-a598-71b7362342e5	1	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.018	2026-06-02 11:15:42.018
2c8ce08e-5127-48a0-901b-9d3e1fabdcde	3979babb-d543-4433-92e8-e2fc59ea6ae6	ef67c7b7-aef0-4a9d-af7d-50965466011e	2	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.044	2026-06-02 11:15:42.044
53ea16b9-4ad6-44b0-a3c4-599517fa4b45	3979babb-d543-4433-92e8-e2fc59ea6ae6	6b893640-69c6-4fac-9035-412298f532ac	3	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.077	2026-06-02 11:15:42.077
87287ca6-9b67-4dbe-9af4-8c76c9837cc5	3979babb-d543-4433-92e8-e2fc59ea6ae6	f176673b-54f3-4793-9dbf-a2a4aabb9526	4	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.12	2026-06-02 11:15:42.12
96e2d52c-d330-43b9-85cf-57f955edd42d	3979babb-d543-4433-92e8-e2fc59ea6ae6	cc1e8d5a-d180-4c5b-b440-d411f4a733fd	5	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.15	2026-06-02 11:15:42.15
9da932c1-be6c-4cef-af28-f8cc94c5434c	3979babb-d543-4433-92e8-e2fc59ea6ae6	e691dcf4-7d6d-46fe-af63-879d5c1dce8f	6	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.172	2026-06-02 11:15:42.172
9b88b301-4a92-49c2-ae62-a5e7f77e6741	3979babb-d543-4433-92e8-e2fc59ea6ae6	d236aef2-59d3-4d20-b8b6-490ee1f64111	7	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.203	2026-06-02 11:15:42.203
8eebe7b4-8e2b-4ac1-9719-079e5d4e92d2	3979babb-d543-4433-92e8-e2fc59ea6ae6	d84df371-66f6-4842-963b-0b221edcee55	8	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.225	2026-06-02 11:15:42.225
f7f35118-ff28-43a9-966d-95168f4cbae5	3979babb-d543-4433-92e8-e2fc59ea6ae6	b9f8f85c-3a2c-4358-ae73-17f6d456d5a1	9	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.246	2026-06-02 11:15:42.246
19450b52-db87-4d2c-b2ba-15f15499bff7	3979babb-d543-4433-92e8-e2fc59ea6ae6	6113739d-38e0-4849-9444-4c5f3f6495d7	10	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.268	2026-06-02 11:15:42.268
6465e45c-a987-4f09-86b0-d88457016710	3979babb-d543-4433-92e8-e2fc59ea6ae6	77c8725d-c727-49dd-ae81-ac3a98791291	11	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.306	2026-06-02 11:15:42.306
7bc7deb4-6b1a-4be7-b6e3-108312728467	3979babb-d543-4433-92e8-e2fc59ea6ae6	d1749321-89a1-4b45-a2fa-e8c0c0680fed	12	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.314	2026-06-02 11:15:42.314
4ff652ec-0d28-4555-9e46-07f987df669a	3979babb-d543-4433-92e8-e2fc59ea6ae6	8f0c6f44-fa5f-4e17-8234-1a8ba6f0f9fd	13	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.322	2026-06-02 11:15:42.322
1d7c269c-1ac2-4717-b987-e15d7d77c865	3979babb-d543-4433-92e8-e2fc59ea6ae6	36b9900f-c99f-43e1-bcde-6a83dde036de	14	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.328	2026-06-02 11:15:42.328
b8d9fbd3-e9e6-456a-8ca0-dfed41c7fbdb	3979babb-d543-4433-92e8-e2fc59ea6ae6	ea601d18-5216-43b9-9ef7-015b18e80c1f	15	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.336	2026-06-02 11:15:42.336
8978f563-df21-4cd0-abb4-a4d71f6c63ff	3979babb-d543-4433-92e8-e2fc59ea6ae6	490319ef-16ea-4f53-9dd4-31adfa9ea3bd	16	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.357	2026-06-02 11:15:42.357
de165631-7ef9-45f6-a280-4ef2a2e98416	3979babb-d543-4433-92e8-e2fc59ea6ae6	81d8e725-5128-4c19-9c6b-21a2b53c47cb	17	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.375	2026-06-02 11:15:42.375
f7188ec2-d9f6-499f-a18d-43cdf5c16cee	3979babb-d543-4433-92e8-e2fc59ea6ae6	d690dd3b-b00a-4d90-9063-07244e875b29	18	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.385	2026-06-02 11:15:42.385
b93be2ed-65d4-486e-a2b7-eba2c453cb71	3979babb-d543-4433-92e8-e2fc59ea6ae6	be4d921e-d8e1-4ec0-8968-90b026d4b10c	19	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.395	2026-06-02 11:15:42.395
397eed20-444d-4d7b-ab35-d56080e9df56	3979babb-d543-4433-92e8-e2fc59ea6ae6	d1b34a3b-7c6d-4ce1-8133-e45c75310f3a	20	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.404	2026-06-02 11:15:42.404
1cfa1092-517f-4469-a5b3-cfcf9197a4f6	3979babb-d543-4433-92e8-e2fc59ea6ae6	17e881b7-26c0-4d6f-a511-dbb5c94f5dc5	21	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.413	2026-06-02 11:15:42.413
33811e5a-3da8-49a6-b590-99e001217588	3979babb-d543-4433-92e8-e2fc59ea6ae6	270ded75-2473-4605-8fd8-28b2d0d1be7f	22	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.432	2026-06-02 11:15:42.432
6ff598a1-0be3-4beb-bf19-110a90bf668e	171c9c8d-b7f6-4831-bc9a-1e33ef451497	20f92b15-4f61-4f7d-bb28-e7a90e84fa89	1	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.552	2026-06-02 11:15:42.552
fbed0720-31db-4ad5-9421-6cb6ce9a0a50	171c9c8d-b7f6-4831-bc9a-1e33ef451497	6ef3c8cb-33cd-4cbd-bb56-1820ee2c2c5a	2	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.579	2026-06-02 11:15:42.579
3dc8c601-4ecb-43c6-ac6a-6a814e2d5a6c	171c9c8d-b7f6-4831-bc9a-1e33ef451497	71c6373c-da12-45ec-9f49-a33612416ad8	3	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.602	2026-06-02 11:15:42.602
be1c0044-1ab5-4e5c-9ff3-40b99645d30f	171c9c8d-b7f6-4831-bc9a-1e33ef451497	49110e14-c0a3-45aa-bac3-3c92a93e69ce	4	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.625	2026-06-02 11:15:42.625
8f2bf440-464d-4afa-b96e-1d537182de53	171c9c8d-b7f6-4831-bc9a-1e33ef451497	9c94b743-2765-4806-84c0-dc15f56cb097	5	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.648	2026-06-02 11:15:42.648
49ebc70a-cc7e-42de-a95c-d2e4184909f8	171c9c8d-b7f6-4831-bc9a-1e33ef451497	1efcb023-28fb-400f-9d2b-3bb60ca025f8	6	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.671	2026-06-02 11:15:42.671
6c179217-7cb2-4a62-a2d8-a9a8ef966b20	171c9c8d-b7f6-4831-bc9a-1e33ef451497	3fb9fadd-8296-413f-8da7-2ef2b653389d	7	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.697	2026-06-02 11:15:42.697
dbb6f85c-bf63-4bf2-b676-6af40ba11602	171c9c8d-b7f6-4831-bc9a-1e33ef451497	1a086f59-119f-4847-ac85-d97956b717ce	8	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.72	2026-06-02 11:15:42.72
aa6c8cbf-2644-4080-80fc-27196b31c74e	171c9c8d-b7f6-4831-bc9a-1e33ef451497	18f5012f-2db2-4420-b3b7-d20ca49fc91d	9	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.744	2026-06-02 11:15:42.744
f9c02d89-db9c-4681-bbc3-39b7793d8c53	171c9c8d-b7f6-4831-bc9a-1e33ef451497	0a9ab0af-4a31-4e82-acef-faa0084edcb6	10	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.765	2026-06-02 11:15:42.765
d496f5e2-1089-4f98-9008-a06fb93da4d5	171c9c8d-b7f6-4831-bc9a-1e33ef451497	c63720ce-da71-4aca-a43e-f2293df85484	11	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.788	2026-06-02 11:15:42.788
33ac4778-e4b1-4bd0-8859-e6f9e9683894	171c9c8d-b7f6-4831-bc9a-1e33ef451497	4ebd60d0-2be5-4ed4-bd86-dfb98659316b	12	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.809	2026-06-02 11:15:42.809
10310a4f-714f-4ff3-b8f2-8c01cec6d8c8	171c9c8d-b7f6-4831-bc9a-1e33ef451497	c9655bec-0ab1-41ac-a5fc-261788c240d3	13	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.83	2026-06-02 11:15:42.83
69508e9a-c1d5-4b11-9144-3b682ef5b84d	171c9c8d-b7f6-4831-bc9a-1e33ef451497	ec434b4d-416c-40e7-bc17-b65ca576a873	14	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.854	2026-06-02 11:15:42.854
00bcf3de-4d0d-48a2-a8c0-dc7054d2844a	171c9c8d-b7f6-4831-bc9a-1e33ef451497	ca5b61d5-516e-44b2-b91a-f435cd5ca8f8	15	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.875	2026-06-02 11:15:42.875
689f461b-d6f4-4c47-9642-fcf9c5e9f80c	171c9c8d-b7f6-4831-bc9a-1e33ef451497	d2c50be5-366d-4fbd-9727-fa2b1dd87519	16	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.898	2026-06-02 11:15:42.898
d26e9832-39f5-4d5e-84cf-ef389b0f43fe	171c9c8d-b7f6-4831-bc9a-1e33ef451497	49832289-0a10-499a-ab3c-047152adbf7b	17	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.92	2026-06-02 11:15:42.92
ca9369fd-1579-4b3f-a54d-86b21f8eafb2	171c9c8d-b7f6-4831-bc9a-1e33ef451497	097703f4-aef3-4f53-9698-b52388c91b28	18	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.943	2026-06-02 11:15:42.943
58c690bb-56b0-4e69-9612-c7119c2cad55	171c9c8d-b7f6-4831-bc9a-1e33ef451497	e1d9e0e8-e498-470f-94bf-3b35d7d4fca4	19	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.965	2026-06-02 11:15:42.965
69810be6-9a6a-4e13-8f58-b19c1175f825	171c9c8d-b7f6-4831-bc9a-1e33ef451497	2fd625ab-ed34-44f6-80a8-470803b20fb6	20	2026-07-01 00:00:00	\N	2026-06-02 11:15:42.988	2026-06-02 11:15:42.988
4b9b546a-690f-47af-bc58-2e1555d9ebe3	171c9c8d-b7f6-4831-bc9a-1e33ef451497	0c32f6fd-4f23-4da5-9b30-11fe7efeecaa	21	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.011	2026-06-02 11:15:43.011
e7af4a8a-b1bb-4206-92d3-bddabc995548	171c9c8d-b7f6-4831-bc9a-1e33ef451497	4e8f6a9c-cc0b-4459-9127-5b23eb0a9fc2	22	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.035	2026-06-02 11:15:43.035
dbeec8bb-07f3-4c1e-a2d6-eed0decdba20	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	cc72af5c-a7a9-40a9-b9a5-651d379d9369	1	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.132	2026-06-02 11:15:43.132
e99fb420-3cd6-4165-ba9f-1c82a86f6c9a	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	e8004612-48c4-419b-a310-8386ac0bde90	2	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.163	2026-06-02 11:15:43.163
202eca97-8174-4d38-8fa9-86f8ff350683	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	b4f07604-c273-4c4c-b862-b543b440b307	3	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.185	2026-06-02 11:15:43.185
8d58dc88-befa-4ebe-a855-8ed4adb17ad7	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	d8795277-200e-4a8a-8c60-f5bdef0b7800	4	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.218	2026-06-02 11:15:43.218
61d772e2-fec1-4541-b824-0d61945ced09	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	cf713531-03f8-450e-be8c-3a9d41cf0039	5	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.257	2026-06-02 11:15:43.257
f478a27b-84d5-433f-b6c9-6bea9dc67f39	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	527527d8-401a-4118-adb8-b6b6520743f7	6	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.291	2026-06-02 11:15:43.291
5dc7ee99-9caa-4448-a8c9-fbe7a32c531f	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	161543cf-d8cf-41ca-bf81-4276a01dfbb9	7	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.321	2026-06-02 11:15:43.321
5ab6a7c5-4353-4745-82cd-3b9b2dfff5fa	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	fd3222cc-dd75-4932-ba8f-900686e1c0f8	8	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.343	2026-06-02 11:15:43.343
ff4356be-8943-4c48-8ed7-051c3720db61	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	e50a983b-9737-412d-b920-02791f950049	9	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.365	2026-06-02 11:15:43.365
79769d48-2b10-4898-993d-6f7ea42552a5	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	389ae91a-58ef-4fb2-ac0a-e416c63e64a2	10	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.388	2026-06-02 11:15:43.388
1c31b58d-967f-4b02-b95e-767e251a6ac3	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	088f7b48-45d7-458f-a774-49901c1311d4	11	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.393	2026-06-02 11:15:43.393
90ae28d2-06f3-4416-afe3-cf15f76d9306	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	99b3d90d-c984-4a18-81a5-4fccd11f4fa5	12	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.4	2026-06-02 11:15:43.4
e0f34d52-11d2-4a13-bc28-34dfee22f7fc	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	8c8a4f03-1751-4566-acc8-c573d44515c4	13	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.405	2026-06-02 11:15:43.405
aac1d502-8bd1-480a-a573-0731963b04f2	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	a6d451a4-e3d4-4476-982d-c63eb154d308	14	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.411	2026-06-02 11:15:43.411
b92f9f68-e219-465f-a15f-1900957861d1	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	b6e87068-680c-4e89-a123-8bcef5ce1db4	15	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.419	2026-06-02 11:15:43.419
8b8099a0-8e6b-4542-843b-bbce23752801	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	e55e9c67-a9f9-4aef-99f6-3c3b3ceb6ce9	16	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.451	2026-06-02 11:15:43.451
37b7e7b8-f463-4935-ad83-255bedb0d52e	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	be43e627-9978-4944-82e2-a630f477b104	17	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.474	2026-06-02 11:15:43.474
83d3a9c4-3f21-41ed-830c-b1cb297fff67	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	ed9a94ed-0237-44b5-b951-9486e2f5d215	18	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.497	2026-06-02 11:15:43.497
93541a07-5d5d-4f5a-82fc-8e50b20578c8	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	7d1d7e50-0e0d-4999-b254-0a7203dbf72e	19	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.506	2026-06-02 11:15:43.506
ab0925ba-b1bd-42dc-876d-dfc4f9e565cb	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	a2ed25ab-253e-42b6-99ba-463a48ba9253	20	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.523	2026-06-02 11:15:43.523
831d473c-8fe7-45b1-aeca-85aae26a73e5	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	38518774-db66-401b-8679-e2994581f86a	21	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.532	2026-06-02 11:15:43.532
53cadeef-93da-407a-b46d-dc50fd4746e9	fbdb44fb-0f94-4e41-bde2-21ef615f6cad	6174eb6e-ca5f-44c5-ae0b-be7dce92ec83	22	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.541	2026-06-02 11:15:43.541
5eb90701-c6d7-4b0c-aff7-95a661f19e19	7ac6674c-a0a6-444e-854b-65bc7a85772d	47fe421f-a2cb-4d81-81a9-b116d19d5237	1	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.604	2026-06-02 11:15:43.604
040b59e4-bcfa-454c-bdf0-5b3aeeeea593	7ac6674c-a0a6-444e-854b-65bc7a85772d	1c1aaf18-7ac9-457b-9366-b02b51935448	2	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.629	2026-06-02 11:15:43.629
b850c789-2563-4d8c-a818-8c60a982ef4d	7ac6674c-a0a6-444e-854b-65bc7a85772d	56be21cf-7f79-4533-a3a3-fd297aad02f6	3	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.642	2026-06-02 11:15:43.642
2ce72e33-e1b0-45fb-936c-dda5a0ed3d3f	7ac6674c-a0a6-444e-854b-65bc7a85772d	1b4015e3-5749-4192-99cb-0e3f1eb5d83a	4	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.65	2026-06-02 11:15:43.65
246e4f8c-cb16-49f9-9e9c-b6331b70a53d	7ac6674c-a0a6-444e-854b-65bc7a85772d	f381d450-6e67-410e-b932-ac180c4d0083	5	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.658	2026-06-02 11:15:43.658
babca6c1-8b90-44a2-bcf2-104f7e80a1c5	7ac6674c-a0a6-444e-854b-65bc7a85772d	47cf0a86-b72e-4c24-8161-a12498c32294	6	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.682	2026-06-02 11:15:43.682
a56bab86-d09c-41e8-b656-728a88f824b2	7ac6674c-a0a6-444e-854b-65bc7a85772d	04707ddf-1049-4e9a-97f6-05365507539e	7	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.69	2026-06-02 11:15:43.69
a79c1e07-d53e-4959-9c9f-25fe7501dd65	7ac6674c-a0a6-444e-854b-65bc7a85772d	89a0721e-9a48-471a-a188-bc0a056ca571	8	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.697	2026-06-02 11:15:43.697
00beca94-beb9-40e2-95d2-fcebfe441b42	7ac6674c-a0a6-444e-854b-65bc7a85772d	8471639e-015a-4d02-b2bb-17794040912b	9	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.705	2026-06-02 11:15:43.705
dd4ca02e-95c8-4eeb-823e-c5ee79f8a199	7ac6674c-a0a6-444e-854b-65bc7a85772d	b61564ef-47a1-4f64-ac04-ab713c0ffb6a	10	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.711	2026-06-02 11:15:43.711
2459295b-e201-40b7-be63-d66d6d69cc8f	7ac6674c-a0a6-444e-854b-65bc7a85772d	23f80bd8-70df-4b27-bbff-581a04dcde2c	11	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.721	2026-06-02 11:15:43.721
5d4dfd86-f5a7-4775-b423-65ceeec73223	7ac6674c-a0a6-444e-854b-65bc7a85772d	bb4ca178-5144-476f-8edd-e3ae122a522e	12	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.729	2026-06-02 11:15:43.729
7a9eddbd-7587-4931-93f5-c31c8e0389d0	7ac6674c-a0a6-444e-854b-65bc7a85772d	1b3b2aa7-ce4f-4491-b67b-c98a2a5477da	13	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.746	2026-06-02 11:15:43.746
bdce4657-c906-4469-aed9-a8c5618cf969	7ac6674c-a0a6-444e-854b-65bc7a85772d	d819b7d2-a0b5-48a6-83bd-49593d1970f9	14	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.755	2026-06-02 11:15:43.755
7d2abffe-621c-4c58-b9ce-8efc61b6e003	7ac6674c-a0a6-444e-854b-65bc7a85772d	901ac6ab-66f2-4f5e-8e39-927556bcf961	15	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.761	2026-06-02 11:15:43.761
689bf045-8dea-40ff-8795-ef442350636a	7ac6674c-a0a6-444e-854b-65bc7a85772d	23f3409d-1c00-4726-85d7-3d560ac0c5af	16	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.768	2026-06-02 11:15:43.768
7e6d9ae3-6fee-4e00-a208-9e5bea6177a4	7ac6674c-a0a6-444e-854b-65bc7a85772d	9228c785-f4b9-4f98-b305-ea8417d1fbf5	17	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.774	2026-06-02 11:15:43.774
7efab2ab-0d8b-48ed-a0e8-7cc783599251	7ac6674c-a0a6-444e-854b-65bc7a85772d	adac649b-0a5d-478e-a5b5-9201ed46acde	18	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.781	2026-06-02 11:15:43.781
9e024c51-d05d-47b5-b9fd-0a30fd86b700	7ac6674c-a0a6-444e-854b-65bc7a85772d	44a63603-707a-4e81-8346-8d4f04df323b	19	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.789	2026-06-02 11:15:43.789
71a73204-f1b4-4786-985c-f39eeba206c5	7ac6674c-a0a6-444e-854b-65bc7a85772d	816dcc60-beed-429b-a76a-74e5c72192cb	20	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.795	2026-06-02 11:15:43.795
2365a30d-72a9-45f6-892b-bfacd04bc14d	7ac6674c-a0a6-444e-854b-65bc7a85772d	4b4c5357-d369-4d53-9e14-2ffbbaa7453e	21	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.803	2026-06-02 11:15:43.803
e25afaf7-852b-431d-9c34-99d3f542622c	7ac6674c-a0a6-444e-854b-65bc7a85772d	f532de2b-7181-4248-a3a8-5e1a23a2b90b	22	2026-07-01 00:00:00	\N	2026-06-02 11:15:43.818	2026-06-02 11:15:43.818
0c518b00-05e7-4d1b-a346-a4831b296c79	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	58a56ed1-c2ae-4629-a7dd-8f03a66605b1	1	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:43.877	2026-06-02 11:15:48.181
2443b060-2243-4d06-a1c4-e7aea141bd6c	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	e026e3ef-a4e7-4a83-b9f0-4332590d9520	2	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:43.9	2026-06-02 11:15:48.181
9ea572a3-6999-40a5-b43a-6c7ab8297d38	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	d5506a01-1cca-4d40-9b61-056843d231a4	3	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:43.928	2026-06-02 11:15:48.181
017f0370-465c-444b-a4d1-0ebb6db4844a	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	5e6dc45c-4355-4c25-99ef-f67c17e60d84	4	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:43.96	2026-06-02 11:15:48.181
c1523a7c-645a-443c-a533-6e67a2670251	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	266249e1-1f57-4f70-afa6-021b10c63a56	5	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:43.973	2026-06-02 11:15:48.181
b639f118-0159-4d5f-af3b-ea5b18dd018a	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	3d46469d-47ae-4095-85d9-3b8773bb12f0	6	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:43.981	2026-06-02 11:15:48.181
90580adb-7192-42a9-94fd-a1b6e703e353	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	9fa7fe3d-26c4-4baa-91d8-10a6c6411698	7	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.01	2026-06-02 11:15:48.181
de4f2335-f73e-498e-b3bf-ab4aa22a3241	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	b76c02b5-7b22-4cc8-ae85-2615ea01f766	8	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.044	2026-06-02 11:15:48.181
ce007a6b-32bc-42ff-bd11-18e9b25bf8e4	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	4568bee7-d107-41b1-8795-63757139f47d	9	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.078	2026-06-02 11:15:48.181
70948f8e-f8e1-4310-85d7-c30540c149a4	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	d9496bce-4335-4a2c-a950-c6613dae1c41	10	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.095	2026-06-02 11:15:48.181
1fab2b63-f325-46a2-9eeb-0dfcbb212b45	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	206cd43a-488d-4ddd-9ab5-970312f40dc2	11	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.111	2026-06-02 11:15:48.181
6f25715f-adbb-475c-aa15-ce11dddd4c2d	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	028e5745-b80b-4934-b2e9-822e38716365	12	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.121	2026-06-02 11:15:48.181
a5eedb62-15cd-4052-ba2c-ebc7711fde0b	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	3e69a5bf-4ae2-4a62-b0db-79cf581fca20	13	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.129	2026-06-02 11:15:48.181
a97e0f8e-d5fa-4a38-bc24-3f1618899ce7	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	d3468927-fcfa-42bf-83af-9f4db6f89f09	14	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.145	2026-06-02 11:15:48.181
ba41a678-7753-4fe8-a66f-c70d3cdc0f99	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	f7afafc9-7aca-499b-a0f7-259a9281a683	15	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.162	2026-06-02 11:15:48.181
5e5544a9-2d9a-4ef1-a7fb-e635a77606ce	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	f827dbb5-aaae-402d-bbf0-d79389d780c7	16	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.184	2026-06-02 11:15:48.181
d1ce6c9e-1036-4e06-ab9b-cf20fe2b0bd7	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	19b4c718-38df-42b1-8abc-aaf7dfa8d57f	17	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.206	2026-06-02 11:15:48.181
ed956e19-23c2-4968-9e7f-cbfb06d2e105	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	a8ba6643-a896-46ce-9e7a-59b838b09d28	18	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.228	2026-06-02 11:15:48.181
13cad55b-71e9-46e7-893e-203ee29eb6fa	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	1ad12fa6-c425-4e5f-b37b-2aea5fff5932	19	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.25	2026-06-02 11:15:48.181
8c4a28ef-5d80-4213-8da7-8c2b1bc53b9d	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	3c9064d4-8485-4db6-ba01-56ff3361be65	20	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.274	2026-06-02 11:15:48.181
d8d8448c-36a6-4b7a-af66-fb7d837f69d6	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	d520bafc-b2d4-4134-b6cc-02b723a2b481	21	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.295	2026-06-02 11:15:48.181
4e8c69dc-77df-4178-ba1c-5036bff6d171	63e94792-be0c-4a3f-b5d3-67a1d66c82a0	86446010-358b-46c2-bc24-35164ff40dcf	22	2026-07-01 00:00:00	2026-06-02 00:00:00	2026-06-02 11:15:44.328	2026-06-02 11:15:48.181
ba8f5b3c-4dad-4648-9198-359d53cad7e6	171c9c8d-b7f6-4831-bc9a-1e33ef451497	7ea02a8f-54a9-421c-965b-bb4b97407fee	23	2026-07-01 00:00:23	\N	2026-06-02 11:15:48.271	2026-06-02 11:15:48.271
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teams (id, name, status, created_at, updated_at, city, logo_url, short_name, stadium_id, coach_name) FROM stdin;
4cd2deac-6a9f-443e-8b5b-4c67b31d10b7	MerryLand Quy Nhơn Bình Định	ACTIVE	2026-06-02 11:15:15.76	2026-06-02 11:15:15.76	Quy Nhơn	\N	QNBD	22f1bd88-c028-43f8-930d-986b8543d5ed	\N
d41cdb24-5257-4d1c-96fc-20140a2314ed	Quảng Nam FC	ACTIVE	2026-06-02 11:15:15.771	2026-06-02 11:15:15.771	Tam Kỳ	\N	QN	0c6e0bdc-cdb0-4208-be76-c10e0349f123	\N
83988147-bd67-49d5-81d3-0acb83dbc90c	Hồng Lĩnh Hà Tĩnh	ACTIVE	2026-06-02 11:15:15.781	2026-06-02 11:15:15.781	Hà Tĩnh	\N	HLHT	ab1bf38a-6c67-4852-9a93-9e98bc3416e9	\N
c2373827-86a5-49de-8e7c-aecfc5e3a7a4	SHB Đà Nẵng	ACTIVE	2026-06-02 11:15:15.792	2026-06-02 11:15:15.792	Đà Nẵng	\N	ĐN	804a089e-bab7-4b13-b25f-f42c6d21954a	\N
bbaf22f6-6fd6-4198-a731-2293dff5361f	Quảng Ninh FC	ACTIVE	2026-06-02 11:15:40.529	2026-06-02 11:15:51.136	Quảng Ninh	/promo_candidates/Quảng Ninh FC.png	QNINH	1347ef6d-b633-4460-988a-db0d0e58e186	Nguyễn Văn Đàn
3abf3147-a30b-45a7-801d-0d494314736f	Sanna Khánh Hòa FC	ACTIVE	2026-06-02 11:15:40.766	2026-06-02 11:15:51.194	Khánh Hòa	/promo_candidates/Sanna Khánh Hòa FC.png	SKH	d2b67ed7-948f-466e-afc9-8d148ec45cdf	Trần Trọng Bình
c4488d60-4eb1-49af-b503-1bce07a2548e	Thanh Niên TP Hồ Chí Minh FC	ACTIVE	2026-06-02 11:15:41.244	2026-06-02 11:15:51.251	TP. Hồ Chí Minh	/promo_candidates/Thanh Niên TP Hồ Chí Minh FC.png	TNHCM	e8098118-bcb9-4905-8b88-4452a6d843fc	Lương Trung Tuấn
3979babb-d543-4433-92e8-e2fc59ea6ae6	Trường Tươi Đồng Nai	ACTIVE	2026-06-02 11:15:41.983	2026-06-02 11:15:51.307	Đồng Nai	/promo_candidates/Trường Tươi Đồng Nai.png	TTDN	09a7bb01-e75d-4581-8da7-4b0442bf2a60	Nguyễn Việt Thắng
171c9c8d-b7f6-4831-bc9a-1e33ef451497	Trẻ PVF CAND	ACTIVE	2026-06-02 11:15:42.513	2026-06-02 11:15:51.362	Hưng Yên	/promo_candidates/Trẻ PVF CAND.png	PVF	fd0e9812-028b-499e-b7f1-d7cc8991273a	Nguyễn Duy Đông
fbdb44fb-0f94-4e41-bde2-21ef615f6cad	Xuân Thiện Phú Thọ FC	ACTIVE	2026-06-02 11:15:43.098	2026-06-02 11:15:51.417	Phú Thọ	/promo_candidates/Xuân Thiện Phú Thọ FC.png	PT	fb411a6f-f820-4ae7-9af2-3ecfae59ab15	Lê Quốc Vượng
7ac6674c-a0a6-444e-854b-65bc7a85772d	Đại học Văn Hiến FC	ACTIVE	2026-06-02 11:15:43.579	2026-06-02 11:15:51.473	TP. Hồ Chí Minh	/promo_candidates/Đại học Văn Hiến FC.png	VHU	a01d605b-1706-46bf-a8f5-6d60675dc9d6	Nguyễn Đình Hưng
63e94792-be0c-4a3f-b5d3-67a1d66c82a0	Đồng Tháp FC	ACTIVE	2026-06-02 11:15:43.862	2026-06-02 11:15:51.541	Đồng Tháp	/promo_candidates/Đồng Tháp FC.png	DT	205769dc-f6e9-41b3-b54d-3b92715341c6	Ngô Quang Sang
bdeeccbd-ea54-46ee-9ffb-a9b93005697b	Thép Xanh Nam Định	ACTIVE	2026-06-02 11:15:15.639	2026-06-02 11:15:38.065	Nam Định	\N	TXND	d34f8d8f-99ae-4260-bf5d-910f24be3336	Vũ Hồng Việt
9e3f1dd9-6002-4e6c-bf61-687805f8f16c	Hà Nội FC	ACTIVE	2026-06-02 11:15:15.653	2026-06-02 11:15:38.262	Hà Nội	\N	HN	e0922349-6ef9-4456-9acf-05ad869d581c	Harry Kewell
9f54615c-03ae-464b-adb4-50b9c1677d41	Công An Hà Nội	ACTIVE	2026-06-02 11:15:15.663	2026-06-02 11:15:38.349	Hà Nội	\N	CAHN	e0922349-6ef9-4456-9acf-05ad869d581c	Alexandre Polking
5a0b9311-e70c-4525-9b1b-48c1cdf15d33	Thể Công-Viettel	ACTIVE	2026-06-02 11:15:15.674	2026-06-02 11:15:38.432	Hà Nội	\N	TCVT	91e98957-387a-4441-99ac-616cdc690608	Velizar Popov
aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4	Đông Á Thanh Hóa	ACTIVE	2026-06-02 11:15:15.707	2026-06-02 11:15:38.58	Thanh Hóa	\N	DATH	c1649f16-5f82-4079-822e-58d09dfba4df	Nguyễn Anh Đức
c11ee3ba-bcce-424a-994e-6477045af536	LPBank Hoàng Anh Gia Lai	ACTIVE	2026-06-02 11:15:15.719	2026-06-02 11:15:38.775	Pleiku	\N	HAGL	e8098118-bcb9-4905-8b88-4452a6d843fc	Lê Quang Trãi
df825052-1f68-4f44-857f-c2de07315fd2	Hải Phòng FC	ACTIVE	2026-06-02 11:15:15.696	2026-06-02 11:15:38.917	Hải Phòng	\N	HP	c7420876-4e9e-4ecb-9dbf-ebc1ebd8963d	Đặng Văn Thành
fba219b9-fc2a-4b8a-bf1b-e5a00853ca23	Becamex Bình Dương	ACTIVE	2026-06-02 11:15:15.685	2026-06-02 11:15:39.074	Thủ Dầu Một	\N	BBD	1a93e748-8884-4c17-be23-43980ffe7608	Hứa Hiền Vinh
3424bc38-f674-4378-a88c-1c9ec5b9a77c	TP.HCM FC	ACTIVE	2026-06-02 11:15:15.739	2026-06-02 11:15:39.137	TP. Hồ Chí Minh	\N	HCM	c81e244b-13f9-423c-aabb-b06cea5aeccb	Phùng Thanh Phương
655df04f-5508-45f3-8032-fd657a753360	Sông Lam Nghệ An	ACTIVE	2026-06-02 11:15:15.749	2026-06-02 11:15:39.186	Vinh	\N	SLNA	8178046b-f654-4344-9434-e4b9ec71fd1b	Văn Sỹ Sơn
b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63	Bắc Ninh FC	ACTIVE	2026-06-02 11:15:39.492	2026-06-02 11:15:50.973	Bắc Ninh	/promo_candidates/Bắc Ninh FC.svg	BN	968ff955-98cf-4f13-87c2-72b02ee140e6	Paulo Foiani
28a116e7-7f26-4a9e-95b0-8ada489dc4c6	Long An FC	ACTIVE	2026-06-02 11:15:40.024	2026-06-02 11:15:51.032	Tây Ninh	/promo_candidates/Long An FC.png	LA	dd464e52-0bd3-4b1b-94c9-401ceb5dff7d	Trịnh Văn Hậu
812bcf01-a79f-4d7c-971a-68d2f79dedbf	Quy Nhơn United	ACTIVE	2026-06-02 11:15:40.264	2026-06-02 11:15:51.088	Gia Lai	/promo_candidates/Quy Nhơn United.png	QNU	22f1bd88-c028-43f8-930d-986b8543d5ed	Trịnh Duy Quang
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, role, created_at, updated_at, email_verified, avatar_url, google_id, name, facebook_id, role_id, managed_team_id) FROM stdin;
f514705f-4213-4507-8a48-16db52cddec9	manager.merryland.quy.nhon.binh.dinh@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	TEAM_MANAGER	2026-06-02 11:15:27.693	2026-06-02 11:15:27.693	t	\N	\N	Manager QNBD	\N	a1ba5111-ce13-4365-80a7-354001c79305	4cd2deac-6a9f-443e-8b5b-4c67b31d10b7
fd494442-817b-4b95-b3eb-9575eb2dd167	manager.quang.nam.fc@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	TEAM_MANAGER	2026-06-02 11:15:27.712	2026-06-02 11:15:27.712	t	\N	\N	Manager QN	\N	a1ba5111-ce13-4365-80a7-354001c79305	d41cdb24-5257-4d1c-96fc-20140a2314ed
650c9c30-95ba-4528-807b-2c9213d16831	manager.hong.linh.ha.tinh@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	TEAM_MANAGER	2026-06-02 11:15:27.737	2026-06-02 11:15:27.737	t	\N	\N	Manager HLHT	\N	a1ba5111-ce13-4365-80a7-354001c79305	83988147-bd67-49d5-81d3-0acb83dbc90c
8485183b-0911-46fc-9a13-32672eb606e8	manager.shb.da.nang@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	TEAM_MANAGER	2026-06-02 11:15:27.766	2026-06-02 11:15:27.766	t	\N	\N	Manager ĐN	\N	a1ba5111-ce13-4365-80a7-354001c79305	c2373827-86a5-49de-8e7c-aecfc5e3a7a4
041100d4-eb42-4b94-86f4-3a0260d867b0	admin@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	ADMIN	2026-06-02 11:15:34.126	2026-06-02 11:15:34.126	t	\N	\N	Admin Demo	\N	eec657f6-c35f-45ca-9d82-9a5ed436256d	\N
d6377e9c-6c27-4547-ba6f-e4824eb167ec	referee.tran.minh.khang@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	REFEREE	2026-06-02 11:15:34.165	2026-06-02 11:15:34.165	t	\N	\N	Trần Minh Khang	\N	4ccdf53a-eb21-45ba-96c7-3c7b3b9ef9b7	\N
c03033d6-a80d-4d0f-90a6-a33b8b188f01	referee.le.hoang.duy@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	REFEREE	2026-06-02 11:15:34.214	2026-06-02 11:15:34.214	t	\N	\N	Lê Hoàng Duy	\N	4ccdf53a-eb21-45ba-96c7-3c7b3b9ef9b7	\N
52599869-9e93-4d0c-a42e-c375f5dca5ca	referee.pham.duc.thanh@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	REFEREE	2026-06-02 11:15:34.254	2026-06-02 11:15:34.254	t	\N	\N	Phạm Đức Thành	\N	4ccdf53a-eb21-45ba-96c7-3c7b3b9ef9b7	\N
876db68b-e55b-40d4-a845-d9e23af428fa	referee.michael.andersson@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	REFEREE	2026-06-02 11:15:34.275	2026-06-02 11:15:34.275	t	\N	\N	Michael Andersson	\N	4ccdf53a-eb21-45ba-96c7-3c7b3b9ef9b7	\N
54579a6b-c655-40b2-b6c5-d930f27b2977	referee.carlos.mendes@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	REFEREE	2026-06-02 11:15:34.303	2026-06-02 11:15:34.303	t	\N	\N	Carlos Mendes	\N	4ccdf53a-eb21-45ba-96c7-3c7b3b9ef9b7	\N
2f742a02-e663-45ca-8fc1-07bfd0da9741	supervisor.do.quoc.hung@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	SUPERVISOR	2026-06-02 11:15:34.322	2026-06-02 11:15:34.322	t	\N	\N	Đỗ Quốc Hưng	\N	10f4a5d7-9395-4491-b117-13c5514506bd	\N
80acbecb-f13b-4ff7-9ee7-91f3b2b78535	supervisor.vo.thanh.luan@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	SUPERVISOR	2026-06-02 11:15:34.344	2026-06-02 11:15:34.344	t	\N	\N	Võ Thành Luân	\N	10f4a5d7-9395-4491-b117-13c5514506bd	\N
cbc5cb25-ec08-4949-94df-18a370602e68	supervisor.bui.anh.tuan@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	SUPERVISOR	2026-06-02 11:15:34.383	2026-06-02 11:15:34.383	t	\N	\N	Bùi Anh Tuấn	\N	10f4a5d7-9395-4491-b117-13c5514506bd	\N
634828ca-fe7c-4621-9c6c-fe65a1ec8cce	supervisor.huynh.gia.bao@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	SUPERVISOR	2026-06-02 11:15:34.403	2026-06-02 11:15:34.403	t	\N	\N	Huỳnh Gia Bảo	\N	10f4a5d7-9395-4491-b117-13c5514506bd	\N
e8b9b465-fa70-4179-b849-1acf73f8dfd9	supervisor.nguyen.huu.phuoc@demo.local	$2b$10$RcQlaF2bQD4s1eBKLFR5DOwSYoE4Zhybz2za.UqIHIqNzGCsQE4/i	SUPERVISOR	2026-06-02 11:15:34.439	2026-06-02 11:15:34.439	t	\N	\N	Nguyễn Hữu Phước	\N	10f4a5d7-9395-4491-b117-13c5514506bd	\N
c503a297-efc7-479a-b4c9-9ca5774a54f0	manager.thep.xanh.nam.dinh@demo.local	$2b$10$u0f4ktosBofsfUhvMFVnf.2VFm0oxkHpZvaJy0/Pd14c0RouFW3oe	TEAM_MANAGER	2026-06-02 11:15:27.519	2026-06-02 11:15:38.195	t	\N	\N	Manager TXND	\N	a1ba5111-ce13-4365-80a7-354001c79305	bdeeccbd-ea54-46ee-9ffb-a9b93005697b
19a956fd-ed26-464f-9a01-c7d4f592ec63	manager.ha.noi.fc@demo.local	$2b$10$u0f4ktosBofsfUhvMFVnf.2VFm0oxkHpZvaJy0/Pd14c0RouFW3oe	TEAM_MANAGER	2026-06-02 11:15:27.537	2026-06-02 11:15:38.318	t	\N	\N	Manager HN	\N	a1ba5111-ce13-4365-80a7-354001c79305	9e3f1dd9-6002-4e6c-bf61-687805f8f16c
0b80d838-d87e-4724-8109-2875070c84b2	manager.cong.an.ha.noi@demo.local	$2b$10$u0f4ktosBofsfUhvMFVnf.2VFm0oxkHpZvaJy0/Pd14c0RouFW3oe	TEAM_MANAGER	2026-06-02 11:15:27.559	2026-06-02 11:15:38.412	t	\N	\N	Manager CAHN	\N	a1ba5111-ce13-4365-80a7-354001c79305	9f54615c-03ae-464b-adb4-50b9c1677d41
4e40a754-cbc7-4d3c-a3b0-1a769d7240b6	manager.the.cong.viettel@demo.local	$2b$10$u0f4ktosBofsfUhvMFVnf.2VFm0oxkHpZvaJy0/Pd14c0RouFW3oe	TEAM_MANAGER	2026-06-02 11:15:27.582	2026-06-02 11:15:38.549	t	\N	\N	Manager TCVT	\N	a1ba5111-ce13-4365-80a7-354001c79305	5a0b9311-e70c-4525-9b1b-48c1cdf15d33
6b278b18-4371-48ed-81d2-67eecedae0ab	manager.dong.a.thanh.hoa@demo.local	$2b$10$u0f4ktosBofsfUhvMFVnf.2VFm0oxkHpZvaJy0/Pd14c0RouFW3oe	TEAM_MANAGER	2026-06-02 11:15:27.658	2026-06-02 11:15:38.705	t	\N	\N	Manager DATH	\N	a1ba5111-ce13-4365-80a7-354001c79305	aa5b6797-73ad-4b6c-b0d1-b8df2a7b3bc4
1fbe0a37-0d6b-4b66-a9d4-a66f81569fe7	manager.lpbank.hoang.anh.gia.lai@demo.local	$2b$10$u0f4ktosBofsfUhvMFVnf.2VFm0oxkHpZvaJy0/Pd14c0RouFW3oe	TEAM_MANAGER	2026-06-02 11:15:27.672	2026-06-02 11:15:38.87	t	\N	\N	Manager HAGL	\N	a1ba5111-ce13-4365-80a7-354001c79305	c11ee3ba-bcce-424a-994e-6477045af536
105861c6-5d52-4f9e-9c0d-a1f3cbba19c0	manager.hai.phong.fc@demo.local	$2b$10$u0f4ktosBofsfUhvMFVnf.2VFm0oxkHpZvaJy0/Pd14c0RouFW3oe	TEAM_MANAGER	2026-06-02 11:15:27.635	2026-06-02 11:15:39.034	t	\N	\N	Manager HP	\N	a1ba5111-ce13-4365-80a7-354001c79305	df825052-1f68-4f44-857f-c2de07315fd2
b7d25a35-d644-49c5-85fc-b7e532aacc0f	manager.becamex.binh.duong@demo.local	$2b$10$u0f4ktosBofsfUhvMFVnf.2VFm0oxkHpZvaJy0/Pd14c0RouFW3oe	TEAM_MANAGER	2026-06-02 11:15:27.612	2026-06-02 11:15:39.126	t	\N	\N	Manager BBD	\N	a1ba5111-ce13-4365-80a7-354001c79305	fba219b9-fc2a-4b8a-bf1b-e5a00853ca23
108783ff-b6b0-47e0-bcc8-f034971caddb	manager.tp.hcm.fc@demo.local	$2b$10$u0f4ktosBofsfUhvMFVnf.2VFm0oxkHpZvaJy0/Pd14c0RouFW3oe	TEAM_MANAGER	2026-06-02 11:15:27.679	2026-06-02 11:15:39.173	t	\N	\N	Manager HCM	\N	a1ba5111-ce13-4365-80a7-354001c79305	3424bc38-f674-4378-a88c-1c9ec5b9a77c
ab721b2b-87f3-4eb5-9af7-2cfa6ad59031	manager.song.lam.nghe.an@demo.local	$2b$10$u0f4ktosBofsfUhvMFVnf.2VFm0oxkHpZvaJy0/Pd14c0RouFW3oe	TEAM_MANAGER	2026-06-02 11:15:27.685	2026-06-02 11:15:39.221	t	\N	\N	Manager SLNA	\N	a1ba5111-ce13-4365-80a7-354001c79305	655df04f-5508-45f3-8032-fd657a753360
796fb41e-1ae7-4cd8-b29e-caecd680e183	manager.bac.ninh.fc@demo.local	$2b$10$H5JvZF0bb4gly1C10s7cU.EF4T/wHLTb.ZwLFYcglKYnpJ24Mr9e2	TEAM_MANAGER	2026-06-02 11:15:39.988	2026-06-02 11:15:50.993	t	\N	\N	Manager Bắc Ninh FC	\N	a1ba5111-ce13-4365-80a7-354001c79305	b7b64ecf-a0f5-45a9-90ce-ff66cc0f5a63
2256d048-d0ac-4c7a-865a-15bbd74ad351	manager.long.an.fc@demo.local	$2b$10$H5JvZF0bb4gly1C10s7cU.EF4T/wHLTb.ZwLFYcglKYnpJ24Mr9e2	TEAM_MANAGER	2026-06-02 11:15:40.252	2026-06-02 11:15:51.043	t	\N	\N	Manager Long An FC	\N	a1ba5111-ce13-4365-80a7-354001c79305	28a116e7-7f26-4a9e-95b0-8ada489dc4c6
ea06c527-a2f7-4bfc-bdf0-94fbb4596ea8	manager.quy.nhon.united@demo.local	$2b$10$H5JvZF0bb4gly1C10s7cU.EF4T/wHLTb.ZwLFYcglKYnpJ24Mr9e2	TEAM_MANAGER	2026-06-02 11:15:40.509	2026-06-02 11:15:51.1	t	\N	\N	Manager Quy Nhơn United	\N	a1ba5111-ce13-4365-80a7-354001c79305	812bcf01-a79f-4d7c-971a-68d2f79dedbf
c15d34d8-4c53-477a-ac25-3c09a5b57bf4	manager.quang.ninh.fc@demo.local	$2b$10$H5JvZF0bb4gly1C10s7cU.EF4T/wHLTb.ZwLFYcglKYnpJ24Mr9e2	TEAM_MANAGER	2026-06-02 11:15:40.74	2026-06-02 11:15:51.148	t	\N	\N	Manager Quảng Ninh FC	\N	a1ba5111-ce13-4365-80a7-354001c79305	bbaf22f6-6fd6-4198-a731-2293dff5361f
fbb44b5b-5266-45e6-ac73-856d68827a3a	manager.sanna.khanh.hoa.fc@demo.local	$2b$10$H5JvZF0bb4gly1C10s7cU.EF4T/wHLTb.ZwLFYcglKYnpJ24Mr9e2	TEAM_MANAGER	2026-06-02 11:15:41.198	2026-06-02 11:15:51.205	t	\N	\N	Manager Sanna Khánh Hòa FC	\N	a1ba5111-ce13-4365-80a7-354001c79305	3abf3147-a30b-45a7-801d-0d494314736f
f766efe0-5273-497c-8ad5-d52d5aa577e8	manager.truong.tuoi.dong.nai@demo.local	$2b$10$H5JvZF0bb4gly1C10s7cU.EF4T/wHLTb.ZwLFYcglKYnpJ24Mr9e2	TEAM_MANAGER	2026-06-02 11:15:42.459	2026-06-02 11:15:51.318	t	\N	\N	Manager Trường Tươi Đồng Nai	\N	a1ba5111-ce13-4365-80a7-354001c79305	3979babb-d543-4433-92e8-e2fc59ea6ae6
790f0156-6b4d-4418-bde9-fc2b2f62bde6	manager.tre.pvf.cand@demo.local	$2b$10$H5JvZF0bb4gly1C10s7cU.EF4T/wHLTb.ZwLFYcglKYnpJ24Mr9e2	TEAM_MANAGER	2026-06-02 11:15:43.055	2026-06-02 11:15:51.373	t	\N	\N	Manager Trẻ PVF CAND	\N	a1ba5111-ce13-4365-80a7-354001c79305	171c9c8d-b7f6-4831-bc9a-1e33ef451497
37b8e0e7-f4e5-4062-b9b3-45d9801cf614	manager.xuan.thien.phu.tho.fc@demo.local	$2b$10$H5JvZF0bb4gly1C10s7cU.EF4T/wHLTb.ZwLFYcglKYnpJ24Mr9e2	TEAM_MANAGER	2026-06-02 11:15:43.548	2026-06-02 11:15:51.428	t	\N	\N	Manager Xuân Thiện Phú Thọ FC	\N	a1ba5111-ce13-4365-80a7-354001c79305	fbdb44fb-0f94-4e41-bde2-21ef615f6cad
588a6cd1-0027-48bd-805b-8f51919f85da	manager.dai.hoc.van.hien.fc@demo.local	$2b$10$H5JvZF0bb4gly1C10s7cU.EF4T/wHLTb.ZwLFYcglKYnpJ24Mr9e2	TEAM_MANAGER	2026-06-02 11:15:43.833	2026-06-02 11:15:51.485	t	\N	\N	Manager Đại học Văn Hiến FC	\N	a1ba5111-ce13-4365-80a7-354001c79305	7ac6674c-a0a6-444e-854b-65bc7a85772d
aa4aaa00-b1ad-4665-9ebb-1386905ecfee	manager.dong.thap.fc@demo.local	$2b$10$H5JvZF0bb4gly1C10s7cU.EF4T/wHLTb.ZwLFYcglKYnpJ24Mr9e2	TEAM_MANAGER	2026-06-02 11:15:44.36	2026-06-02 11:15:51.552	t	\N	\N	Manager Đồng Tháp FC	\N	a1ba5111-ce13-4365-80a7-354001c79305	63e94792-be0c-4a3f-b5d3-67a1d66c82a0
7d621cc7-b8f4-485b-b3a1-53cc5ca7093f	manager.thanh.nien.tp.ho.chi.minh.fc@demo.local	$2b$10$H5JvZF0bb4gly1C10s7cU.EF4T/wHLTb.ZwLFYcglKYnpJ24Mr9e2	TEAM_MANAGER	2026-06-02 11:15:41.935	2026-06-02 11:15:51.262	t	\N	\N	Manager Thanh Niên TP Hồ Chí Minh FC	\N	a1ba5111-ce13-4365-80a7-354001c79305	c4488d60-4eb1-49af-b503-1bce07a2548e
0d8e36bf-d7ae-4f1b-9531-0549ce40a837	public@demo.local	$2b$10$/H9KaqG/iQpxDXeO0uEy4OipbXcORR7fp95K4ZBLT5wOuCbVxJQma	PUBLIC	2026-06-02 11:19:45.573	2026-06-02 11:19:45.573	t	\N	\N	Public User	\N	\N	\N
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: discipline_reports discipline_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discipline_reports
    ADD CONSTRAINT discipline_reports_pkey PRIMARY KEY (id);


--
-- Name: draw_lot_results draw_lot_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.draw_lot_results
    ADD CONSTRAINT draw_lot_results_pkey PRIMARY KEY (id);


--
-- Name: manager_player_requests manager_player_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_player_requests
    ADD CONSTRAINT manager_player_requests_pkey PRIMARY KEY (id);


--
-- Name: manager_stadium_requests manager_stadium_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_stadium_requests
    ADD CONSTRAINT manager_stadium_requests_pkey PRIMARY KEY (id);


--
-- Name: match_events match_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_events
    ADD CONSTRAINT match_events_pkey PRIMARY KEY (id);


--
-- Name: match_lineup_players match_lineup_players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_lineup_players
    ADD CONSTRAINT match_lineup_players_pkey PRIMARY KEY (id);


--
-- Name: match_official_assignments match_official_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_official_assignments
    ADD CONSTRAINT match_official_assignments_pkey PRIMARY KEY (id);


--
-- Name: match_reports match_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_reports
    ADD CONSTRAINT match_reports_pkey PRIMARY KEY (id);


--
-- Name: match_team_registrations match_team_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_team_registrations
    ADD CONSTRAINT match_team_registrations_pkey PRIMARY KEY (id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: officials officials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.officials
    ADD CONSTRAINT officials_pkey PRIMARY KEY (id);


--
-- Name: otp_codes otp_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes
    ADD CONSTRAINT otp_codes_pkey PRIMARY KEY (id);


--
-- Name: player_suspensions player_suspensions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_suspensions
    ADD CONSTRAINT player_suspensions_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: promotion_candidates promotion_candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_candidates
    ADD CONSTRAINT promotion_candidates_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: regulations regulations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regulations
    ADD CONSTRAINT regulations_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: season_teams season_teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.season_teams
    ADD CONSTRAINT season_teams_pkey PRIMARY KEY (id);


--
-- Name: seasons seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_pkey PRIMARY KEY (id);


--
-- Name: stadiums stadiums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stadiums
    ADD CONSTRAINT stadiums_pkey PRIMARY KEY (id);


--
-- Name: standings standings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standings
    ADD CONSTRAINT standings_pkey PRIMARY KEY (id);


--
-- Name: team_invitations team_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_pkey PRIMARY KEY (id);


--
-- Name: team_manager_assignments team_manager_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_manager_assignments
    ADD CONSTRAINT team_manager_assignments_pkey PRIMARY KEY (id);


--
-- Name: team_manager_requests team_manager_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_manager_requests
    ADD CONSTRAINT team_manager_requests_pkey PRIMARY KEY (id);


--
-- Name: team_players team_players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_players
    ADD CONSTRAINT team_players_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at);


--
-- Name: audit_logs_entity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_entity_idx ON public.audit_logs USING btree (entity);


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- Name: discipline_reports_match_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX discipline_reports_match_id_key ON public.discipline_reports USING btree (match_id);


--
-- Name: discipline_reports_supervisor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX discipline_reports_supervisor_id_idx ON public.discipline_reports USING btree (supervisor_id);


--
-- Name: draw_lot_results_season_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX draw_lot_results_season_id_idx ON public.draw_lot_results USING btree (season_id);


--
-- Name: draw_lot_results_season_id_team_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX draw_lot_results_season_id_team_id_key ON public.draw_lot_results USING btree (season_id, team_id);


--
-- Name: manager_player_requests_manager_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX manager_player_requests_manager_id_idx ON public.manager_player_requests USING btree (manager_id);


--
-- Name: manager_player_requests_one_pending_per_player_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX manager_player_requests_one_pending_per_player_idx ON public.manager_player_requests USING btree (player_id) WHERE ((status = 'PENDING'::public."ManagerRequestStatus") AND (request_type = ANY (ARRAY['UPDATE_PLAYER'::public."ManagerPlayerRequestType", 'REMOVE_FROM_TEAM'::public."ManagerPlayerRequestType"])) AND (player_id IS NOT NULL));


--
-- Name: manager_player_requests_player_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX manager_player_requests_player_id_idx ON public.manager_player_requests USING btree (player_id);


--
-- Name: manager_player_requests_request_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX manager_player_requests_request_type_idx ON public.manager_player_requests USING btree (request_type);


--
-- Name: manager_player_requests_reviewed_by_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX manager_player_requests_reviewed_by_id_idx ON public.manager_player_requests USING btree (reviewed_by_id);


--
-- Name: manager_player_requests_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX manager_player_requests_status_idx ON public.manager_player_requests USING btree (status);


--
-- Name: manager_player_requests_team_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX manager_player_requests_team_id_idx ON public.manager_player_requests USING btree (team_id);


--
-- Name: manager_stadium_requests_manager_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX manager_stadium_requests_manager_id_idx ON public.manager_stadium_requests USING btree (manager_id);


--
-- Name: manager_stadium_requests_one_pending_per_team_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX manager_stadium_requests_one_pending_per_team_idx ON public.manager_stadium_requests USING btree (team_id) WHERE (status = 'PENDING'::public."ManagerRequestStatus");


--
-- Name: manager_stadium_requests_request_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX manager_stadium_requests_request_type_idx ON public.manager_stadium_requests USING btree (request_type);


--
-- Name: manager_stadium_requests_reviewed_by_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX manager_stadium_requests_reviewed_by_id_idx ON public.manager_stadium_requests USING btree (reviewed_by_id);


--
-- Name: manager_stadium_requests_stadium_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX manager_stadium_requests_stadium_id_idx ON public.manager_stadium_requests USING btree (stadium_id);


--
-- Name: manager_stadium_requests_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX manager_stadium_requests_status_idx ON public.manager_stadium_requests USING btree (status);


--
-- Name: manager_stadium_requests_team_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX manager_stadium_requests_team_id_idx ON public.manager_stadium_requests USING btree (team_id);


--
-- Name: match_events_match_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_events_match_id_idx ON public.match_events USING btree (match_id);


--
-- Name: match_events_match_id_source_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_events_match_id_source_idx ON public.match_events USING btree (match_id, source);


--
-- Name: match_events_player_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_events_player_id_idx ON public.match_events USING btree (player_id);


--
-- Name: match_events_team_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_events_team_id_idx ON public.match_events USING btree (team_id);


--
-- Name: match_events_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_events_type_idx ON public.match_events USING btree (type);


--
-- Name: match_lineup_players_player_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_lineup_players_player_id_idx ON public.match_lineup_players USING btree (player_id);


--
-- Name: match_lineup_players_registration_id_player_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX match_lineup_players_registration_id_player_id_key ON public.match_lineup_players USING btree (registration_id, player_id);


--
-- Name: match_lineup_players_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_lineup_players_role_idx ON public.match_lineup_players USING btree (role);


--
-- Name: match_official_assignments_match_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_official_assignments_match_id_idx ON public.match_official_assignments USING btree (match_id);


--
-- Name: match_official_assignments_match_id_official_id_role_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX match_official_assignments_match_id_official_id_role_key ON public.match_official_assignments USING btree (match_id, official_id, role);


--
-- Name: match_official_assignments_official_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_official_assignments_official_id_idx ON public.match_official_assignments USING btree (official_id);


--
-- Name: match_official_assignments_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_official_assignments_role_idx ON public.match_official_assignments USING btree (role);


--
-- Name: match_reports_best_player_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_reports_best_player_id_idx ON public.match_reports USING btree (best_player_id);


--
-- Name: match_reports_match_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX match_reports_match_id_key ON public.match_reports USING btree (match_id);


--
-- Name: match_reports_submitted_by_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_reports_submitted_by_user_id_idx ON public.match_reports USING btree (submitted_by_user_id);


--
-- Name: match_team_registrations_match_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_team_registrations_match_id_idx ON public.match_team_registrations USING btree (match_id);


--
-- Name: match_team_registrations_match_id_team_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX match_team_registrations_match_id_team_id_key ON public.match_team_registrations USING btree (match_id, team_id);


--
-- Name: match_team_registrations_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_team_registrations_status_idx ON public.match_team_registrations USING btree (status);


--
-- Name: match_team_registrations_team_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX match_team_registrations_team_id_idx ON public.match_team_registrations USING btree (team_id);


--
-- Name: matches_away_team_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX matches_away_team_id_idx ON public.matches USING btree (away_team_id);


--
-- Name: matches_home_team_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX matches_home_team_id_idx ON public.matches USING btree (home_team_id);


--
-- Name: matches_kickoff_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX matches_kickoff_at_idx ON public.matches USING btree (kickoff_at);


--
-- Name: matches_round_no_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX matches_round_no_idx ON public.matches USING btree (round_no);


--
-- Name: matches_season_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX matches_season_id_idx ON public.matches USING btree (season_id);


--
-- Name: matches_season_id_round_no_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX matches_season_id_round_no_idx ON public.matches USING btree (season_id, round_no);


--
-- Name: matches_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX matches_status_idx ON public.matches USING btree (status);


--
-- Name: notifications_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_created_at_idx ON public.notifications USING btree (created_at);


--
-- Name: notifications_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_type_idx ON public.notifications USING btree (type);


--
-- Name: notifications_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_id_idx ON public.notifications USING btree (user_id);


--
-- Name: officials_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX officials_status_idx ON public.officials USING btree (status);


--
-- Name: otp_codes_code_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX otp_codes_code_type_idx ON public.otp_codes USING btree (code, type);


--
-- Name: otp_codes_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX otp_codes_user_id_idx ON public.otp_codes USING btree (user_id);


--
-- Name: player_suspensions_effective_match_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX player_suspensions_effective_match_id_idx ON public.player_suspensions USING btree (effective_match_id);


--
-- Name: player_suspensions_player_id_source_match_id_effective_matc_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX player_suspensions_player_id_source_match_id_effective_matc_key ON public.player_suspensions USING btree (player_id, source_match_id, effective_match_id, reason);


--
-- Name: player_suspensions_season_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX player_suspensions_season_id_idx ON public.player_suspensions USING btree (season_id);


--
-- Name: player_suspensions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX player_suspensions_status_idx ON public.player_suspensions USING btree (status);


--
-- Name: player_suspensions_team_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX player_suspensions_team_id_idx ON public.player_suspensions USING btree (team_id);


--
-- Name: players_full_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX players_full_name_idx ON public.players USING btree (full_name);


--
-- Name: players_nationality_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX players_nationality_idx ON public.players USING btree (nationality);


--
-- Name: players_player_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX players_player_type_idx ON public.players USING btree (player_type);


--
-- Name: players_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX players_position_idx ON public.players USING btree ("position");


--
-- Name: promotion_candidates_season_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotion_candidates_season_id_idx ON public.promotion_candidates USING btree (season_id);


--
-- Name: promotion_candidates_season_id_rank_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX promotion_candidates_season_id_rank_key ON public.promotion_candidates USING btree (season_id, rank);


--
-- Name: promotion_candidates_season_id_team_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX promotion_candidates_season_id_team_id_key ON public.promotion_candidates USING btree (season_id, team_id);


--
-- Name: promotion_candidates_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotion_candidates_status_idx ON public.promotion_candidates USING btree (status);


--
-- Name: refresh_tokens_token_hash_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX refresh_tokens_token_hash_key ON public.refresh_tokens USING btree (token_hash);


--
-- Name: refresh_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_user_id_idx ON public.refresh_tokens USING btree (user_id);


--
-- Name: regulations_season_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX regulations_season_id_idx ON public.regulations USING btree (season_id);


--
-- Name: regulations_season_id_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX regulations_season_id_key_key ON public.regulations USING btree (season_id, key);


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: season_teams_season_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX season_teams_season_id_idx ON public.season_teams USING btree (season_id);


--
-- Name: season_teams_season_id_team_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX season_teams_season_id_team_id_key ON public.season_teams USING btree (season_id, team_id);


--
-- Name: season_teams_team_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX season_teams_team_id_idx ON public.season_teams USING btree (team_id);


--
-- Name: seasons_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX seasons_name_key ON public.seasons USING btree (name);


--
-- Name: stadiums_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX stadiums_name_key ON public.stadiums USING btree (name);


--
-- Name: standings_season_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX standings_season_id_idx ON public.standings USING btree (season_id);


--
-- Name: standings_season_id_team_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX standings_season_id_team_id_key ON public.standings USING btree (season_id, team_id);


--
-- Name: team_invitations_deadline_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_invitations_deadline_at_idx ON public.team_invitations USING btree (deadline_at);


--
-- Name: team_invitations_season_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_invitations_season_id_idx ON public.team_invitations USING btree (season_id);


--
-- Name: team_invitations_season_id_team_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX team_invitations_season_id_team_id_key ON public.team_invitations USING btree (season_id, team_id);


--
-- Name: team_invitations_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_invitations_status_idx ON public.team_invitations USING btree (status);


--
-- Name: team_invitations_team_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_invitations_team_id_idx ON public.team_invitations USING btree (team_id);


--
-- Name: team_manager_assignments_season_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_manager_assignments_season_id_idx ON public.team_manager_assignments USING btree (season_id);


--
-- Name: team_manager_assignments_team_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_manager_assignments_team_id_idx ON public.team_manager_assignments USING btree (team_id);


--
-- Name: team_manager_assignments_user_id_season_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX team_manager_assignments_user_id_season_id_key ON public.team_manager_assignments USING btree (user_id, season_id);


--
-- Name: team_manager_requests_manager_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_manager_requests_manager_id_idx ON public.team_manager_requests USING btree (manager_id);


--
-- Name: team_manager_requests_one_pending_claim_per_team_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX team_manager_requests_one_pending_claim_per_team_idx ON public.team_manager_requests USING btree (team_id) WHERE ((status = 'PENDING'::public."TeamManagerRequestStatus") AND (request_type = 'CLAIM_EXISTING_TEAM'::public."TeamManagerRequestType") AND (team_id IS NOT NULL));


--
-- Name: team_manager_requests_one_pending_per_manager_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX team_manager_requests_one_pending_per_manager_idx ON public.team_manager_requests USING btree (manager_id) WHERE (status = 'PENDING'::public."TeamManagerRequestStatus");


--
-- Name: team_manager_requests_request_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_manager_requests_request_type_idx ON public.team_manager_requests USING btree (request_type);


--
-- Name: team_manager_requests_reviewed_by_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_manager_requests_reviewed_by_id_idx ON public.team_manager_requests USING btree (reviewed_by_id);


--
-- Name: team_manager_requests_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_manager_requests_status_idx ON public.team_manager_requests USING btree (status);


--
-- Name: team_manager_requests_team_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_manager_requests_team_id_idx ON public.team_manager_requests USING btree (team_id);


--
-- Name: team_players_player_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_players_player_id_idx ON public.team_players USING btree (player_id);


--
-- Name: team_players_team_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_players_team_id_idx ON public.team_players USING btree (team_id);


--
-- Name: team_players_team_id_player_id_joined_at_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX team_players_team_id_player_id_joined_at_key ON public.team_players USING btree (team_id, player_id, joined_at);


--
-- Name: teams_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX teams_name_key ON public.teams USING btree (name);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_facebook_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_facebook_id_key ON public.users USING btree (facebook_id);


--
-- Name: users_google_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_google_id_key ON public.users USING btree (google_id);


--
-- Name: users_managed_team_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_managed_team_id_idx ON public.users USING btree (managed_team_id);


--
-- Name: users_role_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_id_idx ON public.users USING btree (role_id);


--
-- Name: discipline_reports discipline_reports_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discipline_reports
    ADD CONSTRAINT discipline_reports_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: discipline_reports discipline_reports_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discipline_reports
    ADD CONSTRAINT discipline_reports_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.officials(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: draw_lot_results draw_lot_results_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.draw_lot_results
    ADD CONSTRAINT draw_lot_results_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: draw_lot_results draw_lot_results_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.draw_lot_results
    ADD CONSTRAINT draw_lot_results_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: manager_player_requests manager_player_requests_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_player_requests
    ADD CONSTRAINT manager_player_requests_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: manager_player_requests manager_player_requests_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_player_requests
    ADD CONSTRAINT manager_player_requests_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: manager_player_requests manager_player_requests_reviewed_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_player_requests
    ADD CONSTRAINT manager_player_requests_reviewed_by_id_fkey FOREIGN KEY (reviewed_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: manager_player_requests manager_player_requests_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_player_requests
    ADD CONSTRAINT manager_player_requests_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: manager_stadium_requests manager_stadium_requests_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_stadium_requests
    ADD CONSTRAINT manager_stadium_requests_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: manager_stadium_requests manager_stadium_requests_reviewed_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_stadium_requests
    ADD CONSTRAINT manager_stadium_requests_reviewed_by_id_fkey FOREIGN KEY (reviewed_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: manager_stadium_requests manager_stadium_requests_stadium_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_stadium_requests
    ADD CONSTRAINT manager_stadium_requests_stadium_id_fkey FOREIGN KEY (stadium_id) REFERENCES public.stadiums(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: manager_stadium_requests manager_stadium_requests_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_stadium_requests
    ADD CONSTRAINT manager_stadium_requests_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: match_events match_events_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_events
    ADD CONSTRAINT match_events_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: match_events match_events_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_events
    ADD CONSTRAINT match_events_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: match_events match_events_related_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_events
    ADD CONSTRAINT match_events_related_player_id_fkey FOREIGN KEY (related_player_id) REFERENCES public.players(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: match_events match_events_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_events
    ADD CONSTRAINT match_events_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: match_lineup_players match_lineup_players_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_lineup_players
    ADD CONSTRAINT match_lineup_players_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: match_lineup_players match_lineup_players_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_lineup_players
    ADD CONSTRAINT match_lineup_players_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.match_team_registrations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: match_official_assignments match_official_assignments_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_official_assignments
    ADD CONSTRAINT match_official_assignments_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: match_official_assignments match_official_assignments_official_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_official_assignments
    ADD CONSTRAINT match_official_assignments_official_id_fkey FOREIGN KEY (official_id) REFERENCES public.officials(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: match_reports match_reports_best_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_reports
    ADD CONSTRAINT match_reports_best_player_id_fkey FOREIGN KEY (best_player_id) REFERENCES public.players(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: match_reports match_reports_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_reports
    ADD CONSTRAINT match_reports_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: match_team_registrations match_team_registrations_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_team_registrations
    ADD CONSTRAINT match_team_registrations_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: match_team_registrations match_team_registrations_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match_team_registrations
    ADD CONSTRAINT match_team_registrations_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: matches matches_away_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_away_team_id_fkey FOREIGN KEY (away_team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: matches matches_home_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: matches matches_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: matches matches_stadium_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_stadium_id_fkey FOREIGN KEY (stadium_id) REFERENCES public.stadiums(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: otp_codes otp_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes
    ADD CONSTRAINT otp_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: player_suspensions player_suspensions_effective_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_suspensions
    ADD CONSTRAINT player_suspensions_effective_match_id_fkey FOREIGN KEY (effective_match_id) REFERENCES public.matches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: player_suspensions player_suspensions_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_suspensions
    ADD CONSTRAINT player_suspensions_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: player_suspensions player_suspensions_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_suspensions
    ADD CONSTRAINT player_suspensions_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: player_suspensions player_suspensions_source_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_suspensions
    ADD CONSTRAINT player_suspensions_source_match_id_fkey FOREIGN KEY (source_match_id) REFERENCES public.matches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: player_suspensions player_suspensions_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_suspensions
    ADD CONSTRAINT player_suspensions_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_candidates promotion_candidates_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_candidates
    ADD CONSTRAINT promotion_candidates_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_candidates promotion_candidates_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_candidates
    ADD CONSTRAINT promotion_candidates_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: regulations regulations_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regulations
    ADD CONSTRAINT regulations_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: season_teams season_teams_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.season_teams
    ADD CONSTRAINT season_teams_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: season_teams season_teams_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.season_teams
    ADD CONSTRAINT season_teams_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: standings standings_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standings
    ADD CONSTRAINT standings_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: standings standings_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standings
    ADD CONSTRAINT standings_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_invitations team_invitations_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_invitations team_invitations_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_manager_assignments team_manager_assignments_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_manager_assignments
    ADD CONSTRAINT team_manager_assignments_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_manager_assignments team_manager_assignments_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_manager_assignments
    ADD CONSTRAINT team_manager_assignments_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: team_manager_assignments team_manager_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_manager_assignments
    ADD CONSTRAINT team_manager_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_manager_requests team_manager_requests_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_manager_requests
    ADD CONSTRAINT team_manager_requests_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_manager_requests team_manager_requests_reviewed_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_manager_requests
    ADD CONSTRAINT team_manager_requests_reviewed_by_id_fkey FOREIGN KEY (reviewed_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: team_manager_requests team_manager_requests_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_manager_requests
    ADD CONSTRAINT team_manager_requests_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: team_players team_players_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_players
    ADD CONSTRAINT team_players_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_players team_players_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_players
    ADD CONSTRAINT team_players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teams teams_stadium_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_stadium_id_fkey FOREIGN KEY (stadium_id) REFERENCES public.stadiums(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_managed_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_managed_team_id_fkey FOREIGN KEY (managed_team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict O39dCWKBxmsg5t4fRJvuePQ2wqWyYLMfsgAAMNBwdLq5ECYLrw7E3gAVTxdmp71

