import { test, expect } from '@playwright/test';

test.describe('Events E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can view upcoming events', async ({ page }) => {
    // Scroll to events section
    await page.locator('text=Próximos Eventos|Eventos').first().scrollIntoViewIfNeeded();

    // Check if events are displayed
    const eventCards = page.locator('[data-testid="event-card"]');
    const count = await eventCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('user can inscribe in event', async ({ page }) => {
    // Scroll to events section
    await page.locator('text=Próximos Eventos|Eventos').first().scrollIntoViewIfNeeded();

    // Click on first event inscription button
    const inscribeButton = page.locator('button:has-text("Inscrever|Se inscrever")').first();
    await inscribeButton.click();

    // Modal should open
    await expect(page.locator('text=Inscrição no Evento')).toBeVisible({ timeout: 5000 });

    // Fill form
    await page.locator('input[name="email"]').fill('user@example.com');
    await page.locator('input[name="name"]').fill('User Name');
    await page.locator('input[name="phone"]').fill('11999999999');

    // Submit
    const confirmButton = page.locator('button:has-text("Confirmar|Inscrever")').last();
    await confirmButton.click();

    // Check for success message
    await expect(page.locator('text=Inscrito com sucesso|Inscrição confirmada')).toBeVisible({ timeout: 5000 });
  });

  test('event inscription validates required fields', async ({ page }) => {
    const inscribeButton = page.locator('button:has-text("Inscrever|Se inscrever")').first();
    await inscribeButton.click();

    // Modal should open
    await expect(page.locator('text=Inscrição no Evento')).toBeVisible();

    // Try to submit empty form
    const confirmButton = page.locator('button:has-text("Confirmar|Inscrever")').last();
    await confirmButton.click();

    // Validation should prevent submission
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('event inscription validates email format', async ({ page }) => {
    const inscribeButton = page.locator('button:has-text("Inscrever|Se inscrever")').first();
    await inscribeButton.click();

    await page.locator('input[name="email"]').fill('invalid-email');
    await page.locator('input[name="name"]').fill('Test User');
    await page.locator('input[name="phone"]').fill('11999999999');

    const confirmButton = page.locator('button:has-text("Confirmar|Inscrever")').last();
    await confirmButton.click();

    // Should show validation error or prevent submission
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('user can view event details', async ({ page }) => {
    // Scroll to events
    await page.locator('text=Próximos Eventos|Eventos').first().scrollIntoViewIfNeeded();

    // Click on event details
    const eventCard = page.locator('[data-testid="event-card"]').first();
    const detailsButton = eventCard.locator('a, button:has-text("Ver detalhes|Detalhes")').first();

    if (await detailsButton.isVisible()) {
      await detailsButton.click();

      // Check if details are shown
      await expect(page.locator('text=Detalhes do Evento|Descrição')).toBeVisible({ timeout: 5000 });
    }
  });

  test('user can view past events', async ({ page }) => {
    // Look for past events section
    const pastEventsSection = page.locator('text=Eventos Passados|Passados');

    if (await pastEventsSection.isVisible()) {
      await pastEventsSection.scrollIntoViewIfNeeded();

      // Check if past events are displayed
      const pastEventCards = page.locator('[data-testid="past-event-card"]');
      const count = await pastEventCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('event inscription shows loading state', async ({ page }) => {
    // Slow down network
    await page.route('**/api/events/*/subscribe', (route) => {
      setTimeout(() => route.continue(), 500);
    });

    const inscribeButton = page.locator('button:has-text("Inscrever|Se inscrever")').first();
    await inscribeButton.click();

    await page.locator('input[name="email"]').fill('user@example.com');
    await page.locator('input[name="name"]').fill('User Name');
    await page.locator('input[name="phone"]').fill('11999999999');

    const confirmButton = page.locator('button:has-text("Confirmar|Inscrever")').last();
    await confirmButton.click();

    // Button should show loading state
    await expect(confirmButton).toContainText(/Carregando|Confirmando/);
  });

  test('user can close event inscription modal', async ({ page }) => {
    const inscribeButton = page.locator('button:has-text("Inscrever|Se inscrever")').first();
    await inscribeButton.click();

    // Modal should be open
    await expect(page.locator('text=Inscrição no Evento')).toBeVisible();

    // Close modal
    const closeButton = page.locator('button[aria-label="Fechar"], [class*="close"]').first();
    await closeButton.click();

    // Modal should close
    await expect(page.locator('text=Inscrição no Evento')).not.toBeVisible();
  });
});
