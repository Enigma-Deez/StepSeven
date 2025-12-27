const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { checkAuth } = require('../middleware/auth');

router.use(checkAuth);

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', CategoryController.create);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);

module.exports = router;