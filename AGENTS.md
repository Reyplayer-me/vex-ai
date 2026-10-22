# Project rules

- Resolve paid-plan pricing and selection destinations from the shared plan availability module; unavailable tiers must lead to their Coming soon screen rather than signup.

- Keep security automation in a dedicated GitHub Actions workflow and reusable scripts; this isolates pre-deployment checks from application behavior.
- Secret scans must redact detected values and scan both Git history and current files; diagnostics must never leak the credentials being detected.
- Do not invent CI endpoints for Lovable connector scans; workspace connector scanning and external CI have separate supported interfaces.