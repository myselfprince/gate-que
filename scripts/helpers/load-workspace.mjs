export async function loadWorkspaceQuestions(page, count = 'all') {
  await page.waitForSelector('#workspace-question-limit');
  await page.select('#workspace-question-limit', String(count));
  await page.click('#workspace-load-database');
  await page.waitForFunction(() => [...document.querySelectorAll('[role="status"]')]
    .some(node => node.textContent.includes('database questions loaded')));
}
