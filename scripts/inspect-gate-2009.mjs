// Run the generic inspection first; it never overwrites an existing book baseline.
process.argv[2]='2009';
await import('./inspect-year-paper.mjs');
