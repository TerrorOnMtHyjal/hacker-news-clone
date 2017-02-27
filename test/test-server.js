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
    url: faker.url
  };
}
function seedData() {
    console.info('Seeding data');
    const dummyData = [];
    for (let i = 1; i<=10; i++){
      generateStory();
    }
    return Story.insertMany(dummyData);
}

function tearDownDb() {
  console.info('Deleting database');
  return mongoose.connection.dropDatabase();
}

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
        story.url.shold.equal(newStory.url);
      });
    });
  });
});
