
var data = {
    "valid": {
        "username": "admin@admin.com",
        "password": "kryptonite",
        "response": "200"
    },
    "invalid": {
        "username": "foo",
        "password": "bar",
        "response": "Username or password is incorrect"
    }
};

var admin = { 
    "admin_home_url" : "/admin",
    "admin_users_url" : "/admin/users/list",
    "admin_roles_url" : "/admin/roles/list",
    "admin_database_url" : "/admin/database/list",
    "locator" : {
        "id" : {
            "input_username" : "username",
            "input_password" : "password",
        },
        "css" : {
            "btn_login" : "login_btn",
            "res_error" : ".alert.alert-danger"
        } 
    },
 };

module.exports = {
  data,
  admin 
} 