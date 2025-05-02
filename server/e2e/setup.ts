import { expect } from '@playwright/test';
import { Buffer } from 'node:buffer';

export async function expectSuccessResponse(response: any) {
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.success).toBe(true);
  return body;
}

export function getAuthHeaders(username: string = 'admin', password: string = 'password123') {
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  };
} 