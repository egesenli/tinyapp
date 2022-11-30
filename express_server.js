//Require express for the server
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//Require cookie-parser for the cookies
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

//URL database object for storing the URLS
const urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"
};

//User object for storing the user information such as id, email and password,
const users = {};

//Implement the function generateRandomString()
function generateRandomString() {
  let cSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = '';
  const length = 6;
  for (let i = 0; i < length; i++) {
    const randomChar = Math.floor(Math.random() * cSet.length);
    randomString += cSet[randomChar];
  }
  return randomString;
};

//Check user information exists in database
function checkData(userMail) {
  for (const user in users) {
    if (users[user].email === userMail) {
      return users[user];
    }
  }
  return false;
}

//Create a function named urlsForUser(id) which returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = (id) => {

  let userURL = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURL[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURL;
};

//When our browser submits a POST request, the data in the request body is sent as a Buffer. To make this data readable, we need to use another piece of middleware to translate or parse the body
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.send("Hello!");
});

//Add additional endpoints
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Add a route for /urls
app.get("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  const userURL = urlsForUser(userID);
  let templateVars = { urls: userURL, user: users[userID], shortURL: req.params.shortURL };
  res.render("urls_index", templateVars);
});

//Add a POST route to receive the form submission. Generate a new short URL id, add it to the database and redirect to the /urls/shortURL
app.post("/urls", (req, res) => {
  if (req.cookies['user_id']) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.cookies['user_id']
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.statusCode = 403;
    res.send('<h2>Error status 403. You are not logged in! Please login first.</h2>')  }
});

//Add a route for /urls/new
app.get("/urls/new", (req, res) => {
  if (req.cookies['user_id']) {
    let templateVars = { user: users[req.cookies['user_id']] };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

//Add a route for /register
app.get("/register", (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.cookies['user_id']] };
    res.render('urls_registration', templateVars);
  }
});

//Add a POST route to registering form
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    if (checkData(req.body.email)) {
      res.statusCode = 400;
      res.send('<h2>Error status 400. The email has already registered! Please use another email.</h2>')
    } else {
      const userID = `user${generateRandomString()}`;
      users[userID] = { id: userID, email: req.body.email, password: req.body.password };
      res.cookie('user_id', userID);
      res.redirect(`/urls`);
    }
  } else {
    res.statusCode = 400;
    res.send('<h2>Error status 400. Please fill out all fields for registering.</h2>')
  }
});

//Edit a url from database and redirect the client to the urls_show page ("/urls/shortURL")
//Handle the errors and permissions
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.cookies['user_id']) {
    return res.status(400).send('Error status 400. There is no cookie.')
  }
  if (!urlDatabase[shortURL]) {
    return res.status(400).send('Error status 400. There shortURL does not exists.')
  }
  if (req.cookies['user_id'] !== urlDatabase[shortURL].userID) {
    return res.status(400).send('Error status 400. You\'re not authorized.')
  } 
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Delete a url from database and redirect the client back to the urls_index page ("/urls")
//Handle the errors and permissions
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.cookies['user_id']) {
    return res.status(400).send('Error status 400. There is no cookie.')
  }
  if (!urlDatabase[shortURL]) {
    return res.status(400).send('Error status 400. There shortURL does not exists.')
  }
  if (req.cookies['user_id'] !== urlDatabase[shortURL].userID) {
    return res.status(400).send('Error status 400. You\'re not authorized.')
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Add a route for /login
app.get("/login", (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.cookies['user_id']] };
    res.render('urls_login', templateVars);
  }
});

//Add a POST route for the login form
app.post("/login", (req, res) => {
  const user = checkData(req.body.email);
  if (req.body.email && req.body.password) {
    if (!checkData(req.body.email)) {
      res.statusCode = 403;
      res.send('<h2>Error status 403. The email has is not registered! Please sign up.</h2>')
    } else if (req.body.password === user.password) {
      res.cookie('user_id', user.id);
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.send('<h2>Error status 403. The password is not correct. Please check your information and try again.')
    }
  } else {
    res.statusCode = 403;
    res.send('<h2>Error status 403. Please fill out all fields for login.</h2>')
  }
});

//Logout and clear cookie
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

//Add a second route for /urls:id
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies['user_id'];
  const userURL = urlsForUser(userID);
  let templateVars = { urls: userURL, user: users[userID], shortURL: req.params.shortURL };
  res.render("urls_show", templateVars);
});

//Redirect from the shortURL to the longURL
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.statusCode = 404;
    res.send('<h3>404 Not Found!<h3>')
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});