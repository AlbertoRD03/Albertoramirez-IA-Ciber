const request = require('supertest');
const app = require('../../src/app');

describe('RPS routes', () => {
  test('responds with JSON when finish is false', async () => {
    const body = {
      score: { player: 0, machine: 0 },
      history: {
        player: ['piedra', 'papel', 'papel'],
        machine: ['tijeras', 'tijeras', 'piedra'],
      },
      finish: false,
    };

    const res = await request(app).post('/api/rps/play').send(body);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toHaveProperty('next_move', 'tijeras');
    expect(res.body.analysis.player_next_move_prediction).toBe('papel');
    expect(res.body.analysis.predictability_percentage).toBeCloseTo(50, 2);
  });

  test('responds with text when finish is true', async () => {
    const body = {
      score: { player: 2, machine: 2 },
      history: {
        player: ['piedra', 'papel', 'tijeras', 'piedra'],
        machine: ['papel', 'tijeras', 'piedra', 'papel'],
      },
      finish: true,
    };

    const res = await request(app).post('/api/rps/play').send(body);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toMatch(/Patron principal/);
    expect(res.text).toMatch(/Porcentaje de predictibilidad/);
  });
});
