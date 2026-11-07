const GONE = new Set([
  "/examples/criminal-history-timeline-sample-redacted.pdf",
  "/examples/criminal-history-timeline-page-1.png",
  "/examples/criminal-history-timeline-page-2.png",
  "/examples/casino-activity-red-flag-sample-redacted.pdf",
  "/examples/casino-activity-page-1.png",
  "/examples/casino-activity-page-2.png",
  "/examples/fraud-case-briefing-sample-redacted.pdf",
  "/examples/fraud-case-briefing-slide-1.png",
  "/examples/fraud-case-briefing-slide-2.png",
  "/examples/master-case-spreadsheet-sample-redacted.pdf",
  "/examples/master-case-spreadsheet-page-1.png",
  "/examples/case-contact-directory-sample-redacted.pdf",
  "/examples/case-contact-directory-page-1.png",
  "/examples/agency-ledger-colorcoded-sample-redacted.pdf",
  "/examples/agency-ledger-colorcoded-sample-redacted-page-1.png",
  "/examples/vaa-agency-ledger-colorcoded-sample-redacted.pdf",
  "/examples/vaa-agency-ledger-colorcoded-sample-redacted-page-1.png",
  "/examples/fraud-pattern-analysis-sample-redacted.pdf",
  "/examples/fraud-pattern-analysis-sample-redacted-page-1.png",
  "/examples/associates-entities-sample-redacted.pdf",
  "/examples/associates-entities-sample-redacted-page-1.png",
  "/examples/cross-case-pattern-comparison-sample.pdf",
  "/examples/associates-related-entities-sample.pdf"
]);

export function onRequest(context) {
  const path = new URL(context.request.url).pathname;
  if (!GONE.has(path)) return context.next();
  return new Response("Gone\n", {
    status: 410,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, must-revalidate",
      "cdn-cache-control": "public, max-age=300",
      "x-robots-tag": "noindex"
    }
  });
}
