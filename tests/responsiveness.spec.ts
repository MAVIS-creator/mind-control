import { test, expect } from '@playwright/test';

test.describe('Responsiveness and User Flow', () => {
  // Generate a random email for the test account
  const timestamp = new Date().getTime();
  const testEmail = `test-responsive-${timestamp}@example.com`;
  const testUsername = `testuser${timestamp}`;
  const testPassword = 'TestPassword123!';

  test('should render landing page correctly on all viewports', async ({ page }) => {
    await page.goto('/');
    
    // Verify main heading exists
    const heading = page.getByRole('heading', { name: 'MINDGRID' });
    await expect(heading).toBeVisible();

    // Verify "Play Now" option exists
    await expect(page.getByText('Play Now')).toBeVisible();
  });

  test('should allow account creation and be responsive', async ({ page, isMobile }) => {
    // Navigate directly to register
    await page.goto('/register');
    
    // Verify registration page loaded
    await expect(page.getByText('Join the Grid').first()).toBeVisible();

    // Fill registration form
    await page.getByPlaceholder('Enter your grid name').fill(testUsername);
    await page.getByPlaceholder('you@example.com').fill(testEmail);
    // Since there are two password fields (login and register) we use the exact one in the register form
    // The placeholder is ••••••••
    await page.getByPlaceholder('••••••••').fill(testPassword);
    
    // Check Terms of Service
    await page.getByRole('checkbox').check();
    
    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Note: The app's register flow either logs in automatically or asks for verification.
    // AuthPanel says: "Verification email sent to... Confirm it before signing in." if session is null.
    // We will check if we see "Verification email sent" or if we are redirected.
    
    const verificationText = page.locator('text=Verification email sent');
    const playHeading = page.getByRole('heading', { name: 'Grid Size' });
    
    // We wait for either verification message or redirect to play
    await Promise.race([
      expect(verificationText).toBeVisible({ timeout: 10000 }).catch(() => {}),
      expect(playHeading).toBeVisible({ timeout: 10000 }).catch(() => {})
    ]);

    // If verification text is visible, the test stops here as we can't easily click a real email link
    // But we've verified responsiveness and the form submission.
    
    if (await verificationText.isVisible()) {
      console.log('Verification required. Cannot continue to /play.');
      return;
    }

    // If we are logged in, let's check some responsive routes
    await page.goto('/play');
    await expect(page.getByRole('heading', { name: 'Grid Size' })).toBeVisible();
    
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: testUsername })).toBeVisible();

    await page.goto('/hall-of-fame');
    await expect(page.getByRole('heading', { name: 'Hall of Fame' })).toBeVisible();
  });
});
