(() => {
  const track = document.getElementById("ecosystemTrack");
  const previous = document.querySelector(".carouselControl.prev");
  const next = document.querySelector(".carouselControl.next");
  if (!track || !previous || !next) return;

  const step = () => Math.min(620, Math.max(285, track.clientWidth * .82));
  previous.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));

  track.addEventListener("keydown", event => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    track.scrollBy({ left: event.key === "ArrowLeft" ? -step() : step(), behavior: "smooth" });
  });

  fetch("/api/lacreme-affiliates")
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (!data?.links || !data?.monetized) return;
      document.querySelectorAll("[data-affiliate]").forEach(card => {
        const key = card.dataset.affiliate;
        if (!data.monetized[key] || !data.links[key]) return;
        card.href = data.links[key];
        const badge = card.querySelector("[data-affiliate-badge]");
        if (badge) badge.textContent = "Affiliate link";
      });
    })
    .catch(() => {});
})();
