(() => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
    }));
  }

  const catalogFilter = document.querySelector("[data-catalog-filter]");
  if (catalogFilter) {
    const items = [...document.querySelectorAll(".catalog-item")];
    const resultCount = document.querySelector("[data-result-count]");
    const noResults = document.querySelector("[data-no-results]");
    const filterItems = () => {
      const query = catalogFilter.value.trim().toLocaleLowerCase("de");
      let visible = 0;
      items.forEach((item) => {
        const matches = !query || item.dataset.search.toLocaleLowerCase("de").includes(query);
        item.hidden = !matches;
        if (matches) visible += 1;
      });
      if (resultCount) resultCount.textContent = `${visible} ${visible === 1 ? "Reiseidee" : "Reiseideen"}`;
      if (noResults) noResults.hidden = visible !== 0;
    };
    catalogFilter.addEventListener("input", filterItems);
  }
})();
