const { calculatePredictability, predictNextPlayerMove, buildRoundResponse } = require('../../src/services');

describe('Prediction service logic', () => {
  test('predictNextPlayerMove uses combined counts and recency to break ties', () => {
    const history = ['piedra', 'papel', 'papel', 'tijeras', 'piedra'];
    const prediction = predictNextPlayerMove(history);
    expect(['piedra', 'papel', 'tijeras']).toContain(prediction);
    expect(prediction).toBe('piedra');
  });

  test('calculatePredictability returns two decimals', () => {
    const history = ['piedra', 'papel', 'papel', 'papel'];
    const predictability = calculatePredictability(history);
    expect(predictability).toBe(66.67);
  });

  test('buildRoundResponse always counters predicted move', () => {
    const history = ['papel', 'papel', 'papel'];
    const response = buildRoundResponse(history);
    expect(response).toHaveProperty('next_move');
    expect(response.analysis.player_next_move_prediction).toBe('papel');
    expect(response.next_move).toBe('tijeras');
  });
});
