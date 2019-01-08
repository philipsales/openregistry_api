'use strict';

var setCountResult = function(criteria) {
    return [
        { 
            "$project" : {
                "map" : {
                    "$map" : {
                        "input" : {
                            "$objectToArray" : "$$ROOT"
                        }, 
                        "as" : "value", 
                        "in" : {
                            "$cond" : {
                                "if" : {
                                    "$eq" : [
                                        {
                                            "$in" : [
                                                {
                                                    "$let" : {
                                                        "vars" : {
                                                            "keys" : {
                                                                "$split" : [
                                                                    "$$value.k", 
                                                                    " - "
                                                                ]
                                                            }
                                                        }, 
                                                        "in" : {
                                                            "$cond" : {
                                                                "if" : {
                                                                    "$ne" : [
                                                                        {
                                                                            "$substr" : [
                                                                                {
                                                                                    "$arrayElemAt" : [
                                                                                        "$$keys", 
                                                                                        0
                                                                                    ]
                                                                                }, 
                                                                                0, 
                                                                                1
                                                                            ]
                                                                        }, 
                                                                        "_"
                                                                    ]
                                                                }, 
                                                                "then" : {
                                                                    "$concat" : [
                                                                        {
                                                                            "$arrayElemAt" : [
                                                                                "$$keys", 
                                                                                0
                                                                            ]
                                                                        }, 
                                                                        " - ", 
                                                                        {
                                                                            "$arrayElemAt" : [
                                                                                "$$keys", 
                                                                                1
                                                                            ]
                                                                        }
                                                                    ]
                                                                }, 
                                                                "else" : {
                                                                    "$arrayElemAt" : [
                                                                        "$$keys", 
                                                                        0
                                                                    ]
                                                                }
                                                            }
                                                        }
                                                    }
                                                }, 
                                                criteria
                                            ]
                                        }, 
                                        true
                                    ]
                                }, 
                                "then" : {
                                    "key" : "$$value.k", 
                                    "value" : "$$value.v"
                                }, 
                                "else" : {
                                    "key" : "", 
                                    "value" : ""
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
            "$match" : {
                "map.key" : {
                    "$exists" : true, 
                    "$ne" : ""
                }
            }
        }, 
        { 
            "$replaceRoot" : {
                "newRoot" : "$map"
            }
        }, 
        { 
            "$group" : {
                "_id" : true, 
                "questions" : {
                    "$push" : {
                        "key" : "$key", 
                        "value" : "$value"
                    }
                }
            }
        }, 
        { 
            "$project" : {
                "results" : {
                    "$arrayToObject" : {
                        "$map" : {
                            "input" : "$questions", 
                            "as" : "root", 
                            "in" : {
                                "v" : "$$root.value", 
                                "k" : "$$root.key"
                            }
                        }
                    }
                }
            }
        }, 
        { 
            "$out" : "medicalreportcountresults"
        }
    ];
}

module.exports = {
    setCountResult,
}