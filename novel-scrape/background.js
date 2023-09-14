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
      generateDownload(sendResponse);
      return true; // keep the message connect alive until received the response
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

  if (!tab.id) {
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

function generateDownload(sendResponse) {
  continueGenerateDownloadContent(sendResponse, '', 1);
}

function continueGenerateDownloadContent(sendResponse, generatedContent, chapNo) {
  if (chapNo > currentChap) {
    console.log('generatedContent', generatedContent);
    sendResponse({ content: generatedContent });
    return;
  }
  let chapKey = `chap-${chapNo}`;
  chrome.storage.local.get([chapKey]).then((result) => {
    let chapContent = result[chapKey];
    if (chapContent && chapContent.length > 0) {
      generatedContent = generatedContent.concat(chapContent.concat('\n\f\n'));
    }
    continueGenerateDownloadContent(sendResponse, generatedContent, chapNo + 1);
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