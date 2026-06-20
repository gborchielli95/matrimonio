/* ── COUNTDOWN ── */
function updateCountdown() {
  const wedding = new Date('2026-12-10T11:00:00+01:00');
  const now     = new Date();
  const diff    = wedding - now;

  if (diff <= 0) {
    const grid = document.getElementById('countdown-grid');
    if (grid) grid.innerHTML = '<p class="script" style="font-size:3rem;color:var(--gold)">Oggi è il Giorno! 🎊</p>';
    return;
  }

  const pad = n => String(Math.floor(n)).padStart(2, '0');
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = pad(v); };

  set('days',    diff / 864e5);
  set('hours',   (diff % 864e5) / 36e5);
  set('minutes', (diff % 36e5) / 6e4);
  set('seconds', (diff % 6e4) / 1e3);
}

if (document.getElementById('days')) {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* ── MOBILE NAV ── */
function toggleMenu() {
  const links = document.getElementById('navLinks');
  const hbg   = document.getElementById('hamburger');
  if (!links) return;
  links.classList.toggle('open');
  hbg.setAttribute('aria-expanded', links.classList.contains('open'));
}

document.addEventListener('click', e => {
  const links = document.getElementById('navLinks');
  const hbg   = document.getElementById('hamburger');
  if (!links || !hbg) return;
  if (!links.contains(e.target) && !hbg.contains(e.target)) {
    links.classList.remove('open');
  }
});

/* ── SCROLL ANIMATIONS ── */
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ── FAQ ACCORDION ── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item    = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

/* ── RSVP FORM ── */
const rsvpForm = document.getElementById('rsvpForm');

if (rsvpForm) {
  /* mostra/nasconde sezione ospiti */
  document.querySelectorAll('input[name="partecipa"]').forEach(r => {
    r.addEventListener('change', function () {
      const gs = document.getElementById('guests-section');
      if (gs) gs.style.display = this.value === 'si' ? 'block' : 'none';
    });
  });

  rsvpForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const partecipaEl = document.querySelector('input[name="partecipa"]:checked');
    if (!partecipaEl) {
      alert('Per favore indica se partecipi o meno.');
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Invio in corso…';

    /* invia al server Google Apps Script */
    const API_URL   = 'https://script.google.com/macros/s/AKfycbyBaSb-kdWh7cP6DRZNwFVeAlAqdcDG5EifonlaqX4_iHKiNq-WTkV9iINunFUV8pl2Qw/exec';
    const partecipa = partecipaEl.value;
    const url       = new URL(API_URL);
    url.searchParams.set('action',    'add');
    url.searchParams.set('nome',      (document.getElementById('nome')?.value || '').trim());
    url.searchParams.set('cognome',   (document.getElementById('cognome')?.value || '').trim());
    url.searchParams.set('partecipa', partecipa);
    url.searchParams.set('numero',    partecipa === 'si' ? (document.getElementById('numero_ospiti')?.value || 1) : 0);
    url.searchParams.set('note',      (document.getElementById('note')?.value || '').trim());
    fetch(url.toString()).catch(() => {});

    /* piccolo delay per feedback visivo */
    setTimeout(() => {
      const card    = document.getElementById('rsvpCard');
      const success = document.getElementById('successMessage');
      if (card)    card.style.display    = 'none';
      if (success) success.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  });
}
