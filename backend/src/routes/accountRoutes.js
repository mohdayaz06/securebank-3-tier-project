const express = require('express');
const { listAccounts, getAccount, openAccount, renameAccount } = require('../controllers/accountController');
const {
  createAccountValidator,
  renameAccountValidator,
  accountIdParamValidator,
} = require('../validators/accountValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(listAccounts).post(createAccountValidator, validate, openAccount);
router
  .route('/:id')
  .get(accountIdParamValidator, validate, getAccount)
  .patch(accountIdParamValidator, renameAccountValidator, validate, renameAccount);

module.exports = router;
