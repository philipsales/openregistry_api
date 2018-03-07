
var biobank = { 
    "home_url" : "http://localhost:4200/my-account/info",
    "root_url" : "/biobanking",
    "cases_url" : "/biobank/cases",
    "forms_url" : "/biobank/forms",
    "reports_url" : "/biobank/reports",
    "locator" : {
        "id" : {
            "input_username" : "username",
            "input_password" : "password",
            "input_formname" : "formname",
            "input_casenumber" : "casenumber",
            "btn_login" : "login_btn",
        },
        "css" : {
            "main_tab_biobank" : ".e2e-biobank",
            "sub_tab_case" : ".e2e-biobank-case",
            "sub_tab_form" : ".e2e-biobank-form",
            "sub_tab_report" : ".e2e-biobank-report",
            "btn_create_form" : ".e2e-create-form",
            "btn_create_case" : ".e2e-create-case",
            "btn_save_form" : ".e2e-save-form",
            "btn_add_form" : ".e2e-add-form",
            "btn_save_case" : ".e2e-save-case",
            "btn_update_case" : ".e2e-update-newest-case",
            "td_newest_form" : ".e2e-newest-form",
            "td_newest_case" : ".e2e-newest-case",
            "checkbox_newest_case" : ".e2e-select-newest-case",
            "btn_add_form_to_case" : ".e2e-add-form-to-case"
        } 
    },
 };

module.exports = {
  biobank 
} 