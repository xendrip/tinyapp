const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; //default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = () => {
  //Google search led to this: NOT MY IDEA (I did not come up with this)
  //Source:
    //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript

  //apparently not ideal for real world, but for my purposes, should work; change (2, 15) to (2, 5);
 return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5).toUpperCase();
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//sending variables to EJS template (must be object)
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  //pass data to ejs (file, data): ('urls_index', templateVars)
  res.render("urls_index", templateVars);
});
//new needs to be defined before :shortURL; takes precedence; routes should be ordered from most specific to least specific
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  // Log the POST request body to the console; output: { longURL: 'www.example.com' }
  console.log(req.body);
  //generate shortURL
  const genShortURL = generateRandomString();
  const longURL = req.body.longURL;
  //Adds to urlDatabase
  urlDatabase[genShortURL] = longURL;
  //redirects to new shortURL
  res.redirect(`/urls/${genShortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  let templateVars = {
    shortURL,
    longURL
  };
  res.render("urls_show", templateVars);
});
//redirects any request to /u/:shortURL to its longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening to port ${PORT}!`);
});

