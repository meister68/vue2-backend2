const Organization = require("../models/organization");
const user = require('./findUser')


module.exports.findOrg = async function (username) {
  try {
    var status = await user.findUser(username);
    return new Promise(function (resolve, reject) {
      console.log("result from user: " + status);
      if (status == "not found") {
        console.log("FINDING IN ORGANIZATION COLLECTION");
        Organization.findOne({
          username: username
        })
          .then(doc => {
            if (doc) {
              resolve({ data: doc });
            } else {
              resolve({ data: "not found" });
            }
          }).catch(err => {
            reject(err);
            console.log(err);
          })
      } else {
        resolve({ data: status });
      }
    })
  } catch (err) {
    
    console.log("Unexpected error occured!!!");
  }
}