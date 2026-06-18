import { test, expect } from '@playwright/test';

test.describe('Contact Form E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can send contact message', async ({ page }) => {
    // Scroll to contact section
    await page.locator('text=Contato|Fale Conosco').first().scrollIntoViewIfNeeded();

    // Fill form fields
    await page.locator('input[name="name"]').fill('João Silva');
    await page.locator('input[name="email"]').fill('joao@example.com');
    await page.locator('input[name="subject"]').fill('Dúvida sobre inscrição');
    await page.locator('textarea[name="message"]').fill('Gostaria de saber mais sobre o programa...');

    // Submit form
    const submitButton = page.locator('button:has-text("Enviar")').first();
    await submitButton.click();

    // Check for success message
    await expect(page.locator('text=Mensagem enviada com sucesso')).toBeVisible({ timeout: 5000 });
  });

  test('contact form validates required fields', async ({ page }) => {
    const submitButton = page.locator('button:has-text("Enviar")').first();

    // Try to submit empty form
    await submitButton.click();

    // Form should not submit due to HTML validation
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('required', '');
  });

  test('contact form validates email format', async ({ page }) => {
    await page.locator('input[name="name"]').fill('Test User');
    await page.locator('input[name="email"]').fill('invalid-email');
    await page.locator('input[name="subject"]').fill('Test');
    await page.locator('textarea[name="message"]').fill('Test message');

    const submitButton = page.locator('button:has-text("Enviar")').first();
    await submitButton.click();

    // Email input should show validation error
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('contact form handles special characters', async ({ page }) => {
    await page.locator('input[name="name"]').fill('José da Silva');
    await page.locator('input[name="email"]').fill('jose@example.com');
    await page.locator('input[name="subject"]').fill('Dúvida: Como me inscrever?');
    await page.locator('textarea[name="message"]').fill('Olá! Tenho uma dúvida sobre como me inscrever. Aguardo retorno. Obrigado!');

    const submitButton = page.locator('button:has-text("Enviar")').first();
    await submitButton.click();

    // Check for success
    await expect(page.locator('text=Mensagem enviada com sucesso')).toBeVisible({ timeout: 5000 });
  });

  test('contact form shows loading state', async ({ page }) => {
    // Slow down network
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 500);
    });

    await page.locator('input[name="name"]').fill('Test User');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="subject"]').fill('Test');
    await page.locator('textarea[name="message"]').fill('Test message');

    const submitButton = page.locator('button:has-text("Enviar")').first();
    await submitButton.click();

    // Button should show loading state
    await expect(submitButton).toContainText(/Enviando|Carregando/);
  });

  test('contact form clears after successful submission', async ({ page }) => {
    await page.locator('input[name="name"]').fill('Test User');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="subject"]').fill('Test');
    await page.locator('textarea[name="message"]').fill('Test message');

    const submitButton = page.locator('button:has-text("Enviar")').first();
    await submitButton.click();

    // Wait for success message
    await expect(page.locator('text=Mensagem enviada com sucesso')).toBeVisible({ timeout: 5000 });

    // Check if form is cleared
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveValue('');
  });

  test('contact form handles network errors gracefully', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/contact', (route) => route.abort());

    await page.locator('input[name="name"]').fill('Test User');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="subject"]').fill('Test');
    await page.locator('textarea[name="message"]').fill('Test message');

    const submitButton = page.locator('button:has-text("Enviar")').first();
    await submitButton.click();

    // Should show error message
    await expect(page.locator('text=Erro|erro|Failed')).toBeVisible({ timeout: 5000 });
  });
});
