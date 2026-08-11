import { test } from '@playwright/test';
import { loginAsStudent, loginAsTeacher } from './helpers/auth';

const widths = [
  { name: '1280', width: 1280, height: 900 },
  { name: '390', width: 390, height: 844 },
];

test.describe('MVP-G hero real-account capture', () => {
  for (const vp of widths) {
    test(`student hero ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await loginAsStudent(page);
      await page.waitForTimeout(3000);
      await page.screenshot({
        path: `../docs/mvp-g/qa-shots-v23-hero/student_hero-${vp.name}.png`,
        fullPage: true,
      });
    });

    test(`teacher hero ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await loginAsTeacher(page);
      await page.waitForTimeout(3000);
      await page.screenshot({
        path: `../docs/mvp-g/qa-shots-v23-hero/teacher_hero-${vp.name}.png`,
        fullPage: true,
      });
    });
  }
});
