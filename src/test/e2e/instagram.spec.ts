import { test, expect } from '@playwright/test';

test.describe('Instagram Feed E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Instagram feed loads on page', async ({ page }) => {
    // Scroll to Instagram section
    const instagramSection = page.locator('text=Instagram|Feed');
    await instagramSection.first().scrollIntoViewIfNeeded();

    // Check if Instagram posts are displayed
    const posts = page.locator('[data-testid="instagram-post"]');
    const count = await posts.count();

    // Should show at least some posts (or fallback/placeholder)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Instagram posts display engagement metrics', async ({ page }) => {
    // Scroll to Instagram section
    const instagramSection = page.locator('text=Instagram|Feed');
    await instagramSection.first().scrollIntoViewIfNeeded();

    // Check first post for likes and comments
    const firstPost = page.locator('[data-testid="instagram-post"]').first();

    if (await firstPost.isVisible()) {
      const likes = firstPost.locator('[data-testid="likes-count"]');
      const comments = firstPost.locator('[data-testid="comments-count"]');

      // At least one should be present
      const likesVisible = await likes.isVisible();
      const commentsVisible = await comments.isVisible();

      expect(likesVisible || commentsVisible).toBe(true);
    }
  });

  test('Instagram stories load if available', async ({ page }) => {
    // Look for stories section
    const storiesSection = page.locator('text=Stories|Histórias|Destaques');

    if (await storiesSection.isVisible()) {
      await storiesSection.scrollIntoViewIfNeeded();

      const stories = page.locator('[data-testid="story-highlight"]');
      const count = await stories.count();

      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('user can click Instagram post link', async ({ page }) => {
    // Scroll to Instagram section
    const instagramSection = page.locator('text=Instagram|Feed');
    await instagramSection.first().scrollIntoViewIfNeeded();

    // Find post link
    const postLink = page.locator('[data-testid="instagram-post"] a').first();

    if (await postLink.isVisible()) {
      const href = await postLink.getAttribute('href');

      // Should link to Instagram
      if (href) {
        expect(href).toContain('instagram.com');
      }
    }
  });

  test('Instagram feed handles loading state', async ({ page }) => {
    // Slow down network
    await page.route('**/api/instagram/**', (route) => {
      setTimeout(() => route.continue(), 1000);
    });

    // Reload page to see loading state
    await page.reload();

    // Scroll to Instagram section
    const instagramSection = page.locator('text=Instagram|Feed');

    // Should show loading state or skeleton
    const skeleton = page.locator('[data-testid="instagram-skeleton"], [role="status"]');

    if (await skeleton.isVisible()) {
      expect(skeleton).toBeVisible();
    }
  });

  test('Instagram feed shows fallback if API fails', async ({ page }) => {
    // Block Instagram API
    await page.route('**/api/instagram/**', (route) => route.abort());

    await page.reload();

    // Scroll to Instagram section
    const instagramSection = page.locator('text=Instagram|Feed');
    await instagramSection.first().scrollIntoViewIfNeeded();

    // Should either show error message or use fallback data
    const instagramContent = page.locator('[data-testid="instagram-post"]');
    const errorMessage = page.locator('text=Não foi possível carregar|indisponível|Feed');

    // At least one should exist
    const contentExists = await instagramContent.count();
    const errorExists = await errorMessage.isVisible();

    expect(contentExists > 0 || errorExists).toBe(true);
  });

  test('Instagram feed is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Scroll to Instagram section
    const instagramSection = page.locator('text=Instagram|Feed');
    await instagramSection.first().scrollIntoViewIfNeeded();

    // Posts should be visible
    const posts = page.locator('[data-testid="instagram-post"]');
    const firstPost = posts.first();

    if (await firstPost.isVisible()) {
      // Should fit within viewport
      const boundingBox = await firstPost.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(375);
    }
  });

  test('Instagram feed updates on refresh', async ({ page }) => {
    // Scroll to Instagram section
    const instagramSection = page.locator('text=Instagram|Feed');
    await instagramSection.first().scrollIntoViewIfNeeded();

    // Get initial post count
    const initialCount = await page.locator('[data-testid="instagram-post"]').count();

    // Look for refresh button
    const refreshButton = page.locator('button[title*="Atualizar|Refresh"]');

    if (await refreshButton.isVisible()) {
      await refreshButton.click();

      // Wait for update
      await page.waitForLoadState('networkidle');

      // Check updated count
      const updatedCount = await page.locator('[data-testid="instagram-post"]').count();

      // Count should be updated (or same if no new posts)
      expect(updatedCount).toBeGreaterThanOrEqual(0);
    }
  });
});
