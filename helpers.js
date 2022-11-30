//Check user information exists in database
function checkData(userMail, users) {
  for (const user in users) {
    if (users[user].email === userMail) {
      return users[user];
    }
  }
  return undefined;
}

module.exports = { checkData };

