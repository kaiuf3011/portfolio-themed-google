"use client";


/**
 * Runs during HTML parsing on hard loads; inert on the client (type="text/plain") so React
 * doesn't warn about rendering <script> on soft navigations.
 */
export function InlineScript({ html }: { html: string }) {
  return <script type={typeof window === "undefined" ? "text/javascript" : "text/plain"} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}
