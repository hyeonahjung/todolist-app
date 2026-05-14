import { chromium } from 'playwright';

const email = `ui_test_${Date.now()}@todoapp.com`;
const password = 'Test1234';
const name = '테스트유저';

const browser = await chromium.launch({ headless: false, slowMo: 400 });
const page = await browser.newPage();
page.setDefaultTimeout(10000);

try {
  // ── 1. 초기 접속 ──
  await page.goto('http://localhost:5173');
  await page.waitForURL('**/auth');
  console.log('✅ 1. 페이지 로드 →', page.url());

  // ── 2. 회원가입 탭 클릭 ──
  await page.getByRole('button', { name: '회원가입 탭' }).click();
  await page.waitForSelector('#reg-name');
  console.log('✅ 2. 회원가입 탭 전환');

  // ── 3. 회원가입 폼 입력 ──
  await page.fill('#reg-name', name);
  await page.fill('#reg-email', email);
  await page.fill('#reg-password', password);
  console.log(`✅ 3. 입력 완료 — 이름: ${name} / 이메일: ${email}`);

  // ── 4. 가입하기 ──
  await page.getByRole('button', { name: '가입하기' }).click();
  console.log('✅ 4. 가입하기 클릭 → API 요청 중...');

  // ── 5. 회원가입 성공 토스트 대기 ──
  await page.waitForSelector('text=회원가입이 완료되었습니다.', { timeout: 8000 });
  console.log('✅ 5. 회원가입 성공 토스트 확인');
  await page.screenshot({ path: 'step5-register-success.png' });

  // ── 6. 로그인 탭으로 전환 ──
  await page.getByRole('button', { name: '로그인 탭' }).click();
  await page.waitForSelector('#login-email');
  console.log('✅ 6. 로그인 탭 전환');

  // ── 7. 로그인 폼 입력 ──
  await page.fill('#login-email', email);
  await page.fill('#login-password', password);
  console.log('✅ 7. 로그인 정보 입력');
  await page.screenshot({ path: 'step7-login-form.png' });

  // ── 8. 로그인 ──
  await page.getByRole('button', { name: '로그인' }).last().click();
  console.log('✅ 8. 로그인 버튼 클릭');

  // ── 9. 메인 페이지 이동 대기 ──
  await page.waitForURL('http://localhost:5173/', { timeout: 10000 });
  console.log('✅ 9. 로그인 성공! 메인 화면 →', page.url());

  await page.screenshot({ path: 'step9-main.png', fullPage: true });
  console.log('\n🎉 회원가입 + 로그인 전체 흐름 성공!');

  await page.waitForTimeout(2000);
} catch (err) {
  console.error('\n❌ 오류:', err.message);
  await page.screenshot({ path: 'test-error.png', fullPage: true });
  const alerts = await page.getByRole('alert').allTextContents();
  if (alerts.length) console.log('📋 알림 메시지:', alerts);
} finally {
  await browser.close();
}
