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
app.get('/quiz', (req, res) => {
  const category = req.query.category; // get the category from the query string
  const difficulty = req.query.difficulty; // get the difficulty from the query string

  axios.get(`https://the-trivia-api.com/v2/questions?limit=15&categories=${category}&difficulties=${difficulty}`) // make a GET request to the trivia API
    .then(response => {
      const data = response.data; // get the data from the response
      req.session.score = undefined; // reset the score
      console.log('Data received from the API:', data); // log the data to the console
      res.render('pages/quiz', { data: data, score: req.session.score, user: req.session.user});  // render the quiz page and pass the data to it
    })
    .catch(error => { // if an error occurred
      console.log(error);   // log the error to the console
      res.send('An error occurred connecting to trivia api');  // send a response to the client
    });
});



// HOME DEFAULT
app.get('/', (req, res) => {
  db.any('SELECT username, total_points FROM leaderboard ORDER BY total_points DESC LIMIT 10')
    .then(rows => {
      res.render('pages/home', { leaderboard: rows, user: req.session.user },);
    })
    .catch(error => {
      console.error(error);
      res.render('pages/error', {user: req.session.user});
    });
});

// HOME /HOME
app.get('/home', (req, res) => {
  res.redirect(302, '/')
});

// LEADERBOARD page. DEV purposes
app.get('/leaderboard', (req, res) => {
  db.any('SELECT username, total_points FROM leaderboard ORDER BY total_points DESC LIMIT 100')
    .then(rows => {
      res.render('pages/leaderboard', { leaderboard: rows, user: req.session.user});
    })
    .catch(error => {
      console.error(error);
      res.render('pages/error', {user: req.session.user});
    });
});

//Test API
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('pages/login', { user: req.session.user});
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
            res.redirect('/userProfile');
        } else {
          res.render('pages/login', {message: "Incorrect Password.", error: true, user: req.session.user});
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
    res.render('pages/register', {message: "Passwords do not match", error: true, user: req.session.user});
  }
  const hash = await bcrypt.hash(req.body.password, 10);

  let currentDate = new Date().toISOString().slice(0, 10)
  console.log("currentDate: ", currentDate);

  // To-DO: Insert username and hashed password into 'users' table
  const searchQuery = "SELECT * FROM users where username = $1;";
  const insertQuery = "INSERT INTO users (username, password, email, avatar_picture, date_joined) VALUES ($1, $2, $3, $4, $5) returning *;"
  const values = [req.body.username, hash, req.body.email, '/icons-img/logo.svg', currentDate];

  db.any(searchQuery, [req.body.username])
  .then(data => {
    if(data && (data.length > 0)){
      res.render('pages/register', {message: "Username Already Exists, Please Choose New Username.", error: true, user: req.session.user});
    }
    else{
      db.any(insertQuery, values)
      .then(data => {
        res.render('pages/login', {message: "User Added Successfully", error: false, user: req.session.user});
      });
    }
  });

});

app.get('/register', (req, res) => {
  res.render("pages/register", {
    message: msg,
    error: msgerr,
    user: req.session.user
  });
  msg = '';
  msgerr = false;
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/login", {message: 'Logged Out Successfully.', user: null});
});



// Authentication Middleware.
const auth = (req, res, next) => {
    if (!req.session.user) {
      // Default to login page.
      return res.redirect('/login');
    }
    next();
};

app.get('/userProfile', (req, res) =>{
  res.setHeader('Cache-Control', 'no-cache');
  if(!req.session.user){
    res.render("pages/login", {message: 'Must Be Logged In to View Profile Page', error: true, user: req.session.user});
  }

  var user = req.session.user[0];
  var valUsername = req.session.user[0].username;
  var quizzesTaken;
  var pointsEarned;
  var totTime;
  var bestTime;
  var bestScore;
  var bestAccuracy;
  var email = req.session.user[0].email;
  var dateJoined = req.session.user[0].date_joined;
  var achievements = [];
  var avatar_picture = req.session.user[0].avatar_picture;


  // Define a default vals object
  var vals = {
    quizzesTaken: 0,
    pointsEarned: 0,
    totTime: 0,
    bestTime: '-',
    bestScore: 0,
    bestAccuracy: 0,
    achievements: [],
    dateJoined: dateJoined,
    username: valUsername,
    user: user,
    email: email,
    message: msg,
    error: msgerr,
    avatar_picture: avatar_picture
  };

  const qGetUserInfo = `SELECT * FROM users WHERE username = '${valUsername}';`;
  const qQuizzesTaken = `SELECT COUNT(username) FROM user_to_game WHERE username = '${valUsername}';`;
  const qPointsEarned = `SELECT SUM(score)  FROM games INNER JOIN user_to_game  ON user_to_game.game_id = games.game_id AND user_to_game.username = '${valUsername}';`;
  const qTotTime = `SELECT SUM(time_taken) FROM games INNER JOIN user_to_game ON user_to_game.game_id = games.game_id AND user_to_game.username = '${valUsername}';`;
  const qBestTime = `SELECT time_taken FROM games INNER JOIN user_to_game ON user_to_game.game_id = games.game_id AND user_to_game.username = '${valUsername}' ORDER BY time_taken ASC LIMIT 1;`;
  const qBestScore = `SELECT score FROM games INNER JOIN user_to_game ON user_to_game.game_id = games.game_id AND user_to_game.username = '${valUsername}' ORDER BY score DESC LIMIT 1;`;
  const qBestAccuracy = `SELECT num_correct FROM games INNER JOIN user_to_game ON user_to_game.game_id = games.game_id AND user_to_game.username = '${valUsername}' ORDER BY num_correct DESC LIMIT 1;`;
  const qFormattedDate = `SELECT TO_CHAR(date_joined, 'YYYY-MM-DD') AS formatted_date_joined FROM users WHERE username = '${valUsername}';`;
  
  db.any(qFormattedDate)
  .then((data) => {
    dateJoined = data[0].formatted_date_joined;
    vals.dateJoined = dateJoined;
    return db.any(qQuizzesTaken);
  })
    .then( data=>{
      quizzesTaken = data[0].count;

      if(quizzesTaken ==='0'){
        if (quizzesTaken === '0') {
          vals.quizzesTaken = 0;
          vals.pointsEarned = 0;
          vals.totTime = 0;
          vals.bestTime = '-';
          vals.bestScore = 0;
          vals.bestAccuracy = 0;
          vals.achievements = achievements.slice();;
          vals.dateJoined = dateJoined;
          vals.username = valUsername;
          vals.user = user;
          vals.email = email;
          vals.message = msg;
          vals.error = msgerr;
          msg = '';
          msgerr = false;
          console.log("email: ", vals.email);
          console.log("dateJoined: ", vals.dateJoined);
          console.log("username: ", vals.username);
          console.log("vals: ", {vals: vals});
          res.render('pages/profile', {vals: vals, user: req.session.user});
      }
    }
      else{
        if(quizzesTaken >= 10 && quizzesTaken <50){achievements.push("10 Quizzes Taken");}
        if(quizzesTaken >= 50 && quizzesTaken<100){achievements.push("50 Quizzes Taken");}
        if(quizzesTaken >= 100 && quizzesTaken<500){achievements.push("100 Quizzes Taken");}
        if(quizzesTaken >= 500){achievements.push("500 quizzes taken");}

        db.any(qPointsEarned)
        .then( data=>{
          pointsEarned = data[0].sum;

          vals.pointsEarned = pointsEarned;

          if(pointsEarned >= 500){achievements.push("500 Points Earned");}
          if(pointsEarned >= 1000){achievements.push("1000 Points Earned");}
          if(pointsEarned >= 50000){achievements.push("50000 Points Earned");}
          if(pointsEarned >= 100000){achievements.push("100000 Points Earned");}

          db.any(qTotTime)
          .then( data=>{
            totTime = data[0].sum;

            vals.totTime = totTime;

            if(totTime >= 3600){achievements.push("1 Hour Played");}
            if(totTime >= 18000){achievements.push("5 Hours Played");}
            if(totTime >= 36000){achievements.push( "10 Hours Played");}
            if(totTime >= 86400){achievements.push("1 Day Played");}

            db.any(qBestTime)
            .then( data=>{
              bestTime = data[0].time_taken;
              vals.bestTime = bestTime;
              console.log('bestTime: %d', bestTime);

              db.any(qBestScore)
              .then( data=>{
                bestScore = data[0].score;
                vals.bestScore = bestScore;

                if(bestScore >= 100){achievements.push("100 Best Score");}
                if(bestScore >= 1000){achievements.push( "1000 Best Score");}
                if(bestScore >= 5000){achievements.push("5000 Best Score");}

                db.any(qBestAccuracy)
                .then( data=>{
                  bestAccuracy = data[0].num_correct;
                  vals.bestAccuracy = bestAccuracy;
                  console.log("achievements: ", achievements);
                  msg = '';
                  msgerr = false;
                  vals.quizzesTaken = quizzesTaken;
                  vals.achievements = achievements;
                res.render('pages/profile', {vals: vals, user: req.session.user});
                })
                .catch(err => {
                  console.log(`${err}`);
                });


              })
              .catch(err => {
                console.log(`${err}`);
              });

            })
            .catch(err => {
              console.log(`${err}`);
            });          

          })
          .catch(err => {
            console.log(`${err}`);
          });
          
        })
        .catch(err => {
          console.log(`${err}`);
        });
      }
    })
  });

app.post("/submitQuiz", async (req, res) => {
  console.log("submitQuiz route called");
  var valUsername = req.session.user[0].username;
  var valNum_correct = req.body.num_correct;
  var valTime = req.body.time_taken;
  var valDiff = req.body.difficulty;
  var valCategory = req.body.category;
  function difficultyStringToNumber(difficulty) {
    switch (difficulty) {
      case 'easy':
        return 1;
      case 'medium':
        return 2;
      case 'hard':
        return 3;
      default:
        return 1;
    }
  }
  const baseScore = valNum_correct * 50;
  const incorrectPenalty = (15 - valNum_correct) * 20;
  const difficultyMultiplier = difficultyStringToNumber(valDiff) * 0.5;
  const timeBonus = Math.max(180 - valTime, 0) * 0.1;
  const valScore = Math.max(Math.round((baseScore + timeBonus + difficultyMultiplier - incorrectPenalty) * 10), 0);
  var gameVals = [valTime, valDiff, valCategory, valNum_correct, valScore];

  var insertGameQuery = `INSERT INTO games (time_taken, difficulty, category, num_correct, score) VALUES ($1, $2, $3, $4, $5) returning game_id;`;
  var insertUTGQuery = `INSERT INTO user_to_game (username, game_id) VALUES ($1, $2);`;

  db.any(insertGameQuery, gameVals)
  .then( data=>{
      console.log('game_id: base:', data);
      var utgVals = [valUsername, data[0].game_id];
      db.any(insertUTGQuery, utgVals)
      .then(() => {
        res.json({ status: 'success', message: 'Quiz results submitted successfully' });
      })
      .catch(err => {
        console.log(`${err}`);
        res.status(500).json({ status: 'error', message: 'Failed to submit quiz results' });
      });
  })
  .catch(err => {
      console.log(`${err}`);
      res.status(500).json({ status: 'error', message: 'Failed to submit quiz results' });
  });
});

app.post('/update-pic', function(req, res) {
  const avatar = req.body.avatarOption;
  var valUser = req.session.user[0].username;
  console.log(req.body.avatarOption);
  console.log(req.session.user[0].username);

  var avatarQuery = `UPDATE users SET avatar_picture = '${avatar}' WHERE username = '${valUser}' returning *;`

  db.any(avatarQuery)
    .then(async data => {
      var user = req.session.user[0];
      req.session.user[0].avatar_picture = avatar;
      console.log('Data received from the API:', data); // log the data to the console
      req.session.user = data;
      req.session.save();
      res.redirect('/userProfile');
    })
    .catch(error => { // if an error occurred
      console.log(error);   // log the error to the console
      res.send('An error occurred when changing profile picture');  // send a response to the client
    });
});

app.post("/updateProfile", async (req, res) => {
  const valUsername = req.session.user[0].username;
  console.log(req.body);
  console.log(valUsername);
  if(req.body.newUsername){
    const qFindUsername = `SELECT * FROM users WHERE username = '${req.body.newUsername}';`;
  
    db.any(qFindUsername)
    .then(data=>{
      if(data && (data.length > 0)){
        msg = "Username Already Exists";
        msgerr = true;
        res.redirect('/userProfile');
        //res.render('pages/profile', {message: "Username Already Exists", error: true});
      }
      else{
        const qUpdateUsername = `UPDATE users SET username = '${req.body.newUsername}' WHERE username = '${valUsername}' RETURNING *;`;
        const qUpdateUTGUsername = `UPDATE user_to_game SET username = '${req.body.newUsername}' WHERE username = '${valUsername}'`
        db.any(qUpdateUTGUsername)
        .then(data=>{
          db.any(qUpdateUsername)
          .then(data=>{
            req.session.user = data;
            req.session.save();
            res.redirect('/userProfile');
          })
          .catch(err => {
            console.log(`${err}`);
          });
        })
        .catch(err => {
          console.log(`${err}`);
        });
          
      }

    })
    .catch(err => {
      console.log(`${err}`);
    });

  }
  else if(req.body.newPassword){
    //does confirmed password match?
    if(req.body.newPassword != req.body.newPasswordConfirm){
      res.render('pages/profile', {message: "Passwords do not match", error: true, user: req.session.user});
    }
    
    else{
      const hash = await bcrypt.hash(req.body.newPassword, 10);
     // const qUpdatePassword = `UPDATE users SET password = '${hash}' WHERE username = '${valUsername}' RETURNING *;`;
     const qUpdatePassword = `UPDATE users SET password = '${hash}' WHERE username = '${valUsername}' RETURNING *;`;
      db.any(qUpdatePassword)
      .then(data=>{
        req.session.user = data;
        req.session.save();
        res.redirect('/userProfile');
      })
      .catch(err => {
        console.log(`${err}`);
      });
    }

  }
  else if(req.body.newEmail){
    console.log(req.body.newEmail);
    const qUpdateEmail = `UPDATE users SET email = '${req.body.newEmail}' WHERE username = '${valUsername}' RETURNING *;`;
    db.any(qUpdateEmail)
    .then(data=>{
      req.session.user = data;
      req.session.save();
      res.redirect('/userProfile');
    })
    .catch(err => {
      console.log(`${err}`);
    });
  }
 

});

// Authentication Required
app.use(auth);

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');