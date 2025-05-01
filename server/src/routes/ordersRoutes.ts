import { Router } from 'express';
import { 
  getOrders, 
  getOrdersCSV, 
  getOrderById, 
  getOrderCSV, 
  refreshOrders,
} from '../controllers/ordersController';
import { basicAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(basicAuth);

router.get('/', getOrders);

router.get('/csv', getOrdersCSV);

router.get('/:id', getOrderById);

router.get('/:id/csv', getOrderCSV);

router.post('/refresh', refreshOrders);

export default router; 