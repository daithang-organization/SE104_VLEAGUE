import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Roster API (e2e)', () => {
  let app: INestApplication<App>;

  const fakeTeamId = '00000000-0000-0000-0000-000000000000';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /teams/:teamId/roster', () => {
    it('should return 404 for non-existent team', async () => {
      await request(app.getHttpServer())
        .get(`/teams/${fakeTeamId}/roster`)
        .expect(404);
    });
  });

  describe('POST /teams/:teamId/roster', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/teams/${fakeTeamId}/roster`)
        .send({
          playerId: '00000000-0000-0000-0000-000000000001',
          jerseyNumber: 10,
        })
        .expect(401);
    });
  });

  describe('PATCH /teams/:teamId/roster/:playerId', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .patch(
          `/teams/${fakeTeamId}/roster/00000000-0000-0000-0000-000000000001`,
        )
        .send({ jerseyNumber: 7 })
        .expect(401);
    });
  });

  describe('DELETE /teams/:teamId/roster/:playerId', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .delete(
          `/teams/${fakeTeamId}/roster/00000000-0000-0000-0000-000000000001`,
        )
        .expect(401);
    });
  });
});
