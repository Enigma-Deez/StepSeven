const express = require('express');
const babyStepRouter = express.Router(); // Match this name
const { checkAuth } = require('../middleware/auth');
const BabyStepController = require('../controllers/babyStepController');

babyStepRouter.use(checkAuth);

babyStepRouter.get('/progress', BabyStepController.getProgress);
babyStepRouter.get('/gazelle-intensity', BabyStepController.getGazelleIntensity);
babyStepRouter.get('/smallest-debt', BabyStepController.getSmallestDebt);

module.exports = babyStepRouter;