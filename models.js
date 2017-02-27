const mongoose = require('mongoose');

// const blogPostSchema = mongoose.Schema({
//   title: {type: String, required: true},
//   content: String,
//   author: {firstName: {type: String, required: true},lastName: {type: String, required: true}},
//   publishDate: {type: Number, required: true}
// });

const storySchema = mongoose.Schema({
  title: { type: String, required: true}
  url: String,
  votes:{ type: Number, default: 0}
});

storySchema.methods.apiRepr = function(){
  return {
    title: this.title,
    url: this.url,
    votes: this.votes,
    id: this._id
  };
}
