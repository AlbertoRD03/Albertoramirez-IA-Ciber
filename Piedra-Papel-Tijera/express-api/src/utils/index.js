const MOVES = ['piedra', 'papel', 'tijeras'];

const isValidMove = (move) => MOVES.includes(move);

const validatePayload = (body) => {
  if (!body || typeof body !== 'object') {
    return 'Cuerpo de peticion invalido';
  }

  const { score, history, finish } = body;

  if (typeof finish !== 'boolean') {
    return 'El campo finish debe ser booleano';
  }

  if (
    !score
    || typeof score !== 'object'
    || typeof score.player !== 'number'
    || typeof score.machine !== 'number'
  ) {
    return 'El objeto score es invalido';
  }

  if (
    !history
    || typeof history !== 'object'
    || !Array.isArray(history.player)
    || !Array.isArray(history.machine)
  ) {
    return 'El objeto history es invalido';
  }

  const invalidPlayerMove = history.player.find((move) => !isValidMove(move));
  const invalidMachineMove = history.machine.find((move) => !isValidMove(move));

  if (invalidPlayerMove) {
    return `Movimiento del jugador invalido: ${invalidPlayerMove}`;
  }

  if (invalidMachineMove) {
    return `Movimiento de la maquina invalido: ${invalidMachineMove}`;
  }

  return null;
};

module.exports = {
  MOVES,
  isValidMove,
  validatePayload,
};
