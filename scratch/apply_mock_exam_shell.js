const fs = require('fs');
const path = require('path');

const mockPath = path.join(__dirname, '..', 'public', 'mock-exam.html');
let content = fs.readFileSync(mockPath, 'utf8');

// 1. Check for <style id="telc-final-complete-rework-styles">
const reworkRegex = /<style id="telc-final-complete-rework-styles">[\s\S]*?<\/style>\r?\n?/g;
if (!reworkRegex.test(content)) {
  console.error('Could not find telc-final-complete-rework-styles');
  process.exit(1);
}
content = content.replace(reworkRegex, '');

// 2. Check for <style id="mock-exam-brand-header">
const headerRegex = /<style id="mock-exam-brand-header">[\s\S]*?<\/style>/;
if (!headerRegex.test(content)) {
  console.error('Could not find mock-exam-brand-header');
  process.exit(1);
}

const modernShellStyle = `<style id="mock-exam-modern-shell">
/* TELC Voll — Mock Exam Modern Shell & Header System (Quiet Luxury / Precision) */

/* 1. Header Container */
.mock-top {
  position: fixed !important;
  inset: 0 0 auto !important;
  width: 100% !important;
  height: auto !important;
  min-height: 0 !important;
  z-index: 1000 !important;
  background: var(--bg-surface-glass, rgba(8, 8, 8, 0.88)) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border-bottom: 1px solid var(--border-subtle, var(--line)) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
  padding: 0 !important;
  direction: ltr !important;
  box-sizing: border-box !important;
}

html[data-theme="light"] .mock-top {
  background: rgba(255, 255, 255, 0.90) !important;
  border-bottom-color: var(--border-subtle, #e2e8f0) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
}

/* 2. Top Row: Brand & Back Navigation */
.mock-top .mock-brand-bar {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  min-height: 56px !important;
  width: 100% !important;
  max-width: 1280px !important;
  margin: 0 auto !important;
  padding: 8px 24px !important;
  border-bottom: 1px solid var(--border-subtle, var(--line)) !important;
  box-sizing: border-box !important;
}

.mock-brand-group {
  display: inline-flex !important;
  align-items: center !important;
  gap: 12px !important;
  min-width: 0 !important;
}

.mock-top .back-link {
  width: 38px !important;
  height: 38px !important;
  border-radius: var(--radius-button, 10px) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: var(--bg-surface, var(--white)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  color: var(--text-secondary, var(--ink)) !important;
  text-decoration: none !important;
  font-size: 18px !important;
  line-height: 1 !important;
  transition: all var(--duration-fast, 0.18s) var(--ease-spring, ease) !important;
  box-sizing: border-box !important;
}

.mock-top .back-link:hover {
  background: var(--bg-surface-hover, rgba(255, 255, 255, 0.08)) !important;
  border-color: var(--brand-primary, #ea580c) !important;
  color: var(--brand-primary, #ea580c) !important;
  transform: translateX(-1px) !important;
}

.mock-top .back-link:focus-visible {
  outline: 2px solid var(--brand-primary, #ea580c) !important;
  outline-offset: 2px !important;
}

.mock-brand {
  display: inline-flex !important;
  align-items: center !important;
  gap: 9px !important;
  font-family: var(--font-family-arabic, "Cairo", sans-serif) !important;
  color: var(--text-primary, var(--ink)) !important;
  font-size: 18px !important;
  font-weight: 950 !important;
  letter-spacing: -0.02em !important;
  text-decoration: none !important;
  transition: opacity var(--duration-fast, 0.18s) ease !important;
}

.mock-brand:hover {
  opacity: 0.88 !important;
}

.mock-brand .brand-dot {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  background: var(--brand-primary, #ea580c) !important;
  box-shadow: 0 0 10px var(--brand-glow, rgba(234, 88, 12, 0.35)) !important;
  display: inline-block !important;
  flex-shrink: 0 !important;
}

.mock-top .header-actions {
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
}

/* 3. Second Row: Exam Controls (Tabs, Timer, Teil Tabs) */
.mock-top .mock-exam-controls {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto !important;
  grid-template-areas: "tabs status" "teils teils" !important;
  align-items: center !important;
  gap: 10px 18px !important;
  max-width: 1280px !important;
  margin: 0 auto !important;
  padding: 10px 24px !important;
  box-sizing: border-box !important;
}

.mock-top .mock-exam-controls > .mock-status {
  grid-area: status !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 10px !important;
  min-width: max-content !important;
  white-space: nowrap !important;
}

.mock-top .mock-exam-controls > .mock-tabs {
  grid-area: tabs !important;
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: 8px !important;
  width: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
}

/* 4. Exam Timer */
.mock-timer {
  font-variant-numeric: tabular-nums !important;
  font-family: var(--font-family-latin, "Inter", system-ui, sans-serif) !important;
  font-weight: 850 !important;
  font-size: 16px !important;
  letter-spacing: 0.04em !important;
  padding: 7px 16px !important;
  border-radius: var(--radius-pill, 999px) !important;
  background: var(--brand-subtle, rgba(234, 88, 12, 0.08)) !important;
  color: var(--brand-primary, #ea580c) !important;
  min-width: 100px !important;
  text-align: center !important;
  border: 1px solid var(--brand-border, rgba(234, 88, 12, 0.25)) !important;
  box-shadow: 0 1px 6px var(--brand-subtle, rgba(234, 88, 12, 0.1)) !important;
  transition: all var(--duration-fast, 0.18s) ease !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.mock-timer.danger {
  background: var(--state-danger-subtle, rgba(239, 68, 68, 0.12)) !important;
  color: var(--state-danger, #ef4444) !important;
  border-color: var(--state-danger-border, rgba(239, 68, 68, 0.35)) !important;
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.25) !important;
  animation: pulseDanger 1.2s infinite alternate ease-in-out !important;
}

@keyframes pulseDanger {
  from { transform: scale(1); }
  to { transform: scale(1.025); }
}

/* 5. Section Tabs */
.mock-tab {
  border: 1px solid var(--border-subtle, var(--line)) !important;
  background: var(--bg-surface, var(--white)) !important;
  color: var(--text-secondary, var(--ink)) !important;
  border-radius: var(--radius-card, 12px) !important;
  padding: 8px 10px !important;
  min-height: 48px !important;
  cursor: pointer !important;
  font: inherit !important;
  font-weight: 850 !important;
  font-size: 13.5px !important;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04)) !important;
  min-width: 0 !important;
  transition: all var(--duration-fast, 0.18s) ease !important;
  text-align: center !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1.25 !important;
}

.mock-tab:hover:not(:disabled) {
  border-color: var(--border-strong, rgba(255, 255, 255, 0.2)) !important;
  background: var(--bg-surface-hover, rgba(255, 255, 255, 0.06)) !important;
  color: var(--text-primary, var(--ink)) !important;
}

.mock-tab small {
  display: block !important;
  color: var(--text-muted, var(--muted)) !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  margin-top: 2px !important;
}

.mock-tab.active {
  border-color: var(--brand-primary, #ea580c) !important;
  box-shadow: 0 0 0 1px var(--brand-primary, #ea580c), 0 2px 10px var(--brand-subtle, rgba(234, 88, 12, 0.15)) !important;
  background: var(--brand-subtle, rgba(234, 88, 12, 0.08)) !important;
  color: var(--brand-primary, #ea580c) !important;
  font-weight: 900 !important;
}

.mock-tab.active small {
  color: var(--brand-primary, #ea580c) !important;
  opacity: 0.85 !important;
}

.mock-tab:disabled {
  opacity: 0.35 !important;
  cursor: not-allowed !important;
}

/* 6. Teil Sub-tabs */
.mock-teil-tabs {
  grid-area: teils !important;
  grid-column: 1 / -1 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  width: 100% !important;
  padding-top: 4px !important;
  margin: 0 !important;
}

.mock-teil-tab {
  min-width: 84px !important;
  min-height: 34px !important;
  padding: 6px 14px !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-pill, 999px) !important;
  background: var(--bg-surface, var(--white)) !important;
  color: var(--text-secondary, var(--ink)) !important;
  font: inherit !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  cursor: pointer !important;
  transition: all var(--duration-fast, 0.18s) ease !important;
}

.mock-teil-tab:hover {
  border-color: var(--brand-primary, #ea580c) !important;
  color: var(--brand-primary, #ea580c) !important;
}

.mock-teil-tab.active {
  background: var(--brand-primary, #ea580c) !important;
  border-color: var(--brand-primary, #ea580c) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px var(--brand-glow, rgba(234, 88, 12, 0.25)) !important;
  font-weight: 900 !important;
}

/* 7. Bottom Actions Bar */
.mock-actions {
  direction: ltr !important;
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 60 !important;
  background: var(--bg-surface-glass, rgba(8, 8, 8, 0.88)) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border-top: 1px solid var(--border-subtle, var(--line)) !important;
  padding: 12px 24px calc(12px + env(safe-area-inset-bottom, 0px)) !important;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06) !important;
}

html[data-theme="light"] .mock-actions {
  background: rgba(255, 255, 255, 0.92) !important;
  border-top-color: var(--border-subtle, #e2e8f0) !important;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.04) !important;
}

.mock-actions-inner {
  max-width: 1280px !important;
  margin: 0 auto !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 14px !important;
}

.mock-nav-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  min-height: 42px !important;
  height: 42px !important;
  padding: 0 22px !important;
  border-radius: var(--radius-button, 10px) !important;
  font-size: 14px !important;
  font-weight: 850 !important;
  cursor: pointer !important;
  transition: all var(--duration-fast, 0.18s) ease !important;
  text-decoration: none !important;
  box-sizing: border-box !important;
}

.mock-nav-btn.light {
  background: var(--bg-surface-elevated, var(--white)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  color: var(--text-primary, var(--ink)) !important;
}

.mock-nav-btn.light:hover:not(:disabled) {
  border-color: var(--border-strong, rgba(255, 255, 255, 0.2)) !important;
  background: var(--bg-surface-hover, rgba(255, 255, 255, 0.08)) !important;
  color: var(--text-primary, var(--ink)) !important;
}

.mock-nav-btn.light:disabled {
  opacity: 0.35 !important;
  cursor: not-allowed !important;
}

.mock-nav-btn.dark {
  background: var(--bg-surface, #141414) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  color: #ffffff !important;
}

.mock-nav-btn.dark:hover {
  background: var(--bg-surface-hover, #222222) !important;
  transform: translateY(-1px) !important;
}

.mock-nav-btn.btn-finish-mock {
  background: var(--brand-primary, #ea580c) !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 14px var(--brand-glow, rgba(234, 88, 12, 0.35)) !important;
}

.mock-nav-btn.btn-finish-mock:hover {
  background: var(--brand-hover, #c2410c) !important;
  transform: translateY(-1px) !important;
}

/* 8. Main App Dynamic Offset */
.mock-root#app {
  padding-top: calc(var(--mock-header-height, 120px) + 20px) !important;
}

/* 9. Responsive Breakpoints */
@media (max-width: 768px) {
  .mock-top .mock-brand-bar {
    min-height: 52px !important;
    padding: 6px 14px !important;
  }
  .mock-brand {
    font-size: 16px !important;
  }
  .mock-top .header-actions {
    gap: 6px !important;
  }
  .mock-top .header-actions .icon-btn {
    width: 34px !important;
    height: 34px !important;
    min-width: 34px !important;
  }
  .mock-top .mock-exam-controls {
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-areas: "tabs status" "teils teils" !important;
    gap: 8px !important;
    padding: 8px 14px !important;
  }
  .mock-top .mock-exam-controls > .mock-tabs {
    gap: 6px !important;
  }
  .mock-top .mock-tab {
    min-height: 44px !important;
    padding: 5px 4px !important;
    font-size: 12px !important;
  }
  .mock-top .mock-tab small {
    font-size: 10px !important;
  }
  .mock-timer {
    font-size: 14.5px !important;
    min-width: 86px !important;
    padding: 5px 10px !important;
  }
  .mock-root {
    padding-left: 14px !important;
    padding-right: 14px !important;
  }
}

@media (max-width: 520px) {
  .mock-top .mock-exam-controls {
    grid-template-columns: 1fr auto !important;
    grid-template-areas: "status status" "tabs tabs" "teils teils" !important;
    gap: 6px !important;
    padding: 6px 10px !important;
  }
  .mock-top .mock-exam-controls > .mock-status {
    justify-content: flex-end !important;
  }
  .mock-top .mock-exam-controls > .mock-tabs {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    gap: 4px !important;
  }
  .mock-top .mock-tab {
    min-height: 40px !important;
    padding: 4px 2px !important;
    font-size: 11px !important;
  }
  .mock-top .mock-tab small {
    display: none !important;
  }
  .mock-actions {
    padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px)) !important;
  }
  .mock-nav-btn {
    font-size: 13px !important;
    padding: 0 14px !important;
  }
}
</style>`;

content = content.replace(headerRegex, modernShellStyle);

fs.writeFileSync(mockPath, content, 'utf8');
console.log('Successfully updated mock-exam.html styles and removed dead code!');
