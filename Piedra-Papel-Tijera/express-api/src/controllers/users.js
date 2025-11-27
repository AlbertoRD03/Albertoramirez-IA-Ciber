const { validatePayload } = require('../utils');
const {
  buildFinalAnalysis,
  buildRoundResponse,
  buildRoundResponseWithGrok,
  buildFinalAnalysisWithGrok,
  shouldUseGrok,
} = require('../services');

const parseRequestedMode = (req) => {
  if (typeof req.body?.useGrok === 'boolean') return req.body.useGrok;
  if (typeof req.query?.useGrok === 'string') return req.query.useGrok === 'true';
  return null;
};

const play = async (req, res) => {
  const error = validatePayload(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const { history, finish } = req.body;
  const playerHistory = history.player || [];

  const requestedMode = parseRequestedMode(req);
  const grokAvailable = shouldUseGrok();
  let useGrok = requestedMode !== null ? requestedMode : grokAvailable;
  if (useGrok && !grokAvailable) {
    useGrok = false; // fallback a local si Grok no disponible
  }

  try {
    if (finish) {
      const text = useGrok
        ? await buildFinalAnalysisWithGrok(req.body)
        : buildFinalAnalysis(playerHistory);
      return res.status(200).type('text/plain').send(text);
    }

    const response = useGrok
      ? await buildRoundResponseWithGrok(req.body)
      : buildRoundResponse(playerHistory);
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
};

module.exports = { play };
