import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display logo and navigation links in desktop view', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    
    const logo = page.locator('a', { hasText: 'VoltConnect' });
    await expect(logo).toBeVisible();

    const desktopMenu = page.locator('div.hidden.md\\:flex');
    await expect(desktopMenu).toBeVisible();
    
    const links = ['Search Stations', 'My Bookings', 'Dashboard', 'Profile', 'Sign In'];
    for (const linkText of links) {
      const link = desktopMenu.locator('a', { hasText: linkText });
      await expect(link).toBeVisible();
    }
  });

  test('should navigate to search stations page', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    
    const searchLink = page.locator('a', { hasText: 'Search Stations' }).first();
    await searchLink.waitFor({ state: 'visible' });
    await searchLink.click();
    
    await expect(page).toHaveURL(/.*\/search/);
  });

  test('should display and interact with login form', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    
    const signInButton = page.locator('a', { hasText: 'Sign In' });
    await signInButton.click();
    
    await expect(page).toHaveURL(/.*\/login/);
    
    await expect(page.locator('h2', { hasText: 'Login' })).toBeVisible();
    await expect(page.locator('input#name')).toBeVisible();

    const roles = ['DRIVER', 'OPERATOR', 'TECHNICIAN', 'ADMIN'];
    for (const role of roles) {
      const radioButton = page.locator(`input#role-${role}`);
      await expect(radioButton).toBeVisible();
    }

    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toHaveText('Login');

    const loginImage = page.locator('img[alt="Login visual"]');
    await expect(loginImage).toBeVisible();
  });
}); 