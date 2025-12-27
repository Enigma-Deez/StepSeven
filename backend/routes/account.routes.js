const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/accountController');
const { checkAuth } = require('../middleware/auth');

router.use(checkAuth);

router.get('/', AccountController.getAll);
router.get('/:id', AccountController.getById);
router.post('/', AccountController.create);
router.put('/:id', AccountController.update);
router.delete('/:id', AccountController.delete);

module.exports = router;