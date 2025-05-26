(function () {
  const HIGHLIGHT_CLASS = "simple-page-text-highlighter-highlight";

  // --- Model (logic) functions ---
  function getIntersection(range1, range2) {
    const start =
      range1.compareBoundaryPoints(Range.START_TO_START, range2) < 0
        ? range2.startContainer
        : range1.startContainer;
    const startOffset =
      range1.compareBoundaryPoints(Range.START_TO_START, range2) < 0
        ? range2.startOffset
        : range1.startOffset;

    const end =
      range1.compareBoundaryPoints(Range.END_TO_END, range2) < 0
        ? range1.endContainer
        : range2.endContainer;
    const endOffset =
      range1.compareBoundaryPoints(Range.END_TO_END, range2) < 0
        ? range1.endOffset
        : range2.endOffset;

    if (
      range1.compareBoundaryPoints(Range.START_TO_END, range2) < 0 ||
      range1.compareBoundaryPoints(Range.END_TO_START, range2) > 0
    ) {
      return null; // No intersection
    }

    const intersection = document.createRange();
    intersection.setStart(start, startOffset);
    intersection.setEnd(end, endOffset);
    return intersection;
  }

  function hasHighlight(node) {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.classList.contains(HIGHLIGHT_CLASS)
    ) {
      return true;
    }
    if (node.parentNode) {
      return hasHighlight(node.parentNode);
    }
    return false;
  }

  function getTextNodesInRange(range) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          return range.intersectsNode(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      }
    );
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }
    return textNodes;
  }

  // --- UI (DOM) functions ---
  function showAlert(msg) {
    alert(msg);
  }

  function highlightRange(range) {
    const span = document.createElement("span");
    span.style.backgroundColor = "yellow";
    span.style.fontWeight = "bold";
    span.classList.add(HIGHLIGHT_CLASS);

    try {
      if (range.collapsed) return;
      range.surroundContents(span);
    } catch (e) {
      const textNodes = getTextNodesInRange(range);
      textNodes.forEach((textNode) => {
        const parent = textNode.parentNode;
        if (
          parent.classList &&
          parent.classList.contains(HIGHLIGHT_CLASS)
        ) {
          return;
        }
        const newNode = document.createElement("span");
        newNode.style.backgroundColor = "yellow";
        newNode.style.fontWeight = "bold";
        newNode.classList.add(HIGHLIGHT_CLASS);
        parent.replaceChild(newNode, textNode);
        newNode.appendChild(textNode);
      });
    }
  }

  function unhighlightRange(range) {
    const spans = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);
    spans.forEach((span) => {
      const spanRange = document.createRange();
      spanRange.selectNodeContents(span);
      const intersection = getIntersection(range, spanRange);
      if (!intersection) return;

      const selectedContent = intersection.cloneContents();
      const parent = span.parentNode;

      // Split the span into three parts: before, selected, and after
      const beforeRange = document.createRange();
      beforeRange.setStart(span, 0);
      beforeRange.setEnd(
        intersection.startContainer,
        intersection.startOffset
      );
      const beforeContent = beforeRange.cloneContents();

      const afterRange = document.createRange();
      afterRange.setStart(
        intersection.endContainer,
        intersection.endOffset
      );
      afterRange.setEnd(span, span.childNodes.length);
      const afterContent = afterRange.cloneContents();

      // Replace the original span with the split parts
      const fragment = document.createDocumentFragment();

      if (beforeRange.toString().trim()) {
        const beforeSpan = document.createElement("span");
        beforeSpan.className = HIGHLIGHT_CLASS;
        beforeSpan.style.backgroundColor = "yellow";
        beforeSpan.style.fontWeight = "bold";
        beforeSpan.appendChild(beforeContent);
        fragment.appendChild(beforeSpan);
      }

      fragment.appendChild(selectedContent);

      if (afterRange.toString().trim()) {
        const afterSpan = document.createElement("span");
        afterSpan.className = HIGHLIGHT_CLASS;
        afterSpan.style.backgroundColor = "yellow";
        afterSpan.style.fontWeight = "bold";
        afterSpan.appendChild(afterContent);
        fragment.appendChild(afterSpan);
      }

      parent.replaceChild(fragment, span);
    });
  }

  // --- Main controller ---
  function highlightSelectedText() {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();

      if (!selectedText) {
        showAlert("Please select some text to highlight or unhighlight!");
        return;
      }

      const isAlreadyHighlighted =
        hasHighlight(range.startContainer) || hasHighlight(range.endContainer);

      if (isAlreadyHighlighted) {
        unhighlightRange(range);
      } else {
        highlightRange(range);
      }

      selection.removeAllRanges();
    } else {
      showAlert("Please select some text to highlight or unhighlight!");
    }
  }

  highlightSelectedText();
})();