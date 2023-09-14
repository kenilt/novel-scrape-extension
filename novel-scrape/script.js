// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.message == 'scrapeChapContent') {
//     scrapeChapContent(request.chapNo);
//     sendResponse({ message: 'done ' });
//   }
// });


async function scrapeChapContent(chapNo) {
  console.log(`call scrapeChapContent ${chapNo}`);
  const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
  const tab = tabs[0];

  function doScrapeChapContent() {
    console.log(`call doScrapeChapContent ${chapNo}`);
    // Keep this function isolated - it can only call methods you set up in content scripts
    let textContent = document.documentElement.outerText;

    let chapKey = 'chap-' + chapNo;
    chrome.storage.local.set({
      chapKey: textContent
    }).then(() => {
      console.log(`${chapKey} was scraped`);
    });
  }

  chrome.scripting
    .executeScript({
      target: {
        tabId: tab.id
      },
      func: doScrapeChapContent,
    })
    .then(() => console.log("injected the function doScrapeChapContent"));
}