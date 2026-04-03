import React from 'react';
import { NavLink as Link } from 'react-router-dom';
import DropdownItem from 'react-bootstrap/DropdownItem';

export interface IMenuItem {
  icon: string;
  to: string;
  id?: string;
  onClick?: () => void;
}

export default class MenuItem extends React.Component<IMenuItem> {
  render() {
    const { to, icon, id, onClick, children } = this.props;

    return (
      <DropdownItem
        as={Link}
        to={to}
        id={id}
        onClick={onClick}
        style={{ lineHeight: '2.75rem' }}
      >
        <i className={`fa fa-${icon} fa-fw mr-1`} /> {children}
      </DropdownItem>
    );
  }
}
