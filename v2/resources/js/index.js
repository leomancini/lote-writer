async function loadPages() {
    let pageId = window.pageId;

    const request = await fetch(`${window.server}/getAllPages`);
    const response = await request.json();

    return response;
}

async function createNewPage() {
    let requestOptions = {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            data: {
                content: {
                	type: 'doc',
                	content: [{
            			type: 'paragraph',
            			content: []
                	}],
                },
                annotations: null
            }
        })
    };

    const request = await fetch(`${window.server}/addPage`, requestOptions);
    const response = await request.json();

    if (response.success) {
        openPage(response.id);
    }
}

function openPage(pageId) {
	window.location = `pages/${pageId}`;
}

function renderPageThumbnail(page) {
	let pageThumbnailElement = document.createElement('div');
	pageThumbnailElement.classList = 'pageThumbnail';
	if (page.data.content && page.data.content.content[0] && page.data.content.content[0].content[0]) {
		pageThumbnailElement.innerText = page.data.content.content[0].content[0].text;
	}

	return pageThumbnailElement; 
}

async function initialize() {
    let pages = await loadPages();

    let pagesContainerElement = document.querySelector('#pages');

    pages.forEach((page) => {
    	let pageThumbnailElement = renderPageThumbnail(page);

    	pagesContainerElement.appendChild(pageThumbnailElement);

		pageThumbnailElement.onclick = () => {
			openPage(page._id);
		}
    });

	let createNewPageElement = document.createElement('div');
	createNewPageElement.classList = 'createNewPage';

	let createNewPageIcon = document.createElement('div');
	createNewPageIcon.classList = 'icon';
	createNewPageElement.appendChild(createNewPageIcon);

	let createNewPageLabel = document.createElement('div');
	createNewPageLabel.classList = 'label';
	createNewPageLabel.innerText = 'Create New Page';
	createNewPageElement.appendChild(createNewPageLabel);

	createNewPageElement.onclick = async () => {
		await createNewPage();
	}

	pagesContainerElement.appendChild(createNewPageElement);
}

initialize();