import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Users API (e2e)', () => {
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

  describe('GET /users', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('POST /users', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'newuser@test.com',
          password: 'Pass@123',
          role: 'TEAM_MANAGER',
          name: 'Test User',
        })
        .expect(401);
    });
  });

  describe('PATCH /users/:id/role', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .patch('/users/00000000-0000-0000-0000-000000000000/role')
        .send({ role: 'REFEREE' })
        .expect(401);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .delete('/users/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });
  });
});
