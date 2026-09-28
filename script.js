const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

// CSS overrides loaded after the base stylesheet.
(() => {
  const stylesheets = [
    ['mobile-overrides.css', 'data-dossim-mobile-overrides'],
    ['mission-mobile-fix.css', 'data-dossim-mission-mobile-fix'],
    ['hero-note.css', 'data-dossim-hero-note'],
    ['steps-polish.css', 'data-dossim-steps-polish'],
  ];

  stylesheets.forEach(([href, marker]) => {
    if (document.querySelector(`link[${marker}]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(marker, 'true');
    document.head.appendChild(link);
  });
})();

function closeMenu() {
  if (!mobileMenu || !menuButton) return;
  mobileMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Ouvrir le menu');
}

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Ouvrir le menu' : 'Fermer le menu');
  mobileMenu.hidden = open;
});

mobileMenu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 980) closeMenu(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -25px' })
  : null;

document.querySelectorAll('.reveal').forEach((el) => {
  if (observer) observer.observe(el);
  else el.classList.add('is-visible');
});

// Demo request form
(() => {
  const modal = document.getElementById('demo-request-modal');
  if (!modal) return;

  const ENDPOINT = 'https://bzehhcrbhwzijbfnuybd.supabase.co/functions/v1/submit-demo-request';
  const openers = document.querySelectorAll('.js-open-booking');
  const closers = modal.querySelectorAll('[data-close-request]');
  const form = document.getElementById('demo-request-form');
  const errorEl = document.getElementById('demo-request-error');
  const formView = modal.querySelector('[data-request-view="form"]');
  const successView = modal.querySelector('[data-request-view="success"]');
  const submitButton = form?.querySelector('button[type="submit"]');
  let lastFocus = null;
  let startedAt = Date.now();

  function resetModal() {
    form?.reset();
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
    }
    if (formView) formView.hidden = false;
    if (successView) successView.hidden = true;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Demander ma démo';
    }
    startedAt = Date.now();
  }

  function openRequest(event) {
    event?.preventDefault();
    lastFocus = document.activeElement;
    resetModal();
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('request-open');
    requestAnimationFrame(() => form?.querySelector('input[name="fullName"]')?.focus());
  }

  function closeRequest() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('request-open');
    lastFocus?.focus?.();
  }

  openers.forEach((opener) => opener.addEventListener('click', openRequest));
  closers.forEach((closer) => closer.addEventListener('click', closeRequest));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeRequest();
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const payload = {
      fullName: String(data.get('fullName') || '').trim(),
      email: String(data.get('email') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      agency: String(data.get('agency') || '').trim(),
      city: String(data.get('city') || '').trim(),
      website: String(data.get('website') || '').trim(),
      startedAt,
    };

    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
    }
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Envoi en cours…';
    }

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'request_failed');

      if (formView) formView.hidden = true;
      if (successView) successView.hidden = false;
      modal.querySelector('.request-dialog')?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent = "Impossible d'envoyer la demande pour le moment. Réessayez dans quelques instants.";
      }
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Demander ma démo';
      }
    }
  });
})();

// Landing copy tweaks
(() => {
  const pricingCopy = document.querySelector('.impact-strip .impact-item:first-child .impact-copy p');
  if (pricingCopy) {
    pricingCopy.textContent = 'Le locataire paie uniquement s’il veut faire vérifier son dossier.';
  }

  const heroNote = document.querySelector('.scribble-note');
  if (heroNote) {
    heroNote.innerHTML = '<span class="marc-kicker">Marc · agent IA</span><span class="marc-main">Il vérifie et note chaque dossier.</span><span class="marc-arrow">↘</span>';
  }
})();
