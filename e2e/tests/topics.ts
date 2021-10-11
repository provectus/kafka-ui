import { test } from "../config/base";
import { v4 as uuid } from "uuid";

test.describe('[topics]', () => {
  test('topics page opens via direct url', async ({ topics }) => {
    const page = await topics('local');
    await page.goto();
    await page.is_on_page();
  });

  test('created topic appears in UI', async ({ steps, topics }) => {
    test.slow();
    const new_topic_name =  await steps.create_topic();
    const page = await topics("local");
    await page.goto();
    await page.is_on_page();

    await page.reload_till_topic_appears(new_topic_name);
  });

  // test.only("topic created via UI", async ({ new_topic, topics }) => {
  //   const  page = await topics("local");
  //   await page.goto();
  //   await page.is_on_page();
  //   const new_topic_name = 'new-topic-'+uuid();
  //   await page.click_add_topic();

  //   const new_topic_page = await new_topic('local');
  //   await new_topic_page.is_on_page();

  //   // await page.reload_till_topic_appears(new_topic_name);
  // });
});
