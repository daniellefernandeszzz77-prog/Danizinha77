const config = window.SITE_CONFIG;
const ageGate = document.querySelector("#age-gate");
const site = document.querySelector("#site");
const packagesRoot = document.querySelector("#packages");
const checkout = document.querySelector("#pagamento");
const emptyState = document.querySelector("#checkout-empty");
const form = document.querySelector("#receipt-form");
const fileInput = document.querySelector("#receipt");
const sendButton = document.querySelector("#send-receipt");
const status = document.querySelector("#form-status");
let selectedPackage = null;

document.querySelector("#brand-name").textContent = config.brandName;

config.packages.forEach((item, index) => {
  const card = document.createElement("article");
  card.className = `package-card${index === 1 ? " featured" : ""}`;
  const media = item.image
    ? `<img src="${item.image}" alt="${item.name}" />`
    : `<div class="image-placeholder"><span>▧</span><small>Foto do ${item.name}</small></div>`;
  card.innerHTML = `
    <div class="package-media">${media}${index === 1 ? '<b class="feature-tag">Destaque</b>' : ""}</div>
    <div class="package-body">
      <div class="package-title"><h3>${item.name}</h3><strong>${item.price}</strong></div>
      <p>${item.description}</p>
      <button class="button light full" type="button">Selecionar pacote</button>
    </div>`;
  card.querySelector("button").addEventListener("click", () => selectPackage(item));
  packagesRoot.append(card);
});

document.querySelector("#confirm-age").addEventListener("click", () => {
  ageGate.hidden = true;
  site.setAttribute("aria-hidden", "false");
});

document.querySelector("#deny-age").addEventListener("click", () => {
  document.querySelector(".age-content").innerHTML = `
    <div class="shield">18+</div>
    <h1>Acesso restrito</h1>
    <p>Este conteúdo é destinado exclusivamente a maiores de 18 anos.</p>`;
});

document.querySelector("#copy-pix").addEventListener("click", async () => {
  if (!config.pixKey) return;
  await navigator.clipboard.writeText(config.pixKey);
  showStatus("Chave PIX copiada.", "success");
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  document.querySelector("#file-name").textContent = file?.name || "Clique para escolher o arquivo";
  sendButton.disabled = !file;
  showStatus("", "");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = fileInput.files[0];
  if (!selectedPackage || !file) return;

  if (file.size > 10 * 1024 * 1024) {
    showStatus("O arquivo ultrapassa o limite de 10 MB.", "error");
    return;
  }

  sendButton.disabled = true;
  sendButton.textContent = "Enviando…";
  showStatus("Enviando seu comprovante com segurança…", "");

  const data = new FormData();
  data.append("receipt", file);
  data.append("packageId", selectedPackage.id);
  data.append("packageName", selectedPackage.name);

  try {
    const response = await fetch(config.receiptApi, { method: "POST", body: data });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Não foi possível enviar o comprovante.");
    showStatus(`Comprovante recebido. Código: ${result.receiptId}`, "success");
    if (config.instagramUrl) setTimeout(() => window.location.assign(config.instagramUrl), 900);
  } catch (error) {
    showStatus(error.message || "O envio falhou. Tente novamente.", "error");
    sendButton.disabled = false;
  } finally {
    sendButton.innerHTML = 'Enviar comprovante <span aria-hidden="true">→</span>';
  }
});

function selectPackage(item) {
  selectedPackage = item;
  document.querySelector("#selected-name").textContent = item.name;
  document.querySelector("#selected-price").textContent = item.price;
  document.querySelector("#pix-key").value = config.pixKey || "CHAVE PIX PENDENTE";
  document.querySelector("#copy-pix").disabled = !config.pixKey;
  emptyState.hidden = true;
  form.hidden = false;
  fileInput.value = "";
  document.querySelector("#file-name").textContent = "Clique para escolher o arquivo";
  sendButton.disabled = true;
  showStatus("", "");
  checkout.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showStatus(message, kind) {
  status.textContent = message;
  status.className = `form-status ${kind}`;
}
