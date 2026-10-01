/**
 * Chaebin Landing — ENDLESS HORIZON
 * Main JavaScript: Audio player, gallery carousel, scroll effects
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     DOM REFERENCES
     ═══════════════════════════════════════════ */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const pageScroll = $('#pageScroll');
  const audioCard = $('#audioCard');
  const audioPlayBtn = $('#audioPlayBtn');
  const audioStatus = $('#audioStatus');
  const audioTime = $('#audioTime');
  const waveformEl = $('#waveform');
  const downloadBtn = $('#downloadBtn');

  const galleryTrack = $('#galleryTrack');
  const galleryCounter = $('#galleryCounter');
  const galleryProgress = $('#galleryProgress');
  const galleryPrev = $('#galleryPrev');
  const galleryNext = $('#galleryNext');

  const scrollTopBtn = $('#scrollTopBtn');
  const sideFloaters = $('#sideFloaters');
  const floater1 = $('#floater1');
  const floater2 = $('#floater2');
  const floater3 = $('#floater3');
  const floaters = [floater1, floater2, floater3].filter(Boolean);

  /* ═══════════════════════════════════════════
     GALLERY DATA
     ═══════════════════════════════════════════ */
  const galleryItems = [
    { type: 'image', src: 'assets/gallery/1.png', alt: '특전 갤러리 01' },
    { type: 'image', src: 'assets/gallery/2.png', alt: '특전 갤러리 02' },
    { type: 'image', src: 'assets/gallery/3.png', alt: '특전 갤러리 03' },
    { type: 'image', src: 'assets/gallery/4.png', alt: '특전 갤러리 04' },
  ];

  /* ═══════════════════════════════════════════
     WAVEFORM SETUP
     ═══════════════════════════════════════════ */
  const BAR_COUNT = 28;
  const bars = [];

  function initWaveform() {
    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = document.createElement('div');
      bar.className = 'waveform__bar';
      const baseH = 4 + Math.abs(Math.sin(i * 0.9)) * 24;
      bar.style.height = (baseH * 0.5) + 'px';
      bar.dataset.base = baseH;
      bar.dataset.index = i;
      waveformEl.appendChild(bar);
      bars.push(bar);
    }
  }

  /* ═══════════════════════════════════════════
     AUDIO PLAYER STATE
     ═══════════════════════════════════════════ */
  let isPlaying = false;
  let waveAnimFrame = null;
  let waveTime = 0;

  function toggleAudio() {
    isPlaying = !isPlaying;
    audioCard.classList.toggle('is-playing', isPlaying);

    if (isPlaying) {
      audioStatus.textContent = '재생 중입니다';
      audioTime.textContent = '00:32';
      animateWave();
    } else {
      audioStatus.textContent = '지금 들어보세요';
      audioTime.textContent = '01:24';
      cancelAnimationFrame(waveAnimFrame);
      resetWave();
    }
  }

  function animateWave() {
    waveTime += 0.03; // 기존(0.06) 대비 0.5배 속도로 감속
    bars.forEach((bar, i) => {
      const base = parseFloat(bar.dataset.base);
      const h = 4 + Math.abs(Math.sin(i * 0.7 + waveTime * 3.5)) * 26;
      bar.style.height = h + 'px';
      bar.classList.toggle('active', h > 18);
    });
    waveAnimFrame = requestAnimationFrame(animateWave);
  }

  function resetWave() {
    bars.forEach((bar) => {
      const base = parseFloat(bar.dataset.base);
      bar.style.height = (base * 0.5) + 'px';
      bar.classList.remove('active');
    });
  }

  audioPlayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAudio();
  });

  audioCard.addEventListener('click', () => {
    toggleAudio();
  });

  /* ═══════════════════════════════════════════
     DOWNLOAD BUTTON — Ripple effect
     ═══════════════════════════════════════════ */
  downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Add a brief scale feedback
    downloadBtn.style.transform = 'scale(0.96)';
    setTimeout(() => {
      downloadBtn.style.transform = '';
    }, 150);
  });

  /* ═══════════════════════════════════════════
     GALLERY CAROUSEL (Infinite Seamless Loop)
     ═══════════════════════════════════════════ */
  const totalSlides = galleryItems.length;
  // Start at middle set (index = totalSlides)
  let currentSlide = totalSlides;
  let snapTimer = null;

  function buildGallery() {
    galleryTrack.innerHTML = '';
    // 3 sets of slides for seamless wrap in both directions
    for (let set = 0; set < 3; set++) {
      galleryItems.forEach((item, i) => {
        const globalIdx = set * totalSlides + i;
        const slide = document.createElement('div');
        slide.className = 'gallery__slide' + (globalIdx === currentSlide ? ' is-active' : '');
        slide.dataset.index = i;
        slide.dataset.globalIndex = globalIdx;

        if (item.type === 'image') {
          const img = document.createElement('img');
          img.src = item.src;
          img.alt = item.alt;
          img.loading = 'eager';
          img.addEventListener('load', () => {
            updateGallery(false);
          });
          slide.appendChild(img);
        } else {
          const ph = document.createElement('div');
          ph.className = 'gallery__slide--placeholder';
          const label = document.createElement('span');
          label.style.cssText = `
            position: absolute; bottom: 12px; left: 12px;
            font-family: var(--font-mono); font-size: 10px;
            color: rgba(0,0,0,0.4); letter-spacing: 0.04em;
          `;
          label.textContent = item.label;
          slide.style.position = 'relative';
          slide.appendChild(ph);
          slide.appendChild(label);
        }

        slide.addEventListener('click', () => {
          currentSlide = globalIdx;
          updateGallery(true);
          clearTimeout(snapTimer);
          snapTimer = setTimeout(snapIfNeeded, 560);
          pauseGalleryAuto();
        });

        galleryTrack.appendChild(slide);
      });
    }
  }

  function snapIfNeeded() {
    clearTimeout(snapTimer);
    const n = totalSlides;
    if (currentSlide >= 2 * n || currentSlide < n) {
      currentSlide = ((currentSlide % n) + n) % n + n;
      updateGallery(false);
    }
  }

  function updateGallery(animate = true) {
    const slides = $$('.gallery__slide');
    if (!slides.length) return;

    if (!animate) {
      galleryTrack.style.transition = 'none';
    } else {
      galleryTrack.style.transition = 'transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)';
    }

    const targetSlide = slides[currentSlide];
    const offset = targetSlide ? targetSlide.offsetLeft - slides[0].offsetLeft : 0;
    galleryTrack.style.transform = `translateX(-${offset}px)`;

    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === currentSlide);
    });

    const displayIndex = ((currentSlide % totalSlides) + totalSlides) % totalSlides;
    galleryCounter.textContent =
      String(displayIndex + 1).padStart(2, '0') + '/' +
      String(totalSlides).padStart(2, '0');

    galleryProgress.style.width = ((displayIndex + 1) / totalSlides * 100) + '%';
  }

  function stepSlide(dir) {
    clearTimeout(snapTimer);
    const n = totalSlides;

    if (currentSlide >= 2 * n || currentSlide < n) {
      currentSlide = ((currentSlide % n) + n) % n + n;
      updateGallery(false);
      galleryTrack.offsetHeight; // force reflow
    }

    currentSlide += dir;
    updateGallery(true);

    snapTimer = setTimeout(() => {
      snapIfNeeded();
    }, 560);
  }

  function nextSlide() {
    stepSlide(1);
  }

  function prevSlide() {
    stepSlide(-1);
  }

  galleryPrev.addEventListener('click', prevSlide);
  galleryNext.addEventListener('click', nextSlide);

  // Touch / swipe support
  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;

  const galleryViewport = $('#galleryViewport');

  galleryViewport.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = false;
  }, { passive: true });

  galleryViewport.addEventListener('touchmove', (e) => {
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      isSwiping = true;
    }
  }, { passive: true });

  galleryViewport.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }
  });

  // Auto-play gallery
  let galleryAutoTimer = setInterval(nextSlide, 4500);

  // Pause auto-play on interaction
  function pauseGalleryAuto() {
    clearInterval(galleryAutoTimer);
    galleryAutoTimer = setInterval(nextSlide, 6000);
  }

  galleryPrev.addEventListener('click', pauseGalleryAuto);
  galleryNext.addEventListener('click', pauseGalleryAuto);

  /* ═══════════════════════════════════════════
     FLOATER ANCHORING & POSITIONS
     1: 키비주얼쪽 보다 조금 아래
     2: 음성특전 아래쪽
     3: 갤러리 중간-하단쪽
     ═══════════════════════════════════════════ */
  function updateFloaterPositions() {
    const kv = $('#kvSection');
    const audioCard = $('#audioCard');
    const downloadBtn = $('#downloadBtn');
    const gallery = $('#gallerySection');
    const controls = $('.gallery__controls');

    // 1: 키비주얼 메인 타이틀(ENDLESS HORIZON) 하단 밑줄 라인 (빨간 화살표 위치)
    if (floater1) {
      const kvTitle2 = $('#kvTitle2');
      const kvTitle1 = $('#kvTitle1');
      if (kv && kvTitle2 && kvTitle2.offsetHeight > 20) {
        const top1 = kv.offsetTop + kvTitle2.offsetTop + kvTitle2.offsetHeight - 110;
        floater1.style.top = `${top1}px`;
      } else if (kv && kvTitle1 && kvTitle1.offsetHeight > 20) {
        const top1 = kv.offsetTop + kvTitle1.offsetTop + kvTitle1.offsetHeight - 5;
        floater1.style.top = `${top1}px`;
      } else {
        floater1.style.top = '115px';
      }
    }

    // 2: 음성특전 아래쪽 (다운로드 버튼 바로 아래)
    if (floater2) {
      const anchor2 = downloadBtn || audioCard;
      if (anchor2) {
        const top2 = anchor2.offsetTop + anchor2.offsetHeight + 10;
        floater2.style.top = `${top2}px`;
      }
    }

    // 3: 갤러리 중간-하단쪽 (컨트롤 버튼 위로 20px 추가 상향)
    if (floater3 && gallery) {
      if (controls) {
        const top3 = gallery.offsetTop + controls.offsetTop - 55;
        floater3.style.top = `${top3}px`;
      } else {
        const top3 = gallery.offsetTop + gallery.offsetHeight * 0.62 - 20;
        floater3.style.top = `${top3}px`;
      }
    }
  }

  /* ═══════════════════════════════════════════
     SCROLL EFFECTS
     ═══════════════════════════════════════════ */
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = pageScroll.scrollTop;
      const vh = pageScroll.clientHeight;

      // Scroll-to-top button
      const showTop = scrollY > 120;
      scrollTopBtn.classList.toggle('is-visible', showTop);

      // Translate the floater container synchronously with page scroll
      if (sideFloaters) {
        sideFloaters.style.transform = `translate3d(0, ${-scrollY}px, 0)`;
      }

      // Individual Floater Reveal on Scroll (순수 수평으로만 슥- 등장)
      // 1. 첫번째 이미지: 키비주얼 바로 밑 (빨간 화살표)
      if (floater1) {
        const top1 = floater1.offsetTop || 125;
        const show1 = scrollY < top1 + 350;
        floater1.classList.toggle('is-visible', show1);
      }

      // 2. 두번째 이미지: 음성특전 아래쪽 (옆으로만 슥- 등장)
      if (floater2) {
        const top2 = floater2.offsetTop || 540;
        const show2 = (scrollY + vh > top2 + 40) && (scrollY < top2 + 450);
        floater2.classList.toggle('is-visible', show2);
      }

      // 3. 세번째 이미지: 갤러리 중간-하단쪽 (옆으로만 슥- 등장)
      if (floater3) {
        const top3 = floater3.offsetTop || 1010;
        const show3 = (scrollY + vh > top3 + 40);
        floater3.classList.toggle('is-visible', show3);
      }

      // Parallax on poster
      const poster = $('.hero__poster');
      if (poster) {
        const parallax = scrollY * 0.15;
        poster.style.transform = `scale(1.05) translateY(${parallax}px)`;
      }

      ticking = false;
    });
  }

  pageScroll.addEventListener('scroll', onScroll, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    pageScroll.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ═══════════════════════════════════════════
     INTERSECTION OBSERVER — Scroll animations
     ═══════════════════════════════════════════ */
  function setupScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: pageScroll, threshold: 0.15 }
    );

    // Observe gallery section
    const gallery = $('#gallerySection');
    if (gallery) {
      gallery.style.opacity = '0';
      gallery.style.transform = 'translateY(30px)';
      gallery.style.transition = 'opacity 0.8s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1)';
      observer.observe(gallery);
    }
  }

  // Handle reveal class
  document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `.is-revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);
  });

  /* ═══════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════ */
  function init() {
    initWaveform();
    buildGallery();
    updateGallery(false);
    setupScrollAnimations();

    function onLayoutChange() {
      updateFloaterPositions();
      updateGallery(false);
    }
    window.addEventListener('resize', onLayoutChange);
    window.addEventListener('orientationchange', onLayoutChange);
    window.addEventListener('load', onLayoutChange);

    // Initial check: 키비주얼 등장 후 첫번째 이미지 부드럽게 슥- 등장
    setTimeout(() => {
      updateFloaterPositions();
      if (floater1 && pageScroll.scrollTop < 300) {
        floater1.classList.add('is-visible');
      }
    }, 450);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
