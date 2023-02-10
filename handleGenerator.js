let jwt = require('jsonwebtoken');
let config = require('./config');
let user = require('./models').Users;
let vendor = require('./models').Vendors;
let bcrypt = require('bcrypt');

handleGenerator = {
    login: function(req, res) {
        let username = req.body.username;
        let password = req.body.password;
        user.findOne({
            attributes: ['id', 'username', 'password'],
            where: {username: username}
        }, error => {
            console.log(error);
        }).then(userlogin => {
            console.log(userlogin);
            if(userlogin === null) {
                user.findOne({
                    attributes: ['id', 'username', 'password'],
                    where: {email: username}
                }, error => {
                    console.log(error);
                }).then(userlogin2 => {
                    if(userlogin2 === null) {
                        vendor.findOne({
                            attributes: ['id', 'email', 'password'],
                            where: {email: username}
                        }, error => {
                            console.log(error);
                        }).then(vendorlogin => {
                            if(vendorlogin === null) {

                            } else {
                                console.log('Username: ', username);
                                bcrypt.compare(password, vendorlogin.password, (err, res2) => {
                                    console.log(password);
                                    if(res2) {
                                        console.log(res2);
                                        let token = jwt.sign({email: vendorlogin.email},
                                            config.secret,
                                            {expiresIn: '24h'});
                                        res.json({
                                            success: true,
                                            message: 'Authentication Successful!',
                                            token: token,
                                            role: 'vendor',
                                            isUser: false
                                        });
                                    } else {
                                        res.json({
                                            success: false,
                                            message: 'Oops!!! Wrong Password!!!!!'
                                        });
                                    }
                                });
                            }
                        })
                    } else if(password === userlogin2.password) {
                        let token = jwt.sign({username: userlogin2.username},
                            config.secret,
                            {expiresIn: '24h'});
                        res.json({
                            success: true,
                            message: 'Authentication Successful!',
                            token: token,
                            role: 'user',
                            isUser: true
                        });
                    } else {
                        res.json({
                            success: false,
                            message: 'Oops!!! Wrong Password!!!!!'
                        });
                    }    
                });
            } else if(password === userlogin.password) {
                let token = jwt.sign({username: username},
                    config.secret,
                    {expiresIn: '24h'});
                res.json({
                    success: true,
                    message: 'Authentication Successful!',
                    token: token,
                    role: 'user',
                    isUser: true
                });
            } else {
                res.json({
                    success: false,
                    message: 'Oops!!! Wrong Password!!!!!'
                });
            }
        }, err => {
            console.log('Error!!!', err);
            res.json({
                success: false,
                message: 'User Not Found'
            });
        });
        // let mockedUsername = 'admin';
        // let mockedPassword = 'password';

        // if(username && password) {
        //     if(username === mockedUsername && password === mockedPassword) {
        //         let token = jwt.sign({username: username},
        //             config.secret,
        //             {expiresIn: '24h'});

        //         res.json({
        //             success: true,
        //             message: 'Authentication Successful!',
        //             token: token
        //         });
        //     } else {
        //         res.send(400).json({
        //             success: false,
        //             message: 'Authentication failed! Please check the request'
        //         });
        //     }
        // }
    },
    index: function(req, res) {
        res.json({
            success: true,
            message: 'Index Page'
        })
    }
}

function hashPassword(password) {
    return bcrypt.hash(password, 10).then(function(password2) {
        console.log('HAsh: ' + password2);
        password = password2;
    });
  }

exports.data = handleGenerator;