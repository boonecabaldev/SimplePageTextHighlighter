/**
 * @jest-environment jsdom
 */

// Copy of the HighlighterModel from content.js for testing
const HIGHLIGHT_CLASS = "simple-page-text-highlighter-highlight";

const HighlighterModel = {
  getIntersection(range1, range2) {
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
  },

  hasHighlight(node) {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.classList.contains(HIGHLIGHT_CLASS)
    ) {
      return true;
    }
    if (node.parentNode) {
      return HighlighterModel.hasHighlight(node.parentNode);
    }
    return false;
  },

  getTextNodesInRange(range) {
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
  },
};

describe('HighlighterModel', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="root">
        <span>hello </span>
        <span class="${HIGHLIGHT_CLASS}">world</span>
        <div>foo <b>bar</b> baz</div>
      </div>
    `;
  });

  test('hasHighlight returns true for highlighted element', () => {
    const highlighted = document.querySelector(`.${HIGHLIGHT_CLASS}`);
    expect(HighlighterModel.hasHighlight(highlighted)).toBe(true);
  });

  test('hasHighlight returns true for child of highlighted element', () => {
    const highlighted = document.querySelector(`.${HIGHLIGHT_CLASS}`);
    const textNode = highlighted.firstChild;
    expect(HighlighterModel.hasHighlight(textNode)).toBe(true);
  });

  test('hasHighlight returns false for non-highlighted element', () => {
    const nonHighlighted = document.querySelector('span:not(.' + HIGHLIGHT_CLASS + ')');
    expect(HighlighterModel.hasHighlight(nonHighlighted)).toBe(false);
  });

  test('getIntersection returns correct range for overlapping ranges', () => {
    const text1 = document.querySelector('span').firstChild; // "hello "
    const text2 = document.querySelectorAll('span')[1].firstChild; // "world"

    const range1 = document.createRange();
    range1.setStart(text1, 2); // "llo "
    range1.setEnd(text2, 3);   // "wor"

    const range2 = document.createRange();
    range2.setStart(text2, 1); // "orld"
    range2.setEnd(text2, 5);   // "world"

    const intersection = HighlighterModel.getIntersection(range1, range2);
    expect(intersection).not.toBeNull();
    expect(intersection.toString()).toBe("or");
  });

  test('getIntersection returns null for non-overlapping ranges', () => {
    const text1 = document.querySelector('span').firstChild; // "hello "
    const text2 = document.querySelectorAll('span')[1].firstChild; // "world"

    const range1 = document.createRange();
    range1.setStart(text1, 0);
    range1.setEnd(text1, 2); // "he"

    const range2 = document.createRange();
    range2.setStart(text2, 0);
    range2.setEnd(text2, 2); // "wo"

    const intersection = HighlighterModel.getIntersection(range1, range2);
    expect(intersection).toBeNull();
  });

  test('getTextNodesInRange returns correct text nodes', () => {
    const text1 = document.querySelector('span').firstChild; // "hello "
    const text2 = document.querySelectorAll('span')[1].firstChild; // "world"

    const range = document.createRange();
    range.setStart(text1, 0);
    range.setEnd(text2, 2);

    const nodes = HighlighterModel.getTextNodesInRange(range);
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(nodes.map(n => n.textContent).join('')).toContain('hello ');
  });
});