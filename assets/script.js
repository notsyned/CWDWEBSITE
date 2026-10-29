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
