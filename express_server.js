//Require express for the server
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//Require cookie-parser for the cookies
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['$2a$10$H2gsl1hYbldng7', 'AnE8BlzOmkUlGwoqSHUczlG'],
}));

//Require bcryptjs for the encryption of passwords
const bcrypt = require("bcryptjs");

//Require checkData function from helpers module
const { checkData } = require('./helpers.js');

//Require urlsForUser function from helpers module
const { urlsForUser } = require('./helpers.js');

//Require urlsForUser function from helpers module
const { generateRandomString } = require('./helpers.js');

//This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

//User object for storing the user information such as id, email and password,
const users = {};
const urlDatabase = {};

//When our browser submits a POST request, the data in the request body is sent as a Buffer. To make this data readable, we need to use another piece of middleware to translate or parse the body
app.use(express.urlencoded({ extended: true }));

//if user is logged in, redirect to /urls. If user is not logged in, redirect to /login

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//Add additional endpoints
app.get("/urls.json", (req, res) => {
  res.json(users);
});

//Add a route for /urls
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const userURL = urlsForUser(userID, urlDatabase);
  let templateVars = { urls: userURL, user: users[userID], shortURL: req.params.shortURL };
  res.render("urls_index", templateVars);
});

//Add a POST route to receive the form submission. Generate a new short URL id, add it to the database and redirect to the /urls/shortURL
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.statusCode = 403;
    res.send('<h2>Error status 403. You are not logged in! Please login first.</h2>');
  }
});

//Add a route for /urls/new
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = { user: users[req.session.user_id] };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

//Add a route for /register
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render('urls_registration', templateVars);
  }
});

//Add a POST route to registering form
app.post("/register", (req, res) => {
  const user = checkData(req.body.email, users);
  if (req.body.email && req.body.password) {
    if (user) {
      return res.status(400).send('<h2>Error status 400. The email has already registered! Please use another email.</h2>');
    } else {
      const userID = `user${generateRandomString()}`;
      users[userID] = { id: userID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
      req.session.user_id = userID;
      res.redirect(`/urls`);
    }
  } else {
    return res.status(400).send('<h2>Error status 400. Please fill out all fields for registering.</h2>');
  }
});

//Add a second route for /urls:id
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const userURL = urlsForUser(userID, urlDatabase);
  let templateVars = { urlDatabase, userURL, shortURL, user: users[userID] };
  res.render("urls_show", templateVars);
});

//Edit a url from database and redirect the client to the urls_show page ("/urls/shortURL")
//Handle the errors and permissions
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.session.user_id) {
    return res.status(400).send('Error status 400. There is no cookie.');
  }
  if (!urlDatabase[shortURL]) {
    return res.status(400).send('Error status 400. There shortURL does not exists.');
  }
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.status(400).send('Error status 400. You\'re not authorized.');
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Delete a url from database and redirect the client back to the urls_index page ("/urls")
//Handle the errors and permissions
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.session.user_id) {
    return res.status(400).send('Error status 400. There is no cookie.');
  }
  if (!urlDatabase[shortURL]) {
    return res.status(400).send('Error status 400. There shortURL does not exists.');
  }
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.status(400).send('Error status 400. You\'re not authorized.');
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Redirect from the shortURL to the longURL
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const urlInfo = urlDatabase[req.params.shortURL];
  if (urlInfo) {
    const longURL = urlInfo.longURL;
    res.redirect(urlInfo.longURL);
  } else {
    res.statusCode = 404;
    res.send('<h3>404 Not Found!<h3>');
  }
});

//Add a route for /login
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.session.user_id] };
    res.render('urls_login', templateVars);
  }
});

//Add a POST route for the login form
app.post("/login", (req, res) => {
  const user = checkData(req.body.email, users);
  if (req.body.email && req.body.password) {
    if (!user) {
      return res.status(403).send('<h2>Error status 403. The email has is not registered! Please sign up.</h2>');
    } else if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      return res.status(403).send('<h2>Error status 403. The password is not correct. Please check your information and try again.');
    }
  } else {
    return res.status(403).send('<h2>Error status 403. Please fill out all fields for login.</h2>');
  }
});

//Logout and clear cookie
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});