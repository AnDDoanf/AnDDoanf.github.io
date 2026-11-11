---
title: "WebSecurity#015: Webserver Metafiles: robots.txt, sitemap.xml, and Security Disclosures"
date: 2026-11-15
category: journal
series: WebSecurity
description: "Review crawler directives, sitemaps, and security contact files without confusing discovery metadata with access control."
tags: [programming, cybersecurity, WebSecurity]
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

## 1. Introduction

Webserver metafiles describe parts of a website for crawlers, clients, or security researchers. They are useful operational interfaces and can reveal paths or organizational details beyond the main navigation.

This article maps to **WSTG-v42-INFO-03**. Review each file according to its purpose: some information should be public, while sensitive resources need independent access controls.

## 2. Fundamentals

### robots.txt gives crawler instructions

The root `/robots.txt` file describes paths a compliant crawler should avoid. The [Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309) does not authorize or prevent direct resource access. Anyone can request a listed path, and noncompliant clients can ignore the instructions.

Listing an administrative path can disclose its name. Removing that line may reduce a clue, but the interface still needs authentication, authorization, and appropriate network exposure controls.

### Sitemaps advertise intended discovery

An XML sitemap lists URLs and may include update metadata. It helps discovery without deciding which callers can retrieve a page. A generated sitemap may accidentally include an obsolete hostname, staging URL, or private path.

Presence in a sitemap is not inherently a leak. Compare entries with the intended public inventory and assess the sensitivity of the exposed information.

### security.txt provides a reporting route

[RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) defines `/.well-known/security.txt` for vulnerability-disclosure contact information. It requires Contact and Expires fields and specifies secure retrieval. Optional fields can point to a disclosure policy or other useful information.

A contact file helps someone report a problem. It does not itself authorize testing, guarantee a response time, or expand the scope of a published testing policy.

### Read robots rules without inventing an access policy

Consider this illustrative file:

```text
User-agent: *
Disallow: /internal-demo/
Allow: /internal-demo/public-guide
Sitemap: https://projects.example/sitemap.xml
```

The first directive applies the group to relevant crawlers, while the path rules guide permitted crawling within that group. Matching and precedence belong to the robots protocol and crawler behavior. None of these lines modifies the application's authentication middleware or storage permissions.

Robots files can also become stale when routes move or new hosts are introduced. Review the file at the correct origin and root path. A crawler rule on one hostname is not automatically a rule for every sibling subdomain or different service port.

### Validate sitemap content as publication data

A sitemap should be well-formed UTF-8 XML with the proper namespace and intended absolute URLs. Text values need XML escaping: a URL containing `&` in a query string must represent that character appropriately in XML. Parse the document rather than relying on a text search for `<loc>` alone.

For a public application, generate entries from the public content inventory. Do not enumerate every route from the router and assume it belongs in the sitemap. Account pages, internal diagnostics, private exports, and temporary signed download links have different purposes. A signed URL can itself be a bearer capability, so publishing it may disclose more than a path name.

Large sites may use sitemap indexes pointing to other sitemap documents. Review those references as part of the same publication process, including obsolete hosts and redirects. A homepage sitemap that looks clean does not establish that every referenced child document is correct.

### Treat the security contact as a maintained service

A reporting address needs an owner, monitoring, and a process for handling incoming reports. Publishing a mailbox that nobody reads gives a technically present file very little operational value. Include the contact route in ownership changes and expiry monitoring.

Use an appropriate future Expires value and renew it deliberately. A sample date will eventually become stale. A production file should be retrieved securely, use the required format, and avoid redirecting reporters to an unrelated or untrusted location.

## 3. Vulnerability

Problems include relying on robots exclusions to protect private pages, publishing signed private URLs in a sitemap, leaving internal hostnames in generated metadata, or allowing security contact information to expire unnoticed.

Similarly, `noindex` does not create confidentiality. Indexing directives govern cooperating search engines; restricted data must remain protected against direct requests and other discovery methods.

### Decide whether the problem is access, indexing, or operations

For a private export, the desired rule is "only an authorized subject can retrieve the file." For a public page intentionally excluded from search, the desired rule is "any visitor can read it, but cooperating search engines should not index it." For a security contact, the desired rule is "a researcher can find a current, usable reporting route." These are three different acceptance criteria.

A public unindexed page can use an appropriate robots meta directive or `X-Robots-Tag: noindex`, while allowing a crawler to fetch the directive. If crawling is blocked, the crawler may not see the instruction to remove the page from its index. Resolve the intended crawler behavior rather than piling on incompatible directives and assuming more restrictions always work better.

A private page instead requires actual access control. Returning 200 with a login screen does not mean the private resource was disclosed, and a suggestive URL in a sitemap does not prove its content is accessible. Test the returned representation and identity context separately from the metadata listing.

The reporting route needs an operational check. A working HTTPS file with an expired contact, abandoned mailbox, or inaccessible policy page can still fail the person trying to report an issue. Prefer a maintained team route over an individual's address when that better fits the organization's staffing and continuity needs.

When recording a finding, state the failed criterion and its owner. Route disclosure might need a metadata cleanup, public private-file access needs an application or storage fix, and missed security reports need a contact-process fix. Combining them into a vague "robots vulnerability" hides the actual remediation and makes retesting ambiguous.

## 4. Attack scenario

A team publishes `Disallow: /exports/` to keep customer exports out of search results. The export directory remains public. Someone reads the metafile and requests a known export path without signing in.

The serious weakness is public access to restricted files. Changing crawler rules alone does not fix it. The team must enforce access, remove unintended public copies, and review previous exposure.

## 5. Technical demonstration

Start the [local lab](/assets/websecurity/websecurity-lab.mjs) with `node websecurity-lab.mjs` and inspect its synthetic metadata:

```sh
curl.exe -i http://127.0.0.1:8080/robots.txt
curl.exe -i http://127.0.0.1:8080/sitemap.xml
curl.exe -i http://127.0.0.1:8080/.well-known/security.txt
curl.exe -i http://127.0.0.1:8080/internal-demo/
```

Use `curl` where `curl.exe` is unavailable. The robots file disallows `/internal-demo/`, but the final request returns 200 with harmless fixture text. The server does not interpret that exclusion as an access rule.

The sitemap lists the lab homepage. The security contact uses `example.invalid`, and the fixture is served over local HTTP. It is demonstration text, not a deployable disclosure policy or an RFC-compliant production deployment.

For a real deployment, retrieve the contact file over HTTPS, confirm required fields and future expiry, and verify that the contact route is monitored. Review sitemap generation using a public-URL allowlist so internal endpoints and temporary signed URLs stay out.

### Parse the sitemap in the browser

On the lab homepage, run this in the Console:

```js
const xml = await fetch("/sitemap.xml").then((response) => response.text());
const documentXml = new DOMParser().parseFromString(xml, "application/xml");
if (documentXml.querySelector("parsererror")) {
  throw new Error("Invalid sitemap XML");
}

const namespace = "http://www.sitemaps.org/schemas/sitemap/0.9";
const locations = [...documentXml.getElementsByTagNameNS(namespace, "loc")]
  .map((element) => element.textContent.trim());

const publicPaths = new Set(["/"]);
console.table(locations.map((locationText) => {
  const url = new URL(locationText);
  return {
    url: url.href,
    expectedPublicEntry: url.origin === location.origin
      && publicPaths.has(url.pathname)
      && url.search === "",
  };
}));
```

Expect the homepage entry to pass the lab's deliberately narrow publication rule. This is a policy check for one fixture, not a complete sitemap validator. Real sites may intentionally include query parameters or approved additional hosts under their supported sitemap submission arrangements. Express those rules explicitly rather than accepting every parseable URL.

To observe malformed XML safely, copy the returned string into a local variable, remove its closing tag, and run the parser again. The parse error is different from a policy failure: a valid document can still advertise a private URL, and an invalid document can still disclose the raw text of a sensitive link.

### Compare a contact template with the live retrieval

An illustrative production-shaped file could contain:

```text
Contact: mailto:security@example.com
Expires: 2027-06-01T00:00:00Z
Canonical: https://projects.example/.well-known/security.txt
Policy: https://projects.example/security-policy
Preferred-Languages: en, vi
```

These are reserved example names and a sample expiry, not working contact details. The sample date is in the future when this article is written and must be replaced as the file is maintained. Retrieve the real file from the organization's HTTPS origin and verify its canonical location, contact functionality, and applicable policy.

If a legacy root `/security.txt` also exists, make the relationship with `/.well-known/security.txt` deliberate rather than maintaining conflicting copies. Check redirects and cache lifetimes so an updated contact is not hidden behind stale edge content.

### Assess the robots fixture correctly

The lab's public `/internal-demo/` response is not a real confidential-data finding because its content is explicitly synthetic and public. Its purpose is to prove that the crawler rule is not authorization. In an actual finding, include separate evidence of restricted intent and current unauthorized retrieval; a suggestive path name alone does not establish sensitivity.

## 6. Impact

Metadata can reveal routes, deployment names, or publication mistakes. Impact increases when those clues lead to accessible private resources. Broken contact information can delay reporting and incident triage even when no data is directly exposed.

## 7. Prevention

Authorize private pages and files directly. Generate sitemaps from intended public content, exclude private URLs and secrets, and assign an owner for contact updates. Review redirects and legacy copies so different hosts do not publish inconsistent policies.

### Put metadata generation into the release process

Generate public metadata from approved source data, validate it before publishing, and give its ownership the same clarity as application routes. If documentation builds can read private files, ensure only approved public outputs reach the publish directory. Do not depend on a robots rule to compensate for an overly broad file-copy step.

For security contact changes, verify the receiving route without sending a false vulnerability report. A team-approved operational check can confirm mailbox delivery or form routing. Track expiry in advance, and include redirects, CDN caching, and translated policy pages in the update plan.

## 8. Detection and testing

Inspect metadata on relevant owned hostnames and compare it with the inventory. Validate resource access separately from crawler instructions. Check XML validity, canonical URLs, contact fields, HTTPS retrieval, expiry, and the operational reporting route.

| Check | Expected evidence | Common misleading conclusion |
| --- | --- | --- |
| Robots retrieval | Correct root file and intended crawler rules | "Disallow makes the directory private" |
| Restricted-resource request | Independent authentication and authorization result | "It is absent from the sitemap, so it is protected" |
| Sitemap parsing | Valid XML and intended URL inventory | "XML is valid, so every entry is appropriate" |
| Contact retrieval | HTTPS, current fields, usable reporting route | "A file exists, so reports reach the team" |
| Metadata change rollout | Intended content on relevant hosts and caches | "The source file changed, so the edge is current" |

Record these checks separately. This prevents a successful syntactic validation from hiding a publication-policy problem and prevents an operational reporting failure from being mistaken for a data-access flaw.

## 9. Checklist

- [ ] Treat robots rules as crawler guidance.
- [ ] Authorize restricted resources directly.
- [ ] Include only intended public URLs in sitemaps.
- [ ] Exclude internal names, secrets, and signed private links.
- [ ] Maintain a valid HTTPS security contact file.
- [ ] Verify that the reporting route reaches an owner.

## 10. References

- [WSTG 4.2: Review Webserver Metafiles](https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/01-Information_Gathering/03-Review_Webserver_Metafiles_for_Information_Leakage/) — metadata review objectives.
- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309) — crawler rules and limitations.
- [Sitemaps protocol](https://www.sitemaps.org/protocol.html) — XML sitemap structure.
- [RFC 9116: security.txt](https://www.rfc-editor.org/rfc/rfc9116) — security contact format.

---

**Continue the WebSecurity series:**

[Previous: WebSecurity#014: Web Server Fingerprinting](/blog/2026-11-10-websecurity-014-web-server-fingerprinting)
