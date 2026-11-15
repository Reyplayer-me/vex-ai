# Vex: the AI board that tells you whether to build your idea or kill it

Vex is an AI startup validator for first-time founders. Type an idea and get an honest,
evidence-backed verdict: PROCEED, PIVOT or KILL. Live at https://vex-ai.lovable.app

## What Vex does

- **Free verdict, no signup:** an overall score, four sub-scores, the top three risks, the one
  question you must answer before you build, and real competitors found by live web search,
  each with its source link. Every result shows a confidence level.
- **Five advisors:** CEO, Execution Officer, Risk Analyst, Psychologist (detects founder bias)
  and Industry Expert.
- **Full report (free during beta):** the boardroom debate and the board's decision, a
  Foundations → MVP → Launch → Iterate roadmap with Speed / Cost / Learning / Scale focus, a
  build plan with a First Weekend Plan, and a launch plan.
- **Idea tracker:** saved ideas, an assumptions checklist and optional weekly check-ins.
- **Sharing:** opt-in verdict cards and public summary links. Ideas are private by default.

Vex gives structured opinions, not guarantees.

## Setup

See [docs/BETA_SETUP.md](docs/BETA_SETUP.md) for the migration, secrets, admin role, sample
report and daily job.

## Pre-deployment security

`.github/workflows/security.yml` runs on pull requests, pushes, weekly schedules,
and manual requests. It is also reusable by deployment workflows.

- **Gitleaks** scans full Git history and current files. Detected values are
  completely redacted, raw reports/logs are not published, and any detection or
  scanner failure blocks the check. Only the exact existing public anonymous
  browser key is exempted in its two expected files; private keys, service tokens,
  and user tokens are not exempted. A changed public key requires explicit review.
- **Trivy** blocks HIGH/CRITICAL dependency and supported configuration findings,
  including unfixed vulnerabilities. It inspects lockfiles without installing
  application dependencies. This does not audit live database permissions or
  remote Deno imports in deployed functions.
- **CodeQL** checks JavaScript/TypeScript with security-extended queries and fails
  on findings, scan failures, or missing results. Private repositories require
  GitHub Code Security access; public repositories can use CodeQL for free.
- Actions use immutable commit pins; Gitleaks uses a pinned, checksum-verified
  binary. Review and update scanner versions and checksums periodically.

### Required setup in GitHub

1. Connect this project to GitHub through Lovable's Project settings → Git if it
   is not already connected. Checks run only after the files reach GitHub.
2. In repository branch rules, require **Security gate**, require pull requests,
   and restrict bypasses. Protect workflow/scanner edits with review. Enable
   GitHub secret scanning/push protection where available: CI detects committed
   secrets but cannot prevent the initial push from containing them.
3. Make every GitHub deployment job depend on the reusable security workflow:

   ```yaml
   jobs:
     security:
       uses: ./.github/workflows/security.yml
       permissions:
         contents: read
         security-events: write
     deploy:
       needs: security
       runs-on: ubuntu-latest
       steps:
         # Keep your existing deployment steps here.
   ```

   This is a wiring example, not an installed deployment workflow. No existing
   GitHub deployment workflow was present to modify. Lovable publishing does
   not wait for GitHub checks; verify checks before publishing there. Protect
   deployment environments and do not permit other deployment paths to bypass
   security checks. Hosted runs and GitHub settings remain unverified.

### Connector scans (Wiz / Aikido)

Lovable connector security scans run automatically at workspace scope and show
results in the project's Security tab. There is no documented external CI
trigger/result-export interface for `connector_security_scan`. This workflow
does **not** claim to run or gate those connector scans. Running a provider's
own CI integration would be separate, requires that provider's supported
integration and securely configured credentials, and has not been set up here.
Review connector and Lovable database/auth findings in Security before publishing.

### Local checks

On Linux x64, install the scanner outside the repository and run:

```bash
bash scripts/security/install-gitleaks.sh /tmp/vex-security-bin
GITLEAKS_BIN=/tmp/vex-security-bin/gitleaks python3 -m unittest discover -s scripts/security -p 'test_*.py'
GITLEAKS_BIN=/tmp/vex-security-bin/gitleaks bash scripts/security/scan-secrets.sh
```

For a real leak, revoke/rotate the credential through its issuing service and
remove it from current files and repository history. Do not suppress private
credentials or store them in browser code. Store server-side credentials securely.
