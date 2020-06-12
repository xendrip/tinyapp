const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const morgan = require('morgan');

const app = express();
const PORT = 8080;

// STORE PASSWORD:
// const hashedPassword = bcrypt.hashSync(password, salt);

// CHECK PASSWORDS:
// bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

const generateRandomString = () => {
  //Google search led to this: NOT MY IDEA (I did not come up with this)
  //Source:
    //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript

  //apparently not ideal for real world, but for my purposes, should work; change (2, 15) to (2, 5);
 return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5).toUpperCase();
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com", 
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "1234"
  }
};
//Search for entered user email
const searchUserEmail = (usersObject, enteredUserEmail) => {

  for (let user in usersObject) {
    
    if (usersObject[user].email === enteredUserEmail) {

      return usersObject[user];
    }
  }
  return false;

};
//Search and return URLs object matching id
const urlsForUser = (id) => {

  const xURLs = {};
  
  for (let tinyURL in urlDatabase) {
    
    const shortURLID = urlDatabase[tinyURL];

    if (shortURLID.userID === id) {

       xURLs[tinyURL] = shortURLID.longURL;
    }
  }
  return xURLs;
};
//renders my urls page (urls index)
app.get('/urls', (req, res) => {

  const userID = req.cookies['user_id'];

  let templateVars = {

    urls: urlsForUser(userID), 
    user: users[userID]
  };

  res.render('urls_index', templateVars);
});
//renders create new url page
app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];
  let templateVars = {
    urls: urlDatabase, user: users[userID]
  };

  if (!userID) {
    return res.redirect('/login');
  } else {
    return res.render('urls_new', templateVars);
  }
});
//regristration page
app.get('/register', (req, res) => {
  const userID = req.cookies['user_id'];
  let templateVars = {
    urls: urlDatabase, user: users[userID]
  };

  res.render('register', templateVars);
});
//renders login page
app.get('/login', (req, res) => {

  const userID = req.cookies['user_id'];

  let templateVars = { urls: urlDatabase, user: users[userID] };

  res.render('login', templateVars);
});
//renders edit page
app.get('/urls/:shortURL', (req, res) => {

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.cookies['user_id'];

  let templateVars = {
    shortURL,
    longURL,
    user: users[userID]
  };
  res.render('urls_show', templateVars);
});
//redirects any request to /u/:shortURL to its longURL
app.get('/u/:shortURL', (req, res) => {

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
  res.redirect(longURL);
});
//creates tinyURL and redirects; adds to urlDatabase
app.post('/urls', (req, res) => {
  
  console.log(req.body);
  
  const genShortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.cookies['user_id'];
 
  urlDatabase[genShortURL] = {
    longURL,
    userID
  };
 
  res.redirect(`/urls/${genShortURL}`);
});

app.post('/login', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
console.log(password);
  let user = searchUserEmail(users, email);
  
  if (!user) {

    return res.status(403).send('email not found');

  } else if (!bcrypt.compareSync(password, user.password)) {

    return res.status(403).send('password does not match');

  } else {

    res.cookie('user_id', user.id);
    res.redirect('/urls'); 
  }
});
//clears cookies, logs out, redirect to /urls
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});
//registers user, creates cookie with unique user id
app.post('/register', (req, res) => {

  const email = req.body.email;

  if (email === '') {

    return res.status(400).send('enter email');

  } else if (searchUserEmail(users, email)) {

    return res.status(400).send('email address exists, try a different one');

  } else {

    const password = bcrypt.hashSync(req.body.password, 10);
    const id = generateRandomString();

    users[id] = {
      id,
      email,
      password
    }
  
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});
//deletes entry to urlDatabase, redirects to /urls or /login
app.post('/urls/:shortURL/delete', (req, res) => {

  const shortURL = req.params.shortURL;
  const userID = req.cookies['user_id'];
  const user = urlDatabase[shortURL].userID;

  if (userID === user) {

    delete urlDatabase[req.params.shortURL];

    res.redirect('/urls');
  } else {

    res.redirect('/login');
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls'); 
});
//redirect to edit page
app.post('/urls/:shortURL', (req, res) => {

  const shortURL = req.params.shortURL;
  
  res.redirect(`/urls/${shortURL}`); 
});
//updates user entered url in edit page, redirects to /urls
app.post('/urls/:shortURL/edit', (req, res) => {

  const updatedURL = req.body.updatedURL;
  const shortURL = req.params.shortURL;
  
  urlDatabase[shortURL].longURL = updatedURL;

  res.redirect('/urls'); 
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening to port ${PORT}!`);
});

