var currentChap = 1;

readCached();

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.active) {
    // console.log("background script run");
    // console.log(`currentChap = ${currentChap}`);
    // increaseCurrentChap();
    // setTimeout(() => {
    //   if (currentChap % 5 == 0) {
    //     clearAllStorage();
    //   }
    // }, 1000);

    // startScrapeNovel(1);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.message) {
    case 'scrapeContent':
      startScrapeNovel(currentChap);
      sendResponse({ });
      break;
    case 'clearAllStorage':
      clearAllStorage();
      sendResponse({ });
      break;
    case 'generateDownload':
      generateDownload();
      sendResponse({ });
      break;
  }

  // handle scrape content
  let chapContent = request.chapContent;
  if (chapContent) {
    let chapKey = 'chap-' + currentChap;
    chrome.storage.local.set({
      [chapKey]: chapContent
    }).then(() => {
      console.log(`${chapKey} was scraped`);
    });
    sendResponse({ success: true });
    setTimeout(() => {
      increaseCurrentChap();
    }, 500);
  }
});

async function startScrapeNovel(chapNo) {
  console.log(`background startScrapeNovel ${chapNo}`);
  // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //   chrome.tabs.sendMessage(tabs[0].id, { message: 'scrapeChapContent', chapNo }, response => {
  //     console.log('scrapeChapContent done');
  //   });
  // });

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
}

function increaseCurrentChap() {
  currentChap++;
  chrome.storage.local.set({
    currentChap: currentChap
  }).then(() => {
    console.log(`currentChap is set to ${currentChap}`);
  });
}

function clearAllStorage() {
  currentChap = 1;
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
  
  // chrome.runtime.sendMessage({ message: 'downloadContent', content: generatedContent }, response => {
  //   console.log('Received download OK');
  // });
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

  chrome.tabs.sendMessage(tab.id, {
      message: 'downloadContent',
            content: generatedContent
        });
}

// -------------------- Injected functions --------------------

function doScrapeChapContent(chapNo) {
  console.log(`call doScrapeChapContent ${chapNo}`);
  // Keep this function isolated - it can only call methods you set up in content scripts
  let textContent = document.documentElement.outerText;

  (async () => {
    const response = await chrome.runtime.sendMessage({chapContent: textContent});
    // do something with response here, not outside the function
    console.log(response);
  })();
}