(() => {
  const DEFAULT_SETTINGS = {
    enabled: true,
    intervalSec: 60,
    voiceName: '',
    rate: 1,
    volume: 1,
  };

  let settings = { ...DEFAULT_SETTINGS };
  let checkTimer = null;
  const seenIds = new Set();

  function isHomePage() {
    return /^\/(home)(\/)?/.test(window.location.pathname);
  }

  function isFollowingSelected() {
    const tab = Array.from(document.querySelectorAll('[role="tab"]')).find((node) => {
      const text = (node.textContent || '').trim().toLowerCase();
      return text.includes('following') || text.includes('正在关注');
    });

    if (!tab) return false;
    return tab.getAttribute('aria-selected') === 'true';
  }

  function ensureFollowingTab() {
    if (isFollowingSelected()) return true;

    const tab = Array.from(document.querySelectorAll('[role="tab"]')).find((node) => {
      const text = (node.textContent || '').trim().toLowerCase();
      return text.includes('following') || text.includes('正在关注');
    });

    if (tab) {
      tab.click();
      return true;
    }

    return false;
  }

  function getStatusId(article) {
    const link = article.querySelector('a[href*="/status/"]');
    const href = link?.getAttribute('href') || '';
    const match = href.match(/status\/(\d+)/);
    return match?.[1] || '';
  }

  function getTweetText(article) {
    const textNode = article.querySelector('[data-testid="tweetText"]');
    return (textNode?.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function getLatestUnseenTweet() {
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    for (const article of tweets) {
      const id = getStatusId(article);
      const text = getTweetText(article);
      if (!id || !text) continue;
      if (seenIds.has(id)) continue;
      seenIds.add(id);
      return { id, text };
    }
    return null;
  }

  function speak(text) {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.rate;
    utterance.volume = settings.volume;

    if (settings.voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.name === settings.voiceName);
      if (voice) utterance.voice = voice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function readLatest() {
    if (!isHomePage()) return;
    ensureFollowingTab();
    const latest = getLatestUnseenTweet();
    if (latest) {
      speak(latest.text);
      console.log('[xreadout] read:', latest.id, latest.text);
    }
  }

  function findNewPostsBanner() {
    const candidates = Array.from(
      document.querySelectorAll('button, [role="button"], a[role="link"]')
    );

    const pattern =
      /(show|view|see).*(new|posts|post)|new posts|new post|查看|显示|新动态|新贴文|新推文|最新消息/i;

    return candidates.find((node) => {
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return false;
      if (!pattern.test(text)) return false;
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  }

  function clickNewPostsBanner() {
    const banner = findNewPostsBanner();
    if (!banner) return false;
    banner.click();
    return true;
  }

  function scheduleRefresh() {
    if (checkTimer) clearInterval(checkTimer);
    if (!settings.enabled) return;

    const interval = Math.max(15, settings.intervalSec) * 1000;
    checkTimer = window.setInterval(() => {
      if (!isHomePage()) return;
      ensureFollowingTab();
      const clicked = clickNewPostsBanner();
      if (clicked) {
        setTimeout(readLatest, 1200);
      }
    }, interval);
  }

  function observeTweets() {
    const timeline = document.querySelector('main');
    if (!timeline) return;

    const observer = new MutationObserver(() => {
      if (!settings.enabled) return;
      if (!isFollowingSelected()) return;
      readLatest();
    });

    observer.observe(timeline, { childList: true, subtree: true });
  }

  function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULT_SETTINGS, (data) => {
        settings = data;
        resolve();
      });
    });
  }

  async function init() {
    await loadSettings();
    scheduleRefresh();
    observeTweets();

    if (isHomePage()) {
      ensureFollowingTab();
      setTimeout(readLatest, 2500);
    }
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'xreadout:update-settings') {
      settings = { ...settings, ...message.settings };
      scheduleRefresh();
    }

    if (message?.type === 'xreadout:read-now') {
      readLatest();
    }
  });

  init();
})();
