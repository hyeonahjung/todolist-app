import { chromium } from 'playwright';

const email = `ui_test_${Date.now()}@todoapp.com`;
const password = 'Test1234';
const name = '테스트유저';

const browser = await chromium.launch({ headless: false, slowMo: 400 });
const page = await browser.newPage();
page.setDefaultTimeout(10000);

// 브라우저 콘솔 로그 캡처
page.on('console', (msg) => console.log(`[브라우저 ${msg.type()}]`, msg.text()));
page.on('pageerror', (err) => console.error('[페이지 에러]', err.message));

// 네트워크 요청 캡처
page.on('request', (req) => {
  if (req.url().includes('localhost:3000')) {
    console.log(`[요청] ${req.method()} ${req.url()}`);
  }
});
page.on('response', (res) => {
  if (res.url().includes('localhost:3000')) {
    console.log(`[응답] ${res.status()} ${res.url()}`);
  }
});

try {
  await page.goto('http://localhost:5173');
  await page.waitForURL('**/auth');
  console.log('✅ 1. 페이지 로드');

  await page.getByRole('button', { name: '회원가입 탭' }).click();
  await page.waitForSelector('#reg-name');
  console.log('✅ 2. 회원가입 탭');

  await page.fill('#reg-name', name);
  await page.fill('#reg-email', email);
  await page.fill('#reg-password', password);
  console.log('✅ 3. 폼 입력 완료');

  // 버튼 클릭 전 상태 확인
  const btn = page.getByRole('button', { name: '가입하기' });
  const isDisabled = await btn.isDisabled();
  console.log('버튼 disabled:', isDisabled);

  await btn.click();
  console.log('✅ 4. 가입하기 클릭');

  // 3초 대기 후 상태 확인
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'debug-after-register.png' });

  // alerts 확인
  const alerts = await page.getByRole('alert').allTextContents();
  console.log('alerts:', alerts);

  // 현재 URL
  console.log('현재 URL:', page.url());

} catch (err) {
  console.error('❌ 오류:', err.message);
  await page.screenshot({ path: 'debug-error.png', fullPage: true });
} finally {
  await browser.close();
}
