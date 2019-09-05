import React from 'react';

import { NavDropdown } from './menu-components';
import MenuItem from 'app/pages/menus/menu-item';

export const EntitiesMenu = () => (
  // tslint:disable-next-line:jsx-self-close
  <NavDropdown icon="th-list" name="Entities" id="entity-menu">
    <MenuItem icon="asterisk" to="/entity/token">
      Token
    </MenuItem>
    <MenuItem icon="asterisk" to="/entity/token-stats">
      Token Stats
    </MenuItem>
    {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
  </NavDropdown>
);
