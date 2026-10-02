const fs = require('fs');

const section18 = `
/* =========================================================
   18. SPRACHBAUSTEINE WORKSPACE (PHASE 6E)
   Quiet Luxury • Flat Reading Surface • Precision Gap Selects • Word Bank
   ========================================================= */

/* 18.1 WORKSPACE MEASURE & READING TEXT CONTAINER */
.exam-workspace.spb1,
.exam-workspace.spb2-workspace {
  width: 100% !important;
  max-width: min(1200px, calc(100% - 48px)) !important;
  margin: 0 auto !important;
  box-sizing: border-box !important;
}

.exam-workspace.spb1 .exam-main,
.exam-workspace.spb2-workspace .exam-main {
  width: 100% !important;
  max-width: 100% !important;
  padding: 0 0 120px 0 !important;
  margin: 0 auto !important;
}

.exam-workspace.spb1 .long-text,
.exam-workspace.spb2-workspace .long-text {
  background: var(--bg-surface) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-lg, 18px) !important;
  padding: 32px 36px !important;
  box-shadow: var(--shadow-card) !important;
  line-height: 2 !important;
  font-size: 16.5px !important;
  font-weight: 450 !important;
  letter-spacing: 0.01em !important;
  position: relative !important;
  box-sizing: border-box !important;
  direction: ltr !important;
  text-align: left !important;
}

#spb1-text,
#gap2-text {
  direction: ltr !important;
  text-align: left !important;
  line-height: 2 !important;
}

/* 18.2 INLINE GAP SELECTS (TEIL 1 & TEIL 2) */
.inline-gap-select,
[data-gap-select] {
  appearance: none !important;
  -webkit-appearance: none !important;
  display: inline-flex !important;
  align-items: center !important;
  vertical-align: middle !important;
  margin: 0 4px !important;
  padding: 5px 28px 5px 12px !important;
  font-family: inherit !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  background: var(--bg-surface-elevated) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 9px center !important;
  border: 1.5px solid var(--border-subtle) !important;
  border-radius: var(--radius-sm, 9px) !important;
  cursor: pointer !important;
  min-height: 38px !important;
  max-width: min(220px, calc(100% - 16px)) !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  box-shadow: var(--shadow-subtle) !important;
  box-sizing: border-box !important;
  transition: all var(--duration-fast) var(--ease-spring) !important;
}

.inline-gap-select:hover {
  border-color: var(--brand-primary) !important;
  background-color: var(--brand-subtle) !important;
  transform: translateY(-1px) !important;
}

.inline-gap-select:focus-visible {
  outline: none !important;
  border-color: var(--brand-primary) !important;
  box-shadow: 0 0 0 3px var(--state-focus-ring) !important;
}

/* Answered State (Brand Interaction) */
.inline-gap-select.answered {
  border-color: var(--brand-primary) !important;
  background-color: color-mix(in srgb, var(--brand-primary) 7%, var(--bg-surface-elevated)) !important;
  color: var(--text-primary) !important;
  box-shadow: 0 0 0 1px var(--brand-primary) !important;
}

/* Post-submission Semantic States */
.inline-gap-select.result-correct,
.inline-gap-select.model-correct {
  border-color: var(--state-success) !important;
  background-color: var(--state-success-subtle) !important;
  color: var(--state-success) !important;
  font-weight: 800 !important;
  box-shadow: 0 0 0 1px var(--state-success) !important;
}

.inline-gap-select.result-wrong {
  border-color: var(--state-danger) !important;
  background-color: var(--state-danger-subtle) !important;
  color: var(--state-danger) !important;
  font-weight: 800 !important;
  box-shadow: 0 0 0 1px var(--state-danger) !important;
}

/* 18.3 TEIL 2 INLINE GAP FEEDBACK BADGES */
.spb2-gap-wrapper {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  flex-wrap: wrap !important;
  vertical-align: middle !important;
  margin: 2px 2px !important;
}

.spb2-gap-feedback {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  padding: 4px 10px !important;
  border-radius: var(--radius-xs, 7px) !important;
  font-size: 12.5px !important;
  font-weight: 750 !important;
  font-style: normal !important;
  letter-spacing: 0.01em !important;
}

.spb2-gap-correction {
  background: var(--state-danger-subtle) !important;
  color: var(--state-danger) !important;
  border: 1px solid var(--state-danger-border, rgba(239, 68, 68, 0.35)) !important;
}

.spb2-gap-model {
  background: var(--state-info-subtle) !important;
  color: var(--state-info) !important;
  border: 1px solid var(--state-info-border, rgba(14, 165, 233, 0.35)) !important;
}

/* 18.4 TEIL 1: QUESTIONS GRID & OPTIONS UNDER TEXT */
.spb-questions-container {
  margin-top: 32px !important;
  padding-top: 24px !important;
  border-top: 1px solid var(--border-subtle) !important;
}

.spb-questions-head {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 18px !important;
  flex-wrap: wrap !important;
  gap: 12px !important;
}

.spb-questions-head h3 {
  margin: 0 !important;
  font-size: 17px !important;
  font-weight: 850 !important;
  color: var(--text-primary) !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.spb-questions-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
  gap: 16px !important;
}

.spb1-question {
  background: var(--bg-surface-elevated) !important;
  border: 1.5px solid var(--border-subtle) !important;
  border-radius: var(--radius-md, 14px) !important;
  padding: 16px 18px !important;
  box-shadow: var(--shadow-subtle) !important;
  transition: all var(--duration-fast) var(--ease-spring) !important;
}

.spb1-question:hover {
  border-color: var(--border-strong) !important;
}

.spb1-question .question-prompt {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  font-size: 13px !important;
  font-weight: 800 !important;
  color: var(--text-secondary) !important;
  margin-bottom: 12px !important;
}

.spb1-question .question-prompt strong {
  width: 28px !important;
  height: 28px !important;
  border-radius: var(--radius-xs, 6px) !important;
  background: var(--brand-subtle) !important;
  color: var(--brand-primary) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 13px !important;
  font-weight: 850 !important;
  border: 1px solid var(--brand-border, rgba(255, 122, 47, 0.25)) !important;
}

.spb1-option-wrap {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto !important;
  align-items: center !important;
  gap: 8px !important;
  margin: 6px 0 !important;
}

.spb1-option-wrap .side-option {
  width: 100% !important;
  min-height: 42px !important;
  border-radius: var(--radius-sm, 10px) !important;
  border: 1.5px solid var(--border-subtle) !important;
  background: var(--bg-surface) !important;
  color: var(--text-primary) !important;
  font-size: 14px !important;
  font-weight: 650 !important;
  padding: 8px 14px !important;
  text-align: center !important;
  cursor: pointer !important;
  box-shadow: var(--shadow-subtle) !important;
  transition: all var(--duration-fast) var(--ease-spring) !important;
}

.spb1-option-wrap .side-option:hover {
  border-color: var(--brand-primary) !important;
  background: var(--brand-subtle) !important;
  transform: translateY(-1px) !important;
}

.spb1-option-wrap .side-option:active {
  transform: scale(0.98) !important;
}

.spb1-option-wrap .side-option:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 3px var(--state-focus-ring) !important;
}

.spb1-option-wrap .side-option.selected {
  border-color: var(--brand-primary) !important;
  background: color-mix(in srgb, var(--brand-primary) 8%, var(--bg-surface)) !important;
  box-shadow: 0 0 0 1px var(--brand-primary) !important;
  font-weight: 750 !important;
}

.spb1-option-wrap .side-option.result-correct,
.spb1-option-wrap .side-option.model-correct {
  border-color: var(--state-success) !important;
  background: var(--state-success-subtle) !important;
  color: var(--state-success) !important;
  font-weight: 800 !important;
  box-shadow: 0 0 0 1px var(--state-success) !important;
}

.spb1-option-wrap .side-option.result-wrong {
  border-color: var(--state-danger) !important;
  background: var(--state-danger-subtle) !important;
  color: var(--state-danger) !important;
  font-weight: 800 !important;
  box-shadow: 0 0 0 1px var(--state-danger) !important;
}

.spb-correct-hint {
  margin-bottom: 10px !important;
}

/* 18.5 TEIL 2: WORD BANK BLOCK & WORD CARDS */
.gap2-wordbank-block {
  margin-top: 32px !important;
  padding-top: 24px !important;
  border-top: 1px solid var(--border-subtle) !important;
}

.gap2-wordbank-head {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 16px !important;
  flex-wrap: wrap !important;
  gap: 12px !important;
}

.gap2-wordbank-head h3 {
  margin: 0 !important;
  font-size: 17px !important;
  font-weight: 850 !important;
  color: var(--text-primary) !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.shuffle-words.shuffle-btn-styled {
  height: 36px !important;
  padding: 0 14px !important;
  border-radius: var(--radius-sm, 10px) !important;
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle) !important;
  color: var(--text-primary) !important;
  font-size: 13px !important;
  font-weight: 750 !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  cursor: pointer !important;
  box-shadow: var(--shadow-subtle) !important;
  transition: all var(--duration-fast) var(--ease-spring) !important;
}

.shuffle-words.shuffle-btn-styled:hover {
  border-color: var(--brand-primary) !important;
  color: var(--brand-primary) !important;
  background: var(--brand-subtle) !important;
  transform: translateY(-1px) !important;
}

.word-bank {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
  gap: 12px !important;
  direction: ltr !important;
}

.word-card-wrap {
  position: relative !important;
  width: 100% !important;
}

.word-card {
  width: 100% !important;
  min-height: 48px !important;
  border-radius: var(--radius-md, 12px) !important;
  background: var(--bg-surface-elevated) !important;
  border: 1.5px solid var(--border-subtle) !important;
  padding: 10px 14px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  cursor: pointer !important;
  box-shadow: var(--shadow-subtle) !important;
  box-sizing: border-box !important;
  transition: all var(--duration-fast) var(--ease-spring) !important;
}

.word-card b {
  font-size: 14.5px !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  letter-spacing: 0.01em !important;
  transition: color var(--duration-fast) ease !important;
}

.word-card:hover:not(.used) {
  border-color: var(--brand-primary) !important;
  background: var(--brand-subtle) !important;
  transform: translateY(-1.5px) !important;
  box-shadow: var(--shadow-card) !important;
}

.word-card:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 3px var(--state-focus-ring) !important;
}

/* Word Bank: Used State */
.word-card.used {
  opacity: 0.45 !important;
  background: var(--bg-surface) !important;
  border: 1.5px dashed var(--border-strong) !important;
  cursor: default !important;
  transform: none !important;
  box-shadow: none !important;
}

.word-card.used b {
  color: var(--text-muted) !important;
  text-decoration: line-through !important;
}

/* Word Bank: Model Solution State */
.word-card.model-correct {
  border-color: var(--state-success) !important;
  background: var(--state-success-subtle) !important;
}

.word-card.model-correct b {
  color: var(--state-success) !important;
  font-weight: 800 !important;
}

/* 18.6 RESPONSIVE AUDIT & MOBILE RULES */
@media (max-width: 768px) {
  .exam-workspace.spb1 .long-text,
  .exam-workspace.spb2-workspace .long-text {
    padding: 20px 16px !important;
    border-radius: var(--radius-md, 14px) !important;
    font-size: 15.5px !important;
    line-height: 1.8 !important;
  }

  .inline-gap-select,
  [data-gap-select] {
    max-width: 180px !important;
    font-size: 13px !important;
    min-height: 36px !important;
    padding: 4px 24px 4px 10px !important;
  }

  .spb-questions-grid {
    grid-template-columns: 1fr !important;
  }

  .word-bank {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
  }
}

@media (max-width: 430px) {
  .exam-workspace.spb1 .long-text,
  .exam-workspace.spb2-workspace .long-text {
    padding: 16px 12px !important;
    font-size: 15px !important;
    line-height: 1.75 !important;
  }

  .inline-gap-select,
  [data-gap-select] {
    max-width: 150px !important;
    font-size: 12.5px !important;
    min-height: 34px !important;
    padding: 3px 20px 3px 8px !important;
    margin: 2px 2px !important;
  }

  .word-bank {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
  }

  .word-card {
    min-height: 42px !important;
    padding: 8px 10px !important;
  }

  .word-card b {
    font-size: 13px !important;
  }
}

@media (max-width: 360px) {
  .inline-gap-select,
  [data-gap-select] {
    max-width: 130px !important;
    font-size: 12px !important;
  }

  .word-bank {
    grid-template-columns: 1fr !important;
  }
}

/* 18.7 RTL / LTR CONTENT INTEGRITY */
[dir="rtl"] #spb1-text,
[dir="rtl"] #gap2-text,
[dir="rtl"] .inline-gap-select,
[dir="rtl"] .word-bank,
[dir="rtl"] .spb-questions-grid {
  direction: ltr !important;
  text-align: left !important;
}
`;

let css = fs.readFileSync('public/assets/app.css', 'utf8');
css = css.trimEnd() + '\n\n' + section18.trim() + '\n';
fs.writeFileSync('public/assets/app.css', css, 'utf8');
console.log('Successfully appended Section 18 to public/assets/app.css!');
