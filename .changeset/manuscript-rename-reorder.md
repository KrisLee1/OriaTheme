---
"@oriatheme/presets": minor
---

Breaking: rename the Document Canvas preset to Manuscript, including its stable ID (`oria-document-canvas` → `oria-manuscript`) and named export (`oriaDocumentCanvasTheme` → `oriaManuscriptTheme`); token data is unchanged (ADR-0016). Persisted selections of the old ID fall back to the default theme under existing runtime semantics, and consumers must update imports and ID-based references. Also reorder the preview catalog: Manuscript now follows Default, with the Mono–Memphis visual-style group right after it; all remaining presets keep their previous relative order.
