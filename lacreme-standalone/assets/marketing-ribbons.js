(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.emp-rail').forEach(rail => {
    const viewport = rail.querySelector('.emp-viewport');
    const track = rail.querySelector('.emp-track');
    const original = track?.querySelector('.emp-group');
    const pause = rail.querySelector('[data-pause]');
    if (!viewport || !original || !pause) return;
    let width = 0, hovered = false, focused = false, interacting = false;
    let manual = false, time = 0, dragged = false, pointer = null, x = 0, start = 0, holdUntil = 0;
    let lastReduced = reduced.matches;
    const hideCopy = node => {
      node.setAttribute('aria-hidden', 'true');
      node.querySelectorAll('a,button,[tabindex]').forEach(el => el.tabIndex = -1);
      return node;
    };
    const layout = () => {
      const oldPosition = viewport.scrollLeft;
      track.querySelectorAll('.emp-clone').forEach(el => el.remove());
      original.querySelectorAll('.emp-fill').forEach(el => el.remove());
      if (!reduced.matches) {
        const seeds = [...original.children];
        let count = 0;
        while (original.getBoundingClientRect().width < viewport.clientWidth && count < 20) {
          const copy = hideCopy(seeds[count++ % seeds.length].cloneNode(true));
          copy.classList.add('emp-fill');
          // The root itself may be the card link.
          if (copy.matches('a,button,[tabindex]')) copy.tabIndex = -1;
          original.append(copy);
        }
        const copy = hideCopy(original.cloneNode(true));
        copy.classList.add('emp-clone');
        track.append(copy);
      }
      width = original.getBoundingClientRect().width;
      viewport.scrollLeft = width ? oldPosition % width : 0;
      viewport.dataset.position = String(viewport.scrollLeft);
      update();
    };
    const update = () => {
      pause.disabled = reduced.matches;
      pause.textContent = reduced.matches ? 'Motion off' : manual ? 'Resume' : 'Pause';
      pause.setAttribute('aria-pressed', String(manual));
      const title = rail.querySelector('h2')?.textContent || 'announcement';
      pause.setAttribute('aria-label', `${reduced.matches ? 'Reduced motion enabled for' : manual ? 'Resume' : 'Pause'} ${title} crawl`);
    };
    pause.addEventListener('click', () => { manual = !manual; update(); });
    rail.addEventListener('mouseenter', () => hovered = true);
    rail.addEventListener('mouseleave', () => hovered = false);
    rail.addEventListener('focusin', event => {
      focused = true;
      if (original.contains(event.target)) event.target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    });
    rail.addEventListener('focusout', () => setTimeout(() => focused = rail.contains(document.activeElement), 0));
    const move = direction => {
      holdUntil = performance.now() + 1800;
      if (!reduced.matches && direction < 0 && viewport.scrollLeft < viewport.clientWidth * .75) viewport.scrollLeft += width;
      viewport.scrollBy({left: direction * Math.min(600, viewport.clientWidth * .8),behavior:reduced.matches ? 'instant' : 'smooth'});
    };
    rail.querySelector('[data-prev]')?.addEventListener('click', () => move(-1));
    rail.querySelector('[data-next]')?.addEventListener('click', () => move(1));
    viewport.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
    });
    viewport.addEventListener('pointerdown', event => {
      interacting = true; dragged = false;
      if (event.pointerType === 'mouse' && event.button === 0) { pointer = event.pointerId; x = event.clientX; start = viewport.scrollLeft; }
    });
    viewport.addEventListener('pointermove', event => {
      if (pointer !== event.pointerId) return;
      const delta = event.clientX - x;
      if (Math.abs(delta) > 6) { dragged = true; viewport.classList.add('emp-dragging'); viewport.setPointerCapture(pointer); }
      if (dragged) { event.preventDefault(); viewport.scrollLeft = start - delta; }
    });
    const stop = event => {
      interacting = false;
      holdUntil = performance.now() + 1800;
      if (pointer !== null && viewport.hasPointerCapture(pointer)) viewport.releasePointerCapture(pointer);
      pointer = null; viewport.classList.remove('emp-dragging');
    };
    viewport.addEventListener('pointerup', stop);
    viewport.addEventListener('pointercancel', stop);
    viewport.addEventListener('pointerleave', event => { if (!dragged) stop(event); });
    viewport.addEventListener('wheel', () => holdUntil = performance.now() + 1800, {passive:true});
    viewport.addEventListener('dragstart', event => event.preventDefault());
    viewport.addEventListener('click', event => { if (dragged) {event.preventDefault();event.stopPropagation();dragged = false;} }, true);
    document.addEventListener('visibilitychange', () => time = 0);
    const frame = timestamp => {
      if (lastReduced !== reduced.matches) { lastReduced = reduced.matches; layout(); }
      const elapsed = time ? Math.min(timestamp - time, 80) : 0; time = timestamp;
      if (!document.hidden && !manual && !hovered && !focused && !interacting && timestamp > holdUntil && !reduced.matches && width) {
        // Keep a fractional position: scrollLeft itself is rounded by some browsers.
        const position = Number(viewport.dataset.position || viewport.scrollLeft);
        const next = (position + elapsed * .024) % width;
        viewport.scrollLeft = next;
        viewport.dataset.position = String(next);
      } else viewport.dataset.position = String(viewport.scrollLeft);
      requestAnimationFrame(frame);
    };
    viewport.addEventListener('scroll', () => { if (hovered || focused || interacting || manual) viewport.dataset.position = String(viewport.scrollLeft); }, {passive:true});
    new ResizeObserver(layout).observe(viewport);
    reduced.addEventListener('change', layout);
    document.fonts.ready.then(layout);
    layout(); requestAnimationFrame(frame);
  });
})();
