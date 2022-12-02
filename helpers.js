//Check user information exists in database
function checkData(userMail, users) {
  for (const user in users) {
    if (users[user].email === userMail) {
      return users[user];
    }
  }
  return undefined;
}

//Create a function named urlsForUser(id) which returns the URLs where the userID is equal to the id of the currently logged-in user
function urlsForUser(id, users) {

  let userURL = {};

  for (const shortURL in users) {
    if (users[shortURL].userID === id) {
      userURL[shortURL] = users[shortURL];
    }
  }
  return userURL;
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

module.exports = { checkData, urlsForUser, generateRandomString };

