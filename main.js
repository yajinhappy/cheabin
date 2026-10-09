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
     BALANCE GAME DATA
     - pick: 채빈님이 고른 쪽 ('A' | 'B')
     - extra: 추가 답변 (말풍선으로 표시)
     ═══════════════════════════════════════════ */
  const BALANCE_ICONS = {
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
    oops: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
    daily: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2"/><path d="M10 2v2"/><path d="M14 2v2"/>',
    life: '<path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2Z"/><path d="M19 17v4"/><path d="M17 19h4"/>',
  };

  // items: BALANCE_ITEMS의 원래 질문 번호(1부터). 4·12·13·17번은 노출 안 함 → 총 16장
  const BALANCE_CHAPTERS = [
    { id: 'onmic', icon: 'mic', label: 'ON MIC', title: '성우 편', items: [1, 2, 3, 5, 6, 7] },
    { id: 'offmic', icon: 'daily', label: 'OFF MIC', title: '일상 편', items: [8, 9, 10, 11, 14, 15, 16, 18] },
    { id: 'choice', icon: 'life', label: 'CHOICE', title: '인생 편', items: [19, 20] },
  ];

  const BALANCE_ITEMS = [
    { a: '대본 받았는데 내 대사가 전부 어려운 한자어+전문용어 투성이라 발음 꼬이기 일보 직전', b: '대본 받았는데 대사는 몇 줄 없고 지문에 은유적인 표현의 난해한 감정 연기만 가득 적혀있기', pick: 'B' },
    { a: '평소 내 목소리랑 100% 똑같아서 연기하기 편하지만 왠지 내 본모습 다 들키는 것 같은 배역', b: '나와 성격이랑 톤이 180도 완전히 달라서 변조 엄청 들어가고 연기하기 왕왕 힘든데 희열 넘치는 배역', pick: 'B' },
    { a: '인생 최고의 레전드 명연기를 펼쳤는데 마이크 세팅 오류로 녹음 안 되서 처음부터 다시 하기', b: '30번 이상 계속 같은 단어에서 발음 꼬여서 부스 밖 PD님, 다른 연기자들과 어색한 눈빛 교환하기', pick: 'A' },
    { a: '녹음 시간 15분 전인데 만차+복잡한 지하 주차장 안에서 길 잃고 뱅뱅 돌기', b: '고속도로 진출로 놓쳐서 강제로 30km짜리 드라이브 투어 다녀오기', pick: 'B' },
    { a: '한 캐릭터로 10년 이상 연기하기', b: '10가지 캐릭터로 1년마다 연기하기', pick: 'B' },
    {
      a: '내가 연기한 캐릭터로 하루 살기', b: '내가 원하는 캐릭터 하나 만들기', pick: 'A',
      extra: { q: '되고 싶은 캐릭터는?', name: '호크스', text: '자유롭게 날아다니고 싶습니다!', wings: true },
    },
    { a: '10인 레이드 던전에서 나머지 파티원 9명의 모든 기합 소리와 피격 보이스를 혼자서 톤 바꿔가며 원맨쇼로 혼자 더빙하기', b: '판타지 오디오북 전체를 지문 하나없이 오직 극단적으로 혀 짧은 3세 유아 퇴행 톤으로 사람들 앞에서 완독하기', pick: 'A' },
    { a: '지하철에서 실수로 내 흑역사 영상 최대 볼륨으로 10초 동안 재생하기', b: '홍대에서 길 가다 폰 보면서 걷다가 다리 걸려서 넘어지고 혼자 멋쩍게 웃기', pick: 'B' },
    { a: '내 모든 메신저 내용이 10년 동안 공개됨', b: '내 휴대폰/인터넷 검색 기록이 1년동안 공개됨', pick: 'B' },
    { a: '내 흑역사 사진/영상을 갤러리에 소중히 백업해 두고 심심할 때마다 단톡방에 푸는 친구', b: '내 비밀을 눈치채고 혼자 입이 근질근질해서 온 몸으로 티내는 친구', pick: 'A' },
    { a: '아무거나 다 좋아! 해놓고 내가 고르는 것마다 그건 좀 별론데? 하는 친구', b: '만나기 3주 전부터 분 단위로 식당, 카페, 관광지 동선 엑셀로 짜오고 계획한대로 다 움직여야 하는 친구', pick: 'B' },
    { a: '휴대폰 배터리가 10%밖에 안 남았는데 충전기 두고 나오기', b: '충전기는 챙겼는데 정작 충전할 콘센트가 없는 곳에 있기', pick: 'B' },
    { a: '냉장고를 열었는데 먹고 싶은 게 하나도 없어서 한참 고민하기', b: '먹고 싶은 게 있어서 냉장고를 열었는데 그게 이미 누가 먹어서 없어져 있기', pick: 'B' },
    { a: '침대에 폭신하게 누워서 막 잠들려는데 거실에 불 켜져있는 거 발견하기', b: '침대에 완벽하게 자리 잡았는데 거실에 있는 폰 충전 까먹어서 다시 일어나기', pick: 'B' },
    { a: '쇼츠 하나만 보고 자려고 했는데 정신 차리고보니 새벽 3시', b: '일찍 자려고 휴대폰을 내려놨는데 오히려 잠이 안 와서 한참 뒤척이기', pick: 'A' },
    { a: '집 나서자마자 비가 쏟아지는데 우산이 없음', b: '우산을 챙겼는데 집에 도착하자마자 비가 그침', pick: 'B' },
    { a: '집 청소를 시작했는데 갑자기 오래된 물건 발견해서 추억에 잠기기', b: '정리하다가 물건 하나 버릴지 말지 고민하다가 결국 다시 넣기', pick: 'A' },
    { a: '외출하려고 옷까지 다 입었는데 갑자기 나가기 싫어져서 약속을 취소하고 싶어지기', b: '집에서 편하게 쉬고 있었는데 갑자기 약속이 생겨서 귀찮지만 결국 나가기', pick: 'B' },
    { a: '내 외모는 지금보다 30% 좋아지지만 지능은 10% 떨어짐', b: '지능이 30% 좋아지지만 외모가 10% 떨어짐', pick: 'A' },
    { a: '내 인생에서 가장 후회하는 선택을 되돌릴 수 있음 대신 지금 가진 하나를 랜덤으로 잃음', b: '과거는 그대로지만 앞으로의 인생에서 절대 후회할 선택을 하지 않음', pick: 'B' },
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
    const isBalanceTab = activeTab === 'balance';

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

    // 밸런스 탭: 2 → 'OOPS' 챕터, 3 → 'LIFE' 챕터 옆 (PC 전용, 모바일은 CSS로 숨김)
    if (isBalanceTab) {
      const section = $('#balanceSection');
      const ch2 = $('#bgChapter-oops');
      const ch4 = $('#bgChapter-life');
      if (floater2 && section && ch2) floater2.style.top = `${section.offsetTop + ch2.offsetTop - 20}px`;
      if (floater3 && section && ch4) floater3.style.top = `${section.offsetTop + ch4.offsetTop - 40}px`;
      return;
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
     BALANCE GAME — 렌더링 + 등장 연출
     카드 등장(is-in) → 0.42초 뒤 고른 쪽 공개(is-picked)
     ═══════════════════════════════════════════ */
  const PICK_BADGE =
    '<span class="bg-pick" role="img" aria-label="채빈 PICK">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9.5"/><path d="M8 12.5l2.6 2.6L16 9.6"/></svg></span>';

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function renderOption(letter, text, isPick, extra) {
    let comment = '';
    if (isPick && extra) {
      const wings = extra.wings ? ' <span class="bg-wing">🪽</span><span class="bg-wing">🪽</span>' : '';
      comment =
        '<div class="bg-comment">' +
        `<div class="bg-comment__q">💬 ${escapeHTML(extra.q)}</div>` +
        `<span class="bg-comment__name">${escapeHTML(extra.name)}</span>` +
        `<p class="bg-comment__text">${escapeHTML(extra.text)}${wings}</p>` +
        '</div>';
    }
    return (
      `<div class="bg-opt ${isPick ? 'bg-opt--pick' : 'bg-opt--rest'}">` +
      '<div class="bg-opt__head">' +
      `<span class="bg-opt__letter">${letter}</span>` +
      (isPick ? PICK_BADGE : '') +
      '</div>' +
      `<p class="bg-opt__text">${escapeHTML(text)}</p>` +
      comment +
      '</div>'
    );
  }

  /* 챕터 바로가기 — sticky 탭 높이만큼 띄워서 스크롤, 현재 챕터에 체크 표시 */
  const JUMP_CHECK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  function chapterScrollTop(chapter) {
    const tabsH = tabsEl ? tabsEl.offsetHeight : 0;
    return (
      chapter.getBoundingClientRect().top -
      pageScroll.getBoundingClientRect().top +
      pageScroll.scrollTop -
      tabsH -
      8
    );
  }

  function renderBalanceJump() {
    const nav = $('#balanceJump');
    if (!nav) return;
    nav.innerHTML = BALANCE_CHAPTERS.map(
      (ch) =>
        `<button type="button" class="bg-jump__btn" data-chapter="${ch.id}">${JUMP_CHECK}${ch.title}</button>`
    ).join('');
    nav.addEventListener('click', (e) => {
      const btn = e.target.closest('.bg-jump__btn');
      const chapter = btn && document.getElementById(`bgChapter-${btn.dataset.chapter}`);
      if (!chapter) return;
      pageScroll.scrollTo({ top: chapterScrollTop(chapter), behavior: 'smooth' });
    });
  }

  function updateBalanceJump() {
    if (activeTab !== 'balance') return;
    const btns = $$('.bg-jump__btn');
    if (!btns.length) return;
    let current = BALANCE_CHAPTERS[0].id;
    BALANCE_CHAPTERS.forEach((ch) => {
      const el = document.getElementById(`bgChapter-${ch.id}`);
      if (el && chapterScrollTop(el) <= pageScroll.scrollTop + 40) current = ch.id;
    });
    btns.forEach((b) => b.classList.toggle('is-current', b.dataset.chapter === current));
  }

  function renderBalance() {
    const list = $('#balanceList');
    if (!list) return;

    let seq = 0; // 노출 순서대로 01부터 다시 번호 매김
    list.innerHTML = BALANCE_CHAPTERS.map((ch) => {
      const icon = `<svg class="bg-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${BALANCE_ICONS[ch.icon]}</svg>`;
      const first = seq + 1;
      let cards = '';
      ch.items.forEach((qNo) => {
        const item = BALANCE_ITEMS[qNo - 1];
        if (!item) return;
        const no = pad2(++seq);
        cards +=
          `<article class="bg-card" id="bgCard${no}" aria-label="밸런스 게임 ${no}">` +
          '<div class="bg-card__top">' +
          `<span class="bg-card__no">${no}</span>` +
          `<span class="bg-card__tag">${ch.label}</span>` +
          icon +
          '</div>' +
          renderOption('A', item.a, item.pick === 'A', item.extra) +
          '<div class="bg-vs" aria-hidden="true">VS</div>' +
          renderOption('B', item.b, item.pick === 'B', item.extra) +
          '</article>';
      });
      return (
        `<section class="bg-chapter" id="bgChapter-${ch.id}">` +
        '<div class="bg-chapter__head">' +
        `<span class="bg-chapter__label">${ch.label}</span>` +
        `<h3 class="bg-chapter__title">${ch.title}</h3>` +
        '<span class="bg-chapter__line" aria-hidden="true"></span>' +
        `<span class="bg-chapter__range">${pad2(first)}–${pad2(seq)}</span>` +
        '</div>' +
        `<div class="bg-chapter__cards">${cards}</div>` +
        '</section>'
      );
    }).join('');

    renderBalanceJump();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const card = entry.target;
          cardObserver.unobserve(card);
          card.classList.add('is-in');
          setTimeout(() => card.classList.add('is-picked'), reduceMotion ? 0 : 420);
        });
      },
      { root: pageScroll, threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );
    $$('.bg-card').forEach((card) => cardObserver.observe(card));
  }

  /* ═══════════════════════════════════════════
     TABS — 음성 특전 / 밸런스 게임 (#balance 로 바로 진입 가능)
     ═══════════════════════════════════════════ */
  const pageShell = $('.page-shell');
  const tabsEl = $('#pageTabs');
  const tabBtns = Array.from($$('.tabs__btn'));
  const heroEl = $('.hero');
  let activeTab = 'voice';

  // sticky 상태와 무관한 탭의 원래 위치
  function tabsNaturalTop() {
    return heroEl ? heroEl.offsetTop + heroEl.offsetHeight : 0;
  }

  function setTab(name, { scroll = true, focus = false } = {}) {
    if (name === activeTab) return;
    activeTab = name;

    tabBtns.forEach((btn) => {
      const on = btn.dataset.tab === name;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.tabIndex = on ? 0 : -1;
      if (on && focus) btn.focus();

      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      panel.hidden = !on;
      if (on) {
        panel.classList.remove('is-entering');
        void panel.offsetWidth; // restart animation
        panel.classList.add('is-entering');
      }
    });

    tabsEl.dataset.active = name;
    pageShell.dataset.tab = name;

    if (scroll) {
      const top = tabsNaturalTop();
      if (pageScroll.scrollTop > top) pageScroll.scrollTo({ top, behavior: 'auto' });
    }

    history.replaceState(null, '', name === 'balance' ? '#balance' : location.pathname + location.search);

    requestAnimationFrame(() => {
      updateFloaterPositions();
      updateGallery(false);
      onScroll();
    });
  }

  function setupTabs() {
    if (!tabsEl) return;
    tabsEl.dataset.active = activeTab;
    pageShell.dataset.tab = activeTab;

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => setTab(btn.dataset.tab));
      btn.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const idx = tabBtns.indexOf(btn);
        const next = tabBtns[(idx + (e.key === 'ArrowRight' ? 1 : -1) + tabBtns.length) % tabBtns.length];
        setTab(next.dataset.tab, { focus: true });
      });
    });

    $('#panelVoice').addEventListener('animationend', (e) => e.currentTarget.classList.remove('is-entering'));
    $('#panelBalance').addEventListener('animationend', (e) => {
      if (e.target === e.currentTarget) e.currentTarget.classList.remove('is-entering');
    });

    if (location.hash === '#balance') setTab('balance', { scroll: false });
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

      // Sticky tabs — 상단에 붙으면 배경 강화
      if (tabsEl) tabsEl.classList.toggle('is-stuck', scrollY >= tabsNaturalTop() - 1);

      updateBalanceJump();

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
    renderBalance();
    setupTabs();

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
