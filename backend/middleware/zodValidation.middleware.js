import { z } from 'zod';

export const validateRequest = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    const errorMessages = error.errors ? error.errors.map(err => err.message) : [error.message];
    return res.status(400).json({
      message: 'Error de validación',
      errors: errorMessages
    });
  }
};
