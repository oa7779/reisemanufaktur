(() => {
  const script = document.querySelector("script[data-form-intake]");
  const english = document.documentElement.lang === "en-US";
  const copy = (de, en) => english ? en : de;
  const params = new URLSearchParams(location.search);
  const ideas = new Set(["wellness", "stadt", "genuss", "geschichte", "natur", "familie"]);
  const themes = new Set(["wellness", "genuss", "kultur", "natur"]);
  const sources = new Set(["asien", "afrika", "lateinamerika"]);
  const context = (url) => {
    if (sources.has(params.get("quelle"))) url.searchParams.set("quelle", params.get("quelle"));
    if (params.get("auswahl") === "reiseidee") url.searchParams.set("auswahl", "reiseidee");
    return url;
  };
  document.querySelectorAll("[data-journey-idea] a").forEach((anchor) => {
    anchor.href = context(new URL(anchor.getAttribute("href"), location.href)).href;
  });
  document.querySelectorAll(".language-switch a[hreflang]").forEach((anchor) => {
    const url = context(new URL(anchor.getAttribute("href"), location.href));
    if (ideas.has(params.get("reise"))) url.searchParams.set("reise", params.get("reise"));
    for (const theme of params.getAll("thema")) {
      if (themes.has(theme)) url.searchParams.append("thema", theme);
    }
    anchor.href = url.href;
  });
  document.querySelector("[data-intake-show-all]")?.addEventListener("click", () => {
    document.querySelectorAll("[data-journey-idea]").forEach((card) => { card.hidden = false; });
  });

  document.querySelectorAll("[data-travel-inquiry]").forEach((form) => {
    const budget = form.querySelector('[name="budget"]');
    const phone = form.querySelector('[name="phone"]');
    const contact = form.querySelector('[name="contact_method"]');
    const optional = phone?.closest(".field")?.querySelector(".optional");
    const route = form.querySelector("[data-budget-routing]");
    const routeLink = form.querySelector("[data-europe-link]");
    const journey = form.querySelector('[name="journey"]');
    const required = [...form.querySelectorAll("[required]")];
    if (journey) {
      const selectedThemes = {
        wellness: "Wellness und Erholung", stadt: "Stadt und Kultur", genuss: "Kulinarik und Wein",
        geschichte: "Geschichte und Folklore", natur: "Natur und Bewegung", familie: "Familienauszeit"
      };
      const updateIdea = () => {
        const interest = form.querySelector('[name="interests"]');
        if (selectedThemes[journey.value]) interest.value = selectedThemes[journey.value];
        document.querySelectorAll(".language-switch a[hreflang]").forEach((anchor) => {
          const url = new URL(anchor.href);
          if (ideas.has(journey.value)) url.searchParams.set("reise", journey.value);
          else url.searchParams.delete("reise");
          anchor.href = url.href;
        });
      };
      if (ideas.has(params.get("reise"))) journey.value = params.get("reise");
      journey.addEventListener("change", updateIdea);
      updateIdea();
    }
    const europeUrl = () => {
      const url = new URL(script.dataset.europeUrl, location.href);
      url.searchParams.set("quelle", form.dataset.siteKey);
      url.searchParams.set("auswahl", "reiseidee");
      const selected = new Set();
      form.querySelectorAll('input[name="interests"]:checked').forEach((input) => {
        const value = input.value.toLocaleLowerCase("de");
        if (/wellness|erholung|spa/.test(value)) selected.add("wellness");
        else if (/kulinar|wein|genuss/.test(value)) selected.add("genuss");
        else if (/kultur|geschichte|begegnung/.test(value)) selected.add("kultur");
        else if (/natur|safari|tierwelt|aktiv|fotografie/.test(value)) selected.add("natur");
      });
      [...selected].slice(0, 3).forEach((theme) => url.searchParams.append("thema", theme));
      return url;
    };
    const update = () => {
      const guided = Boolean(route && budget.value === "unter-5000");
      form.classList.toggle("is-europe-route", guided);
      if (route) route.hidden = !guided;
      required.forEach((field) => { field.required = !guided || field === budget; });
      if (routeLink) routeLink.href = europeUrl().href;
      if (phone) {
        phone.required = !guided && ["Telefon", "Gern beides", "Phone", "Either is fine"].includes(contact.value);
        if (optional) optional.textContent = phone.required ? copy("(erforderlich)", "(required)") : copy("(optional)", "(optional)");
      }
    };
    budget.addEventListener("change", update);
    contact.addEventListener("change", update);
    form.querySelectorAll('input[name="interests"]').forEach((input) => input.addEventListener("change", update));
    update();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      update();
      if (route && budget.value === "unter-5000") {
        location.assign(europeUrl().href);
        return;
      }
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      if (values.get("website")) return;
      const label = (name) => {
        const field = form.querySelector(`[name="${name}"]`);
        return field?.selectedOptions?.[0]?.textContent?.trim() || values.get(name) || copy("Nicht angegeben", "Not specified");
      };
      const budgetScore = {"5000-8000": 1, "8000-12000": 2, "12000-20000": 3, "20000-30000": 4, "ueber-30000": 5}[values.get("budget")] || 0;
      const timeScore = {"0-3": 2, "4-6": 2, "7-12": 1}[values.get("travel_window")] || 0;
      const detailScore = (values.get("destination") ? 2 : 0) + (values.getAll("interests").length ? 1 : 0) + ((values.get("message") || "").trim().length >= 40 ? 1 : 0);
      const readiness = Math.min(10, budgetScore + timeScore + detailScore);
      const priority = readiness >= 7 ? "A" : readiness >= 4 ? "B" : "C";
      const lines = [
        copy("Reiseanfrage", "Travel inquiry") + ` · ${form.dataset.site}`, "",
        copy("Vorläufige Beratungspriorität (nur intern): ", "Preliminary consultation priority (internal only): ") + `${priority} (${readiness}/10)`,
        copy("Die Einordnung dient der Vorbereitung und ist keine automatische Ablehnung.", "This classification is for preparation only and is not an automatic rejection."), "",
        ...(journey ? [copy("Gewählte Reiseidee: ", "Selected travel idea: ") + label("journey"), ""] : []),
        ...(journey ? [journey.selectedOptions[0].dataset.outline, copy("Inspirationsentwurf; Leistungen und Verfügbarkeit sind noch nicht bestätigt.", "Inspiration draft; services and availability have not been confirmed."), ""] : []),
        copy("Name: ", "Name: ") + label("name"),
        copy("E-Mail: ", "Email: ") + label("email"),
        copy("Telefon: ", "Phone: ") + label("phone"),
        copy("Bevorzugter Kontakt: ", "Preferred contact: ") + label("contact_method"),
        copy("Wunschregion: ", "Preferred region: ") + label("destination"),
        copy("Reisezeitraum: ", "Travel window: ") + label("travel_window"),
        copy("Reisedauer: ", "Trip length: ") + label("duration") + (journey ? copy(" Nächte", " nights") : copy(" Tage", " days")),
        copy("Reisende: ", "Travelers: ") + label("travelers"),
        copy("Gesamtbudget je Person einschließlich Anreise: ", "Total budget per person including transportation: ") + label("budget"),
        ...(!journey ? [
          copy("Unterkunft: ", "Accommodation: ") + label("accommodation"),
          copy("Reisestil: ", "Travel style: ") + label("travel_style")
        ] : []),
        copy("Interessen: ", "Interests: ") + (journey ? label("interests") : values.getAll("interests").join(", ")),
        "", copy("Wünsche und Hinweise: ", "Wishes and notes: ") + label("message"), "",
        copy("Datenschutzhinweis wurde bestätigt.", "The privacy notice was acknowledged.")
      ];
      const subject = [copy("Reiseanfrage", "Travel inquiry"), journey ? label("journey") : form.dataset.site, label("name")].join(" · ");
      const mailto = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
      const status = form.querySelector(".form-status");
      const message = document.createElement("p");
      message.textContent = copy(
        "Wir öffnen Ihr E-Mail-Programm mit Ihrer Anfrage. Es wurde noch nichts versendet; bitte prüfen und senden Sie den Entwurf selbst.",
        "We are opening your email app with your inquiry. Nothing has been sent; please review and send the draft yourself."
      );
      const fallback = document.createElement("a");
      fallback.href = mailto;
      fallback.textContent = copy("E-Mail-Entwurf erneut öffnen", "Reopen the email draft");
      status.replaceChildren(message, fallback);
      status.classList.add("is-visible");
      status.setAttribute("tabindex", "-1");
      status.focus();
      location.href = mailto;
    });
  });
})();
