import { test, expect } from '@playwright/test';

test.describe('Safar DZ E2E User Flows', () => {
  test('should navigate through homepage, catalog, and check public layout', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    
    // Expect correct hero elements
    await expect(page.locator('h1')).toContainText(/aventure|Béjaïa/i);
    
    // Find link to catalog and click it (using the first visible hero floating nav link)
    const experiencesLink = page.locator('.hero-floating-nav a[href="/experiences"]').first();
    await experiencesLink.click();
    
    // 2. Check Catalogue Page
    await expect(page).toHaveURL(/\/experiences/);
    await expect(page.locator('h1')).toContainText(/Explorez nos aventures|Toutes nos expériences/i);
  });

  test('should enforce route protection and redirect to login', async ({ page }) => {
    // 1. Try to load Admin Dashboard without auth - redirects to portal-login
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/portal-login/);
    
    // 2. Try to load Partner Dashboard without auth - redirects to portal-login
    await page.goto('/partner');
    await expect(page).toHaveURL(/\/portal-login/);

    // 3. Try to load Client Dashboard without auth - redirects to login
    await page.goto('/client');
    await expect(page).toHaveURL(/\/login/);
  });
});
