import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Standings API (e2e)', () => {
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

  describe('GET /standings', () => {
    it('should return standings array', async () => {
      const response = await request(app.getHttpServer())
        .get('/standings')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /standings/top-scorers', () => {
    it('should return top scorers array', async () => {
      const response = await request(app.getHttpServer())
        .get('/standings/top-scorers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /standings/card-stats', () => {
    it('should return card stats array', async () => {
      const response = await request(app.getHttpServer())
        .get('/standings/card-stats')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /standings/team-stats', () => {
    it('should return team stats array', async () => {
      const response = await request(app.getHttpServer())
        .get('/standings/team-stats')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('CSV Export', () => {
    it('GET /standings/export/standings should return CSV', async () => {
      const response = await request(app.getHttpServer())
        .get('/standings/export/standings')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain(
        'standings.csv',
      );
    });

    it('GET /standings/export/top-scorers should return CSV', async () => {
      const response = await request(app.getHttpServer())
        .get('/standings/export/top-scorers')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
    });

    it('GET /standings/export/card-stats should return CSV', async () => {
      const response = await request(app.getHttpServer())
        .get('/standings/export/card-stats')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
    });

    it('GET /standings/export/team-stats should return CSV', async () => {
      const response = await request(app.getHttpServer())
        .get('/standings/export/team-stats')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
    });
  });
});
