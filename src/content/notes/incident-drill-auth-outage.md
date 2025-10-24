---
title: "Incident drill: a 45-minute tabletop for auth outages"
description: "A facilitation kit for running fast-paced rehearsals that expose brittle authentication paths before prod users do."
tags:
  - incident-response
  - facilitation
  - reliability
publishedAt: 2024-10-22
updatedAt: 2024-10-22
---

## Scenario snapshot

This tabletop simulates a sudden spike of 401 errors after a dependency deploy. The session packs discovery, containment, and
post-incident commitments into 45 minutes so teams can practice under a controlled clock.

## Prep checklist

- **Cast the roles.** Assign an incident commander, comms lead, and two responders. Observers capture follow-up tasks.
- **Artifacts ready to share.** Provide mock dashboards, authentication logs, and a changelog excerpt with a hidden regression.
- **Exit criteria.** Define what "restored" means—users can sign in again, log drains, and the rollback is verified.

## Timeline beats

1. **Kickoff (5 minutes).** Commander sets objectives and constraints; comms lead drafts the first customer update.
2. **Discovery (10 minutes).** Responders inspect metrics, reproduce failures, and identify the deploy hash.
3. **Stabilize (15 minutes).** Team decides between rollback and feature flag; commander authorizes mitigation.
4. **Review (10 minutes).** Everyone outlines two automation or monitoring gaps discovered during the drill.
5. **Close (5 minutes).** Capture action owners, due dates, and schedule the next rehearsal.

## Debrief cues

Ask participants how confident they felt navigating the runbook, what slowed status updates, and which alerts arrived too late.
I end the drill with a single commitment: schedule the real fixes while the pain is fresh.
