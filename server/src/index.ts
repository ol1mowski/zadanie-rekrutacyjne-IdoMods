import express from 'express';
import cors from 'cors';
import { config } from './config/config';
import { OrderController } from './controllers/orderController';
import { authMiddleware } from './middlewares/authMiddleware';
import { CronJob } from './utils/cronJob';

const app = express();
const port = config.port;

app.use(cors());
app.use(express.json());

const orderController = new OrderController();

app.post('/api/orders/update', authMiddleware, orderController.updateOrders);

app.get('/api/orders/export/csv', authMiddleware, orderController.exportOrdersToCsv);

app.get('/api/orders', authMiddleware, orderController.getAllOrders);

app.get('/api/orders/:id', authMiddleware, orderController.getOrderById);

app.listen(port, () => {
  console.log(`Serwer jest uruchomiony na porcie ${port}`);
  
  const cronJob = new CronJob();
  cronJob.startDailyOrdersUpdate();

  const mockRequest = {} as express.Request;
  const mockResponse = {
    json: (data: any) => {
      console.log('Zamówienia zostały zaktualizowane podczas uruchamiania serwera');
      return mockResponse;
    },
    status: (code: number) => {
      return mockResponse;
    }
  } as unknown as express.Response;
  
  orderController.updateOrders(mockRequest, mockResponse).catch(error => {
    console.error('Błąd podczas początkowej aktualizacji zamówień:', error);
  });
}); 