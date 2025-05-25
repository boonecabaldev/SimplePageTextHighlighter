// content.js

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