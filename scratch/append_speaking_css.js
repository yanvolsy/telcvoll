const fs = require('fs');

const section20Css = `
/* ==========================================================================
   20. SPRECHEN WORKSPACE MODERNIZATION (PHASE 6G)
   ========================================================================== */

/* 20.1 SPRECHEN SHELL & BASE */
.speaking-exercise-shell {
  max-width: 1400px;
  margin: 0 auto;
  padding: 18px 20px 80px;
  box-sizing: border-box;
}

/* 20.2 SPRECHEN TEIL 1: PRESENTATION STUDIO */
.pres-studio-wrap {
  margin-bottom: 24px;
  min-width: 0;
}

.pres-input-panel {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-xl, 16px) !important;
  padding: 24px !important;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04)) !important;
  box-sizing: border-box !important;
}

.pres-studio-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: flex-start !important;
  margin-bottom: 16px !important;
  flex-wrap: wrap !important;
  gap: 10px !important;
}

.pres-studio-title {
  margin: 0 0 4px !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
}

.pres-studio-subtitle {
  font-size: 13px !important;
  color: var(--text-secondary) !important;
  line-height: 1.6 !important;
  display: block !important;
}

.pres-categories {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
  gap: 10px !important;
  margin-bottom: 16px !important;
}

.pres-cat-btn {
  border: 1px solid var(--border-subtle, var(--line)) !important;
  background: var(--bg-canvas) !important;
  border-radius: var(--radius-md, 12px) !important;
  padding: 12px 10px !important;
  text-align: center !important;
  cursor: pointer !important;
  font-weight: 700 !important;
  font-size: 12px !important;
  color: var(--text-primary) !important;
  transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 4px !important;
  min-height: 100px !important;
  justify-content: center !important;
  box-sizing: border-box !important;
  user-select: none !important;
}

.pres-cat-btn:hover {
  border-color: var(--brand-primary) !important;
  background: var(--bg-surface-elevated, var(--bg-surface)) !important;
  transform: translateY(-1px) !important;
}

.pres-cat-btn.active {
  background: var(--brand-primary) !important;
  color: #ffffff !important;
  border-color: var(--brand-primary) !important;
  box-shadow: 0 4px 14px rgba(var(--brand-rgb, 234, 88, 12), 0.35) !important;
}

.pres-cat-btn.active span,
.pres-cat-btn.active small {
  color: #ffffff !important;
  opacity: 1 !important;
}

.pres-cat-points {
  font-size: 10px !important;
  line-height: 1.35 !important;
  opacity: 0.8 !important;
  font-weight: 600 !important;
  margin-top: 3px !important;
  direction: ltr !important;
  text-align: center !important;
}

.pres-leitpunkte-banner {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  background: var(--bg-canvas) !important;
  border: 1px dashed var(--border-default, var(--line)) !important;
  border-radius: var(--radius-md, 10px) !important;
  padding: 10px 16px !important;
  margin-bottom: 14px !important;
  font-size: 13px !important;
  flex-wrap: wrap !important;
}

.pres-leitpunkte-tag {
  background: var(--brand-primary) !important;
  color: #ffffff !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  padding: 3px 9px !important;
  border-radius: 6px !important;
  white-space: nowrap !important;
}

.pres-leitpunkte-text {
  color: var(--text-primary) !important;
  font-weight: 600 !important;
  font-size: 13px !important;
}

.pres-notes-label {
  display: block !important;
  font-size: 12.5px !important;
  font-weight: 700 !important;
  color: var(--text-secondary) !important;
  margin-bottom: 6px !important;
}

#presNotes {
  width: 100% !important;
  min-height: 90px !important;
  border-radius: var(--radius-md, 10px) !important;
  border: 1px solid var(--border-default, var(--line)) !important;
  background: var(--bg-canvas) !important;
  color: var(--text-primary) !important;
  padding: 12px 16px !important;
  font-size: 14.5px !important;
  line-height: 1.7 !important;
  resize: vertical !important;
  margin: 6px 0 16px !important;
  box-sizing: border-box !important;
  font-family: var(--font-sans) !important;
}

#presNotes:focus {
  border-color: var(--brand-primary) !important;
  outline: none !important;
  box-shadow: 0 0 0 3px rgba(var(--brand-rgb, 234, 88, 12), 0.15) !important;
}

.pres-generate-btn {
  width: 100% !important;
  padding: 13px 24px !important;
  font-size: 14.5px !important;
  font-weight: 700 !important;
  background: var(--brand-primary) !important;
  color: #ffffff !important;
  border: 0 !important;
  border-radius: var(--radius-md, 10px) !important;
  cursor: pointer !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease !important;
  box-shadow: 0 3px 12px rgba(var(--brand-rgb, 234, 88, 12), 0.28) !important;
}

.pres-generate-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 5px 16px rgba(var(--brand-rgb, 234, 88, 12), 0.38) !important;
}

.pres-generate-btn:disabled {
  opacity: 0.65 !important;
  cursor: wait !important;
  transform: none !important;
}

/* 20.3 PRESENTATION RESULT BOX & PRACTICE BAR */
.pres-result-box {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-xl, 16px) !important;
  padding: 24px !important;
  margin-top: 20px !important;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04)) !important;
  box-sizing: border-box !important;
}

.pres-result-head {
  display: flex !important;
  align-items: flex-start !important;
  justify-content: space-between !important;
  flex-wrap: wrap !important;
  gap: 14px !important;
  padding-bottom: 16px !important;
  border-bottom: 1px solid var(--border-subtle, var(--line)) !important;
  margin-bottom: 18px !important;
}

.pres-result-head h3 {
  margin: 0 !important;
  font-size: 19px !important;
  font-weight: 800 !important;
  color: var(--text-primary) !important;
}

.pres-actions-row {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex-wrap: wrap !important;
}

.pres-actions-row .btn.light {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 7px 12px !important;
  font-size: 12.5px !important;
  font-weight: 600 !important;
  color: var(--text-primary) !important;
  background: var(--bg-canvas) !important;
  border: 1px solid var(--border-default, var(--line)) !important;
  border-radius: var(--radius-sm, 8px) !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
}

.pres-actions-row .btn.light:hover {
  border-color: var(--brand-primary) !important;
  color: var(--brand-primary) !important;
  background: var(--bg-surface-elevated, var(--bg-surface)) !important;
}

.pres-text-de {
  font-size: 16px !important;
  line-height: 1.85 !important;
  color: var(--text-primary) !important;
  white-space: pre-line !important;
  padding: 18px 22px !important;
  background: var(--bg-canvas) !important;
  border-radius: var(--radius-md, 12px) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  direction: ltr !important;
  text-align: left !important;
}

.pres-text-ar {
  font-size: 15px !important;
  line-height: 1.85 !important;
  color: var(--text-primary) !important;
  white-space: pre-line !important;
  padding: 16px 20px !important;
  background: rgba(245, 158, 11, 0.06) !important;
  border-radius: var(--radius-md, 12px) !important;
  border: 1px solid rgba(245, 158, 11, 0.25) !important;
  margin-top: 14px !important;
  direction: rtl !important;
  text-align: right !important;
}

.pres-practice-bar {
  margin-top: 22px !important;
  padding: 16px 20px !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-lg, 14px) !important;
  background: var(--bg-surface-elevated, var(--bg-surface)) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 14px !important;
  flex-wrap: wrap !important;
}

.pres-practice-bar strong {
  display: block !important;
  font-size: 14px !important;
  color: var(--text-primary) !important;
}

.pres-practice-bar .muted {
  font-size: 12px !important;
  color: var(--text-secondary) !important;
}

#presTimerDisplay {
  font-size: 15px !important;
  font-weight: 800 !important;
  font-variant-numeric: tabular-nums !important;
  color: var(--text-primary) !important;
}

.pres-mic-record {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 10px 18px !important;
  border-radius: var(--radius-md, 10px) !important;
  background: var(--brand-primary) !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  font-size: 13.5px !important;
  border: 0 !important;
  cursor: pointer !important;
  transition: all 0.18s ease !important;
  box-shadow: 0 2px 8px rgba(var(--brand-rgb, 234, 88, 12), 0.28) !important;
}

.pres-mic-record.recording {
  background: #ef4444 !important;
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.45) !important;
}

#presEvalBtn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 10px 18px !important;
  border-radius: var(--radius-md, 10px) !important;
  background: #1e293b !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  font-size: 13.5px !important;
  border: 0 !important;
  cursor: pointer !important;
}

#presLiveText {
  margin-top: 10px !important;
  font-size: 13.5px !important;
  color: var(--text-secondary) !important;
  min-height: 22px !important;
  direction: ltr !important;
  text-align: left !important;
}

/* 20.4 SPRECHEN TEIL 2 & 3: SIMULATOR WORKSPACE */
.speaking-layout {
  display: grid !important;
  grid-template-columns: minmax(360px, 440px) minmax(0, 1fr) !important;
  gap: 24px !important;
  align-items: start !important;
  direction: ltr !important;
}

.speaking-task-panel {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-xl, 16px) !important;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04)) !important;
  padding: 22px 24px !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  direction: ltr !important;
  text-align: left !important;
}

.speaking-task-head {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 12px !important;
  margin-bottom: 14px !important;
}

.speaking-task-head strong {
  font-size: 13.5px !important;
  font-weight: 700 !important;
  color: var(--text-secondary) !important;
}

.speaking-task-text {
  font-size: 15.5px !important;
  line-height: 1.8 !important;
  color: var(--text-primary) !important;
  white-space: pre-wrap !important;
  direction: ltr !important;
  text-align: left !important;
}

.speaking-tasks-panel {
  margin-top: 18px !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-lg, 12px) !important;
  background: var(--bg-canvas) !important;
  overflow: hidden !important;
  box-shadow: none !important;
}

.speaking-section-head {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 12px !important;
  padding: 12px 16px !important;
  background: rgba(59, 130, 246, 0.06) !important;
  border-bottom: 1px solid var(--border-subtle, var(--line)) !important;
}

.speaking-section-head h2 {
  font-size: 15px !important;
  margin: 0 !important;
  color: var(--text-primary) !important;
}

.speaking-task-item {
  display: grid !important;
  grid-template-columns: 32px minmax(0, 1fr) !important;
  gap: 10px !important;
  padding: 12px 14px !important;
  border-bottom: 1px solid var(--border-subtle, var(--line)) !important;
  align-items: start !important;
}

.speaking-task-number {
  width: 26px !important;
  height: 26px !important;
  border-radius: 6px !important;
  display: grid !important;
  place-items: center !important;
  background: var(--brand-primary) !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  font-size: 12px !important;
}

.speaking-hint {
  margin-top: 18px !important;
  padding: 12px 16px !important;
  border-radius: var(--radius-md, 10px) !important;
  background: rgba(var(--brand-rgb, 234, 88, 12), 0.06) !important;
  border: 1px solid rgba(var(--brand-rgb, 234, 88, 12), 0.2) !important;
  color: var(--text-primary) !important;
  font-size: 13px !important;
  line-height: 1.65 !important;
  font-weight: 600 !important;
}

.speaking-simulator {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-xl, 16px) !important;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04)) !important;
  padding: 0 20px 20px !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  direction: ltr !important;
}

.speaking-sim-head {
  margin: 0 -20px 14px !important;
  padding: 16px 20px !important;
  background: linear-gradient(135deg, rgba(var(--brand-rgb, 234, 88, 12), 0.08) 0%, transparent 100%) !important;
  border-bottom: 1px solid var(--border-subtle, var(--line)) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.speaking-sim-head h2 {
  margin: 4px 0 0 !important;
  font-size: 17px !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
}

.speaking-live-dot {
  color: #10b981 !important;
  font-size: 14px !important;
}

.speaking-roles {
  display: flex !important;
  gap: 10px !important;
  flex-wrap: wrap !important;
  margin: 0 0 12px !important;
}

.speaking-role {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 6px 12px !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-md, 10px) !important;
  background: var(--bg-canvas) !important;
  font-size: 12px !important;
}

.speaking-avatar.jerry-avatar {
  background: rgba(99, 102, 241, 0.15) !important;
  color: #6366f1 !important;
  width: 28px !important;
  height: 28px !important;
  border-radius: 50% !important;
  display: grid !important;
  place-items: center !important;
  font-weight: 800 !important;
  font-size: 12px !important;
}

.speaking-avatar.partner-avatar {
  background: rgba(var(--brand-rgb, 234, 88, 12), 0.15) !important;
  color: var(--brand-primary) !important;
  width: 28px !important;
  height: 28px !important;
  border-radius: 50% !important;
  display: grid !important;
  place-items: center !important;
  font-weight: 800 !important;
  font-size: 12px !important;
}

/* 20.5 CONVERSATION CHAT */
.speaking-chat {
  height: 340px !important;
  overflow-y: auto !important;
  padding: 8px 4px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  scroll-behavior: smooth !important;
}

.speaking-bubble {
  max-width: 88% !important;
  padding: 12px 16px !important;
  border-radius: var(--radius-lg, 14px) !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
  line-height: 1.65 !important;
  box-sizing: border-box !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03) !important;
}

.speaking-bubble.jerry {
  align-self: flex-start !important;
  background: var(--bg-canvas) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-inline-start: 3px solid #6366f1 !important;
}

.speaking-bubble.partner {
  align-self: flex-start !important;
  background: var(--bg-surface-elevated, var(--bg-surface)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-inline-start: 3px solid var(--brand-primary) !important;
}

.speaking-bubble.me {
  align-self: flex-end !important;
  background: rgba(var(--brand-rgb, 234, 88, 12), 0.08) !important;
  border: 1px solid rgba(var(--brand-rgb, 234, 88, 12), 0.22) !important;
  border-inline-end: 3px solid var(--brand-primary) !important;
}

.speaking-bubble-text {
  white-space: pre-wrap !important;
  font-size: 14.5px !important;
  line-height: 1.7 !important;
  color: var(--text-primary) !important;
  direction: ltr !important;
  text-align: left !important;
}

.speaking-bubble-head b {
  font-size: 11.5px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.03em !important;
}

.speaking-bubble.jerry b {
  color: #6366f1 !important;
}

.speaking-bubble.partner b {
  color: var(--brand-primary) !important;
}

.speaking-bubble.me b {
  color: var(--brand-primary) !important;
}

.speaking-bubble-tools {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
}

.speaking-voice-btn,
.speaking-translate-btn {
  width: 28px !important;
  height: 28px !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: 6px !important;
  background: var(--bg-surface) !important;
  color: var(--text-secondary) !important;
  cursor: pointer !important;
  font-size: 12px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.15s ease !important;
}

.speaking-voice-btn:hover,
.speaking-translate-btn:hover {
  border-color: var(--brand-primary) !important;
  color: var(--brand-primary) !important;
}

.speaking-voice-btn.speaking-active {
  background: var(--brand-primary) !important;
  color: #ffffff !important;
  border-color: var(--brand-primary) !important;
}

.speaking-bubble-translation {
  margin-top: 8px !important;
  padding: 10px 14px !important;
  border-radius: var(--radius-sm, 8px) !important;
  background: rgba(245, 158, 11, 0.08) !important;
  border: 1px solid rgba(245, 158, 11, 0.2) !important;
  color: var(--text-primary) !important;
  line-height: 1.65 !important;
  direction: rtl !important;
  text-align: right !important;
  font-size: 13.5px !important;
}

/* 20.6 INPUT ROW & CONTROLS */
.speaking-writing-box {
  margin-top: 12px !important;
  padding: 14px 16px !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-lg, 14px) !important;
  background: var(--bg-canvas) !important;
  box-sizing: border-box !important;
}

.speaking-writing-label {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 8px !important;
  font-size: 12.5px !important;
}

.speaking-writing-label span {
  font-weight: 700 !important;
  color: var(--text-primary) !important;
}

.speaking-writing-label small {
  color: var(--text-secondary) !important;
  font-size: 11.5px !important;
}

.speaking-input-row {
  display: flex !important;
  gap: 10px !important;
  align-items: flex-end !important;
}

#speakingInput {
  flex: 1 !important;
  min-height: 72px !important;
  padding: 10px 14px !important;
  border: 1px solid var(--border-default, var(--line)) !important;
  border-radius: var(--radius-md, 10px) !important;
  background: var(--bg-surface) !important;
  font-family: var(--font-sans) !important;
  font-size: 14.5px !important;
  line-height: 1.6 !important;
  color: var(--text-primary) !important;
  resize: vertical !important;
  box-sizing: border-box !important;
  direction: ltr !important;
  text-align: left !important;
}

#speakingInput:focus {
  border-color: var(--brand-primary) !important;
  outline: none !important;
  box-shadow: 0 0 0 3px rgba(var(--brand-rgb, 234, 88, 12), 0.15) !important;
}

.speaking-input-actions {
  display: flex !important;
  gap: 6px !important;
  align-items: center !important;
  flex-shrink: 0 !important;
}

.speaking-chat-mic {
  width: 40px !important;
  height: 40px !important;
  border: 1px solid var(--border-default, var(--line)) !important;
  border-radius: var(--radius-md, 10px) !important;
  background: var(--bg-surface) !important;
  color: var(--text-primary) !important;
  font-size: 17px !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.15s ease !important;
}

.speaking-chat-mic.recording {
  background: #ef4444 !important;
  color: #ffffff !important;
  border-color: #ef4444 !important;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.45) !important;
}

#speakingSend {
  padding: 10px 18px !important;
  font-weight: 700 !important;
  font-size: 13.5px !important;
  color: #ffffff !important;
  background: var(--brand-primary) !important;
  border: 1px solid var(--brand-primary) !important;
  border-radius: var(--radius-md, 10px) !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  box-shadow: 0 2px 8px rgba(var(--brand-rgb, 234, 88, 12), 0.25) !important;
  height: 40px !important;
  box-sizing: border-box !important;
}

.speaking-controls {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 10px !important;
  margin-top: 14px !important;
  flex-wrap: wrap !important;
}

#speakingTime {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 6px 14px !important;
  border-radius: 999px !important;
  background: var(--bg-canvas) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  color: var(--text-secondary) !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  font-variant-numeric: tabular-nums !important;
  margin-inline-end: auto !important;
}

#speakingModel {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 8px 16px !important;
  border-radius: var(--radius-md, 10px) !important;
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-default, var(--line)) !important;
  color: var(--text-primary) !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  white-space: nowrap !important;
}

#speakingFinish {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 8px 18px !important;
  border-radius: var(--radius-md, 10px) !important;
  background: #1e293b !important;
  color: #ffffff !important;
  border: 1px solid #1e293b !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  cursor: pointer !important;
  white-space: nowrap !important;
}

/* 20.7 MODEL ANSWER BOX & EVALUATION PANEL */
.speaking-model-box {
  margin-top: 18px !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-xl, 16px) !important;
  background: var(--bg-surface) !important;
  padding: 20px !important;
  box-shadow: var(--shadow-sm) !important;
  box-sizing: border-box !important;
}

.speaking-model-head {
  display: flex !important;
  align-items: flex-start !important;
  justify-content: space-between !important;
  gap: 12px !important;
  margin-bottom: 14px !important;
}

.speaking-model-head h3 {
  margin: 4px 0 0 !important;
  font-size: 17px !important;
  color: var(--text-primary) !important;
}

.speaking-model-line {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 10px !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-md, 10px) !important;
  padding: 12px 14px !important;
  background: var(--bg-canvas) !important;
  margin-bottom: 8px !important;
}

.speaking-model-line.model-student {
  border-inline-start: 3px solid #10b981 !important;
}

.speaking-model-line.model-partner {
  border-inline-start: 3px solid var(--brand-primary) !important;
}

.speaking-model-phase {
  display: inline-block !important;
  font-size: 10.5px !important;
  font-weight: 700 !important;
  color: var(--text-muted) !important;
  text-transform: uppercase !important;
  margin-bottom: 3px !important;
}

.speaking-eval {
  margin-top: 18px !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-xl, 16px) !important;
  background: var(--bg-surface) !important;
  padding: 22px !important;
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.06)) !important;
  box-sizing: border-box !important;
}

.speaking-eval-head {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 12px !important;
  border-bottom: 1px solid var(--border-subtle, var(--line)) !important;
  padding-bottom: 14px !important;
}

.speaking-eval-head strong {
  font-size: 16px !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
}

.speaking-eval-head b {
  font-size: 26px !important;
  font-weight: 800 !important;
  color: var(--brand-primary) !important;
}

.speaking-eval-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)) !important;
  gap: 10px !important;
  margin: 16px 0 !important;
}

.speaking-eval-grid article {
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: var(--radius-md, 10px) !important;
  padding: 12px 14px !important;
  background: var(--bg-canvas) !important;
}

.speaking-eval-grid article b {
  display: block !important;
  font-size: 12.5px !important;
  color: var(--text-primary) !important;
}

.speaking-eval-grid article strong {
  display: block !important;
  font-size: 18px !important;
  font-weight: 800 !important;
  color: var(--text-primary) !important;
  margin: 4px 0 2px !important;
}

.speaking-eval-grid article p {
  font-size: 11.5px !important;
  color: var(--text-muted) !important;
  margin: 0 !important;
  line-height: 1.5 !important;
}

.speaking-feedback h3 {
  font-size: 13.5px !important;
  font-weight: 700 !important;
  margin: 14px 0 6px !important;
  color: var(--text-primary) !important;
}

.speaking-feedback ul {
  margin: 0 !important;
  padding-inline-start: 18px !important;
  font-size: 13px !important;
  line-height: 1.7 !important;
  color: var(--text-secondary) !important;
}

.speaking-feedback p {
  font-size: 13.5px !important;
  line-height: 1.75 !important;
  color: var(--text-primary) !important;
  margin-top: 10px !important;
}

/* 20.8 RESPONSIVE BREAKPOINTS */
@media (max-width: 1024px) {
  .speaking-layout {
    grid-template-columns: 1fr !important;
    gap: 20px !important;
  }

  .speaking-chat {
    height: 300px !important;
  }
}

@media (max-width: 768px) {
  .speaking-exercise-shell {
    padding: 12px 14px 70px !important;
  }

  .pres-categories {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .speaking-input-row {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  .speaking-input-actions {
    width: 100% !important;
    justify-content: flex-end !important;
  }

  .speaking-controls {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  .speaking-controls .btn {
    width: 100% !important;
    justify-content: center !important;
  }

  .speaking-eval-grid {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 480px) {
  .pres-categories {
    grid-template-columns: 1fr !important;
  }

  .pres-actions-row .btn.light {
    flex: 1 1 auto !important;
    justify-content: center !important;
  }

  .speaking-bubble {
    max-width: 95% !important;
  }

  .speaking-sim-head h2 {
    font-size: 15px !important;
  }
}

@media (max-width: 360px) {
  .pres-cat-btn {
    min-height: 80px !important;
    padding: 10px 6px !important;
  }

  .speaking-roles {
    flex-direction: column !important;
  }
}

/* 20.9 RTL / LTR CONTENT INTEGRITY */
[dir="rtl"] .pres-text-de,
[dir="rtl"] #presLiveText,
[dir="rtl"] .speaking-task-text,
[dir="rtl"] .speaking-chat,
[dir="rtl"] .speaking-bubble-text,
[dir="rtl"] #speakingInput,
[dir="rtl"] .speaking-model-line,
[dir="rtl"] .speaking-qa-text {
  direction: ltr !important;
  text-align: left !important;
}
`;

const existingCss = fs.readFileSync('public/assets/app.css', 'utf8');

if (existingCss.includes('20. SPRECHEN WORKSPACE MODERNIZATION')) {
  console.log('Section 20 already present in app.css');
} else {
  fs.writeFileSync('public/assets/app.css', existingCss + '\n' + section20Css.trim() + '\n');
  console.log('Section 20 successfully appended to app.css');
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
