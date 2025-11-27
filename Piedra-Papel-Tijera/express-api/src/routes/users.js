const { Router } = require('express');
const controller = require('../controllers/users');

const router = Router();

router.post('/play', controller.play);

module.exports = router;
