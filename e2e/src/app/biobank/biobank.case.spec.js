'use strict';

const pageObjects =  require('./../page.objects');

//let biobankObject = pageObjects.biobank;
let loginObject = pageObjects.login;

let biobankObject = require('./biobank.po');
//const loginObject = require('./../login/login.po');

describe('Biobank Case', () => {

  it('should navigate to biobank home page', async () => {
    //temporary login if independent
    //loginObject.loginAsBiobankUser();
    biobankObject.navigateToBiobankHome();
    biobankObject.navigateToBiobankForms();
  });


  it('should create new case', async () => {
    biobankObject.navigateToBiobankCases();
    biobankObject.createNewCase();
  });

  it('should add created form to new case', async () => {
    biobankObject.addFormToNewCase();
  });

  it('should input data to added form of new case', async () => {
    biobankObject.navigateToBiobankCases();
    biobankObject.inputDataFormToNewCase();
  });

  /*

 
  it('should add form to new case', async () => {
  });

  it('should fill up the added from of the new case', async () => {
  });

  it('should create Update Created Form', async () => {
  });

  it('should navigate to biobank cases page', async () => {
    biobankObject.navigateToBiobankCases();
  });

  it('should navigate to biobank reports page', async () => {
    biobankObject.navigateToBiobankReports();
  });

  it('should not navigate to admin page', async () => {
  });

  it('should not navigate to medical page', async () => {
  });

  it('should not navigate to medical page', async () => {
  });

  */


});