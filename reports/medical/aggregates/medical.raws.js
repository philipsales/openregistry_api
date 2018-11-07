'use strict';

var setFoo = function(questionniare) {
    return [
        { 
            "$project" : {
                "_id" : 1.0, 
                "case_number" : "$case_number", 
                "diagnosis" : "$diagnosis", 
                "forms" : "$forms"
            }
        }, 
        { 
            "$unwind" : {
                "path" : "$forms"
            }
        }, 
        { 
            "$lookup" : {
                "from" : "questions_label", 
                "as" : "questions_label", 
                "localField" : "forms.form_name", 
                "foreignField" : "_id.form_name"
            }
        }, 
        { 
            "$unwind" : {
                "path" : "$questions_label"
            }
        }, 
        { 
            "$lookup" : {
                "from" : "questions_options", 
                "as" : "questions_options", 
                "localField" : "forms.form_name", 
                "foreignField" : "_id.form_name"
            }
        }, 
        { 
            "$unwind" : {
                "path" : "$questions_options"
            }
        }, 
        { 
            "$project" : {
                "_id" : 0.0, 
                "case_id" : "$_id", 
                "case_number" : "$case_number", 
                "diagnosis" : "$diagnosis", 
                "form_date_created" : "$forms.date_created", 
                "form_id" : "$forms.form_id", 
                "form_name" : "$forms.form_name", 
                "questions" : "$questions_label.label", 
                "options" : "$questions_options.options", 
                "answers" : "$forms.answers.question_answer", 
                "size" : {
                    "$size" : "$forms.answers.question_answer"
                }
            }
        }, 
        { 
            "$project" : {
                "id" : true, 
                "case_number" : true, 
                "case_id" : true, 
                "diagnosis" : true, 
                "form_id" : true, 
                "form_name" : true, 
                "form_date_created" : true, 
                "answers" : 1.0, 
                "arrayElement" : {
                    "$arrayElemAt" : [
                        "$answers", 
                        1.0
                    ]
                }, 
                "arrayElementz" : [
                    ""
                ], 
                "key_value" : {
                    "$arrayToObject" : {
                        "$map" : {
                            "input" : "$questions", 
                            "as" : "question", 
                            "in" : {
                                "$cond" : {
                                    "if" : {
                                        "$eq" : [
                                            {
                                                "$let" : {
                                                    "vars" : {
                                                        "varin" : {
                                                            "$cond" : [
                                                                {
                                                                    "$arrayElemAt" : [
                                                                        "$answers", 
                                                                        {
                                                                            "$indexOfArray" : [
                                                                                "$questions", 
                                                                                "$$question"
                                                                            ]
                                                                        }
                                                                    ]
                                                                }, 
                                                                {
                                                                    "$arrayElemAt" : [
                                                                        "$answers", 
                                                                        {
                                                                            "$indexOfArray" : [
                                                                                "$questions", 
                                                                                "$$question"
                                                                            ]
                                                                        }
                                                                    ]
                                                                }, 
                                                                [
                                                                    ""
                                                                ]
                                                            ]
                                                        }
                                                    }, 
                                                    "in" : {
                                                        "$size" : {
                                                            "$reduce" : {
                                                                "input" : [
                                                                    "$$varin"
                                                                ], 
                                                                "initialValue" : "", 
                                                                "in" : "$$varin"
                                                            }
                                                        }
                                                    }
                                                }
                                            }, 
                                            1.0
                                        ]
                                    }, 
                                    "then" : {
                                        "k" : "$$question", 
                                        "v" : {
                                            "$ifNull" : [
                                                {
                                                    "$min" : {
                                                        "$arrayElemAt" : [
                                                            "$answers", 
                                                            {
                                                                "$indexOfArray" : [
                                                                    "$questions", 
                                                                    "$$question"
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                }, 
                                                ""
                                            ]
                                        }
                                    }, 
                                    "else" : {
                                        "k" : "$$question", 
                                        "v" : {
                                            "$arrayElemAt" : [
                                                "$answers", 
                                                {
                                                    "$indexOfArray" : [
                                                        "$questions", 
                                                        "$$question"
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }, 
        { 
            "$addFields" : {
                "key_value._id" : "$id", 
                "key_value._case_id" : "$case_id", 
                "key_value._case_number" : "$case_number", 
                "key_value._form_id" : "$form_id", 
                "key_value._form_name" : "$form_name", 
                "key_value._form_date_created" : "$form_date_created", 
                "key_value._diagnosis" : "$diagnosis"
            }
        }, 
        { 
            "$replaceRoot" : {
                "newRoot" : "$key_value"
            }
        }, 
        { 
            "$project" : {
                "date_created" : "$_form_date_created", 
                "ROOT" : "$$ROOT", 
                "_id" : 1.0, 
                "map" : {
                    "$map" : {
                        "input" : {
                            "$objectToArray" : "$$ROOT"
                        }, 
                        "as" : "root", 
                        "in" : {
                            "$cond" : {
                                "if" : {
                                    "$eq" : [
                                        {
                                            "$isArray" : "$$root.v"
                                        }, 
                                        true
                                    ]
                                }, 
                                "then" : {
                                    "$arrayToObject" : {
                                        "$map" : {
                                            "input" : "$$root.v", 
                                            "as" : "value", 
                                            "in" : [
                                                {
                                                    "$concat" : [
                                                        "$$root.k", 
                                                        " - ", 
                                                        "$$value"
                                                    ]
                                                }, 
                                                1
                                            ]
                                        }
                                    }
                                }, 
                                "else" : {
                                    "$arrayToObject" : {
                                        "$map" : {
                                            "input" : {
                                                "$objectToArray" : "$$root"
                                            }, 
                                            "as" : "value", 
                                            "in" : [
                                                "$$root.k", 
                                                "$$root.v"
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }, 
        { 
            "$unwind" : {
                "path" : "$map"
            }
        }, 
        { 
            "$group" : {
                "_id" : "$date_created", 
                "results" : {
                    "$mergeObjects" : "$map"
                }
            }
        }, 
        { 
            "$replaceRoot" : {
                "newRoot" : "$results"
            }
        }, 
        { 
            "$match" : {
                "_form_name" :  questionniare
            }
        }, 
        { 
            "$out" : "medicalreports"
        }
    ]
    
}

module.exports = {
    setFoo,
}