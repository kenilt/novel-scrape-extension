// The popup js is the script the run when click to open the extension popup.

window.onload = function() {
  requestCurrentStatus();
}

document.addEventListener('DOMContentLoaded', () => {
  // Hook up #check-1 button in popup.html
  document.querySelector('#btn-start-scrawl').addEventListener('click', async () => {
    let isScraping = document.querySelector('#scraping-status').textContent == 'scraping';
    if (isScraping) {
      requestPauseScraping();
    } else {
      requestScrapeThePage();
    }
  });

  // download
  document.querySelector('#btn-download').addEventListener('click', () => {
    downloadScrapedContent();
  });

  // clear all
  document.querySelector('#btn-clear-all').addEventListener('click', () => {
    requestClearStorage();
  });

  // next url
  document.querySelector('#next-chap-url').addEventListener('click', () => {
    chrome.tabs.create({url: document.querySelector('#next-chap-url').href});
  });
});


function requestScrapeThePage() {
  chrome.runtime.sendMessage({ message: 'scrapeContent' }, response => {
    console.log('scrapeContent responsed');
  });
}

function requestPauseScraping() {
  chrome.runtime.sendMessage({ message: 'pauseScraping' }, response => {
    console.log('pauseScraping responsed');
    setCurrentStatusFromResponse(response);
  });
}

function downloadScrapedContent() {
  chrome.runtime.sendMessage({ message: 'generateDownload' }, response => {});
}

function setCurrentStatusFromResponse(response) {
  console.log(response);
  document.querySelector('#scraped-chap-count').textContent = response.currentChap;
  let nextChapUrl = response.nextChapUrl;
  let scrapingStatus = (nextChapUrl && response.isScraping) ? 'scraping' : (nextChapUrl ? 'paused' : 'stopped');
  document.querySelector('#scraping-status').textContent = scrapingStatus;
  document.querySelector('#btn-start-scrawl').textContent = scrapingStatus == 'scraping' ? 'Pause scrape' : (nextChapUrl ? 'Resume scrape' : 'Start scrape');
  document.querySelector('#next-chap-url').textContent = nextChapUrl;
  document.querySelector('#next-chap-url').href = nextChapUrl;
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
