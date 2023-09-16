# novel-scrape-extension
A simple novel scrape extension that was designed to scrape a specific site

## Install the extension

Clone the extension to your disk  
Then open the Chrome extensions page -> Load unpackaged  
To view the background logs: Click on the service worker  
To view the content script / injected scrip: Open the website console tab  
To view the popup js log: Right-click on the extension -> Inspect Popup  

## To run the extension

Open the novel page, and click on start scrape to start scrape page. But remember to clear all the cache before scraping a new novel.  
Click on the download button to download the generated `novel.txt` after scraping.  
To resume the novel scrap after failing, open the chapter we need, and click on start scrape again.  

## Format the result

After downloading the novel.txt from the extension, use the word to edit the result

1. Copy the novel.txt to the world file
2. Replace `^p^m` with `^l^m` (optional, however, need to use the special character from Word, as typing does not work)
3. Replace `^p^p^t` with `^l` (need to use the special character from word)
4. Highlight the chapter title, Find `Chương *^l` then replace it with `Heading 2 char` format, remember to tick on use wildcards (Need to insert `^l` from specials)
5. Save the Word file
6. Chose References -> Table of contents then insert the table of contents

Then use the Calibre to convert the word file to epub.
