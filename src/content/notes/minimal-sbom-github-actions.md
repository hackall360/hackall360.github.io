---
title: "Minimal SBOM + provenance in GitHub Actions"
description: "The smallest workflow changes needed to generate SBOMs with signed build attestations in GitHub-hosted runners."
tags:
  - supply-chain
  - github-actions
  - platform-engineering
publishedAt: 2024-10-18
updatedAt: 2024-10-18
---

## Problem framing

Customers demanded artifact transparency, but our CI pipelines only produced build logs. We needed software bills of materials and
signed provenance without turning every workflow into a research project.

## Workflow adjustments

- **Add a CycloneDX step.** `cyclonedx-gomod` and `cyclonedx-npm` covered Go and Node builds. The artifacts ship as build
  attachments and upload to our S3 evidence bucket.
- **Generate provenance via `actions/attest-build-provenance`.** The action signs the build output with GitHub-managed keys and
  emits an in-toto statement we can verify downstream.
- **Enforce verification in deployments.** Our CD job refuses to promote artifacts unless both the SBOM and provenance files are
  attached and validate against the expected digest.

## Ongoing maintenance

- Rotate the attestation verification keys quarterly and document the fingerprint in the runbook.
- Patch the CycloneDX CLI monthly; new schema versions surface CVE data without extra tooling.
- Track SBOM upload failures as production alerts—missing evidence is a deploy blocker, not an FYI.

These adjustments kept our compliance reviewers satisfied while staying small enough that engineers could adopt them across
repositories within a single sprint.
