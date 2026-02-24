const DEFAULT_SETTINGS = {
  enabled: true,
  rate: 1,
  volume: 1
};

let settings = { ...DEFAULT_SETTINGS };
const seen = new Set();

function normalizeText(text) {
  return (text || "").replace(/\s+/g, " ").trim();
}

function getTweetId(article) {
  const statusLink = article.querySelector("a[href*='/status/']");
  if (!statusLink) {
    return "";
  }
  const match = statusLink.getAttribute("href")?.match(/\/status\/(\d+)/);
  return match ? match[1] : "";
}

function extractTweetText(article) {
  const node = article.querySelector("div[data-testid='tweetText']");
  if (!node) {
    return "";
  }
  return normalizeText(node.innerText);
}

function speak(text) {
  if (!settings.enabled || !text) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = settings.rate;
  utterance.volume = settings.volume;
  window.speechSynthesis.speak(utterance);
}

function handleArticle(article) {
  const text = extractTweetText(article);
  if (!text) {
    return;
  }

  const id = getTweetId(article);
  const key = id || text;

  if (seen.has(key)) {
    return;
  }
  seen.add(key);

  if (document.hidden) {
    return;
  }

  speak(text);
  console.log("[X Pro Readout] New post:", text);
}

function scanExistingArticles() {
  document
    .querySelectorAll("article[data-testid='tweet']")
    .forEach((article) => handleArticle(article));
}

function startObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) {
          continue;
        }

        if (node.matches?.("article[data-testid='tweet']")) {
          handleArticle(node);
        }

        node
          .querySelectorAll?.("article[data-testid='tweet']")
          .forEach((article) => handleArticle(article));
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (loaded) => {
    settings = {
      enabled: Boolean(loaded.enabled),
      rate: Number(loaded.rate) || 1,
      volume: Number(loaded.volume) || 1
    };
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") {
    return;
  }

  if (changes.enabled) {
    settings.enabled = Boolean(changes.enabled.newValue);
  }
  if (changes.rate) {
    settings.rate = Number(changes.rate.newValue) || 1;
  }
  if (changes.volume) {
    settings.volume = Number(changes.volume.newValue) || 1;
  }
});

(function init() {
  loadSettings();
  scanExistingArticles();
  startObserver();
  console.log("[X Pro Readout] initialized");
})();
