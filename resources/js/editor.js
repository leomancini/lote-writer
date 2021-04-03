function getSelectionData(field) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    let caretPosition;

    // If no text is selected
    if (range.startOffset === range.endOffset) {
        selection.modify('extend', 'backward', 'documentboundary');
        caretPosition = selection.toString().length;
        if (selection.anchorNode != undefined) { selection.collapseToEnd(); }
    }

    const selectionData = {
        field,
        element: selection.anchorNode.parentElement,
        selection,
        caretPosition,
        range,
        start: range.startOffset,
        end: range.endOffset,
        isCaretAtStartOfLine: (range.startOffset && range.endOffset) === 0,
        isCaretAtEndOfLine: range.startOffset === selection.anchorNode.parentElement.textContent.length,
        isTextSelected: range.startOffset !== range.endOffset,
        value: selection.toString(),
        boundingClientRect: selection.getRangeAt(0).getBoundingClientRect()
    };

    return selectionData;
}

function renderTextAccessory(selectionData) {
    removeTextAccessory();

    const textAccessory = document.createElement('div');
    textAccessory.classList = 'textAccessory';

    const textAccessoryOptions = [
        {
            title: 'CORRECT'
        },
        {
            title: 'ADD TRANSLATION'
        },
        {
            title: 'SOMETHING ELSE'
        }
    ];

    const textAccessoryOptionDimensions = {
        width: 50
    };

    const textAccessoryDimensions = {
        width: textAccessoryOptions.length * textAccessoryOptionDimensions.width,
        height: 50
    };

    const textAccessoryPosition = {
        left: selectionData.boundingClientRect.left
                + (selectionData.boundingClientRect.width / 2)
                - (textAccessoryDimensions.width / 2),
        top: selectionData.field.closest('.lineWrapper').offsetHeight
    }

    textAccessory.style.width = `${textAccessoryDimensions.width}px`;
    textAccessory.style.height = `${textAccessoryDimensions.height}px`;

    textAccessory.style.left = `${textAccessoryPosition.left}px`;
    textAccessory.style.top = `${textAccessoryPosition.top}px`;

    textAccessoryOptions.map((textAccessoryOption) => {
        const textAccessoryOptionElement = document.createElement('div');
        textAccessoryOptionElement.classList = 'textAccessoryOption';
        textAccessoryOptionElement.style.width = `${textAccessoryOptionDimensions.width}px`

        const textAccessoryOptionIcon = document.createElement('div');
        textAccessoryOptionIcon.classList = 'textAccessoryOptionIcon';

        textAccessoryOptionIcon.onclick = (click) => {
            addAnnotation(selectionData);
            
            removeTextAccessory();
        }

        textAccessoryOptionElement.appendChild(textAccessoryOptionIcon);
        textAccessory.appendChild(textAccessoryOptionElement);
    });

    selectionData.field.closest('.lineWrapper').appendChild(textAccessory);
}

function addAnnotation(selectionData) {
    // Add annotated background on line input
    const range = selectionData.range;
    const rangeTextValue = range.extractContents();
    const annotatedRangeElement = document.createElement('span');
    annotatedRangeElement.classList = 'annotated';

    const annotatedNoteElement = document.createElement('div');
    annotatedNoteElement.classList = 'annotatedNote';

    const annotatedNoteText = document.createElement('span');
    annotatedNoteText.classList = 'annotatedNoteText';
    annotatedNoteElement.appendChild(annotatedNoteText);

    annotatedRangeElement.appendChild(annotatedNoteElement);
    annotatedRangeElement.appendChild(rangeTextValue);
    range.insertNode(annotatedRangeElement);

    updatePage(selectionData.field.closest('.page'));
}

function removeTextAccessory() {
    if (document.querySelector('.textAccessory')) {
        document.querySelector('.textAccessory').remove();
    }
}

function removeSelectionBackground(selectionData) {
    if(selectionData.field.closest('.lineWrapper').querySelector('.selectionBackground')) {
        selectionData.field.closest('.lineWrapper').querySelector('.selectionBackground').remove();
    }
}

function drawSelectionBackground(selectionData) {
    removeSelectionBackground(selectionData);
    
    const selectionBackground = document.createElement('div');
    selectionBackground.classList = 'selectionBackground';

    selectionBackground.style.width = `${selectionData.boundingClientRect.width}px`;
    selectionBackground.style.height = `${selectionData.boundingClientRect.height}px`;

    selectionBackground.style.left = `${selectionData.boundingClientRect.left}px`;

    selectionData.field.closest('.lineWrapper').appendChild(selectionBackground);
}

function showTranslationLine(lineWrapperElement, translationLineInput, parentPageElement) {
    lineWrapperElement.classList.add('withTranslationLine');

    translationLineInput.classList.remove('hidden');
    translationLineInput.focus();

    updatePage(parentPageElement);
}

function hideTranslationLine(lineWrapperElement, translationLineInput, parentPageElement) {
    lineWrapperElement.classList.remove('withTranslationLine');
    
    translationLineInput.innerText = '';
    translationLineInput.classList.add('hidden');

    updatePage(parentPageElement);  
}

function insertlineInput(params) {
    const parentPageElement = params.parentPageElement;

    const lineWrapperElement = document.createElement('div');
    lineWrapperElement.classList = 'lineWrapper';

    if (params.data && params.data.translation && params.data.translation !== '') {
        lineWrapperElement.classList.add('withTranslationLine');
    }

    const lineBackgroundElement = document.createElement('div');
    lineBackgroundElement.classList = 'lineBackground';

    const lineInput = document.createElement('div');
    lineInput.setAttribute('contenteditable', true);
    lineInput.setAttribute('spellcheck', 'false'); // TODO: Make this configurable by user in settings
    lineInput.classList = 'lineInput';

    if (params.data && params.data.content && params.data.content !== '') {
        lineInput.innerHTML = params.data.content;
    }

    lineInput.onkeyup = (keyup) => {
        const selection = getSelectionData(lineInput);

        if (lineInput.innerText !== '') {
            lineWrapperElement.classList.add('filled');
        }

        if (selection.element.classList.contains('annotatedNoteText')) {
            if (parseInt(selection.element.dataset.lineHeight) !== selection.element.clientHeight) {
                selection.element.closest('.annotatedNote').style.marginTop = `${(selection.element.clientHeight * -1) - 16}px`; // This forumla has to match CSS
            }
        } 

        updatePageDebounced(parentPageElement);
    }

    lineInput.onkeydown = (keydown) => {
        const selection = getSelectionData(lineInput);

        removeTextAccessory();
        
        // TODO: Do something to prevent lines from wrapping
        // Maybe create a new line and put the overflow into the new line

        if (selection.element.classList.contains('annotatedNoteText')) {   
            selection.element.dataset.lineHeight = selection.element.clientHeight;
        } else if (selection.element.classList.contains('annotated')) {
            if (!keydown.metaKey && keydown.key !== 'Backspace') {
                if (selection.start === selection.element.innerText.length) {
                    keydown.preventDefault();
    
                    const zeroWidthSpaceCharacter = document.createTextNode('\u200B');
                    insertAfter(selection.element, zeroWidthSpaceCharacter);
    
                    setCaretPosition({
                        field: lineInput,
                        position: selection.caretPosition + 1
                    });
    
                    const character = document.createTextNode(keydown.key);
                    insertAfter(selection.element, character);
                }
            }
        }

        if (keydown.key === 'Enter') {
            keydown.preventDefault();
            const delayToInsertlineInput = 100; // This is mostly to give time for the macOS IME window to clear

            if (selection.isCaretAtStartOfLine) {
                setTimeout(function() {
                    insertlineInput({
                        parentPageElement: params.parentPageElement,
                        position: {
                            before: lineWrapperElement
                        }
                    });

                    lineInput.focus();
                }, delayToInsertlineInput);
            } else if (selection.isCaretAtEndOfLine) {
                setTimeout(function() {
                    insertlineInput({
                        parentPageElement: params.parentPageElement,
                        position: {
                            after: lineWrapperElement
                        }
                    });
                }, delayToInsertlineInput);
            } else {
                // TODO: If in the middle of a line, break the line and put stuff to the right on a new line???
            }
        } else if (keydown.key === 'Backspace') {
            if (selection.start === 0) {
                if (lineWrapperElement.previousElementSibling) {
                    const previousLineInput = lineWrapperElement.previousElementSibling.querySelector('.lineInput');
                    
                    previousLineInput.focus();

                    if (previousLineInput.textContent !== '') {
                        keydown.preventDefault();

                        setCaretPosition({
                            field: previousLineInput,
                            position: 'END'
                        });
                    }
                }
                
                if (lineInput.textContent === '') {
                    if (parentPageElement.dataset.numberOfLines > 1) {
                        lineWrapperElement.remove();
                        parentPageElement.dataset.numberOfLines--;
                    }
                }
            }
        // TODO: Figure out if pressing arrow keys should focus translation lines as well?
        } else if (keydown.key === 'ArrowUp') {
            if (lineWrapperElement.previousElementSibling) {
                lineWrapperElement.previousElementSibling.querySelector('.lineInput').focus();
            }
        } else if (keydown.key === 'ArrowDown') {
            if (lineWrapperElement.nextElementSibling) {
                lineWrapperElement.nextElementSibling.querySelector('.lineInput').focus();
            }
        } else if (keydown.key === 'ArrowRight') {
            if (selection.caretPosition === lineInput.textContent.length) {
                if (lineWrapperElement.nextElementSibling) {
                    lineWrapperElement.nextElementSibling.querySelector('.lineInput').focus();
                    keydown.preventDefault();
                }
            }
        }
    }

    lineInput.onblur = (blur) => {
        blur.preventDefault();
    }

    lineWrapperElement.onmouseout = (mouseout) => {
        // After hovering over an annotation, if the next element hovered over is the note, don't hide the note
        if (mouseout.toElement) {
            if (mouseout.toElement.classList.contains('annotated')) {
                mouseout.fromElement.classList.add('hover');
            } else {
                mouseout.fromElement.classList.remove('hover');
            }
        }
    }

    lineWrapperElement.onmouseup = (mouseup) => {
        const selectionData = getSelectionData(lineInput);
        
        if (selectionData.isTextSelected) {
            if (selectionData.element.classList.contains('lineInput')) {
                renderTextAccessory(selectionData);
            }
        } else {
            if (!mouseup.target.classList.contains('textAccessoryOptionIcon')) {
                removeTextAccessory();
            }
        }
    }

    lineBackgroundElement.onclick = (click) => {
        lineInput.focus();
        
        if (click.clientX > lineInput.offsetLeft + lineInput.offsetWidth) {
            setCaretPosition({
                field: lineInput,
                position: 'END'
            });
        }
    }
    
    const addTranslationLineButton = document.createElement('button');
    addTranslationLineButton.classList = 'addTranslationLineButton';

    addTranslationLineButton.onclick = (click) => {
        if (lineWrapperElement.classList.contains('withTranslationLine')) {
            if (translationLineInput.innerText === '') {
                hideTranslationLine(lineWrapperElement, translationLineInput, parentPageElement);  
            } else {
                const confirmDelete = confirm('Are you sure you want to delete the translation for this line?');

                if (confirmDelete == true) {
                    hideTranslationLine(lineWrapperElement, translationLineInput, parentPageElement);        
                }
            }
        } else {
            showTranslationLine(lineWrapperElement, translationLineInput, parentPageElement);
        }
    }

    const translationLineInput = document.createElement('div');
    translationLineInput.setAttribute('contenteditable', true);
    translationLineInput.classList = 'translationLineInput';
    translationLineInput.setAttribute('placeholder', 'Add translation');
    translationLineInput.setAttribute('spellcheck', 'false'); // TODO: Make this configurable by user in settings

    if (params.data && params.data.translation && params.data.translation !== '') {
        translationLineInput.innerHTML = params.data.translation;
    } else {
        translationLineInput.classList.add('hidden');
    }

    translationLineInput.onkeydown = (keydown) => {
        const selection = getSelectionData(translationLineInput);

        if (translationLineInput.innerText !== '') {
            translationLineInput.classList.add('filled');
        }

        if (keydown.key === 'Enter') {
            keydown.preventDefault();

            insertlineInput({
                parentPageElement: params.parentPageElement,
                position: {
                    after: lineWrapperElement
                }
            });
        } else if (keydown.key === 'Backspace') {
            if (selection.caretPosition === 0 && translationLineInput.textContent === '') {
                keydown.preventDefault();

                lineWrapperElement.classList.remove('withTranslationLine');
                lineInput.focus();

                setCaretPosition({
                    field: lineInput,
                    position: 'END'
                });
                
                translationLineInput.classList.add('hidden');

                updatePage(parentPageElement); ;
            }
        }
    }

    translationLineInput.onkeyup = (keyup) => {
        updatePageDebounced(parentPageElement);
    }

    lineWrapperElement.appendChild(lineInput);
    lineWrapperElement.appendChild(addTranslationLineButton);
    lineWrapperElement.appendChild(translationLineInput);
    lineWrapperElement.appendChild(lineBackgroundElement);

    if (params.position === 'END') {
        parentPageElement.appendChild(lineWrapperElement);
    } else if (typeof(params.position) === 'object') {
        if (params.position.after) {
            params.position.after.parentNode.insertBefore(lineWrapperElement, params.position.after.nextSibling);
        } else if (params.position.before) {
            params.position.before.parentNode.insertBefore(lineWrapperElement, params.position.before);
        }
    }

    parentPageElement.dataset.numberOfLines++;
    
    lineInput.focus();
}
