const express = require('express');
const { transferMoney, listTransfers } = require('../controllers/transferController');
const { transferValidator } = require('../validators/transactionValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', listTransfers);
router.post('/', transferValidator, validate, transferMoney);

module.exports = router;
