
var data = {
    "valid": {
        "username": "biobank@admin.com",
        "password": "topsecret",
        "response": "200"
    },
    "invalid": {
        "username": "foo",
        "password": "biar",
        "response": "Username or password is incorrect"
    },
    "admin_user": {
        "username": "admin@admin.com",
        "password": "kryptonite",
        "response": "200"
    },
    "biobank_user": {
        "username": "biobank@admin.com",
        "password": "topsecret",
        "response": "200"
    },
    "medical_user": {
        "username": "medical@admin.com",
        "password": "topsecret",
        "response": "200"
    }
   
};

module.exports = {
  data
} 