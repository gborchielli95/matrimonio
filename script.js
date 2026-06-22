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
(function () {
  const rsvpForm = document.getElementById('rsvpForm');
  if (!rsvpForm) return;

  const API_URL = 'https://script.google.com/macros/s/AKfycbzZT2zHDxXe6kvJHmpvwZYt2VvGzVKTsh2IxAGRTZl-bci0g2jM4ZrcQF8FVMCSKoMfJA/exec';
  const numInput = document.getElementById('numero_ospiti');

  /* mostra/nasconde sezione ospiti */
  document.querySelectorAll('input[name="partecipa"]').forEach(r => {
    r.addEventListener('change', function () {
      const gs = document.getElementById('guests-section');
      if (gs) gs.style.display = this.value === 'si' ? 'block' : 'none';
      if (this.value !== 'si') renderAdditionalGuests(0);
    });
  });

  /* aggiorna form ospiti aggiuntivi */
  if (numInput) {
    numInput.addEventListener('change', () => renderAdditionalGuests(parseInt(numInput.value || 1) - 1));
    numInput.addEventListener('input',  () => renderAdditionalGuests(parseInt(numInput.value || 1) - 1));
  }

  function renderAdditionalGuests(count) {
    const container = document.getElementById('additional-guests');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const block = document.createElement('div');
      block.className = 'guest-block';
      block.innerHTML = `
        <div class="guest-block-title">Ospite ${i + 2}</div>
        <div class="form-row">
          <div class="form-group">
            <label>Nome *</label>
            <input type="text" name="guest_nome_${i}" placeholder="es. Luca" required>
          </div>
          <div class="form-group">
            <label>Cognome *</label>
            <input type="text" name="guest_cognome_${i}" placeholder="es. Bianchi" required>
          </div>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>Note / Intolleranze</label>
          <textarea name="guest_note_${i}" rows="2" placeholder="es. vegetariano, allergia alle noci…"></textarea>
        </div>`;
      container.appendChild(block);
    }
  }

  function collectPeople() {
    const partecipaEl = document.querySelector('input[name="partecipa"]:checked');
    const partecipa = partecipaEl ? partecipaEl.value : 'no';
    const people = [{
      nome:      (document.getElementById('nome')?.value || '').trim(),
      cognome:   (document.getElementById('cognome')?.value || '').trim(),
      partecipa,
      note:      (document.getElementById('note')?.value || '').trim(),
    }];
    if (partecipa === 'si') {
      const n = parseInt(numInput?.value || 1);
      for (let i = 0; i < n - 1; i++) {
        people.push({
          nome:      (rsvpForm.querySelector(`[name="guest_nome_${i}"]`)?.value || '').trim(),
          cognome:   (rsvpForm.querySelector(`[name="guest_cognome_${i}"]`)?.value || '').trim(),
          partecipa: 'si',
          note:      (rsvpForm.querySelector(`[name="guest_note_${i}"]`)?.value || '').trim(),
        });
      }
    }
    return people;
  }

  async function apiGet(params) {
    const url = new URL(API_URL);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    return res.json();
  }

  async function submitPeople(people, dupSet) {
    await Promise.all(people.map(p =>
      apiGet({
        action:    dupSet.has(`${p.nome}|${p.cognome}`) ? 'update' : 'add',
        nome:      p.nome,
        cognome:   p.cognome,
        partecipa: p.partecipa,
        numero:    1,
        note:      p.note,
      }).catch(() => {})
    ));
  }

  rsvpForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const partecipaEl = document.querySelector('input[name="partecipa"]:checked');
    if (!partecipaEl) { alert('Per favore indica se partecipi o meno.'); return; }

    if (partecipaEl.value === 'si') {
      const n = parseInt(numInput?.value || 1);
      for (let i = 0; i < n - 1; i++) {
        const nome    = (rsvpForm.querySelector(`[name="guest_nome_${i}"]`)?.value || '').trim();
        const cognome = (rsvpForm.querySelector(`[name="guest_cognome_${i}"]`)?.value || '').trim();
        if (!nome || !cognome) {
          alert(`Inserisci nome e cognome per l'Ospite ${i + 2}.`);
          return;
        }
      }
    }

    const people = collectPeople();

    // controlla duplicati interni (stessa persona inserita due volte nel form)
    const seen = new Set();
    const internalDups = [];
    for (const p of people) {
      const key = `${p.nome.toLowerCase()}|${p.cognome.toLowerCase()}`;
      if (seen.has(key)) internalDups.push(`${p.nome} ${p.cognome}`);
      else seen.add(key);
    }
    if (internalDups.length > 0) {
      document.getElementById('validationList').innerHTML = internalDups.map(name => `
        <div class="duplicate-item">
          <span>👤 <strong>${name}</strong></span>
          <span class="duplicate-badge" style="background:#fff3e0;color:#e65100;">Duplicato</span>
        </div>`).join('');
      document.getElementById('validationModal').style.display = 'flex';
      document.getElementById('validationClose').onclick = () => {
        document.getElementById('validationModal').style.display = 'none';
      };
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifica in corso…';

    let duplicates = [];

    try {
      const result = await apiGet({
        action: 'checkDuplicates',
        people: JSON.stringify(people.map(p => ({ nome: p.nome, cognome: p.cognome }))),
      });
      duplicates = result.duplicates || [];
    } catch { /* ignora errori di rete: continua senza controllo */ }

    if (duplicates.length > 0) {
      renderDuplicateModal(duplicates);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Conferma la Presenza 💌';

      const confirmed = await modalChoice();
      if (!confirmed) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Aggiornamento in corso…';
      const dupSet = new Set(duplicates.map(d => `${d.nome}|${d.cognome}`));
      await submitPeople(people, dupSet);
    } else {
      await submitPeople(people, new Set());
    }

    showSuccess();
  });

  function renderDuplicateModal(duplicates) {
    document.getElementById('duplicateList').innerHTML = duplicates.map(d => `
      <div class="duplicate-item">
        <span>👤 <strong>${d.nome} ${d.cognome}</strong></span>
        <span class="duplicate-badge ${d.partecipa === 'si' ? 'badge-si' : 'badge-no'}">
          ${d.partecipa === 'si' ? 'Presente' : 'Assente'}
        </span>
      </div>`).join('');
    document.getElementById('duplicateModal').style.display = 'flex';
  }

  function modalChoice() {
    return new Promise(resolve => {
      document.getElementById('modalConfirm').onclick = () => {
        document.getElementById('duplicateModal').style.display = 'none';
        resolve(true);
      };
      document.getElementById('modalCancel').onclick = () => {
        document.getElementById('duplicateModal').style.display = 'none';
        resolve(false);
      };
    });
  }

  function showSuccess() {
    document.getElementById('duplicateModal').style.display = 'none';
    const card    = document.getElementById('rsvpCard');
    const success = document.getElementById('successMessage');
    if (card)    card.style.display    = 'none';
    if (success) success.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
})();
