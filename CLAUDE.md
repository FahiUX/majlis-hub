# WEEV (majlis-hub) — agent rules

## 🔒 Brand lock (read first)
The WEEV logo, the heart-ribbon W and Tempa the mascot are **final and locked**.
Before ANY brand, logo, mascot, icon, splash or animation work, read **`docs/brand/LOGO.md`**.
- Use the files in `preview/logos/final/`. Never redraw, re-trace or AI-generate the logo or the W.
- Small fixes = edit the approved file, never regenerate.
- Fresh clone: run `git config core.hooksPath .githooks` once (enables the brand pre-commit lock).
- Verify: `cd preview/logos/final && sha256sum -c ../../../docs/brand/LOGO.sha256`
- Changing a final file needs the user's explicit approval.

## Context
- Session handover: `HANDOVER.md` (start with its last "Start here next session" list). History: `conversation.md`.
- Builds: run the UI/UX review agent and the Retro agent on every build round (see `AI-AGENT.md`).
