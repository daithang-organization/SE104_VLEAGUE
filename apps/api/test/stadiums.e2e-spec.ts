import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Stadiums API (e2e)', () => {
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

  describe('GET /stadiums', () => {
    it('should return list of stadiums', async () => {
      const response = await request(app.getHttpServer())
        .get('/stadiums')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /stadiums/:id', () => {
    it('should return 404 for non-existent stadium', async () => {
      await request(app.getHttpServer())
        .get('/stadiums/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
