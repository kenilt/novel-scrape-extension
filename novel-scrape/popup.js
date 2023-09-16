// The popup js is the script the run when click to open the extension popup.

window.onload = function() {
  requestCurrentStatus();
}

document.addEventListener('DOMContentLoaded', () => {
  // Hook up #check-1 button in popup.html
  document.querySelector('#btn-start-scrawl').addEventListener('click', async () => {
    requestScrapeThePage();
  });

  // clear all
  document.querySelector('#btn-download').addEventListener('click', () => {
    downloadScrapedContent();
  });

  // clear all
  document.querySelector('#btn-clear-all').addEventListener('click', () => {
    requestClearStorage();
  });
});


function requestScrapeThePage() {
  chrome.runtime.sendMessage({ message: 'scrapeContent' }, response => {
    console.log('scrapeContent responsed');
  });
}

var downloadDataAsText = (function() {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function(data, fileName) {
    var blob = new Blob([data], {
        type: "octet/stream"
      }),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    console.log(url);
  };
}());

function downloadScrapedContent() {
  chrome.runtime.sendMessage({ message: 'generateDownload' }, response => {});
}

function setCurrentStatusFromResponse(response) {
  console.log(response);
  document.querySelector('#scraped-chap-count').textContent = response.currentChap;
  let nextChapUrl = response.nextChapUrl;
  document.querySelector('#scraping-status').textContent = nextChapUrl ? 'scraping' : 'stopped';
  document.querySelector('#next-chap-url').textContent = nextChapUrl;
}

function requestCurrentStatus() {
  chrome.runtime.sendMessage({ message: 'currentStatus' }, response => {
    setCurrentStatusFromResponse(response);
  });
}

function requestClearStorage() {
  chrome.runtime.sendMessage({ message: 'clearAllStorage' }, response => {
    setCurrentStatusFromResponse(response);
    console.log('Storage was cleared!');
  });
}
