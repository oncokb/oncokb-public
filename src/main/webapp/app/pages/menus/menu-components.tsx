import React from 'react';

import { UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react';

const NavDropdown = (props: any) => (
  <UncontrolledDropdown nav inNavbar id={props.id}>
    <DropdownToggle nav caret>
      <FontAwesomeIcon icon={props.icon} className={'mr-1'} />
      <span>{props.name}</span>
    </DropdownToggle>
    <DropdownMenu right style={props.style}>
      {props.children}
    </DropdownMenu>
  </UncontrolledDropdown>
);

export default observer(NavDropdown);
