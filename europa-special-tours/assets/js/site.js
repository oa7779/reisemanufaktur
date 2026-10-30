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

  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    const status = form.querySelector(".form-status");
    const site = form.dataset.site;
    const email = form.dataset.email;
    const submit = form.querySelector('button[type="submit"]');
    const contactMethod = form.querySelector('[name="contact_method"]');
    const phone = form.querySelector('[name="phone"]');
    const phoneLabel = phone?.closest(".field")?.querySelector(".optional");
    const budget = form.querySelector('[name="budget"]');
    const budgetRoute = form.querySelector("[data-budget-routing]");
    const budgetRouteLink = form.querySelector("[data-europe-link]");
    const initiallyRequiredFields = new Set(form.querySelectorAll("[required]"));
    const mapInterestToEurope = (value) => {
      const text = value.toLocaleLowerCase("de");
      if (text.includes("wellness") || text.includes("erholung") || text.includes("spa")) return "wellness";
      if (text.includes("kulinar") || text.includes("wein") || text.includes("genuss")) return "genuss";
      if (text.includes("kultur") || text.includes("geschichte") || text.includes("begegnung")) return "kultur";
      if (text.includes("natur") || text.includes("safari") || text.includes("tierwelt") || text.includes("aktiv") || text.includes("fotografie")) return "natur";
      return "";
    };
    const getEuropeUrl = () => {
      const isNetlifyPreview = location.hostname === "reisemanufaktur.netlify.app"
        || location.hostname.endsWith("--reisemanufaktur.netlify.app");
      const isLocal = location.protocol === "file:"
        || location.hostname === "localhost"
        || location.hostname === "127.0.0.1";
      const destination = isNetlifyPreview || isLocal
        ? new URL(
          location.protocol === "file:" ? "../europa-special-tours/einstieg.html" : "/europa-special-tours/einstieg.html",
          location.href
        )
        : new URL("https://www.europa-special-tours.de/einstieg.html");
      destination.searchParams.set("quelle", form.dataset.siteKey || "reiseanfrage");
      const selectedInterests = [...form.querySelectorAll('input[name="interests"]:checked')]
        .map((input) => mapInterestToEurope(input.value))
        .filter(Boolean);
      [...new Set(selectedInterests)].slice(0, 3).forEach((interest) => destination.searchParams.append("thema", interest));
      return destination;
    };
    const updateBudgetRoute = () => {
      const isEuropeRoute = budget?.value === "unter-5000";
      if (budgetRoute) budgetRoute.hidden = !isEuropeRoute;
      initiallyRequiredFields.forEach((field) => {
        field.required = isEuropeRoute ? field === budget : true;
      });
      if (budgetRouteLink && isEuropeRoute) budgetRouteLink.href = getEuropeUrl().toString();
    };

    const updatePhoneRequirement = () => {
      const required = budget?.value !== "unter-5000" && (contactMethod?.value === "Telefon" || contactMethod?.value === "Gern beides");
      if (phone) phone.required = required;
      if (phoneLabel) phoneLabel.textContent = required ? "(erforderlich)" : "(optional)";
    };

    contactMethod?.addEventListener("change", updatePhoneRequirement);
    budget?.addEventListener("change", () => {
      updateBudgetRoute();
      updatePhoneRequirement();
    });
    form.querySelectorAll('input[name="interests"]').forEach((input) => {
      input.addEventListener("change", updateBudgetRoute);
    });
    updatePhoneRequirement();
    updateBudgetRoute();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (budget?.value === "unter-5000") {
        window.location.assign(getEuropeUrl().toString());
        return;
      }
      updatePhoneRequirement();
      if (!form.reportValidity()) return;

      const fields = new FormData(form);
      if (fields.get("website")) return;
      const values = {};
      for (const [key, value] of fields.entries()) {
        if (key === "interests") {
          values[key] = values[key] || [];
          values[key].push(value);
        } else {
          values[key] = value;
        }
      }

      const budgetScore = {
        "unter-5000": 0,
        "5000-8000": 1,
        "8000-12000": 2,
        "12000-20000": 3,
        "20000-30000": 4,
        "ueber-30000": 5,
        "offen": 0
      }[values.budget] || 0;
      const timeScore = values.travel_window === "0-3" ? 2 : values.travel_window === "4-6" ? 2 : values.travel_window === "7-12" ? 1 : 0;
      const detailScore = (values.destination ? 2 : 0) + (values.interests?.length ? 1 : 0) + (values.message?.trim().length >= 40 ? 1 : 0);
      const readiness = Math.min(10, budgetScore + timeScore + detailScore);
      const priority = readiness >= 7 ? "A – hohe Beratungsreife" : readiness >= 4 ? "B – qualifizierter Beratungsbedarf" : "C – Erstorientierung / Angaben ergänzen";
      const label = (name) => form.querySelector(`[name="${name}"]`)?.selectedOptions?.[0]?.textContent?.trim() || values[name] || "—";
      const lines = [
        `Neue Reiseanfrage · ${site}`,
        "",
        `Vorläufige Beratungspriorität: ${priority} (${readiness}/10)`,
        "Die Einordnung dient der internen Vorbereitung und ist keine automatische Ablehnung.",
        "",
        `Name: ${values.name || "—"}`,
        `E-Mail: ${values.email || "—"}`,
        `Telefon: ${values.phone || "nicht angegeben"}`,
        `Bevorzugter Kontakt: ${label("contact_method")}`,
        `Reiseziel / Wunschregion: ${values.destination || "offen"}`,
        `Reisezeitraum: ${label("travel_window")}`,
        `Reisedauer: ${values.duration || "—"} Tage`,
        `Reisende: ${values.travelers || "—"}`,
        `Gesamtbudget je Person (einschließlich internationaler Flüge): ${label("budget")}`,
        `Unterkunft: ${label("accommodation")}`,
        `Reisestil: ${label("travel_style")}`,
        `Interessen: ${values.interests?.join(", ") || "nicht angegeben"}`,
        "",
        "Wünsche und Hinweise:",
        values.message || "—",
        "",
        "Datenschutzhinweis wurde bestätigt."
      ];
      const subject = encodeURIComponent(`Reiseanfrage über die Website · ${values.name || site}`);
      const body = encodeURIComponent(lines.join("\n"));
      const mailto = `mailto:${email}?subject=${subject}&body=${body}`;

      if (status) {
        const heading = document.createElement("strong");
        heading.textContent = `Vorläufige Einordnung: ${priority} (${readiness}/10).`;
        const message = document.createElement("p");
        message.textContent = `Wir öffnen Ihr E-Mail-Programm mit Ihrer Anfrage an ${email}. Diese Einordnung dient der internen Vorbereitung und führt nicht zu einer automatischen Ablehnung.`;
        const fallback = document.createElement("a");
        fallback.href = mailto;
        fallback.textContent = "Falls nötig: E-Mail-Entwurf erneut öffnen";
        status.replaceChildren(heading, message, fallback);
        status.classList.add("is-visible");
        status.setAttribute("tabindex", "-1");
        status.focus();
      }
      if (submit) submit.textContent = "E-Mail-Entwurf wird vorbereitet …";
      window.location.href = mailto;
      if (submit) {
        window.setTimeout(() => { submit.textContent = "Anfrage erneut vorbereiten"; }, 1200);
      }
    });
  });

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
