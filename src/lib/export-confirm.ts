/**
 * Inline export gate. A download with no blocking checks runs immediately.
 * Otherwise the page lists those checks and waits for Export anyway or Cancel.
 */

export interface ExportCheck {
  ok: boolean;
  text: string;
  blocksExport?: boolean;
}

export function blockingMessages(checks: ExportCheck[]): string[] {
  return checks.filter((check) => check.blocksExport === true && !check.ok).map((check) => check.text);
}

export function bindExportConfirm(root: ParentNode, run: (action: string, confirmed: boolean) => void): {
  request: (action: string, issues: string[]) => void;
  hide: () => void;
} {
  const panel = root.querySelector('[data-export-confirm]');
  const list = root.querySelector('[data-export-issues]');
  const anyway = root.querySelector('[data-export-anyway]');
  const cancel = root.querySelector('[data-export-cancel]');
  if (
    !(panel instanceof HTMLElement) ||
    !(list instanceof HTMLElement) ||
    !(anyway instanceof HTMLButtonElement) ||
    !(cancel instanceof HTMLButtonElement)
  ) {
    return {
      request: (action) => run(action, false),
      hide: () => undefined,
    };
  }

  let pending = '';

  const hide = () => {
    pending = '';
    panel.hidden = true;
    list.replaceChildren();
  };

  anyway.addEventListener('click', () => {
    const action = pending;
    hide();
    if (action) run(action, true);
  });
  cancel.addEventListener('click', hide);

  return {
    hide,
    request: (action, issues) => {
      if (issues.length === 0) {
        hide();
        run(action, false);
        return;
      }
      pending = action;
      list.replaceChildren();
      for (const issue of issues) {
        const item = document.createElement('li');
        item.textContent = issue;
        list.append(item);
      }
      panel.hidden = false;
      panel.scrollIntoView({ block: 'nearest' });
    },
  };
}
