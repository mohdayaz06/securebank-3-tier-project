const express = require('express');
const { getHistory, deposit, withdraw } = require('../controllers/transactionController');
const { depositValidator, withdrawalValidator } = require('../validators/transactionValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/account/:accountId', getHistory);
router.post('/deposit', depositValidator, validate, deposit);
router.post('/withdraw', withdrawalValidator, validate, withdraw);

module.exports = router;
