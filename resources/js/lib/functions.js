

// From https://stackoverflow.com/a/4238971
function moveCaretToEnd(field) {
    const range = document.createRange();
    range.selectNodeContents(field);
    range.collapse(false);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}