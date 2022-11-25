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

//Add a second route for /urls:id
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: /* What goes here? */ };
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