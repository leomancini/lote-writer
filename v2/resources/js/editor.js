const { EditorState } = require('prosemirror-state');
const { EditorView, Decoration, DecorationSet } = require('prosemirror-view');
const { DOMParser } = require('prosemirror-model');
const { Plugin } = require('prosemirror-state');

const { schema } = require('prosemirror-schema-basic');
const { exampleSetup } = require('prosemirror-example-setup');

function loadAnnotations() {
    window.annotations = {
        0: 'asd'
    };

    let annotatedTexts = document.querySelectorAll('.annotatedText');

    annotatedTexts.forEach((annotatedText) => {
        annotatedText.onmouseover = () => {
            showAnnotationTooltip(annotatedText.dataset.annotationId);
        }

        annotatedText.onmouseout = (e) => {
            if (!(e.toElement.classList.contains('annotationTooltipContainer') || e.toElement.parentNode.classList.contains('annotationTooltipContainer'))) {
                hideAnnotationTooltip(annotatedText.dataset.annotationId);
            }
        }
    });
}

function addNoteToAnnotation(annotationID, text) {
    window.annotations[annotationID] = text;
}

function showAnnotationTooltip(annotationID) {
    let annotatedText = document.querySelector(`.annotatedText[data-annotation-id='${annotationID}']`);

    let viewAnnotationTooltipContainer = document.createElement('div');
    viewAnnotationTooltipContainer.className = 'annotationTooltipContainer';
    viewAnnotationTooltipContainer.setAttribute('data-annotation-id', annotationID);

    let tooltip = document.createElement('div');
    tooltip.className = 'annotationTooltip';
    viewAnnotationTooltipContainer.appendChild(tooltip);

    let text = document.createElement('div');
    text.className = 'text';
    text.innerText = window.annotations[annotationID];
    tooltip.appendChild(text);

    viewAnnotationTooltipContainer.style.left = `${annotatedText.offsetLeft - 16}px`;
    viewAnnotationTooltipContainer.style.width = `${annotatedText.offsetWidth + 32}px`;
    viewAnnotationTooltipContainer.style.top = `${annotatedText.offsetTop + annotatedText.offsetHeight}px`;

    viewAnnotationTooltipContainer.onmouseout = (e) => {
        hideAnnotationTooltip(annotationID);
    }

    if (window.annotations[annotationID]) {
        document.querySelector('#editor').appendChild(viewAnnotationTooltipContainer);

        console.log(annotationID, window.annotations[annotationID]);
    }
}

function hideAnnotationTooltip(annotationID) {
    document.querySelector(`.annotationTooltipContainer[data-annotation-id='${annotationID}']`).remove();
}

function addAnnotation(view) {
    let annotationID = Date.now();

    let transaction = view.state.tr.setMeta('annotationPlugin', {
        fromPos: view.state.selection.$from.pos,
        toPos: view.state.selection.$to.pos,
        annotationID
    });

    view.dispatch(transaction);

    let annotatedTexts = document.querySelectorAll('.annotatedText');

    annotatedTexts.forEach((annotatedText) => {
        annotatedText.onmouseover = () => {
            showAnnotationTooltip(annotatedText.dataset.annotationId);
        }

        annotatedText.onmouseout = (e) => {
            if (!(e.toElement.classList.contains('annotationTooltipContainer') || e.toElement.parentNode.classList.contains('annotationTooltipContainer'))) {
                hideAnnotationTooltip(annotatedText.dataset.annotationId);
            }
        }
    });

    return annotationID;
}

let annotationPlugin = new Plugin({
    state: {
        init(_, { doc }) {
            let initialAnnotations = [
                Decoration.inline(1, 5, { class: 'annotatedText', 'data-annotation-id': 0 })
            ];

            return DecorationSet.create(doc, initialAnnotations);
        },
        apply(tr, set) {
            if (tr.getMeta('annotationPlugin')) {
                const { fromPos, toPos, annotationID } = tr.getMeta('annotationPlugin');

                return set.add(tr.doc, [
                    Decoration.inline(fromPos, toPos, { class: 'annotatedText', 'data-annotation-id': annotationID  })
                ]);
            } else {
                return set.map(tr.mapping, tr.doc);
            }
        }
    },
    props: {
        decorations(state) {
            return annotationPlugin.getState(state);
        }
    }
});

function hideAccessory(type) {
    if (type === 'tooltip') {
        if (document.querySelector('.tooltip')) {
            document.querySelector('.tooltip').style.display = 'none';
        }
    } else {
        if (document.querySelector(`.${type}`)) {
            document.querySelector(`.${type}`).remove();
        }
    }
}

document.onclick = (e) => {
    if (e.target.tagName === 'HTML') {
        hideAccessory('tooltip');
        hideAccessory('addNote');
        hideAccessory('translateResult');
    }
};

let tooltipPlugin = new Plugin({
    view(editorView) {
        return new tooltip(editorView);
    }
});

class tooltip {
    constructor(view) {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';

        this.tooltip.onclick = (click) => {
            let clickedAction = click.target;
            let clickedActionId = clickedAction.dataset.actionId;
            let tooltipPosition = {
                top: this.tooltip.offsetTop,
                left: this.tooltip.offsetLeft,
            }

            switch(clickedActionId) {
                case 'add-note':
                    let addNoteContainer = document.createElement('div');
                    addNoteContainer.className = 'addNote';
                    addNoteContainer.style.left = `${tooltipPosition.left}px`;
                    addNoteContainer.style.top = `${tooltipPosition.top}px`;

                    let field = document.createElement('div');
                    field.contentEditable = true;
                    field.dataset.placeholder = 'Add note...';
                    field.className = 'field';
                    addNoteContainer.appendChild(field);

                    let annotationID = addAnnotation(view);

                    field.onkeydown = (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addNoteContainer.remove();

                            addNoteToAnnotation(annotationID, field.innerText);
                        }
                    }

                    document.querySelector('#editor').appendChild(addNoteContainer);

                    field.focus();
                break;
                case 'add-to-flash-cards':

                break;
                case 'translate':
                    let translateResultContainer = document.createElement('div');
                    translateResultContainer.className = 'translateResult';
                    translateResultContainer.style.left = `${tooltipPosition.left}px`;
                    translateResultContainer.style.top = `${tooltipPosition.top}px`;

                    let loading = document.createElement('div');
                    loading.className = 'loading';
                    translateResultContainer.appendChild(loading);

                    document.querySelector('#editor').appendChild(translateResultContainer);

                    let headers = new Headers();
                    headers.append('Content-Type', 'application/json');

                    let requestOptions = {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            'data': {
                                'text': window.lastSelectedText
                            }
                        })
                    };

                    fetch('http://localhost:3000/translate', requestOptions)
                        .then(response => response.json())
                        .then(result => {
                            let translatedText = result.data[0].translatedText;

                            loading.remove();

                            let text = document.createElement('div');
                            text.className = 'text';
                            text.innerText = translatedText;
                            translateResultContainer.appendChild(text);
                        
                            setTimeout(() => {
                                translateResultContainer.remove();
                            }, 2000);
                        })
                        .catch(error => console.log('error', error));
                break;
            }

            this.tooltip.style.display = 'none';
            return;
        }

        view.dom.parentNode.appendChild(this.tooltip);

        this.update(view, null);
    }

    update(view, lastState) {
        let state = view.state;

        if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) { return false; };

        if (state.selection.empty) {
            this.tooltip.style.display = 'none';

            return false;
        } else {
            this.tooltip.style.display = '';
            let {from, to} = state.selection;
            // These are in screen coordinates
            let start = view.coordsAtPos(from), end = view.coordsAtPos(to);
            // The box in which the tooltip is positioned, to use as base
            let box = this.tooltip.offsetParent.getBoundingClientRect();
            // Find a center-ish x position from the selection endpoints (when
            // crossing lines, end may be more to the left)
            let left = Math.max((start.left + end.left) / 2, start.left + 3);

            const tooltipActionsHolder = document.createElement('div');

            const tooltipActions = [
                'add-note',
                'add-to-flash-cards',
                'translate'
            ];

            tooltipActions.forEach((action) => {
                const tooltipAction = document.createElement('div');
                tooltipAction.classList = `action ${action}`;
                tooltipAction.dataset.actionId = action;
                tooltipActionsHolder.appendChild(tooltipAction);
            });

            this.tooltip.style.left = (left - box.left) + 'px';
            this.tooltip.style.bottom = (box.bottom - start.top + 4) + 'px';
            this.tooltip.innerHTML = tooltipActionsHolder.innerHTML;

            hideAccessory('addNote');
            hideAccessory('translateResult');

            window.lastSelectedText = window.getSelection().toString();
        }
    }

    destroy() {
        this.tooltip.remove();
    }
}

window.view = new EditorView(document.querySelector('#editor'), {
    state: EditorState.create({
        doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
        plugins: exampleSetup({ schema }).concat(tooltipPlugin, annotationPlugin)
    })
});

loadAnnotations();