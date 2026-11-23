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

/* CMS content-only bindings: editable copy and imagery, fixed presentation. */
document.addEventListener("DOMContentLoaded", function () {
  function put(selector, value) {
    var el = document.querySelector(selector);
    if (!el || value === undefined || value === null) return;
    if (el.matches("input, textarea")) el.placeholder = String(value);
    else el.textContent = String(value);
  }
  function make(tag, cls, value) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value !== undefined) el.textContent = String(value);
    return el;
  }
  function fillList(selector, items, builder) {
    var el = document.querySelector(selector);
    if (!el || !Array.isArray(items)) return;
    var frag = document.createDocumentFragment();
    items.forEach(function(item, i){ frag.appendChild(builder(item, i)); });
    el.replaceChildren(frag);
  }
  var page = location.pathname.split("/").pop() || "index.html";
  fetch("data/page-content.json", {cache:"no-store"}).then(function(r){
    if(!r.ok) throw new Error("CMS page content unavailable");
    return r.json();
  }).then(function(d){
    var maps = {
      "index.html":[[".home-hero-eyebrow",d.home.eyebrow],[".home-hero-title",d.home.title],[".home-hero-lead",d.home.lead],[".home-hero-tagline",d.home.tagline],[".home-hero-actions .btn-primary",d.home.primary_button],[".home-hero-actions .btn-outline",d.home.secondary_button],[".home-stats-grid .home-stat:nth-child(1) h2",d.home.stats[0].value],[".home-stats-grid .home-stat:nth-child(1) p",d.home.stats[0].label],[".home-stats-grid .home-stat:nth-child(2) h2",d.home.stats[1].value],[".home-stats-grid .home-stat:nth-child(2) p",d.home.stats[1].label],[".home-stats-grid .home-stat:nth-child(3) h2",d.home.stats[2].value],[".home-stats-grid .home-stat:nth-child(3) p",d.home.stats[2].label],["main > section:nth-of-type(3) .section-head h2",d.home.shortcuts_heading],["main > section:nth-of-type(3) .section-head p",d.home.shortcuts_intro],["main > section:nth-of-type(4) .section-head h2",d.home.news_heading],["main > section:nth-of-type(4) .section-head p",d.home.news_intro]],
      "about.html":[["main > section:first-child h1",d.about.title],["main > section:first-child p",d.about.intro],["#mission-vision .card:nth-child(1) h3",d.about.mission_heading],["#mission-vision .card:nth-child(1) p",d.about.mission_body],["#mission-vision .card:nth-child(2) h3",d.about.vision_heading],["#mission-vision .card:nth-child(2) p",d.about.vision_body],["#leadership .section-head h2",d.about.leadership_heading],["#leadership .section-head p",d.about.leadership_intro],["#jva .section-head h2",d.about.partnership_heading],["#jva .section-head p",d.about.partnership_intro],["#jva .card h3",d.about.jva_heading],["#jva .card p:nth-of-type(1)",d.about.jva_paragraph_1],["#jva .card p:nth-of-type(2)",d.about.jva_paragraph_2],["main > section:nth-of-type(5) .section-head h2",d.about.service_area_heading],["main > section:nth-of-type(5) .section-head p",d.about.service_area_intro],["main > section:nth-of-type(5) details summary",d.about.service_area_summary]],
      "services.html":[[".services-hero h1",d.services.title],[".services-hero p",d.services.intro],["#new-connection .section-head h2",d.services.connection_heading],["#new-connection .section-head p",d.services.connection_intro],["#other-services .section-head h2",d.services.other_services_heading],["#requirements h2",d.services.requirements_heading],["#projects-heading",d.services.projects_heading],["#projects-section .section-head p",d.services.projects_intro]],
      "payments.html":[[".payments-hero h1",d.payments.title],[".payments-hero p",d.payments.intro],["#payment-notice-title",d.payments.notice_title],["#payment-notice-body",d.payments.notice_body]],
      "rates.html":[[".rates-hero h1",d.rates.title],[".rates-hero p",d.rates.intro],["#bill-estimator h3",d.rates.estimator_heading],["#bill-estimator .card > p",d.rates.estimator_intro],["label[for=consumption]",d.rates.consumption_label],["#estimate-btn",d.rates.estimate_button],["#bill-estimator .notice",d.rates.rate_notice],["#rate-schedule h2",d.rates.rate_schedule_heading]],
      "careers.html":[[".careers-hero h1",d.careers.title],[".careers-hero p",d.careers.intro],["#openings .section-head h2",d.careers.openings_heading],["#how-to-apply .section-head h2",d.careers.apply_heading],["#qualifications h2",d.careers.qualifications_heading],["#qualifications p",d.careers.qualifications_intro]],
      "news.html":[[".news-hero h1",d.news.title],[".news-hero p",d.news.intro]],
      "faq.html":[["main > section:first-child h1",d.faq.title],["main > section:first-child p",d.faq.intro]],
      "contact.html":[[".contact-hero h1",d.contact.title],[".contact-hero p",d.contact.intro],[".contact-hero + section .container > div:first-child h2",d.contact.office_heading],[".contact-hero + section .card h3",d.contact.form_heading],["#form-success h4",d.contact.success_heading],["#form-success p",d.contact.success_message],["#form-error",d.contact.error_message],["label[for=fullname]",d.contact.name_label],["label[for=email]",d.contact.email_field_label],["label[for=subject]",d.contact.subject_label],["label[for=message]",d.contact.message_label],["#consent + label",d.contact.consent_text],["#btn-label",d.contact.send_button],["#btn-sending",d.contact.sending_button]],
      "transparency.html":[["main > section:first-child h1",d.transparency.title],["main > section:first-child p",d.transparency.intro],["#seal h2",d.transparency.seal_heading],["#seal h3",d.transparency.documents_heading],["#charter h2",d.transparency.charter_heading],["#charter p:nth-of-type(1)",d.transparency.charter_intro],["#foi h2",d.transparency.foi_heading],["#foi p",d.transparency.foi_intro],["#foi .btn-primary",d.transparency.foi_button],["#foi .btn-outline",d.transparency.foi_contact_button]],
      "search.html":[["main h1",d.search.title],["#big-q",d.search.placeholder]]
    };
    (maps[page] || []).forEach(function(pair){ put(pair[0],pair[1]); });
    if(page==="index.html"){
      var hero=document.querySelector(".home-hero-photo");
      var rawHero=(d.home && typeof d.home.hero_image==="string") ? d.home.hero_image.trim() : "";
      if(hero && rawHero){
        var heroUrl="";
        try {
          // PagesCMS media paths may be saved with a leading slash. Strip it so
          // GitHub Pages project sites keep the /CWDWEBSITE/ base path.
          if (/^https?:\/\//i.test(rawHero)) {
            heroUrl=rawHero;
          } else {
            heroUrl=new URL(rawHero.replace(/^\/+/, "").replace(/^\.\//, ""), document.baseURI).href;
          }
        } catch (error) {
          console.error("Could not resolve the CMS homepage image path.", error);
        }
        if(heroUrl){
          var heroPreload=new Image();
          heroPreload.onload=function(){
            hero.style.backgroundImage='linear-gradient(180deg,rgba(7,63,82,.02),rgba(7,63,82,.12)),url("'+heroUrl.replace(/"/g,"%22")+'")';
            hero.classList.add("home-hero-photo-loaded");
            hero.setAttribute("aria-label","Homepage photo selected in PagesCMS");
          };
          heroPreload.onerror=function(){
            console.error("The PagesCMS homepage image could not be loaded:",heroUrl);
            // Do not blank out the CSS placeholder when an upload path is invalid.
          };
          heroPreload.src=heroUrl;
        }
      }
      fillList("main > section:nth-of-type(3) .grid",d.home.shortcuts,function(item){
        var card=make("article","card");
        if(item.image){var im=make("img","home-shortcut-img");im.src=item.image;im.alt=item.image_alt||item.title;im.loading="lazy";card.appendChild(im);}
        card.appendChild(make("h3","",item.title));card.appendChild(make("p","",item.description));
        var p=make("p");var a=make("a","",item.button);a.href=item.target||"#";p.appendChild(a);card.appendChild(p);return card;
      });
    }
    if(page==="about.html") fillList("main > section:nth-of-type(5) details .grid",d.about.barangays,function(name){return make("p","",name);});
    var site=d.site;
    put(".gov-bar .container > span",site.gov_bar_text);
    put(".site-footer .footer-tagline",site.footer_tagline);
    var foot=document.querySelector(".site-footer");
    if(foot){var li=foot.querySelectorAll(".footer-grid > div:last-child li");if(li[0])li[0].textContent=site.footer_address;if(li[1])li[1].textContent=site.footer_phone;if(li[2])li[2].textContent=site.footer_email;var c=foot.querySelector(".footer-bottom span");if(c)c.textContent=site.footer_copyright;}
  }).catch(function(){ /* Static HTML remains a safe fallback. */ });
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
