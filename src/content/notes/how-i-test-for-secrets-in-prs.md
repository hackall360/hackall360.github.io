---
title: "How I test for secrets in PRs without crying"
description: "Rotation-friendly guardrails for catching leaked tokens in pull requests without burying reviewers in noise."
tags:
  - security
  - automation
  - developer-experience
publishedAt: 2024-10-24
updatedAt: 2024-10-24
---

## Why secret scanning kept failing

Shipping fast often meant that sensitive strings drifted into review. Built-in scanners were either tuned so loosely they alerted on
anything with the word `key`, or so strict they missed scoped tokens entirely. Incident retros pointed to the same three
failures: reviewers trusted "green" checks blindly, the CI job lagged minutes behind a push, and we had no reliable inventory of
what secrets actually looked like.

## Guardrails that survived production

- **Inventory first.** We captured real token formats—length, prefixes, entropy—by redacting samples in a private repository.
  Having a canonical list of patterns let us tighten entropy thresholds and reduce false positives by about 60%.
- **Dual scanners with intent.** TruffleHog handled entropy-heavy detection while Gitleaks managed explicit patterns. The
  overlap caught risky strings within 10 seconds of a push.
- **Reviewer controls.** Findings surfaced as review comments with remediation tips instead of a wall of CI logs. Reviewers could
  acknowledge, suppress for a single commit, or block the merge entirely.
- **Auto-rotations wired in.** When a leak triggered, a GitHub Action hit our secrets broker to rotate and revoke the token, then
  posted clean-up instructions back into the PR thread.

## What stays on my checklist

1. Run the scanners locally via a pre-commit hook before opening the PR.
2. Confirm the rotation pipeline still functions end-to-end after each dependency upgrade.
3. Audit suppressions weekly; expired justifications purge themselves after seven days.

These habits keep secret scanning predictable enough that engineers trust the alerts—and fix the leak—without grinding the release
cycle to a halt.
