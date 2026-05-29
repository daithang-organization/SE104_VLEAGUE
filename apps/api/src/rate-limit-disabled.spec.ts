import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const sourceRoot = __dirname;
const apiRoot = join(sourceRoot, '..');

const forbiddenSourcePatterns = [
  /@nestjs\/throttler/,
  /\bThrottle\b/,
  /\bSkipThrottle\b/,
  /\bThrottlerGuard\b/,
  /\bThrottlerModule\b/,
  /\bApiTooManyRequestsResponse\b/,
  /Rate limit:/i,
];

function collectProductionTypeScriptFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return collectProductionTypeScriptFiles(fullPath);
    }

    if (!entry.endsWith('.ts') || entry.endsWith('.spec.ts')) {
      return [];
    }

    return [fullPath];
  });
}

describe('rate limiting disabled for testing', () => {
  it('does not leave throttler decorators or Swagger rate-limit docs in backend source', () => {
    const offenders = collectProductionTypeScriptFiles(sourceRoot).flatMap(
      (file) => {
        const content = readFileSync(file, 'utf8');
        const matchedPatterns = forbiddenSourcePatterns
          .filter((pattern) => pattern.test(content))
          .map((pattern) => pattern.source);

        return matchedPatterns.length
          ? [`${relative(sourceRoot, file)}: ${matchedPatterns.join(', ')}`]
          : [];
      },
    );

    expect(offenders).toEqual([]);
  });

  it('does not keep the Nest throttler package in backend dependencies', () => {
    const packageJson = readFileSync(join(apiRoot, 'package.json'), 'utf8');

    expect(packageJson).not.toContain('@nestjs/throttler');
  });
});
