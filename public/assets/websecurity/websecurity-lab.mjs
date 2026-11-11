// Download this file, then run: node websecurity-lab.mjs
// Node.js 20+. Synthetic data only. Both servers bind to the loopback interface.
import http from "node:http";
import { randomBytes } from "node:crypto";

const originA = "http://127.0.0.1:8080";
const originB = "http://127.0.0.1:8081";
const page = `<!doctype html>
<html lang="en"><meta charset="utf-8"><title>WebSecurity local lab</title>
<h1>WebSecurity local lab</h1>
<p>Origin: <code id="origin"></code>. All responses contain synthetic data.</p>
<p>Open DevTools Network, Console, and Application/Storage panels.</p>
<button id="same">Same-origin fetch</button>
<button id="blocked">Cross-origin fetch without CORS</button>
<button id="allowed">Cross-origin fetch with CORS</button>
<button id="cookie">Set an HttpOnly demo cookie</button>
<button id="frame">Read a cross-origin iframe</button>
<pre id="output" aria-live="polite"></pre>
<iframe id="other" title="Other lab origin" src="${originB}/frame"></iframe>
<script>
document.querySelector('#origin').textContent = location.origin;
const output = document.querySelector('#output');
async function show(url) {
  try {
    const response = await fetch(url);
    output.textContent = response.status + ' ' + await response.text();
  } catch (error) { output.textContent = error.name + ': ' + error.message; }
}
document.querySelector('#same').onclick = () => show('/data');
document.querySelector('#blocked').onclick = () => show('${originB}/data');
document.querySelector('#allowed').onclick = () => show('${originB}/cors-data');
document.querySelector('#cookie').onclick = () => show('/set-cookie');
document.querySelector('#frame').onclick = () => {
  try { output.textContent = document.querySelector('#other').contentWindow.document.body.textContent; }
  catch (error) { output.textContent = error.name + ': ' + error.message; }
};
</script></html>`;

for (const port of [8080, 8081]) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    const send = (status, type, body) => {
      res.writeHead(status, { "Content-Type": `${type}; charset=utf-8` });
      res.end(req.method === "HEAD" ? "" : body);
    };
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      res.setHeader("Allow", "GET, HEAD, OPTIONS");
      return send(405, "text/plain", "Method not allowed");
    }
    if (["/cors-data", "/credentialed-data"].includes(url.pathname)) {
      const credentialed = url.pathname === "/credentialed-data";
      res.setHeader("Vary", "Origin");
      res.setHeader("Cache-Control", "no-store");
      if (req.headers.origin === originA) {
        res.setHeader("Access-Control-Allow-Origin", originA);
        res.setHeader("Access-Control-Allow-Methods", "GET");
        res.setHeader("Access-Control-Allow-Headers", "X-Lab-Trace");
        res.setHeader("Access-Control-Expose-Headers", "X-Lab-Response");
        if (credentialed) res.setHeader("Access-Control-Allow-Credentials", "true");
      }
      if (req.method === "OPTIONS") {
        const requestedHeaders = (req.headers["access-control-request-headers"] || "")
          .split(",").map((header) => header.trim().toLowerCase()).filter(Boolean);
        if (req.headers.origin !== originA
          || req.headers["access-control-request-method"] !== "GET"
          || requestedHeaders.some((header) => header !== "x-lab-trace")) {
          return send(403, "text/plain", "Preflight policy denied");
        }
        return send(204, "text/plain", "");
      }
      res.setHeader("X-Lab-Response", "synthetic-response");
      const result = { message: "Synthetic CORS data", port };
      if (credentialed) {
        // Report only presence. Never make an HttpOnly cookie readable by echoing its value.
        result.demoCookieReceived = /(?:^|;\s*)lab_session=demo-only(?:;|$)/.test(req.headers.cookie || "");
      }
      return send(200, "application/json", JSON.stringify(result));
    }
    if (req.method === "OPTIONS") return send(404, "text/plain", "No preflight policy here");
    if (url.pathname === "/") return send(200, "text/html", page);
    if (url.pathname === "/csp-demo") {
      const nonce = randomBytes(24).toString("base64");
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Content-Security-Policy", `default-src 'self'; script-src 'nonce-${nonce}'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`);
      return send(200, "text/html", `<!doctype html><html lang="en"><meta charset="utf-8"><title>CSP lab</title>
        <h1>CSP nonce exercise</h1><p id="allowed">Allowed script has not run</p><p id="blocked">Unapproved script did not run</p>
        <script nonce="${nonce}">document.querySelector('#allowed').textContent = 'Approved script ran';</script>
        <script>document.querySelector('#blocked').textContent = 'Unapproved script ran';</script></html>`);
    }
    if (url.pathname === "/frame") return send(200, "text/html", "<p>Synthetic frame content</p>");
    if (url.pathname === "/data") return send(200, "application/json", JSON.stringify({ message: "Synthetic data", port }));
    if (url.pathname === "/set-cookie") {
      // Plain HTTP is used only for this loopback lab. Real session cookies need HTTPS and Secure.
      res.setHeader("Set-Cookie", "lab_session=demo-only; Path=/; HttpOnly; SameSite=Lax");
      res.setHeader("Cache-Control", "no-store");
      return send(200, "text/plain", "Demo cookie set. It is not an authentication credential.");
    }
    if (url.pathname === "/fingerprint") {
      // Deliberately fabricated header: a banner is not proof of installed software.
      res.setHeader("Server", "ExampleServer/0.0 (synthetic)");
      return send(200, "text/plain", "Synthetic fingerprint fixture");
    }
    if (url.pathname === "/robots.txt") return send(200, "text/plain", "User-agent: *\nDisallow: /internal-demo/\nSitemap: " + originA + "/sitemap.xml\n");
    if (url.pathname === "/internal-demo/") return send(200, "text/plain", "Public synthetic page: robots.txt did not protect this path.");
    if (url.pathname === "/sitemap.xml") return send(200, "application/xml", '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' + originA + '/</loc></url></urlset>');
    if (url.pathname === "/.well-known/security.txt") {
      const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      return send(200, "text/plain", `Contact: https://example.invalid/security\nExpires: ${expires}\n`);
    }
    return send(404, "text/plain", "Not found");
  });
  server.on("error", (error) => {
    console.error(`Lab port ${port}: ${error.message}`);
    process.exit(1);
  });
  server.listen(port, "127.0.0.1", () => console.log(`WebSecurity lab: http://127.0.0.1:${port}`));
}
