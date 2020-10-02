
const { Schema, Types } = require('mongoose');

const reactionSchema = new Schema({
    reactionId:
    {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId(),
    },
    reactionBody:
    {
        type: String,
        maxlength: 280,
        required: 'Some text is Required',
    },
    username:
    {
        type: String,
        required: 'Username text is Required'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        get: (createdAtVal) => moment(createdAtVal).format('MMM DD, YYYY [at] hh:mm a')
    },
});
module.exports = reactionSchema