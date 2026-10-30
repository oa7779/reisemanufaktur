(() => {
  const labels = {
    wellness: {
      label: "Wellness & Erholung",
      title: "Ein paar Tage, die ganz Ihnen gehören.",
      intro: "Wir suchen eine entspannte Wellness-Auszeit in Europa mit komfortablem Hotel, Spa-Zeit und einer Reisedauer, die in Ihren Kalender passt."
    },
    genuss: {
      label: "Kulinarik & Genuss",
      title: "Eine kurze Reise für guten Geschmack.",
      intro: "Wir kombinieren regionale Küche, Wein, Spirituosen und saisonale Feste zu einer genussvollen Auszeit – passend zu bestätigten Terminen und Verfügbarkeiten."
    },
    kultur: {
      label: "Stadt, Geschichte & Kultur",
      title: "Entdecken, ohne jeden Tag vollzupacken.",
      intro: "Wir planen eine kurze Städtereise oder Kultur-Auszeit mit einem passenden Hotel als Ausgangspunkt und genügend Raum für Pausen."
    },
    natur: {
      label: "Natur & Bewegung",
      title: "Frische Luft und gute Wege – ganz ohne Eile.",
      intro: "Wir finden einen ruhigen Ausgangspunkt für leichte Ausflüge, Natur und schöne Landschaften mit komfortabler Unterkunft."
    }
  };
  const params = new URLSearchParams(location.search);
  const selected = [...new Set(params.getAll("thema").filter((theme) => Object.hasOwn(labels, theme)))];
  const sourceNames = {
    asien: "Asien Special Tours",
    afrika: "Africa Royal Tours",
    lateinamerika: "América Special Tours"
  };
  const primary = selected.length ? labels[selected[0]] : null;
  const title = document.querySelector("[data-campaign-title]");
  const intro = document.querySelector("[data-campaign-intro]");
  const tag = document.querySelector("[data-campaign-source]");
  const source = document.querySelector("[data-source-brand]");
  if (primary && title) title.textContent = primary.title;
  if (primary && intro) intro.textContent = primary.intro;
  if (primary && tag) tag.textContent = primary.label;
  if (source) source.textContent = sourceNames[params.get("quelle")] || "unseren Auszeit-Finder";

  if (selected.length) {
    document.querySelectorAll("[data-europe-theme]").forEach((card) => {
      const themes = card.dataset.europeTheme.split(/\s+/);
      const matches = selected.some((theme) => themes.includes(theme));
      card.dataset.match = matches ? "true" : "false";
      card.hidden = !matches;
    });
  }

  const formTheme = document.querySelector("#europe-theme");
  if (formTheme) {
    const formThemes = {
      wellness: "Wellness und Erholung",
      genuss: "Kulinarik und Wein",
      kultur: "Stadt und Kultur",
      natur: "Natur und Bewegung"
    };
    const formValue = formThemes[selected[0]];
    if (formValue) formTheme.value = formValue;
    const occasion = params.get("anlass");
    const destination = document.querySelector("#europe-destination");
    if (occasion && destination) destination.value = occasion === "rhein-in-flammen" ? "Rhein in Flammen" : occasion;
  }
})();
