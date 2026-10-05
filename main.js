/**
 * Chaebin Landing — ENDLESS HORIZON
 * Main JavaScript: Audio player, gallery carousel, scroll effects
 * Created by BB
 */

(function () {
  'use strict';

  // Creator signature (개발자도구 콘솔에 표시)
  console.log(
    '%c ENDLESS HORIZON %c Created by BB ',
    'background:#083744;color:#fff;font-weight:700;padding:4px 8px;border-radius:4px 0 0 4px;',
    'background:#3f9fc4;color:#fff;font-weight:700;padding:4px 8px;border-radius:0 4px 4px 0;'
  );

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
    { type: 'image', src: 'assets/gallery/5.png', alt: '특전 갤러리 05' },
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
     - 재생: jsDelivr CDN(트래픽 분산) 우선, 실패 시 로컬 파일로 자동 전환
     - 로컬 개발 환경(localhost/file)에서는 로컬 파일 우선
     ═══════════════════════════════════════════ */
  const AUDIO_FILE = 'assets/chaebin_voice_msg.mp3';
  const AUDIO_CDN = 'https://cdn.jsdelivr.net/gh/yajinhappy/cheabin@main/' + AUDIO_FILE;
  const isLocalDev = location.protocol === 'file:' ||
    /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const audioSources = isLocalDev ? [AUDIO_FILE, AUDIO_CDN] : [AUDIO_CDN, AUDIO_FILE];
  let audioSourceIdx = 0;

  const voiceAudio = $('#voiceAudio');
  const idleStatusText = audioStatus.textContent;

  let isPlaying = false;
  let waveAnimFrame = null;
  let waveTime = 0;

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return '--:--';
    const s = Math.floor(sec);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function showDuration() {
    audioTime.textContent = formatTime(voiceAudio.duration);
  }

  function setPlayingUI(playing) {
    isPlaying = playing;
    audioCard.classList.toggle('is-playing', playing);
    audioPlayBtn.setAttribute('aria-label', playing ? '일시정지' : '재생');

    if (playing) {
      audioStatus.textContent = '재생 중입니다';
      cancelAnimationFrame(waveAnimFrame);
      animateWave();
    } else {
      audioStatus.textContent = idleStatusText;
      cancelAnimationFrame(waveAnimFrame);
      resetWave();
    }
  }

  function toggleAudio() {
    if (voiceAudio.paused) {
      const p = voiceAudio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => setPlayingUI(false));
      }
    } else {
      voiceAudio.pause();
    }
  }

  // 오디오 이벤트 → UI 동기화
  voiceAudio.addEventListener('play', () => setPlayingUI(true));
  voiceAudio.addEventListener('pause', () => setPlayingUI(false));
  voiceAudio.addEventListener('loadedmetadata', showDuration);
  voiceAudio.addEventListener('timeupdate', () => {
    if (isPlaying) audioTime.textContent = formatTime(voiceAudio.currentTime);
  });
  voiceAudio.addEventListener('ended', () => {
    voiceAudio.currentTime = 0;
    setPlayingUI(false);
    showDuration();
  });

  // CDN 실패 시 다음 소스(로컬 파일)로 자동 전환
  voiceAudio.addEventListener('error', () => {
    if (audioSourceIdx < audioSources.length - 1) {
      const wasPlaying = isPlaying;
      audioSourceIdx++;
      voiceAudio.src = audioSources[audioSourceIdx];
      voiceAudio.load();
      if (wasPlaying) voiceAudio.play().catch(() => setPlayingUI(false));
    } else {
      setPlayingUI(false);
      audioStatus.textContent = '재생할 수 없습니다';
    }
  });

  voiceAudio.src = audioSources[audioSourceIdx];

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
     DOWNLOAD BUTTON — Ripple effect + 강제 다운로드
     파일을 Blob으로 받아 저장 → 서버/브라우저 환경과 무관하게
     재생 화면으로 열리지 않고 바로 로컬에 저장됨
     (내 사이트 파일 우선, 실패 시 CDN, 모두 실패 시 링크 이동)
     ═══════════════════════════════════════════ */
  const DOWNLOAD_NAME = 'chaebin_voice_msg.mp3';
  let isDownloading = false;

  async function fetchAudioBlob() {
    for (const url of [AUDIO_FILE, AUDIO_CDN]) {
      try {
        const res = await fetch(url);
        if (res.ok) return await res.blob();
      } catch (_) { /* 다음 소스 시도 */ }
    }
    throw new Error('download failed');
  }

  function saveBlob(blob, filename) {
    const url = URL.createObjectURL(new Blob([blob], { type: 'audio/mpeg' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  downloadBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    // Add a brief scale feedback
    downloadBtn.style.transform = 'scale(0.96)';
    setTimeout(() => {
      downloadBtn.style.transform = '';
    }, 150);

    if (isDownloading) return;
    if (!window.confirm('채빈님 음성 특전을 다운로드 하시겠습니까?')) return;

    isDownloading = true;
    try {
      saveBlob(await fetchAudioBlob(), DOWNLOAD_NAME);
    } catch (_) {
      // 링크 이동(재생 화면으로 열림) 대신 안내만 표시
      window.alert('다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      isDownloading = false;
    }
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
