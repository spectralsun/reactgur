import React from 'react';
import { Nav, Navbar, NavItem, DropdownButton, MenuItem } 
  from 'react-bootstrap';

import ee from './../Emitter.js';


export default class NavbarComponent extends React.Component
{
  constructor(props) {
    super(props)
    this.state = APP_DATA;
    ee.addListener('app_data', this.setData.bind(this));
  }  

  setData(data) {
    this.setState(data);
  }

  render() { 
    if (this.state.authed) {
      var userNameAndIcon = (
        <span>
          <span className="glyphicon glyphicon-user"></span>
          <span> {this.state.username}</span>
        </span>
      );
      var userNav = (
        <DropdownButton title={userNameAndIcon} right>
            <MenuItem href={'/' + this.state.username + '/images'}>Images</MenuItem>
            <MenuItem href={'/' + this.state.username + '/albums'}>Albums</MenuItem>
            <MenuItem href='/logout'>Logout</MenuItem>
        </DropdownButton>
      );
    } else {
      var userNav = (<NavItem href='/login'>Login</NavItem>);
    }
    var brand = (
      <a href="/">
        <span className="glyphicon glyphicon-picture"></span>
        <span> {APP_NAME}</span>
      </a>
    )
    return (
      <Navbar brand={brand} inverse fixedTop>
        <Nav>
          <NavItem href='/upload'>
            <span className="glyphicon glyphicon-cloud-upload"></span>
            <span> Upload</span>
          </NavItem>
        </Nav>
        <Nav right>
          {userNav}
        </Nav>
      </Navbar>
    )
  }
}