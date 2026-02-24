const DEFAULT_SETTINGS = {
  enabled: true,
  rate: 1,
  volume: 1
};

const enabledInput = document.getElementById("enabled");
const rateInput = document.getElementById("rate");
const volumeInput = document.getElementById("volume");
const rateValue = document.getElementById("rateValue");
const volumeValue = document.getElementById("volumeValue");

function renderValues() {
  rateValue.textContent = `当前: ${rateInput.value}`;
  volumeValue.textContent = `当前: ${volumeInput.value}`;
}

function save() {
  chrome.storage.sync.set({
    enabled: enabledInput.checked,
    rate: Number(rateInput.value),
    volume: Number(volumeInput.value)
  });
  renderValues();
}

chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
  enabledInput.checked = Boolean(settings.enabled);
  rateInput.value = String(settings.rate ?? 1);
  volumeInput.value = String(settings.volume ?? 1);
  renderValues();
});

enabledInput.addEventListener("change", save);
rateInput.addEventListener("input", save);
volumeInput.addEventListener("input", save);
