(() => {
  'use strict';

  const dialogues = {
    product: ['Что можете рассказать об этой модели?', 'Подскажите название. Я найду описание модели и расскажу, для каких задач она подходит.'],
    spec: ['Где посмотреть рабочий диапазон этой модели?', 'Назовите модель, и я проверю её техническую документацию.'],
    compare: ['Чем отличаются эти две модели?', 'Назовите обе модели. Я сверю параметры по документам. Что важнее для вашей задачи?'],
    need: ['Я пока не знаю, какую модель выбрать.', 'Расскажите, где и как вы планируете её использовать. Проверю, какие модели стоит рассмотреть.'],
    lead: ['Можно обсудить это с менеджером после выставки?', 'Да. Оставьте контакт, и я передам его менеджеру вместе с вашим вопросом.'],
  };

  const dialogue = document.querySelector('[data-dialogues]');
  const choices = [...dialogue.querySelectorAll('[data-dialogue]')];
  choices.forEach(button => button.addEventListener('click', () => {
    const [question, answer] = dialogues[button.dataset.dialogue];
    dialogue.querySelector('[data-question]').textContent = question;
    dialogue.querySelector('[data-answer]').textContent = answer;
    choices.forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
    if (!reducedMotion.matches) dialogue.querySelector('.answer').animate([{ opacity: .45, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], 180);
  }));

  const main = document.querySelector('.presentation');
  const slides = [...main.querySelectorAll('[data-slide]')];
  const dock = document.querySelector('.deck-dock');
  const steps = dock.querySelector('[data-steps]');
  const count = dock.querySelector('[data-count]');
  const prev = dock.querySelector('[data-prev]');
  const next = dock.querySelector('[data-next]');
  const toggle = document.querySelector('[data-view-toggle]');
  const mobileNav = document.querySelector('.mobile-navigation');
  const sectionMenu = mobileNav.querySelector('[data-mobile-section]');
  const smallScreen = matchMedia('(max-width: 760px), (pointer: coarse) and (max-width: 950px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const interactive = 'button,a,input,select,textarea,label,video,form,[contenteditable="true"]';
  const buttons = slides.map(slide => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = slide.dataset.slide;
    button.addEventListener('click', () => navigate(slide.id));
    steps.append(button);
    sectionMenu.add(new Option(slide.dataset.slide, slide.id));
    return button;
  });
  let current = 0;
  let mobile = false;

  function anchorIndex() {
    return Math.max(0, slides.findIndex(slide => `#${slide.id}` === location.hash));
  }

  function useMobile() {
    const view = new URLSearchParams(location.search).get('view');
    return view === 'mobile' || (view !== 'desktop' && smallScreen.matches);
  }

  function applyView(index) {
    mobile = useMobile();
    document.body.classList.toggle('deck-active', !mobile);
    document.body.classList.toggle('mobile-active', mobile);
    dock.hidden = mobile;
    mobileNav.hidden = !mobile;
    toggle.textContent = mobile ? 'Версия для компьютера' : 'Мобильная версия';
    display(index, false);
    if (mobile && index > 0) slides[index].scrollIntoView();
    else window.scrollTo(0, 0);
    main.scrollTop = 0;
  }

  toggle.addEventListener('click', () => {
    const top = mobile ? parseFloat(getComputedStyle(slides[0]).scrollMarginTop) + 1 : 0;
    const index = mobile ? slides.reduce((visible, slide, position) =>
      slide.getBoundingClientRect().top <= top ? position : visible, 0
    ) : current;
    const url = new URL(location.href);
    url.searchParams.set('view', mobile ? 'desktop' : 'mobile');
    url.hash = slides[index].id;
    history.replaceState(null, '', url);
    applyView(index);
  });

  sectionMenu.addEventListener('change', () => {
    navigate(sectionMenu.value);
    sectionMenu.selectedIndex = 0;
  });
  smallScreen.addEventListener('change', () => {
    if (mobile !== useMobile()) applyView(anchorIndex());
  });

  function display(index, focusHeading) {
    current = index;
    slides.forEach((slide, position) => {
      slide.hidden = !mobile && position !== index;
      if (position !== index) slide.querySelector('video')?.pause();
    });
    if (!mobile) updateDock(index);
    if (focusHeading) {
      const heading = slides[index].querySelector('h1,h2');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      if (mobile) slides[index].scrollIntoView();
      else main.scrollTop = 0;
    }
  }

  function updateDock(index) {
    buttons.forEach((button, position) => {
      if (position === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${slides.length}`;

    const active = buttons[index];
    const delta = active.getBoundingClientRect().left - steps.getBoundingClientRect().left;
    if (delta < 0 || delta + active.offsetWidth > steps.clientWidth) {
      steps.scrollTo({ left: steps.scrollLeft + delta - 8, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
  }

  function navigate(id) {
    const index = slides.findIndex(slide => slide.id === id);
    if (index === -1) return;
    if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    display(index, true);
  }

  function shift(delta) {
    const slide = slides[current + delta];
    if (slide) navigate(slide.id);
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const id = link.hash.slice(1);
    if (!slides.some(slide => slide.id === id)) return;
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(id);
    });
  });

  prev.addEventListener('click', () => shift(-1));
  next.addEventListener('click', () => shift(1));
  document.addEventListener('keydown', event => {
    if (mobile || event.altKey || event.metaKey || event.ctrlKey || event.shiftKey || event.target.closest(interactive)) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      shift(event.key === 'ArrowRight' ? 1 : -1);
    }
  });

  let touchStart;
  main.addEventListener('touchstart', event => {
    touchStart = !mobile && event.touches.length === 1 && !event.target.closest(interactive) ? event.touches[0] : null;
  }, { passive: true });
  main.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
  main.addEventListener('touchend', event => {
    if (!touchStart) return;
    const x = event.changedTouches[0].clientX - touchStart.clientX;
    const y = event.changedTouches[0].clientY - touchStart.clientY;
    touchStart = null;
    if (Math.abs(x) > 65 && Math.abs(x) > 1.8 * Math.abs(y)) shift(x < 0 ? 1 : -1);
  }, { passive: true });

  function sync(focusHeading) {
    const index = slides.findIndex(slide => `#${slide.id}` === location.hash);
    if (index >= 0 || !location.hash) display(Math.max(0, index), focusHeading);
  }

  applyView(anchorIndex());
  toggle.hidden = false;
  window.addEventListener('hashchange', () => sync(true));
})();
