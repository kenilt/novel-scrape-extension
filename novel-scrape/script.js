// The content script is the script that will run on the content of the page

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