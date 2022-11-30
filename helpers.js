//Check user information exists in database
function checkData(userMail) {
  for (const user in users) {
    if (users[user].email === userMail) {
      return users[user];
    }
  }
  return false;
}

module.exports = { checkData };

