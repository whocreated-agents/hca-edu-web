import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Quality Gate Audit & Regression Invariants (BUG-005 & BUG-007)', () => {
  const srcDir = path.resolve(__dirname, '../src');

  function getFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        files.push(...getFiles(full));
      } else if (e.isFile() && (e.name.endsWith('.ts') || e.name.endsWith('.tsx') || e.name.endsWith('.css'))) {
        files.push(full);
      }
    }
    return files;
  }

  it('BUG-005: Zero raw hex values in UI components (only tokens.css and tokens.ts allowed)', () => {
    const files = getFiles(srcDir);
    const hexPattern = /#[0-9a-fA-F]{3,8}\b/g;

    const violations: { file: string; line: number; match: string }[] = [];

    for (const f of files) {
      const rel = path.relative(srcDir, f);
      // Skip the canonical token definition files
      if (rel === 'app/tokens.css' || rel === 'lib/tokens.ts') {
        continue;
      }

      const content = fs.readFileSync(f, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const matches = line.match(hexPattern);
        if (matches) {
          violations.push({
            file: rel,
            line: idx + 1,
            match: matches.join(', '),
          });
        }
      });
    }

    expect(
      violations,
      `Found raw hex colors violating DESIGN-SPEC-001:\n${violations.map((v) => `  ${v.file}:${v.line} -> ${v.match}`).join('\n')}`
    ).toEqual([]);
  });

  it('BUG-007: Zero hardcoded academic session years (2026-27, 2027-28, 2027–28) in UI fallbacks', () => {
    const files = getFiles(srcDir);
    const hardcodedYearPatterns = [
      /['"`]2026-27['"`]/,
      /['"`]2027-28['"`]/,
      /['"`]2027–28['"`]/,
      /parts\[0\]\s*\?\?\s*2026/,
    ];

    const violations: { file: string; line: number; text: string }[] = [];

    for (const f of files) {
      const rel = path.relative(srcDir, f);
      const content = fs.readFileSync(f, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        for (const pattern of hardcodedYearPatterns) {
          if (pattern.test(line)) {
            violations.push({
              file: rel,
              line: idx + 1,
              text: line.trim(),
            });
          }
        }
      });
    }

    expect(
      violations,
      `Found hardcoded academic years violating dynamic session invariant:\n${violations.map((v) => `  ${v.file}:${v.line} -> ${v.text}`).join('\n')}`
    ).toEqual([]);
  });

  it('BUG-010: CMS content page contains zero silent catch blocks and zero hardcoded phone fallbacks', () => {
    const contentPage = path.join(srcDir, 'app/admin/content/page.tsx');
    const content = fs.readFileSync(contentPage, 'utf8');

    // Assert no silent/empty catch blocks
    expect(content).not.toMatch(/catch\s*\{\s*\/\*\s*ignore\s*\*\/\s*\}/);
    expect(content).not.toMatch(/catch\s*\{\s*\}/);

    // Assert no hardcoded phone fallbacks
    expect(content).not.toContain("'+91 94605 40956'");
  });
});
