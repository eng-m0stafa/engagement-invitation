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
/*const music = $('#bgMusic');
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
}*/
const musicAuto = document.getElementById('bgMusic');

if (musicAuto) {
  // Attempt autoplay immediately; if blocked, retry on first user interaction.
  musicAuto.volume = 0.5;
  let started = false;

  const tryStart = async () => {
    if (started) return;
    started = true;
    try {
      await musicAuto.play();
    } catch (err) {
      console.log('Autoplay blocked:', err);
    }
  };

  // Try right away
  tryStart();

  // Fallback for browsers that require user interaction
  window.addEventListener('scroll', tryStart, { passive: true, once: true });
  window.addEventListener('pointerdown', tryStart, { once: true });
  window.addEventListener('keydown', tryStart, { once: true });
}

// RSVP (simple interaction only)
const guestNameInput = $('#guestName');
const rsvpForm = $('#rsvpForm');
const messageEl = $('#rsvpMessage');

rsvpForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = (guestNameInput?.value || '').trim();
  if (!name) return;

  // Do not store or display names.
  guestNameInput.value = '';

  // Smooth confirmation message.
  messageEl.textContent = 'We are waiting for you 🤍';
  messageEl.classList.remove('msg-pop');
  // Force reflow to restart animation reliably
  void messageEl.offsetWidth;
  messageEl.classList.add('msg-pop');
  
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

