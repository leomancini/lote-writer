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

async function updatePage(pageID, parentPageElement) {
    let lines = [];

    parentPageElement.querySelectorAll('.lineWrapper').forEach((lineWrapper) => {
        lines.push(lineWrapper.querySelector('.lineInput').innerHTML);
    });

    await server('POST', 'updatePage',
        {
            id: pageID,
            data: {
                lines
            }
        }
    );
}

const updatePageDebounced = debounce(function(pageID, parentPageElement) {
    updatePage(pageID, parentPageElement);
}, 250);