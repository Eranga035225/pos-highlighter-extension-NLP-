function sendMessage(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: action });
  });
}

document.getElementById("highlight").addEventListener("click", function () {
  sendMessage("HIGHLIGHT");
});

document.getElementById("clear").addEventListener("click", function () {
  sendMessage("CLEAR");
});
