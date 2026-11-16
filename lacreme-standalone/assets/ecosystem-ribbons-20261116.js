(function () {
  'use strict';
  if (window.AIEmpireRibbons) return;
  const mounted = new WeakMap();
  function mount(root) {
    if (!root) return function () {};
    if (mounted.has(root)) return mounted.get(root);
    const cleanup = [];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    root.querySelectorAll('.aie-rail').forEach(function (rail) {
      const viewport = rail.querySelector('.aie-viewport');
      const track = rail.querySelector('.aie-track');
      const group = rail.querySelector('.aie-group');
      const pause = rail.querySelector('[data-aie-pause]');
      if (!viewport || !track || !group || !pause || !group.children.length) return;
      const events = new AbortController();
      let active = true, manual = false, hover = false, focus = false, interaction = false;
      let frameId = 0, previous = 0, width = 0, position = 0, holdUntil = 0;
      let pointer = null, startX = 0, startScroll = 0, dragged = false;
      const on = (el, name, fn, options) => el.addEventListener(name, fn, Object.assign({signal:events.signal}, options));
      const hideCopy = node => {
        node.setAttribute('aria-hidden', 'true');
        node.removeAttribute('id');
        if (node.matches('a,button,[tabindex]')) node.tabIndex = -1;
        node.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        node.querySelectorAll('a,button,[tabindex]').forEach(el => el.tabIndex = -1);
        return node;
      };
      const label = () => {
        pause.textContent = reduced.matches ? 'Motion off' : manual ? 'Resume' : 'Pause';
        pause.disabled = reduced.matches;
        pause.setAttribute('aria-pressed', String(manual));
        pause.setAttribute('aria-label', (reduced.matches ? 'Reduced motion enabled: ' : manual ? 'Resume ' : 'Pause ') + rail.querySelector('h3').textContent);
      };
      const layout = () => {
        if (!active || !root.isConnected) return;
        track.querySelectorAll('.aie-clone').forEach(el => el.remove());
        group.querySelectorAll('.aie-fill').forEach(el => el.remove());
        if (!reduced.matches) {
          const originals = Array.from(group.children);
          let count = 0;
          while (group.getBoundingClientRect().width < viewport.clientWidth && count < 24) {
            const copy = hideCopy(originals[count++ % originals.length].cloneNode(true));
            copy.classList.add('aie-fill'); group.append(copy);
          }
          const copy = hideCopy(group.cloneNode(true));
          copy.classList.add('aie-clone'); track.append(copy);
        }
        width = group.getBoundingClientRect().width;
        position = width ? viewport.scrollLeft % width : 0;
        viewport.scrollLeft = position;
        label();
      };
      const move = direction => {
        holdUntil = performance.now() + 2200;
        if (!reduced.matches && direction < 0 && viewport.scrollLeft < viewport.clientWidth * .8) viewport.scrollLeft += width;
        viewport.scrollBy({left:direction * Math.min(620, viewport.clientWidth * .8), behavior:reduced.matches ? 'auto' : 'smooth'});
      };
      on(pause, 'click', () => {manual = !manual; label();});
      on(rail, 'mouseenter', () => {hover = true;});
      on(rail, 'mouseleave', () => {hover = false;});
      on(rail, 'focusin', event => {
        focus = true;
        if (group.contains(event.target)) event.target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
      });
      on(rail, 'focusout', () => {queueMicrotask(() => {focus = rail.contains(document.activeElement);});});
      on(rail.querySelector('[data-aie-prev]'), 'click', () => move(-1));
      on(rail.querySelector('[data-aie-next]'), 'click', () => move(1));
      on(viewport, 'keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);}
      });
      on(viewport, 'pointerdown', event => {
        interaction = true; dragged = false;
        if (event.pointerType === 'mouse' && event.button === 0) {pointer = event.pointerId; startX = event.clientX; startScroll = viewport.scrollLeft;}
      });
      on(viewport, 'pointermove', event => {
        if (pointer !== event.pointerId) return;
        const delta = event.clientX - startX;
        if (Math.abs(delta) > 6) {dragged = true; viewport.classList.add('aie-dragging'); viewport.setPointerCapture(pointer);}
        if (dragged) {event.preventDefault(); viewport.scrollLeft = startScroll - delta;}
      });
      const stop = () => {
        interaction = false; holdUntil = performance.now() + 2200;
        if (pointer !== null && viewport.hasPointerCapture(pointer)) viewport.releasePointerCapture(pointer);
        pointer = null; viewport.classList.remove('aie-dragging');
      };
      on(viewport, 'pointerup', stop); on(viewport, 'pointercancel', stop);
      on(viewport, 'pointerleave', () => {if (!dragged) stop();});
      on(viewport, 'wheel', () => {holdUntil = performance.now() + 2200;}, {passive:true});
      on(viewport, 'dragstart', event => event.preventDefault());
      on(viewport, 'click', event => {if (dragged) {event.preventDefault(); event.stopPropagation(); dragged = false;}}, {capture:true});
      const frame = time => {
        if (!active) return;
        const elapsed = previous ? Math.min(time - previous, 80) : 0; previous = time;
        if (!document.hidden && root.isConnected && !reduced.matches && !manual && !hover && !focus && !interaction && time > holdUntil && width) {
          position = (position + elapsed * .024) % width; viewport.scrollLeft = position;
        } else {position = viewport.scrollLeft;}
        frameId = requestAnimationFrame(frame);
      };
      on(document, 'visibilitychange', () => {previous = 0;});
      on(reduced, 'change', layout);
      const resize = new ResizeObserver(layout); resize.observe(viewport);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
      layout(); frameId = requestAnimationFrame(frame);
      cleanup.push(() => {active = false; cancelAnimationFrame(frameId); events.abort(); resize.disconnect(); track.querySelectorAll('.aie-clone').forEach(el => el.remove()); group.querySelectorAll('.aie-fill').forEach(el => el.remove());});
    });
    const destroy = () => {cleanup.forEach(fn => fn()); mounted.delete(root);};
    mounted.set(root, destroy); return destroy;
  }
  window.AIEmpireRibbons = {mount};
  const init = () => document.querySelectorAll('.aie-footer').forEach(mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
