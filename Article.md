# How to Rapidly Build Browser Extensions With Google Gemini Coding Partner

Here is the `README.MD` I made for the project:

```markdown
# Browser Extension - Simple Page Text Highlighter

## Features

- Custom bullseye Browser-Action icon
- Highlights any text you have selected on the webpage
```

I copied/pasted this into Google Gemini Coding Partner a lot. Most important, three files all extensions should have: `background.js`, `content.js`, and `manifest.json`. It recommended the following project file structure for this extension. Create a `HighlighterExtension` folder and add the following placeholder files:

```text
HighlighterExtension/
├── manifest.json
├── background.js
├── content.js 
└── icons/
    ├── icon16.png
    ├── icon64.png
    └── icon128.png
```

> I went to [flaticon](https://www.flaticon.com/free-icons/bullseye) and downloaded some png files to use for the Browser-Action extension icon.

It recommended the following files:

`manifest.json`

```json
{
  "manifest_version": 3,
  "name": "Simple Page Text Highlighter",
  "version": "1.0",
  "description": "Highlights any text you have selected on the webpage.",
  "permissions": [
    "activeTab",
    "scripting"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_icon": "icons/icon128.png",
    "default_title": "Highlight Selected Text"
  },
  "icons": {
    "128": "icons/icon128.png"
  }
}
```

`background.js`

```javascript
chrome.action.onClicked.addListener((tab) => {
  // Execute the content.js script on the current active tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  })
    .then(() => {
      console.log('Content script injected successfully!');
    })
    .catch(err => {
      console.error('Failed to inject content script:', err);
    });
});
```

`content.js`

```javascript
(function() {
  function highlightSelectedText() {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.backgroundColor = 'yellow'; // You can change this color
      span.style.fontWeight = 'bold'; // Add some styling, if you like

      // Wrap the selected content with the span
      range.surroundContents(span);

      // Clear the selection after highlighting
      selection.removeAllRanges();
    } else {
      alert('Please select some text to highlight!');
    }
  }

  // Execute the highlight function
  highlightSelectedText();
})();
```

All I did was copy and paste this code into my IDE, saved it, then installed it. Gemini recommended the following procedure for this:

> ### How to Install and Test Your Extension
>
>Now that you have all the files, let's load it into your browser!
>
>1. Open Chrome: Go to `chrome://extensions` in your browser.
>2. Enable Developer Mode: In the top right corner, toggle on Developer mode.
>3. Load Unpacked: Click the Load unpacked button that appears.
>4. Select Your Extension Folder: Navigate to and select the HighlighterExtension folder you >created.
>5. **Test It Out**:
>
>    * Open any webpage (e.g., google.com).
>    * Select some text with your mouse.
>    * Click the bullseye icon (or whatever icon you used) in your browser's toolbar.
>    * The selected text should now be highlighted in yellow!
