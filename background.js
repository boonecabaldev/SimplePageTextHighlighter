chrome.action.onClicked.addListener((tab) => {
  // Check if the tab has a valid URL (e.g., not chrome://newtab)
  if (tab.url && tab.url.startsWith('http')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: highlightSelectedText,
    });
  }
});

function highlightSelectedText() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();

    if (selectedText.length > 0) {
      const span = document.createElement('span');
      span.className = 'highlighter-class'; // This class will be defined in highlight.css
      span.textContent = selectedText;

      // Create a new range for the highlighted text
      range.deleteContents(); // Remove the original selected text
      range.insertNode(span); // Insert our new span with the text

      // Clear the selection so the highlight is visible without active selection
      selection.removeAllRanges();
    }
  }
}