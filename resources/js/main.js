function renderPage(params) {
    const pageElement = params.pageElement;
    pageElement.dataset.numberOfLines = 0;
    pageElement.dataset.pageid = params.pageID;

    insertlineInput({
        parentPageElement: pageElement,
        position: 'END'
    });
}

async function render() {
    const newPage = await server('POST', 'addPage',
        {
            data: "A new page!"
        });
    console.log(newPage.id);

    renderPage({
        pageID: newPage.id,
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