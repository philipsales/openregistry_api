
'use strict';


var biobank = require('./biobank.object').biobank;
var data = require('./biobank.data').data;

const id = biobank.locator.id;
const css = biobank.locator.css;
const forms = data.form;
const cases = data.case;


const until = protractor.ExpectedConditions;

const questionContent1 = element(by.tagName('form-section-array'))
                .all(by.tagName('question-content-array'))
                .all(by.tagName('question-content'));


//browser.executeScript("document.body.style.zoom='50%'");
//TODO: caution ong get(0) should be .first()
var navigateToLogin = () => {
    browser.get('/');
}

var navigateToBiobankHome = () => {
    element(by.css(css.main_tab_biobank)).click();
}

var navigateToBiobankCases = () => {
    element(by.css('.e2e-biobank-case')).click();
}

var navigateToBiobankForms = () => {
    element(by.css('.e2e-biobank-form')).click();
}

var navigateToBiobankReports = () => {
    element(by.css(css.sub_tab_report)).click();
}

var createNewForm = () => {

    //enter form name
    element(by.css(css.btn_create_form)).click();
    element(by.id(id.input_formname)).clear().sendKeys(forms.formname);

   
    //section 1 text 
    setSectionName(0);
    setQuestionsWithoutSelection(0,0,0);
    element(by.id('e2e-add-question-'+0)).click();
    setQuestionsWithoutSelection(0,1,0);

    //section 2 multiple select 
    addSection()
    setSectionName(1);
    setQuestionsWithSelection(1,0,3);
    element(by.id('e2e-add-question-'+1)).click();
    setQuestionsWithSelection(1,1,3);

    //section 3 radio 
    addSection()
    setSectionName(2);
    setQuestionsWithSelection(2,0,4);
    element(by.id('e2e-add-question-'+2)).click();
    setQuestionsWithSelection(2,1,4);

    //section 4 dropdown 
    addSection()
    setSectionName(3);
    setQuestionsWithSelection(3,0,2);
    element(by.id('e2e-add-question-'+3)).click();
    setQuestionsWithSelection(3,1,2);


    //section 5 paragraph 
    addSection()
    setSectionName(4);
    setQuestionsWithoutSelection(4,0,1);
    element(by.id('e2e-add-question-'+4)).click();
    setQuestionsWithoutSelection(4,1,1);

    //section 6 date 
    addSection()
    setSectionName(5);
    setQuestionsWithoutSelection(5,0,5);
    element(by.id('e2e-add-question-'+5)).click();
    setQuestionsWithoutSelection(5,1,5);

    //save form
    element(by.id('e2e-save-form')).click();

    //check table list if displayed
    element(by.css(css.sub_tab_form)).click();

    //check if form is save as first row
    let list_forms = element.all(by.css(css.td_newest_form));
    let new_form = list_forms.get(0);

    expect(new_form.getText()).toEqual(forms.formname);
}

var approveNewForm = () => {

    //check table list if displayed
    element(by.css(css.sub_tab_form)).click();

    //check if form is save as first row
    //let list_forms = element.all(by.deepCss('.e2e-approve-newest-form'));

    /*
    let list_forms = element.all(by.css('.e2e-newest-form-btn'));
    let approve_btn = list_forms.element(by.deepCss('.e2e-newest-form-approve-btn'));
    */
    let approve_btn = 
    element(by.tagName('app-pcariform-list'))
    .element(by.id('e2e-newest-form-btn-0'))
    .element(by.css('.e2e-newest-form-approve-btn'));

    /*
    browser.wait(until.presenceOf(approve_btn), 3000, 'questionContent taking too long');
    browser.driver.manage().window().maximize();
    browser.driver.sleep(3000);
    */
    //approve update table list if displayed
    approve_btn.click();
    browser.driver.sleep(3000);
    //element(by.css('.e2e-approve-newest-form')).click();
}


var setQuestionsWithoutSelection = (sectionIndex,questionIndex,questionType) => {
    let questionContent = PageObjects(sectionIndex,questionIndex);

    browser.wait(until.presenceOf(questionContent), 3000, 'questionContent taking too long');
    setQuestion(sectionIndex,questionIndex,questionContent);

    //trigger question Type
    setQuestionType(questionContent,questionType);
}

var setQuestionsWithSelection = (sectionIndex,questionIndex,questionType) => {
    let questionContent = PageObjects(sectionIndex,questionIndex);

    browser.wait(until.presenceOf(questionContent), 3000, 'questionContent taking too long');
    setQuestion(sectionIndex,questionIndex,questionContent);

    //trigger question Type
    setQuestionType(questionContent,questionType);
    setQuestionOption(sectionIndex,questionIndex,questionContent);
}

var PageObjects = (sectionIndex,questionIndex) => {

    let formSectionArray = element(by.tagName('form-section-array'));

    let formSection = formSectionArray.element(by.id('e2e-form-section-'+sectionIndex)).element(by.tagName('form-section'));

    let questionContentArray = formSection.element(by.tagName('question-content-array'));
    
    let questionContent = questionContentArray.element(by.id('e2e-question-content-'+ sectionIndex +'-'+questionIndex))
                            .element(by.tagName('question-content'));

    return questionContent;
}

var setQuestion = (sectionIndex,questionIndex, questionContent) => {

    var foo = questionContent.element(by.id('e2e-question-content-label-'+sectionIndex+'-'+questionIndex));
    foo.clear().sendKeys('Section '+ sectionIndex + ' Question ' + questionIndex);
}

var setQuestionType = (questionContent,questionType) => {
    var dropdown_trigger1 = questionContent.all(by.tagName('mat-select'));

    browser.wait(until.presenceOf(dropdown_trigger1), 3000, 'questionContent taking too long');
    dropdown_trigger1.click();

    // set 1st question type in 1st section
    var overlay0 = element(by.css('.cdk-overlay-container'));
    var select_content0 = overlay0.element(by.deepCss('.mat-select-content'));;
    var dropdown_options0 = select_content0.all(by.tagName('mat-option'));

    dropdown_options0.get(questionType).click();
}

var setQuestionOption = (sectionIndex,questionIndex,questionContent) => {
    var questionOption = questionContent.all(by.tagName('question-option-array'))
                               .all(by.tagName('question-option'));
    // set 1st option in question 
    for (var i = 0; i < 3; i++){
        if(i != 0) {
            element(by.id('e2e-add-option-'+sectionIndex+'-'+questionIndex)).click();
        }

        browser.wait(until.presenceOf(questionOption), 3000, 'elem taking too long');
        let option1 = questionOption.get(i).element(by.id('e2e-question-option-'+sectionIndex+'-'+questionIndex+'-'+i));
        option1.clear().sendKeys('Section ' + sectionIndex + ' Question ' + questionIndex + ' Option '+i);
    }
}

var addQuestion = () => {
    element(by.css('.e2e-add-question')).click();
}

var setSectionName = (sectionIndex) => {
    const s1 = element(by.tagName('form-section-array'))
              .element(by.id('e2e-form-name-'+sectionIndex));
    s1.clear().sendKeys('Section '+sectionIndex);
}

var addSection = () => {
    element(by.css('.e2e-add-new-section')).click();
}

var createNewCase = () => {
    element(by.css(css.btn_create_case)).click();
    element(by.id(id.input_casenumber)).clear().sendKeys(cases.casenumber);
    element(by.css(css.btn_save_case)).click();
    element(by.css(css.sub_tab_case)).click();

    let list_cases = element.all(by.css(css.td_newest_case));
    let new_case = list_cases.first();

    expect(new_case.getText()).toEqual(cases.casenumber);
}

var addFormToNewCase = () => {

    //select newest case
    let list_cases = element.all(by.css(css.btn_update_case));
    let btn_new_case = list_cases.get(0);

    //click newest case update
    btn_new_case.click();

    const form_list = element(by.tagName('app-pcaricase-form-list'))
    const btn_add = form_list.element(by.css('.e2e-add-form'));
    btn_add.click();

    //add form
    const foo = element(by.tagName('app-pcaricase-form-add')).element(by.css('.e2e-select-newest-case'));
    foo.click();

    //add select
    const foobar = element(by.css('.e2e-add-form-to-case'));
    foobar.click();

    //save
    element(by.css(css.btn_save_case)).click();
}

var inputDataFormToNewCase = () => {

    //select newest case
    let list_cases = element.all(by.css(css.btn_update_case));
    let btn_new_case = list_cases.get(0);

    //click newest case update
    btn_new_case.click();

    browser.driver.manage().window().maximize();
    const form_list = element(by.tagName('app-pcaricase-form-list'))
    //let btn_update =  form_list.all(by.css('.e2e-update-case-form')).get(0);
    browser.wait(until.presenceOf(form_list), 3000, 'questionContent taking too long');
    browser.wait(until.visibilityOf(form_list), 3000, 'questionContent taking too long');
    let btn_update =  form_list.all(by.deepCss('.e2e-update-case-form-0')).click();
    //browser.wait(until.presenceOf(btn_update), 3000, 'questionContent taking too long');
    //btn_update.click();

    const dynamic_form = element(by.tagName('app-dynamic-form'));
    //const form_editor = dynamic_form.all(by.css('.form-editor-body')).get(1);
    const form_editor = dynamic_form.all(by.css('.form-editor-body')).get(1);

    answerText(form_editor);
    answerParagraph(form_editor);
    answerText(form_editor);
    answerMultipleSelect(form_editor);
    answerRadio(form_editor);
    //answerDropdown(form_editor,6);
    //answerDropdown(form_editor,7);
    answerParagraph(form_editor);
    answerDate(form_editor);
    //dynamic_form.element(by.id('e2e-save-data-form-id')).click();

    //let save_btn = element(by.deepCss('.e2e-save-data-form'));
    let save_btn = element(by.id('e2e-save-data-form-id'));

    browser.driver.manage().window().maximize();
    browser.wait(until.presenceOf(save_btn), 3000, 'questionContent taking too long');
    browser.wait(until.visibilityOf(save_btn), 3000, 'questionContent taking too long');

    //browser.driver.sleep(3000)

    browser.actions().mouseMove(save_btn).click().perform();
    //save_btn.click();

    //answerForm();

}

var answerFormx = () => {
    const dynamic_form = element(by.tagName('app-dynamic-form'));
    //const form_editor = dynamic_form.all(by.css('.form-editor-body')).get(1);
    const form_editor = dynamic_form.all(by.css('.form-editor-body')).get(1);

    answerText(form_editor);
    answerMultipleSelect(form_editor);
    answerRadio(form_editor);
    //answerDropdown(form_editor,6);
    //answerDropdown(form_editor,7);
    answerParagraph(form_editor);
    answerDate(form_editor);


    const dynamic_form1 = element(by.tagName('app-dynamic-form'))
    .element(by.tagName('form'))
    .element(by.tagName('button'));
    browser.wait(until.presenceOf(dynamic_form1), 3000, 'questionContent taking too long');
    dynamic_form1.element(by.id('e2e-save-data-form-id')).click();

    /*
    answerText(form_editor);
    answerMultipleSelect(form_editor);
    answerRadio(form_editor);
    //answerDropdown(form_editor,6);
    //answerDropdown(form_editor,7);
    answerParagraph(form_editor);
    answerDate(form_editor);

    */
    //browser.driver.sleep(30000);
    //dynamic_form.element(by.deepCss('.e2e-save-data-form')).click();
    //dynamic_form.element(by.id('e2e-save-data-form-id')).click();
   // element(by.id('e2e-save-data-form-id')).click();
}

var answerText = (form_editor) => {

    const df_question0 = form_editor.all(by.tagName('df-question')).get(0);
    let input_field0 = df_question0.element(by.deepCss('.mat-input-element'));
    input_field0.sendKeys('Section 1 Question 0');

    const df_question1 = form_editor.all(by.tagName('df-question')).get(1);
    let input_field1 = df_question1.element(by.deepCss('.mat-input-element'));
    input_field1.sendKeys('Section 1 Question 1');
}

var answerMultipleSelect = (form_editor) => {

}

var answerRadio = (form_editor) => {

    /*
    const df_question0 = form_editor.all(by.tagName('df-question')).get(4);
    let radio_group = df_question0.all(by.tagName('.mat-radio-group')).get(0);
    let radio_btn = radio_group.element(by.tagName('mat-radio-button')).click();
    */

    const df_question0 = form_editor.all(by.tagName('df-question')).get(4);
    let radio_group0 = df_question0.element(by.tagName('.mat-radio-group'));
    let radio_btn0 = radio_group0.all(by.tagName('mat-radio-button')).get(2).click();

    const df_question1 = form_editor.all(by.tagName('df-question')).get(5);
    let radio_group1 = df_question1.element(by.tagName('.mat-radio-group'));
    let radio_btn1 = radio_group1.all(by.tagName('mat-radio-button')).get(1).click();

    //let btn = radio_group.element(by.deepCss('.mat-radio-input'));

    //browser.wait(until.presenceOf(btn), 3000, 'questionContent taking too long');
    //btn.click();
}

var answerDropdown = (form_editor,index,order) => {

    const df_question0 = form_editor.all(by.tagName('df-question')).get(index);
    var dropdown_trigger0 = df_question0.element(by.tagName('mat-select')).click();

    // set 1st question type in 1st section

   // set 1st question type in 1st section
   var overlay0 = element(by.css('.cdk-overlay-container'));
   var select_content0 = overlay0.element(by.deepCss('.mat-select-content'));;

   //browser.wait(until.presenceOf(select_content0), 3000, 'questionContent taking too long');

   var dropdown_options0 = select_content0.all(by.tagName('mat-option')).get(1);
   dropdown_options0.click();

}

var answerParagraph = (form_editor) => {

    const df_question0 = form_editor.all(by.tagName('df-question')).get(8);
    let input_field0 = df_question0.element(by.deepCss('.mat-input-element'));
    input_field0.sendKeys('Section 4 Question 0');

    const df_question1 = form_editor.all(by.tagName('df-question')).get(9);
    let input_field1 = df_question1.element(by.deepCss('.mat-input-element'));
    input_field1.sendKeys('Section 4 Question 1');
}

var answerDate = (form_editor) => {

    const df_question0 = form_editor.all(by.tagName('df-question')).get(10);
    let input_field0 = df_question0.element(by.deepCss('.mat-input-element'));
    input_field0.sendKeys('3/7/2018');

    const df_question1 = form_editor.all(by.tagName('df-question')).get(11);
    let input_field1 = df_question1.element(by.deepCss('.mat-input-element'));
    input_field1.sendKeys('3/7/2019');

}


module.exports = {
 navigateToLogin,
 navigateToBiobankHome,
 navigateToBiobankCases,
 navigateToBiobankForms,
 navigateToBiobankReports,
 createNewForm,
 approveNewForm,
 createNewCase,
 addFormToNewCase,
 inputDataFormToNewCase
} 
