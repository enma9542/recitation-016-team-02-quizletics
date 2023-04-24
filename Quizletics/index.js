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

var user = {
  username: undefined,
  password: undefined,
};

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

//API Routes Go Here

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
    var loginQuery = `SELECT * FROM users WHERE username = '${username}';`;
    db.any(loginQuery)
      .then(async data=>{
        console.log("login:");
        console.log(req.body.password);
        console.log(data[0].password);
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
        console.log(`Username = ${err.username}`);
        res.redirect('/register');
      });
});

// Register
app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);

  // To-DO: Insert username and hashed password into 'users' table
  const searchQuery = "SELECT * FROM users where username = $1";
  const insertQuery = "INSERT INTO users (username, password) VALUES ($1, $2) returning *;"
  const values = [req.body.username, hash];

  db.any(searchQuery, [req.body.username])
  .then(data => {
    if(data && (data.length > 0)){
      res.redirect('/register');
    }
    else{
      db.any(insertQuery, values)
      .then(data => {
        res.redirect('/login'); 
      });
    }
  });
  
});

app.get('/register', (req, res) => {
  res.render("pages/register");
});


// Authentication Middleware.
const auth = (req, res, next) => {
    if (!req.session.user) {
      // Default to login page.
      return res.redirect('/login');
    }
    next();
};

app.get('/userProfile', (reg, res) =>{
  var valUsername = req.session.user.username;
  var quizzesTaken;
  var pointsEarned;
  var totTime;
  var bestTime;
  var bestScore;
  var bestAccuracy;
  var achievement1 = '';
  var achievement2 = '';
  var achievement3 = '';
  var achievement4 = '';

  const qQuizzesTaken = `SELECT COUNT(username) FROM user_to_game WHERE username = '${valUsername}';`;
  const qPointsEarned = `SELECT SUM(score)  FROM games INNER JOIN user_to_game  ON user_to_game.game_id = games.game_id AND user_to_game.username = '${valUsername}';`;
  const qTotTime = `SELECT SUM(time) FROM games INNER JOIN user_to_game ON user_to_game.game_id = games.game_id AND user_to_game.username = '${valUsername}';`;
  const qBestTime = `SELECT time FROM games INNER JOIN user_to_game ON user_to_game.game_id = games.game_id AND user_to_game.username = '${valUsername}' ORDER BY time ASC LIMIT 1;`;
  const qBestScore = `SELECT score FROM games INNER JOIN user_to_game ON user_to_game.game_id = games.game_id AND user_to_game.username = '${valUsername}' ORDER BY score DESC LIMIT 1;`;
  const qBestAccuracy = `SELECT num_correct FROM games INNER JOIN user_to_game ON user_to_game.game_id = games.game_id AND user_to_game.username = '${valUsername}' ORDER BY num_correct DESC LIMIT 1;`;


  db.any(qQuizzesTaken)
    .then( data=>{
      quizzesTaken = data;
      if(quizzesTaken >= 10){achievement1 = "10-quizzes-taken";}
      if(quizzesTaken >= 50){achievement1 = "50-quizzes-taken";}
      if(quizzesTaken >= 100){achievement1 = "100-quizzes-taken";}
      if(quizzesTaken >= 500){achievement1 = "500-quizzes-taken";}
    })
    .catch(err => {
      console.log(`${err}`);
    });

  db.any(qPointsEarned)
    .then( data=>{
      pointsEarned = data;
      if(pointsEarned >= 50){achievement2 = "50-points-earned";}
      if(pointsEarned >= 100){achievement2 = "100-points-earned";}
      if(pointsEarned >= 500){achievement2 = "500-points-earned";}
      if(pointsEarned >= 1000){achievement2 = "1000-points-earned";}
    })
    .catch(err => {
      console.log(`${err}`);
    });

  db.any(qTotTime)
    .then( data=>{
      totTime = data;
      if(totTime >= 3600){achievement3 = "1-hour-played";}
      if(totTime >= 18000){achievement3 = "5-hours-played";}
      if(totTime >= 36000){achievement3 = "10-hours-played";}
      if(totTime >= 86400){achievement3 = "1-day-played";}
    })
    .catch(err => {
      console.log(`${err}`);
    });

  db.any(qBestTime)
    .then( data=>{
      bestTime = data;
    })
    .catch(err => {
      console.log(`${err}`);
    });

  db.any(qBestScore)
    .then( data=>{
      bestScore = data;
      if(bestScore >= 10){achievement4 = "10-best-score";}
      if(bestScore >= 15){achievement4 = "15-best-score";}
      if(bestScore >= 20){achievement4 = "20-best-score";}
    })
    .catch(err => {
      console.log(`${err}`);
    });

  db.any(qBestAccuracy)
    .then( data=>{
      bestAccuracy = data;
    })
    .catch(err => {
      console.log(`${err}`);
    });


  
  res.render('pages/profilePage', {quizzesTaken: quizzesTaken, pointsEarned:pointsEarned, totTime: totTime, bestTime: bestTime, bestScore: bestScore, bestAccuracy: bestAccuracy, achievement1: achievement1, achievement2: achievement2, achievement3: achievement3, achievement4: achievement4});
  
});

app.post("/submitQuiz", async (req, res) => {
  var valUsername = req.session.user.username;
  var valNum_correct = req.body.num_correct;
  var valTime = req.body.time_taken;
  var valDiff = req.body.difficulty;
  var valCategory = req.body.category;
  var valUsername = req.session.user.username;
  var valScore = (valNum_correct * 50) - (valTime * 10);
  var gameVals = [valTime, valDiff, valCategory, valNum_correct, valScore];

  var insertGameQuery = `INSERT INTO games (time_taken, difficulty, category, num_correct, score) VALUES ($1, $2, $3, $4, $5) returning game_id;`;
  var insertUTGQuery = `INSERT INTO user_to_game (username, game_id) VALUES;`;

  db.any(insertGameQuery, gameVals)
  .then( data=>{   
      var utgVals = [valUsername, data];
      db.any(insertUTGQuery, utgVals)
      .catch(err => {
        console.log(`${err}`);
      });
  })
  .catch(err => {
      console.log(`${err}`);
  });
});

// Authentication Required
app.use(auth);

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');