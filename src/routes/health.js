const { Router } = require('express');
const { getRoot, getHealth } = require('../controllers/healthController');

const router = Router();

router.get('/', getRoot);
router.get('/health', getHealth);

module.exports = router;
