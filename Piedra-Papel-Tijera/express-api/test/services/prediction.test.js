const { pickMachineMove, predictNextPlayerMove } = require('../../src/services');

describe('Service helpers', () => {
  test('pickMachineMove counters prediction deterministically', () => {
    expect(pickMachineMove('piedra')).toBe('papel');
    expect(pickMachineMove('papel')).toBe('tijeras');
    expect(pickMachineMove('tijeras')).toBe('piedra');
  });

  test('predictNextPlayerMove uses recency window when frequencies tie', () => {
    const history = ['piedra', 'papel', 'tijeras'];
    const prediction = predictNextPlayerMove(history);
    expect(prediction).toBe(history[2]); // recent tie-breaker
  });
});
