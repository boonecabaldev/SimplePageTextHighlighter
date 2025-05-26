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