const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Reveal on scroll
const revealEls = $$('[data-reveal]');
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// Smooth scroll navigation
$$('[data-scroll]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.getAttribute('data-scroll'));
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Parallax background on hero (subtle cinematic movement)
const bgImage = $('.bg-image');
if (bgImage) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;

        const hero = document.querySelector('.hero');
        const rect = hero?.getBoundingClientRect();
        if (!rect) return;

        const progress = Math.min(
          1,
          Math.max(
            0,
            (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
          )
        );

        const y = (progress - 0.5) * 26;
        const s = 1.03 + progress * 0.02;
        bgImage.style.transform = `translate3d(0, ${y}px, 0) scale(${s})`;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}


// Music toggle
const music = $('#bgMusic');
const musicToggle = $('#musicToggle');
if (music && musicToggle) {
  const setLabel = (enabled) => {
    const t = musicToggle.querySelector('.music-text');
    if (t) t.textContent = enabled ? 'Music On' : 'Enable Music';
  };

  setLabel(false);

  musicToggle.addEventListener('click', async () => {
    try {
      if (music.muted) {
        music.muted = false;
        await music.play();
        setLabel(true);
        musicToggle.setAttribute('aria-pressed', 'true');
      } else {
        music.muted = true;
        music.pause();
        setLabel(false);
        musicToggle.setAttribute('aria-pressed', 'false');
      }
    } catch {
      // Some browsers require interaction: we already have it here.
      setLabel(false);
    }
  });
}

// RSVP persistence
const STORAGE_KEY = 'engagement_rsvp_guests_v1';
const guestNameInput = $('#guestName');
const rsvpForm = $('#rsvpForm');
const messageEl = $('#rsvpMessage');
const guestListEl = $('#guestList');
const clearGuestsBtn = $('#clearGuests');

const loadGuests = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const saveGuests = (guests) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
};

let guests = loadGuests();

const renderGuests = () => {
  guestListEl.innerHTML = '';
  if (guests.length === 0) {
    const li = document.createElement('li');
    li.className = 'message';
    li.textContent = 'No confirmations yet.';
    guestListEl.appendChild(li);
    return;
  }

  guests
    .slice()
    .sort((a,b) => b.time - a.time)
    .forEach((g, idx) => {
      const li = document.createElement('li');
      li.className = 'guest-item';

      const name = document.createElement('span');
      name.textContent = g.name;

      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = `#${idx+1}`;

      li.appendChild(name);
      li.appendChild(badge);
      guestListEl.appendChild(li);
    });
};

renderGuests();

rsvpForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = (guestNameInput?.value || '').trim();
  if (!name) return;

  // Basic normalization (avoid duplicates by exact name)
  const exists = guests.some(g => g.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    messageEl.textContent = 'You already confirmed with this name.';
    guestNameInput.value = '';
    return;
  }

  guests.push({ name, time: Date.now() });
  saveGuests(guests);
  renderGuests();

  messageEl.textContent = 'Thank you for confirming your attendance!';
  guestNameInput.value = '';
});

clearGuestsBtn?.addEventListener('click', () => {
  guests = [];
  saveGuests(guests);
  renderGuests();
  messageEl.textContent = '';
});

// Countdown timer
const EVENT_DATE = new Date('2026-07-17T20:00:00');

const pad2 = (n) => String(n).padStart(2,'0');

const elDays = $('#cdDays');
const elHours = $('#cdHours');
const elMins = $('#cdMins');
const elSecs = $('#cdSecs');

const updateCountdown = () => {
  const now = new Date();
  let diff = EVENT_DATE.getTime() - now.getTime();

  if (diff <= 0) {
    elDays.textContent = '00';
    elHours.textContent = '00';
    elMins.textContent = '00';
    elSecs.textContent = '00';
    return;
  }

  const secs = Math.floor(diff / 1000);
  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const remainSecs = secs % 60;

  elDays.textContent = pad2(days);
  elHours.textContent = pad2(hours);
  elMins.textContent = pad2(mins);
  elSecs.textContent = pad2(remainSecs);
};

updateCountdown();
setInterval(updateCountdown, 1000);

