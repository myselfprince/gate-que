// Read-only: print every chapter's answer coverage (the /gatetopicanswers page shows the same).
//   node scripts/topic-answers/coverage.mjs
import { coverageLine, databaseLabel, readCoverage, withChapters } from './lib.mjs';

const rows = await withChapters(readCoverage);
console.log(`${rows.length} chapters · ${rows.filter(row => row.complete).length} fully answered · ${databaseLabel()}`);
for (const row of rows) console.log(coverageLine(row));
