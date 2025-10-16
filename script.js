const cards = document.querySelectorAll('.card');
const nextBtn = document.querySelector('.nav.next');
const prevBtn = document.querySelector('.nav.prev');

let current = 1; // middle card is active

function updateCards() {
  cards.forEach((card, i) => {
    card.classList.remove('active', 'prev', 'next');
  });

  const prevIndex = (current - 1 + cards.length) % cards.length;
  const nextIndex = (current + 1) % cards.length;

  cards[current].classList.add('active');
  cards[prevIndex].classList.add('prev');
  cards[nextIndex].classList.add('next');
}

nextBtn.addEventListener('click', () => {
  current = (current + 1) % cards.length;
  updateCards();
});

prevBtn.addEventListener('click', () => {
  current = (current - 1 + cards.length) % cards.length;
  updateCards();
});

updateCards();

AOS.init({
    duration: 1000,      // animation speed in ms
    once: true,          // animate only once
    offset: 120          // start animation a bit before element enters
  });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.literature-category').forEach(initCarouselButtons);
});

function initCarouselButtons(categoryEl) {
  const viewport = categoryEl.querySelector('.carousel-viewport');
  const track = categoryEl.querySelector('.literature-cards');
  const prevBtn = categoryEl.querySelector('.carousel-btn.prev');
  const nextBtn = categoryEl.querySelector('.carousel-btn.next');
  const cards = Array.from(track.querySelectorAll('.lit-card'));
  if (!viewport || !track || cards.length === 0) return;

  const gap = parseFloat(getComputedStyle(track).gap) || 30;

  // wait for images to load so sizes are stable
  const imgs = Array.from(track.querySelectorAll('img'));
  const imgPromises = imgs.length
    ? imgs.map(img => (img.complete ? Promise.resolve() : new Promise(r => img.addEventListener('load', r, { once: true }))))
    : [Promise.resolve()];

  Promise.all(imgPromises).then(() => {
    setup();
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(debounce(setup, 80));
      ro.observe(viewport);
      ro.observe(track);
    } else {
      window.addEventListener('resize', debounce(setup, 120));
    }
    viewport.addEventListener('scroll', debounce(syncIndex, 60));
  }).catch(() => { setup(); });

  let index = 0;
  let visibleCount = 1;
  let maxIndex = Math.max(0, cards.length - visibleCount);

  function setup() {
    // Defensive total width calc — ensures track.scrollWidth > viewport when overflow needed
    // compute totalWidth (cards widths + gaps + right padding)
const totalCardsWidth = cards.reduce((sum, c) => sum + Math.round(c.getBoundingClientRect().width), 0);
const totalGaps = Math.max(0, cards.length - 1) * gap;
const padRight = parseFloat(getComputedStyle(track).paddingRight) || 0;
const totalWidth = totalCardsWidth + totalGaps + padRight + 1;

// Force the track width — use !important so other CSS can't override it
try {
  track.style.setProperty('width', totalWidth + 'px', 'important');
} catch (e) {
  // fallback if setProperty fails — use inline width
  track.style.width = totalWidth + 'px';
}
   
    // compute visible count and max index
    const cardWidth = Math.round(cards[0].getBoundingClientRect().width);
    const cardOuter = cardWidth + gap;
    visibleCount = Math.max(1, Math.floor(viewport.clientWidth / cardOuter));
    maxIndex = Math.max(0, cards.length - visibleCount);

    index = Math.min(index, maxIndex);
    scrollToIndex(index, false);
    updateButtons();
  }

  function scrollToIndex(i, smooth = true) {
    i = Math.max(0, Math.min(i, maxIndex));
    index = i;

    let target = cards[i].offsetLeft;
    const maxScroll = Math.max(0, track.scrollWidth - viewport.clientWidth);
    if (target > maxScroll) target = maxScroll;

    viewport.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' });
    updateButtons();
  }

  function updateButtons() {
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index >= maxIndex;
  }

  function syncIndex() {
    const s = Math.round(viewport.scrollLeft);
    let nearest = 0, nearestDiff = Infinity;
    cards.forEach((c, i) => {
      const diff = Math.abs(c.offsetLeft - s);
      if (diff < nearestDiff) { nearestDiff = diff; nearest = i; }
    });
    nearest = Math.min(nearest, maxIndex);
    if (nearest !== index) { index = nearest; updateButtons(); }
  }

  if (prevBtn) prevBtn.addEventListener('click', () => scrollToIndex(index - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollToIndex(index + 1));

  function debounce(fn, ms = 100) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }
}

const tr = document.querySelector('.literature-cards');
if (tr) { const gap = parseFloat(getComputedStyle(tr).gap)||30; const cards = [...tr.querySelectorAll('.lit-card')]; const total = cards.reduce((s,c)=>s+Math.round(c.getBoundingClientRect().width),0) + (cards.length-1)*gap + (parseFloat(getComputedStyle(tr).paddingRight)||0)+1; tr.style.setProperty('width', total+'px','important'); console.log('forced width', total); }  

document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const submitButton = this.querySelector('button[type="submit"]');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    fetch(this.action, {
      method: this.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: this.querySelector('[name="name"]').value,
        email: this.querySelector('[name="email"]').value,
        subject: this.querySelector('[name="subject"]').value,
        message: this.querySelector('[name="message"]').value
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          successMessage.style.display = 'block';
          this.reset();
        } else {
          errorMessage.textContent = data.message;
          errorMessage.style.display = 'block';
        }
      })
      .catch(() => {
        errorMessage.textContent = 'Network error. Please try again later.';
        errorMessage.style.display = 'block';
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
        setTimeout(() => {
          successMessage.style.display = 'none';
          errorMessage.style.display = 'none';
        }, 5000);
      });
  });