const DEFAULT_SETTINGS = {
  enabled: true,
  rate: 1,
  volume: 1,
  voiceName: ""
};

const enabledInput = document.getElementById("enabled");
const voiceSelect = document.getElementById("voice");
const rateInput = document.getElementById("rate");
const volumeInput = document.getElementById("volume");
const rateValue = document.getElementById("rateValue");
const volumeValue = document.getElementById("volumeValue");
const readLatestButton = document.getElementById("readLatest");
const status = document.getElementById("status");

let activeTabId = null;

function renderValues() {
  rateValue.textContent = `当前: ${rateInput.value}`;
  volumeValue.textContent = `当前: ${volumeInput.value}`;
}

function setStatus(message, isError = false) {
  status.textContent = message;
  status.style.color = isError ? "#c1121f" : "#666";
}

function save() {
  chrome.storage.sync.set({
    enabled: enabledInput.checked,
    rate: Number(rateInput.value),
    volume: Number(volumeInput.value),
    voiceName: voiceSelect.value
  });
  renderValues();
}

function fillVoiceSelect(voices, selectedVoiceName) {
  voiceSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "系统默认语音";
  voiceSelect.appendChild(defaultOption);

  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})${voice.default ? " • default" : ""}`;
    voiceSelect.appendChild(option);
  });

  voiceSelect.value = selectedVoiceName || "";
}

function queryActiveXProTab(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs?.[0];
    if (!activeTab?.id) {
      setStatus("未找到当前标签页", true);
      callback(null);
      return;
    }

    if (!activeTab.url?.startsWith("https://pro.x.com/")) {
      setStatus("请先切换到 pro.x.com 页面", true);
      callback(null);
      return;
    }

    activeTabId = activeTab.id;
    callback(activeTab.id);
  });
}

function loadVoices(selectedVoiceName) {
  queryActiveXProTab((tabId) => {
    if (!tabId) {
      fillVoiceSelect([], selectedVoiceName);
      return;
    }

    chrome.tabs.sendMessage(tabId, { type: "LIST_VOICES" }, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        setStatus("无法读取语音列表，请刷新 X Pro 页面后重试", true);
        fillVoiceSelect([], selectedVoiceName);
        return;
      }

      fillVoiceSelect(response.voices || [], selectedVoiceName);
    });
  });
}

function readLatestNow() {
  queryActiveXProTab((tabId) => {
    if (!tabId) {
      return;
    }

    chrome.tabs.sendMessage(tabId, { type: "READ_LATEST" }, (response) => {
      if (chrome.runtime.lastError) {
        setStatus("无法连接页面脚本，请刷新 X Pro 页面后重试", true);
        return;
      }

      if (!response?.ok) {
        setStatus(response?.message || "朗读失败", true);
        return;
      }

      setStatus(response.message || "已朗读最新动态");
    });
  });
}

chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
  enabledInput.checked = Boolean(settings.enabled);
  rateInput.value = String(settings.rate ?? 1);
  volumeInput.value = String(settings.volume ?? 1);
  renderValues();
  loadVoices(typeof settings.voiceName === "string" ? settings.voiceName : "");
});

enabledInput.addEventListener("change", save);
voiceSelect.addEventListener("change", save);
rateInput.addEventListener("input", save);
volumeInput.addEventListener("input", save);
readLatestButton.addEventListener("click", readLatestNow);
