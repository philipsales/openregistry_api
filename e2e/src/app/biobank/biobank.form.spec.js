'use strict';

const pageObjects =  require('./../page.objects');

//let biobankObject = pageObjects.biobank;
let loginObject = pageObjects.login;

let biobankObject = require('./biobank.po');
//const loginObject = require('./../login/login.po');


describe('Biobank Form', () => {

  beforeEach( () => {
    //browser.executeScript("document.body.style.zoom='80%'");
    //browser.executeScript("document.body.style.transform='scale(0.8)';");
  });


  it('should navigate to biobank home page', async () => {
    loginObject.loginAsBiobankUser();
    biobankObject.navigateToBiobankHome();
    biobankObject.navigateToBiobankForms();
  });
  
  it('should create new form', async () => {
    biobankObject.navigateToBiobankForms();
    biobankObject.createNewForm();
  });

  it('should approved created form ', async () => {
    biobankObject.navigateToBiobankForms();
    biobankObject.approveNewForm();
  });

});
