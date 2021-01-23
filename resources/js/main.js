function renderPage(params) {
    const pageElement = params.pageElement;
    pageElement.dataset.numberOfLines = 0;

    insertlineInput({
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
        allLineWrappers[0].querySelector('.lineInput').focus();
    }, 10);

    document.onclick = (click) => {
        if (click.target.tagName === 'HTML' || click.target.tagName === 'BODY') {
            click.preventDefault();
            const allLineWrappers = document.querySelectorAll('.lineWrapper');
            const lastlineInput = allLineWrappers[allLineWrappers.length - 1].querySelector('.lineInput')
            lastlineInput.focus();

            setCaretPosition({
                field: lastlineInput,
                position: 'END'
            });
        }
    } 
}

render();