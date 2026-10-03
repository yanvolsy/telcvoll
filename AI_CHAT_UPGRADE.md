# TELC Voll AI Chat Upgrade

Applied to the current card-border base version.

- Rebuilt `public/telc-chat.html` as a mobile-first conversational interface.
- Added safe Markdown rendering so headings, lists, bold text, links, code blocks and blockquotes render as UI rather than raw `*`, `#`, and backticks.
- Added assistant/user message layout, copy and read-aloud actions, typing state, suggestions, new-chat control.
- Added browser voice conversation mode using Web Speech API where supported: continuous listening, interim transcript, automatic turn submission, spoken replies, and restart after speech.
- Added responsive mobile layout and reduced-motion support.
- No React/Tailwind/shadcn introduced; existing project architecture preserved.
