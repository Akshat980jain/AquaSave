"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaterSample = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const WaterSampleSchema = new mongoose_1.Schema({
    location: {
        type: String,
        required: true,
        trim: true
    },
    latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
    },
    longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
    },
    sample_date: {
        type: Date,
        required: true
    },
    collected_by: {
        type: String,
        required: true,
        ref: 'User'
    },
    cu_concentration: {
        type: Number,
        required: true,
        min: 0
    },
    pb_concentration: {
        type: Number,
        required: true,
        min: 0
    },
    cd_concentration: {
        type: Number,
        required: true,
        min: 0
    },
    zn_concentration: {
        type: Number,
        required: true,
        min: 0
    },
    hmpi_value: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['safe', 'marginal', 'high']
    },
    notes: {
        type: String,
        trim: true
    },
    additional_data: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});
WaterSampleSchema.index({ status: 1 });
WaterSampleSchema.index({ sample_date: 1 });
WaterSampleSchema.index({ location: 1 });
WaterSampleSchema.index({ hmpi_value: 1 });
WaterSampleSchema.index({ latitude: 1, longitude: 1 });
exports.WaterSample = mongoose_1.default.model('WaterSample', WaterSampleSchema);
//# sourceMappingURL=WaterSample.js.map