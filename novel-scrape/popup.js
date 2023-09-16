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

function requestClearStorage() {
  chrome.runtime.sendMessage({ message: 'clearAllStorage' }, response => {
    console.log('Storage was cleared!');
  });
}