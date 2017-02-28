const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');
const {Story} = require('../models');
const should = chai.should();

const {app, runServer, closeServer} = require('../server');

mongoose.Promise = global.Promise;

chai.use(chaiHttp);

function generateStory(){
  return {
    title: faker.lorem.sentence(),
    url: faker.internet.url()
  };
}

function seedData() {
    console.info('Seeding data');
    const dummyData = [];
    for (let i = 1; i<=10; i++){
      dummyData.push(generateStory());
    }
    
    return Story.insertMany(dummyData);
}

function tearDownDb() {
  console.info('Deleting database');

  return mongoose.connection.dropDatabase();
}

//-------------------------------------------**BEFORE AND AFTER**--------------------------------------------------//

describe('Hacker News API', function() {
  before(function() {
    return runServer();
  });

  beforeEach(function() {
    return seedData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

//----------------------------------------------***POST TESTS***--------------------------------------------------//

  describe('POST endpoint', function() {
    it('should post story', function () {
      const newStory = generateStory();

      return chai.request(app)
      .post('/stories')
      .send(newStory)
      .then(function(res){
        res.should.be.json;
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.include.keys('title', 'url', 'id', 'votes');
        res.body.id.should.not.be.null;
        res.body.title.should.equal(newStory.title);
        res.body.url.should.equal(newStory.url);

        return Story.findById(res.body.id);
      })
      .then(function(story){
        story.title.should.equal(newStory.title);
        story.url.should.equal(newStory.url);
      });
    });
  });

//----------------------------------------------***GET TESTS***--------------------------------------------------//

  describe('GET all stories', function() {
    it('should return all stories', function() {
      let capturedRes;
      return chai.request(app)
      .get('/stories')
      .then(function(res){
        capturedRes = res;
        capturedRes.should.have.status(200);
        capturedRes.body.Stories.should.have.length.of.at.least(1);

        return Story.count();
      })
      .then(function(count){
        capturedRes.body.Stories.should.have.length.of(count);
      });
    });
  });

//----------------------------------------------***PUT TESTS***--------------------------------------------------//  

  describe('PUT update', function() {
    it('should update story', function(){
      const updatedStoryDetails = {
        title: "This is a Title",
        url: "www.myhackernewssomethingorother.com"
      };
      return Story
        .findOne().exec()
        .then(function(storyToUpdate){
          updatedStoryDetails.id = storyToUpdate.id;

          return chai.request(app)
            .put( `/stories/${storyToUpdate.id}`)
            .send(updatedStoryDetails);
        })
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;

          return Story.findById(updatedStoryDetails.id).exec();
        })
        .then(function(story){
          story.title.should.equal(updatedStoryDetails.title);
          story.url.should.equal(updatedStoryDetails.url);
        });
    });
  });

  describe('PUT update', function() {
    it('should upvote a story once', function(){
      let capturedStoryToUpvote = {};

      return Story
        .findOne().exec()
        .then(function(storyToUpvote){
          capturedStoryToUpvote.votes = storyToUpvote.votes;
          capturedStoryToUpvote.id = storyToUpvote.id;
          return chai.request(app)
            .put(`/stories/upvote/${storyToUpvote.id}`);
        })
        .then(function(res) {
          res.should.have.status(200);
          return Story.findById(capturedStoryToUpvote.id).exec();
        })
        .then(function(upvotedStory){
          upvotedStory.votes.should.equal(capturedStoryToUpvote.votes += 1);
        });
    });
  });
});
