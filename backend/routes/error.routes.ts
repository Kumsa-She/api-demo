import { Router } from 'express';
import {
  simulateBadRequestError,
  simulateForbiddenError,
  simulateNotFoundError,
  simulateServerError,
  simulateSlowResponse,
  simulateUnauthorizedError,
} from '../controllers/error.controller';

const errorRouter = Router();

errorRouter.get('/400', simulateBadRequestError);
errorRouter.get('/401', simulateUnauthorizedError);
errorRouter.get('/403', simulateForbiddenError);
errorRouter.get('/500', simulateServerError);
errorRouter.get('/404', simulateNotFoundError);
errorRouter.get('/slow', simulateSlowResponse);

export default errorRouter;
