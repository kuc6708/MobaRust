# Security policy

MobaRust is currently a desktop preview. The latest source and latest platform
installer can differ; report the exact version, OS, architecture, and affected
workflow. Older previews are not promised backported fixes.

Do not put passwords, keys, passphrases, tokens, production targets, profile
exports, terminal transcripts, or unredacted logs in public issues. Use
[GitHub's private vulnerability reporting channel](https://github.com/OthmaneBlial/MobaRust/security/advisories/new)
to send the maintainers a confidential report.

Include a reproduction using disposable fixtures, the impact, and whether the
problem affects source or a packaged build. Do not test on third-party servers
or production infrastructure.

The [threat model](docs/security/threat-model.md),
[dependency audit record](docs/security/dependency-audit.md), and
[safe testing policy](docs/security/safe-testing.md) describe current boundaries
and limits. RDP remains experimental and excluded from normal bundles under
its separate advisory gate. A clean dependency audit is not a guarantee that
application code is vulnerability-free.

The development branch documents [explicit SSH host trust](docs/security/host-trust.md)
and [current validation/release blockers](docs/testing/production-readiness-2026-11-09.md).
Unknown keys require operator review; changed keys are never replaced by the
trust action. Both the shipping workspace and helper lockfiles require separate
fresh audits. Strict release validation denies warnings; the recorded upstream
GTK/DBus maintenance and unsoundness warnings remain visible and unresolved.
