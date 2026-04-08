#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const RESULTS_FILE = path.join(process.cwd(), 'test-results', 'results.json');
const HISTORY_FILE = path.join(process.cwd(), 'custom-report', 'history.json');
const MAX_HISTORY = 20;

function getStatusCounts(tests) {
  const passed = tests.filter((t) => t.status === 'passed').length;
  const failed = tests.filter((t) => t.status === 'failed').length;
  const flaky = tests.filter((t) => t.status === 'flaky').length;
  const skipped = tests.filter((t) => t.status === 'skipped').length;
  const total = tests.length;
  const passRate = total > 0 ? Math.round(((passed + flaky) / total) * 100) : 0;
  return { passed, failed, flaky, skipped, total, passRate };
}

function flattenSuites(suite, inheritedFile = '') {
  const rows = [];
  const file = suite.file || inheritedFile;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      if (test.projectName === 'setup') continue;
      const results = test.results ?? [];
      const lastRes = results[results.length - 1] ?? {};
      const duration = results.reduce((sum, r) => sum + (r.duration ?? 0), 0);
      rows.push({
        file,
        title: spec.title,
        project: test.projectName,
        status: test.status,
        duration,
        retries: Math.max(0, results.length - 1),
      });
    }
  }
  for (const child of suite.suites ?? []) {
    rows.push(...flattenSuites(child, file));
  }
  return rows;
}

// ── Load current results ────────────────────────────────────────────────────
let raw;
try {
  raw = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
} catch {
  console.log('⚠ No test results found, skipping history generation.');
  process.exit(0);
}

const tests = [];
for (const suite of raw.suites ?? []) {
  tests.push(...flattenSuites(suite));
}

const counts = getStatusCounts(tests);
const stats = raw.stats ?? {};
const runDate = stats.startTime
  ? new Date(stats.startTime).toISOString()
  : new Date().toISOString();

const currentRun = {
  date: runDate,
  total: counts.total,
  passed: counts.passed,
  failed: counts.failed,
  flaky: counts.flaky,
  skipped: counts.skipped,
  passRate: counts.passRate,
  duration: stats.duration ?? tests.reduce((s, t) => s + t.duration, 0),
};

// ── Load previous history ────────────────────────────────────────────────────
let history = [];
const ghPagesHistory = path.join(process.cwd(), 'gh-pages', 'report', 'history.json');
const localHistory = path.join(process.cwd(), 'custom-report', 'history.json');

const historySource = fs.existsSync(ghPagesHistory)
  ? ghPagesHistory
  : fs.existsSync(localHistory)
    ? localHistory
    : null;

if (historySource) {
  try {
    history = JSON.parse(fs.readFileSync(historySource, 'utf-8'));
  } catch {
    history = [];
  }
}

// ── Append current run and trim ─────────────────────────────────────────────
history.push(currentRun);
if (history.length > MAX_HISTORY) {
  history = history.slice(history.length - MAX_HISTORY);
}

// ── Write ────────────────────────────────────────────────────────────────────
fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
console.log(`✓ History updated → ${HISTORY_FILE} (${history.length} runs)`);
