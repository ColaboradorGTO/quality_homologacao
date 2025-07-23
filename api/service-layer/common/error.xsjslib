function messageAsString (code, place, err) {
    
    var errorObj = {
        "error" : {
            code : code,
            place : place,
            message : err.toString()
        }
    };
    
    return JSON.stringify(errorObj);
}