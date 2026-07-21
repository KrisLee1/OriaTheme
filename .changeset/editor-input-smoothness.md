---
"@oriatheme/cli": patch
"@oriatheme/editor-core": patch
---

Improve theme editor input smoothness: pattern layer unit and number fields now buffer in-progress text and only commit Core-safe values, token fields no longer re-render the whole field tree on every revision, and editor-core reuses a single per-draft validation for snapshot diagnostics, preview, and save.
