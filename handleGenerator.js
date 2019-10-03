let jwt = require('jsonwebtoken');
let config = require('./config');
let user = require('./models').Users;

handleGenerator = {
    login: function(req, res) {
        let username = req.body.username;
        let password = req.body.password;
        user.findOne({
            where: {username: username}
        }, error => {
            console.log(error);
        }).then(userlogin => {
            if(userlogin === null) {
                res.json({
                    success: false,
                    message: 'Username does not exist.'
                })
            } else if(password === userlogin.password) {
                let token = jwt.sign({username: username},
                    config.secret,
                    {expiresIn: '24h'});
                res.json({
                    success: true,
                    message: 'Authentication Successful!',
                    token: token,
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

exports.data = handleGenerator;