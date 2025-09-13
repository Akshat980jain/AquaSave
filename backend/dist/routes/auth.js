"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', (0, validation_1.validateRequest)(validation_1.loginSchema), authController_1.AuthController.login);
router.get('/me', auth_1.authenticateToken, authController_1.AuthController.me);
exports.default = router;
//# sourceMappingURL=auth.js.map