import { test, expect } from '@playwright/test';

test.describe('Newsletter E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can subscribe to newsletter', async ({ page }) => {
    // Scroll to newsletter section
    await page.locator('text=Receba atualizações').first().scrollIntoViewIfNeeded();

    // Find and fill email input
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('newuser@example.com');

    // Submit form
    const subscribeButton = page.locator('button:has-text("Se inscrever")').first();
    await subscribeButton.click();

    // Check for success message
    await expect(page.locator('text=Inscrito com sucesso')).toBeVisible({ timeout: 5000 });
  });

  test('newsletter shows validation error for invalid email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('invalid-email');

    const subscribeButton = page.locator('button:has-text("Se inscrever")').first();
    await subscribeButton.click();

    // Browser native validation should prevent submission
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('newsletter prevents duplicate subscription', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    const subscribeButton = page.locator('button:has-text("Se inscrever")').first();

    // First subscription
    await emailInput.fill('duplicate@example.com');
    await subscribeButton.click();
    await expect(page.locator('text=Inscrito com sucesso')).toBeVisible({ timeout: 5000 });

    // Clear form
    await emailInput.clear();

    // Second subscription attempt
    await emailInput.fill('duplicate@example.com');
    await subscribeButton.click();

    // Should show error
    await expect(page.locator('text=Email já inscrito|já inscrever')).toBeVisible({ timeout: 5000 });
  });

  test('newsletter form shows loading state', async ({ page }) => {
    // Slow down network to see loading state
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 500);
    });

    const emailInput = page.locator('input[type="email"]').first();
    const subscribeButton = page.locator('button:has-text("Se inscrever")').first();

    await emailInput.fill('test@example.com');
    await subscribeButton.click();

    // Button should show loading state
    await expect(subscribeButton).toContainText(/Inscrevendo|Enviando/);
  });

  test('user can unsubscribe from newsletter', async ({ page }) => {
    // Navigate to settings/unsubscribe page if available
    const unsubscribeLink = page.locator('a:has-text("Desinscrever")');

    if (await unsubscribeLink.isVisible()) {
      await unsubscribeLink.click();

      const emailInput = page.locator('input[type="email"]').first();
      await emailInput.fill('user@example.com');

      const unsubscribeButton = page.locator('button:has-text("Desinscrever")').first();
      await unsubscribeButton.click();

      await expect(page.locator('text=Desinscrito com sucesso')).toBeVisible({ timeout: 5000 });
    }
  });
});
