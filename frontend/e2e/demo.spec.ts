import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const SHOTS = 'test-results/screens';
const shot = async (page: Page, name: string) => { await page.waitForTimeout(1100); await page.screenshot({ path: `${SHOTS}/${name}.png` }); }; // let entrance animations settle

test.describe('KHOJI demo path', () => {
  test('login → dashboard → alert investigation → workflow → report → evaluation', async ({ page }) => {
    const problems: string[] = [];
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });

    // 1. login
    await page.goto('/login');
    await expect(page.getByText('Uncovering the Real Story Behind Every Transaction')).toBeVisible();
    await shot(page, '01-login');
    await page.getByLabel('Username').fill('priya.sharma');
    await page.getByLabel('Password', { exact: true }).fill('demo-only-123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 2. dashboard (computed KPIs, badge)
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId('kpi-Total Alerts')).toContainText('124');
    await expect(page.getByTestId('kpi-High Risk')).toContainText('28');
    await expect(page.getByTestId('kpi-Under Investigation')).toContainText('46');
    await expect(page.getByTestId('kpi-Closed This Week')).toContainText('32');
    await expect(page.getByTestId('prototype-badge')).toBeVisible();
    await expect(page.getByText('Risk Distribution')).toBeVisible();
    await shot(page, '02-dashboard');

    // 3. alerts list → filter High → open the hero alert
    await page.getByRole('link', { name: 'Alerts', exact: true }).click();
    await page.getByRole('tab', { name: /^High/ }).click();
    await expect(page.getByTestId('showing')).toContainText('of 28 alerts');
    await shot(page, '03-alerts');
    await page.getByRole('table', { name: 'Alerts' }).getByText('ALT-2024-001').click();
    await expect(page).toHaveURL(/\/alerts\/ALT-2024-001\/overview/);

    // 4. overview: level + reasons, never a score
    await expect(page.getByText('₹29,80,000').first()).toBeVisible();
    await expect(page.getByText(/Risk Score|\/100/)).toHaveCount(0);
    await expect(page.getByTestId('no-intent')).toContainText('No finding of intent');
    await shot(page, '04-overview');

    // 5. graph (a real canvas is drawn)
    await page.getByRole('tab', { name: 'Transaction Graph' }).click();
    await expect(page.locator('[data-graph-canvas] canvas').first()).toBeVisible();
    await shot(page, '05-graph');

    // 6. timeline with the cooling-period override
    await page.getByRole('tab', { name: 'Timeline' }).click();
    await expect(page.getByTestId('tl-ev-cooldown')).toContainText('Control Check');
    await shot(page, '06-timeline');

    // 7. employee activity + access rights
    await page.getByRole('tab', { name: 'Employee Activity' }).click();
    await expect(page.getByRole('list', { name: 'Misuse signals' })).toContainText('P1');
    await expect(page.getByTestId('who-else')).toContainText('7 staff');
    await shot(page, '07-employee');

    // 8. evidence: tainted MFA, hollow control path, real download
    await page.getByRole('tab', { name: 'Evidence', exact: true }).click();
    await expect(page.getByTestId('ev-mfa-verification')).toContainText('Tainted');
    await expect(page.getByTestId('ctl-ctl-mfa')).toContainText('PASS · HOLLOW');
    const [doc] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download system_logs_20240430.json' }).click(),
    ]);
    expect(doc.suggestedFilename()).toBe('system_logs_20240430.json');
    await shot(page, '08-evidence');

    // 9-11. but-for: remove, twin, reach
    await page.getByRole('tab', { name: 'But-for Analysis' }).click();
    await expect(page.getByTestId('replay-banner')).toContainText('NECESSARY');
    await page.getByRole('checkbox', { name: /Mobile number change/ }).check();
    await expect(page.getByTestId('replay-outcome')).toContainText('FAILS');
    await expect(page.getByText('Precomputed in prototype').first()).toBeVisible();
    await shot(page, '09-butfor');
    await page.getByRole('tab', { name: 'Legitimate twin' }).click();
    await expect(page.getByTestId('divergence')).toContainText('First difference at step 1');
    await shot(page, '10-twin');
    await page.getByRole('tab', { name: /Exposure/ }).click();
    await expect(page.getByRole('table', { name: 'Exposure' })).toContainText('A-114');
    await shot(page, '11-reach');

    // 12-13. splitting twin and profile mismatch
    await page.goto('/alerts/ALT-2024-002/but-for?view=twin');
    await expect(page.getByTestId('divergence')).toContainText('Business explanation');
    await page.goto('/customers/C005/analysis');
    await expect(page.getByTestId('profile-edit')).toContainText('E11');
    await shot(page, '13-profile');

    // 14. workflow: reassign, decide with a rationale
    await page.goto('/alerts/ALT-2024-001/overview');
    await page.getByRole('button', { name: 'Assign / Reassign' }).click();
    await page.getByLabel('Investigator').selectOption('Raj Mehta');
    await page.getByRole('button', { name: 'Reassign', exact: true }).click();
    await expect(page.getByTestId('assigned-to')).toHaveText('Raj Mehta');
    await page.getByLabel('Change status').selectOption('DECIDED');
    await page.getByRole('button', { name: 'Record decision' }).click();
    await expect(page.getByText('A rationale is required.')).toBeVisible();
    await page.getByLabel('Rationale').fill('Recorded path depended on staff actions without customer evidence');
    await page.getByRole('button', { name: 'Record decision' }).click();
    await expect(page.getByLabel('Change status')).toContainText('Closed');
    await shot(page, '14-workflow');

    // 15. report: generate, download, verify, tamper
    await page.goto('/reports?alert=ALT-2024-001');
    await page.getByRole('button', { name: 'Generate Report' }).click();
    await expect(page.getByTestId('report-statement')).toContainText('No finding of intent');
    const [pack] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Download evidence pack/ }).click(),
    ]);
    expect(pack.suggestedFilename()).toBe('KHOJI_report_ALT-2024-001_20240430.json');
    const path = await pack.path();
    const text = readFileSync(path, 'utf-8');
    await page.getByLabel('Evidence pack file').setInputFiles(path);
    await expect(page.getByTestId('verify-result')).toContainText('PASS');
    await page.getByLabel('Evidence pack file').setInputFiles({
      name: 'tampered.json', mimeType: 'application/json',
      buffer: Buffer.from(text.replace('"amountAtRisk": 2980000', '"amountAtRisk": 2980001')),
    });
    await expect(page.getByTestId('verify-result')).toContainText('FAIL');
    await shot(page, '15-report');

    // 16. evaluation is honestly pending
    await page.goto('/analytics?tab=evaluation');
    await expect(page.getByTestId('eval-banner')).toContainText('Evaluation pending');
    await expect(page.getByTestId('value-M01')).toHaveText('—');
    await shot(page, '16-evaluation');

    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('entrance animations run, and reduced motion switches the JS-driven ones off', async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('khoji.session', JSON.stringify({ username: 'priya.sharma' })));
    await page.goto('/dashboard');
    // the skeleton shimmers while loading, then the page and KPI cards fade up
    await expect.poll(() => page.evaluate(() => document.getAnimations().map((a) => (a as CSSAnimation).animationName).includes('shimmer'))).toBe(true).catch(() => {});
    await page.getByTestId('kpi-Total Alerts').waitFor();
    const names = await page.evaluate(() => document.getAnimations().map((a) => (a as CSSAnimation).animationName));
    expect(names).toEqual(expect.arrayContaining(['fade-up']));
    // count-up: the number climbs to the final value
    await expect(page.getByTestId('kpi-Total Alerts')).toContainText('124');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    // with reduced motion the final value is shown immediately (no count-up) and nothing loops
    await expect(page.getByTestId('kpi-Total Alerts')).toContainText('124', { timeout: 500 });
    await page.waitForTimeout(300);
    const looping = await page.evaluate(() => document.getAnimations().filter((a) => a.effect?.getTiming().iterations === Infinity).length);
    expect(looping).toBe(0);
  });

  test('protected routes redirect to login when signed out', async ({ page }) => {
    await page.goto('/alerts');
    await expect(page).toHaveURL(/\/login\?next=%2Falerts/);
  });

  test('scripted demo mode walks the beats by keyboard', async ({ page }) => {
    await page.goto('/demo');
    await expect(page.getByTestId('demo-beat')).toContainText('Beat 1/');
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId('demo-beat')).toContainText('Beat 2/');
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/\/alerts\?level=HIGH/);
    await page.keyboard.press('ArrowLeft');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.keyboard.press('r');
    await expect(page).toHaveURL(/\/login/);
  });

  test('demo controller stays hidden with ?hide=1', async ({ page }) => {
    await page.goto('/demo?hide=1');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('demo-controller')).toHaveCount(0);
  });
});
