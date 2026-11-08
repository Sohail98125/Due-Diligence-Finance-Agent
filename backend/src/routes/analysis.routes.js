import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { analyze, getReport, getHistory, getStatus } from '../controllers/analysis.controller.js';

const router = express.Router();

router.use(isAuthenticated);   // is router ke SAARE routes protected

router.post('/analyze', analyze);
router.get('/status/:jobId', getStatus);
router.get('/report/:jobId', getReport);
router.get('/history', getHistory);

export default router;