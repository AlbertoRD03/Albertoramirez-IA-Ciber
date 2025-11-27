const request = require('supertest');
const app = require('../../src/app');

const validBody = {
  score: { player: 0, machine: 0 },
  history: { player: ['piedra'], machine: ['papel'] },
  finish: false,
};

describe('Express loader', () => {
  it('creates an app and responds 200 on valid POST', async () => {
    const response = await request(app).post('/api/rps/play').send(validBody);
    expect(response.status).toBe(200);
  });
});
