# LinkSwift Operations Runbook

## Observability baseline
- Emit structured JSON logs for:
  - auth events (login/signup failures),
  - booking creation/status transitions,
  - payment webhook receipt and decision,
  - wallet debits/credits.
- Forward logs to a centralized store (e.g., Cloud Logging / ELK / Datadog).
- Add metrics and alerts:
  - webhook failure rate,
  - payment confirmation latency,
  - booking failure rate,
  - wallet insufficient-funds errors,
  - 5xx rate and p95 latency.

## Backup and recovery
- MongoDB daily snapshots + PITR enabled.
- Restore drill cadence: monthly to non-prod.
- Retain snapshots for at least 30 days.

## Incident response
1. Triage severity and blast radius.
2. Freeze deploys.
3. Verify health endpoint and database status.
4. Check payment webhook processing lag and failed events.
5. Communicate ETA and status updates every 30 minutes.

## Payment operations
- Ensure `IVORYPAY_PUBLIC_KEY` and `IVORYPAY_SECRET_KEY` are rotated quarterly.
- Monitor duplicate webhook event count.
- Reconciliation job should compare wallet/booking states against provider exports daily.

## Compliance and fraud
- Enforce request risk-score blocking (header from upstream risk provider).
- Keep an immutable journal of processed payment events.
- Flag high-velocity booking attempts for manual review.
