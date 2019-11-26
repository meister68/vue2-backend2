const express = require('express');
const userRoute = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Org = require('../modules/findOrg');
const config = require('./config');
const User = require('../models/regUser');
const Badges = require('../models/Badges');
const userBadges = require('../models/userBadges');
const mongoose = require('mongoose')
//const Badges = require('../models/Badges')
var tempdata = {};

userRoute.route('/signup').post((req, res) => {
  tempdata = req.body;
  res.status(200).end();
});

userRoute.route('/signedup').get((req, res) => {
  res.status(200).json(tempdata);
});

userRoute.route('/fullsignup').post((req, res) => {
  async function signup() {
    try {
      var result = await Org.findOrg(req.body.username);
      if (result.data == 'not found' || result.data == undefined) {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
        const user = new User(req.body);
        user.save()
          .then(() => {
            var token = jwt.sign({
              username:user.username,
              _id: user._id,
              type: user.type
            }, config.secret, {
              expiresIn: 86400
            });
            res.status(200).send({
              auth: true,
              token: token
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(400).send(err);
          });
      } else {
        console.log('RESPOND 400 ALREADY TAKEN')
        res.status(400).json({
          message: 'Username is already taken!'
        })
      }
    } catch (err) {
      res.status(500).json({
        message: 'Unexpected error occured!'
      });
    }
  }
  signup();
  tempdata = {};
});

userRoute.route('/userbadges').post((req, res) => {
  let user = jwt.decode(req.body.user);
  userBadges.find({userID: mongoose.Types.ObjectId(user._id),status: true}).
  populate('badgeID').
  exec(function (err, badgeID) {
    if (err) return handleError(err);
    //let badge = ba
    console.log(badgeID[0]);
    res.json(badgeID[0])
    
    // prints "The author is Ian Fleming"
  });
    
    // prints "The author is Ian Fleming"
  
  
});


userRoute.route('/availbadge').post((req, res) => {
  console.log(req.body)
  var user = jwt.decode(req.body.user)
  console.log(user)
  Badges.findOne({ code: req.body.code })
    .then((badgesData) => {
      let badgeId = badgesData._id;
      let datum = { userID: user._id, badgeID: badgeId, status: true }
      console.log(datum)
      userBadges.findOne(datum)
        .then((doc) => {
          if (!doc) {
            let badgeSave = new userBadges(datum)
            badgeSave.save()
              .then((data) => {
                console.log("Availed Succesfully!")
                console.log(data)
               res.end()
              })
              .catch((err) => {
                res.send(err)
              })
          }
          else{
            res.send('not found')
          }
        })
        .catch((err) => {
          console.log(err)
        })
        res.end()
    })
    .catch((err) => {
      console.log(err)
      res.end()
    });
});




module.exports = userRoute;