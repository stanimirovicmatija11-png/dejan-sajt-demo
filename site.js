/* ProTherapy demo: the page's own behaviour the kit does not cover.
   - ?proveri=1 outlines every [data-assumed] item (the demo's unconfirmed facts) for a check before sending.
   - the hero film: muted loop with its pause button; under reduced motion it rests on its poster.
   - the reels: a poster that becomes the film with sound on a click, one playing at a time.
   - a topic card (a[data-reel-target]) plays its reel and scrolls to it. */

const html = document.documentElement;
if (new URLSearchParams(location.search).has('proveri')) html.classList.add('proveri');

const reduced = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------------------------------------------------------------- the hero film */
document.querySelectorAll('[data-hero-film]').forEach(box => {
  const video = box.querySelector('video');
  const btn = box.querySelector('.loop-pause');
  if (!video || !btn) return;
  const set = playing => {
    btn.setAttribute('aria-pressed', playing ? 'false' : 'true');
    btn.setAttribute('aria-label', playing ? 'Pauziraj snimak' : 'Pusti snimak');
  };
  const rest = () => { video.pause(); video.removeAttribute('autoplay'); set(false); };
  if (reduced.matches) rest();
  reduced.addEventListener?.('change', e => { if (e.matches) rest(); });
  video.addEventListener('play', () => set(true));
  video.addEventListener('pause', () => set(false));
  btn.addEventListener('click', () => { if (video.paused) video.play().catch(() => {}); else video.pause(); });
});

/* ---------------------------------------------------------------- the reels */
let current = null;
function playReel(li) {
  if (!li) return null;
  let video = li.querySelector('video');
  if (!video) {
    const btn = li.querySelector('.reel__play');
    if (!btn) return null;
    video = document.createElement('video');
    video.src = btn.dataset.reel;
    video.poster = btn.querySelector('img')?.getAttribute('src') || '';
    video.controls = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.preload = 'auto';
    video.setAttribute('aria-label', btn.getAttribute('aria-label').replace(/^Pusti snimak: /, 'Snimak: '));
    btn.replaceWith(video);
    video.addEventListener('play', () => {
      if (current && current !== video) current.pause();
      current = video;
      const hero = document.querySelector('[data-hero-film] video');
      if (hero && !hero.paused) hero.pause();
    });
  }
  video.play().catch(() => {});
  return video;
}
document.querySelectorAll('.reel__play').forEach(btn => {
  btn.addEventListener('click', () => {
    const v = playReel(btn.closest('.reel'));
    v?.focus({ preventScroll: true });
  });
});
document.querySelectorAll('a[data-reel-target]').forEach(a => {
  a.addEventListener('click', e => {
    const li = document.getElementById(a.dataset.reelTarget);
    if (!li) return;
    e.preventDefault();
    const v = playReel(li);
    li.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' });
    history.replaceState(null, '', '#' + li.id);
    v?.focus({ preventScroll: true });
  });
});
