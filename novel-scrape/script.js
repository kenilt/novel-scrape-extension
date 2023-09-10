document.addEventListener('DOMContentLoaded', () => {
    // Hook up #check-1 button in popup.html
    const btnStartCrawl = document.querySelector('#btn-start-scrawl');
    btnStartCrawl.addEventListener('click', async () => {
        // Get the active tab
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];

        chrome.scripting
            .executeScript({
              target : {tabId : tab.id},
              func : scrapeThePage,
            })
            .then(() => console.log("injected the function scrapeThePage"));
    });
});

function scrapeThePage() {
    // Keep this function isolated - it can only call methods you set up in content scripts
    // Need to put save data here, put outside this function, it will not work
    var saveData = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function (data, fileName) {
            var blob = new Blob([data], {type: "octet/stream"}),
                url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());


    var textContent = document.documentElement.outerText;
    // console.log(textContent);
    // alert(textContent);

    var fileName = document.getElementById('input-novel-name').value + '.txt';

    saveData(textContent, fileName);
}



// saveData(data, fileName);

