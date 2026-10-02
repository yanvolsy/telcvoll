const fs = require('fs');
const path = require('path');

const mockPath = path.join(__dirname, '..', 'public', 'mock-exam.html');
let content = fs.readFileSync(mockPath, 'utf8');

// 1. Modernize Question Workspace CSS (between </head> and <style>/* TELC Voll: unified homepage typography */)
const cssStart = content.indexOf('<style>\n.mock-root{direction:ltr;');
const cssEnd = content.indexOf('</style>\n<style>/* TELC Voll: unified homepage typography */');

if (cssStart === -1 || cssEnd === -1) {
  console.error('Could not find question workspace <style> block');
  process.exit(1);
}

const modernQuestionCss = `<style>
/* TELC Voll — Mock Exam Question Workspaces (Phase 7C Modernization) */
.mock-root {
  direction: ltr !important;
  max-width: 1280px;
  margin: 0 auto;
  padding: 18px 24px 140px;
  box-sizing: border-box;
}

/* Progress bar */
.mock-progress {
  display: flex !important;
  justify-content: space-between !important;
  gap: 14px !important;
  align-items: center !important;
  margin: 16px 0 20px !important;
  font-weight: 850;
  color: var(--text-primary, var(--ink));
}
.mock-progress-bar {
  height: 6px !important;
  background: var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-full, 999px) !important;
  overflow: hidden !important;
  flex: 1 !important;
}
.mock-progress-bar i {
  display: block !important;
  height: 100% !important;
  background: linear-gradient(90deg, var(--brand-primary, #ea580c), #ff9a4d) !important;
  border-radius: inherit !important;
  transition: width 0.25s ease !important;
}

/* Master Exercise Card */
.mock-card {
  direction: ltr !important;
  background: var(--bg-surface-elevated, var(--white)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-card, 24px) !important;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.04)) !important;
  padding: clamp(20px, 3.5vw, 36px) !important;
  box-sizing: border-box !important;
}

/* Section label & task count pills */
.mock-section-label {
  display: flex !important;
  gap: 10px !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  margin-bottom: 20px !important;
}
.mock-section-label .tag {
  font-weight: 850 !important;
  background: var(--brand-subtle, rgba(234, 88, 12, 0.08)) !important;
  color: var(--brand-primary, #ea580c) !important;
  border: 1px solid var(--brand-border, rgba(234, 88, 12, 0.25)) !important;
  padding: 5px 14px !important;
  border-radius: var(--radius-pill, 999px) !important;
  font-size: 13px !important;
}
.mock-task-count {
  font-size: 13.5px !important;
  font-weight: 850 !important;
  color: var(--text-secondary, var(--muted)) !important;
  background: var(--bg-surface, var(--bg)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  padding: 5px 14px !important;
  border-radius: var(--radius-pill, 999px) !important;
}

/* Head block inside workspaces */
.mock-spb-head {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin: 20px 0 16px !important;
  flex-wrap: wrap !important;
  gap: 12px !important;
}
.mock-spb-head h3 {
  margin: 0 !important;
  font-size: 17.5px !important;
  font-weight: 900 !important;
  color: var(--text-primary, var(--ink)) !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

/* FLAT READING SURFACES: long German reading texts */
.mock-reading-panel,
.long-text.mock-reading-panel {
  font-size: 16.5px !important;
  line-height: 1.85 !important;
  color: var(--text-primary, var(--ink)) !important;
  background: var(--bg-surface, var(--bg)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-card, 16px) !important;
  padding: 24px 28px !important;
  margin: 18px 0 24px !important;
  box-shadow: none !important;
  direction: ltr !important;
  word-break: break-word;
}
.mock-task-body {
  font-size: 15.5px !important;
  line-height: 1.8 !important;
  color: var(--text-primary, var(--ink)) !important;
  direction: ltr !important;
}

/* Generic question item cards */
.mock-item {
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-card, 16px) !important;
  padding: 22px 24px !important;
  margin: 16px 0 !important;
  background: var(--bg-surface-elevated, var(--white)) !important;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.03)) !important;
  transition: border-color var(--duration-fast, 0.18s) ease !important;
  direction: ltr !important;
}
.mock-item.answered {
  border-color: var(--brand-border, rgba(234, 88, 12, 0.35)) !important;
}
.mock-item-prompt {
  font-weight: 850 !important;
  font-size: 16px !important;
  line-height: 1.65 !important;
  margin-bottom: 14px !important;
  color: var(--text-primary, var(--ink)) !important;
}

/* Native select styling */
.mock-select {
  width: 100% !important;
  padding: 11px 16px !important;
  border: 1.5px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-button, 12px) !important;
  background: var(--bg-surface, var(--white)) !important;
  font: inherit !important;
  font-size: 14.5px !important;
  font-weight: 800 !important;
  color: var(--text-primary, var(--ink)) !important;
  cursor: pointer !important;
  outline: none !important;
  transition: all var(--duration-fast, 0.18s) ease !important;
  box-sizing: border-box !important;
}
.mock-select:hover, .mock-select:focus {
  border-color: var(--brand-primary, #ea580c) !important;
}
.mock-select.answered {
  border-color: var(--brand-primary, #ea580c) !important;
  background: var(--brand-subtle, rgba(234, 88, 12, 0.04)) !important;
}

/* Number badge helper */
.mock-num-badge {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 28px !important;
  height: 28px !important;
  padding: 0 8px !important;
  border-radius: var(--radius-button, 8px) !important;
  background: var(--brand-subtle, rgba(234, 88, 12, 0.1)) !important;
  color: var(--brand-primary, #ea580c) !important;
  border: 1px solid var(--brand-border, rgba(234, 88, 12, 0.25)) !important;
  font-size: 13px !important;
  font-weight: 950 !important;
  flex-shrink: 0 !important;
}

/* ─── Sprachbausteine Teil 1 & 2 ─── */
.mock-inline-gap-select {
  display: inline-block !important;
  vertical-align: middle !important;
  height: 38px !important;
  padding: 0 12px !important;
  margin: 3px 5px !important;
  border: 1.5px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-button, 10px) !important;
  background: var(--bg-surface-elevated, var(--white)) !important;
  color: var(--text-primary, var(--ink)) !important;
  font-family: inherit !important;
  font-weight: 850 !important;
  font-size: 14px !important;
  cursor: pointer !important;
  transition: all var(--duration-fast, 0.18s) ease !important;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.04)) !important;
  outline: none !important;
  max-width: 250px !important;
  box-sizing: border-box !important;
}
.mock-inline-gap-select:hover {
  border-color: var(--brand-primary, #ea580c) !important;
}
.mock-inline-gap-select:focus-visible {
  outline: 2px solid var(--brand-primary, #ea580c) !important;
  outline-offset: 2px !important;
}
.mock-inline-gap-select.answered {
  border-color: var(--brand-primary, #ea580c) !important;
  background: var(--brand-subtle, rgba(234, 88, 12, 0.08)) !important;
  color: var(--brand-primary, #ea580c) !important;
  font-weight: 900 !important;
}

.mock-spb-container {
  margin-top: 28px !important;
  padding-top: 22px !important;
  border-top: 1.5px solid var(--border-subtle, var(--line)) !important;
}
.mock-spb-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
  gap: 14px !important;
}
.mock-spb-card {
  background: var(--bg-surface-elevated, var(--white)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-card, 16px) !important;
  padding: 16px 18px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  transition: all var(--duration-fast, 0.18s) ease !important;
  box-shadow: var(--shadow-sm) !important;
}
.mock-spb-card.answered {
  border-color: var(--brand-border, rgba(234, 88, 12, 0.35)) !important;
}
.mock-spb-card-title {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  font-weight: 900 !important;
  font-size: 14.5px !important;
  color: var(--text-primary, var(--ink)) !important;
}
.mock-spb-options {
  display: grid !important;
  gap: 8px !important;
}
.mock-spb-option-btn {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  width: 100% !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  background: var(--bg-surface, var(--bg)) !important;
  color: var(--text-primary, var(--ink)) !important;
  border-radius: var(--radius-button, 10px) !important;
  padding: 10px 14px !important;
  text-align: start !important;
  cursor: pointer !important;
  font: inherit !important;
  font-size: 14px !important;
  font-weight: 750 !important;
  transition: all var(--duration-fast, 0.18s) ease !important;
  box-sizing: border-box !important;
}
.mock-spb-option-btn:hover {
  border-color: var(--brand-primary, #ea580c) !important;
  background: var(--brand-subtle, rgba(234, 88, 12, 0.05)) !important;
}
.mock-spb-option-btn.selected {
  border-color: var(--brand-primary, #ea580c) !important;
  background: var(--brand-subtle, rgba(234, 88, 12, 0.12)) !important;
  color: var(--brand-primary, #ea580c) !important;
  box-shadow: 0 0 0 1px var(--brand-primary, #ea580c) !important;
  font-weight: 900 !important;
}
.mock-btn-key {
  font-weight: 950 !important;
  color: var(--brand-primary, #ea580c) !important;
  min-width: 24px !important;
}

/* Word bank (Sprachbausteine 2) */
.mock-wordbank-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
  gap: 10px !important;
}
.mock-word-card {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 11px 14px !important;
  background: var(--bg-surface-elevated, var(--white)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-button, 12px) !important;
  font-size: 14px !important;
  font-weight: 800 !important;
  color: var(--text-primary, var(--ink)) !important;
  transition: all var(--duration-fast, 0.18s) ease !important;
  box-shadow: var(--shadow-sm) !important;
}
.mock-word-card small {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 24px !important;
  height: 24px !important;
  border-radius: var(--radius-sm, 6px) !important;
  background: var(--brand-subtle, rgba(234, 88, 12, 0.1)) !important;
  color: var(--brand-primary, #ea580c) !important;
  font-size: 12px !important;
  font-weight: 950 !important;
}
.mock-word-card.used {
  opacity: 0.55 !important;
  background: var(--bg-surface, var(--bg)) !important;
  border-style: dashed !important;
}
.mock-word-card .mock-word-check {
  margin-inline-start: auto !important;
  color: var(--state-success, #22c55e) !important;
  font-weight: 950 !important;
}

/* ─── Headings Bank (Lesen 1) ─── */
.mock-headings-bank {
  background: var(--bg-surface, var(--bg)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-card, 18px) !important;
  padding: 22px !important;
  margin-top: 28px !important;
}
.mock-headings-bank h3 {
  margin: 0 0 14px !important;
  font-size: 17px !important;
  font-weight: 900 !important;
  color: var(--text-primary, var(--ink)) !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}
.mock-headings-list {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)) !important;
  gap: 12px !important;
}
.mock-heading-item {
  display: flex !important;
  align-items: flex-start !important;
  gap: 10px !important;
  padding: 12px 14px !important;
  background: var(--bg-surface-elevated, var(--white)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-button, 12px) !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
  color: var(--text-primary, var(--ink)) !important;
  box-shadow: var(--shadow-sm) !important;
}
.mock-heading-letter {
  font-weight: 950 !important;
  color: var(--brand-primary, #ea580c) !important;
  min-width: 24px !important;
}

/* ─── Lesen Teil 1 List ─── */
.mock-l1-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 18px !important;
}
.mock-l1-item-header {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  margin-bottom: 14px !important;
}

/* ─── Lesen Teil 2 Question Cards & Options ─── */
.lesen2-questions-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
}
.lesen2-question {
  background: var(--bg-surface-elevated, var(--white)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-card, 18px) !important;
  padding: 22px 24px !important;
  box-shadow: var(--shadow-sm) !important;
  transition: border-color var(--duration-fast, 0.18s) ease !important;
  margin-bottom: 0 !important;
}
.lesen2-question.answered {
  border-color: var(--brand-border, rgba(234, 88, 12, 0.35)) !important;
}
.question-prompt-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: flex-start !important;
  gap: 12px !important;
  margin-bottom: 16px !important;
}
.question-prompt-text {
  font-size: 16px !important;
  font-weight: 850 !important;
  line-height: 1.6 !important;
  color: var(--text-primary, var(--ink)) !important;
  display: flex !important;
  align-items: baseline !important;
  gap: 10px !important;
}
.question-num {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 28px !important;
  height: 28px !important;
  background: var(--brand-subtle, rgba(234, 88, 12, 0.1)) !important;
  color: var(--brand-primary, #ea580c) !important;
  border: 1px solid var(--brand-border, rgba(234, 88, 12, 0.25)) !important;
  border-radius: var(--radius-button, 8px) !important;
  font-size: 13.5px !important;
  font-weight: 900 !important;
  flex-shrink: 0 !important;
}
.options-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
}
.side-option.mock-option {
  width: 100% !important;
  text-align: start !important;
  justify-content: flex-start !important;
  padding: 12px 18px !important;
  border-radius: var(--radius-button, 12px) !important;
  font-size: 14.5px !important;
  font-weight: 750 !important;
  background: var(--bg-surface, var(--bg)) !important;
  color: var(--text-primary, var(--ink)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  cursor: pointer !important;
  transition: all var(--duration-fast, 0.18s) ease !important;
  box-sizing: border-box !important;
}
.side-option.mock-option:hover {
  border-color: var(--brand-primary, #ea580c) !important;
  background: var(--brand-subtle, rgba(234, 88, 12, 0.04)) !important;
}
.side-option.mock-option.selected {
  border: 2px solid var(--brand-primary, #ea580c) !important;
  background: var(--brand-subtle, rgba(234, 88, 12, 0.12)) !important;
  color: var(--brand-primary, #ea580c) !important;
  box-shadow: 0 0 0 1px var(--brand-primary, #ea580c) !important;
  font-weight: 900 !important;
}
.mock-option-key {
  font-weight: 900 !important;
  color: var(--brand-primary, #ea580c) !important;
  margin-inline-end: 6px !important;
}

/* ─── Lesen Teil 3 Ads & Situations ─── */
.mock-l3-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
}
.paragraph-assignment-controls {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  margin-bottom: 12px !important;
  flex-wrap: wrap !important;
}
.paragraph-assignment-controls .mock-select {
  flex: 1 1 280px !important;
}
.assignment-selected {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 6px 14px !important;
  border-radius: var(--radius-pill, 999px) !important;
  background: var(--brand-subtle, rgba(234, 88, 12, 0.1)) !important;
  border: 1px solid var(--brand-border, rgba(234, 88, 12, 0.3)) !important;
  color: var(--brand-primary, #ea580c) !important;
  font-size: 13px !important;
  font-weight: 850 !important;
  cursor: pointer !important;
  transition: all var(--duration-fast, 0.18s) ease !important;
}
.assignment-selected:hover {
  background: var(--state-danger-subtle, rgba(239, 68, 68, 0.12)) !important;
  border-color: var(--state-danger-border, rgba(239, 68, 68, 0.35)) !important;
  color: var(--state-danger, #ef4444) !important;
}
.lesen3-overview-head {
  display: flex !important;
  justify-content: space-between !important;
  align-items: flex-start !important;
  margin-bottom: 16px !important;
  flex-wrap: wrap !important;
  gap: 10px !important;
}
.lesen3-ads-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 14px !important;
}
.lesen3-ad-card {
  background: var(--bg-surface-elevated, var(--white)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-card, 14px) !important;
  padding: 18px 20px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
  box-shadow: var(--shadow-sm) !important;
}
.lesen3-ad-card.is-used {
  border-color: var(--brand-border, rgba(234, 88, 12, 0.35)) !important;
}
.lesen3-ad-head {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
}
.lesen3-ad-title {
  font-size: 15.5px !important;
  font-weight: 950 !important;
  color: var(--text-primary, var(--ink)) !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
}
.mock-badge-letter {
  color: var(--brand-primary, #ea580c) !important;
  font-weight: 950 !important;
}
.lesen3-assigned-tag {
  background: var(--brand-primary, #ea580c) !important;
  color: #ffffff !important;
  font-weight: 850 !important;
  font-size: 11.5px !important;
  padding: 3px 10px !important;
  border-radius: 6px !important;
}
.mock-ad-content {
  font-size: 14.5px !important;
  line-height: 1.75 !important;
  color: var(--text-primary, var(--ink)) !important;
}

/* ─── Hören Teil 1 (R/F Table) ─── */
.hoeren-table-card {
  margin-top: 24px !important;
  background: var(--bg-surface-elevated, var(--white)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-card, 20px) !important;
  overflow: hidden !important;
  box-shadow: var(--shadow-sm) !important;
}
.hoeren-stmt-num {
  font-weight: 900 !important;
  color: var(--brand-primary, #ea580c) !important;
  font-size: 15px !important;
}

/* ─── Schreiben Workspace ─── */
.mock-writing-grid {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 22px !important;
  align-items: stretch !important;
}
.mock-writing-box {
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-card, 18px) !important;
  padding: 22px 24px !important;
  background: var(--bg-surface, var(--bg)) !important;
}
.mock-writing-box h3 {
  margin-top: 0 !important;
  font-size: 18px !important;
  font-weight: 900 !important;
  color: var(--text-primary, var(--ink)) !important;
}
.mock-writing-editor {
  background: var(--bg-surface-elevated, var(--white)) !important;
  box-shadow: var(--shadow-sm) !important;
}
.mock-writing-editor textarea {
  width: 100% !important;
  min-height: 520px !important;
  resize: vertical !important;
  border: 1.5px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-card, 14px) !important;
  padding: 18px !important;
  background: var(--bg-surface, var(--white)) !important;
  font: inherit !important;
  font-size: 15.5px !important;
  line-height: 1.85 !important;
  box-sizing: border-box !important;
  color: var(--text-primary, var(--ink)) !important;
  outline: none !important;
  transition: border-color var(--duration-fast, 0.18s) ease !important;
  direction: ltr !important;
}
.mock-writing-editor textarea:focus {
  border-color: var(--brand-primary, #ea580c) !important;
  box-shadow: 0 0 0 2px var(--brand-subtle, rgba(234, 88, 12, 0.15)) !important;
}
.mock-editor-meta {
  display: flex !important;
  justify-content: space-between !important;
  color: var(--text-secondary, var(--muted)) !important;
  font-size: 13px !important;
  font-weight: 800 !important;
  margin-top: 10px !important;
  gap: 10px !important;
  flex-wrap: wrap !important;
}
#writingWords {
  color: var(--brand-primary, #ea580c) !important;
  font-weight: 900 !important;
  font-variant-numeric: tabular-nums !important;
}
.mock-writing-char-toolbar {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex-wrap: wrap !important;
  margin: 0 0 12px !important;
}
.mock-writing-char-btn {
  width: 38px !important;
  height: 38px !important;
  min-width: 38px !important;
  padding: 0 !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-button, 9px) !important;
  background: var(--bg-surface, var(--bg)) !important;
  color: var(--text-primary, var(--ink)) !important;
  font: inherit !important;
  font-weight: 950 !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all var(--duration-fast, 0.15s) ease !important;
}
.mock-writing-char-btn:hover {
  border-color: var(--brand-primary, #ea580c) !important;
  color: var(--brand-primary, #ea580c) !important;
  background: var(--brand-subtle, rgba(234, 88, 12, 0.08)) !important;
}

/* ─── Responsive Adjustments ─── */
@media (max-width: 900px) {
  .mock-writing-grid {
    grid-template-columns: 1fr !important;
  }
}
@media (max-width: 600px) {
  .mock-root {
    padding: 12px 14px 140px !important;
  }
  .mock-card {
    padding: 18px 16px !important;
    border-radius: var(--radius-card, 16px) !important;
  }
  .mock-reading-panel {
    font-size: 15px !important;
    padding: 16px 14px !important;
  }
  .lesen2-question, .mock-item {
    padding: 16px 14px !important;
  }
  .mock-writing-editor textarea {
    min-height: 420px !important;
  }
}
.mock-finish{max-width:720px;margin:80px auto;text-align:center;padding:40px;border-radius:24px;background:var(--bg-surface-elevated,var(--white));border:1px solid var(--border-subtle,var(--line));box-shadow:var(--shadow)}
.mock-finish .spinner{width:48px;height:48px;border:4px solid var(--border-subtle,var(--line));border-top-color:var(--brand-primary,#ea580c);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 20px}
@keyframes spin{to{transform:rotate(360deg)}}
.mock-error{max-width:680px;margin:24px auto;color:var(--danger);text-align:center}
.mock-load-error{max-width:640px;margin:54px auto;padding:28px;border:1px solid var(--border-subtle,var(--line));border-radius:20px;background:var(--bg-surface-elevated,var(--white));text-align:center;box-shadow:var(--shadow)}
.mock-load-error p{color:var(--muted)}
</style>`;

content = content.slice(0, cssStart) + modernQuestionCss + content.slice(cssEnd + '</style>'.length);

// 2. bindHoerenAudioPlayer slider green cleanup
const oldProgressGrad = "progress.style.background = `linear-gradient(to right, var(--green) 0%, var(--green) ${pct}%, var(--line) ${pct}%, var(--line) 100%)`;";
const newProgressGrad = "progress.style.background = `linear-gradient(to right, var(--brand-primary, #ea580c) 0%, var(--brand-primary, #ea580c) ${pct}%, var(--border-subtle, var(--line)) ${pct}%, var(--border-subtle, var(--line)) 100%)`;";
content = content.replace(oldProgressGrad, newProgressGrad);

const oldVolumeGrad = "volume.style.background = `linear-gradient(to right, var(--green) 0%, var(--green) ${vPct}%, var(--line) ${vPct}%, var(--line) 100%)`;";
const newVolumeGrad = "volume.style.background = `linear-gradient(to right, var(--brand-primary, #ea580c) 0%, var(--brand-primary, #ea580c) ${vPct}%, var(--border-subtle, var(--line)) ${vPct}%, var(--border-subtle, var(--line)) 100%)`;";
content = content.replace(oldVolumeGrad, newVolumeGrad);

// 3. Modernize renderMockSpb1
const oldSpb1Start = content.indexOf('function renderMockSpb1(model){');
const oldSpb1End = content.indexOf('/* ─── 2. Sprachbausteine Teil 2 Renderer ─── */');
if (oldSpb1Start === -1 || oldSpb1End === -1) {
  console.error('Could not find renderMockSpb1');
  process.exit(1);
}

const modernSpb1 = `function renderMockSpb1(model){
  window.__mockAnswers = {...itemAnswer(model.exercise.id)};
  const items = model.items || [];
  const bodyText = getExerciseBody(model);
  let html = escBody(bodyText || '');

  // Replace each gap [21]..[30] with an inline <select>
  items.forEach(it => {
    const n = String(it.position_no);
    const examNo = Number(n) > 20 ? Number(n) : Number(n) + 20;
    const val = window.__mockAnswers[n] || window.__mockAnswers[String(it.id)] || '';
    const opts = (it.options || []).slice(0, 3);
    const selectOpts = opts.map(o => {
      const isSel = String(val).toLowerCase() === String(o.option_key).toLowerCase();
      return \`<option value="\${esc(o.option_key)}" \${isSel ? 'selected' : ''}>\${esc(o.option_key)}) \${esc(o.option_text || o.option_key)}</option>\`;
    }).join('');

    const gapHtml = \`<select class="mock-inline-gap-select \${val ? 'answered' : ''}" data-answer-q="\${esc(n)}" data-gap-q="\${esc(n)}" aria-label="\${text('الفراغ', 'Lücke')} \${examNo}"><option value="">(\${examNo}) — \${text('اختر', 'wählen')}</option>\${selectOpts}</select>\`;

    const re = new RegExp('(?:_{2,}|\\\\(|\\\\[|\\\\{)\\\\s*(?:' + examNo + '|' + n + ')\\\\s*(?:_{2,}|\\\\)|\\\\]|\\\\})', 'g');
    if (re.test(html)) {
      html = html.replace(re, gapHtml);
    } else {
      const fallbackRe = new RegExp('\\\\b' + examNo + '\\\\b', 'g');
      if (fallbackRe.test(html)) html = html.replace(fallbackRe, gapHtml);
    }
  });

  const questionsMarkup = \`
    <div class="mock-spb-container">
      <div class="mock-spb-head">
        <h3><span>🧩</span> <span>\${text('خيارات الفراغات (21 - 30):', 'Aufgaben Sprachbausteine Teil 1 (21 - 30):')}</span></h3>
        <span class="mock-task-count">\${Object.keys(window.__mockAnswers).length} / \${items.length}</span>
      </div>
      <div class="mock-spb-grid">
        \${items.map(it => {
          const n = String(it.position_no);
          const examNo = Number(n) > 20 ? Number(n) : Number(n) + 20;
          const val = window.__mockAnswers[n] || window.__mockAnswers[String(it.id)] || '';
          const opts = (it.options || []).slice(0, 3);
          return \`
          <div class="mock-spb-card \${val ? 'answered' : ''}" data-item="\${esc(n)}">
            <div class="mock-spb-card-title">
              <span class="mock-num-badge">\${examNo}</span>
              <span>\${text('الفراغ', 'Lücke')} \${examNo}</span>
            </div>
            <div class="mock-spb-options">
              \${opts.map(o => \`
                <button type="button" class="mock-spb-option-btn \${String(val).toLowerCase() === String(o.option_key).toLowerCase() ? 'selected' : ''}" data-answer-q="\${esc(n)}" data-answer="\${esc(o.option_key)}">
                  <span class="mock-btn-key">\${esc(o.option_key)}</span>
                  <span>\${esc(o.option_text || o.option_key)}</span>
                </button>
              \`).join('')}
            </div>
          </div>\`;
        }).join('')}
      </div>
    </div>\`;

  return baseShell(\`
    <div class="mock-section-label">
      <span class="tag">Telc \${esc(model.exercise.level||state.session.level)}</span>
      <span class="mock-task-count">\${esc(model.exercise.section)} · \${esc(model.exercise.teil)}</span>
    </div>
    <div class="mock-reading-panel">\${html}</div>
    \${questionsMarkup}
  \`);
}

`;

content = content.slice(0, oldSpb1Start) + modernSpb1 + content.slice(oldSpb1End);

// 4. Modernize renderMockSpb2
const oldSpb2Start = content.indexOf('function renderMockSpb2(model){');
const oldSpb2End = content.indexOf('/* ─── 3. Lesen Teil 1 Renderer (Matching Headings) ─── */');
if (oldSpb2Start === -1 || oldSpb2End === -1) {
  console.error('Could not find renderMockSpb2');
  process.exit(1);
}

const modernSpb2 = `function renderMockSpb2(model){
  window.__mockAnswers = {...itemAnswer(model.exercise.id)};
  const items = model.items || [];
  const bodyText = getExerciseBody(model);
  const sharedOpts = sharedOptions(model);
  let html = escBody(bodyText || '');

  // Replace each gap [31]..[40] with an inline <select> containing shared words
  items.forEach(it => {
    const n = String(it.position_no);
    const examNo = Number(n) > 30 ? Number(n) : Number(n) + 30;
    const val = window.__mockAnswers[n] || window.__mockAnswers[String(it.id)] || '';
    const usedKeys = new Set(Object.values(window.__mockAnswers || {})
      .filter(Boolean)
      .map(x => String(x).toLowerCase()));
    const selectOpts = sharedOpts.map(([k, v]) => {
      const isSel = String(val).toLowerCase() === String(k).toLowerCase();
      const isUsed = !isSel && usedKeys.has(String(k).toLowerCase());
      const wordText = v ? esc(v) : esc(k);
      return \`<option value="\${esc(k)}" \${isSel ? 'selected' : ''} \${isUsed ? 'disabled' : ''}>\${wordText}\${isUsed ? ' — ' + text('تم استخدامه', 'bereits verwendet') : ''}</option>\`;
    }).join('');

    const gapHtml = \`<select class="mock-inline-gap-select \${val ? 'answered' : ''}" data-answer-q="\${esc(n)}" data-gap-q="\${esc(n)}" aria-label="\${text('الفراغ', 'Lücke')} \${examNo}"><option value="">(\${examNo}) — \${text('اختر كلمة', 'Wort')}</option>\${selectOpts}</select>\`;

    const re = new RegExp('(?:_{2,}|\\\\(|\\\\[|\\\\{)\\\\s*(?:' + examNo + '|' + n + ')\\\\s*(?:_{2,}|\\\\)|\\\\]|\\\\})', 'g');
    if (re.test(html)) {
      html = html.replace(re, gapHtml);
    } else {
      const fallbackRe = new RegExp('\\\\b' + examNo + '\\\\b', 'g');
      if (fallbackRe.test(html)) html = html.replace(fallbackRe, gapHtml);
    }
  });

  const wordBankMarkup = \`
    <div class="mock-spb-container">
      <div class="mock-spb-head">
        <h3><span>🔤</span> <span>\${text('بنك الكلمات للاختيار في الفراغات (WÖRTER a bis o):', 'Wortauswahl für die Lücken (a bis o):')}</span></h3>
        <span class="mock-task-count">\${Object.keys(window.__mockAnswers).length} / \${items.length}</span>
      </div>
      <div class="mock-wordbank-grid">
        \${sharedOpts.map(([k, v]) => {
          const isUsed = Object.values(window.__mockAnswers).some(ans => String(ans).toLowerCase() === String(k).toLowerCase());
          return \`
          <div class="mock-word-card \${isUsed ? 'used' : ''}" data-word-key="\${esc(k)}">
            <small>\${esc(k)}</small>
            <span>\${esc(v)}</span>
            \${isUsed ? \`<span class="mock-word-check">✓</span>\` : ''}
          </div>\`;
        }).join('')}
      </div>
    </div>\`;

  return baseShell(\`
    <div class="mock-section-label">
      <span class="tag">Telc \${esc(model.exercise.level||state.session.level)}</span>
      <span class="mock-task-count">\${esc(model.exercise.section)} · \${esc(model.exercise.teil)}</span>
    </div>
    <div class="mock-reading-panel">\${html}</div>
    \${wordBankMarkup}
  \`);
}

`;

content = content.slice(0, oldSpb2Start) + modernSpb2 + content.slice(oldSpb2End);

// 5. Modernize renderMockLesen1
const oldL1Start = content.indexOf('function renderMockLesen1(model){');
const oldL1End = content.indexOf('function renderMockLesen2(model){');
if (oldL1Start === -1 || oldL1End === -1) {
  console.error('Could not find renderMockLesen1');
  process.exit(1);
}

const modernL1 = `function renderMockLesen1(model){
  window.__mockAnswers = {...itemAnswer(model.exercise.id)};
  const items = model.items || [];
  const heads = getExerciseHeadings(model);
  const usedKeys = new Set(Object.values(window.__mockAnswers).filter(Boolean).map(v => String(v).toUpperCase()));

  const headingsBankMarkup = \`
    <div class="mock-headings-bank">
      <h3><span>📋</span> <span>\${text('قائمة العناوين (Überschriften A bis J):', 'Überschriften (A bis J):')}</span></h3>
      <div class="mock-headings-list">
        \${heads.map((h, i) => {
          const letter = String.fromCharCode(65 + i);
          return \`
          <div class="mock-heading-item">
            <strong class="mock-heading-letter">\${letter}</strong>
            <span>\${esc(h)}</span>
          </div>\`;
        }).join('')}
      </div>
    </div>\`;

  const cardsMarkup = items.map((it, idx) => {
    const n = String(it.position_no);
    const val = String(window.__mockAnswers[n] || window.__mockAnswers[String(it.id)] || '').toUpperCase();
    const selectOptions = heads.map((h, i) => {
      const letter = String.fromCharCode(65 + i);
      const isSelected = val === letter;
      const isUsed = !isSelected && usedKeys.has(letter);
      return \`<option value="\${letter}" \${isSelected ? 'selected' : ''} \${isUsed ? 'disabled' : ''}>\${letter}: \${esc(h)}\${isUsed ? ' - ' + text('تم اختياره', 'bereits gewählt') : ''}</option>\`;
    }).join('');

    return \`
    <article class="mock-item mock-l1-item \${val ? 'answered' : ''}">
      <div class="mock-l1-item-header">
        <span class="mock-num-badge">Text \${idx + 1}</span>
        <select class="mock-select \${val ? 'answered' : ''}" data-answer-q="\${esc(n)}" aria-label="Text \${idx + 1}">
          <option value="">— \${text('اختر العنوان', 'Passende Überschrift auswählen')} —</option>
          \${selectOptions}
        </select>
      </div>
      <div class="mock-task-body">\${escBody(it.prompt || it.body || '')}</div>
    </article>\`;
  }).join('');

  return baseShell(\`
    <div class="mock-section-label">
      <span class="tag">Telc \${esc(model.exercise.level||state.session.level)}</span>
      <span class="mock-task-count">\${esc(model.exercise.section)} · \${esc(model.exercise.teil)}</span>
    </div>
    <div class="mock-spb-head">
      <h3><span>📖</span> <span>\${text('النصوص (1 إلى 5):', 'Texte (1 bis 5):')}</span></h3>
      <span class="mock-task-count">\${Object.keys(window.__mockAnswers).length} / \${items.length}</span>
    </div>
    <div class="mock-l1-list">
      \${cardsMarkup}
    </div>
    \${headingsBankMarkup}
  \`);
}

`;

content = content.slice(0, oldL1Start) + modernL1 + content.slice(oldL1End);

// 6. Modernize renderMockLesen2
const oldL2Start = content.indexOf('function renderMockLesen2(model){');
const oldL2End = content.indexOf('function renderMockLesen3(model){');
if (oldL2Start === -1 || oldL2End === -1) {
  console.error('Could not find renderMockLesen2');
  process.exit(1);
}

const modernL2 = `function renderMockLesen2(model){
  window.__mockAnswers = {...itemAnswer(model.exercise.id)};
  const items = (model.items || []).slice(0, 5);
  const bodyText = getExerciseBody(model);

  const questionsMarkup = items.map((it, idx) => {
    const n = String(it.position_no);
    const val = window.__mockAnswers[n] || window.__mockAnswers[String(it.id)] || '';
    const opts = (it.options || []).slice(0, 3);

    return \`
    <div class="lesen2-question \${val ? 'answered' : ''}" data-item="\${esc(n)}">
      <div class="question-prompt-row">
        <div class="question-prompt-text">
          <span class="question-num">\${it.position_no}</span>
          <span>\${esc(it.prompt || '')}</span>
        </div>
      </div>
      <div class="options-list">
        \${opts.map(o => {
          const isSelected = String(val).toLowerCase() === String(o.option_key).toLowerCase();
          return \`
          <div class="option-row">
            <button type="button" class="side-option mock-option \${isSelected ? 'selected' : ''}" data-answer-q="\${esc(n)}" data-answer="\${esc(o.option_key)}">
              <span class="option-text"><span class="mock-option-key">\${esc(o.option_key)})</span> \${esc(o.option_text || o.option_key)}</span>
            </button>
          </div>\`;
        }).join('')}
      </div>
    </div>\`;
  }).join('');

  return baseShell(\`
    <div class="mock-section-label">
      <span class="tag">Telc \${esc(model.exercise.level||state.session.level)}</span>
      <span class="mock-task-count">\${esc(model.exercise.section)} · \${esc(model.exercise.teil)}</span>
    </div>
    <div class="long-text lesen2-long-text mock-reading-panel">
      <div class="long-text-content">\${escBody(bodyText)}</div>
    </div>
    <div class="mock-spb-head">
      <h3><span>📝</span> <span>\${text('أسئلة الاختيار من متعدد (6 إلى 10):', 'Aufgaben zum Text (6 bis 10):')}</span></h3>
      <span class="mock-task-count">\${Object.keys(window.__mockAnswers).length} / \${items.length}</span>
    </div>
    <div class="lesen2-questions-list">
      \${questionsMarkup}
    </div>
  \`);
}

`;

content = content.slice(0, oldL2Start) + modernL2 + content.slice(oldL2End);

// 7. Modernize renderMockLesen3
const oldL3Start = content.indexOf('function renderMockLesen3(model){');
const oldL3End = content.indexOf('function renderMockHoeren(model){');
if (oldL3Start === -1 || oldL3End === -1) {
  console.error('Could not find renderMockLesen3');
  process.exit(1);
}

const modernL3 = `function renderMockLesen3(model){
  window.__mockAnswers = {...itemAnswer(model.exercise.id)};
  const items = model.items || [];
  const heads = getExerciseHeadings(model);
  const usedAnswerIds = new Set(Object.values(window.__mockAnswers).filter(Boolean).map(v => String(v).toUpperCase()));

  const paragraphsListMarkup = items.map((it, idx) => {
    const q = String(it.position_no);
    const selected = String(window.__mockAnswers[q] || '').toUpperCase();

    const options = heads.map((h, i) => {
      const letter = String.fromCharCode(65 + i);
      const ad = parseAdText(h);
      const fullTitle = ad.title ? ad.title : (ad.body ? ad.body.replace(/\\s+/g, ' ').trim() : '');
      const cleanTitle = (fullTitle || '').replace(/^(?:Text\\s*[A-Z0-9]+|W\\d+|[A-Za-z]|\\d+)\\s*[:—–\\-]\\s*/i, '').replace(/^[a-zA-Z0-9]+[\\)\\.]\\s*/, '').trim() || fullTitle;
      const label = cleanTitle;
      const isSelected = selected === letter;
      const isUsed = usedAnswerIds.has(letter) && !isSelected;
      return \`<option value="\${letter}" \${isSelected ? 'selected' : ''} \${isUsed ? 'disabled' : ''}>\${esc(label)}\${isUsed ? ' — ' + text('تم اختياره', 'Bereits ausgewählt') : ''}</option>\`;
    }).join('') + \`<option value="X" \${selected === 'X' ? 'selected' : ''}>\${text('لا يوجد عنوان مناسب لهذه الفقرة', 'Keine passende Anzeige')}</option>\`;

    return \`
    <article class="mock-item mock-l3-item \${selected ? 'answered' : ''}" id="mock-sit-\${q}">
      <div class="paragraph-assignment">
        <div class="paragraph-assignment-controls">
          <span class="mock-num-badge">\${text('الموقف', 'Situation')} \${q}</span>
          <select class="mock-select \${selected ? 'answered' : ''}" data-answer-q="\${esc(q)}" data-mock-ad-select="\${esc(q)}" aria-label="\${esc(it.prompt)}">
            <option value="">— \${text('اختر العنوان أو الإعلان', 'Passende Anzeige auswählen')} —</option>
            \${options}
          </select>
          \${selected ? \`<button type="button" class="assignment-selected" data-mock-clear="\${esc(q)}" aria-label="\${text('إلغاء الاختيار','Auswahl löschen')}"><span>\${selected === 'X' ? 'X' : 'Text ' + selected}</span><b>×</b></button>\` : ''}
        </div>
      </div>
      <div class="mock-task-body">\${escBody(it.prompt)}</div>
    </article>\`;
  }).join('');

  const headingsOverview = \`
    <div class="mock-headings-bank lesen3-headings-overview">
      <div class="lesen3-overview-head">
        <div>
          <h3>
            <span>📰</span>
            <span>\${text('قائمة العناوين والإعلانات المتاحة (12 إعلاناً — Anzeigen A bis L):', 'Verfügbare Anzeigen (Text A bis L):')}</span>
          </h3>
          <small class="muted">\${text('اقرأ الفقرات الـ 10 بالأعلى واختر لكل فقرة العنوان المناسب، أو اختر (X) إذا لم يكن لها عنوان مناسب. لا يمكن استخدام العنوان لأكثر من فقرة واحدة.', 'Wählen Sie oben für jeden Absatz die passende Anzeige aus, oder X wenn keine Anzeige passt.')}</small>
        </div>
        <span class="mock-task-count">\${Object.keys(window.__mockAnswers).length} / \${items.length}</span>
      </div>
      <div class="mock-headings-list lesen3-ads-list">
        \${heads.map((h, i) => {
          const letter = String.fromCharCode(65 + i);
          const ad = parseAdText(h);
          const assignedItem = items.find(it => String(window.__mockAnswers[String(it.position_no)] || '').toUpperCase() === letter);
          const assignedNo = assignedItem ? String(assignedItem.position_no) : '';
          const rawText = (typeof h === 'object') ? [h.title, h.body || h.text || h.content].filter(Boolean).join('\\n\\n') : String(h).trim();
          return \`
          <div class="mock-heading-item lesen3-ad-card \${assignedNo ? 'is-used' : ''}">
            <div class="lesen3-ad-head">
              <strong class="lesen3-ad-title">
                <span class="mock-badge-letter">Text \${letter}</span>
                \${ad.title ? \`<span class="lesen3-ad-subtitle">— \${esc(ad.title)}</span>\` : ''}
              </strong>
              \${assignedNo ? \`<span class="lesen3-assigned-tag">✓ \${text('مخصص للفقرة ' + assignedNo, 'Zugeordnet zu Absatz ' + assignedNo)}</span>\` : ''}
            </div>
            <div class="mock-ad-content">
              \${escBody(ad.body || (ad.title ? '' : rawText))}
            </div>
          </div>\`;
        }).join('')}
      </div>
    </div>\`;

  return baseShell(\`
    <div class="mock-section-label">
      <span class="tag">Telc \${esc(model.exercise.level||state.session.level)}</span>
      <span class="mock-task-count">\${esc(model.exercise.section)} · \${esc(model.exercise.teil)}</span>
    </div>
    <div class="mock-spb-head">
      <h3><span>📋</span> <span>\${text('الفقرات العشر (المواقف 1 إلى 10):', 'Die 10 Situationen (Absätze 1 bis 10):')}</span></h3>
      <span class="mock-task-count">\${Object.keys(window.__mockAnswers).length} / \${items.length}</span>
    </div>
    <div class="mock-l3-list">
      \${paragraphsListMarkup}
    </div>
    \${headingsOverview}
  \`);
}

`;

content = content.slice(0, oldL3Start) + modernL3 + content.slice(oldL3End);

// 8. Modernize renderMockHoeren
const oldHStart = content.indexOf('function renderMockHoeren(model){');
const oldHEnd = content.indexOf('/* ─── 7. Schreiben Renderer ─── */');
if (oldHStart === -1 || oldHEnd === -1) {
  console.error('Could not find renderMockHoeren');
  process.exit(1);
}

const modernH = `function renderMockHoeren(model){
  window.__mockAnswers = {...itemAnswer(model.exercise.id)};
  const items = model.items || [];
  const isTF = items.every(it => {
    const keys = (it.options || []).map(o => String(o.option_key||'').toLowerCase());
    return keys.length === 0 || keys.includes('richtig') || keys.includes('falsch');
  });

  const audioBox = renderUnifiedAudioPlayer(model.exercise.audio_url);

  let questionsMarkup = '';
  if (isTF) {
    questionsMarkup = \`
      <div class="hoeren-table-card">
        <div class="hoeren-table-head">
          <div class="hoeren-th hoeren-th-r">\${text('صحيح','RICHTIG')}</div>
          <div class="hoeren-th hoeren-th-f">\${text('خطأ','FALSCH')}</div>
          <div class="hoeren-th hoeren-th-statement">\${text('العبارة','AUSSAGE')}</div>
        </div>
        <div class="hoeren-table-body">
          \${items.map((it, idx) => {
            const n = String(it.position_no);
            const val = String(window.__mockAnswers[n] || window.__mockAnswers[String(it.id)] || '').toLowerCase();
            const isR = val === 'richtig';
            const isF = val === 'falsch';
            return \`
            <div class="hoeren-table-row \${val ? 'answered' : ''}" data-item="\${esc(n)}">
              <div class="hoeren-cell hoeren-cell-r">
                <button type="button" class="hoeren-circle-radio-btn \${isR ? 'selected' : ''}" data-answer-q="\${esc(n)}" data-answer="richtig" aria-label="\${idx + 1} Richtig" title="Richtig">
                  <span class="hoeren-circle-radio"></span>
                  <span class="hoeren-circle-radio-label">\${text('صحيح','Richtig')}</span>
                </button>
              </div>
              <div class="hoeren-cell hoeren-cell-f">
                <button type="button" class="hoeren-circle-radio-btn \${isF ? 'selected' : ''}" data-answer-q="\${esc(n)}" data-answer="falsch" aria-label="\${idx + 1} Falsch" title="Falsch">
                  <span class="hoeren-circle-radio"></span>
                  <span class="hoeren-circle-radio-label">\${text('خطأ','Falsch')}</span>
                </button>
              </div>
              <div class="hoeren-cell hoeren-cell-statement">
                <div class="hoeren-stmt-content">
                  <span class="hoeren-stmt-num">\${idx + 1}.</span>
                  <span class="hoeren-stmt-text">\${esc(it.prompt)}</span>
                </div>
              </div>
            </div>\`;
          }).join('')}
        </div>
      </div>\`;
  } else {
    questionsMarkup = \`
      <div class="lesen2-questions-list hoeren-choice-list">
        \${items.map((it, idx) => {
          const n = String(it.position_no);
          const val = String(window.__mockAnswers[n] || window.__mockAnswers[String(it.id)] || '').toLowerCase();
          const opts = it.options && it.options.length ? it.options : [{option_key:'a',option_text:'a'},{option_key:'b',option_text:'b'},{option_key:'c',option_text:'c'}];
          return \`
          <div class="lesen2-question hoeren-choice-card \${val ? 'answered' : ''}" data-item="\${esc(n)}">
            <div class="question-prompt-row">
              <div class="question-prompt-text">
                <span class="question-num">\${idx + 1}</span>
                <span>\${esc(it.prompt || '')}</span>
              </div>
            </div>
            <div class="options-list">
              \${opts.map(o => {
                const isSelected = val === String(o.option_key).toLowerCase();
                return \`
                <div class="option-row">
                  <button type="button" class="side-option mock-option \${isSelected ? 'selected' : ''}" data-answer-q="\${esc(n)}" data-answer="\${esc(o.option_key)}">
                    <span class="option-text"><span class="mock-option-key">\${esc(o.option_key)})</span> \${esc(o.option_text || o.option_key)}</span>
                  </button>
                </div>\`;
              }).join('')}
            </div>
          </div>\`;
        }).join('')}
      </div>\`;
  }

  return baseShell(\`
    <div class="mock-section-label">
      <span class="tag">Telc \${esc(model.exercise.level||state.session.level)}</span>
      <span class="mock-task-count">\${esc(model.exercise.section)} · \${esc(model.exercise.teil)}</span>
    </div>
    \${audioBox}
    <div class="mock-spb-head">
      <h3><span>🎧</span> <span>\${text('أسئلة الاستماع:', 'Hörverstehensaufgaben:')}</span></h3>
      <span class="mock-task-count">\${Object.keys(window.__mockAnswers).length} / \${items.length}</span>
    </div>
    \${questionsMarkup}
  \`);
}

`;

content = content.slice(0, oldHStart) + modernH + content.slice(oldHEnd);

// 9. Modernize renderWriting
const oldWStart = content.indexOf('function renderWriting(model){');
const oldWEnd = content.indexOf('/* ─── 8. Generic Choice Fallback ─── */');
if (oldWStart === -1 || oldWEnd === -1) {
  console.error('Could not find renderWriting');
  process.exit(1);
}

const modernW = `function renderWriting(model){
  const settings = parseSettings(model.exercise);
  const answer = state.session?.writingByExercise?.[String(model.exercise.id)] || '';
  return baseShell(\`
    <div class="mock-section-label">
      <span class="tag">Telc \${esc(model.exercise.level||state.session.level)}</span>
      <span class="mock-task-count">Schreiben · \${esc(model.exercise.teil)}</span>
    </div>
    <div class="mock-writing-grid">
      <div class="mock-writing-left-col">
        <div class="mock-writing-box mock-writing-situation">
          <h3>Situation</h3>
          <div class="mock-task-body">\${escBody(settings.situation_text||model.exercise.body||'')}</div>
        </div>
        \${settings.task_text ? \`
          <div class="mock-writing-box mock-writing-task" style="margin-top:16px">
            <h3>Aufgabe</h3>
            <div class="mock-task-body">\${escBody(settings.task_text)}</div>
          </div>\` : ''}
      </div>
      <div class="mock-writing-box mock-writing-editor">
        <h3>\${text('إجابتك','Deine Antwort')}</h3>
        <div class="mock-writing-char-toolbar" aria-label="\${text('حروف ألمانية مساعدة','Deutsche Sonderzeichen')}">
          \${['ä','ö','ü','ß','Ä','Ö','Ü'].map(ch=>\`<button type="button" class="mock-writing-char-btn" data-insert-char="\${ch}">\${ch}</button>\`).join('')}
        </div>
        <textarea id="writingAnswer" placeholder="\${text('اكتب إجابتك بالألمانية هنا…','Schreibe deine Antwort auf Deutsch…')}">\${esc(answer)}</textarea>
        <div class="mock-editor-meta">
          <span id="writingWords">0 Wörter</span>
          <span>150+ Wörter empfohlen</span>
        </div>
      </div>
    </div>
  \`);
}

`;

content = content.slice(0, oldWStart) + modernW + content.slice(oldWEnd);

// 10. Modernize renderChoice
const oldCStart = content.indexOf('function renderChoice(model){');
const oldCEnd = content.indexOf('/* ─── Task Content Dispatcher ─── */');
if (oldCStart === -1 || oldCEnd === -1) {
  console.error('Could not find renderChoice');
  process.exit(1);
}

const modernC = `function renderChoice(model){
  window.__mockAnswers = {...itemAnswer(model.exercise.id)};
  const items = model.items || [];
  const isMatching = model.exercise.task_type === 'MATCHING';
  let html = \`
    <div class="mock-section-label">
      <span class="tag">Telc \${esc(model.exercise.level||state.session.level)}</span>
      <span class="mock-task-count">\${esc(model.exercise.teil)}</span>
    </div>
    <div class="mock-task-body">\${escBody(model.exercise.body||'')}</div>\`;

  if(model.exercise.audio_url){
    html += renderUnifiedAudioPlayer(model.exercise.audio_url);
  }

  html += items.map(it => {
    const val = window.__mockAnswers[String(it.position_no)] || window.__mockAnswers[String(it.id)] || '';
    const opts = (it.options && it.options.length ? it.options : [{option_key:'Richtig',option_text:'Richtig'},{option_key:'Falsch',option_text:'Falsch'}]);
    if(isMatching){
      return \`
      <article class="mock-item">
        <div class="mock-item-prompt">\${esc(it.prompt)}</div>
        <select class="mock-select" data-answer-q="\${esc(it.position_no)}">
          <option value="">— \${text('اختر الإجابة','Antwort wählen')} —</option>
          \${opts.map(o=>\`<option value="\${esc(o.option_key)}" \${String(val)===String(o.option_key)?'selected':''}>\${esc(o.option_text)}</option>\`).join('')}
        </select>
      </article>\`;
    }
    return \`
    <article class="mock-item">
      <div class="mock-item-prompt">\${esc(it.prompt)}</div>
      <div class="options-list">
        \${opts.map(o=>\`
          <div class="option-row">
            <button type="button" class="side-option mock-option \${String(val)===String(o.option_key)?'selected':''}" data-answer-q="\${esc(it.position_no)}" data-answer="\${esc(o.option_key)}">
              <span class="mock-option-key">\${esc(o.option_key)})</span>
              <span>\${esc(o.option_text)}</span>
            </button>
          </div>
        \`).join('')}
      </div>
    </article>\`;
  }).join('');

  return baseShell(html);
}

`;

content = content.slice(0, oldCStart) + modernC + content.slice(oldCEnd);

fs.writeFileSync(mockPath, content, 'utf8');
console.log('Successfully modernized Phase 7C Mock Exam Question Workspaces!');
