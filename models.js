const mongoose = require('mongoose');

const storySchema = mongoose.Schema({
  title: { type: String, required: [true, "Title is required!"] },
  url: { type: String, required: [true, "URL is required!"] },
  votes: { type: Number, default: 0 }
});

storySchema.methods.apiRepr = function(){
  return {
    title: this.title,
    url: this.url,
    votes: this.votes,
    id: this._id
  };
};

const Story = mongoose.model('Storie', storySchema);
module.exports = {Story};