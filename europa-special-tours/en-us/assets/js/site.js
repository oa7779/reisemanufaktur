(() => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      menu.classList.toggle("is-open", open);
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      menu.classList.remove("is-open");
    }));
  }

  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    const phone = form.querySelector('[name="phone"]');
    const contact = form.querySelector('[name="contact_method"]');
    const optional = phone?.closest(".field")?.querySelector(".optional");
    const updatePhone = () => {
      phone.required = contact.value === "Phone" || contact.value === "Either is fine";
      if (optional) optional.textContent = phone.required ? "(required)" : "(optional)";
    };
    contact.addEventListener("change", updatePhone);
    updatePhone();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      updatePhone();
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      if (values.get("website")) return;
      const label = (name) => {
        const field = form.querySelector(`[name="${name}"]`);
        return field?.selectedOptions?.[0]?.textContent?.trim() || values.get(name) || "Not specified";
      };
      const budgetScore = {"5000-8000": 1, "8000-12000": 2, "12000-20000": 3, "20000-30000": 4, "ueber-30000": 5}[values.get("budget")] || 0;
      const timeScore = {"0-3": 2, "4-6": 2, "7-12": 1}[values.get("travel_window")] || 0;
      const detailScore = (values.get("destination") ? 2 : 0) + (values.get("interests") ? 1 : 0) + ((values.get("message") || "").trim().length >= 40 ? 1 : 0);
      const readiness = Math.min(10, budgetScore + timeScore + detailScore);
      const priority = readiness >= 7 ? "A — ready for detailed advice" : readiness >= 4 ? "B — defined advice needs" : "C — initial exploration / more details needed";
      const lines = [
        `New travel inquiry · ${form.dataset.site}`, "",
        `Preliminary consultation priority: ${priority} (${readiness}/10)`,
        "This classification is for internal preparation only and is not an automatic rejection.", "",
        `Name: ${label("name")}`,
        `Email: ${label("email")}`,
        `Phone: ${label("phone")}`,
        `Preferred contact method: ${label("contact_method")}`,
        `Destination / preferred region: ${label("destination")}`,
        `Travel window: ${label("travel_window")}`,
        `Length of stay: ${label("duration")} nights`,
        `Travelers: ${label("travelers")}`,
        `Total budget per person (including travel to and from the destination): ${label("budget")}`,
        `Interests: ${label("interests")}`, "",
        "Wishes and notes:", values.get("message") || "Not specified", "",
        "The privacy notice was acknowledged."
      ];
      const mailto = `mailto:${form.dataset.email}?subject=${encodeURIComponent(`Website travel inquiry · ${values.get("name") || form.dataset.site}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
      const status = form.querySelector(".form-status");
      if (status) {
        const heading = document.createElement("strong");
        heading.textContent = `Preliminary classification: ${priority} (${readiness}/10).`;
        const message = document.createElement("p");
        message.textContent = `We are opening your email app with a draft inquiry to ${form.dataset.email}. This classification is for internal preparation only and does not automatically reject your inquiry. Nothing is sent until you send the email yourself.`;
        const fallback = document.createElement("a");
        fallback.href = mailto;
        fallback.textContent = "If needed, reopen the email draft";
        status.replaceChildren(heading, message, fallback);
        status.classList.add("is-visible");
        status.setAttribute("tabindex", "-1");
        status.focus();
      }
      const submit = form.querySelector('button[type="submit"]');
      if (submit) submit.textContent = "Preparing your email draft…";
      window.location.href = mailto;
      if (submit) window.setTimeout(() => { submit.textContent = "Prepare inquiry again"; }, 1200);
    });
  });
})();
