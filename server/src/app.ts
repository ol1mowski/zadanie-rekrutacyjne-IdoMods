import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import ordersRoutes from './routes/ordersRoutes';
import orderScheduler from './schedulers/orderScheduler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zbyt wiele zapytań, spróbuj ponownie później' }
});
app.use('/api', apiLimiter);

app.use('/api/orders', ordersRoutes);

app.get('/', (req, res) => {
  res.send('API idoSell działa poprawnie. Użyj endpointu /api/orders aby pobrać zamówienia.');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Nie znaleziono zasobu' });
});

if (config.scheduler.enabled) {
  orderScheduler.initialize();
} else {
  console.log('Scheduler jest wyłączony w konfiguracji.');
}

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
  console.log('API dostępne pod adresem:');
  console.log(`- http://localhost:${PORT}/api/orders - Lista zamówień (wymaga uwierzytelnienia)`);
  console.log(`- http://localhost:${PORT}/api/orders?minWorth=x&maxWorth=y - Lista zamówień o wartości pomiędzy x a y`);
  console.log(`- http://localhost:${PORT}/api/orders/csv - Eksport wszystkich zamówień do CSV`);
  console.log(`- http://localhost:${PORT}/api/orders/:id - Pobierz konkretne zamówienie (wymaga uwierzytelnienia)`);
  console.log(`- http://localhost:${PORT}/api/orders/csv/:id - Eksport konkretnego zamówienia do CSV`);
});

export default app; 