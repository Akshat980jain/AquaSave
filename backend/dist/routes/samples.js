"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sampleController_1 = require("../controllers/sampleController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', sampleController_1.SampleController.getAllSamples);
router.get('/statistics', sampleController_1.SampleController.getStatistics);
router.get('/:id', sampleController_1.SampleController.getSampleById);
router.post('/', (0, auth_1.requireRole)(['higher_official']), (0, validation_1.validateRequest)(validation_1.createSampleSchema), sampleController_1.SampleController.createSample);
router.put('/:id', (0, auth_1.requireRole)(['higher_official']), (0, validation_1.validateRequest)(validation_1.updateSampleSchema), sampleController_1.SampleController.updateSample);
router.delete('/:id', (0, auth_1.requireRole)(['higher_official']), sampleController_1.SampleController.deleteSample);
exports.default = router;
//# sourceMappingURL=samples.js.map