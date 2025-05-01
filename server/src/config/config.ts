import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  idoSell: {
    apiKey: process.env.API_KEY,
    panelUrl: process.env.PANEL_URL
  },
  auth: {
    username: process.env.API_USERNAME || 'admin',
    password: process.env.API_PASSWORD || 'password123'
  },
  scheduler: {
    enabled: true,
    dailyCronExpression: process.env.DAILY_CRON || '0 0 * * *'
  }
}; 