const   modeSelectorContainer = document.querySelector('#modeSelectorContainer'),
        modeSelectors = modeSelectorContainer.querySelectorAll('.modeSelector'),
        modeSelectorSelectedBackground = modeSelectorContainer.querySelector('#modeSelectorSelectedBackground');

modeSelectors.forEach((modeSelector) => {
    modeSelector.addEventListener('click', (click) => {
        if (!modeSelector.classList.contains('selected')) {
            
            modeSelectorSelectedBackground.style.left = `${modeSelector.offsetLeft - 6}px`;

            modeSelectors.forEach((modeSelector) => {
                modeSelector.classList.remove('selected');
            });

            modeSelector.classList.add('selected');
        }
    })
});