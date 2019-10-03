var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var path = require('path');
var multer = require('multer');
var session = require('express-session');
var handlers = require('./handleGenerator');
var middleware = require('./middleware');

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

app.post('/categories', (req, res) => {
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
    }).then(newUsers => {
            delete newUsers['password'];
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
    models.Vendors.create({
        name: req.body.name,
        address: req.body.address,
        contact: req.body.contact,
        email: req.body.email,
        password: req.body.password
    })
        .then(newVendors => {
            delete newVendors['password'];
            res.json(
                newVendors
                /*{
                "success": true,
                "message": "Vendor Created Successfully"
            }*/);
        });
});

app.get('/vendors', (req, res) => {
   models.Vendors.findAll()
       .then(vendors => {
           res.json(vendors);
       })
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

app.post('/products', (req, res) => {
    upload(req, res, function(err) {
        if(err) {
            console.log(err);
            console.log('Files', req.files);
            return res.end("Error Uploading File");
        } else {
            console.log(req.body);
            console.log('File is uploaded', req.files);
            console.log("Dates " + dates);
            models.Products.create({
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                rating: req.body.rating,
                vendor_id: req.body.vendor_id,
                category_id: req.body.category_id,
                image: dates.join(" ")
            }).then(newProducts => {
                res.json(newProducts);
            });
        }
        console.log('Date', dates);
        dates = [];
    });
});

app.get('/products', (req, res) => {
   models.Products.findAll()
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
        where: ["title like ?", '%' + searchName + '%']
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
