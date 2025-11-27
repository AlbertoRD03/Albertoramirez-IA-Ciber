const { MOVES } = require('../utils');
const config = require('../config');
const { callGrok } = require('./grok');

const MOVE_THAT_BEATS = {
  piedra: 'papel',
  papel: 'tijeras',
  tijeras: 'piedra',
};

const buildEmptyCounts = () => ({
  piedra: 0,
  papel: 0,
  tijeras: 0,
});

const getRandomMove = () => {
  const index = Math.floor(Math.random() * MOVES.length);
  return MOVES[index];
};

/**
 * Predice la próxima jugada del jugador combinando frecuencias globales
 * y una ventana reciente (últimas 5). En empates gana la más reciente.
 * @param {string[]} historyPlayer
 * @returns {string}
 */
const predictNextPlayerMove = (historyPlayer = []) => {
  if (!historyPlayer.length) {
    return getRandomMove();
  }

  const total = buildEmptyCounts();
  const recent = buildEmptyCounts();

  historyPlayer.forEach((move, idx) => {
    total[move] += 1;
    if (idx >= historyPlayer.length - 5) {
      recent[move] += 1;
    }
  });

  let bestMove = null;
  let bestScore = -Infinity;

  MOVES.forEach((move) => {
    const score = total[move] + recent[move];
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    } else if (score === bestScore && bestMove) {
      const lastIndexBest = historyPlayer.lastIndexOf(bestMove);
      const lastIndexCurrent = historyPlayer.lastIndexOf(move);
      if (lastIndexCurrent > lastIndexBest) {
        bestMove = move;
      }
    }
  });

  return bestMove || getRandomMove();
};

/**
 * Calcula el porcentaje de predictibilidad del historial del jugador.
 * @param {string[]} historyPlayer
 * @returns {number}
 */
const calculatePredictability = (historyPlayer = []) => {
  const n = historyPlayer.length;
  if (n <= 1) {
    return 0.0;
  }

  let hits = 0;
  for (let i = 0; i < n - 1; i += 1) {
    const prefix = historyPlayer.slice(0, i + 1);
    const prediction = predictNextPlayerMove(prefix);
    if (prediction === historyPlayer[i + 1]) {
      hits += 1;
    }
  }

  const predictability = (hits / (n - 1)) * 100;
  return Number(predictability.toFixed(2));
};

const pickMachineMove = (playerPrediction) => MOVE_THAT_BEATS[playerPrediction] || getRandomMove();

const describePattern = (counts) => {
  const ordered = MOVES.slice().sort((a, b) => counts[b] - counts[a]);
  return ordered.map((move) => `${move} (${counts[move]})`).join(', ');
};

const describeDeviations = (historyPlayer, counts) => {
  const max = Math.max(...MOVES.map((m) => counts[m]));
  const deviations = MOVES.filter((move) => counts[move] > 0 && counts[move] < max);

  if (!deviations.length) {
    return 'Pocas variaciones en la secuencia del jugador.';
  }

  const examples = deviations.map((move) => {
    const indexes = [];
    historyPlayer.forEach((item, idx) => {
      if (item === move && indexes.length < 2) {
        indexes.push(idx + 1);
      }
    });
    const indexText = indexes.length ? `rondas ${indexes.join(', ')}` : 'sin rondas destacadas';
    return `${move} en ${indexText}`;
  });

  return `Variaciones notables: ${examples.join('; ')}.`;
};

const buildFinalAnalysis = (historyPlayer = []) => {
  const counts = buildEmptyCounts();
  historyPlayer.forEach((move) => {
    counts[move] += 1;
  });

  const predictability = calculatePredictability(historyPlayer);
  const pattern = describePattern(counts);
  const deviations = describeDeviations(historyPlayer, counts);

  return `Patron principal del jugador: ${pattern}. ${deviations} Porcentaje de predictibilidad final: ${predictability.toFixed(
    2,
  )}%.`;
};

const buildRoundResponse = (historyPlayer) => {
  const playerPrediction = predictNextPlayerMove(historyPlayer);
  const nextMove = pickMachineMove(playerPrediction);
  const predictability = calculatePredictability(historyPlayer);

  return {
    next_move: nextMove,
    analysis: {
      predictability_percentage: predictability,
      player_next_move_prediction: playerPrediction,
    },
  };
};

const shouldUseGrok = () => config.grokApiKey && config.env !== 'test';

const buildRoundResponseWithGrok = async (payload) => {
  try {
    return await callGrok(payload, false);
  } catch (err) {
    return buildRoundResponse(payload.history.player || []);
  }
};

const buildFinalAnalysisWithGrok = async (payload) => {
  try {
    return await callGrok(payload, true);
  } catch (err) {
    return buildFinalAnalysis(payload.history.player || []);
  }
};

module.exports = {
  calculatePredictability,
  buildFinalAnalysis,
  buildRoundResponse,
  buildRoundResponseWithGrok,
  buildFinalAnalysisWithGrok,
  pickMachineMove,
  predictNextPlayerMove,
  shouldUseGrok,
};
