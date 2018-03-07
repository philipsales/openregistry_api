'use strict';
var AdminObject = require('./admin.po');

describe('Login Page', () => {

  it('should navigate to admin home page', async () => {
    AdminObject.navigateToAdminHome();
  });

  it('should navigate to admin roles page', async () => {
    AdminObject.navigateToAdminRoles();
  });

  it('should navigate to admin users page', async () => {
    AdminObject.navigateToAdminUsers();
  });

  it('should navigate to admin database page', async () => {
    AdminObject.navigateToAdminDatabase();
  });

  it('should not navigate to biobank page', async () => {
  });

  it('should not navigate to medical page', async () => {
  });


});
