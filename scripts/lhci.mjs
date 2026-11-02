// 用 Playwright 附帶的 Chromium 跑 Lighthouse CI（CI 與本機都不需要另外裝 Chrome）
import { execSync } from 'node:child_process';
import { chromium } from '@playwright/test';

process.env.CHROME_PATH ??= chromium.executablePath();
execSync('npx lhci autorun', { stdio: 'inherit', env: process.env });
