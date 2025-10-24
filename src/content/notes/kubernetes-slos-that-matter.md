---
title: "Kubernetes SLOs that matter (and what to ignore)"
description: "A pragmatic shortlist of cluster SLOs that actually influence customer experience, plus the noisy metrics to skip."
tags:
  - observability
  - kubernetes
  - reliability
publishedAt: 2024-10-15
updatedAt: 2024-10-15
---

## Focus on signals users feel

I used to track every metric the control plane emitted. The dashboards looked impressive, but outages still surprised us because
none of the thresholds mapped to user impact. The SLOs that stuck are the ones tied directly to customer experience.

## Core SLOs in rotation

- **Ingress success rate.** 99.9% of HTTPS requests must terminate without 5xx responses attributed to the cluster.
- **Pod readiness latency.** 95th percentile of pod readiness under 45 seconds keeps deploys snappy and autoscaling believable.
- **Job completion timeliness.** 99% of CronJobs finish within their scheduled window; misses trigger queue backups we feel in
  production.

## What I stopped measuring

- **API server request saturation.** The metric spiked often but never correlated with incidents; we now use it as a debugging
  signal only.
- **Node disk pressure warnings.** Too noisy with burst workloads; we switched to a direct "free inode" SLI fed into auto-healing
  scripts.
- **Control plane component restarts.** Kubernetes healed itself while we chased phantom restarts. We now alert on workload restar
  ts instead.

## Keeping SLOs honest

Review the error budgets in post-incident reviews, and prune an SLO when it stops driving action. The goal is to keep operators
focused on the conditions that customers will notice, not the ones that merely fill a dashboard.
