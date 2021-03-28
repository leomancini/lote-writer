async function renderPage(params) {
    const { pageData, pageElement } = params;

    if (pageData) {
        // Render an existing page with data from server
        pageElement.dataset.numberOfLines = pageData.data.lines.length;
        pageElement.dataset.pageid = pageData._id;

        pageData.data.lines.map((lineData) => {
            insertlineInput({
                parentPageElement: pageElement,
                position: 'END',
                data: lineData
            });
        });
    } else {
        // Render a new empty page
        pageElement.dataset.numberOfLines = 0;
        pageElement.dataset.pageid = params.pageID;

        insertlineInput({
            parentPageElement: pageElement,
            position: 'END'
        });
    }
}

async function render() {
    // const newPage = await server('POST', 'addPage',
    //     {
    //         data: {
    //             lines: []
    //         }
    //     }
    // );
    // console.log(`Created ${newPage.id}`);

    // renderPage({
    //     pageID: newPage.id,
    //     pageElement: document.querySelector('.page')
    // });

    const pageDataResponse = await getPageData({
        pageID: '6060d67dc0261a36a61a3885'
    });

    await renderPage({
        pageData: pageDataResponse.page,
        pageElement: document.querySelector('.page')
    });

    setTimeout(function() {
        const allLineWrappers = document.querySelectorAll('.lineWrapper');
        // allLineWrappers[0].querySelector('.lineInput').focus();

        setCaretPosition({
            field: allLineWrappers[0].querySelector('.lineInput'),
            position: 'START'
        });
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