/**
 * Chart-tool events. gtag is defined by Analytics.astro.
 * A blocked analytics script must not throw into the tool.
 */

type Gtag = (command: 'event', name: string, params?: Record<string, string | boolean>) => void;

export function trackChart(tool: string, name: string, params: Record<string, string | boolean> = {}): void {
  try {
    const gtag = (window as Window & { gtag?: Gtag }).gtag;
    if (typeof gtag !== 'function') return;
    gtag('event', name, { tool, ...params });
  } catch {
    // Analytics is optional.
  }
}

export function failedReasons(checks: { ok: boolean; id?: string }[]): string {
  return checks.flatMap((check) => (!check.ok && check.id ? [check.id] : [])).join(',');
}

/**
 * Fires tool_input after a pause, and again only when the text actually changes.
 * note() remembers a Load sample fill without firing tool_input.
 */
export function watchChartInput(
  tool: string,
  field: HTMLTextAreaElement,
): { markLoaded: (text: string) => void; note: (text: string) => void } {
  let last = '';
  let timer = 0;
  const report = (text: string) => {
    const value = text.trim();
    if (!value || value === last) return;
    last = value;
    trackChart(tool, 'tool_input');
  };
  field.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => report(field.value), 800);
  });
  return {
    markLoaded: (text) => {
      window.clearTimeout(timer);
      report(text);
    },
    note: (text: string) => {
      window.clearTimeout(timer);
      last = text.trim();
    },
  };
}
