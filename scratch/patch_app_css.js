const fs = require('fs');

let css = fs.readFileSync('public/assets/app.css', 'utf8');

const targetSection = `/* Mobile & Touch Responsiveness for Exercise & Exam Shell */`;

const newRules = `
/* ==========================================================================
   EXERCISE HEADER, RESPONSIVENESS, THEME CONTRAST & SUBSCRIPTION RENEWAL GUARD
   ========================================================================== */

/* 1. Universal Color-Scheme & Theme Form Elements Contrast Guarantee */
html {
  color-scheme: light;
}

html[data-theme="dark"] {
  color-scheme: dark !important;
}

html[data-theme="dark"] input,
html[data-theme="dark"] textarea,
html[data-theme="dark"] select {
  background-color: #142220 !important;
  color: #eef5f2 !important;
  border-color: #24352f !important;
  color-scheme: dark !important;
}

html[data-theme="dark"] input:focus,
html[data-theme="dark"] textarea:focus,
html[data-theme="dark"] select:focus {
  border-color: var(--green) !important;
  box-shadow: 0 0 0 3px rgba(255, 122, 47, 0.18) !important;
  outline: none !important;
}

html[data-theme="dark"] select option {
  background-color: #142220 !important;
  color: #eef5f2 !important;
}

html[data-theme="dark"] select option:disabled {
  background-color: #0d1614 !important;
  color: #637770 !important;
}

html[data-theme="dark"] input::placeholder,
html[data-theme="dark"] textarea::placeholder {
  color: #8fa099 !important;
  opacity: 0.9 !important;
}

html:not([data-theme="dark"]) input,
html:not([data-theme="dark"]) textarea,
html:not([data-theme="dark"]) select {
  background-color: #ffffff;
  color: #172421;
  border-color: #ded6d0;
  color-scheme: light;
}

html:not([data-theme="dark"]) select option {
  background-color: #ffffff !important;
  color: #172421 !important;
}

html:not([data-theme="dark"]) select option:disabled {
  background-color: #f8fafc !important;
  color: #94a3b8 !important;
}

/* 2. Unified Exercise Heading & Timer across all Sections & Teils */
.exercise-heading,
.exercise-page:has(.exam-workspace) .exercise-heading,
.exercise-page:has(.hoeren-workspace-shell) .exercise-heading {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  width: 100% !important;
  max-width: min(1380px, 94vw) !important;
  margin: 0 auto !important;
  padding: 24px 20px 14px !important;
  box-sizing: border-box !important;
  height: auto !important;
  min-height: auto !important;
  flex: none !important;
  overflow: visible !important;
}

.exercise-heading-meta {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 14px !important;
  width: 100% !important;
  flex-wrap: wrap !important;
}

.exercise-heading-tags {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex-wrap: wrap !important;
}

.exercise-heading-tags .tag {
  display: inline-flex !important;
  align-items: center !important;
  padding: 6px 14px !important;
  border-radius: 999px !important;
  font-size: 13px !important;
  font-weight: 850 !important;
  line-height: 1 !important;
  border: 1.5px solid color-mix(in srgb, var(--green) 35%, transparent) !important;
  background: var(--green-soft) !important;
  color: var(--green) !important;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03) !important;
}

.exercise-heading-tags .tag-teil {
  background: var(--white) !important;
  border-color: var(--line) !important;
  color: var(--ink) !important;
  font-weight: 800 !important;
}

.exercise-heading-timer {
  display: inline-flex !important;
  align-items: center !important;
  margin-inline-start: auto !important;
  flex: none !important;
}

.progress-pill {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 7px !important;
  padding: 7px 16px !important;
  border-radius: 999px !important;
  border: 1.5px solid var(--line) !important;
  background: var(--white) !important;
  color: var(--ink) !important;
  font-weight: 900 !important;
  font-size: 14.5px !important;
  line-height: 1 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
  white-space: nowrap !important;
  width: auto !important;
  max-width: fit-content !important;
  flex: none !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.progress-pill .timer-icon {
  font-size: 15px !important;
  line-height: 1 !important;
  display: inline-block !important;
}

.progress-pill .timer-digits {
  font-variant-numeric: tabular-nums !important;
  letter-spacing: 0.04em !important;
  font-weight: 900 !important;
}

.progress-pill.timer-danger {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.12) !important;
  color: #ef4444 !important;
  animation: pulseTimer 1s infinite alternate !important;
}

@keyframes pulseTimer {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  100% { transform: scale(1.03); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
}

.exercise-heading-title {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  margin: 0 !important;
  text-align: center !important;
}

.thema-title-row {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 12px !important;
  width: 100% !important;
  margin: 2px 0 0 !important;
  flex-wrap: wrap !important;
}

.thema-title-row h1 {
  font-size: clamp(24px, 3.2vw, 38px) !important;
  font-weight: 900 !important;
  margin: 0 !important;
  letter-spacing: -0.02em !important;
  line-height: 1.25 !important;
  color: var(--ink) !important;
}

/* 3. Fluid Responsive Workspace (No cramped paragraphs, full screen comfort) */
.exam-workspace,
.exercise-page:has(.exam-workspace) .exam-workspace,
.exam-workspace.lesen2,
.exam-workspace.spb1,
.hoeren-choice-page,
.writing-page-shell,
.speaking-exercise-shell {
  display: block !important;
  grid-template-columns: 1fr !important;
  width: 100% !important;
  max-width: min(1380px, 94vw) !important;
  margin: 0 auto !important;
  padding: 0 16px 90px !important;
  height: auto !important;
  min-height: 0 !important;
  overflow: visible !important;
  box-sizing: border-box !important;
}

.exam-main,
.exercise-page:has(.exam-workspace) .exam-main,
.exam-workspace.lesen2 .exam-main {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  padding: 16px 0 70px !important;
  min-width: 0 !important;
  height: auto !important;
  overflow: visible !important;
  box-sizing: border-box !important;
}

.exam-side,
.exercise-page:has(.exam-workspace) .exam-side,
.exam-workspace.lesen2 .exam-side {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  overflow: hidden !important;
}

/* Fluid, comfortable reading cards */
.exam-text-card {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  border-radius: 20px !important;
  padding: clamp(20px, 2.5vw, 36px) clamp(22px, 3vw, 42px) !important;
  margin-bottom: 24px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
  background: var(--white) !important;
  border: 1.5px solid var(--line) !important;
  transition: border-color 0.2s, box-shadow 0.2s !important;
}

.exam-text {
  font-size: clamp(16.5px, 1.15vw, 19px) !important;
  line-height: 2 !important;
  letter-spacing: 0.01em !important;
  color: var(--ink) !important;
  text-align: justify !important;
}

/* Elegant Paragraph Assignment Bar */
.paragraph-assignment {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  padding: 14px 18px !important;
  border-radius: 16px !important;
  background: var(--bg) !important;
  border: 1.5px solid var(--line) !important;
  margin-bottom: 20px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.paragraph-assignment-head {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 10px !important;
  width: 100% !important;
  flex-wrap: wrap !important;
}

.paragraph-assignment-controls {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  width: 100% !important;
  flex-wrap: wrap !important;
}

.paragraph-assignment select {
  flex: 1 1 320px !important;
  min-width: min(280px, 100%) !important;
  max-width: 100% !important;
  padding: 11px 16px !important;
  font-size: 14.5px !important;
  border-radius: 12px !important;
  border: 1.5px solid var(--line) !important;
  background: var(--white) !important;
  color: var(--ink) !important;
  font-weight: 750 !important;
  outline: none !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  box-sizing: border-box !important;
}

.paragraph-assignment select:focus {
  border-color: var(--green) !important;
  box-shadow: 0 0 0 3px var(--green-soft) !important;
}

.assignment-label {
  font-size: 13px !important;
  font-weight: 900 !important;
  color: var(--green) !important;
  letter-spacing: 0.02em !important;
}

.assignment-empty {
  font-size: 12.5px !important;
  color: var(--muted) !important;
  font-weight: 750 !important;
  padding: 7px 14px !important;
  background: color-mix(in srgb, var(--line) 45%, transparent) !important;
  border-radius: 10px !important;
  white-space: nowrap !important;
}

.assignment-selected {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 7px 14px !important;
  border-radius: 10px !important;
  font-size: 13px !important;
  font-weight: 850 !important;
  background: var(--green-soft) !important;
  color: var(--green) !important;
  border: 1.5px solid color-mix(in srgb, var(--green) 35%, transparent) !important;
  cursor: pointer !important;
}

/* 4. Active Subscription Renewal Guard Banner */
.active-subscription-banner {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 20px !important;
  background: var(--white) !important;
  border: 1.5px solid var(--line) !important;
  border-radius: 20px !important;
  padding: 22px 26px !important;
  margin-bottom: 28px !important;
  box-shadow: var(--shadow-sm) !important;
  flex-wrap: wrap !important;
  box-sizing: border-box !important;
}

.active-subscription-banner.guarded {
  border-color: rgba(255, 122, 47, 0.45) !important;
  background: color-mix(in srgb, var(--white) 90%, var(--green-soft)) !important;
}

.active-subscription-banner.can-renew {
  border-color: #22c55e !important;
  background: rgba(34, 197, 94, 0.08) !important;
}

.sub-banner-left {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
  flex: 1 1 320px !important;
}

.sub-banner-badge {
  width: 52px !important;
  height: 52px !important;
  border-radius: 16px !important;
  background: var(--green-soft) !important;
  color: var(--green) !important;
  display: grid !important;
  place-items: center !important;
  font-size: 26px !important;
  flex: none !important;
}

.sub-banner-text h3 {
  margin: 0 0 6px !important;
  font-size: 18.5px !important;
  color: var(--ink) !important;
}

.sub-banner-text p {
  margin: 0 !important;
  font-size: 14px !important;
  line-height: 1.65 !important;
  color: var(--muted) !important;
}

.sub-banner-days {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  background: var(--white) !important;
  border: 1.5px solid var(--line) !important;
  border-radius: 16px !important;
  padding: 10px 22px !important;
  min-width: 105px !important;
  text-align: center !important;
  flex: none !important;
}

.sub-banner-days .days-num {
  font-size: 28px !important;
  font-weight: 900 !important;
  color: var(--green) !important;
  line-height: 1 !important;
}

.sub-banner-days .days-label {
  font-size: 11px !important;
  color: var(--muted) !important;
  font-weight: 800 !important;
  margin-top: 4px !important;
}

.btn-renew-disabled {
  opacity: 0.65 !important;
  cursor: not-allowed !important;
  background: var(--line) !important;
  border-color: var(--line) !important;
  color: var(--muted) !important;
}

@media (max-width: 768px) {
  .exercise-heading {
    padding: 16px 14px 10px !important;
  }
  .exercise-heading-meta {
    gap: 10px !important;
  }
  .exam-text-card {
    padding: 18px 16px !important;
    border-radius: 16px !important;
  }
  .exam-text {
    font-size: 15.5px !important;
    line-height: 1.85 !important;
  }
  .paragraph-assignment {
    padding: 10px 12px !important;
  }
  .active-subscription-banner {
    padding: 16px 18px !important;
  }
  .sub-banner-days {
    width: 100% !important;
    flex-direction: row !important;
    gap: 12px !important;
    padding: 8px 16px !important;
  }
}
`;

// Replace lines 5035 to 5082
const oldBlock = `.exercise-heading,
.exercise-page:has(.exam-workspace) .exercise-heading {
  display: block !important;
  height: auto !important;
  min-height: auto !important;
  flex: none !important;
  overflow: visible !important;
  padding: 24px 20px 18px !important;
}

.exam-workspace,
.exercise-page:has(.exam-workspace) .exam-workspace,
.exam-workspace.lesen2,
.exam-workspace.spb1 {
  display: block !important;
  grid-template-columns: 1fr !important;
  width: 100% !important;
  max-width: 1150px !important;
  margin: 0 auto !important;
  padding: 0 16px 90px !important;
  height: auto !important;
  min-height: 0 !important;
  overflow: visible !important;
}

.exam-main,
.exercise-page:has(.exam-workspace) .exam-main,
.exam-workspace.lesen2 .exam-main {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  padding: 16px 0 60px !important;
  min-width: 0 !important;
  height: auto !important;
  overflow: visible !important;
}

.exam-side,
.exercise-page:has(.exam-workspace) .exam-side,
.exam-workspace.lesen2 .exam-side {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  overflow: hidden !important;
}`;

let normCss = css.replace(/\r\n/g, '\n');
let normOld = oldBlock.replace(/\r\n/g, '\n');

if (normCss.includes(normOld)) {
  normCss = normCss.replace(normOld, newRules);
  console.log('Old block replaced with enhanced new rules!');
} else {
  console.log('Direct match of old block not found, appending to end of app.css');
  normCss += '\n' + newRules;
}

if (css.includes('\r\n')) {
  normCss = normCss.replace(/\n/g, '\r\n');
}
fs.writeFileSync('public/assets/app.css', normCss, 'utf8');
console.log('public/assets/app.css updated!');
