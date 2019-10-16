import React from 'react';
import { NavLink as Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import DropdownItem from 'react-bootstrap/DropdownItem';

export interface IMenuItem {
  icon: IconProp;
  to: string;
  id?: string;
}

export default class MenuItem extends React.Component<IMenuItem> {
  render() {
    const { to, icon, id, children } = this.props;

    return (
      <DropdownItem as={Link} to={to} id={id}>
        <FontAwesomeIcon icon={icon} fixedWidth className={'mr-1'} /> {children}
      </DropdownItem>
    );
  }
}
