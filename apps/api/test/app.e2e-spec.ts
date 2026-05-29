import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2eApp } from './create-e2e-app';

describe('Application observability (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('reports readiness at /api/health', async () => {
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.info.database.status).toBe('up');
        expect(res.body.info.memory_heap.status).toBe('up');
      });
  });

  it('reports readiness at /api/health/ready', async () => {
    await request(app.getHttpServer())
      .get('/api/health/ready')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.details.database.status).toBe('up');
      });
  });

  it('reports liveness and echoes request id', async () => {
    await request(app.getHttpServer())
      .get('/api/health/live')
      .set('x-request-id', 'smoke-request-1')
      .expect(200)
      .expect('x-request-id', 'smoke-request-1')
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.uptimeSeconds).toEqual(expect.any(Number));
        expect(res.body.timestamp).toEqual(expect.any(String));
      });
  });

  it('returns request id in standardized error responses', async () => {
    await request(app.getHttpServer())
      .get('/api/not-found-observability-smoke')
      .set('x-request-id', 'smoke-error-1')
      .expect(404)
      .expect('x-request-id', 'smoke-error-1')
      .expect((res) => {
        expect(res.body.code).toBe('NOT_FOUND');
        expect(res.body.requestId).toBe('smoke-error-1');
        expect(res.body.timestamp).toEqual(expect.any(String));
      });
  });
});
