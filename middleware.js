let jwt = require('jsonwebtoken');
const config = require('./config');

let checkToken = (req, res, next) => {
    let token = req.get('Authorization');
    console.log('Token', token);
    if(token === null) {
        console.log('Authorization Header is Empty', token);
        return res.json({
            success: false,
            message: 'Authorization Header is Empty'
        });
    } else if (token === undefined){
        console.log('Header Content Not Enough');
        return res.json({
            success: false,
            message: 'Authorization Header Not Provided'
        });
    } else if(token.startsWith('Bearer ')){
        token = token.slice(7, token.length);
        if(token) {
            jwt.verify(token, config.secret, (err, decoded) => {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Token is not valid'
                    });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            return res.json({
                success: false,
                message: 'Auth Token is not supplied'
            });
        }
    }
};

module.exports = {
    checkToken: checkToken
}