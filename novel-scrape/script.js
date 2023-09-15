// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.message == 'downloadContent') {
//     console.log('received the download request', request.content);
//     downloadDataAsText(request.content, 'novel.txt');
//     sendResponse({ message: 'OK' });
//   }
// });

// var downloadDataAsText = (function() {
//   var a = document.createElement("a");
//   document.body.appendChild(a);
//   a.style = "display: none";
//   return function(data, fileName) {
//     var blob = new Blob([data], {
//         type: "octet/stream"
//       }),
//       url = window.URL.createObjectURL(blob);
//     a.href = url;
//     a.download = fileName;
//     a.click();
//     window.URL.revokeObjectURL(url);
//     console.log(url);
//   };
// }());


// async function scrapeChapContent(chapNo) {
//   console.log(`call scrapeChapContent ${chapNo}`);
//   const tabs = await chrome.tabs.query({
//       active: true,
//       currentWindow: true
//     });
//   const tab = tabs[0];

//   function doScrapeChapContent() {
//     console.log(`call doScrapeChapContent ${chapNo}`);
//     // Keep this function isolated - it can only call methods you set up in content scripts
//     let textContent = document.documentElement.outerText;

//     let chapKey = 'chap-' + chapNo;
//     chrome.storage.local.set({
//       chapKey: textContent
//     }).then(() => {
//       console.log(`${chapKey} was scraped`);
//     });
//   }

//   chrome.scripting
//     .executeScript({
//       target: {
//         tabId: tab.id
//       },
//       func: doScrapeChapContent,
//     })
//     .then(() => console.log("injected the function doScrapeChapContent"));
// }