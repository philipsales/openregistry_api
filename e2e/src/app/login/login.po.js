'use strict';

var login = require('./login.object').login;
var data = require('./login.data').data;

var id = login.locator.id;
var css = login.locator.css;

var navigateToLogin = () => {
    browser.get('/');
}

var loginAsInvalidUser = async () => {
  this.navigateToLogin();

  element(by.id(id.input_username)).sendKeys(data.invalid.username);
  element(by.id(id.input_password)).sendKeys(data.invalid.password);
  element(by.id(css.btn_login)).click();

  var error = element(by.css(css.res_error))
  expect(error.getText()).toBe(data.invalid.response); // This is wrong! 
}

var loginAsValidUser =  async () => {
  browser.get('/');

  element(by.id(id.input_username)).sendKeys(data.valid.username);
  element(by.id(id.input_password)).sendKeys(data.valid.password);
  element(by.id(id.btn_login)).click();

  let home = await browser.driver.getCurrentUrl();
  expect(home).toEqual(baseUrl + login.next_url);
}

var loginAsBiobankUser =  async () => {
  browser.get('/');

  element(by.id(id.input_username)).sendKeys(data.valid.username);
  element(by.id(id.input_password)).sendKeys(data.valid.password);
  element(by.id(id.btn_login)).click();

  let home = await browser.driver.getCurrentUrl();
  expect(home).toEqual(baseUrl + login.next_url);
}




module.exports = {
 navigateToLogin,
 loginAsInvalidUser,
 loginAsBiobankUser,
 loginAsValidUser
} 
