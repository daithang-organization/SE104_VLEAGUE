import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createE2eApp } from './create-e2e-app';

describe('Scheduling API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/schedule', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).get('/api/schedule').expect(401);
    });
  });

  describe('POST /api/schedule/generate', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/schedule/generate')
        .expect(401);
    });
  });

  describe('POST /api/schedule/publish', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/schedule/publish')
        .expect(401);
    });
  });
});
