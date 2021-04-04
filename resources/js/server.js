async function server(method, endpoint, data) {
    const request = await fetch(`http://localhost:3000/${endpoint}`,
        {
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

    const response = await request.json();
    
    return response;
}

async function updatePage(pageElement) {
    const pageID = pageElement.dataset.pageid;

    if (pageID) {
        let lines = [];
    
        pageElement.querySelectorAll('.lineWrapper').forEach((lineWrapper) => {            
            lines.push({
                content: lineWrapper.querySelector('.lineInput').innerHTML.replaceAll('\u200B', ''),
                translation: lineWrapper.querySelector('.translationLineInput').innerHTML,
                transliteration: null
            });
        });
    
        console.log('Saved!');
        // console.log(lines);
    
        await server('POST', 'updatePage',
            {
                id: pageID,
                data: {
                    lines
                }
            }
        );
    }
}

const updatePageDebounced = debounce(function(pageElement) {
    updatePage(pageElement);
}, 250);

async function getPageData(params) {
    return await server('GET', `getPage?id=${params.pageID}`);
}