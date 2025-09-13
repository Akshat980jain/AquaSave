import mongoose, { Document, Schema } from 'mongoose';

export interface IWaterSample extends Document {
  location: string;
  latitude: number;
  longitude: number;
  sample_date: Date;
  collected_by: string;
  cu_concentration: number;
  pb_concentration: number;
  cd_concentration: number;
  zn_concentration: number;
  hmpi_value: number;
  status: 'safe' | 'marginal' | 'high';
  notes?: string;
  additional_data?: {
    pH?: number;
    ec?: number;
    co3?: number;
    hco3?: number;
    cl?: number;
    f?: number;
    so4?: number;
    no3?: number;
    po4?: number;
    totalHardness?: number;
    ca?: number;
    mg?: number;
    na?: number;
    k?: number;
    fe?: number;
    as?: number;
    u?: number;
  };
  created_at: Date;
  updated_at: Date;
}

const WaterSampleSchema = new Schema<IWaterSample>({
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
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes for better performance
WaterSampleSchema.index({ status: 1 });
WaterSampleSchema.index({ sample_date: 1 });
WaterSampleSchema.index({ location: 1 });
WaterSampleSchema.index({ hmpi_value: 1 });
WaterSampleSchema.index({ latitude: 1, longitude: 1 });

export const WaterSample = mongoose.model<IWaterSample>('WaterSample', WaterSampleSchema);

