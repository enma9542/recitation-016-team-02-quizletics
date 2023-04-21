// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.


app.use(express.static("resources")); // lets us access the resources folder from the browser
// const quiz = require('/js/quiz.js');
var msg = '';
var msgerr = false;

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS

app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

//API Routes Go Here
//quiz page
app.get('/', (req, res) => {
  axios.get('https://the-trivia-api.com/v2/questions?limit=5&categories=history&difficulties=easy')
    .then(response => {
      const data = response.data;
      // quiz(data);
      // console.log(data);
      res.render('pages/quiz', { data: data });
    })
    .catch(error => {
      console.log(error);
      res.send('An error occurred connecting to trivia api');
    });
});

// app.get('/', (req, res) => {
//   res.render('pages/home')
// });

//Test API
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.post('/login', async (req, res) => {
    var username = req.body.username;
    console.log(username);
    var loginQuery = `SELECT * FROM users WHERE username = '${username}';`;
    db.any(loginQuery)
      .then(async data=>{
        console.log("login:");
        console.log(req.body.password);
        console.log(data);
        const match = await bcrypt.compare(req.body.password, data[0].password);
        console.log(match);
        if (match){
            req.session.user = data;
            req.session.save();
            res.redirect('/home');
        } else {
          res.render('pages/login', {message: "Incorrect Password."});
        }
      })
      .catch(err => {
        console.log(`${err}`);
        res.redirect('/register');
      });
});

// Register
app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  if(req.body.password != req.body.password_confirm){
    res.render('pages/register', {message: "Passwords do not match", error: true});
  }
  const hash = await bcrypt.hash(req.body.password, 10);

  // To-DO: Insert username and hashed password into 'users' table
  const searchQuery = "SELECT * FROM users where username = $1";
  const insertQuery = "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) returning *;"
  const values = [req.body.username, hash, req.body.email];

  db.any(searchQuery, [req.body.username])
  .then(data => {
    if(data && (data.length > 0)){
      res.render('pages/register', {message: "Username Already Exists, Please Choose New Username.", error: true});
    }
    else{
      db.any(insertQuery, values)
      .then(data => {
        //console.log(data);
        res.render('pages/login', {message: "User Added Successfully", error: false});
      });
    }
  });

});

app.get('/register', (req, res) => {
  res.render("pages/register", {
    message: msg,
    error: msgerr,
  });
  msg = '';
  msgerr = false;
});

app.get('/userProfile', (reg, res) =>{
  var avgScore;
  var highScore;

});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/login", {message: 'Logged Out Successfully.'});
});


// //quiz page
// app.get('/quiz', (req, res) => {
//   axios.get('https://the-trivia-api.com/v2/questions')
//     .then(response => {
//       const data = response.data;
//       console.log(data);
//       res.render('pages/quiz', { data: data });
//     })
//     .catch(error => {
//       console.log(error);
//       res.send('An error occurred connecting to trivia api');
//     });
// });

// Authentication Middleware.
const auth = (req, res, next) => {
    if (!req.session.user) {
      // Default to login page.
      return res.redirect('/login');
    }
    next();
};
  

// Authentication Required
app.use(auth);

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');