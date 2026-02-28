import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Scheduling API (e2e)', () => {
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

  describe('GET /schedule', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).get('/schedule').expect(401);
    });
  });

  describe('POST /schedule/generate', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).post('/schedule/generate').expect(401);
    });
  });

  describe('POST /schedule/publish', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).post('/schedule/publish').expect(401);
    });
  });
});
