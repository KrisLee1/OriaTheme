---
"@oriatheme/runtime-dom": patch
---

Remove the first-paint bootstrap stylesheet after a successful runtime apply so optional gradient and pattern variables from a previous theme cannot remain in the cascade.
