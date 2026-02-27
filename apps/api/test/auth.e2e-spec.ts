import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Auth API (e2e)', () => {
  let app: INestApplication<App>;

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword@123';

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

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      expect(response.body).toHaveProperty('email', testEmail);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: testPassword,
        })
        .expect(400);
    });

    it('should reject weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'another@example.com',
          password: 'weak',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject unverified user', async () => {
      // Register a new user (unverified)
      const email = `unverified-${Date.now()}@example.com`;
      await request(app.getHttpServer()).post('/auth/register').send({
        email,
        password: testPassword,
      });

      // Try to login without verification
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: testPassword,
        })
        .expect(401);
    });

    it('should reject wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword@123',
        })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully (even with invalid token)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .send({
          refreshToken: 'some-token',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /auth/me (Protected)', () => {
    it('should reject request without token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should return success even for non-existent email (security)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Input Validation', () => {
    it('should reject missing email in register', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          password: testPassword,
        })
        .expect(400);
    });

    it('should reject missing password in register', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });

    it('should reject extra fields (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: testPassword,
          extraField: 'should be rejected',
        })
        .expect(400);
    });
  });
});
