// js/ui/feedback.js

import { isSupabaseConfigured, supabaseInsert } from '../counter/supabaseClient.js';

/**
 * Feedback form — opens a modal for bug reports, feature requests, or hellos.
 * Submits to the Supabase `feedback` table. Gracefully degrades if Supabase
 * is not configured.
 */
export function createFeedbackSystem(refs) {
  const FOCUSABLE = 'a[href], button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let previousFocus = null;

  function trapFocus(e) {
    const inner = refs.feedbackModal.querySelector('.payment-modal-inner');
    const focusable = [...inner.querySelectorAll(FOCUSABLE)];
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    if (e.key === 'Escape') hide();
  }

  function show() {
    if (!isSupabaseConfigured()) {
      refs.feedbackBtn.title = 'Feedback unavailable (no server)';
      return;
    }
    previousFocus = document.activeElement;
    refs.feedbackModal.hidden = false;
    refs.feedbackModal.addEventListener('keydown', trapFocus);
    requestAnimationFrame(() => refs.feedbackType.focus());
  }

  function hide() {
    refs.feedbackModal.hidden = true;
    refs.feedbackModal.removeEventListener('keydown', trapFocus);
    refs.feedbackText.value = '';
    refs.feedbackSubmit.disabled = true;
    if (previousFocus) {
      previousFocus.focus();
      previousFocus = null;
    }
  }

  function updateSubmitState() {
    refs.feedbackSubmit.disabled = refs.feedbackText.value.trim().length < 3;
  }

  async function submit() {
    const type = refs.feedbackType.value;
    const content = refs.feedbackText.value.trim();
    if (content.length < 3) return;

    refs.feedbackSubmit.disabled = true;
    refs.feedbackSubmit.textContent = 'Sending...';

    try {
      await supabaseInsert('feedback', { type, content });
      refs.feedbackSubmit.textContent = 'Sent!';
      setTimeout(hide, 1200);
    } catch (err) {
      console.warn('feedback submit failed:', err.message);
      refs.feedbackSubmit.textContent = 'Failed — try again';
      refs.feedbackSubmit.disabled = false;
    }

    /* Reset button text after hide */
    setTimeout(() => { refs.feedbackSubmit.textContent = 'Send'; }, 2000);
  }

  /* Bind events */
  refs.feedbackBtn.addEventListener('click', show);
  refs.feedbackClose.addEventListener('click', hide);
  refs.feedbackModal.addEventListener('click', (e) => {
    if (e.target === refs.feedbackModal) hide();
  });
  refs.feedbackText.addEventListener('input', updateSubmitState);
  refs.feedbackSubmit.addEventListener('click', submit);

  /* Hide button entirely if Supabase not configured */
  if (!isSupabaseConfigured()) {
    refs.feedbackBtn.hidden = true;
  }
}
