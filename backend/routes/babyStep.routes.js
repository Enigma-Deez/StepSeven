const express = require('express');
const router = express.Router();
const BabyStepController = require('../controllers/babyStepController');
const { checkAuth } = require('../middleware/auth');

router.use(checkAuth);

router.get('/progress', BabyStepController.getProgress);
router.post('/recalculate', BabyStepController.recalculate);
router.put('/targets', BabyStepController.updateTargets);
router.get('/gazelle-intensity', BabyStepController.getGazelleIntensity);
router.get('/smallest-debt', BabyStepController.getSmallestDebt);
router.post('/mark-complete/:step', BabyStepController.markStepComplete);

module.exports = router;