(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.empire-rail').forEach(rail => {
    const buttons = [...document.querySelectorAll(`[data-rail="${rail.id}"]`)];
    const update = () => buttons.forEach(button => {button.disabled = Number(button.dataset.direction) < 0 ? rail.scrollLeft <= 1 : rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2;});
    const move = direction => rail.scrollBy({left: direction * rail.clientWidth * .8, behavior: reduced.matches ? 'auto' : 'smooth'});
    buttons.forEach(button => button.addEventListener('click', () => move(Number(button.dataset.direction))));
    rail.addEventListener('keydown', event => {if(event.key === 'ArrowLeft' || event.key === 'ArrowRight'){event.preventDefault();move(event.key === 'ArrowLeft' ? -1 : 1);}});
    rail.addEventListener('scroll', update, {passive:true});
    new ResizeObserver(update).observe(rail);
    let active = false, start = 0, initial = 0, moved = false;
    rail.addEventListener('pointerdown', event => {if(event.pointerType !== 'mouse' || event.button !== 0)return;active=true;moved=false;start=event.clientX;initial=rail.scrollLeft;});
    rail.addEventListener('pointermove', event => {if(!active)return;const delta=event.clientX-start;if(Math.abs(delta)>6){moved=true;rail.classList.add('is-dragging');rail.setPointerCapture(event.pointerId);}if(moved){event.preventDefault();rail.scrollLeft=initial-delta;}});
    const stop=event=>{active=false;rail.classList.remove('is-dragging');if(rail.hasPointerCapture(event.pointerId))rail.releasePointerCapture(event.pointerId);};
    rail.addEventListener('pointerup',stop);rail.addEventListener('pointercancel',stop);
    rail.addEventListener('pointerleave',event=>{if(!moved)stop(event);});
    rail.addEventListener('dragstart',event=>event.preventDefault());
    rail.addEventListener('click',event=>{if(moved){event.preventDefault();event.stopPropagation();moved=false;}},true);
    update();
  });
})();
