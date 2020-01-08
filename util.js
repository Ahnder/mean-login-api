const jwt = require('jsonwebtoken');

let util = {};

// success json 을 만드는 함수
// API가 return 하는 json의 형태를 통일시키기 위해 바로 함수를 통해
// json 오브젝트를 만들고 이를 return 하게 된다.
util.successTrue = function(data) {
    return {
        success: true,
        message: null,
        errors: null,
        data: data,
    };
};

// API가 성공하지 못한 경우 return하는 json의 형태를 통일시키기 위해 
// error 오브젝트나 message를 받아서 error json을 만드는 함수
util.successFalse = function(err, message) {
    if (!err && !message) message = "Data Not Found";
    return {
        success: false,
        message: message,
        errors: (err) ? util.parseError(err) : null,
        data: null,
    };
};

// mongoose를 통해 resource를 조작하는 과정에서 발생하는 에러를 일정한 형태로 만드는 함수
// resource 조작중에 에러가 mongoose에서 오거나(validation 등)  DB에서 올 수 있는데(DB 에러 등)
// 이때 에러 형태가 다르기 때문에 통일해주는 함수
util.parseError = function(errors) {
    let parsed = {};
    if (errors.name == 'ValidationError') {
        for (var name in errors.errors) {
            let validationError = errors.errors[name];
            parsed[name] = { message: validationError.message };
        }
    } else if (errors.code == '11000' && errors.errmsg.indexOf('username') > 0) {
        parsed.username = { message: "This username already exists!" };
    } else {
        parsed.unhandled = errors;
    }

    return parsed;
};


// Middlewares
// 미들웨어로 token이 있는지 없는지 확인하고 token이 있다면, jwt.verify 함수를 이용해서
// 토큰 hash를 확인하고 토큰에 들어있는 정보를 해독한다.
// 해독한 정보는 req.decoded에 저장하고 이후 로그인 유무는 decoded가 있는지 없는지를
// 통해 알 수 있다.
util.isLoggedIn = function(req, res, next) {
    let token = req.headers['x-access-token'];
    if (!token) return res.json(util.successFalse(null, "token is required!"));
    else {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.json(util.successFalse(err));
            else {
                req.decoded = decoded;
                next();
            }
        });
    }
};


module.exports = util;