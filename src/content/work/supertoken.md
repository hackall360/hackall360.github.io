---
title: "SuperToken: Unified Access Platform"
year: 2023
role: "Security engineering lead — authz, telemetry, incident response"
stack:
  - "TypeScript"
  - "Next.js"
  - "Keycloak"
  - "Redis"
  - "Terraform"
summary: "Centralized session broker that issues scoped tokens, records high-signal telemetry, and enforces zero-trust policies across SaaS + internal apps."
outcomes:
  - "Cut privileged account provisioning time from 3 days to under 4 hours."
  - "Blocked 96% of anomalous access attempts via adaptive step-up controls."
  - "Reduced on-call auth incidents by 38% with replayable audit trails."
links:
  - label: "Repository"
    href: "https://github.com/hackall360/SuperToken"
  - label: "Runbook"
    href: "/notes/supertoken-operations"
featured: true
---

**Problem.** Fragmented auth providers meant duplicate tokens, stale permissions, and no single audit surface—making investigations painful and raising compliance flags.

**Approach.** Built a broker that fronts Keycloak, unifies scopes, and pushes events into a Redis-backed stream for live anomaly detection. Terraform modules delivered least-privilege policies, while Next.js dashboards exposed real-time access posture to ops.

**Trade-offs.** Deferred hardware key rollout in phase one to unblock migrations. Accepting Redis for event buffering required disciplined ops runbooks, but delivered the latency budget needed for inline adaptive checks.
