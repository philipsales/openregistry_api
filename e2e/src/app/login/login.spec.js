'use strict';

var loginObject = require('./login.po');

describe('Login Page', () => {

  it('should return error for invalid login', async () => {
    loginObject.loginAsInvalidUser();
  });

  it('should return sucess for valid login', async () => {
    loginObject.loginAsValidUser();
  });

});