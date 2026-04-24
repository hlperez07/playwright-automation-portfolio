# Gemini Prompt — CV Design for Henry Perez

Copy and paste everything below this line into Gemini.

---

I need you to create a professional CV in PDF format for a Senior SDET (Software Development Engineer in Test). Below I provide all the content and the exact design specifications. Follow them strictly.

---

## DESIGN SPECIFICATIONS

### Layout
- **Two-column layout**: narrow dark sidebar on the left (~30% width) + white main content area on the right (~70% width)
- The sidebar contains: photo, contact, skills, languages, education
- The main content contains: name, title, about me, work experience

### Colors
- Sidebar background: `#1a1a2e` (dark navy)
- Main content background: `#ffffff` (white)
- Accent color (headings, section lines, links): `#ff6b35` (orange)
- Body text: `#1a1a2e`
- Secondary text (dates, labels): `#6b7280`
- Section dividers: thin `#ff6b35` line, 2px

### Typography
- Name: **Space Grotesk Bold**, 28–32px, uppercase or strong weight
- Title below name: **Space Grotesk**, 14px, accent color `#ff6b35`
- Section titles: **Space Grotesk SemiBold**, 11px, uppercase, letter-spacing 0.1em, accent color
- Body / bullets: **Inter Regular**, 9–10px, color `#1a1a2e`
- Dates: **Inter**, 9px, color `#6b7280`, right-aligned
- Sidebar labels: **Inter SemiBold**, 9px, uppercase, color `#ffffff` or light gray

### Photo
- Circular photo in the top of the sidebar
- Thin orange border ring around the photo

### Skills (sidebar)
- Display as pill badges with dark background and subtle border
- Group them visually but DO NOT use progress bars or percentage indicators — those are not credible for senior engineers

### Section structure (main column)
- Each section starts with an accent line + uppercase label
- Company name: bold, 10–11px
- Role: accent color, 9px, uppercase
- Dates: right side, monospace or light font
- Bullet points: use `→` arrow instead of standard bullet

### Print / ATS
- The main content column (white background) must be fully ATS-parseable plain text
- Do NOT use text boxes that float over images for the main content
- Avoid tables for the experience section — use clean div/paragraph structure

---

## CV CONTENT

### Personal Info
- **Name:** Henry Perez
- **Title:** SDET | Test Automation Engineer
- **Email:** hlperez@gmail.com
- **LinkedIn:** linkedin.com/in/hlperez/
- **GitHub:** github.com/hlperez07
- **Portfolio:** hlperez07.github.io/hlperez-portfolio/

---

### About Me
Senior SDET with 10+ years designing and maintaining automation frameworks from scratch for banking, media, AdTech, and retail. Currently at Globant working with Santander UK, where I reduced regression execution time by ~95%, reached 80% E2E coverage, and scaled performance testing from 0 to 3 suites. Deep expertise in Playwright + TypeScript. I work where quality and speed have to coexist — and I use AI tools daily to move faster without cutting corners.

---

### Work Experience

**Test Automation Engineer**
Globant · Santander UK | May 2025 – Present
→ Designed and maintained Playwright-based E2E and API automation framework from scratch — reduced regression execution time by ~95%
→ Updated +60 obsolete manual tests to automated coverage, reaching 80% E2E coverage across core user journeys
→ Scaled performance testing from 0 to 3 suites using JMeter, Postman and Bruno Collections
→ AI-assisted daily workflow using GitHub Copilot for test generation, refactoring and documentation
→ Worked closely with UK-based teams in Agile/Scrum environments

**Test Automation Engineer — Remote**
BairesDev | Oct 2022 – May 2025

  *Project: Kinesso (Nov 2024 – May 2025)*
  → Developed and executed automated test suites using Playwright for web applications
  → Designed and executed API test scenarios using Postman
  → Managed test cases and defect tracking using Jira and Zephyr
  → Delivered in a fully remote, international environment ensuring high-quality releases

  *Project: Windifferent (Oct 2022 – Sep 2024)*
  → Designed and executed API automation tests using Postman and Cypress
  → Implemented automated regression suites with Cypress
  → Managed test cases and defect tracking using TestRail and Jira
  → Ensured quality standards across multiple releases in an Agile environment

**Test Automation Engineer — Remote**
Xcede | Sep 2023 – Sep 2024
→ Led the refactoring and optimization of an existing Playwright automation framework
→ Implemented automated testing for both UI and APIs, improving maintainability and execution stability
→ Managed defect tracking and reporting using Jira

**QA Automation — Remote**
Magentrix | May 2021 – Oct 2022
→ Automated end-to-end and API tests using Cypress and Playwright
→ Designed and maintained automated test cases ensuring consistent regression coverage
→ Managed test plans and execution using TestRail

**QA Automation — Remote**
GAP | Jan 2022 – Oct 2022
  *Abrigo Project:* Automated UI and API tests (Cypress + Postman), BDD scenarios with Cucumber, defect tracking in Jira
  *DELL MSDF Project:* Automated testing with Cypress + Cucumber, defect management with Jira and Zephyr

**Senior QC Analyst**
Globant · Turner – CNN | Sep 2017 – May 2021
→ QA Lead for CNN's U.S. Elections project — high-visibility, high-stakes international platform
→ Worked partially onsite at CNN Atlanta, coordinating testing with US-based teams
→ Designed and executed manual and automated test cases using Cypress
→ Created quality metrics, reports and testing procedures aligned with enterprise standards

**Business Process & Support Engineer**
UNO+UNO | Jun 2015 – Sep 2017

**Software Engineer — Grade II**
INDRA SISTEMAS | Aug 2013 – May 2015

---

### Skills

**Automation & Testing**
Playwright · Cypress · Selenium WebDriver · Shift-left Testing · Postman · Bruno Collection · API Testing · Performance Testing (JMeter) · BDD / Cucumber / Gherkin

**Programming**
TypeScript · JavaScript · Java

**Tools & Process**
Jira · X-Ray · Zephyr · TestRail · Agile / Scrum / Kanban · GitHub Actions · GitLab CI · Jenkins · GitHub Copilot

---

### Languages
- Spanish — Native
- English — Advanced / Professional working proficiency

---

### Education
System Engineer (2011) — Technological University of Pereira

---

## OUTPUT INSTRUCTIONS

1. Generate the CV as a visually polished, two-page maximum document
2. Export or describe it as a ready-to-use PDF
3. Prioritize readability at A4 size (210 × 297 mm)
4. The design should feel modern and technical — dark sidebar with clean white content area — not colorful or playful
5. If you cannot generate the PDF directly, provide the full HTML + CSS code that I can open in a browser and print to PDF, using the exact colors, fonts and layout described above
6. Do NOT add information that is not in this prompt
7. Do NOT invent metrics or add skills not listed here
