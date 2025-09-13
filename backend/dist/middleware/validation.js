"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSampleSchema = exports.createSampleSchema = exports.loginSchema = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.details[0].message
            });
        }
        return next();
    };
};
exports.validateRequest = validateRequest;
exports.loginSchema = joi_1.default.object({
    username: joi_1.default.string().required(),
    password: joi_1.default.string().required()
});
exports.createSampleSchema = joi_1.default.object({
    location: joi_1.default.string().required(),
    latitude: joi_1.default.number().min(-90).max(90).required(),
    longitude: joi_1.default.number().min(-180).max(180).required(),
    sample_date: joi_1.default.date().iso().required(),
    cu_concentration: joi_1.default.number().min(0).required(),
    pb_concentration: joi_1.default.number().min(0).required(),
    cd_concentration: joi_1.default.number().min(0).required(),
    zn_concentration: joi_1.default.number().min(0).required(),
    notes: joi_1.default.string().optional()
});
exports.updateSampleSchema = joi_1.default.object({
    location: joi_1.default.string().optional(),
    latitude: joi_1.default.number().min(-90).max(90).optional(),
    longitude: joi_1.default.number().min(-180).max(180).optional(),
    sample_date: joi_1.default.date().iso().optional(),
    cu_concentration: joi_1.default.number().min(0).optional(),
    pb_concentration: joi_1.default.number().min(0).optional(),
    cd_concentration: joi_1.default.number().min(0).optional(),
    zn_concentration: joi_1.default.number().min(0).optional(),
    notes: joi_1.default.string().optional()
});
//# sourceMappingURL=validation.js.map