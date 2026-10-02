const fs = require('fs');

const section17 = `
/* =========================================================
   17. HÖREN WORKSPACE MODERNIZATION (PHASE 6D)
   Quiet Luxury • Secondary Elevated Audio Player • Precision Radios
   ========================================================= */

/* 17.1 WORKSPACE CONTAINER & DESKTOP MEASURE */
.hoeren-workspace-shell,
.hoeren-choice-page {
  width: 100% !important;
  max-width: min(1180px, calc(100% - 48px)) !important;
  margin: 0 auto !important;
  box-sizing: border-box !important;
}

.hoeren-workspace-shell {
  padding: 16px 0 120px !important;
  position: relative !important;
}

.hoeren-choice-page {
  padding: 16px 0 120px !important;
  position: relative !important;
}

.hoeren-choice-page .exercise-content-frame {
  max-width: 100% !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 17.2 UNIFIED HÖREN AUDIO PLAYER (ELEVATED SECONDARY SURFACE) */
html body > #content.exercise-page .hoeren-audio-player-card,
html body.exercise-page .hoeren-audio-player-card,
.hoeren-audio-player-card {
  width: 100% !important;
  box-sizing: border-box !important;
  min-height: 74px !important;
  margin: 0 0 24px 0 !important;
  padding: 14px 22px !important;
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
  background: var(--bg-surface-elevated) !important;
  color: var(--text-primary) !important;
  border: 1.5px solid var(--border-subtle) !important;
  border-radius: var(--radius-lg, 18px) !important;
  box-shadow: var(--shadow-card) !important;
  direction: ltr !important;
  text-align: left !important;
  position: relative !important;
  isolation: isolate !important;
  transition: background var(--duration-normal) var(--ease-smooth),
              border-color var(--duration-normal) var(--ease-smooth),
              box-shadow var(--duration-normal) var(--ease-smooth) !important;
}

/* Absolute LTR Immunity: Audio Player Must Remain LTR in Arabic RTL Mode */
[dir="rtl"] .hoeren-audio-player-card,
html[dir="rtl"] .hoeren-audio-player-card,
body[dir="rtl"] .hoeren-audio-player-card,
[dir="rtl"] .hoeren-audio-player-card *,
html[dir="rtl"] .hoeren-audio-player-card *,
body[dir="rtl"] .hoeren-audio-player-card * {
  direction: ltr !important;
  text-align: left !important;
}

/* Hidden Native Audio */
.hoeren-audio-player-card .hoeren-native-audio {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* Controls Group: Play & Skip Buttons */
.hoeren-audio-controls-group {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  order: 1 !important;
  flex: 0 0 auto !important;
}

/* Primary Circular Play Button */
.hoeren-audio-play {
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  min-height: 48px !important;
  border-radius: 50% !important;
  background: var(--brand-primary) !important;
  border: 1px solid var(--brand-primary) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(255, 122, 47, 0.32) !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 16px !important;
  transition: transform var(--duration-fast) var(--ease-spring),
              background var(--duration-fast) var(--ease-smooth),
              box-shadow var(--duration-fast) var(--ease-smooth) !important;
}

.hoeren-audio-play:hover {
  background: var(--brand-hover) !important;
  border-color: var(--brand-hover) !important;
  transform: scale(1.05) !important;
  box-shadow: 0 6px 18px rgba(255, 122, 47, 0.42) !important;
}

.hoeren-audio-play:active {
  transform: scale(0.95) !important;
}

.hoeren-audio-play:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 3px var(--state-focus-ring), 0 4px 14px rgba(255, 122, 47, 0.32) !important;
}

.hoeren-audio-play-icon {
  font-size: 15px !important;
  line-height: 1 !important;
  display: inline-block !important;
  transform: translateX(1px) !important;
}

.hoeren-audio-player-card.is-playing .hoeren-audio-play-icon {
  transform: translateX(0) !important;
}

/* Skip & Icon Buttons */
.hoeren-audio-skip-btn,
.hoeren-audio-speed-btn,
.hoeren-audio-icon-btn {
  height: 38px !important;
  min-height: 38px !important;
  min-width: 42px !important;
  padding: 0 10px !important;
  border-radius: var(--radius-sm, 10px) !important;
  border: 1px solid var(--border-subtle) !important;
  background: var(--bg-surface) !important;
  color: var(--text-primary) !important;
  cursor: pointer !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: var(--shadow-subtle) !important;
  transition: all var(--duration-fast) var(--ease-spring) !important;
}

.hoeren-audio-skip-btn:hover,
.hoeren-audio-speed-btn:hover,
.hoeren-audio-icon-btn:hover {
  border-color: var(--brand-primary) !important;
  color: var(--brand-primary) !important;
  background: var(--brand-subtle) !important;
  transform: translateY(-1px) !important;
}

.hoeren-audio-skip-btn:active,
.hoeren-audio-speed-btn:active,
.hoeren-audio-icon-btn:active {
  transform: scale(0.96) !important;
}

.hoeren-audio-skip-btn:focus-visible,
.hoeren-audio-speed-btn:focus-visible,
.hoeren-audio-icon-btn:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 3px var(--state-focus-ring) !important;
}

/* Audio Center Stream: Topline + Progress Bar */
.hoeren-audio-main {
  order: 2 !important;
  min-width: 0 !important;
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 7px !important;
  direction: ltr !important;
}

.hoeren-audio-topline {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 12px !important;
  min-width: 0 !important;
  direction: ltr !important;
}

.hoeren-audio-label {
  font-size: 12.5px !important;
  font-weight: 800 !important;
  color: var(--text-secondary) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  letter-spacing: 0.02em !important;
}

.hoeren-audio-time {
  font-size: 12px !important;
  font-weight: 750 !important;
  color: var(--text-muted) !important;
  font-family: ui-monospace, "SF Mono", monospace !important;
  font-variant-numeric: tabular-nums !important;
  white-space: nowrap !important;
  direction: ltr !important;
}

.hoeren-audio-progress {
  appearance: none !important;
  -webkit-appearance: none !important;
  width: 100% !important;
  height: 6px !important;
  border-radius: 999px !important;
  background: var(--border-strong) !important;
  outline: none !important;
  cursor: pointer !important;
  accent-color: var(--brand-primary) !important;
  transition: opacity var(--duration-fast) ease !important;
}

.hoeren-audio-progress::-webkit-slider-thumb {
  appearance: none !important;
  -webkit-appearance: none !important;
  width: 14px !important;
  height: 14px !important;
  border-radius: 50% !important;
  background: var(--brand-primary) !important;
  border: 2px solid var(--bg-surface) !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18) !important;
  transition: transform var(--duration-fast) ease !important;
}

.hoeren-audio-progress:hover::-webkit-slider-thumb {
  transform: scale(1.15) !important;
}

.hoeren-audio-progress::-moz-range-thumb {
  width: 12px !important;
  height: 12px !important;
  border-radius: 50% !important;
  background: var(--brand-primary) !important;
  border: 2px solid var(--bg-surface) !important;
}

/* Audio Actions: Speed, Mute & Volume */
.hoeren-audio-actions {
  order: 3 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  min-width: 136px !important;
  justify-content: flex-end !important;
  direction: ltr !important;
  flex: 0 0 auto !important;
}

.hoeren-audio-volume {
  appearance: none !important;
  -webkit-appearance: none !important;
  width: 72px !important;
  height: 6px !important;
  border-radius: 999px !important;
  background: var(--border-strong) !important;
  outline: none !important;
  cursor: pointer !important;
  accent-color: var(--brand-primary) !important;
}

.hoeren-audio-volume::-webkit-slider-thumb {
  appearance: none !important;
  -webkit-appearance: none !important;
  width: 12px !important;
  height: 12px !important;
  border-radius: 50% !important;
  background: var(--brand-primary) !important;
  border: 2px solid var(--bg-surface) !important;
}

/* 17.3 UNAVAILABLE AUDIO STATE */
.hoeren-audio-player-card.is-unavailable {
  background: var(--bg-surface) !important;
  border-color: var(--border-subtle) !important;
  opacity: 0.9 !important;
  min-height: auto !important;
  padding: 16px 20px !important;
}

.hoeren-audio-unavailable {
  display: flex !important;
  align-items: center !important;
  gap: 14px !important;
  width: 100% !important;
}

.hoeren-audio-unavailable-icon {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  border-radius: 50% !important;
  background: var(--bg-surface-elevated) !important;
  border: 1px solid var(--border-subtle) !important;
  color: var(--text-muted) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 18px !important;
}

.hoeren-audio-unavailable strong {
  display: block !important;
  font-size: 14px !important;
  font-weight: 800 !important;
  color: var(--text-secondary) !important;
}

.hoeren-audio-unavailable small {
  display: block !important;
  font-size: 12px !important;
  color: var(--text-muted) !important;
  margin-top: 2px !important;
}

/* 17.4 HÖREN TEIL 1: TRUE / FALSE TABLE CARD & ROWS */
.hoeren-table-card {
  width: 100% !important;
  box-sizing: border-box !important;
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-lg, 20px) !important;
  overflow: hidden !important;
  box-shadow: var(--shadow-card) !important;
  direction: ltr !important;
}

.hoeren-table-head {
  display: grid !important;
  grid-template-columns: 96px 96px 1fr !important;
  align-items: center !important;
  padding: 14px 24px !important;
  background: var(--bg-surface-elevated) !important;
  border-bottom: 1.5px solid var(--border-subtle) !important;
  direction: ltr !important;
}

.hoeren-th {
  font-size: 12px !important;
  font-weight: 850 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  color: var(--text-muted) !important;
  user-select: none !important;
}

.hoeren-th-r,
.hoeren-th-f {
  text-align: center !important;
  width: 100% !important;
}

.hoeren-th-statement {
  padding-left: 20px !important;
  text-align: left !important;
}

.hoeren-table-body {
  display: flex !important;
  flex-direction: column !important;
}

.hoeren-table-row {
  display: grid !important;
  grid-template-columns: 96px 96px 1fr !important;
  align-items: center !important;
  padding: 18px 24px !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  background: var(--bg-surface) !important;
  transition: background var(--duration-fast) ease !important;
  direction: ltr !important;
}

.hoeren-table-row:last-child {
  border-bottom: none !important;
}

.hoeren-table-row:hover {
  background: color-mix(in srgb, var(--brand-primary) 2.5%, var(--bg-surface)) !important;
}

.hoeren-table-row.row-correct {
  background: color-mix(in srgb, var(--state-success) 4%, var(--bg-surface)) !important;
}

.hoeren-table-row.row-wrong {
  background: color-mix(in srgb, var(--state-danger) 4%, var(--bg-surface)) !important;
}

/* Radio Cells & Buttons */
.hoeren-cell-r,
.hoeren-cell-f {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.hoeren-circle-radio-btn {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 50% !important;
  min-width: 44px !important;
  min-height: 44px !important;
  transition: transform var(--duration-fast) var(--ease-spring) !important;
}

.hoeren-circle-radio-btn:hover {
  transform: scale(1.1) !important;
}

.hoeren-circle-radio-btn:active {
  transform: scale(0.95) !important;
}

.hoeren-circle-radio-btn:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 3px var(--state-focus-ring) !important;
  border-radius: var(--radius-sm, 8px) !important;
}

.hoeren-circle-radio {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  border-radius: 50% !important;
  border: 2px solid var(--border-strong) !important;
  background: var(--bg-surface) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-sizing: border-box !important;
  transition: all var(--duration-fast) var(--ease-spring) !important;
}

.hoeren-circle-radio-btn:hover .hoeren-circle-radio {
  border-color: var(--brand-primary) !important;
}

/* Radio Selected State */
.hoeren-circle-radio-btn.selected .hoeren-circle-radio {
  border-color: var(--brand-primary) !important;
  background: var(--brand-primary) !important;
  box-shadow: inset 0 0 0 4px var(--bg-surface) !important;
}

/* Radio Results States */
.hoeren-circle-radio-btn.result-correct .hoeren-circle-radio,
.hoeren-circle-radio-btn.model-correct .hoeren-circle-radio {
  border-color: var(--state-success) !important;
  background: var(--state-success) !important;
  box-shadow: inset 0 0 0 4px var(--bg-surface) !important;
}

.hoeren-circle-radio-btn.result-wrong .hoeren-circle-radio {
  border-color: var(--state-danger) !important;
  background: var(--state-danger) !important;
  box-shadow: inset 0 0 0 4px var(--bg-surface) !important;
}

.hoeren-circle-radio-label {
  display: none !important;
}

/* Statement Cell & German Text */
.hoeren-cell-statement {
  padding-left: 20px !important;
  min-width: 0 !important;
}

.hoeren-stmt-content {
  display: flex !important;
  align-items: baseline !important;
  gap: 10px !important;
  flex-wrap: wrap !important;
}

.hoeren-stmt-num {
  font-size: 16px !important;
  font-weight: 850 !important;
  color: var(--brand-primary) !important;
  min-width: 24px !important;
  flex-shrink: 0 !important;
}

.hoeren-stmt-text {
  font-size: 15.5px !important;
  line-height: 1.6 !important;
  color: var(--text-primary) !important;
  font-weight: 550 !important;
  text-align: left !important;
  direction: ltr !important;
}

.hoeren-stmt-tools {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  margin-left: 8px !important;
  opacity: 0.85 !important;
  transition: opacity var(--duration-fast) ease !important;
}

.hoeren-table-row:hover .hoeren-stmt-tools {
  opacity: 1 !important;
}

.hoeren-cell-statement .inline-translation {
  margin-top: 8px !important;
  margin-left: 34px !important;
  direction: rtl !important;
  text-align: right !important;
  font-size: 13.5px !important;
  color: var(--text-muted) !important;
  border-top: 1px dashed var(--border-subtle) !important;
  padding-top: 6px !important;
}

.hoeren-tf-correct-hint {
  margin-top: 10px !important;
  margin-left: 34px !important;
}

/* 17.5 HÖREN TEIL 2: MULTIPLE CHOICE QUESTION CARDS */
.hoeren-choice-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 20px !important;
}

.hoeren-choice-list-head {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 14px 20px !important;
  margin-bottom: 20px !important;
  background: var(--bg-surface-elevated) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-md, 14px) !important;
  box-shadow: var(--shadow-subtle) !important;
  gap: 12px !important;
}

.hoeren-choice-list-head b {
  font-size: 14px !important;
  font-weight: 850 !important;
  color: var(--text-primary) !important;
  letter-spacing: 0.05em !important;
  margin-right: 8px !important;
}

.hoeren-choice-list-head small {
  font-size: 13px !important;
  color: var(--text-secondary) !important;
}

.hoeren-choice-count {
  display: inline-flex !important;
  align-items: center !important;
  padding: 4px 12px !important;
  border-radius: 999px !important;
  font-size: 12.5px !important;
  font-weight: 850 !important;
  background: var(--brand-subtle) !important;
  color: var(--brand-primary) !important;
  border: 1px solid var(--brand-border, rgba(255, 122, 47, 0.25)) !important;
}

.hoeren-choice-card {
  background: var(--bg-surface-elevated) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-lg, 18px) !important;
  padding: 22px 24px !important;
  box-shadow: var(--shadow-card) !important;
  transition: border-color var(--duration-fast) ease, box-shadow var(--duration-fast) ease !important;
}

.hoeren-choice-card:hover {
  border-color: var(--border-strong) !important;
}

.hoeren-choice-card.result-correct {
  border-color: var(--state-success-border, rgba(34, 197, 94, 0.35)) !important;
  background: color-mix(in srgb, var(--state-success) 3%, var(--bg-surface-elevated)) !important;
}

.hoeren-choice-card.result-wrong {
  border-color: var(--state-danger-border, rgba(239, 68, 68, 0.35)) !important;
  background: color-mix(in srgb, var(--state-danger) 3%, var(--bg-surface-elevated)) !important;
}

.hoeren-choice-question-row {
  display: flex !important;
  align-items: baseline !important;
  gap: 12px !important;
  margin-bottom: 16px !important;
}

.hoeren-choice-number {
  min-width: 28px !important;
  height: 28px !important;
  border-radius: var(--radius-xs, 6px) !important;
  background: var(--brand-subtle) !important;
  color: var(--brand-primary) !important;
  font-size: 13px !important;
  font-weight: 850 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
}

.hoeren-choice-question {
  font-size: 16px !important;
  font-weight: 700 !important;
  line-height: 1.5 !important;
  color: var(--text-primary) !important;
  text-align: left !important;
  flex: 1 !important;
}

.hoeren-choice-question-tools {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  flex-shrink: 0 !important;
}

/* Choices options */
.hoeren-choice-options {
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
}

.hoeren-choice-option-wrap {
  width: 100% !important;
  position: relative !important;
}

.hoeren-choice-option {
  width: 100% !important;
  min-height: 48px !important;
  padding: 10px 16px !important;
  display: flex !important;
  align-items: center !important;
  gap: 14px !important;
  text-align: left !important;
  border-radius: var(--radius-md, 12px) !important;
  border: 1.5px solid var(--border-subtle) !important;
  background: var(--bg-surface) !important;
  color: var(--text-primary) !important;
  cursor: pointer !important;
  box-shadow: var(--shadow-subtle) !important;
  transition: all var(--duration-fast) var(--ease-spring) !important;
}

.hoeren-choice-option:hover {
  border-color: var(--brand-primary) !important;
  background: var(--brand-subtle) !important;
  transform: translateY(-1px) !important;
}

.hoeren-choice-option:active {
  transform: scale(0.99) !important;
}

.hoeren-choice-option:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 3px var(--state-focus-ring) !important;
}

/* Choice radio indicator */
.hoeren-choice-radio {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  border-radius: 50% !important;
  border: 1.5px solid var(--border-strong) !important;
  background: var(--bg-surface-elevated) !important;
  font-size: 12px !important;
  font-weight: 850 !important;
  color: var(--text-secondary) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  transition: all var(--duration-fast) var(--ease-spring) !important;
}

.hoeren-choice-option-text {
  font-size: 14.5px !important;
  font-weight: 550 !important;
  line-height: 1.45 !important;
  color: var(--text-primary) !important;
  flex: 1 !important;
  text-align: left !important;
}

/* Selected option */
.hoeren-choice-option.selected {
  border-color: var(--brand-primary) !important;
  background: color-mix(in srgb, var(--brand-primary) 7%, var(--bg-surface)) !important;
  box-shadow: 0 0 0 1px var(--brand-primary) !important;
}

.hoeren-choice-option.selected .hoeren-choice-radio {
  border-color: var(--brand-primary) !important;
  background: var(--brand-primary) !important;
  color: #ffffff !important;
}

/* Post-submission states */
.hoeren-choice-option.result-correct,
.hoeren-choice-option.model-correct {
  border-color: var(--state-success) !important;
  background: color-mix(in srgb, var(--state-success) 7%, var(--bg-surface)) !important;
  box-shadow: 0 0 0 1px var(--state-success) !important;
}

.hoeren-choice-option.result-correct .hoeren-choice-radio,
.hoeren-choice-option.model-correct .hoeren-choice-radio {
  border-color: var(--state-success) !important;
  background: var(--state-success) !important;
  color: #ffffff !important;
}

.hoeren-choice-option.result-wrong {
  border-color: var(--state-danger) !important;
  background: color-mix(in srgb, var(--state-danger) 7%, var(--bg-surface)) !important;
  box-shadow: 0 0 0 1px var(--state-danger) !important;
}

.hoeren-choice-option.result-wrong .hoeren-choice-radio {
  border-color: var(--state-danger) !important;
  background: var(--state-danger) !important;
  color: #ffffff !important;
}

.hoeren-choice-correct-hint {
  margin-bottom: 14px !important;
}

/* 17.6 RESPONSIVE AUDIO & MOBILE QUESTION STACKING */
@media (max-width: 700px) {
  /* Mobile Audio Player: 2-Row CSS Grid Layout */
  html body > #content.exercise-page .hoeren-audio-player-card,
  html body.exercise-page .hoeren-audio-player-card,
  .hoeren-audio-player-card {
    display: grid !important;
    grid-template-columns: 1fr auto !important;
    grid-template-rows: auto auto !important;
    grid-template-areas:
      "main main"
      "controls actions" !important;
    gap: 12px 10px !important;
    padding: 12px 14px !important;
    min-height: auto !important;
    margin-bottom: 16px !important;
    border-radius: var(--radius-md, 14px) !important;
    direction: ltr !important;
  }

  .hoeren-audio-main {
    grid-area: main !important;
    width: 100% !important;
  }

  .hoeren-audio-controls-group {
    grid-area: controls !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  }

  .hoeren-audio-actions {
    grid-area: actions !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 6px !important;
    min-width: auto !important;
  }

  .hoeren-audio-volume {
    display: none !important;
  }

  .hoeren-audio-play {
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    min-height: 44px !important;
    font-size: 15px !important;
  }

  .hoeren-audio-skip-btn {
    height: 38px !important;
    min-height: 38px !important;
    min-width: 42px !important;
    padding: 0 8px !important;
    font-size: 11px !important;
  }

  .hoeren-audio-speed-btn {
    height: 38px !important;
    min-height: 38px !important;
    min-width: 42px !important;
    padding: 0 8px !important;
    font-size: 11px !important;
  }

  /* Teil 1 Mobile Card Layout */
  .hoeren-table-card {
    border-radius: var(--radius-md, 16px) !important;
  }

  .hoeren-table-head {
    display: none !important;
  }

  .hoeren-table-row {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    grid-template-areas:
      "statement statement"
      "btn-r btn-f" !important;
    gap: 12px 10px !important;
    padding: 16px 14px !important;
  }

  .hoeren-cell-statement {
    grid-area: statement !important;
    padding-left: 0 !important;
    width: 100% !important;
  }

  .hoeren-stmt-text {
    font-size: 14.5px !important;
  }

  .hoeren-cell-r {
    grid-area: btn-r !important;
    width: 100% !important;
  }

  .hoeren-cell-f {
    grid-area: btn-f !important;
    width: 100% !important;
  }

  .hoeren-circle-radio-btn {
    width: 100% !important;
    height: 44px !important;
    min-height: 44px !important;
    border-radius: var(--radius-sm, 10px) !important;
    border: 1px solid var(--border-default) !important;
    background: var(--bg-surface-elevated) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    padding: 0 10px !important;
    box-shadow: var(--shadow-subtle) !important;
  }

  .hoeren-circle-radio-btn .hoeren-circle-radio-label {
    display: inline-block !important;
    font-size: 13.5px !important;
    font-weight: 700 !important;
    color: var(--text-primary) !important;
  }

  .hoeren-circle-radio-btn.selected {
    border-color: var(--brand-primary) !important;
    background: color-mix(in srgb, var(--brand-primary) 8%, var(--bg-surface-elevated)) !important;
  }

  .hoeren-circle-radio-btn.selected .hoeren-circle-radio-label {
    color: var(--brand-primary) !important;
  }

  .hoeren-circle-radio-btn.result-correct,
  .hoeren-circle-radio-btn.model-correct {
    border-color: var(--state-success) !important;
    background: color-mix(in srgb, var(--state-success) 8%, var(--bg-surface-elevated)) !important;
  }

  .hoeren-circle-radio-btn.result-correct .hoeren-circle-radio-label,
  .hoeren-circle-radio-btn.model-correct .hoeren-circle-radio-label {
    color: var(--state-success) !important;
  }

  .hoeren-circle-radio-btn.result-wrong {
    border-color: var(--state-danger) !important;
    background: color-mix(in srgb, var(--state-danger) 8%, var(--bg-surface-elevated)) !important;
  }

  .hoeren-circle-radio-btn.result-wrong .hoeren-circle-radio-label {
    color: var(--state-danger) !important;
  }

  .hoeren-cell-statement .inline-translation {
    margin-left: 0 !important;
  }

  .hoeren-tf-correct-hint {
    margin-left: 0 !important;
  }

  /* Teil 2 Mobile Options */
  .hoeren-choice-card {
    padding: 16px 14px !important;
    border-radius: var(--radius-md, 14px) !important;
  }

  .hoeren-choice-question {
    font-size: 14.5px !important;
  }

  .hoeren-choice-option {
    padding: 10px 12px !important;
    gap: 10px !important;
    min-height: 44px !important;
  }

  .hoeren-choice-option-text {
    font-size: 13.5px !important;
  }
}

/* Extra small mobile adjustments (<= 360px) */
@media (max-width: 360px) {
  html body > #content.exercise-page .hoeren-audio-player-card,
  html body.exercise-page .hoeren-audio-player-card,
  .hoeren-audio-player-card {
    padding: 10px 10px !important;
    gap: 10px 6px !important;
  }

  .hoeren-audio-play {
    width: 42px !important;
    height: 42px !important;
    min-width: 42px !important;
    min-height: 42px !important;
  }

  .hoeren-audio-skip-btn {
    min-width: 38px !important;
    padding: 0 5px !important;
    font-size: 10.5px !important;
  }

  .hoeren-audio-speed-btn {
    min-width: 38px !important;
    padding: 0 5px !important;
    font-size: 10.5px !important;
  }

  .hoeren-table-row {
    padding: 14px 10px !important;
    gap: 10px 6px !important;
  }

  .hoeren-circle-radio-btn {
    height: 42px !important;
    padding: 0 6px !important;
    gap: 6px !important;
  }

  .hoeren-circle-radio-btn .hoeren-circle-radio-label {
    font-size: 12.5px !important;
  }
}
`;

let css = fs.readFileSync('public/assets/app.css', 'utf8');
css = css.trimEnd() + '\n\n' + section17.trim() + '\n';
fs.writeFileSync('public/assets/app.css', css, 'utf8');
console.log('Successfully appended Section 17 to public/assets/app.css!');
