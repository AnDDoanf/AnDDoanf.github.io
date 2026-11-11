---
title: "WebSecurity#010: OWASP Top 10, WSTG, ASVS, and CWE Explained"
date: 2026-11-10
category: journal
series: WebSecurity
description: "Use awareness categories, security requirements, testing methods, and weakness identifiers for their distinct purposes."
tags: [programming, cybersecurity, WebSecurity]
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

## 1. Introduction

Security reports often mention OWASP categories, WSTG tests, ASVS requirements, and CWE identifiers together. These resources complement one another, but they answer different questions. Choosing the right reference makes a report easier to understand and an engineering requirement easier to verify.

For example, a missing ownership check can be discussed as an access-control risk, described through a weakness classification, and tested against a specific application requirement. One label cannot replace all three steps.

## 2. Fundamentals

| Resource | Primary purpose | Useful question |
| --- | --- | --- |
| OWASP Top 10 | Awareness of prominent risk categories | Which broad risks should our team understand? |
| ASVS | Verifiable application security requirements | Which controls must this application satisfy? |
| WSTG | Security testing methods and objectives | How can we investigate control behavior? |
| CWE | Classification of underlying weaknesses | What kind of implementation or design mistake occurred? |

The [OWASP Top 10 project](https://owasp.org/www-project-top-ten/) identifies its released 2025 edition as an awareness document. Use it to communicate recurring risks, while choosing requirements from the application's actual architecture and data sensitivity.

The [ASVS project](https://asvs.owasp.org/) publishes application security requirements; its documented stable release is 5.0.0. Teams should select an appropriate verification scope, record exclusions, and gather evidence rather than claim compliance from a few representative checks.

WSTG provides test objectives and techniques. This series uses version-pinned WSTG 4.2 references when citing that release. Development-guide sections may differ, so retain the guide version with each test identifier.

[CWE](https://cwe.mitre.org/about/index.html) describes weakness classes. It is different from CVE, which identifies a particular vulnerability record. An application-specific flaw can have a useful CWE mapping even if it has no CVE identifier.

### Trace one finding through the four resources

Suppose Alice can read Bob's private project by changing an ID in a request. The broad risk is broken access control, which is useful for communicating the issue to a team familiar with OWASP awareness categories. The concrete requirement is that only permitted subjects can read the selected project. A testing method compares requests across identities and object ownership. The weakness classification describes why the implementation violated the rule.

Those connections are many-to-many. One ASVS requirement may need several tests across routes and identities. One WSTG test can discover different root causes. A CWE can appear under different business features. Avoid building a spreadsheet that assumes every requirement maps to exactly one test and one category.

### Use real, versioned requirement identifiers

The [ASVS 5.0.0 authorization chapter](https://github.com/OWASP/ASVS/blob/v5.0.0/5.0/en/0x17-V8-Authorization.md) provides several relevant requirements:

| Requirement | Application to the project example |
| --- | --- |
| `v5.0.0-8.1.1` | Document function and data access rules before testing them |
| `v5.0.0-8.2.1` | Require permission for the operation itself |
| `v5.0.0-8.2.2` | Require permission for the specific project data |
| `v5.0.0-8.2.3` | Restrict reading and writing individual protected fields |
| `v5.0.0-8.3.1` | Enforce the decision in a trusted service layer |
| `v5.0.0-8.4.1` | Preserve tenant boundaries in a multi-tenant application |

This is a worked selection, not a complete authorization assessment. Read the release's actual text and applicability level when setting a verification target. An organization might also need requirements for identity, session management, error handling, and logging to support the same feature.

### Distinguish verification status from finding status

A requirement can be verified, failed, not tested, not applicable, or awaiting evidence. A finding can be open, mitigated, fixed, or accepted under a risk decision. These statuses describe different things. Closing a ticket because a feature was disabled can mitigate an issue without proving that the original implementation now satisfies the requirement.

Similarly, an automated scan that finds nothing leaves many controls untested. It does not transform every relevant requirement into a pass. Preserve evidence of what was actually exercised, by which method, in which environment, and under which identity context.

## 3. Vulnerability

Using an awareness list as a complete verification standard can leave application-specific risks untested. Automatically copying a scanner's category can also obscure the root cause, especially when one visible symptom has several possible explanations.

Version ambiguity creates another problem. A requirement number without a version may later refer to changed text. Reports should preserve the version, requirement wording or title, and the evidence connecting it to the finding.

### Choose evidence methods according to the control

| Method | Strong evidence for | Important limitation |
| --- | --- | --- |
| Requirement and design review | Whether the intended policy is defined coherently | Does not prove the deployed implementation follows it |
| Source review | Trusted identity flow and where checks occur | Can miss configuration drift or unreviewed paths |
| Dependency analysis | Known advisories matching components | Does not generally establish business-logic correctness |
| Dynamic API testing | Observable behavior for chosen identities and inputs | Covers only the cases and environments exercised |
| Configuration review | Actual gateway, storage, and service permissions | Needs runtime and ownership context |
| Operational evidence | Deployment state, revocation, and monitoring behavior | Logs may be incomplete and require careful interpretation |

A defensible verification combines methods when a requirement spans several boundaries. For a private export, source review can show an authorization check, dynamic testing can compare tenant identities, and storage-policy review can establish that the resulting object is not public. Any one of those alone leaves an important gap.

Choose the smallest set of evidence that establishes the requirement in scope. Collecting large volumes of scanner output does not compensate for never testing the forbidden action. Likewise, one successful negative case should not be described as universal proof across every API version and deployment.

Keep evidence reproducible: fixture state, build identifier, relevant configuration, request sequence, and expected result. Redact secrets while retaining the fields needed to understand the decision. Another reviewer should be able to follow the chain from requirement to result without access to the original author's memory.

## 4. Attack scenario

A team completes a generic injection scan and declares a project API secure because it has reviewed the Top 10. A logged-in user can still download another tenant's export. The scan did not exercise the tenant permission rule, and the team never defined the expected authorization result.

The improvement is to write the tenant-isolation requirement first, select testing methods that compare identities and resources, then classify the confirmed weakness.

## 5. Technical demonstration

Create a local finding record for the synthetic project ownership example:

```yaml
id: LAB-ACCESS-001
title: another user can read a private project
requirement: only owners and explicitly permitted members can read a project
setup: alice owns p1; bob owns p2
action: alice requests p2 through the API
expected: no private project data is returned
actual: synthetic p2 details are returned
weakness_candidate: CWE-862 Missing Authorization
references:
  - https://cwe.mitre.org/data/definitions/862.html
  - https://wstg.owasp.org/v4.2/
remediation: enforce resource-specific access before returning data
```

`CWE-862` is a candidate only when the evidence supports a missing check. A present but incorrectly implemented check may need a different classification. Likewise, select the relevant ASVS requirement from the exact release being used; do not invent a requirement number because it looks familiar.

This exercise produces a reviewable result without running an external scanner or contacting a public application.

### Convert the requirement into acceptance criteria

For `v5.0.0-8.2.2`, define a small matrix for a disposable project application:

| Subject | Requested object | Expected result |
| --- | --- | --- |
| Alice | Alice's project | Allowed fields returned |
| Alice | Bob's unrelated private project | No private data returned |
| Alice | Project in another tenant | Denied without cross-tenant disclosure |
| Removed member | Previously shared project | Access removed according to the documented policy |
| Anonymous caller | Any private project | No private project data returned |

Repeat the relevant cases for file download, export, update, and background-job results. A passing GET detail case does not establish the same policy on all representations.

Write acceptance criteria with observable behavior. "Authorization is secure" cannot be directly verified. "An ordinary member cannot obtain an export belonging to a tenant they do not belong to, using either the export API or its issued download link" defines a much clearer target.

### Choose a CWE from the root cause

If there is no check at all before a protected operation, missing authorization may fit. If a check exists but uses an incorrect condition, incorrect authorization may fit better. If the system places a security decision solely in browser code, a client-side enforcement weakness may be relevant as well.

Record one primary root cause when that is sufficient and explain any additional mappings. Listing many loosely related CWE IDs makes a report harder to use for remediation. The goal is to help engineers find and fix the mistake, not maximize classification coverage.

### A traceability record with useful evidence

```yaml
control: project-object-authorization
reference: v5.0.0-8.2.2
local_rule: only permitted project members may read private project content
test_cases:
  - alice_reads_own_project
  - alice_cannot_read_bob_project
  - removed_member_cannot_download_export
environment: disposable-local-sample
evidence:
  - redacted request and response pairs
  - fixture ownership and membership state
  - service policy and resource-scoped query review
status: not-tested
owner: project-api-team
```

Start with an honest untested status. Attach actual results when performed. Keep evidence references separate from raw credentials and private content so the verification record can be shared with appropriate reviewers safely.

## 6. Impact

Poor reference use can create false assurance, inconsistent remediation, and misleading audit records. Accurate mappings help teams find similar weaknesses and communicate findings, but the evidence and affected assets remain the basis for assessing actual impact.

## 7. Prevention

Pin versions, state the verification scope, and distinguish requirements from methods and classifications. Use risk categories for communication, detailed controls for implementation, and application-specific evidence for conclusions. Maintain mappings as supporting metadata rather than treating them as proof.

### Maintain the mapping through change

When adopting a new ASVS or WSTG release, review changed wording and identifiers rather than automatically substituting version strings. Keep historical reports pinned to the versions under which they were written. A release migration can change applicability or require additional evidence without making the old report meaningless.

Use requirements in design tickets, code-review guidance, and acceptance criteria. Use WSTG methods to investigate behavior. Use CWE for root-cause trends and recurring training needs. Use awareness categories to communicate themes. This division makes each reference useful without asking one document to serve every role.

## 8. Detection and testing

Review a sample of findings and ask whether another engineer can reproduce the result from the setup and expected behavior. Check reference links, versioned identifiers, and root-cause classifications. Confirm that "not applicable" decisions include a reason and that untested controls remain visibly untested.

### Audit the strength of a claimed pass

Select one passed requirement and follow its evidence chain. Is the policy written? Does the implementation enforce it at the right boundary? Did the test exercise both permitted and forbidden behavior? Was the tested build actually deployed? Are unsupported environments or alternate interfaces excluded explicitly?

Also review applicability decisions. For example, "no file uploads" should be checked against direct object-storage uploads, document-import integrations, and administrative tools. A feature absent from the main UI may still exist elsewhere in the system. Record the reason and evidence behind a not-applicable decision so later changes can reopen it.

## 9. Checklist

- [ ] Choose references according to their purpose.
- [ ] Pin ASVS and WSTG versions.
- [ ] State the application-specific requirement.
- [ ] Record setup, expected behavior, and observed evidence.
- [ ] Map CWE to the confirmed underlying weakness.
- [ ] Keep exclusions and untested areas explicit.

## 10. References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — awareness categories.
- [OWASP ASVS](https://asvs.owasp.org/) — security requirements and releases.
- [WSTG 4.2](https://wstg.owasp.org/v4.2/) — version-pinned testing guide.
- [MITRE: About CWE](https://cwe.mitre.org/about/index.html) — weakness classification.
- [CWE-862: Missing Authorization](https://cwe.mitre.org/data/definitions/862.html) — example weakness definition.
- [ASVS 5.0.0: Authorization](https://github.com/OWASP/ASVS/blob/v5.0.0/5.0/en/0x17-V8-Authorization.md) — exact requirements used in the worked mapping.
- [CWE-863: Incorrect Authorization](https://cwe.mitre.org/data/definitions/863.html) — distinguishing a faulty check from an absent one.

---

**Continue the WebSecurity series:**

[Previous: WebSecurity#009: Threat Modeling and Trust Boundaries](/blog/2026-11-10-websecurity-009-threat-modeling-trust-boundaries) | [Next: WebSecurity#011: CVE, CVSS, and Vulnerability Severity](/blog/2026-11-10-websecurity-011-cve-cvss-vulnerability-severity)
