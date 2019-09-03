import React from 'react';
import { Editor, EditorState } from 'draft-js';
import { getDefaultKeyBinding, KeyBindingUtil, Modifier, Entity, CompositeDecorator, SelectionState, convertFromRaw, convertToRaw } from 'draft-js';
import debounce from 'lodash/debounce';

import TagsPopover from './Popover';

const { hasCommandModifier } = KeyBindingUtil;

const defaultTags = ['Test', 'Example']



function keyBindingFn(e) {
    console.log(e.keyCode)
    return getDefaultKeyBinding(e)
}

const TagComponent = (props) => (
    <span style={{ color: 'blue', 'text-decoration': 'underline' }}>
        {props.children}
    </span>
);

const decorator = new CompositeDecorator([{
    strategy: findTags,
    component: TagComponent,
}]);


function findTags(contentBlock, callback) {
    contentBlock.findEntityRanges((character) => {
        const entityKey = character.getEntity();
        return (
            entityKey !== null &&
            Entity.get(entityKey).getType() === 'TAG'
        );
    }, callback);
}


class CustomEditor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(decorator),
            popover: null,
            tags: [],
        };
        this.handleKeyCommand = this.handleKeyCommand.bind(this);
        this.handleBeforeInput = this.handleBeforeInput.bind(this)
        this.keyBindingFn = this.keyBindingFn.bind(this)

    }

    onChange = (editorState) => {
        const contentState = editorState.getCurrentContent();
        this.saveContent(contentState);
        this.setState({
            editorState,
        });
    }


    saveContent = debounce((content) => {
        fetch('/api/note', {
            method: 'POST',
            body: JSON.stringify({
                content: convertToRaw(content),
                noteId: 1,
            }),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })
    }, 1000);


    componentDidMount() {
        window.onclick = () => {
            if (this.state.popover) {
                this.closePopover()
            }
        }
    }

    closePopover() {
        this.setState({ popover: null })
    }

    openPopover(elementWithRect) {
        this.setState({ popover: elementWithRect })
    }

    keyBindingFn(e) {
        // Backspace
        var selectionState = this.state.editorState.getSelection();

        if (e.keyCode === 8 && selectionState.isCollapsed()) {
            var anchorKey = selectionState.getAnchorKey();
            var currentContent = this.state.editorState.getCurrentContent();
            var currentContentBlock = currentContent.getBlockForKey(anchorKey);
            var start = selectionState.getStartOffset();
            var end = selectionState.getEndOffset();
            var selectedText = currentContentBlock.getText().slice(start - 1, end);
            if (selectedText === '#' && this.state.popover) {
                this.closePopover()
            }
        }

        return getDefaultKeyBinding(e)
    }

    handleKeyCommand(command) {
        console.log('Command::', command)
        if (command === 'insert-tag') {
            console.log("Insert tag")
            const rect = window.getSelection().getRangeAt(0)
            console.log(rect, 'rect')
            this.setState({
                popover: rect,
            });
            console.log(rect, ':: Rect')
            return 'handled'
        }
        return 'not-handled'
    }

    handleBeforeInput(chars, editorState) {
        console.log(chars, 'chars')
        if (chars === '#') {
            const selection = editorState.getSelection();
            const currentContent = editorState.getCurrentContent();
            // const entityKey = Entity.create('TAG', 'MUTABLE',  {});
            const textWithEntity = Modifier.insertText(currentContent, selection, '#', null);
            this.setState({
                editorState: EditorState.push(editorState, textWithEntity, 'insert-characters')
            }, () => {
                const rect = window.getSelection().getRangeAt(0);
                this.openPopover(rect)
            })
            return 'handled'
        }
        console.log(chars, 'yo')
        return 'not-handled'
    }

    createTag() {
        const { editorState } = this.state;
        const selection = editorState.getSelection();
        const currentContent = editorState.getCurrentContent();
        const anchorKey = selection.getAnchorKey();
        const currentContentBlock = currentContent.getBlockForKey(anchorKey);
        const start = selection.getStartOffset();
        const end = selection.getEndOffset();
        const textInRange = currentContentBlock.getText().slice(0, end);
        const tagStartIndex = textInRange.lastIndexOf('#');
        const tagText = currentContentBlock.getText().slice(tagStartIndex + 1, end)
        const entityKey = Entity.create('TAG', 'MUTABLE', {});
        const tagSelection = SelectionState.createEmpty().merge({
            anchorKey: anchorKey,
            focusKey: anchorKey,
            anchorOffset: tagStartIndex,
            focusOffset: end,
        })
        const textWithEntity = Modifier.applyEntity(currentContent, tagSelection, entityKey);

        this.setState({
            editorState: EditorState.push(editorState, textWithEntity, 'apply-entity'),
            popover: null,
            tags: this.state.tags.push(tagText),
        })
    }

    componentDidMount() {
        fetch('/api/note/1').then(val => val.json())
            .then(rawContent => {
                if (rawContent) {
                    this.setState({ editorState: EditorState.createWithContent(convertFromRaw(rawContent), decorator) })
                } else {
                    this.setState({ editorState: EditorState.createEmpty(decorator) });
                }
            });
    }

    render() {
        if (this.state.popover) {
            // console.log(this.state.popover.left, 'State')
        }
        return (
            <div>
                <Editor
                    editorState={this.state.editorState}
                    onChange={this.onChange}
                    handleBeforeInput={this.handleBeforeInput}
                    keyBindingFn={this.keyBindingFn}
                />
                {(this.state.popover !== null) ? <TagsPopover referenceElement={this.state.popover} tags={defaultTags} createTag={this.createTag.bind(this)} /> : null}
            </div>
        );
    }

}

export default CustomEditor;