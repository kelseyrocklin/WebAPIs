// BASE setup - - - - - - - - - - - - - - - - - - - - - - -

// CALL packages - - - - - - -
var express     = require('express'); // calls express
var app         = express(); // define the app using express
var bodyParser  = require('body-parser'); // get body-parser
var morgan      = require('morgan'); // used to see requests
var mongoose    = require('mongoose'); // for database work
var port        = process.env.PORT || 8080; // sets the port the app will use

// pulls in the user model
var User        = require('./app/models/user');

// APP configuration - - - - -
// uses body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({extend: true}));
app.use(bodyParser.json());

// configure the app to handle CORS requests - GET/POST
app.use(function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, /Authorization');
    next();
});

// log all requests to the console
app.use(morgan('dev'));

// connect to the database
mongoose.connect('mongodb://localhost:27017/myDatabase');

// ROUTES FOR API - - - - - - - - - - - - - - - - - - - - - - -

// home page route
app.get('/', function(req, res){
    res.send('Welcome to the home page!');
});

// get an instance of the express router
var apiRouter = express.Router();

// middleware to use for all the requests
apiRouter.use(function(req, res, next) {
    // do logging
    console.log('Somebody just came to our app!');

    // more will get added in chapter 10
    // this is where users get authenticated

    next(); // makes sure we go to the next routes and don't stop here
});

// test route to make sure everything is working
// accessed at GET http://localhost:8080/api
apiRouter.get('/', function(req, res){
    res.json({ message: 'hooray! welcome to our api!'});
});

// more routes for the api will happen here

// on routes that end in /users =========================================================
apiRouter.route('/users')

    // create a user (accessed at POST http://localhost:8080/api/users
    .post(function(req, res){

        // create a new instance of the user model
        var user = new User();

        // set the users information (comes from the request)
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        // save the user and check for errors
        user.save(function(err) {
            if(err){
                // duplicate entry
                if(err.code == 11000)
                    return res.json({success:false, message:
                    'A user with that name already exists.'});
                else
                    return res.send(err);
            }

            res.json({message: 'User created!'});

        });
    }) // no semi-colon here
    // end .post function

    // get all the users (accessed at GET http://localhost:8080/api/users)
    .get(function(req, res){
        User.find(function(err, users){
            if (err) res.send(err);

            // returns all the users
            res.json(users);
        });
    }); // semi-colon at the END of all the http word functions

// on routes that end in /users/:user_id ======================================================

apiRouter.route('/users/:user_id')

    // get the user with that id
    // (accessed at GET http://localhost:8080/api/users/:user_id)
    .get(function(req, res){
        User.findById(req.params.user_id, function(err, user){

            if(err) res.send(err);

            // return that user
            res.json(user);
        });
    })

    // update the user with this id
    // (accessed at PUT http://localhost:8080/api/users/:user_id)
    .put(function(req, res){

        // use the user model to find the user we want
        User.findById(req.params.user_id, function(err, user){

            if(err) res.send(err);

            // update the user's info only if it's new
            if (req.body.name) user.name = req.body.name;
            if (req.body.username) user.username = req.body.username;
            if (req.body.password) user.password = req.body.password;

            // save the user
            user.save(function(err) {
                if(err) res.send(err);

                // return a message
                res.json({message: 'User updated!'});
            });
        });
    })

    // delete the user with this id
    // accessed at DELETE http://localhost:8080/api/users/:user_id
    .delete(function(req, res){
        User.remove({
            _id: req.params.user_id
        }, function(err, user){
            if(err) return re4s.send(err);

            res.json({message: 'Successfully deleted'});
        });
    });

// Register our routes - - - - - - - - - - - - - - -
// all of our routes will be prefixed with /api
app.use('/api', apiRouter);

// start the server - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
app.listen(port);
console.log('Magic happens on port ' + port);