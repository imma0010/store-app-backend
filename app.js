var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var path = require('path');
var multer = require('multer');
var session = require('express-session');
var handlers = require('./handleGenerator');
var middleware = require('./middleware');
var jwt = require('jsonwebtoken');
var config = require('./config');
var crypto = require('crypto-random-string');
var sendEmail = require('./emailverification');
var sequelize = require('sequelize');
var op = sequelize.Op;

var app = express();

const models = require('./models');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(cors());

app.use(session({
    secret: 'itshashish',
    resave: true,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

var dates = [];

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/images');
    },
    filename: function (req, file, callback) {
        var date = Date.now();
        dates.push(date);
        callback(null, date + ".jpg");
    }
});

var upload = multer({ storage : storage }).array('image', 4);

app.post('/categories', (req, res, ) => {
    const name = req.body.name;
    const description = req.body.description;
    models.Categories.create({
        name: name,
        description: description
    })
        .then(newCategories => {
            res.json(newCategories);
        });
});

app.get('/categories', (req, res) => {
   models.Categories.findAll()
       .then(categories => {
           res.json(categories);
       })
});

app.get('/categories/:id', (req, res) => {
    const id = req.params.id;
   models.Categories.findOne({
       where: {id: id}
   }).then(categories => {
           res.json(categories);
       });
});

app.put('/categories/:id', (req, res) => {
    const id = req.params.id;

    models.Categories.update({
        name: req.body.name,
        description: req.body.description
    }, {where: {id: id},
        returning: true,
        plain: true})
        .then((result) => {
           res.json(result);
        });
});

app.delete('/categories/:id', (req, res) => {
    const id = req.params.id;

    models.Categories.destroy({
        where: {id: id}
    }).then(deleted => {
        res.json(deleted);
    })
});

app.post('/users', (req, res) => {
    models.Users.create({
        username: req.body.username,
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        address: req.body.address,
        contact: req.body.contact,
        email: req.body.email,
        password: req.body.password
    }, {attributes: ['id', 'username', 'first_name', 'last_name', 'address', 'contact', 'email']}).then(newUsers => {
            res.json(newUsers);
        });
});

app.get('/users', (req, res) => {
   models.Users.findAll()
       .then(users => {
           res.json(users);
       })
});

app.get('/users/:id', (req, res) => {
    const id = req.params.id;
   models.Users.findOne({
       where: {id: id}
   })
       .then(users => {
           res.json(users);
       });
});

app.put('/users/:id', (req, res) => {
    const id = req.params.id;

    models.Users.update({
        username: req.body.username,
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        address: req.body.address,
        contact: req.body.contact,
        email: req.body.email
    }, {where: {id: id},
        returning: true,
        plain: true})
        .then((result) => {
           res.json(result);
        });
});

app.delete('/users/:id', (req, res) => {
    const id = req.params.id;

    models.Users.destroy({
        where: {id: id}
    }).then(deleted => {
        res.json(deleted);
    })
});

app.post('/vendors', (req, res) => {
    req.body.isVerified = false;
    models.Vendors.findOrCreate({
        where: {email: req.body.email},
        defaults: req.body
    })
    .spread((vendor, created) => {
        if(!created) {
            res.json({
                success: false,
                message: 'Vendor with email address already exists'
            });
        } else {
            console.log('Created', JSON.stringify(created));
            models.Vendors.findOne({
                where: {email: req.body.email},
                attributes: ['id', 'email']
            }).then(vendor => {
                if(vendor === null) {
                    res.json({
                        success: false,
                        message: "Vendor with given email already exists"
                    });
                } else {
                    models.VerficationToken.create({
                        vendorId: vendor.id,
                        token: crypto({length: 10})
                    }).then((result) => {
                        sendEmail.data.sendVerificationEmail(req.body.email, result.token);
                        res.json({
                            success: true,
                            message: `${vendor.email} account created successfully`
                        });
                    }).catch((error) => {
                        res.status(500).json(error);
                    });
                }
            });
        }
    }).catch((error) => {
        res.status(500).json(error);
    });
        // .then(newVendors => {
        //     delete newVendors['password'];
        //     res.json(
        //         newVendors
        //         /*{
        //         "success": true,
        //         "message": "Vendor Created Successfully"
        //     }*/);
        // });
});

app.get('/verification', (req, res) => {
    models.Vendors.findOne({
        where: {email: req.query.email}
    }).then(vendor => {
        if(vendor.isVerified) {
            res.status(202).json('Email Already Verified');
        } else {
            models.VerficationToken.findOne({
                where: {token: req.query.token}
            }).then((foundToken) => {
                if(foundToken) {
                    vendor.update({isVerified: true})
                    .then(updatedVendor => {
                        res.status(403).json(`Vendor with ${vendor.email} has been verified`);
                    })
                    .catch(reason => {
                        return res.status(403).json('Verification Failed');
                    });
                } else {
                    res.status(404).json('Token Expired');
                }
            }).catch(reason => {
                res.status(404).json('Token Expired');
            });
        }
    });
});

app.get('/vendors',  (req, res) => {
   models.Vendors.findAll({attributes: ['id', 'name', 'address', 'contact', 'email', 'createdAt', 'updatedAt'], where: {isVerified: true}})
       .then(vendors => {
           res.json(vendors);
       })
});

app.get('/myproducts', middleware.checkToken, function(req, res) {
    let token = req.get('Authorization');
    if(token.startsWith('Bearer ')){
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
                    console.log('Username: ' + decoded.email); 
                    models.Vendors.findOne({attributes: ['id', 'name', 'email'], where: {email: decoded.email}}).then(
                        vendor => {
                            if(vendor === null) {

                            } else {
                                models.Products.findAll({where: {vendor_id: vendor.id}}).then(
                                    products => {
                                        res.json(products);
                                    }
                                );
                            }
                        }
                    )
                }
            });
        } else {
            return res.json({
                success: false,
                message: 'Auth Token is not supplied'
            });
        }
    }
});

app.get('/info', middleware.checkToken, function(req, res) {
    let token = req.get('Authorization');
    if(token.startsWith('Bearer ')){
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
                    console.log('Username: ' + decoded.username);
                    if(decoded.username === undefined) {
                        models.Vendors.findOne({attributes: ['id', 'name', 'email'], where: {email: decoded.email}}).then(
                            vendor => {
                                res.json({
                                    data: vendor,
                                    role: 'vendor'
                                })
                            }
                        )
                    } else {
                        models.Users.findOne({attributes: ['id', 'username'], where: {username: decoded.username}}).then(
                            user => {
                                res.json({
                                    data: user,
                                    role: 'user'
                                })
                            }
                        )   
                    }
                }
            });
        } else {
            return res.json({
                success: false,
                message: 'Auth Token is not supplied'
            });
        }
    }
});

app.get('/vendors/:id', (req, res) => {
    const id = req.params.id;
   models.Vendors.findOne({
       where: {id: id}
   })
       .then(vendors => {
           res.json(vendors);
       });
});

app.put('/vendors/:id', (req, res) => {
    const id = req.params.id;

    models.Vendors.update({
        name: req.body.name,
        address: req.body.address,
        contact: req.body.contact,
        email: req.body.email
    }, {where: {id: id},
        returning: true,
        plain: true})
        .then((result) => {
           res.json(result);
        });
});

app.delete('/vendors/:id', (req, res) => {
    const id = req.params.id;

    models.Vendors.destroy({
        where: {id: id}
    }).then(deleted => {
        res.json(deleted);
    })
});

app.post('/products', middleware.checkToken, function(req, res) {
    let token = req.get('Authorization');
    if(token.startsWith('Bearer ')){
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
                    console.log('Username: ' + decoded.email);
                    models.Vendors.findOne({attributes: ['id', 'email'], where: {email: decoded.email, isVerified: true}}).then(
                        vendor => {
                            console.log('Vendor Id: ' + vendor.id);
                            upload(req, res, function(err) {
                                if(err) {
                                    console.log(err);
                                    console.log('Files', req.files);
                                    return res.end("Error Uploading File");
                                } else {
                                    console.log(req.body);
                                    console.log('File is uploaded', req.files);
                                    console.log(JSON.stringify(vendor));
                                    console.log("Dates " + dates);
                                    models.Products.create({
                                        name: req.body.name,
                                        price: req.body.price,
                                        description: req.body.description,
                                        rating: 0,
                                        vendor_id: vendor.id,
                                        category_id: req.body.category_id,
                                        image: dates.join(" ")
                                    }).then(newProducts => {
                                        res.json({
                                            success: true,
                                            message: "Product Added Successfully!"
                                        });
                                    });
                                }
                                console.log('Date', dates);
                                dates = [];
                            });
                        }
                    )
                }
            });
        } else {
            return res.json({
                success: false,
                message: 'Only Vendors can add product'
            });
        }
    }
});

app.get('/products', function(req, res) {
   models.Products.findAll({include: [{model: models.Vendors, attributes: ['name']}]})
       .then(products => {
           res.json(products);
       })
});

app.get('/products/:id', (req, res) => {
    const id = req.params.id;
   models.Products.findOne({
       where: {id: id}
   })
       .then(products => {
           res.json(products);
       });
});

app.get('/products/search/:searchName', (req, res) => {
    const searchName = '%' + req.params.searchName.toLowerCase() + '%';
    console.log("Search Parameter: " + req.params.searchName);
    models.Products.findAll({
        where: {name: {[op.like]: '%' + searchName + '%'}}
    }).then(products => {
        res.json(products);
    });
});

app.put('/products/:id', (req, res) => {
    const id = req.params.id;

    models.Products.update({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description
    }, {where: {id: id},
        returning: true,
        plain: true})
        .then((result) => {
           res.json(result);
        });
});

app.delete('/products/:id', (req, res) => {
    const id = req.params.id;

    models.Products.destroy({
        where: {id: id}
    }).then(deleted => {
        res.json({
            success: true,
            message: 'Product Successfully Deleted.'
        });
    })
});

app.get('/products/category/:id', (req, res) => {
    const id = req.params.id;
    models.Products.findAll({
        where: {category_id: id}
    }).then(products => {
            res.json(products);
        });
});

app.get('/products/vendor/:id', (req, res) => {
    const id = req.params.id;
    models.Products.findAll({
        where: {vendor_id: id}
    })
        .then(products => {
            res.json(products);
        });
});

app.post('/products/comments', (req, res) => {
    models.Comments.create({
        comment: req.comment,
        user_id: req.user_id,
        product_id: req.product_id
    }).then(newComment => {
        res.json(newComment);
    });
});

app.get('/products/:id/comments', (req, res) => {
    const id = req.params.id;
    models.Comments.findAll({
        where: {product_id: id}
    }).then(comments => {
        res.json(comments);
    });
});

app.get('/user/:id/comments', (req, res) => {
    const id = req.params.id;
    models.Comments.findAll({
        where: {user_id: id}
    }).then(comments => {
        res.json(comments);
    });
});

app.delete('/comments/:id', (req, res) => {
    const id = req.params.id;

    models.Comments.destroy({
        where: {id: id}
    }).then(deleted => {
        res.json(deleted);
    })
});

app.post('/products/ratings', (req, res) => {
    models.Ratings.create({
        rating: req.rating,
        user_id: req.user_id,
        product_id: req.product_id
    }).then(newRating => {
        res.json(newRating);
    });
});

app.get('/products/:id/ratings', (req, res) => {
    const id = req.params.id;
    models.Ratings.findAll({
        where: {product_id: id}
    }).then(ratings => {
        res.json(ratings);
    });
});

app.get('/user/:id/ratings', (req, res) => {
    const id = req.params.id;
    models.Ratings.findAll({
        where: {user: id}
    }).then(ratings => {
        res.json(ratings);
    });
});

app.get('/ratings/user/:userId/product/:productId', (req, res) => {
    const user_id = req.params.userId;
    const product_id = req.params.productId;
    models.Ratings.findAll({
        where: {user: id}
    }).then(ratings => {
        res.json(ratings);
    });
});

app.delete('/ratings/:id', (req, res) => {
    const id = req.params.id;

    models.Ratings.destroy({
        where: {id: id}
    }).then(deleted => {
        res.json(deleted);
    })
});

app.post('/login', (req, res) => {
    console.log("Logging In");
    handlers.data.login(req, res);
});

app.listen(1337, function() {
    console.log("Listening to 1337");
});
