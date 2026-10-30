(() => {
  const search = document.querySelector("[data-travel-filter]");
  const destination = document.querySelector("[data-travel-destination]");
  if (!search || !destination) return;
  const cards = [...document.querySelectorAll(".catalogue-card")];
  const count = document.querySelector("[data-travel-count]");
  const empty = document.querySelector("[data-travel-empty]");
  const invalid = document.querySelector("[data-travel-invalid]");
  const english = document.documentElement.lang === "en-US";
  const params = new URLSearchParams(location.search);
  const requested = params.get("ziel") || "";
  const options = [...destination.options].map((option) => option.value);
  if (options.includes(requested)) destination.value = requested;
  invalid.hidden = !requested || options.includes(requested);
  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
  const filter = () => {
    const query = normalize(search.value.trim());
    const country = destination.value;
    let visible = 0;
    cards.forEach((card) => {
      const matchesCountry = !country || card.dataset.countries.split(" ").includes(country);
      const matchesSearch = !query || normalize(card.dataset.search).includes(query);
      card.hidden = !matchesCountry || !matchesSearch;
      if (!card.hidden) visible += 1;
    });
    count.textContent = `${visible} ${english ? (visible === 1 ? "travel idea" : "travel ideas") : (visible === 1 ? "Reiseidee" : "Reiseideen")}`;
    empty.hidden = visible !== 0;
  };
  search.addEventListener("input", filter);
  destination.addEventListener("change", () => {
    invalid.hidden = true;
    const url = new URL(location.href);
    if (destination.value) url.searchParams.set("ziel", destination.value);
    else url.searchParams.delete("ziel");
    history.replaceState(null, "", url);
    filter();
  });
  window.addEventListener("popstate", () => {
    const requested = new URLSearchParams(location.search).get("ziel") || "";
    destination.value = options.includes(requested) ? requested : "";
    invalid.hidden = !requested || options.includes(requested);
    filter();
  });
  filter();
})();
