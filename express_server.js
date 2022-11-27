//Require express for the server
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser');
app.use(cookieParser());

//This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

//When our browser submits a POST request, the data in the request body is sent as a Buffer. To make this data readable, we need to use another piece of middleware to translate or parse the body.
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
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render("urls_index", templateVars);
});

//Add a POST route to receive the form submission
app.post("/urls", (req, res) => {
  //Generate a new short URL id, add it to the database and redirect to the /urls/shortURL.
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Add a route for /urls/new
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies['username'] };
  res.render('urls_new', templateVars);
});

//Edit a url from database and redirect the client to the urls_show page ("/urls/shortURL")
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Delete a url from database and redirect the client back to the urls_index page ("/urls")
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Set a cookie named username to the value submitted in the request body via the login form. After the server has set the cookie it redirects the browser back to the /urls page
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

//Logout and clear cookie
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

//Add a second route for /urls:id
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username'] };
  res.render("urls_show", templateVars);
});

//Redirect from the shortURL to the longURL
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(urlDatabase[req.params.shortURL]);
  } else {
    res.statusCode = 404;
    res.send('<h3>404 Not Found!<h3>')
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});