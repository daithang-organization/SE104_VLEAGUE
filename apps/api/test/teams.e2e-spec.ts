import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Teams API (e2e)', () => {
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

  describe('GET /teams', () => {
    it('should return list of teams', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /teams', () => {
    it('should create a new team', async () => {
      const teamName = `Test Team ${Date.now()}`;
      const response = await request(app.getHttpServer())
        .post('/teams')
        .send({
          name: teamName,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', teamName);
      expect(response.body).toHaveProperty('status', 'ACTIVE');
    });

    it('should reject duplicate team name', async () => {
      const teamName = `Duplicate Team ${Date.now()}`;

      // Create first team
      await request(app.getHttpServer())
        .post('/teams')
        .send({ name: teamName })
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/teams')
        .send({ name: teamName })
        .expect(409); // Conflict
    });

    it('should reject empty team name', async () => {
      await request(app.getHttpServer())
        .post('/teams')
        .send({ name: '' })
        .expect(400);
    });

    it('should reject missing team name', async () => {
      await request(app.getHttpServer()).post('/teams').send({}).expect(400);
    });
  });

  describe('GET /teams/:id', () => {
    it('should return a team by id', async () => {
      // Create a team first
      const teamName = `Get Team ${Date.now()}`;
      const createResponse = await request(app.getHttpServer())
        .post('/teams')
        .send({ name: teamName })
        .expect(201);

      const teamId = (createResponse.body as { id: string }).id;

      // Get the team
      const response = await request(app.getHttpServer())
        .get(`/teams/${teamId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', teamId);
      expect(response.body).toHaveProperty('name', teamName);
    });

    it('should return 404 for non-existent team', async () => {
      await request(app.getHttpServer())
        .get('/teams/non-existent-uuid')
        .expect(404);
    });
  });

  describe('PATCH /teams/:id', () => {
    it('should update a team', async () => {
      // Create a team first
      const createResponse = await request(app.getHttpServer())
        .post('/teams')
        .send({ name: `Update Team ${Date.now()}` })
        .expect(201);

      const teamId = (createResponse.body as { id: string }).id;
      const newName = `Updated Team ${Date.now()}`;

      // Update the team
      const response = await request(app.getHttpServer())
        .patch(`/teams/${teamId}`)
        .send({ name: newName })
        .expect(200);

      expect(response.body).toHaveProperty('name', newName);
    });

    it('should update team status', async () => {
      // Create a team first
      const createResponse = await request(app.getHttpServer())
        .post('/teams')
        .send({ name: `Status Team ${Date.now()}` })
        .expect(201);

      const teamId = (createResponse.body as { id: string }).id;

      // Update status to INACTIVE
      const response = await request(app.getHttpServer())
        .patch(`/teams/${teamId}`)
        .send({ status: 'INACTIVE' })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'INACTIVE');
    });
  });

  describe('DELETE /teams/:id', () => {
    it('should delete a team', async () => {
      // Create a team first
      const createResponse = await request(app.getHttpServer())
        .post('/teams')
        .send({ name: `Delete Team ${Date.now()}` })
        .expect(201);

      const teamId = (createResponse.body as { id: string }).id;

      // Delete the team
      await request(app.getHttpServer()).delete(`/teams/${teamId}`).expect(200);

      // Verify it's deleted
      await request(app.getHttpServer()).get(`/teams/${teamId}`).expect(404);
    });
  });
});
