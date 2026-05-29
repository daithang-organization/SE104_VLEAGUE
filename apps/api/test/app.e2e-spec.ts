import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2eApp } from './create-e2e-app';

type HealthBody = {
  status: string;
  info: {
    database: { status: string };
    memory_heap: { status: string };
  };
};

type ReadinessBody = {
  status: string;
  details: {
    database: { status: string };
  };
};

type LivenessBody = {
  status: string;
  uptimeSeconds: number;
  timestamp: string;
};

type ErrorBody = {
  code: string;
  requestId: string;
  timestamp: string;
};

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
        const body = res.body as HealthBody;
        expect(body.status).toBe('ok');
        expect(body.info.database.status).toBe('up');
        expect(body.info.memory_heap.status).toBe('up');
      });
  });

  it('reports readiness at /api/health/ready', async () => {
    await request(app.getHttpServer())
      .get('/api/health/ready')
      .expect(200)
      .expect((res) => {
        const body = res.body as ReadinessBody;
        expect(body.status).toBe('ok');
        expect(body.details.database.status).toBe('up');
      });
  });

  it('reports liveness and echoes request id', async () => {
    await request(app.getHttpServer())
      .get('/api/health/live')
      .set('x-request-id', 'smoke-request-1')
      .expect(200)
      .expect('x-request-id', 'smoke-request-1')
      .expect((res) => {
        const body = res.body as LivenessBody;
        expect(body.status).toBe('ok');
        expect(body.uptimeSeconds).toEqual(expect.any(Number));
        expect(body.timestamp).toEqual(expect.any(String));
      });
  });

  it('returns request id in standardized error responses', async () => {
    await request(app.getHttpServer())
      .get('/api/not-found-observability-smoke')
      .set('x-request-id', 'smoke-error-1')
      .expect(404)
      .expect('x-request-id', 'smoke-error-1')
      .expect((res) => {
        const body = res.body as ErrorBody;
        expect(body.code).toBe('NOT_FOUND');
        expect(body.requestId).toBe('smoke-error-1');
        expect(body.timestamp).toEqual(expect.any(String));
      });
  });
});
