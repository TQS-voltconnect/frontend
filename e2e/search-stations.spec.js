import { test, expect } from '@playwright/test';

test.describe.configure({ timeout: 60000 });

test.describe('Search Stations Page', () => {
  const VITE_PORT = 5173;
  const VITE_URL = `http://localhost:${VITE_PORT}`;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    try {
      const response = await page.goto(VITE_URL);
      if (!response?.ok()) {
        throw new Error(`Frontend server is not running on port ${VITE_PORT}. Please start it with npm run dev`);
      }
    } catch (error) {
      throw new Error(`Could not connect to frontend server: ${error.message}`);
    } finally {
      await page.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    const responsePromise = page.waitForResponse(
      response =>
        response.url().includes('/api/stations'),
      { timeout: 30000 }
    );

    await page.goto(`${VITE_URL}/search`);

    try {
      await responsePromise;
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    } catch (error) {
      console.log('Timeout ou erro ao esperar pela resposta da API:', error);
    }
  });

  test('should display search interface and initial stations', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Find Charging Stations' })).toBeVisible();
    await expect(page.getByPlaceholder('Search by location or station name')).toBeVisible();
    await expect(page.locator('.map-container')).toBeVisible();
    await expect(page.locator('ul')).toBeVisible();
  });

  test('should filter stations by search term', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by location or station name');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Braga');
    await expect(page.locator('ul')).toBeVisible();
    await expect(page.getByText('Braga')).toBeVisible();
  });

  test('should filter stations by availability toggle', async ({ page }) => {
    await expect(page.locator('ul')).toBeVisible();
    
    const stationsCountHeader = page.locator('h2', { hasText: 'Found' });
    await expect(stationsCountHeader).toBeVisible();

    const toggleInput = page.locator('input[name="availableOnly"]');
    await expect(toggleInput).toBeVisible();

    await page.locator('label:has(input[name="availableOnly"])').click();

    await expect(toggleInput).toBeChecked();

    await page.waitForFunction(() => {
      const header = document.querySelector('h2');
      return header?.textContent.includes('Found');
    });

    const stationsList = page.locator('ul');
    await expect(stationsList).toBeVisible();

    const hasStations = await page.locator('ul button').count() > 0;
    if (hasStations) {
      const availabilityText = page.getByText(/^\d{1,3} available$/);
      await expect(availabilityText).toBeVisible();
    }
  });

  test('should select station and show details in list and map', async ({ page }) => {
    await expect(page.locator('ul')).toBeVisible();
    
    // Encontrar e clicar na primeira estação
    const firstStation = page.locator('ul button').first();
    await expect(firstStation).toBeVisible();
    
    const stationName = await firstStation.locator('.text-emerald-600').textContent();
    
    await firstStation.click();
    
    await expect(firstStation).toHaveClass(/bg-emerald-50/);
    
    const viewDetailsButton = firstStation.getByRole('link', { name: 'View Details' });
    await expect(viewDetailsButton).toBeVisible();
    
    const href = await viewDetailsButton.getAttribute('href');
    expect(href).toMatch(/\/stations\/\d+/);

    await expect(firstStation.locator('.text-emerald-600')).toContainText(stationName);
    await expect(firstStation.getByText(/available/)).toBeVisible();
    await expect(firstStation.getByText(/kW/)).toBeVisible();

    const marker = page.locator('.leaflet-marker-icon').first();
    await expect(marker).toBeVisible();
    await marker.click();

    const popup = page.locator('.leaflet-popup-content');
    await expect(popup).toBeVisible();
    await expect(popup.locator('strong')).toContainText(stationName);
    await expect(popup.getByText(/available/)).toBeVisible();
  });

  test('should show popup when clicking map marker', async ({ page }) => {
    await expect(page.locator('.map-container')).toBeVisible();
    
    const marker = page.locator('.leaflet-marker-icon').first();
    await expect(marker).toBeVisible();
    
    await marker.click();
    
    const popup = page.locator('.leaflet-popup-content');
    await expect(popup).toBeVisible();
    
    await expect(popup.locator('strong')).toBeVisible(); 
    await expect(popup.getByText(/available/)).toBeVisible(); 
    await expect(popup.getByText(/kW/)).toBeVisible(); 
  });
});
