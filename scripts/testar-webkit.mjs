// Roda auditoria, motion global e SEO no WebKit (motor do Safari). Uso: npm run test:webkit
import { execFileSync } from 'node:child_process';
for (const s of [['scripts/audit.mjs'], ['scripts/motion-test.mjs', 'global'], ['scripts/seo-test.mjs']])
  execFileSync(process.execPath, s, { stdio: 'inherit', env: { ...process.env, MOTOR: 'webkit' } });
