#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const RESULTS_FILE = path.join(process.cwd(), 'test-results', 'results.json');
const OUTPUT_DIR = path.join(process.cwd(), 'custom-report');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'index.html');

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(ms) {
  if (!ms || ms < 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}m ${s}s`;
}

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
  if (project === 'setup') return 'Setup';
  return project ?? 'Unknown';
}

// Maps Playwright test.status to display values
function mapStatus(status) {
  switch (status) {
    case 'expected':
      return 'passed';
    case 'unexpected':
      return 'failed';
    case 'flaky':
      return 'flaky';
    case 'skipped':
      return 'skipped';
    default:
      return status ?? 'unknown';
  }
}

// ── Flatten Playwright JSON structure ─────────────────────────────────────────

function flattenSuite(suite, inheritedFile = '') {
  const rows = [];
  const file = suite.file || inheritedFile;

  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      if (test.projectName === 'setup') continue; // skip auth setup

      const results = test.results ?? [];
      const lastRes = results[results.length - 1] ?? {};
      const duration = results.reduce((sum, r) => sum + (r.duration ?? 0), 0);

      // Extract trace attachment — generated on first retry, so search ALL results,
      // not just lastRes (which may be a later retry without a trace).
      let tracePath = null;
      for (const r of results) {
        const traceAtt = (r.attachments ?? []).find((a) => a.name === 'trace');
        if (traceAtt && traceAtt.path) {
          const idx = traceAtt.path.indexOf('test-results/');
          if (idx !== -1) {
            tracePath = traceAtt.path.slice(idx);
            break;
          }
        }
      }

      rows.push({
        file: file,
        githubUrl: `https://github.com/hlperez07/hlperez-portfolio/blob/main/${file}`,
        title: spec.title,
        project: test.projectName,
        status: mapStatus(test.status),
        duration,
        retries: Math.max(0, results.length - 1),
        module: getModule(file),
        type: getType(test.projectName),
        tracePath, // null when no trace exists (local runs / passed tests)
      });
    }
  }

  for (const child of suite.suites ?? []) {
    rows.push(...flattenSuite(child, file));
  }

  return rows;
}

// ── Load & process data ───────────────────────────────────────────────────────

let raw;
try {
  raw = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
} catch (e) {
  console.error(`Could not read ${RESULTS_FILE}: ${e.message}`);
  process.exit(1);
}

const tests = [];
for (const suite of raw.suites ?? []) {
  tests.push(...flattenSuite(suite));
}

const rawStats = raw.stats ?? {};
const total = tests.length;
const passed = tests.filter((t) => t.status === 'passed').length;
const failed = tests.filter((t) => t.status === 'failed').length;
const flaky = tests.filter((t) => t.status === 'flaky').length;
const skipped = tests.filter((t) => t.status === 'skipped').length;
const passRate = total > 0 ? Math.round(((passed + flaky) / total) * 100) : 0;
const totalDur = rawStats.duration ?? tests.reduce((s, t) => s + t.duration, 0);

const MODULES = ['Auth', 'PIM', 'Leave', 'Recruitment'];
const moduleBreakdown = MODULES.map((m) => {
  const mt = tests.filter((t) => t.module === m);
  return {
    name: m,
    total: mt.length,
    passed: mt.filter((t) => t.status === 'passed' || t.status === 'flaky').length,
    failed: mt.filter((t) => t.status === 'failed').length,
    e2e: mt.filter((t) => t.type === 'E2E').length,
    api: mt.filter((t) => t.type === 'API').length,
  };
});

const runDate = rawStats.startTime
  ? new Date(rawStats.startTime).toUTCString().replace('GMT', 'UTC')
  : new Date().toUTCString().replace('GMT', 'UTC');

// ── Build HTML ────────────────────────────────────────────────────────────────

// Base URL for the GitHub Pages traces directory.
// Set PAGES_BASE_URL in CI to the site root (e.g. https://hlperez07.github.io/hlperez-portfolio).
const TRACES_BASE = process.env.PAGES_BASE_URL
  ? `${process.env.PAGES_BASE_URL.replace(/\/$/, '')}/traces`
  : 'https://hlperez07.github.io/hlperez-portfolio/traces';

const DATA_JSON = JSON.stringify({
  tests,
  moduleBreakdown,
  tracesBase: TRACES_BASE,
  stats: {
    total,
    passed,
    failed,
    flaky,
    skipped,
    passRate,
    duration: totalDur,
    runDate,
  },
});

const html = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Henry Perez — QA Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    :root {
      --bg:          #0d1117;
      --surface:     #161b22;
      --surface-2:   #1c2128;
      --border:      #21262d;
      --text:        #e6edf3;
      --text-2:      #8b949e;
      --text-3:      #484f58;
      --accent:      #ff6b35;
      --accent-dim:  color-mix(in srgb, var(--accent) 12%, transparent);
      --blue:        #58a6ff;
      --green:       #3fb950;
      --yellow:      #d29922;
      --red:         #f85149;
      --r:           10px;
      --r-lg:        16px;
      --transition:  200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; font-size: clamp(14px, 1vw, 16px); }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', system-ui, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
    }
    code, .mono { font-family: 'JetBrains Mono', monospace; }

    /* ── Nav ─────────────────────────────────────────────────────────────── */
    .nav {
      position: sticky;
      top: 0;
      z-index: 50;
      height: 56px;
      display: flex;
      align-items: center;
      backdrop-filter: blur(20px);
      background: color-mix(in srgb, var(--bg) 85%, transparent);
      border-bottom: 1px solid var(--border);
    }
    .nav-inner {
      width: min(1200px, 100% - 3rem);
      margin-inline: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text);
      text-decoration: none;
    }
    .nav-brand-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 8px var(--green);
      animation: blink 2s ease-in-out infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
    .nav-meta { font-size: 0.78rem; color: var(--text-3); font-family: 'JetBrains Mono', monospace; }
    .nav-back {
      font-size: 0.82rem;
      color: var(--text-2);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: color var(--transition);
    }
    .nav-back:hover { color: var(--accent); }

    /* ── Layout ──────────────────────────────────────────────────────────── */
    .container { width: min(1200px, 100% - 3rem); margin-inline: auto; }
    .section { padding-block: clamp(2rem, 5vw, 3.5rem); }
    .section-title {
      font-size: clamp(1rem, 2vw, 1.2rem);
      font-weight: 600;
      color: var(--text);
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .section-title::before {
      content: '';
      width: 3px; height: 1.1em;
      background: var(--accent);
      border-radius: 2px;
      display: block;
    }

    /* ── Stats strip ─────────────────────────────────────────────────────── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 1rem;
    }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 500px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      padding: 1.25rem 1rem;
      text-align: center;
      position: relative;
      overflow: hidden;
      transition: border-color var(--transition), box-shadow var(--transition);
      cursor: default;
    }
    .stat-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at var(--mx,50%) var(--my,50%), var(--accent-dim), transparent 65%);
      opacity: 0;
      transition: opacity 0.4s;
      pointer-events: none;
    }
    .stat-card:hover { border-color: color-mix(in srgb,var(--accent) 35%,var(--border)); box-shadow: 0 4px 24px var(--accent-dim); }
    .stat-card:hover::before { opacity: 1; }
    .stat-icon { font-size: 1.2rem; margin-bottom: 0.6rem; }
    .stat-value {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 1;
      margin-bottom: 0.35rem;
      font-variant-numeric: tabular-nums;
    }
    .stat-label { font-size: 0.7rem; font-weight: 500; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.06em; }
    .c-green  { color: var(--green); }
    .c-red    { color: var(--red); }
    .c-yellow { color: var(--yellow); }
    .c-blue   { color: var(--blue); }
    .c-accent { color: var(--accent); }
    .c-text   { color: var(--text); }

    /* ── Charts ──────────────────────────────────────────────────────────── */
    .charts-grid {
      display: grid;
      grid-template-columns: 280px 1fr 260px;
      gap: 1.25rem;
      align-items: stretch;
    }
    @media (max-width: 960px) { .charts-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 560px) { .charts-grid { grid-template-columns: 1fr; } }

    .trend-loading {
      font-size: 0.78rem;
      color: var(--text-3);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    .trend-empty {
      font-size: 0.78rem;
      color: var(--text-3);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .chart-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }
    .chart-card-title {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-2);
      margin-bottom: 1.25rem;
    }
    .chart-wrap { position: relative; flex: 1; min-height: 180px; }

    /* ── Filters ─────────────────────────────────────────────────────────── */
    .filters-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }
    .filter-chip {
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 500;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-2);
      cursor: pointer;
      transition: all var(--transition);
      user-select: none;
    }
    .filter-chip:hover { border-color: var(--accent); color: var(--text); }
    .filter-chip.active { background: var(--accent); border-color: var(--accent); color: #fff; }
    .filter-chip.chip-e2e.active   { background: var(--accent); border-color: var(--accent); }
    .filter-chip.chip-api.active   { background: var(--blue); border-color: var(--blue); }
    .filter-chip.chip-pass.active  { background: var(--green); border-color: var(--green); }
    .filter-chip.chip-fail.active  { background: var(--red); border-color: var(--red); }
    .filter-chip.chip-flaky.active { background: var(--yellow); border-color: var(--yellow); color: #000; }

    .search-wrap { margin-left: auto; position: relative; }
    .search-input {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r);
      padding: 0.35rem 0.85rem 0.35rem 2rem;
      font-size: 0.82rem;
      color: var(--text);
      font-family: inherit;
      width: 220px;
      transition: border-color var(--transition);
      outline: none;
    }
    .search-input:focus { border-color: var(--accent); }
    .search-icon {
      position: absolute;
      left: 0.65rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-3);
      font-size: 0.85rem;
      pointer-events: none;
    }

    /* ── Table ───────────────────────────────────────────────────────────── */
    .table-wrap {
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      overflow: hidden;
    }
    .results-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .results-table th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-2);
      background: var(--surface-2);
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      transition: color var(--transition);
    }
    .results-table th:hover { color: var(--text); }
    .results-table th.sorted { color: var(--accent); }
    .results-table th .sort-arrow { margin-left: 4px; opacity: 0.5; font-size: 0.65rem; }
    .results-table th.sorted .sort-arrow { opacity: 1; }

    .results-table td {
      padding: 0.8rem 1rem;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .results-table tr:last-child td { border-bottom: none; }
    .results-table tbody tr {
      transition: background var(--transition);
    }
    .results-table tbody tr:hover { background: var(--surface); }
    .results-table tbody tr.hidden { display: none; }

    .test-title { color: var(--text); font-size: 0.85rem; line-height: 1.4; }
    .test-file  { font-size: 0.72rem; color: var(--text-3); font-family: 'JetBrains Mono', monospace; margin-top: 0.2rem; }
    .source-link { color: var(--text-3); text-decoration: none; transition: color var(--transition); }
    .source-link:hover { color: var(--blue); }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .badge-e2e    { background: color-mix(in srgb,var(--accent) 15%,transparent); color: var(--accent); }
    .badge-api    { background: color-mix(in srgb,var(--blue)   15%,transparent); color: var(--blue); }
    .badge-setup  { background: color-mix(in srgb,var(--text-3) 15%,transparent); color: var(--text-3); }
    .badge-passed { background: color-mix(in srgb,var(--green)  15%,transparent); color: var(--green); }
    .badge-failed { background: color-mix(in srgb,var(--red)    15%,transparent); color: var(--red); }
    .badge-flaky  { background: color-mix(in srgb,var(--yellow) 15%,transparent); color: var(--yellow); }
    .badge-skipped{ background: color-mix(in srgb,var(--text-3) 15%,transparent); color: var(--text-2); }

    .duration-cell { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--text-2); white-space: nowrap; }
    .retries-cell  { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--text-3); text-align: center; }
    .retries-cell.has-retries { color: var(--yellow); font-weight: 600; }

    .trace-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.55rem;
      border-radius: var(--r);
      font-size: 0.72rem;
      font-weight: 500;
      background: color-mix(in srgb, var(--blue) 12%, transparent);
      color: var(--blue);
      border: 1px solid color-mix(in srgb, var(--blue) 25%, transparent);
      text-decoration: none;
      transition: all var(--transition);
      white-space: nowrap;
    }
    .trace-btn:hover {
      background: color-mix(in srgb, var(--blue) 22%, transparent);
      border-color: var(--blue);
    }
    .trace-na { color: var(--text-3); font-size: 0.78rem; }

    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-3);
      font-size: 0.9rem;
    }

    /* ── Result count ─────────────────────────────────────────────────────── */
    .result-count { font-size: 0.78rem; color: var(--text-3); margin-bottom: 0.75rem; }
    .result-count span { color: var(--text-2); font-weight: 600; }

    /* ── Footer ───────────────────────────────────────────────────────────── */
    footer {
      border-top: 1px solid var(--border);
      padding-block: 1.5rem;
      font-size: 0.78rem;
      color: var(--text-3);
      text-align: center;
    }
    footer a { color: var(--text-2); text-decoration: none; transition: color var(--transition); }
    footer a:hover { color: var(--accent); }
  </style>
</head>
<body>

  <!-- ── Nav ──────────────────────────────────────────────────────────────── -->
  <nav class="nav">
    <div class="nav-inner">
      <a class="nav-brand" href="../index.html">
        <span class="nav-brand-dot"></span>
        Henry Perez · QA Report
      </a>
      <span class="nav-meta" id="run-date"></span>
      <a class="nav-back" href="../index.html">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 1 1 1.06 1.06L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06z"/></svg>
        Portfolio
      </a>
    </div>
  </nav>

  <!-- ── Stats ─────────────────────────────────────────────────────────────── -->
  <section class="section" style="padding-bottom:0">
    <div class="container">
      <div class="stats-grid" id="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🧪</div>
          <div class="stat-value c-text" id="s-total">—</div>
          <div class="stat-label">Total Tests</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value c-green" id="s-passed">—</div>
          <div class="stat-label">Passed</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-value c-red" id="s-failed">—</div>
          <div class="stat-label">Failed</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-value c-yellow" id="s-flaky">—</div>
          <div class="stat-label">Flaky</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-value c-accent" id="s-rate">—</div>
          <div class="stat-label">Pass Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱</div>
          <div class="stat-value c-blue" id="s-dur">—</div>
          <div class="stat-label">Duration</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Charts ─────────────────────────────────────────────────────────────── -->
  <section class="section" style="padding-bottom:0">
    <div class="container">
      <div class="section-title">Results overview</div>
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-card-title">Pass / Fail distribution</div>
          <div class="chart-wrap"><canvas id="chart-donut"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-card-title">Tests by module</div>
          <div class="chart-wrap"><canvas id="chart-modules"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-card-title">E2E vs API by module</div>
          <div class="chart-wrap"><canvas id="chart-types"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-card-title">Pass rate trend</div>
          <div class="chart-wrap" id="trend-wrap">
            <div class="trend-loading">Loading history…</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Test table ─────────────────────────────────────────────────────────── -->
  <section class="section">
    <div class="container">
      <div class="section-title">Test results</div>

      <div class="filters-bar">
        <span class="filter-chip active" data-filter="all">All</span>
        <span class="filter-chip chip-e2e"   data-filter="E2E">E2E</span>
        <span class="filter-chip chip-api"   data-filter="API">API</span>
        <span class="filter-chip chip-pass"  data-filter="passed">Passed</span>
        <span class="filter-chip chip-fail"  data-filter="failed">Failed</span>
        <span class="filter-chip chip-flaky" data-filter="flaky">Flaky</span>
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input class="search-input" id="search" type="text" placeholder="Search test name…" autocomplete="off" />
        </div>
      </div>

      <div class="result-count">Showing <span id="visible-count">—</span> tests</div>

      <div class="table-wrap">
        <table class="results-table" id="results-table">
          <thead>
            <tr>
              <th data-col="module">Module <span class="sort-arrow">↕</span></th>
              <th data-col="title" style="width:40%">Test name <span class="sort-arrow">↕</span></th>
              <th data-col="type">Type <span class="sort-arrow">↕</span></th>
              <th data-col="status">Status <span class="sort-arrow">↕</span></th>
              <th data-col="duration">Duration <span class="sort-arrow">↕</span></th>
              <th data-col="retries">Retries <span class="sort-arrow">↕</span></th>
              <th>Trace</th>
            </tr>
          </thead>
          <tbody id="table-body"></tbody>
        </table>
        <div class="empty-state" id="empty-state" style="display:none">No tests match the current filter.</div>
      </div>
    </div>
  </section>

  <!-- ── Footer ─────────────────────────────────────────────────────────────── -->
  <footer>
    <div class="container">
      <strong style="color:var(--text-2)">Henry Perez</strong> · Senior SDET ·
      <a href="https://www.linkedin.com/in/hlperez/" target="_blank" rel="noopener">LinkedIn</a> ·
      <a href="https://github.com/hlperez07/hlperez-portfolio" target="_blank" rel="noopener">GitHub</a> ·
      <a href="../allure/index.html" target="_blank" rel="noopener">Allure Detailed Report ↗</a>
    </div>
  </footer>

  <script>
    // ── Embedded data ──────────────────────────────────────────────────────
    const REPORT = ${DATA_JSON};

    // ── Helpers ────────────────────────────────────────────────────────────
    function fmtDur(ms) {
      if (!ms || ms < 0) return '—';
      if (ms < 1000)    return ms + 'ms';
      if (ms < 60000)   return (ms / 1000).toFixed(1) + 's';
      return Math.floor(ms / 60000) + 'm ' + Math.round((ms % 60000) / 1000) + 's';
    }

    function counter(el, target, suffix = '') {
      const dur = 900, start = performance.now();
      const ease = t => t < .5 ? 2*t*t : -1+(4-2*t)*t;
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(ease(p) * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    // ── Populate stats ─────────────────────────────────────────────────────
    const s = REPORT.stats;
    document.getElementById('run-date').textContent = s.runDate;
    counter(document.getElementById('s-total'),  s.total);
    counter(document.getElementById('s-passed'), s.passed);
    counter(document.getElementById('s-failed'), s.failed);
    counter(document.getElementById('s-flaky'),  s.flaky);
    counter(document.getElementById('s-rate'),   s.passRate, '%');
    document.getElementById('s-dur').textContent = fmtDur(s.duration);

    // ── Radial hover on stat cards ─────────────────────────────────────────
    document.querySelectorAll('.stat-card').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%');
      });
    });

    // ── Chart defaults ─────────────────────────────────────────────────────
    Chart.defaults.color = '#8b949e';
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.font.size   = 12;

    const COLORS = {
      green:  '#3fb950', red: '#f85149', yellow: '#d29922',
      blue:   '#58a6ff', accent: '#ff6b35', gray: '#484f58',
    };

    // Donut chart
    new Chart(document.getElementById('chart-donut'), {
      type: 'doughnut',
      data: {
        labels: ['Passed', 'Failed', 'Flaky', 'Skipped'],
        datasets: [{
          data: [s.passed, s.failed, s.flaky, s.skipped],
          backgroundColor: [COLORS.green, COLORS.red, COLORS.yellow, COLORS.gray],
          borderColor: '#161b22',
          borderWidth: 3,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 14, boxWidth: 12, boxHeight: 12, borderRadius: 4 } },
          tooltip: { callbacks: { label: ctx => ' ' + ctx.label + ': ' + ctx.parsed } },
        },
      },
    });

    // Module bar (stacked)
    const mb = REPORT.moduleBreakdown;
    new Chart(document.getElementById('chart-modules'), {
      type: 'bar',
      data: {
        labels: mb.map(m => m.name),
        datasets: [
          { label: 'Passed', data: mb.map(m => m.passed), backgroundColor: COLORS.green, borderRadius: 4 },
          { label: 'Failed', data: mb.map(m => m.failed), backgroundColor: COLORS.red,   borderRadius: 4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { color: '#21262d' }, ticks: { color: '#8b949e' } },
          y: { stacked: true, grid: { color: '#21262d' }, ticks: { color: '#8b949e', stepSize: 1 }, beginAtZero: true },
        },
        plugins: { legend: { position: 'bottom', labels: { padding: 14, boxWidth: 12, boxHeight: 12, borderRadius: 4 } } },
      },
    });

    // E2E vs API grouped
    new Chart(document.getElementById('chart-types'), {
      type: 'bar',
      data: {
        labels: mb.map(m => m.name),
        datasets: [
          { label: 'E2E', data: mb.map(m => m.e2e), backgroundColor: COLORS.accent, borderRadius: 4, barPercentage: 0.6 },
          { label: 'API', data: mb.map(m => m.api), backgroundColor: COLORS.blue,   borderRadius: 4, barPercentage: 0.6 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { color: '#21262d' }, ticks: { color: '#8b949e' } },
          y: { grid: { color: '#21262d' }, ticks: { color: '#8b949e', stepSize: 1 }, beginAtZero: true },
        },
        plugins: { legend: { position: 'bottom', labels: { padding: 14, boxWidth: 12, boxHeight: 12, borderRadius: 4 } } },
      },
    });

    // ── Trend history chart ───────────────────────────────────────────────
    async function loadTrendHistory() {
      const wrap = document.getElementById('trend-wrap');
      try {
        const res = await fetch('./history.json');
        if (!res.ok) throw new Error('Not found');
        const history = await res.json();
        if (!history || history.length < 2) {
          wrap.innerHTML = '<div class="trend-empty">Not enough data yet</div>';
          return;
        }
        const recent = history.slice(-20);
        const labels = recent.map(r => {
          const d = new Date(r.date);
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const data = recent.map(r => r.passRate);
        const canvas = Object.assign(document.createElement('canvas'), { id: 'chart-trend' });
        wrap.innerHTML = '';
        wrap.appendChild(canvas);
        new Chart(canvas, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Pass %',
              data,
              borderColor: '#3fb950',
              backgroundColor: 'rgba(63,185,80,0.08)',
              fill: true,
              tension: 0.35,
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: '#3fb950',
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { color: '#21262d' }, ticks: { color: '#8b949e', maxTicksLimit: 6 } },
              y: { min: 0, max: 100, grid: { color: '#21262d' }, ticks: { color: '#8b949e', callback: v => v + '%', stepSize: 25 } },
            },
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: ctx => ' Pass rate: ' + ctx.parsed.y + '%' } },
            },
          },
        });
      } catch (_) {
        wrap.innerHTML = '<div class="trend-empty">Trend data unavailable</div>';
      }
    }
    loadTrendHistory();

    // ── Table rendering ────────────────────────────────────────────────────
    const BADGE_TYPE = { E2E: 'badge-e2e', API: 'badge-api', Setup: 'badge-setup' };
    const BADGE_STATUS = { passed:'badge-passed', failed:'badge-failed', flaky:'badge-flaky', skipped:'badge-skipped' };
    const STATUS_ICON  = { passed: '✓', failed: '✗', flaky: '⚡', skipped: '—' };

    function shortFile(file) {
      const idx = file.indexOf('tests/');
      return idx !== -1 ? file.slice(idx) : file;
    }

    let currentFilter = 'all';
    let currentSort   = { col: null, dir: 1 };
    let currentSearch = '';

    function renderTable() {
      const tbody = document.getElementById('table-body');
      const empty = document.getElementById('empty-state');

      let rows = [...REPORT.tests];

      // filter
      if (currentFilter !== 'all') {
        rows = rows.filter(t => {
          if (currentFilter === 'E2E')    return t.type === 'E2E';
          if (currentFilter === 'API')    return t.type === 'API';
          if (currentFilter === 'passed') return t.status === 'passed';
          if (currentFilter === 'failed') return t.status === 'failed';
          if (currentFilter === 'flaky')  return t.status === 'flaky';
          return true;
        });
      }

      // search
      if (currentSearch) {
        const q = currentSearch.toLowerCase();
        rows = rows.filter(t => t.title.toLowerCase().includes(q) || t.module.toLowerCase().includes(q));
      }

      // sort
      if (currentSort.col) {
        rows.sort((a, b) => {
          let av = a[currentSort.col], bv = b[currentSort.col];
          if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
          return av < bv ? -currentSort.dir : av > bv ? currentSort.dir : 0;
        });
      }

      document.getElementById('visible-count').textContent = rows.length;

      if (rows.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
      }
      empty.style.display = 'none';

      tbody.innerHTML = rows.map(t => \`
        <tr>
          <td><span class="badge \${BADGE_TYPE[t.type] || ''}">\${t.module}</span></td>
          <td>
            <div class="test-title">\${t.title}</div>
            <div class="test-file">
              <a href="\${t.githubUrl}" target="_blank" rel="noopener" class="source-link" title="View source on GitHub">\${shortFile(t.file)}</a>
            </div>
          </td>
          <td><span class="badge \${BADGE_TYPE[t.type] || ''}">\${t.type}</span></td>
          <td><span class="badge \${BADGE_STATUS[t.status] || ''}">\${STATUS_ICON[t.status] || ''} \${t.status}</span></td>
          <td class="duration-cell">\${fmtDur(t.duration)}</td>
          <td class="retries-cell \${t.retries > 0 ? 'has-retries' : ''}">\${t.retries > 0 ? t.retries + '↺' : '0'}</td>
          <td>\${t.tracePath ? '<a class="trace-btn" href="https://trace.playwright.dev/?trace=' + REPORT.tracesBase + '/' + t.tracePath.replace('test-results/', '') + '" target="_blank" rel="noopener">&#128269; Trace</a>' : '<span class="trace-na">—</span>'}</td>
        </tr>
      \`).join('');
    }

    renderTable();

    // ── Filter chips ───────────────────────────────────────────────────────
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.filter;
        renderTable();
      });
    });

    // ── Search ─────────────────────────────────────────────────────────────
    document.getElementById('search').addEventListener('input', e => {
      currentSearch = e.target.value.trim();
      renderTable();
    });

    // ── Column sort ────────────────────────────────────────────────────────
    document.querySelectorAll('.results-table th[data-col]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.col;
        if (currentSort.col === col) {
          currentSort.dir *= -1;
        } else {
          currentSort = { col, dir: 1 };
        }
        document.querySelectorAll('.results-table th').forEach(h => h.classList.remove('sorted'));
        th.classList.add('sorted');
        th.querySelector('.sort-arrow').textContent = currentSort.dir === 1 ? '↑' : '↓';
        renderTable();
      });
    });
  </script>

</body>
</html>`;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_FILE, html, 'utf-8');
console.log(`✓ Custom report generated → ${OUTPUT_FILE}`);
