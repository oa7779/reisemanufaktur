(() => {
  if (!document.querySelector('script[src$="assets/js/site.js"]')) {
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
  }

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
    const journey = form.querySelector('[name="journey"]');
    if (journey) {
      const updateIdea = () => {
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

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      if (values.get("website")) return;
      const label = (name) => {
        const field = form.querySelector(`[name="${name}"]`);
        return field?.selectedOptions?.[0]?.textContent?.trim() || values.get(name)?.trim()
          || copy("Nicht angegeben", "Not specified");
      };
      const fullName = [label("first_name"), label("last_name")]
        .filter((value) => value !== copy("Nicht angegeben", "Not specified"))
        .join(" ");
      const salutation = values.get("salutation") ? label("salutation") : "";
      const lines = [
        copy("Reiseanfrage", "Travel inquiry") + ` · ${form.dataset.site}`, "",
        ...(journey ? [
          copy("Gewählte Reiseidee: ", "Selected travel idea: ") + label("journey"),
          journey.selectedOptions[0].dataset.outline || "",
          copy("Inspirationsentwurf; Leistungen und Verfügbarkeit sind noch nicht bestätigt.", "Inspiration draft; services and availability have not been confirmed."),
          ""
        ] : []),
        copy("Anrede: ", "Salutation: ") + (salutation || copy("Nicht angegeben", "Not specified")),
        copy("Name: ", "Name: ") + (fullName || copy("Nicht angegeben", "Not specified")),
        copy("E-Mail: ", "Email: ") + label("email"),
        copy("Telefon: ", "Phone: ") + label("phone"),
        copy("Wunschregion: ", "Preferred region: ") + label("destination"),
        copy("Reisende: ", "Travelers: ") + label("travelers"),
        "", copy("Erzählen Sie uns von Ihren Reisewünschen:", "Tell us about your travel wishes:"),
        label("message"), "",
        copy("Datenschutzhinweis wurde bestätigt.", "The privacy notice was acknowledged.")
      ];
      const subject = [copy("Reiseanfrage", "Travel inquiry"),
        journey ? label("journey") : form.dataset.site, fullName].join(" · ");
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
