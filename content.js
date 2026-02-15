// Dynamically load compromise from CDN
function loadCompromise(callback) {
  if (window.nlp) {
    callback();
    return;
  }

  const script = document.createElement("script");
  script.src = "https://unpkg.com/compromise@latest/builds/compromise.min.js";
  script.onload = function () {
    console.log("Compromise loaded");
    callback();
  };
  document.head.appendChild(script);
}

chrome.runtime.onMessage.addListener(function (request) {

  if (request.action === "HIGHLIGHT") {
    loadCompromise(highlightPage);
  }

  if (request.action === "CLEAR") {
    clearHighlights();
  }

});

function highlightPage() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {

    if (!node.nodeValue.trim()) continue;

    const parent = node.parentNode;
    if (!parent || parent.tagName === "SCRIPT" || parent.tagName === "STYLE") continue;

    const words = node.nodeValue.split(/(\s+)/);
    const fragment = document.createDocumentFragment();

    words.forEach(word => {
      if (word.trim().length === 0) {
        fragment.appendChild(document.createTextNode(word));
        return;
      }

      const doc = window.nlp(word);
      let span = null;

      if (doc.has("#Noun")) {
        span = createSpan(word, "pos-noun");
      } else if (doc.has("#Verb")) {
        span = createSpan(word, "pos-verb");
      } else if (doc.has("#Adjective")) {
        span = createSpan(word, "pos-adj");
      }

      if (span) {
        fragment.appendChild(span);
      } else {
        fragment.appendChild(document.createTextNode(word));
      }
    });

    parent.replaceChild(fragment, node);
  }
}

function createSpan(text, className) {
  const span = document.createElement("span");
  span.textContent = text;
  span.className = className;
  return span;
}

function clearHighlights() {
  document.querySelectorAll(".pos-noun, .pos-verb, .pos-adj").forEach(span => {
    const text = document.createTextNode(span.textContent);
    span.parentNode.replaceChild(text, span);
  });
}
