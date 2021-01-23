function getSelectionData(element) {
    const selectionData = {
        start: element.selectionStart,
        end: element.selectionEnd,
        isTextSelected: element.selectionStart !== element.selectionEnd,
        value: window.getSelection().toString()
    };

    return selectionData;
}

function insertNewInputLine(params) {
    const parentPageElement = params.parentPageElement;

    const newLineWrapperElement = document.createElement('div');
    newLineWrapperElement.classList = 'lineWrapper';

    const newLineBackgroundElement = document.createElement('div');
    newLineBackgroundElement.classList = 'lineBackground';

    const newInputLine = document.createElement('input');
    newInputLine.classList = 'inputLine';

    newInputLine.onkeyup = (keyup) => {
        if (newInputLine.value !== '') {
            newLineWrapperElement.classList.add('filled');
        }
    }

    newInputLine.onkeydown = (keydown) => {
        const selection = getSelectionData(newInputLine);

        if (keydown.key === 'Enter') {
            const delayToInsertNewInputLine = 100; // This is mostly to give time for the macOS IME window to clear

            setTimeout(function() {
                insertNewInputLine({
                    parentPageElement: params.parentPageElement,
                    position: {
                        after: newLineWrapperElement
                    }
                });
            }, delayToInsertNewInputLine);
        } else if (keydown.key === 'Backspace') {
            if (newInputLine.value === '' || selection.start === 0) {
                if (newLineWrapperElement.previousElementSibling) {
                    newLineWrapperElement.previousElementSibling.querySelector('input').focus();
                }
                
                if (parentPageElement.dataset.numberOfLines > 1) {
                    newLineWrapperElement.remove();
                    parentPageElement.dataset.numberOfLines--;
                }
            }
        } else if (keydown.key === 'ArrowUp') {
            if (newLineWrapperElement.previousElementSibling) {
                newLineWrapperElement.previousElementSibling.querySelector('input').focus();
            }
        } else if (keydown.key === 'ArrowDown') {
            if (newLineWrapperElement.nextElementSibling) {
                newLineWrapperElement.nextElementSibling.querySelector('input').focus();
            }
        }
    }

    newInputLine.onblur = (blur) => {
        blur.preventDefault();
    }

    newLineWrapperElement.onmouseup = (mouseup) => {
        mouseup.stopPropagation();
        const selection = getSelectionData(newInputLine);
        console.log(selection);
    }

    newLineBackgroundElement.onclick = (click) => {
        newInputLine.focus();
        
        if (click.clientX < newInputLine.offsetLeft) {
            newInputLine.selectionStart = 0;
            newInputLine.selectionEnd = 0;
        } else if (click.clientX > newInputLine.offsetLeft + newInputLine.offsetWidth) {
            newInputLine.selectionStart = newInputLine.value.length;
            newInputLine.selectionEnd = newInputLine.value.length;
        }
    }
    
    const newTranslationInputLine = document.createElement('input');
    newTranslationInputLine.classList = 'translationInputLine';
    newTranslationInputLine.setAttribute('placeholder', 'Add translation');

    newTranslationInputLine.onkeydown = (keydown) => {
        if (newTranslationInputLine.value !== '') {
            newTranslationInputLine.classList.add('filled');
        }
    }

    newLineWrapperElement.appendChild(newInputLine);
    newLineWrapperElement.appendChild(newTranslationInputLine);
    newLineWrapperElement.appendChild(newLineBackgroundElement);

    if (params.position === 'END') {
        parentPageElement.appendChild(newLineWrapperElement);
    } else if (typeof(params.position) === 'object') {
        if (params.position.after) {
            params.position.after.parentNode.insertBefore(newLineWrapperElement, params.position.after.nextSibling);
        }
    }

    parentPageElement.dataset.numberOfLines++;
    
    newInputLine.focus();
}

function renderPage(params) {
    const pageElement = params.pageElement;
    pageElement.dataset.numberOfLines = 0;

    insertNewInputLine({
        parentPageElement: pageElement,
        position: 'END'
    });
}

function render() {
    renderPage({
        pageElement: document.querySelector('.page')
    });

    setTimeout(function() {
        const allLineWrappers = document.querySelectorAll('.lineWrapper');
        allLineWrappers[0].querySelector('input').focus();
    }, 10);

    document.onclick = (click) => {
        if (click.target.tagName === 'HTML' || click.target.tagName === 'BODY') {
            click.preventDefault();
            const allLineWrappers = document.querySelectorAll('.lineWrapper');
            const lastInputLine = allLineWrappers[allLineWrappers.length - 1].querySelector('input')
            lastInputLine.focus();

            lastInputLine.selectionStart = lastInputLine.value.length;
            lastInputLine.selectionEnd = lastInputLine.value.length;
        }
    } 
}

render();