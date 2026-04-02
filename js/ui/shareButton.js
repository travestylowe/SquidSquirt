/**
 * Share button: Web Share API with clipboard fallback.
 */
export function createShareButton(btnEl, getCount) {
  async function share() {
    const count = getCount();
    const text = `I squeezed a squid ${count.toLocaleString()} times at squidsquirts.com`;
    const url = 'https://squidsquirts.com';

    if (navigator.share) {
      try {
        await navigator.share({ text, url });
        return;
      } catch (e) {
        /* AbortError = user cancelled; fall through to copy for other errors */
        if (e.name === 'AbortError') return;
      }
    }

    copyToClipboard(`${text}\n${url}`);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      btnEl.classList.add('share-copied');
      setTimeout(() => btnEl.classList.remove('share-copied'), 1500);
    }).catch((e) => {
      /* Clipboard also blocked — nothing more we can do */
      if (window.SQUIDSQUIRT_CONFIG?.debug) console.warn('clipboard', e);
    });
  }

  btnEl.addEventListener('click', (e) => {
    e.stopPropagation();
    share();
  });
}
