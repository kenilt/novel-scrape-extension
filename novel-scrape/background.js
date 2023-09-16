// background script is the script that keep the instance when the extension was start enable into chrome

var currentChap = 1;
var nextChapUrl = null;
var lastChapContent = null;

// read the cached values when the extension was enabled
readCached();

// Run the logic every time the page was loaded
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.active) {
    // Only scrape page when has nextChapUrl and the current tap is what we expected.
    if (nextChapUrl && tab.url && tab.url.startsWith(nextChapUrl)) {
      console.log('Continue scrape novel');

      // start scrape content after a random time [5s-15s], waiting for all stuff loaded, included some chapter list
      let waitingTime = 5000 + Math.floor(Math.random() * 100) * 100;
      console.log(`Waiting for ${waitingTime}ms before scrape then go to next chap.`);
      setTimeout(() => {
        startScrapeNovel(currentChap);
      }, waitingTime);
    }
  }
});

// This function listen on request come from the popup or the content js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.message) {
    case 'currentStatus':
      sendResponse({ currentChap: currentChap, nextChapUrl: nextChapUrl });
      break;
    case 'scrapeContent':
      startScrapeNovel(currentChap);
      sendResponse({ });
      break;
    case 'gotContent': {
      // handle scrape content
      let chapContent = request.chapContent;
      if (chapContent) {
        // prevent duplicated content
        if (chapContent != lastChapContent) {
          let chapKey = 'chap-' + currentChap;
          chrome.storage.local.set({
            [chapKey]: chapContent
          }).then(() => {
            lastChapContent = chapContent;
            console.log(`${chapKey} was scraped`);
          });
        }

        // next chap url
        let chapUrl = request.nextChapUrl;
        setNextChapUrl(chapUrl);

        // reponse
        sendResponse({ success: true });
        setTimeout(() => {
          increaseCurrentChap();
        }, 500);
      }
      break;
    }
    case 'gotContentFailed': {
      setNextChapUrl(null);
      sendResponse({ });
      break;
    }
    case 'clearAllStorage':
      clearAllStorage();
      sendResponse({ currentChap: currentChap, nextChapUrl: nextChapUrl });
      break;
    case 'generateDownload':
      generateDownload();
      sendResponse({ });
      break;
  }
});

async function startScrapeNovel(chapNo) {
  console.log(`background startScrapeNovel ${chapNo}`);

  const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
  const tab = tabs[0];

  if (!tab || !tab.id) {
    setNextChapUrl(null);
    console.log("Can not found active tab");
    return;
  }

  chrome.scripting
    .executeScript({
      target: {
        tabId: tab.id
      },
      args: [chapNo],
      func: doScrapeChapContent,
    })
    .then(() => console.log("injected the function doScrapeChapContent"));
}

function readCached() {
  chrome.storage.local.get(["currentChap"]).then((result) => {
    let resultValue = result.currentChap;
    if (typeof resultValue === 'number' && !Number.isNaN(resultValue)) {
      currentChap = resultValue;
    } else {
      currentChap = 1;
    }
    console.log('readCached: currentChap = ', currentChap);
  });
  chrome.storage.local.get(["nextChapUrl"]).then((result) => {
    nextChapUrl = result.nextChapUrl;
    console.log('readCached: nextChapUrl = ', nextChapUrl);
  });
}

function increaseCurrentChap() {
  currentChap++;
  chrome.storage.local.set({
    currentChap: currentChap
  }).then(() => {
    console.log(`currentChap is set to ${currentChap}`);
  });
}

function setNextChapUrl(chapUrl) {
  nextChapUrl = chapUrl;
  chrome.storage.local.set({
    nextChapUrl: nextChapUrl
  }).then(() => {
    console.log(`nextChapUrl is set to ${nextChapUrl}`);
  });
}

function clearAllStorage() {
  currentChap = 1;
  nextChapUrl = null;
  lastChapContent = null;

  chrome.storage.local.clear(function() {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    }
    // do something more
  });
  chrome.storage.sync.clear(); // callback is optional
  console.log("Cleared all storage");
}

async function generateDownload() {
  let generatedContent = '';
  for (let i = 1; i <= currentChap; i++) {
    let chapKey = `chap-${i}`;
    let chapResult = await chrome.storage.local.get([chapKey]);
    let chapResultValue = chapResult[chapKey];
    if (chapResultValue && chapResultValue.length > 0) {
      generatedContent = generatedContent.concat(chapResultValue.concat('\n\f\n'));
    }
  }

  requestDownloadContent(generatedContent);
}


async function requestDownloadContent(generatedContent) {
  console.log('requestDownloadContent');
  const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
  const tab = tabs[0];

  if (!tab || !tab.id) {
    console.log("Can not found active tab");
    return;
  }

  chrome.scripting
    .executeScript({
      target: {
        tabId: tab.id
      },
      args: [generatedContent],
      func: injectDownloadNovelAsText,
    })
    .then(() => console.log("injected the function injectDownloadNovelAsText"));
}

// -------------------- Injected functions --------------------
// These functions was injected to the content of webpages, so they can not interact with the functions was defined above.
// Keep these function isolated - it can only call methods you set up in content scripts

// These logic are only works for the tangthuvien, when switch to another site, edit this function
function doScrapeChapContent(chapNo) {
  console.log(`call doScrapeChapContent ${chapNo}`);

  function getTotalChap() {
    try {
      var nextOnClickName = document.getElementsByClassName('bot-next_chap')[0].getAttribute('onclick');
      var totalChap = nextOnClickName.replace('NextChap(\'', '').replace('\');', '');
      return parseInt(totalChap);
    }
    catch(err) {
      return 0;
    }
  }

  // this function was copy from the source site with some modify, if it not work, open the source site then copy the new one
  function getNextChapUrl(total, numberOfChap) {
    try {
      var current = document.querySelector('.middle-box li.active');
      var current_id = parseInt(current.getAttribute('title'));
      total = parseInt(total);
      var total_tmp = document.querySelector('.middle-box li:last-child').getAttribute('title');
      total_tmp = parseInt(total_tmp);
      if (total_tmp > total) {
        total = total_tmp;
      }
      if (current_id < total) {
        var next_id = current_id + numberOfChap;
        var url_link = document.querySelector('.link-chap-' + next_id).getAttribute('href');
        return url_link.trim();
      } else {
        return null;
      }
    }
    catch(err) {
      return null;
    }
  }

  let chapContent = '';

  let boxChapElements = document.getElementsByClassName('box-chap');
  for(let i = 0; i < boxChapElements.length; i++) {
    chapContent = chapContent.concat(boxChapElements[i].outerText);
    if (i < boxChapElements.length - 1) {
      chapContent = chapContent.concat('\n\f\n');
    }
  }

  if (chapContent && chapContent.length > 100) {
    let nextChapUrl = getNextChapUrl(getTotalChap(), boxChapElements.length);
    (async () => {
      const response = await chrome.runtime.sendMessage({message: 'gotContent', chapContent: chapContent, nextChapUrl: nextChapUrl});
      // do something with response here, not outside the function
      console.log(response);
    })();

    if (nextChapUrl && nextChapUrl.length > 10) {
      // Go to next URL after 500 ms
      let waitingTime = 1000 + Math.floor(Math.random() * 100) * 100;
      setTimeout(() => {
        window.location.href = nextChapUrl;
      }, 500);
    } else {
      alert('Scrape tool: Not found the next chapter URL!');
    }
  } else {
    (async () => {
      const response = await chrome.runtime.sendMessage({message: 'gotContentFailed', chapContent: chapContent});
      // do something with response here, not outside the function
      console.log(response);
    })();
    alert('Scrape tool: Can not get the chap content!!!');
  }
}

// The download function can works for any sites
function injectDownloadNovelAsText(novelContent) {
  var downloadNovelAsText = downloadNovelAsText ?? (function() {
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

  downloadNovelAsText(novelContent, 'novel.txt');
}
