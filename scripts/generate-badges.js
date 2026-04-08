#!/usr/bin/env node
'use strict';

/**
 * Generates badges.json — a compact snapshot of the latest test run.
 * Consumed by the README.md shields.io dynamic badge and by any external
 * tooling that wants a quick API-style view of the last run.
 *
 * Output: custom-report/badges.json
 */

const fs = require('fs');
const path = require('path');

const RESULTS_FILE = path.join(process.cwd(), 'test-results', 'results.json');
const OUTPUT_FILE = path.join(process.cwd(), 'custom-report', 'badges.json');

// ── Helpers (mirrors generate-report.js) ──────────────────────────────────────

function getModule(file) {
  if (!file) return 'Other';
  if (file.includes('/auth/') || file.includes('auth.')) return 'Auth';
  if (file.includes('/pim/')) return 'PIM';
  if (file.includes('/leave/')) return 'Leave';
  if (file.includes('/recruitment/')) return 'Recruitment';
  return 'Other';
}

function getType(project) {
  if (project === 'api') return 'API';
  if (project === 'e2e') return 'E2E';
  return project ?? 'Unknown';
}

// ── Load results ──────────────────────────────────────────────────────────────

let raw;
try {
  raw = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
} catch {
  console.log('⚠ No test results found, skipping badge generation.');
  process.exit(0);
}

const tests = [];
for (const suite of raw.suites ?? []) {
  const file = suite.file || '';
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      if (test.projectName === 'setup') continue;
      tests.push({
        file,
        module: getModule(file),
        type: getType(test.projectName),
        status: test.status,
      });
    }
  }
  for (const child of suite.suites ?? []) {
    // flatten recursively
    (function flatten(s) {
      const f = s.file || file;
      for (const sp of s.specs ?? []) {
        for (const t of sp.tests ?? []) {
          if (t.projectName === 'setup') continue;
          tests.push({
            file: f,
            module: getModule(f),
            type: getType(t.projectName),
            status: t.status,
          });
        }
      }
      for (const c of s.suites ?? []) flatten(c);
    })(child);
  }
}

const total = tests.length;
const passed = tests.filter((t) => t.status === 'expected').length;
const failed = tests.filter((t) => t.status === 'unexpected').length;
const flaky = tests.filter((t) => t.status === 'flaky').length;
const skipped = tests.filter((t) => t.status === 'skipped').length;
const passRate = total > 0 ? Math.round(((passed + flaky) / total) * 100) : 0;

const stats = raw.stats ?? {};
const runDate = stats.startTime
  ? new Date(stats.startTime).toISOString()
  : new Date().toISOString();

const modules = ['Auth', 'PIM', 'Leave', 'Recruitment'];
const moduleBreakdown = modules.map((m) => {
  const mt = tests.filter((t) => t.module === m);
  return {
    name: m,
    total: mt.length,
    passed: mt.filter((t) => t.status === 'expected' || t.status === 'flaky').length,
    failed: mt.filter((t) => t.status === 'unexpected').length,
    e2e: mt.filter((t) => t.type === 'E2E').length,
    api: mt.filter((t) => t.type === 'API').length,
  };
});

const badges = {
  schemaVersion: 1,
  lastRun: runDate,
  summary: {
    total,
    passed,
    failed,
    flaky,
    skipped,
    passRate,
  },
  byType: {
    e2e: tests.filter((t) => t.type === 'E2E').length,
    api: tests.filter((t) => t.type === 'API').length,
  },
  byModule: moduleBreakdown,
};

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(badges, null, 2), 'utf-8');
console.log(`✓ Badges generated → ${OUTPUT_FILE}`);
console.log(
  `  Total: ${total} · Passed: ${passed} · Failed: ${failed} · Flaky: ${flaky} · Pass rate: ${passRate}%`,
);
