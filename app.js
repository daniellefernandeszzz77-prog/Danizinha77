(() => {
  "use strict";

  const config = window.LARANJINHA_CONFIG;
  const AGE_KEY = "laranjinha-age-confirmed";
  let selectedPackage = null;
  let pixPayload = "";
  let toastTimer = null;

  const elements = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    if (!config || !Array.isArray(config.packages)) {
      document.body.textContent = "Configuração do site não encontrada.";
      return;
    }

    Object.assign(elements, {
      ageGate: document.querySelector("#age-gate"),
      ageContent: document.querySelector("#age-content"),
      site: document.querySelector("#site"),
      packages: document.querySelector("#packages"),
      checkout: document.querySelector("#checkout"),
      closeCheckout: document.querySelector("#close-checkout"),
      warning: document.querySelector("#config-warning"),
      selectedName: document.querySelector("#selected-name"),
      selectedPrice: document.querySelector("#selected-price"),
      pixName: document.querySelector("#pix-name"),
      pixKey: document.querySelector("#pix-key"),
      qrCode: document.querySelector("#qr-code"),
      qrPlaceholder: document.querySelector("#qr-placeholder"),
      qrError: document.querySelector("#qr-error"),
      copyKey: document.querySelector("#copy-key"),
      copyPayload: document.querySelector("#copy-payload"),
      instagram: document.querySelector("#instagram-button"),
      toast: document.querySelector("#toast")
    });

    document.querySelectorAll("[data-brand]").forEach((node) => {
      node.textContent = config.brandName.toUpperCase();
    });

    renderPackages();
    bindEvents();
    applyAgeState();
  }

  function bindEvents() {
    document.querySelector("#confirm-age").addEventListener("click", allowAccess);
    document.querySelector("#deny-age").addEventListener("click", denyAccess);
    elements.closeCheckout.addEventListener("click", () => elements.checkout.close());
    elements.copyKey.addEventListener("click", () => copyText(config.pixKey, "Chave Pix copiada"));
    elements.copyPayload.addEventListener("click", () => copyText(pixPayload, "Pix Copia e Cola copiado"));

    elements.instagram.addEventListener("click", (event) => {
      if (!instagramConfigured()) {
        event.preventDefault();
        showToast("Instagram ainda não configurado");
      }
    });

    elements.checkout.addEventListener("click", (event) => {
      if (event.target === elements.checkout) elements.checkout.close();
    });
  }

  function applyAgeState() {
    let allowed = false;
    try {
      allowed = window.localStorage.getItem(AGE_KEY) === "yes";
    } catch (_) {
      allowed = false;
    }

    if (allowed) {
      elements.ageGate.hidden = true;
      elements.site.setAttribute("aria-hidden", "false");
      elements.site.inert = false;
      document.body.classList.remove("age-locked");
    } else {
      elements.site.inert = true;
      document.body.classList.add("age-locked");
    }
  }

  function allowAccess() {
    try {
      window.localStorage.setItem(AGE_KEY, "yes");
    } catch (_) {
      // Access continues even if storage is unavailable.
    }
    elements.ageGate.hidden = true;
    elements.site.setAttribute("aria-hidden", "false");
    elements.site.inert = false;
    document.body.classList.remove("age-locked");
  }

  function denyAccess() {
    elements.ageContent.className = "age-denied";
    elements.ageContent.innerHTML = `
      <div class="age-number" aria-hidden="true">18+</div>
      <h1>Acesso não permitido</h1>
      <p>Este site é destinado exclusivamente a pessoas com 18 anos ou mais.</p>
      <a class="button primary full" href="https://www.google.com">Sair do site</a>
    `;
  }

  function renderPackages() {
    const fragment = document.createDocumentFragment();

    config.packages.forEach((item) => {
      const card = document.createElement("article");
      card.className = `package-card${item.featured ? " featured" : ""}${item.rainbow ? " rainbow" : ""}`;

      const label = document.createElement("span");
      label.className = "package-label";
      label.textContent = item.label;

      const title = document.createElement("h3");
      title.textContent = item.name;

      const price = document.createElement("div");
      price.className = "package-price";
      const currency = document.createElement("span");
      currency.textContent = "R$";
      const amount = document.createElement("strong");
      amount.textContent = Number(item.price).toFixed(2).replace(".", ",");
      const note = document.createElement("small");
      note.textContent = "pagamento único";
      price.append(currency, amount, note);

      const description = document.createElement("p");
      description.className = "package-description";
      description.textContent = item.description;

      const features = document.createElement("ul");
      features.className = "package-features";
      item.features.forEach((feature) => {
        const li = document.createElement("li");
        li.textContent = feature;
        features.append(li);
      });

      const button = document.createElement("button");
      button.className = "button primary package-select";
      button.type = "button";
      button.textContent = "Escolher pacote →";
      button.addEventListener("click", () => openCheckout(item));

      card.append(label, title, price, description, features, button);
      fragment.append(card);
    });

    elements.packages.replaceChildren(fragment);
  }

  function openCheckout(item) {
    selectedPackage = item;
    pixPayload = pixConfigured() ? buildPixPayload(item) : "";

    elements.selectedName.textContent = item.name;
    elements.selectedPrice.textContent = formatMoney(item.price);
    elements.pixName.textContent = config.pixName || "NÃO CONFIGURADO";
    elements.pixKey.textContent = config.pixKey || "NÃO CONFIGURADA";
    elements.warning.hidden = pixConfigured() && instagramConfigured();
    elements.copyKey.disabled = !pixConfigured();
    elements.copyPayload.disabled = !pixPayload;

    configureInstagram();
    renderQrCode();

    if (typeof elements.checkout.showModal === "function") {
      elements.checkout.showModal();
    } else {
      elements.checkout.setAttribute("open", "");
    }
  }

  function configureInstagram() {
    if (!instagramConfigured()) {
      elements.instagram.removeAttribute("href");
      elements.instagram.setAttribute("aria-disabled", "true");
      elements.instagram.textContent = "◎ Instagram ainda não configurado";
      return;
    }

    const username = config.instagramUsername.trim().replace(/^@/, "");
    elements.instagram.href = `https://ig.me/m/${encodeURIComponent(username)}`;
    elements.instagram.removeAttribute("aria-disabled");
    elements.instagram.textContent = "◎ Abrir Instagram e enviar comprovante";
  }

  function renderQrCode() {
    elements.qrCode.replaceChildren();
    elements.qrError.hidden = true;

    if (!pixPayload) {
      elements.qrPlaceholder.hidden = false;
      return;
    }

    elements.qrPlaceholder.hidden = true;

    if (typeof window.QRCode !== "function") {
      elements.qrError.hidden = false;
      return;
    }

    try {
      new window.QRCode(elements.qrCode, {
        text: pixPayload,
        width: 188,
        height: 188,
        colorDark: "#14110f",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M
      });
    } catch (_) {
      elements.qrError.hidden = false;
    }
  }

  function pixConfigured() {
    return Boolean(config.pixName && config.pixKey && config.pixCity);
  }

  function instagramConfigured() {
    return Boolean(config.instagramUsername && config.instagramUsername.trim());
  }

  function buildPixPayload(item) {
    const merchantAccount =
      field("00", "BR.GOV.BCB.PIX") + field("01", config.pixKey.trim());
    const txid = normalizePixText(`${config.brandName}${item.id}`, 25).replace(/ /g, "") || "***";
    const payloadWithoutCrc = [
      field("00", "01"),
      field("01", "12"),
      field("26", merchantAccount),
      field("52", "0000"),
      field("53", "986"),
      field("54", Number(item.price).toFixed(2)),
      field("58", "BR"),
      field("59", normalizePixText(config.pixName, 25) || "LARANJINHA"),
      field("60", normalizePixText(config.pixCity, 15) || "BRASIL"),
      field("62", field("05", txid)),
      "6304"
    ].join("");

    return `${payloadWithoutCrc}${crc16(payloadWithoutCrc)}`;
  }

  function field(id, value) {
    return `${id}${String(value.length).padStart(2, "0")}${value}`;
  }

  function normalizePixText(value, limit) {
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, limit);
  }

  function crc16(payload) {
    let crc = 0xffff;
    for (let index = 0; index < payload.length; index += 1) {
      crc ^= payload.charCodeAt(index) << 8;
      for (let bit = 0; bit < 8; bit += 1) {
        crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  async function copyText(value, successMessage) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch (_) {
      const temporary = document.createElement("textarea");
      temporary.value = value;
      temporary.setAttribute("readonly", "");
      temporary.style.position = "fixed";
      temporary.style.opacity = "0";
      document.body.append(temporary);
      temporary.select();
      document.execCommand("copy");
      temporary.remove();
    }
    showToast(successMessage);
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("visible"), 2200);
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(Number(value));
  }
})();
