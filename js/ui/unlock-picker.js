import { GAME } from '../constants.js';

/**
 * Tabbed unlock picker panel (Hats / Ink / Confetti).
 *
 * @param {object} refs - DOM refs
 * @param {object} unlockManager - unlock manager instance
 * @param {object} paymentSystem - payment system instance
 * @param {function} buildHatsContent - function that returns DOM nodes for the Hats tab
 * @returns {{ close(), refresh() }}
 */
export function createUnlockPicker(refs, unlockManager, paymentSystem, buildHatsContent) {
  let open = false;
  let activeTab = 'hats';

  const tabBtns = refs.unlockTabs.querySelectorAll('.unlock-tab');

  /* ── Tab switching ── */

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === activeTab));
      renderTab();
    });
  });

  /* ── Panel open/close ── */

  function toggle() {
    open = !open;
    refs.unlockPanel.classList.toggle('open', open);
    refs.accessoryBtn.classList.toggle('active', open);
    if (open) renderTab();
  }

  function close() {
    if (!open) return;
    open = false;
    refs.unlockPanel.classList.remove('open');
    refs.accessoryBtn.classList.remove('active');
  }

  refs.accessoryBtn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  refs.unlockPanel.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', close);

  /* ── Render tabs ── */

  function renderTab() {
    const container = refs.unlockTabContent;
    container.innerHTML = '';

    switch (activeTab) {
      case 'hats':
        buildHatsContent(container);
        break;
      case 'ink':
        renderInkTab(container);
        break;
      case 'confetti':
        renderConfettiTab(container);
        break;
    }
  }

  /* ── Ink tab (ink colors + sprinkles + emoji packs) ── */

  function renderInkTab(container) {
    const pins = unlockManager.getPins();

    /* Random option */
    appendOption(container, {
      label: 'Random (surprise me)',
      selected: pins.ink === null,
      onClick() {
        unlockManager.pinInk(null);
        renderTab();
      },
    });

    /* Ink colors section */
    appendSectionTitle(container, 'Ink Colors');
    for (const item of unlockManager.getInkDefs()) {
      const isUnlocked = unlockManager.isUnlocked(item.id);
      appendOption(container, {
        label: isUnlocked ? item.name : `${item.name} (${item.unlock.toLocaleString()} squirts)`,
        locked: !isUnlocked,
        selected: pins.ink === item.id,
        showBuy: !isUnlocked,
        itemId: item.id,
        onClick() {
          unlockManager.pinInk(item.id);
          renderTab();
        },
      });
    }

    /* Sprinkles section */
    appendSectionTitle(container, 'Sprinkles');
    for (const item of unlockManager.getSprinkleDefs()) {
      const isUnlocked = unlockManager.isUnlocked(item.id);
      appendOption(container, {
        label: isUnlocked ? item.name : `${item.name} (${item.unlock.toLocaleString()} squirts)`,
        locked: !isUnlocked,
        selected: pins.ink === item.id,
        showBuy: !isUnlocked,
        itemId: item.id,
        onClick() {
          unlockManager.pinInk(item.id);
          renderTab();
        },
      });
    }

    /* Emoji packs section */
    appendSectionTitle(container, 'Emoji Packs');
    for (const item of unlockManager.getEmojiDefs()) {
      const isUnlocked = unlockManager.isUnlocked(item.id);
      appendOption(container, {
        label: isUnlocked ? item.revealName : item.name,
        locked: !isUnlocked,
        selected: pins.ink === item.id,
        showBuy: false, /* No microtransactions for easter eggs */
        onClick() {
          if (isUnlocked) {
            unlockManager.pinInk(item.id);
            renderTab();
          }
        },
      });
    }
  }

  /* ── Confetti tab ── */

  function renderConfettiTab(container) {
    const pins = unlockManager.getPins();

    /* Random option */
    appendOption(container, {
      label: 'Random (surprise me)',
      selected: pins.confetti === null,
      onClick() {
        unlockManager.pinConfetti(null);
        renderTab();
      },
    });

    /* Default mini-squid is always available — represent as "Classic Squid" */
    appendOption(container, {
      label: 'Classic Squid',
      selected: pins.confetti === 'default',
      onClick() {
        unlockManager.pinConfetti('default');
        renderTab();
      },
    });

    for (const item of unlockManager.getConfettiDefs()) {
      const isUnlocked = unlockManager.isUnlocked(item.id);
      appendOption(container, {
        label: isUnlocked ? item.name : `${item.name} (${item.unlock.toLocaleString()} squirts)`,
        locked: !isUnlocked,
        selected: pins.confetti === item.id,
        showBuy: !isUnlocked,
        itemId: item.id,
        onClick() {
          unlockManager.pinConfetti(item.id);
          renderTab();
        },
      });
    }
  }

  /* ── Helpers ── */

  function appendSectionTitle(container, text) {
    const el = document.createElement('div');
    el.className = 'unlock-section-title';
    el.textContent = text;
    container.appendChild(el);
  }

  function appendOption(container, { label, locked, selected, showBuy, itemId, onClick }) {
    const btn = document.createElement('button');
    btn.className = 'accessory-option';
    if (locked) btn.classList.add('locked');
    if (selected) btn.classList.add('selected');
    btn.disabled = locked && !showBuy;

    btn.textContent = label;

    if (showBuy) {
      btn.disabled = false;
      btn.classList.remove('locked');
      const buyBtn = document.createElement('span');
      buyBtn.className = 'unlock-buy-btn';
      buyBtn.textContent = '\u{1F4B8} Buy';
      buyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const success = await paymentSystem.requestPayment(itemId);
        if (success) {
          unlockManager.unlockViaTxn(itemId);
          renderTab();
        }
      });
      btn.appendChild(buyBtn);
    }

    if (!locked) {
      btn.addEventListener('click', onClick);
    }

    container.appendChild(btn);
  }

  return { close, refresh: renderTab };
}
