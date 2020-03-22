import React from 'react';
import MenuItem from 'app/shared/layout/menus/menu-item';
import { DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { NavLink as Link } from 'react-router-dom';
import { NavDropdown } from './menu-components';

export const EntitiesMenu = props => (
  <NavDropdown icon="th-list" name="Entities" id="entity-menu">
    <MenuItem icon="asterisk" to="/token">
      Token
    </MenuItem>
    <MenuItem icon="asterisk" to="/token-stats">
      Token Stats
    </MenuItem>
    <MenuItem icon="asterisk" to="/user-details">
      User Details
    </MenuItem>
    <MenuItem icon="asterisk" to="/user-mails">
      User Mails
    </MenuItem>
    {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
  </NavDropdown>
);
