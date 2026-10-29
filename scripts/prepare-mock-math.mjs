import fs from 'node:fs/promises';
import path from 'node:path';
// Pin and serve the complete component tree, including dynamically loaded TeX
// extensions and fonts, so mock attempts do not depend on a third-party CDN.
const root=path.resolve('public/vendor/mathjax');
await fs.mkdir(root,{recursive:true});
await fs.cp(path.resolve('node_modules/mathjax/es5'),root,{recursive:true});
await fs.copyFile(path.resolve('node_modules/mathjax/LICENSE'),path.join(root,'LICENSE'));
console.log('Local mock math components prepared.');
