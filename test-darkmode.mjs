import { chromium } from 'playwright';

const email = 'test_debug@todoapp.com';
const password = 'Test1234';

const browser = await chromium.launch({ headless: false, slowMo: 500 });
const page = await browser.newPage();
page.setDefaultTimeout(10000);

try {
  // 로그인
  await page.goto('http://localhost:5173/auth');
  await page.fill('#login-email', email);
  await page.fill('#login-password', password);
  await page.getByRole('button', { name: '로그인' }).last().click();
  await page.waitForURL('http://localhost:5173/', { timeout: 8000 });
  console.log('✅ 로그인 성공');
  await page.screenshot({ path: 'dark-step1-light.png', fullPage: true });

  // 다크모드 토글
  await page.getByRole('button', { name: '다크 모드로 전환' }).click();
  await page.waitForTimeout(1500);
  const theme1 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log('✅ 토글 후 테마:', theme1);
  await page.screenshot({ path: 'dark-step2-dark.png', fullPage: true });

  // 로그아웃 후 재로그인
  await page.getByRole('button', { name: '로그아웃' }).click();
  await page.waitForURL('**/auth');
  console.log('✅ 로그아웃');

  await page.fill('#login-email', email);
  await page.fill('#login-password', password);
  await page.getByRole('button', { name: '로그인' }).last().click();
  await page.waitForURL('http://localhost:5173/', { timeout: 8000 });
  console.log('✅ 재로그인 성공');

  await page.waitForTimeout(500);
  const theme2 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log('✅ 재로그인 후 테마:', theme2);
  await page.screenshot({ path: 'dark-step3-relogin.png', fullPage: true });

  if (theme2 === 'dark') {
    console.log('\n🎉 다크모드 유지 성공! (로그아웃 후 재로그인에도 dark 테마 유지)');
  } else {
    console.log('\n❌ 테마 유지 실패:', theme2);
  }

  await page.waitForTimeout(2000);
} catch (err) {
  console.error('❌ 오류:', err.message);
  await page.screenshot({ path: 'dark-error.png', fullPage: true });
} finally {
  await browser.close();
}
