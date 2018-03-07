'use strict';

var admin = require('./admin.object').admin;
var data = require('./admin.object').data;

var id = admin.locator.id;
var css = admin.locator.css;
//var docs = { "module": "User Registration" };

var navigateToAdminHome = () => {
    browser.get(admin.admin_home_url);
}

var navigateToAdminRoles = () => {
    browser.get(admin.admin_roles_url);
}

var navigateToAdminUsers = () => {
    browser.get(admin.admin_users_url);
}

var navigateToAdminDatabase = () => {
    browser.get(admin.admin_database_url);
}

var loginAsInvalidUser = () => {
  element(by.id(id.input_username)).sendKeys(data.invalid.username);
  element(by.id(id.input_password)).sendKeys(data.invalid.password);
  element(by.id(css.btn_login)).click();

  var error = element(by.css(css.res_error))
  expect(error.getText()).toBe(data.invalid.response); // This is wrong! 
}

var loginAsValidUser =  async () => {
  element(by.id(id.input_username)).sendKeys(data.valid.username);
  element(by.id(id.input_password)).sendKeys(data.valid.password);
  element(by.id(css.btn_login)).click();

  var home = await browser.driver.getCurrentUrl();
  expect(home).toEqual(baseUrl + '/my-account/info');
}

module.exports = {
 navigateToAdminHome,
 navigateToAdminRoles,
 navigateToAdminUsers,
 navigateToAdminDatabase,
 loginAsValidUser,
 loginAsInvalidUser
} 
