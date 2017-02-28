const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {Story} = require('./models');

const DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://localhost/hn-api';
const PORT = process.env.PORT || 8080;
const app = express();

mongoose.Promise = global.Promise;
app.use(bodyParser.json());

//----------------------------------------------***END POINTS***--------------------------------------------------//

//POST
app.post('/stories', (req, res) => {
  const requiredFields = ['url', 'title'];
  for (let i=0; i< requiredFields.length; i++){
    const field = requiredFields[i];
    if(!(field in req.body)){
      const message = `Missing ${field} in request`;
      console.error(message);
      return res.status(400).send(message);
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
app.get('/stories', (req, res)=>{
  Story.find().sort({votes: -1}).limit(20).exec()
  .then(stories => {
    res.status(200).json({
      Stories: stories.map(currentStory => currentStory.apiRepr())
    });
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Something went wrong when GETTING all stories!'});
  });
});

app.get('/stories/:id', (req, res)=>{
  Story.findById(req.params.id).exec()
  .then(desiredStory => res.status(200).json(desiredStory.apiRepr()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Something went wrong when GETTING one story!'});
  });
});

//PUT
app.put('/stories/upvote/:id', (req, res)=>{
  Story.findByIdAndUpdate(req.params.id, {$inc : {votes : 1}}, {new : true}).exec()
  .then(updatedStory => res.status(200).json({updatedStory}))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Something went wrong when PUTTING an upvote!'});
  });
});

app.put('/stories/:id', (req, res)=>{
  const toUpdate = {};
  Object.keys(req.body).forEach(key => toUpdate[key] = req.body[key]);

  if(toUpdate.hasOwnProperty('votes')){
      delete toUpdate.votes;
      console.log("deleted votes you cheater!");
  }

  Story.findByIdAndUpdate(req.params.id, {$set : toUpdate}, {new : true}).exec()
  .then(updatedStory => res.status(200).json({updatedStory}))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Something went wrong when PUTTING a update!'});
  });
});



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
