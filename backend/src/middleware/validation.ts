import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
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

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

export const createSampleSchema = Joi.object({
  location: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  sample_date: Joi.date().iso().required(),
  cu_concentration: Joi.number().min(0).required(),
  pb_concentration: Joi.number().min(0).required(),
  cd_concentration: Joi.number().min(0).required(),
  zn_concentration: Joi.number().min(0).required(),
  notes: Joi.string().optional()
});

export const updateSampleSchema = Joi.object({
  location: Joi.string().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  sample_date: Joi.date().iso().optional(),
  cu_concentration: Joi.number().min(0).optional(),
  pb_concentration: Joi.number().min(0).optional(),
  cd_concentration: Joi.number().min(0).optional(),
  zn_concentration: Joi.number().min(0).optional(),
  notes: Joi.string().optional()
});