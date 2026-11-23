/**
 * Optional early-bird email after a file has already downloaded.
 * Dismissal and a successful signup are remembered in this browser.
 */

import { trackChart } from './analytics';
import { isEmail, normalizeEmail } from './email';

const DISMISS_KEY = 'babeldoc-early-bird-dismissed';
const JOINED_KEY = 'babeldoc-early-bird-joined';

function remembered(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function remember(key: string): void {
  try {
    window.localStorage.setItem(key, '1');
  } catch {
    // Private mode can refuse storage. The box still closes for this view.
  }
}

export function bindEarlyBird(root: ParentNode, tool: string): { show: () => void } {
  const box = root.querySelector('[data-early-bird]');
  const form = root.querySelector('[data-early-form]');
  const email = root.querySelector('[data-early-email]');
  const message = root.querySelector('[data-early-message]');
  const dismiss = root.querySelector('[data-early-dismiss]');
  const later = root.querySelector('[data-early-later]');
  if (
    !(box instanceof HTMLElement) ||
    !(form instanceof HTMLFormElement) ||
    !(email instanceof HTMLInputElement) ||
    !(message instanceof HTMLElement) ||
    !(dismiss instanceof HTMLButtonElement) ||
    !(later instanceof HTMLButtonElement)
  ) {
    return { show: () => undefined };
  }

  const hide = () => {
    box.hidden = true;
  };

  const closeForLater = () => {
    remember(DISMISS_KEY);
    hide();
  };

  dismiss.addEventListener('click', closeForLater);
  later.addEventListener('click', closeForLater);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const address = normalizeEmail(email.value);
    if (!isEmail(address)) {
      message.hidden = false;
      message.textContent = 'Enter a valid email address.';
      return;
    }
    const submit = form.querySelector('[type="submit"]');
    if (submit instanceof HTMLButtonElement) submit.disabled = true;
    void fetch('/api/early-access', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: address, tool }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          message.hidden = false;
          message.textContent = body?.error || 'Could not save that email. Try again.';
          if (submit instanceof HTMLButtonElement) submit.disabled = false;
          return;
        }
        remember(JOINED_KEY);
        trackChart(tool, 'email_submit');
        form.hidden = true;
        dismiss.hidden = true;
        message.hidden = false;
        message.textContent = 'Thanks. We’ll email you about the early-bird price.';
      })
      .catch(() => {
        message.hidden = false;
        message.textContent = 'Could not save that email. Try again.';
        if (submit instanceof HTMLButtonElement) submit.disabled = false;
      });
  });

  return {
    show: () => {
      if (remembered(JOINED_KEY) || remembered(DISMISS_KEY)) return;
      message.hidden = true;
      box.hidden = false;
    },
  };
}
