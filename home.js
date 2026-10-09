// 포크폴리오 홈: 스크롤에 맞춰 장면을 바꾼다 (외부 부품 없이)

// 스토어 주소: 출시되면 여기만 채우면 된다 (비어 있으면 "곧 출시")
const STORES = {
  ios: '',      // 예: 'https://apps.apple.com/kr/app/id0000000000'
  android: '',  // 예: 'https://play.google.com/store/apps/details?id=com.geonhoroh.forkfolio'
};

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── 스토어 버튼 ──
const LABELS = { ios: ['App Store', '아이폰'], android: ['Google Play', '안드로이드'] };
document.querySelectorAll('[data-stores]').forEach((box) => {
  for (const key of ['ios', 'android']) {
    const url = STORES[key];
    const el = document.createElement(url ? 'a' : 'span');
    el.className = 'store' + (url ? '' : ' soon');
    if (url) { el.href = url; el.target = '_blank'; el.rel = 'noopener'; }
    el.innerHTML = `<small>${LABELS[key][1]} · ${url ? '무료' : '곧 출시'}</small><b>${LABELS[key][0]}</b>`;
    box.appendChild(el);
  }
});

// ── 첫 화면 요리 사진 벽 (같은 줄을 두 번 이어 붙여 끊김 없이 흐르게) ──
const FOOD = Array.from({ length: 11 }, (_, i) => String(i).padStart(2, '0'));
document.querySelectorAll('.wall-row').forEach((row) => {
  const start = Number(row.dataset.row) * 4;
  const order = FOOD.map((_, i) => FOOD[(i + start) % FOOD.length]);
  const html = order.map((n) => `<picture><source srcset="img/food/${n}.webp" type="image/webp"><img src="img/food/${n}.jpg" alt="" loading="${row.dataset.row === '0' ? 'eager' : 'lazy'}"></picture>`).join('');
  row.innerHTML = html + html;
});

// ── 메뉴: 첫 화면을 지나면 크림색 막대로 ──
const nav = document.getElementById('nav');
const hook = document.querySelector('.hook');

const fillLines = [...document.querySelectorAll('.fill-text span')];

function onScroll() {
  // 첫 화면: 내리는 만큼 글자가 살짝 내려가며 흐려진다 (화면은 멈추지 않는다)
  const hp = Math.min(1, Math.max(0, scrollY / hook.offsetHeight));
  hook.style.setProperty('--p', reduce ? 0 : hp.toFixed(3));
  nav.classList.toggle('solid', hook.getBoundingClientRect().bottom < innerHeight * 0.55);

  // 글자 차오르기: 줄이 화면 아래 85%에서 45%까지 올라오는 동안 채운다
  for (const line of fillLines) {
    const y = line.getBoundingClientRect().top + line.offsetHeight / 2;
    const local = Math.min(1, Math.max(0, (innerHeight * 0.85 - y) / (innerHeight * 0.4)));
    line.style.setProperty('--f', (reduce ? 100 : local * 100).toFixed(1) + '%');
  }
}

let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { onScroll(); ticking = false; });
}, { passive: true });
addEventListener('resize', onScroll);
onScroll();

// ── 나타나기·보일 때만 재생 ──
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.target.classList.contains('reveal') && e.isIntersecting) {
      e.target.classList.add('in');
    }
    if (e.target.matches('video[data-autoplay]')) {
      if (e.isIntersecting) { e.target.preload = 'auto'; e.target.play().catch(() => {}); } else e.target.pause();
    }
  }
}, { threshold: 0.35 });
document.querySelectorAll('.reveal, video[data-autoplay]').forEach((el) => io.observe(el));

// ── 광고 영상 창 (컴퓨터는 가로, 폰은 세로) ──
const modal = document.getElementById('film');
const film = document.getElementById('film-video');
document.querySelector('[data-film]').addEventListener('click', () => {
  const tall = innerHeight > innerWidth;
  film.src = tall ? 'media/film_v.mp4' : 'media/film_h.mp4';
  film.poster = tall ? 'media/send.jpg' : 'media/film_h.jpg';
  film.style.aspectRatio = tall ? '9 / 16' : '16 / 9';
  film.style.width = tall ? 'auto' : '100%';
  film.style.margin = '0 auto';
  modal.hidden = false;
  film.play().catch(() => {});
});
function closeFilm() { film.pause(); modal.hidden = true; }
modal.addEventListener('click', (e) => { if (e.target === modal || e.target.classList.contains('modal-x')) closeFilm(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeFilm(); });
