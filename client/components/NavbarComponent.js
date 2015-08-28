import React from 'react';
import { Nav, Navbar, NavItem, DropdownButton, MenuItem } 
  from 'react-bootstrap';

import ee from './../Emitter.js';


export default class NavbarComponent extends React.Component
{
  constructor(props) {
    super(props)
    this.state = window.APP_DATA;
    ee.addListener('app_data', this.setData.bind(this));
  }  

  setData(data) {
    this.setState(data);
  }

  render() { 
    if (!this.state)
      this.getInitialState();
    if (this.state.authed) {
      var userNameAndIcon = (
        <span>
          <span className="glyphicon glyphicon-user"></span>
          <span>{this.state.username}</span>
        </span>
      );
      var userNav = (
        <DropdownButton eventKey={3} title={userNameAndIcon} right>
            <MenuItem eventKey={1} href='/logout'>Logout</MenuItem>
        </DropdownButton>
      );
    } else {
      var userNav = (<NavItem eventKey={1} href='/login'>Login</NavItem>);
    }
    return (
      <Navbar brand={window.APP_NAME} inverse>
        <Nav>
          <NavItem eventKey={2} href='/upload'>Upload</NavItem>
        </Nav>
        <Nav right>
          {userNav}
        </Nav>
      </Navbar>
    )
  }
}