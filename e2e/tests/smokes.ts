import { test } from '../config/base';
test('basic test', async ({dashboard}) => {
  await dashboard.goto();
  await dashboard.is_on_page();
});
