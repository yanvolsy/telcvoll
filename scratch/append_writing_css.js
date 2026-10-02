const fs = require('fs');

const section19Css = `
/* ==========================================================================
   19. SCHREIBEN WORKSPACE MODERNIZATION (PHASE 6F)
   ========================================================================== */

/* 19.1 WRITING PAGE SHELL & WORKSPACE GRID */
.writing-page-shell {
  max-width: 1400px;
  margin: 0 auto;
  padding: 18px 20px 80px;
  box-sizing: border-box;
}

.writing-workspace {
  display: grid !important;
  grid-template-columns: minmax(360px, 460px) minmax(0, 1fr) !important;
  gap: 24px !important;
  align-items: start !important;
  direction: ltr !important;
  min-height: calc(100vh - 220px);
}

/* 19.2 WRITING LEFT PANEL (SITUATION, AUFGABE, RULES) */
.writing-left {
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
  min-width: 0 !important;
  direction: ltr !important;
}

.writing-time-rule {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 10px 16px !important;
  border-radius: var(--radius-md, 10px) !important;
  background: var(--bg-surface-elevated, var(--bg-surface)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  color: var(--text-primary) !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  width: fit-content !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04)) !important;
}

.writing-time-rule-icon {
  color: var(--brand-primary);
  font-size: 15px;
  line-height: 1;
}

.writing-exam-note {
  display: flex !important;
  align-items: flex-start !important;
  gap: 10px !important;
  padding: 12px 16px !important;
  border-radius: var(--radius-md, 10px) !important;
  background: rgba(59, 130, 246, 0.06) !important;
  border: 1px solid rgba(59, 130, 246, 0.22) !important;
  color: var(--text-primary) !important;
  font-size: 13px !important;
  line-height: 1.65 !important;
  box-sizing: border-box !important;
}

.writing-exam-note-icon {
  color: #3b82f6;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.4;
  flex-shrink: 0;
}

.writing-exam-note strong {
  color: var(--text-primary);
  font-weight: 700;
}

.writing-block {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-lg, 14px) !important;
  padding: 18px 20px !important;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04)) !important;
  box-sizing: border-box !important;
}

.writing-block > h2 {
  font-size: 15px !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  margin: 0 0 12px !important;
  letter-spacing: -0.01em !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.writing-german-content {
  direction: ltr !important;
  text-align: left !important;
  font-size: 15px !important;
  line-height: 1.75 !important;
  color: var(--text-primary) !important;
  unicode-bidi: isolate !important;
}

.writing-model-card {
  border-color: rgba(var(--brand-rgb, 234, 88, 12), 0.35) !important;
  background: linear-gradient(180deg, var(--bg-surface), var(--bg-surface-elevated, var(--bg-surface))) !important;
}

.writing-model-head {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 10px !important;
  margin-bottom: 12px !important;
}

.writing-model-head h2 {
  margin: 0 !important;
  color: var(--brand-primary) !important;
  font-size: 15px !important;
}

.writing-model-body {
  white-space: pre-wrap !important;
  font-size: 14.5px !important;
  line-height: 1.8 !important;
  color: var(--text-primary) !important;
  direction: ltr !important;
  text-align: left !important;
}

/* 19.3 WRITING EDITOR STUDIO */
.writing-editor {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-xl, 16px) !important;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04)) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  position: relative !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}

.editor-tools {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 12px !important;
  padding: 12px 18px !important;
  border-bottom: 1px solid var(--border-subtle, var(--line)) !important;
  background: var(--bg-surface-elevated, var(--bg-surface)) !important;
  flex-wrap: wrap !important;
  box-sizing: border-box !important;
}

.editor-chars {
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
  flex-wrap: wrap !important;
  direction: ltr !important;
}

.char-btn {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  padding: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  color: var(--text-primary) !important;
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-default, var(--line)) !important;
  border-radius: var(--radius-sm, 8px) !important;
  cursor: pointer !important;
  transition: transform 0.12s ease, background 0.15s ease, border-color 0.15s ease, color 0.15s ease !important;
  user-select: none !important;
  box-sizing: border-box !important;
}

.char-btn:hover {
  background: var(--bg-surface-hover, rgba(255, 255, 255, 0.06)) !important;
  border-color: var(--brand-primary) !important;
  color: var(--brand-primary) !important;
  transform: translateY(-1px) !important;
}

.char-btn:active {
  transform: translateY(1px) !important;
}

.editor-counter-wrap {
  display: inline-flex !important;
  align-items: center !important;
  margin-inline-start: auto !important;
}

#wordCount.writing-word-counter {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 5px 12px !important;
  border-radius: 999px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  letter-spacing: 0.01em !important;
  background: var(--bg-canvas) !important;
  color: var(--text-secondary) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  transition: all 0.2s ease !important;
  white-space: nowrap !important;
}

#wordCount.writing-word-counter.word-count-reached {
  background: rgba(34, 197, 94, 0.12) !important;
  color: #16a34a !important;
  border-color: rgba(34, 197, 94, 0.4) !important;
  font-weight: 700 !important;
}

#writingAnswer {
  width: 100% !important;
  min-height: 420px !important;
  padding: 18px 20px !important;
  font-family: var(--font-sans, system-ui, -apple-system, sans-serif) !important;
  font-size: 16px !important;
  line-height: 1.75 !important;
  color: var(--text-primary) !important;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  resize: vertical !important;
  box-sizing: border-box !important;
  direction: ltr !important;
  text-align: left !important;
  unicode-bidi: plaintext !important;
}

#writingAnswer:focus {
  outline: none !important;
}

#writingAnswer::placeholder {
  color: var(--text-muted) !important;
  opacity: 0.7 !important;
}

.editor-bottom {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 12px !important;
  padding: 14px 18px !important;
  border-top: 1px solid var(--border-subtle, var(--line)) !important;
  background: var(--bg-surface-elevated, var(--bg-surface)) !important;
  flex-wrap: wrap !important;
  box-sizing: border-box !important;
}

.ai-check-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  padding: 11px 22px !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  color: #fff !important;
  background: var(--brand-primary) !important;
  border: 1px solid var(--brand-primary) !important;
  border-radius: var(--radius-md, 10px) !important;
  cursor: pointer !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease !important;
  box-shadow: 0 2px 8px rgba(var(--brand-rgb, 234, 88, 12), 0.28) !important;
}

.ai-check-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 14px rgba(var(--brand-rgb, 234, 88, 12), 0.38) !important;
}

.ai-check-btn:active {
  transform: translateY(0) !important;
}

.ai-check-btn:disabled {
  opacity: 0.65 !important;
  cursor: wait !important;
  transform: none !important;
  box-shadow: none !important;
}

.ai-sparkle-icon {
  font-size: 14px;
  line-height: 1;
}

.editor-bottom .model-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 10px 16px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  color: var(--text-primary) !important;
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-default, var(--line)) !important;
  border-radius: var(--radius-md, 10px) !important;
  cursor: pointer !important;
  transition: background 0.15s ease, border-color 0.15s ease !important;
}

.editor-bottom .model-btn:hover {
  background: var(--bg-surface-hover, rgba(255, 255, 255, 0.06)) !important;
  border-color: var(--brand-primary) !important;
}

/* 19.4 AI CORRECTION & EVALUATION PANEL */
.writing-ai-result {
  margin-top: 24px !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-xl, 16px) !important;
  background: var(--bg-surface) !important;
  overflow: hidden !important;
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.06)) !important;
  box-sizing: border-box !important;
  width: 100% !important;
}

.ai-result-head {
  display: flex !important;
  align-items: flex-start !important;
  justify-content: space-between !important;
  gap: 16px !important;
  padding: 22px 24px !important;
  background: linear-gradient(135deg, rgba(var(--brand-rgb, 234, 88, 12), 0.08) 0%, transparent 100%) !important;
  border-bottom: 1px solid var(--border-subtle, var(--line)) !important;
}

.ai-label {
  font-size: 12px !important;
  font-weight: 800 !important;
  letter-spacing: 0.04em !important;
  color: var(--brand-primary) !important;
  text-transform: uppercase !important;
}

.ai-score-line {
  display: flex !important;
  align-items: baseline !important;
  gap: 6px !important;
  direction: ltr !important;
  margin-top: 6px !important;
}

.ai-score-line strong {
  font-size: 48px !important;
  font-weight: 800 !important;
  line-height: 1 !important;
  color: var(--text-primary) !important;
  letter-spacing: -0.02em !important;
}

.ai-score-line span {
  font-size: 20px !important;
  font-weight: 700 !important;
  color: var(--text-muted) !important;
}

.ai-score-note {
  display: block !important;
  font-size: 12px !important;
  color: var(--text-secondary) !important;
  margin-top: 6px !important;
}

.ai-summary {
  padding: 18px 24px !important;
  border-bottom: 1px solid var(--border-subtle, var(--line)) !important;
  line-height: 1.75 !important;
  font-size: 14px !important;
}

.ai-summary strong {
  display: block !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  margin-bottom: 6px !important;
}

.ai-summary p {
  margin: 0 !important;
  color: var(--text-secondary) !important;
}

.ai-criteria {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 12px !important;
  padding: 18px 24px !important;
  border-bottom: 1px solid var(--border-subtle, var(--line)) !important;
}

.ai-criterion {
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-md, 10px) !important;
  padding: 14px !important;
  background: var(--bg-canvas) !important;
  box-sizing: border-box !important;
}

.ai-criterion-head {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  color: var(--text-primary) !important;
}

.ai-bar {
  height: 6px !important;
  background: var(--border-subtle, var(--line)) !important;
  border-radius: 99px !important;
  overflow: hidden !important;
  margin: 9px 0 !important;
}

.ai-bar i {
  display: block !important;
  height: 100% !important;
  background: var(--brand-primary) !important;
  border-radius: inherit !important;
  transition: width 0.4s ease !important;
}

.ai-criterion p {
  font-size: 12px !important;
  color: var(--text-muted) !important;
  margin: 0 !important;
  line-height: 1.55 !important;
}

.ai-two-col {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 14px !important;
  padding: 18px 24px !important;
  border-bottom: 1px solid var(--border-subtle, var(--line)) !important;
}

.ai-two-col > div {
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-md, 10px) !important;
  padding: 16px !important;
  background: var(--bg-canvas) !important;
}

.ai-two-col h3 {
  font-size: 14px !important;
  font-weight: 700 !important;
  margin: 0 0 10px !important;
  color: var(--text-primary) !important;
}

.ai-two-col ul {
  margin: 0 !important;
  padding-inline-start: 18px !important;
  line-height: 1.75 !important;
  font-size: 13px !important;
  color: var(--text-secondary) !important;
}

.ai-task-warning {
  margin: 18px 24px !important;
  border: 1px solid rgba(245, 158, 11, 0.35) !important;
  border-radius: var(--radius-md, 10px) !important;
  padding: 16px !important;
  background: rgba(245, 158, 11, 0.08) !important;
}

.ai-task-warning h3 {
  font-size: 14px !important;
  font-weight: 700 !important;
  margin: 0 0 8px !important;
  color: #d97706 !important;
}

.ai-task-warning ul {
  margin: 0 !important;
  padding-inline-start: 18px !important;
  line-height: 1.7 !important;
  font-size: 13px !important;
  color: var(--text-primary) !important;
}

.ai-section {
  margin: 18px 24px !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-md, 10px) !important;
  padding: 18px !important;
  background: var(--bg-canvas) !important;
}

.ai-section h3 {
  font-size: 15px !important;
  font-weight: 700 !important;
  margin: 0 0 12px !important;
  color: var(--text-primary) !important;
}

.ai-corrections {
  display: grid !important;
  gap: 10px !important;
}

.ai-correction {
  padding: 12px 14px !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-sm, 8px) !important;
  background: var(--bg-surface) !important;
}

.ai-correction-diff {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex-wrap: wrap !important;
  direction: ltr !important;
  text-align: left !important;
}

.ai-correction-diff del {
  color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.08) !important;
  padding: 2px 7px !important;
  border-radius: 4px !important;
  text-decoration: line-through !important;
  font-weight: 500 !important;
  font-size: 14px !important;
}

.ai-correction-arrow {
  color: var(--text-muted) !important;
  font-size: 13px !important;
  user-select: none !important;
}

.ai-correction-diff strong {
  color: #10b981 !important;
  background: rgba(16, 185, 129, 0.08) !important;
  padding: 2px 7px !important;
  border-radius: 4px !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}

.ai-correction-meta {
  display: block !important;
  color: var(--text-muted) !important;
  font-size: 12px !important;
  margin-top: 6px !important;
}

.ai-disclaimer {
  padding: 12px 24px !important;
  font-size: 11px !important;
  color: var(--text-muted) !important;
  border-top: 1px solid var(--border-subtle, var(--line)) !important;
  text-align: center !important;
}

.ai-error {
  margin: 16px 20px !important;
  padding: 14px 18px !important;
  border-radius: var(--radius-md, 10px) !important;
  background: rgba(239, 68, 68, 0.08) !important;
  color: #dc2626 !important;
  border: 1px solid rgba(239, 68, 68, 0.28) !important;
  font-size: 14px !important;
}

/* 19.5 RESPONSIVE WORKSPACE BREAKPOINTS */
@media (max-width: 1024px) {
  .writing-workspace {
    grid-template-columns: 1fr !important;
    gap: 20px !important;
    min-height: 0 !important;
  }

  #writingAnswer {
    min-height: 340px !important;
  }

  .ai-criteria {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .writing-page-shell {
    padding: 12px 14px 70px !important;
  }

  .writing-time-rule,
  .writing-exam-note {
    width: 100% !important;
  }

  .editor-tools {
    padding: 10px 14px !important;
  }

  .char-btn {
    width: 34px !important;
    height: 34px !important;
    min-width: 34px !important;
    font-size: 14px !important;
  }

  #writingAnswer {
    min-height: 280px !important;
    padding: 14px 16px !important;
    font-size: 15px !important;
  }

  .editor-bottom {
    padding: 10px 14px !important;
  }

  .ai-criteria {
    grid-template-columns: 1fr !important;
  }

  .ai-two-col {
    grid-template-columns: 1fr !important;
  }

  .ai-result-head {
    padding: 16px 18px !important;
  }

  .ai-score-line strong {
    font-size: 38px !important;
  }
}

@media (max-width: 480px) {
  .writing-page-shell {
    padding: 10px 10px 60px !important;
  }

  .writing-block {
    padding: 14px 16px !important;
  }

  .char-btn {
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
    font-size: 13px !important;
  }

  #writingAnswer {
    min-height: 240px !important;
    font-size: 14.5px !important;
  }

  .editor-tools {
    gap: 8px !important;
  }

  .editor-counter-wrap {
    width: 100% !important;
    justify-content: flex-end !important;
  }

  .editor-bottom .ai-check-btn,
  .editor-bottom .model-btn {
    width: 100% !important;
    justify-content: center !important;
  }
}

@media (max-width: 360px) {
  .char-btn {
    width: 29px !important;
    height: 29px !important;
    min-width: 29px !important;
    font-size: 12.5px !important;
  }

  #wordCount.writing-word-counter {
    font-size: 11px !important;
    padding: 4px 8px !important;
  }
}

/* 19.6 RTL / LTR CONTENT INTEGRITY */
[dir="rtl"] .writing-german-content,
[dir="rtl"] #writingAnswer,
[dir="rtl"] .editor-chars,
[dir="rtl"] .ai-score-line,
[dir="rtl"] .ai-correction-diff {
  direction: ltr !important;
  text-align: left !important;
}
`;

const existingCss = fs.readFileSync('public/assets/app.css', 'utf8');

// Check if section 19 already exists
if (existingCss.includes('19. SCHREIBEN WORKSPACE MODERNIZATION')) {
  console.log('Section 19 already present in app.css');
} else {
  fs.writeFileSync('public/assets/app.css', existingCss + '\n' + section19Css.trim() + '\n');
  console.log('Section 19 successfully appended to app.css');
}

// Verify bracket balance
const updatedCss = fs.readFileSync('public/assets/app.css', 'utf8');
let openCount = 0;
for (let i = 0; i < updatedCss.length; i++) {
  if (updatedCss[i] === '{') openCount++;
  if (updatedCss[i] === '}') openCount--;
}
console.log('Updated app.css lines:', updatedCss.split('\n').length);
console.log('Updated app.css brace balance count (must be 0):', openCount);
if (openCount !== 0) {
  console.error('ERROR: CSS braces unbalanced!');
  process.exit(1);
}
