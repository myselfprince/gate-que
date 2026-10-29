// Shared selectors for the previous-year test centre's public student flow.
export async function selectYearPaper(page, year) {
  await page.waitForSelector('[aria-label="Previous-year papers"] button');
  await page.evaluate(value => {
    const select = [...document.querySelectorAll('label')].find(label => label.textContent.startsWith('Year')).querySelector('select');
    select.value = String(value); select.dispatchEvent(new Event('change', { bubbles: true }));
  }, year);
  await page.waitForFunction(value => document.querySelector('[aria-label="Selected test details"] h2')?.textContent === `GATE CS ${value}`, {}, year);
}

export async function beginSelectedPaper(page) {
  await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent === 'Read instructions & continue →').click());
  await page.waitForSelector('dialog[open]');
  await page.click('dialog[open] input[type=checkbox]');
  await page.evaluate(() => [...document.querySelectorAll('dialog button')].find(button => button.textContent === 'Begin test →').click());
}

export async function reviewQuestion(page, number) {
  await page.click(`[aria-label^="Review question ${number},"]`);
}

export async function saveSelfAssessment(page) {
  await page.click('[aria-label="Question review"] form button');
}
