(() => {
  const labels = {
    wellness: {
      label: "Wellness & relaxation",
      title: "A few days that are entirely yours.",
      intro: "We look for a relaxing wellness getaway in Europe with a comfortable hotel, spa time, and a trip length that fits your calendar."
    },
    genuss: {
      label: "Food & wine",
      title: "A short trip with great taste.",
      intro: "We combine regional cuisine, wine, spirits, and seasonal festivals into a flavorful getaway, planned around confirmed dates and availability."
    },
    kultur: {
      label: "Cities, history & culture",
      title: "Explore without filling every moment.",
      intro: "We plan a short city break or cultural getaway with a suitable hotel as your home base and plenty of room for breaks."
    },
    natur: {
      label: "Nature & outdoor activities",
      title: "Fresh air and inviting trails, without the rush.",
      intro: "We find a peaceful home base for gentle outings, nature, and beautiful scenery, with comfortable accommodations."
    }
  };
  const params = new URLSearchParams(location.search);
  const selected = [...new Set(params.getAll("thema").filter((theme) => Object.hasOwn(labels, theme)))];
  const sourceNames = {asien: "Asien Special Tours", afrika: "Africa Royal Tours", lateinamerika: "América Special Tours"};
  const primary = selected.length ? labels[selected[0]] : null;
  for (const [selector, value] of [
    ["[data-campaign-title]", primary?.title],
    ["[data-campaign-intro]", primary?.intro],
    ["[data-campaign-source]", primary?.label],
    ["[data-source-brand]", sourceNames[params.get("quelle")] || "our getaway finder"]
  ]) {
    const element = document.querySelector(selector);
    if (element && value) element.textContent = value;
  }
  if (selected.length) {
    document.querySelectorAll("[data-europe-theme]").forEach((card) => {
      const matches = selected.some((theme) => card.dataset.europeTheme.split(/\s+/).includes(theme));
      card.dataset.match = String(matches);
      card.hidden = !matches;
    });
  }
  const formTheme = document.querySelector("#europe-theme");
  if (formTheme) {
    const values = {wellness: "Wellness und Erholung", genuss: "Kulinarik und Wein", kultur: "Stadt und Kultur", natur: "Natur und Bewegung"};
    if (values[selected[0]]) formTheme.value = values[selected[0]];
    const occasion = params.get("anlass");
    const destination = document.querySelector("#europe-destination");
    if (occasion && destination) destination.value = occasion === "rhein-in-flammen" ? "Rhine in Flames" : occasion;
  }
})();
