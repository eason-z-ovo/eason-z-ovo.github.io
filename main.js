/* Optional interactions; academic content is available without JavaScript. */
(() => {
  const papers = [...document.querySelectorAll('.publication')];
  const filters = [...document.querySelectorAll('[data-publication-filter]')];
  const filterStatus = document.querySelector('#publication-filter-status');

  function closeCitation(paper) {
    const button = paper.querySelector('[data-bib-toggle]');
    const panel = paper.querySelector('.bibtex-panel');
    button.setAttribute('aria-expanded', 'false');
    button.querySelector('.bibtex-indicator').textContent = '+';
    panel.hidden = true;
  }

  function filterPapers(active) {
    const category = active.dataset.publicationFilter;
    let count = 0;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button === active)));
    papers.forEach(paper => {
      const visible = category === 'all' || paper.dataset.categories.split(' ').includes(category);
      paper.hidden = !visible;
      if (visible) count++;
      else closeCitation(paper);
    });
    filterStatus.textContent = category === 'all' ? `Showing all ${count} publications.` : `Showing ${count} ${active.dataset.filterLabel} publications.`;
    document.querySelector('#publications-title').textContent = category === 'selected' ? 'Selected publications' : 'Publications';
  }

  papers.forEach(paper => {
    closeCitation(paper);
    const button = paper.querySelector('[data-bib-toggle]');
    button.hidden = false;
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      button.querySelector('.bibtex-indicator').textContent = expanded ? '+' : '−';
      panel.hidden = expanded;
    });
  });
  filters.forEach(button => button.addEventListener('click', () => filterPapers(button)));
  document.querySelector('.publication-tools').hidden = false;
  filterPapers(filters[0]);

  // Procedural pose sketch. The illustration is not generated research output.
  const canvas = document.querySelector('#motion-canvas');
  const play = document.querySelector('#motion-play');
  const slider = document.querySelector('#motion-time');
  const groups = ['wave', 'walk', 'compose'].map(name => document.querySelector(`#pose-${name}`));
  const svgNS = 'http://www.w3.org/2000/svg';
  let playing = false;
  let frame = 0;
  let phase = 0.25;
  let lastTime = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function element(tag, attributes) {
    const node = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  const skeletons = groups.map(group => {
    group.replaceChildren();
    const head = element('circle', { r: 12.5 });
    const body = element('path', {});
    const arm = element('path', { class: 'reference-limb' });
    const joints = Array.from({ length: 7 }, (_, i) => element('circle', { r: i === 6 ? 3.1 : 2.6, class: i === 6 ? 'joint reference-joint' : 'joint' }));
    group.append(body, arm, head, ...joints);
    return { head, body, arm, joints };
  });

  function path(points) { return points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' '); }
  function draw(value) {
    const angle = value * Math.PI * 2;
    skeletons.forEach((skeleton, index) => {
      const moving = index > 0;
      const waving = index !== 1;
      const stride = moving ? Math.sin(angle) : 0;
      const lift = moving ? 2.5 * Math.cos(angle * 2) : 0;
      const lean = index === 2 ? 3 : moving ? 1.5 : 0;
      const neck = [lean, 36 + lift], hip = [0, 102 + lift];
      const leftShoulder = [lean - 20, 49 + lift], rightShoulder = [lean + 20, 49 + lift];
      const leftElbow = [-29 - stride * 12, 81 + lift];
      const leftWrist = [-26 - stride * 21, 108 + lift];
      const rightElbow = waving ? [43 + lean, 32 + lift] : [29 + stride * 12, 81 + lift];
      const rightWrist = waving ? [43 + lean + Math.sin(angle * 2) * 10, 4 + lift] : [26 + stride * 21, 108 + lift];
      const leftKnee = [-14 - stride * 17, 133 + lift];
      const rightKnee = [14 + stride * 17, 133 + lift];
      const leftFoot = [-20 - stride * 23, 167 - Math.max(0, stride) * 8];
      const rightFoot = [20 + stride * 23, 167 - Math.max(0, -stride) * 8];
      const segments = [[neck, hip], [leftShoulder, rightShoulder], [[-12, hip[1]], [12, hip[1]]], [leftShoulder, leftElbow, leftWrist], [[-12, hip[1]], leftKnee, leftFoot, [leftFoot[0] + 8, leftFoot[1]]], [[12, hip[1]], rightKnee, rightFoot, [rightFoot[0] + 8, rightFoot[1]]]];
      if (!waving) segments.push([rightShoulder, rightElbow, rightWrist]);
      skeleton.body.setAttribute('d', segments.map(path).join(' '));
      skeleton.arm.setAttribute('d', waving ? path([rightShoulder, rightElbow, rightWrist]) : '');
      skeleton.head.setAttribute('cx', lean);
      skeleton.head.setAttribute('cy', 19 + lift);
      [leftShoulder, rightShoulder, hip, leftKnee, rightKnee, leftElbow, rightElbow].forEach((point, i) => {
        skeleton.joints[i].setAttribute('cx', point[0]);
        skeleton.joints[i].setAttribute('cy', point[1]);
        skeleton.joints[i].setAttribute('class', i === 6 && waving ? 'joint reference-joint' : 'joint');
      });
    });
  }

  function stop() {
    playing = false;
    cancelAnimationFrame(frame);
    lastTime = null;
    play.setAttribute('aria-pressed', 'false');
    play.setAttribute('aria-label', 'Play motion illustration');
    document.querySelector('#play-symbol').textContent = '▶';
    document.querySelector('#play-label').textContent = 'Play';
  }

  function tick(time) {
    if (!playing) return;
    if (lastTime !== null) phase = (phase + Math.min(time - lastTime, 60) / 4200) % 1;
    lastTime = time;
    slider.value = (phase * 100).toFixed(1);
    draw(phase);
    frame = requestAnimationFrame(tick);
  }

  play.addEventListener('click', () => {
    if (playing) return stop();
    playing = true;
    play.setAttribute('aria-pressed', 'true');
    play.setAttribute('aria-label', 'Pause motion illustration');
    document.querySelector('#play-symbol').textContent = 'Ⅱ';
    document.querySelector('#play-label').textContent = 'Pause';
    frame = requestAnimationFrame(tick);
  });
  slider.addEventListener('input', () => { stop(); phase = Number(slider.value) / 100; draw(phase); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) stop(); });
  // Starts still for everyone; playback always requires an explicit action.
  document.querySelector('.motion-controls').hidden = false;
  draw(phase);

  if ('IntersectionObserver' in window) {
    const motionObserver = new IntersectionObserver(entries => { if (!entries[0].isIntersecting) stop(); });
    motionObserver.observe(canvas);
  }

  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const navSections = navLinks.map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }));
  let navFrame = 0;
  function updateNavigation() {
    navFrame = 0;
    let active = null;
    const position = window.scrollY + 130;
    navSections.forEach(item => { if (item.section.offsetTop <= position) active = item.link; });
    if (document.querySelector('#contact').offsetTop <= position) active = null;
    navLinks.forEach(link => {
      if (link === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => { if (!navFrame) navFrame = requestAnimationFrame(updateNavigation); }, { passive: true });
  window.addEventListener('resize', updateNavigation);
  updateNavigation();
})();
