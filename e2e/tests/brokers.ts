import { test } from '../config/base';

test.describe('brokers', () => {
  test('availiable via opening direct url', async ({ brokers }) => {
    const page = await brokers('secondLocal');
    await page.goto();
    await page.is_on_page();
  });


  test('two', async ({ page }) => {
    // ...
  });
});