import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Matches API (e2e)', () => {
  let app: INestApplication<App>;

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

  describe('GET /matches', () => {
    it('should return list of matches', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter matches by seasonId', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches?seasonId=non-existent-season')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /matches/:id', () => {
    it('should return 404 for non-existent match', async () => {
      await request(app.getHttpServer())
        .get('/matches/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('POST /matches/:id/events', () => {
    it('should return 401 when adding event without auth', async () => {
      await request(app.getHttpServer())
        .post('/matches/00000000-0000-0000-0000-000000000000/events')
        .send({
          type: 'GOAL',
          playerId: '00000000-0000-0000-0000-000000000001',
          teamId: '00000000-0000-0000-0000-000000000002',
          minute: 45,
        })
        .expect(401);
    });
  });

  describe('PATCH /matches/:id/status', () => {
    it('should return 401 when updating status without auth', async () => {
      await request(app.getHttpServer())
        .patch('/matches/00000000-0000-0000-0000-000000000000/status')
        .send({ status: 'PUBLISHED' })
        .expect(401);
    });
  });
});
