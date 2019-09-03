import React from 'react'
import { Popper } from 'react-popper';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';

const TagsPopover = (props) => (
    <Popper referenceElement={props.referenceElement} placement="bottom-start">
        {({ ref, style, placement, arrowProps }) => (
            <div ref={ref} style={style} data-placement={placement}>
                <div className="popping">
                    <MenuList dense>
                        <MenuItem onClick={props.createTag}>Create Tag</MenuItem>
                        <Divider />
                        {props.tags.map((tag, i) => (
                            <MenuItem key={i}>{tag}</MenuItem>
                        ))}
                    </MenuList>
                </div>
                {/* <div ref={arrowProps.ref} style={arrowProps.style} /> */}
            </div>
        )}
    </Popper>
)

export default TagsPopover;