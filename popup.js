const DEFAULT_SETTINGS = {
  enabled: true,
  intervalSec: 60,
  voiceName: '',
  rate: 1,
  volume: 1,
};

const el = {
  enabled: document.getElementById('enabled'),
  intervalSec: document.getElementById('intervalSec'),
  voiceSelect: document.getElementById('voiceSelect'),
  rate: document.getElementById('rate'),
  volume: document.getElementById('volume'),
  readNowBtn: document.getElementById('readNowBtn'),
};

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (data) => resolve(data));
  });
}

function setSettings(patch) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(patch, () => resolve());
  });
}

function getCurrentTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs[0]));
  });
}

function sendToCurrentTab(message) {
  return getCurrentTab().then((tab) => {
    if (!tab?.id) return;
    chrome.tabs.sendMessage(tab.id, message);
  });
}

function buildVoiceSelect() {
  const voices = window.speechSynthesis.getVoices();
  el.voiceSelect.innerHTML = '';

  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '系统默认语音';
  el.voiceSelect.appendChild(defaultOpt);

  voices.forEach((voice) => {
    const opt = document.createElement('option');
    opt.value = voice.name;
    opt.textContent = `${voice.name} (${voice.lang})`;
    el.voiceSelect.appendChild(opt);
  });
}

async function init() {
  buildVoiceSelect();
  window.speechSynthesis.onvoiceschanged = buildVoiceSelect;

  const settings = await getSettings();
  el.enabled.checked = settings.enabled;
  el.intervalSec.value = settings.intervalSec;
  el.voiceSelect.value = settings.voiceName;
  el.rate.value = settings.rate;
  el.volume.value = settings.volume;

  const sync = async () => {
    const patch = {
      enabled: el.enabled.checked,
      intervalSec: Math.max(15, Number(el.intervalSec.value) || DEFAULT_SETTINGS.intervalSec),
      voiceName: el.voiceSelect.value,
      rate: Math.min(2, Math.max(0.5, Number(el.rate.value) || 1)),
      volume: Math.min(1, Math.max(0, Number(el.volume.value) || 1)),
    };

    el.intervalSec.value = patch.intervalSec;
    el.rate.value = patch.rate;
    el.volume.value = patch.volume;

    await setSettings(patch);
    await sendToCurrentTab({ type: 'xreadout:update-settings', settings: patch });
  };

  ['change', 'input'].forEach((evt) => {
    el.enabled.addEventListener(evt, sync);
    el.intervalSec.addEventListener(evt, sync);
    el.voiceSelect.addEventListener(evt, sync);
    el.rate.addEventListener(evt, sync);
    el.volume.addEventListener(evt, sync);
  });

  el.readNowBtn.addEventListener('click', () => {
    sendToCurrentTab({ type: 'xreadout:read-now' });
  });
}

init();
