import { Logout, Person, PersonOutlined } from "@mui/icons-material";
import { Avatar, IconButton, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { logout, selectKeycloak } from "features/auth-slice";
import strings from "localization/strings";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

/**
 * Profile menu component
 *
 * @param props component properties
 */
const ProfileMenu: React.FC = () => {
  const keycloak = useAppSelector(selectKeycloak);
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * Handle menu click
   * @param event 
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handle menu close
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        id="profile-button"
        aria-controls="profile-menu"
        aria-haspopup="true"
        aria-expanded={ open ? "true" : undefined }
        onClick={ handleClick }
      >
        <Person htmlColor="#ffffff"/>
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={ anchorEl }
        open={ open }
        onClose={ handleClose }
        MenuListProps={{
          "aria-labelledby": "profile-button"
        }}
      >
        <ListItem dense>
          <ListItemAvatar>
            <Avatar>
              <PersonOutlined fontSize="small"/>
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={ `${keycloak?.profile?.firstName} ${keycloak?.profile?.lastName}` }/>
        </ListItem>
        <MenuItem onClick={ () => dispatch(logout()) }>
          <ListItemIcon>
            <Logout fontSize="small"/>
          </ListItemIcon>
          { strings.generic.logout }
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ProfileMenu;