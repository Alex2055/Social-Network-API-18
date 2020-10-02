const { Schema, model } = require('mongoose');
const moment = require('moment');
const reactionSchema = require('./Reaction')

const thoughtSchema = new Schema({
thoughtText:
{
    type: String,
    required: 'Some text is Required',
    minlength: 1,
    maxlength: 280
},
createdAt:{
    type: Date,
    default: Date.now,
    get: (createdAtVal) => moment(createdAtVal).format('MMM DD, YYYY [at] hh:mm a')
},
username:
{
    type: String,
    required: 'username is Required',
},
reactions:
[
    reactionSchema
]
},
{
    toJSON: {
        virtuals: true,
        getters: true
    }
}
);
thoughtSchema.virtual('reactionsCount').get(function(){
    return this.reactions.length;
});

const Thought = model('Thought', thoughtSchema);

module.exports = Thought;