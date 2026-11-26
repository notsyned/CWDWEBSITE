// CAMIWD — shared site behavior

document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // Mark current page in nav (based on filename)
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === path) link.setAttribute("aria-current", "page");
  });

  // -------------------------------------------------------
  // Dropdown nav — keyboard + touch support
  // -------------------------------------------------------
  document.querySelectorAll(".nav-dropdown").forEach((item) => {
    const trigger = item.querySelector("a");

    // Toggle open on click (for touch/keyboard users; hover handles desktop mouse)
    trigger.addEventListener("click", (e) => {
      // Only intercept if it's acting as a dropdown toggle (has a menu)
      const menu = item.querySelector(".dropdown-menu");
      if (!menu) return;
      // If the link goes somewhere (href other than #), let it navigate on second click
      if (item.classList.contains("open")) return;
      e.preventDefault();
      // Close any other open dropdowns
      document.querySelectorAll(".nav-dropdown.open").forEach((other) => {
        if (other !== item) other.classList.remove("open");
      });
      item.classList.toggle("open");
    });

    // Close on Escape
    item.addEventListener("keydown", (e) => {
      if (e.key === "Escape") item.classList.remove("open");
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-dropdown")) {
      document.querySelectorAll(".nav-dropdown.open").forEach((item) => {
        item.classList.remove("open");
      });
    }
  });

  // -------------------------------------------------------
  // Contact form — AJAX submission via Formspree
  // -------------------------------------------------------
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const successMsg  = document.getElementById("form-success");
    const errorMsg    = document.getElementById("form-error");
    const submitBtn   = document.getElementById("form-submit-btn");
    const btnLabel    = document.getElementById("btn-label");
    const btnSending  = document.getElementById("btn-sending");

    // Client-side validation helper
    function validateForm() {
      let valid = true;
      contactForm.querySelectorAll("[required]").forEach((field) => {
        const errorEl = contactForm.querySelector(`[data-error-for="${field.id}"]`);
        const filled = field.type === "checkbox" ? field.checked : field.value.trim() !== "";
        if (!filled) {
          valid = false;
          if (errorEl) errorEl.hidden = false;
          field.setAttribute("aria-invalid", "true");
        } else {
          if (errorEl) errorEl.hidden = true;
          field.removeAttribute("aria-invalid");
        }
      });
      return valid;
    }

    // Clear field error on change
    contactForm.querySelectorAll("[required]").forEach((field) => {
      field.addEventListener("input", () => {
        const errorEl = contactForm.querySelector(`[data-error-for="${field.id}"]`);
        const filled = field.type === "checkbox" ? field.checked : field.value.trim() !== "";
        if (filled) {
          if (errorEl) errorEl.hidden = true;
          field.removeAttribute("aria-invalid");
        }
      });
    });

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // 1. Client-side validation first
      if (!validateForm()) return;

      // 2. Show sending state
      submitBtn.disabled = true;
      btnLabel.hidden = true;
      btnSending.hidden = false;
      if (errorMsg) errorMsg.hidden = true;

      try {
        const data = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: data,
          headers: { "Accept": "application/json" }
        });

        if (response.ok) {
          // 3a. Success — hide form, show confirmation
          contactForm.hidden = true;
          if (successMsg) {
            successMsg.hidden = false;
            successMsg.focus();
          }
        } else {
          // 3b. Server error — show error notice, re-enable button
          throw new Error("Server responded with " + response.status);
        }
      } catch (err) {
        // 3c. Network or other error
        if (errorMsg) errorMsg.hidden = false;
        submitBtn.disabled = false;
        btnLabel.hidden = false;
        btnSending.hidden = true;
        console.error("Form submission error:", err);
      }
    });
  }

  // Simple accessible form validation for any OTHER [data-validate] forms
  // (Keeps backward compatibility for any non-contact forms on other pages)
  document.querySelectorAll("[data-validate]").forEach((form) => {
    if (form.id === "contact-form") return; // already handled above
    form.addEventListener("submit", (e) => {
      let valid = true;
      form.querySelectorAll("[required]").forEach((field) => {
        const errorEl = form.querySelector(`[data-error-for="${field.id}"]`);
        const filled = field.type === "checkbox" ? field.checked : field.value.trim() !== "";
        if (!filled) {
          valid = false;
          if (errorEl) errorEl.hidden = false;
          field.setAttribute("aria-invalid", "true");
        } else {
          if (errorEl) errorEl.hidden = true;
          field.removeAttribute("aria-invalid");
        }
      });
      if (!valid) e.preventDefault();
    });
  });
});

/* CMS content bindings: every field in data/page-content.json is rendered by the page that owns it. */
document.addEventListener("DOMContentLoaded", function () {
  var page = location.pathname.split("/").pop() || "index.html";
  var icons = {
    wallet: '<path d="M4 6h15a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12v3"/><path d="M16 12h5"/><circle cx="16" cy="12" r=".5"/>',
    droplet: '<path d="M12 2.5S5 10 5 14.5a7 7 0 0 0 14 0C19 10 12 2.5 12 2.5Z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
    calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8v4H8zM8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
    "message-circle": '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    "file-text": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    construction: '<path d="M2 21h20M5 21V8l7-5 7 5v13M9 21v-6h6v6"/><path d="M8 10h.01M16 10h.01"/>'
  };
  function query(selector) { var choices=String(selector||"").split("||"); for(var i=0;i<choices.length;i++){try{var node=document.querySelector(choices[i].trim());if(node)return node;}catch(e){}} return null; }
  function put(selector, value) {
    var el = query(selector);
    if (!el || value === undefined || value === null || Array.isArray(value) || typeof value === "object") return;
    if (el.matches("input, textarea") && el.type !== "submit") el.placeholder = String(value);
    else el.textContent = String(value);
  }
  function attr(selector, name, value) {
    var el = query(selector);
    if (!el || value === undefined || value === null) return;
    var text = String(value).trim();
    if (!text) return;
    el.setAttribute(name, text);
  }
  function make(tag, cls, value) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value !== undefined && value !== null) el.textContent = String(value);
    return el;
  }
  function renderHeroImage(value) {
    var img = query(".home-hero-cms-image");
    if (!img) return;
    var fallback = img.getAttribute("data-fallback-src") || img.getAttribute("src") || "";
    var source = typeof value === "string" ? value.trim() : "";
    if (!source) source = fallback;
    if (!source) return;
    img.onerror = null;
    if (source !== fallback) {
      img.onerror = function () {
        img.onerror = null;
        if (fallback && img.getAttribute("src") !== fallback) img.src = fallback;
      };
    }
    img.src = source;
  }
  function textNode(parent, value) { parent.appendChild(document.createTextNode(String(value || ""))); }
  function renderStats(items) {
    var parent = query(".home-stats-grid");
    if (!parent || !Array.isArray(items)) return;
    var fragment = document.createDocumentFragment();
    items.forEach(function (item) {
      if (!item || typeof item !== "object") return;
      var card = make("div", "home-stat");
      card.appendChild(make("h2", "", item.value || ""));
      card.appendChild(make("p", "", item.label || ""));
      fragment.appendChild(card);
    });
    if (!fragment.childNodes.length) fragment.appendChild(make("p", "cms-empty-state", "Website statistics will be added here."));
    parent.replaceChildren(fragment);
  }
  function renderShortcuts(items) {
    var parent = query("#home-shortcuts-grid") || query("main > section:nth-of-type(3) .grid");
    if (!parent || !Array.isArray(items)) return;
    var fragment = document.createDocumentFragment();
    items.forEach(function (item) {
      if (!item || typeof item !== "object") return;
      var card = make("article", "card home-shortcut-card");
      var iconPath = icons[item.icon] || icons.info;
      var icon = make("div", "card-icon");
      icon.setAttribute("aria-hidden", "true");
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("focusable", "false");
      svg.innerHTML = iconPath;
      icon.appendChild(svg);
      card.appendChild(icon);
      if (typeof item.image === "string" && item.image.trim()) {
        var im = make("img", "home-shortcut-img");
        im.src = item.image;
        im.alt = item.image_alt || item.title || "CWD service";
        im.loading = "lazy";
        im.onerror = function () { im.hidden = true; };
        card.appendChild(im);
      }
      card.appendChild(make("h3", "", item.title || "Quick link"));
      card.appendChild(make("p", "", item.description || ""));
      var p = make("p", "home-shortcut-action");
      var a = make("a", "", item.button || "Learn more");
      a.href = item.target || "#";
      p.appendChild(a);
      card.appendChild(p);
      fragment.appendChild(card);
    });
    if (!fragment.childNodes.length) fragment.appendChild(make("p", "cms-empty-state", "Quick links will be added here."));
    parent.replaceChildren(fragment);
  }
  function renderSteps(selector, items) {
    var parent = query(selector);
    if (!parent && selector === "#connection-steps") parent = query("#new-connection .grid");
    if (!parent && selector === "#application-steps") parent = query("#how-to-apply .grid");
    if (!parent || !Array.isArray(items)) return;
    var fragment = document.createDocumentFragment();
    items.forEach(function (item, index) {
      if (!item || typeof item !== "object") return;
      var card = make("article", "card");
      var icon = make("div", "card-icon");
      icon.setAttribute("aria-hidden", "true");
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("focusable", "false");
      svg.innerHTML = index === 0 ? icons["file-text"] : index === 1 ? icons.info : index === 2 ? icons.wallet : icons.droplet;
      icon.appendChild(svg);
      card.appendChild(icon);
      card.appendChild(make("h3", "", (index + 1) + ". " + (item.title || "Step")));
      card.appendChild(make("p", "", item.description || ""));
      fragment.appendChild(card);
    });
    if (!fragment.childNodes.length) fragment.appendChild(make("p", "cms-empty-state", "Application steps will be added here."));
    parent.replaceChildren(fragment);
  }
  function renderRequirements(data) {
    var table = query("#requirements-table || #requirements table");
    if (!table || !data) return;
    var columns = Array.isArray(data.requirements_columns) ? data.requirements_columns : [];
    var rows = Array.isArray(data.requirements_rows) ? data.requirements_rows : [];
    var thead = document.createElement("thead");
    var tr = document.createElement("tr");
    columns.forEach(function (column) { tr.appendChild(make("th", "", column)); });
    thead.appendChild(tr);
    var tbody = document.createElement("tbody");
    var keys = ["requirement", "new_connection", "reconnection", "transfer"];
    rows.forEach(function (row) {
      if (!row || typeof row !== "object") return;
      var rowEl = document.createElement("tr");
      columns.forEach(function (_, i) {
        var cell = make("td", "", row[keys[i]] || "");
        rowEl.appendChild(cell);
      });
      tbody.appendChild(rowEl);
    });
    if (!columns.length || !rows.length) { table.replaceChildren(); table.hidden=true; var empty=query("#requirements-empty"); if(!empty){empty=make("p","cms-empty-state","Requirements will be added here.");empty.id="requirements-empty";table.insertAdjacentElement("afterend",empty);} empty.hidden=false; return; }
    table.hidden=false; var empty=query("#requirements-empty"); if(empty)empty.hidden=true; table.replaceChildren(thead,tbody);
  }
  function renderFaq(items) {
    var parent = query("#faq-list || main > section.section-tint .container[style*=\"max-width\"]");
    if (!parent || !Array.isArray(items)) return;
    var fragment = document.createDocumentFragment();
    items.forEach(function (item) {
      if (!item || typeof item !== "object") return;
      var details = make("details", "faq-item");
      details.appendChild(make("summary", "", item.question || "Question"));
      details.appendChild(make("p", "", item.answer || ""));
      fragment.appendChild(details);
    });
    if (!fragment.childNodes.length) fragment.appendChild(make("p", "cms-empty-state", "No FAQs have been published yet. Please contact CWD if you need assistance."));
    parent.replaceChildren(fragment);
  }
  function renderSubjectOptions(data) {
    var select = query("#subject");
    if (!select || !data || !Array.isArray(data.subject_options)) return;
    var placeholder = data.subject_placeholder || "Select one";
    var current = select.value;
    var fragment = document.createDocumentFragment();
    var first = make("option", "", placeholder);
    first.value = "";
    fragment.appendChild(first);
    data.subject_options.forEach(function (value) {
      if (typeof value !== "string" || !value.trim()) return;
      var option = make("option", "", value);
      option.value = value;
      fragment.appendChild(option);
    });
    select.replaceChildren(fragment);
    if (current) select.value = current;
  }
  function renderSite(site) {
    if (!site || typeof site !== "object") return;
    put(".gov-bar .container > span", site.gov_bar_text);
    put(".brand-text strong", site.org_name);
    put(".brand-text em", site.org_slogan);
    put(".brand-text > span", site.org_location);
    var nav = {
      "index.html": site.nav_home,
      "about.html": site.nav_about,
      "services.html": site.nav_services,
      "payments.html": site.nav_payments,
      "rates.html": site.nav_rates,
      "careers.html": site.nav_careers,
      "news.html": site.nav_news,
      "faq.html": site.nav_faq,
      "contact.html": site.nav_contact
    };
    Object.keys(nav).forEach(function (href) {
      var el = query('.main-nav > ul > li > a[href="' + href + '"]');
      if (el && nav[href] !== undefined && nav[href] !== null) el.textContent = nav[href];
    });
    put('.gov-bar .container nav a[href="transparency.html#seal"]', site.gov_transparency);
    put('.gov-bar .container nav a[href="transparency.html#charter"]', site.gov_charter);
    put('.gov-bar .container nav a[href="transparency.html#foi"]', site.gov_foi);
    put(".site-footer .footer-grid > div:first-child h4", site.org_name);
    put(".site-footer .footer-tagline", site.footer_tagline);
    var footer = query(".site-footer");
    if (footer) {
      var contactItems = footer.querySelectorAll(".footer-grid > div:last-child li");
      if (contactItems[0] && site.footer_address !== undefined) contactItems[0].textContent = site.footer_address;
      if (contactItems[1] && site.footer_phone !== undefined) contactItems[1].textContent = site.footer_phone;
      if (contactItems[2] && site.footer_email !== undefined) contactItems[2].textContent = site.footer_email;
      var bottom = footer.querySelectorAll(".footer-bottom span");
      if (bottom[0] && site.footer_copyright !== undefined) bottom[0].textContent = site.footer_copyright;
      if (bottom[1] && site.footer_legal !== undefined) bottom[1].textContent = site.footer_legal;
    }
  }
  function renderBanner() {
    if (page !== "index.html") return;
    fetch("data/homepage.json?cms-banner=20261125", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("homepage banner unavailable"); return r.json(); })
      .then(function (data) {
        var banner = query("#site-banner");
        if (!banner) return;
        if (data.banner_show === true && typeof data.banner_message === "string" && data.banner_message.trim()) {
          put("#banner-label", data.banner_label || "Notice");
          put("#banner-message", data.banner_message);
          banner.hidden = false;
        } else {
          banner.hidden = true;
        }
      }).catch(function () { /* Keep the static hidden banner as a safe fallback. */ });
  }
  renderBanner();

  fetch("data/page-content.json?cms-content=20261125", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("CMS page content unavailable");
      return response.json();
    })
    .then(function (d) {
      if (!d || typeof d !== "object") return;
      var maps = {
        "index.html": [
          [".home-hero-eyebrow", d.home && d.home.eyebrow],
          [".home-hero-title", d.home && d.home.title],
          [".home-hero-lead", d.home && d.home.lead],
          [".home-hero-tagline", d.home && d.home.tagline],
          [".home-hero-actions .btn-primary", d.home && d.home.primary_button],
          [".home-hero-actions .btn-outline", d.home && d.home.secondary_button],
          ["#home-shortcuts-heading || main > section:nth-of-type(3) .section-head h2", d.home && d.home.shortcuts_heading],
          ["#home-shortcuts-intro || main > section:nth-of-type(3) .section-head p", d.home && d.home.shortcuts_intro],
          ["#home-news-heading || main > section:nth-of-type(4) .section-head h2", d.home && d.home.news_heading],
          ["#home-news-intro || main > section:nth-of-type(4) .section-head p", d.home && d.home.news_intro],
          ["#home-news-button || main > section:nth-of-type(4) .btn-outline", d.home && d.home.news_button]
        ],
        "about.html": [
          ["main > section:first-child h1", d.about && d.about.title],
          ["main > section:first-child p", d.about && d.about.intro],
          ["#mission-vision .card:nth-child(1) h3", d.about && d.about.mission_heading],
          ["#mission-vision .card:nth-child(1) p", d.about && d.about.mission_body],
          ["#mission-vision .card:nth-child(2) h3", d.about && d.about.vision_heading],
          ["#mission-vision .card:nth-child(2) p", d.about && d.about.vision_body],
          ["#leadership .section-head h2", d.about && d.about.leadership_heading],
          ["#leadership .section-head p", d.about && d.about.leadership_intro],
          ["#org-board-heading", d.about && d.about.board_heading],
          ["#jva .section-head h2", d.about && d.about.partnership_heading],
          ["#jva .section-head p", d.about && d.about.partnership_intro],
          ["#jva .card h3", d.about && d.about.jva_heading],
          ["#jva .card p:nth-of-type(1)", d.about && d.about.jva_paragraph_1],
          ["#jva .card p:nth-of-type(2)", d.about && d.about.jva_paragraph_2],
          ["#jva-note-heading || #jva .notice strong", d.about && d.about.jva_note_heading],
          ["#jva-note-body", d.about && d.about.jva_note_body],
          ["main > section:nth-of-type(5) .section-head h2", d.about && d.about.service_area_heading],
          ["main > section:nth-of-type(5) .section-head p", d.about && d.about.service_area_intro],
          ["main > section:nth-of-type(5) details summary", d.about && d.about.service_area_summary],
          ["#service-area-note || main > section:nth-of-type(5) .notice", d.about && d.about.service_area_note]
        ],
        "services.html": [
          [".services-hero h1", d.services && d.services.title],
          [".services-hero p", d.services && d.services.intro],
          ["#new-connection .section-head h2", d.services && d.services.connection_heading],
          ["#new-connection .section-head p", d.services && d.services.connection_intro],
          ["#other-services .section-head h2", d.services && d.services.other_services_heading],
          ["#other-services-intro || #other-services .section-head p", d.services && d.services.other_services_intro],
          ["#requirements h2", d.services && d.services.requirements_heading],
          ["#application-button || #requirements .btn-primary", d.services && d.services.application_button],
          ["#projects-heading", d.services && d.services.projects_heading],
          ["#projects-section .section-head p", d.services && d.services.projects_intro]
        ],
        "payments.html": [
          ["#payment-title", d.payments && d.payments.title],
          ["#payment-intro", d.payments && d.payments.intro],
          ["#payment-notice-title", d.payments && d.payments.notice_title],
          ["#payment-notice-body", d.payments && d.payments.notice_body]
        ],
        "rates.html": [
          [".rates-hero h1", d.rates && d.rates.title],
          [".rates-hero p", d.rates && d.rates.intro],
          ["#bill-estimator h3", d.rates && d.rates.estimator_heading],
          ["#bill-estimator .card > p", d.rates && d.rates.estimator_intro],
          ["label[for=consumption]", d.rates && d.rates.consumption_label],
          ["#consumption", d.rates && d.rates.consumption_placeholder],
          ["#estimate-btn", d.rates && d.rates.estimate_button],
          ["#rate-notice || #bill-estimator .notice", d.rates && d.rates.rate_notice],
          ["#rate-schedule h2", d.rates && d.rates.rate_schedule_heading],
          ["#rate-column-item || #rate-schedule thead th:nth-child(1)", d.rates && d.rates.rate_schedule_column_item],
          ["#rate-column-amount || #rate-schedule thead th:nth-child(2)", d.rates && d.rates.rate_schedule_column_amount],
          ["#schedule-pdf-link", d.rates && d.rates.schedule_download_label]
        ],
        "careers.html": [
          [".careers-hero h1", d.careers && d.careers.title],
          [".careers-hero p", d.careers && d.careers.intro],
          ["#openings .section-head h2", d.careers && d.careers.openings_heading],
          ["#how-to-apply .section-head h2", d.careers && d.careers.apply_heading],
          ["#qualifications h2", d.careers && d.careers.qualifications_heading],
          ["#qualifications-intro || #qualifications p", d.careers && d.careers.qualifications_intro],
          ["#contact-hr-button || #qualifications .btn-primary", d.careers && d.careers.contact_hr_button]
        ],
        "news.html": [
          [".news-hero h1", d.news && d.news.title],
          [".news-hero p", d.news && d.news.intro]
        ],
        "faq.html": [
          ["#faq-page-title || main > section:first-child h1", d.faq && d.faq.title],
          ["#faq-page-intro || main > section:first-child p", d.faq && d.faq.intro]
        ],
        "contact.html": [
          [".contact-hero h1", d.contact && d.contact.title],
          [".contact-hero p", d.contact && d.contact.intro],
          ["#contact-office-heading", d.contact && d.contact.office_heading],
          ["#contact-address-label", d.contact && d.contact.address_label],
          ["#contact-address", d.contact && d.contact.address],
          ["#contact-phone-label", d.contact && d.contact.phone_label],
          ["#contact-phone", d.contact && d.contact.phone],
          ["#contact-email-label", d.contact && d.contact.email_label],
          ["#contact-email", d.contact && d.contact.email],
          ["#contact-hours-label", d.contact && d.contact.office_hours_label],
          ["#contact-hours", d.contact && d.contact.office_hours],
          ["#contact-hours-note", d.contact && d.contact.office_hours_note],
          ["#contact-form-heading", d.contact && d.contact.form_heading],
          ["#form-success h4", d.contact && d.contact.success_heading],
          ["#form-success p", d.contact && d.contact.success_message],
          ["#form-error", d.contact && d.contact.error_message],
          ["label[for=fullname]", d.contact && d.contact.name_label],
          ["label[for=email]", d.contact && d.contact.email_field_label],
          ["label[for=subject]", d.contact && d.contact.subject_label],
          ["label[for=message]", d.contact && d.contact.message_label],
          ["#consent + label", d.contact && d.contact.consent_text],
          ['[data-error-for="consent"]', d.contact && d.contact.consent_error],
          ["#btn-label", d.contact && d.contact.send_button],
          ["#btn-sending", d.contact && d.contact.sending_button]
        ],
        "transparency.html": [
          ["main > section:first-child h1", d.transparency && d.transparency.title],
          ["main > section:first-child p", d.transparency && d.transparency.intro],
          ["#seal h2", d.transparency && d.transparency.seal_heading],
          ["#transparency-seal-paragraph-1 || #seal .container > div > div:last-child p:nth-of-type(1)", d.transparency && d.transparency.seal_paragraph_1],
          ["#transparency-seal-paragraph-2 || #seal .container > div > div:last-child p:nth-of-type(2)", d.transparency && d.transparency.seal_paragraph_2],
          ["#transparency-legal-basis || #seal .container > div > div:last-child p:nth-of-type(3)", d.transparency && d.transparency.legal_basis],
          ["#trans-list-heading", d.transparency && d.transparency.documents_heading],
          ["#charter h2", d.transparency && d.transparency.charter_heading],
          ["#charter-intro", d.transparency && d.transparency.charter_intro],
          ["#charter-placeholder || #charter p:nth-of-type(2)", d.transparency && d.transparency.charter_placeholder],
          ["#foi h2", d.transparency && d.transparency.foi_heading],
          ["#foi p", d.transparency && d.transparency.foi_intro],
          ["#foi-primary-button || #foi .btn-primary", d.transparency && d.transparency.foi_button],
          ["#foi-contact-button || #foi .btn-outline", d.transparency && d.transparency.foi_contact_button]
        ],
        "search.html": [
          ["main h1", d.search && d.search.title],
          ["#big-q", d.search && d.search.placeholder],
          ["#search-submit-button || main form button[type=submit]", d.search && d.search.button]
        ]
      };
      (maps[page] || []).forEach(function (pair) { put(pair[0], pair[1]); });
      renderSite(d.site);

      if (page === "index.html" && d.home) {
        renderHeroImage(d.home.hero_image);
        renderStats(d.home.stats);
        renderShortcuts(d.home.shortcuts);
      }
      if (page === "about.html" && d.about && Array.isArray(d.about.barangays)) {
        var barangayContainer = query("main > section:nth-of-type(5) details .grid");
        if (barangayContainer) {
          var bFrag = document.createDocumentFragment();
          d.about.barangays.forEach(function (name) { bFrag.appendChild(make("p", "", name)); });
          barangayContainer.replaceChildren(bFrag);
        }
      }
      if (page === "services.html" && d.services) {
        renderSteps("#connection-steps", d.services.connection_steps);
        renderRequirements(d.services);
      }
      if (page === "careers.html" && d.careers) renderSteps("#application-steps", d.careers.application_steps);
      if (page === "contact.html" && d.contact) {
        renderSubjectOptions(d.contact);
        attr("#contact-phone", "href", d.contact.phone_href);
        attr("#contact-email", "href", d.contact.email_href);
        attr('#form-error a', "href", d.contact.email_href);
        attr('#form-error a', "aria-label", "Email " + (d.contact.email || ""));
      }
      if (page === "transparency.html" && d.transparency) {
        attr("#foi-primary-button || #foi .btn-primary", "href", d.transparency.foi_url);
        var charterFile = typeof d.transparency.charter_document === "string" ? d.transparency.charter_document.trim() : "";
        var charterActions = query("#charter-document-actions");
        var charterPlaceholder = query("#charter-placeholder || #charter p:nth-of-type(2)");
        if (charterActions && charterFile) {
          attr("#charter-document-view", "href", charterFile);
          attr("#charter-document-download", "href", charterFile);
          charterActions.hidden = false;
          if (charterPlaceholder) charterPlaceholder.hidden = true;
        } else {
          if (charterActions) charterActions.hidden = true;
          if (charterPlaceholder) charterPlaceholder.hidden = false;
        }
      }
      if (page === "faq.html") {
        fetch("data/faq.json?cms-faq=20261125", { cache: "no-store" })
          .then(function (r) { if (!r.ok) throw new Error("FAQ data unavailable"); return r.json(); })
          .then(function (faq) { renderFaq(faq.items); })
          .catch(function (e) { console.error("FAQ CMS content could not be loaded; existing FAQs remain visible.", e); });
      }
    })
    .catch(function (error) {
      console.error("CMS page content unavailable; static page content remains visible.", error);
    });
});

/* Project photo galleries: CMS photos are rendered inside fixed card layouts. */
document.addEventListener("DOMContentLoaded", function () {
  var list = document.getElementById("projects-list");
  if (!list) return;
  function attachGalleries(data) {
    var items = data && Array.isArray(data.items) ? data.items : [];
    list.querySelectorAll(".card").forEach(function (card) {
      if (card.querySelector(".project-gallery")) return;
      var titleEl = card.querySelector("h3");
      if (!titleEl) return;
      var project = items.find(function (item) { return item.title && item.title.trim() === titleEl.textContent.trim(); });
      if (!project || !Array.isArray(project.gallery) || !project.gallery.length) return;
      var gallery = document.createElement("div");
      gallery.className = "project-gallery";
      project.gallery.forEach(function (entry) {
        if (!entry || !entry.image) return;
        var figure = document.createElement("figure");
        var img = document.createElement("img");
        img.src = entry.image; img.alt = entry.caption || project.title; img.loading = "lazy";
        figure.appendChild(img);
        if (entry.caption) {
          var caption = document.createElement("figcaption");
          caption.textContent = entry.caption;
          figure.appendChild(caption);
        }
        gallery.appendChild(figure);
      });
      var body = card.querySelector("div[style*='padding']") || card;
      if (gallery.children.length) body.appendChild(gallery);
    });
  }
  fetch("data/projects.json", {cache:"no-store"}).then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data) return;
      attachGalleries(data);
      var observer = new MutationObserver(function () { attachGalleries(data); });
      observer.observe(list, {childList:true, subtree:true});
    }).catch(function () {});
});
