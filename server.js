const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const {Story} = require('./models');
const DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://localhost/hn-api';
const PORT = process.env.PORT || 8080;

mongoose.Promise = global.Promise;
app.use(bodyParser.json());

//----------------------------------------------***END POINTS***--------------------------------------------------//

//POST
app.post('/stories', (req, res) => {
  const requiredFields = ['url', 'title'];
  for (let i=0; i< requiredFields.length; i++){
    const field = requiredFields[i];
    if(!(field in req.body)){
      console.error(`Missing ${field} in request`);
      return res.status(400);
    }
  }

  Story
    .create({
      title:req.body.title,
      url:req.body.url})
    .then(
      story => res.status(201).json(story.apiRepr()))
    .catch(err => {
      console.error(err);
    });
});

//GET

//PUT

//DELETE

//--------------------------------------------***SERVER CONTROLLERS***--------------------------------------------//

let server;
function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(PORT, () => {
        console.log(`Your app is listening on port ${PORT}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};
