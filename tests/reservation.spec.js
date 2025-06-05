import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Search Stations' }).click();
  await page.getByRole('button', { name: 'Station 1 Operador 1 Braga 3/' }).getByRole('link').click();
  await page.getByRole('textbox', { name: 'Search vehicle by brand or' }).click();
  await page.getByRole('textbox', { name: 'Search vehicle by brand or' }).fill('b');
  await page.getByRole('button', { name: 'Abarth 600e Scorpionissima' }).click();
  await page.getByRole('button', { name: 'DC 500 kW – AVAILABLE €0.90' }).click();
  await page.getByRole('button', { name: 'Fri 6' }).click();
  await page.getByRole('button', { name: '16:' }).click();
  await page.getByRole('button', { name: 'Confirm Booking' }).click();
  await page.getByRole('button', { name: 'View My Bookings' }).click();
  await page.getByRole('button', { name: 'View Booking' }).nth(2).click();
});