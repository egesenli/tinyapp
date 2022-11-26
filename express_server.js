//Require express for the server
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


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
  const templateVars = { urls: urlDatabase };
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
  res.render("urls_new");
});

//Add a second route for /urls:id
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
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