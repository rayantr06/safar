import { test, expect } from '@playwright/test';

test.describe('Safar DZ E2E User Flows', () => {
  test('should navigate through homepage, catalog, and check public layout', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    
    // Expect correct hero elements
    await expect(page.locator('h1')).toContainText('Béjaïa');
    
    // Find link to catalog and click it
    const experiencesLink = page.locator('header nav').getByText('Expériences');
    await experiencesLink.click();
    
    // 2. Check Catalogue Page
    await expect(page).toHaveURL(/\/experiences/);
    await expect(page.locator('h1')).toContainText('Toutes nos expériences');
  });

  test('should enforce route protection and redirect to login', async ({ page }) => {
    // 1. Try to load Admin Dashboard without auth
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
    
    // 2. Try to load Partner Dashboard without auth
    await page.goto('/partner');
    await expect(page).toHaveURL(/\/login/);
  });
});
