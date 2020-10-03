const { response } = require('express');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

const db = require('./models');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/socialdb', {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});



// User routes

// get all users
app.get('/api/users', (req, res) => {
    db.User.find({})
        .select('-__v')
        .then(dbUser => {
            res.json(dbUser);
        })
        .catch(err => {
            res.json(err);
        });
});

// get user by id included friends, thoughts for this user
app.get('/api/users/:id', ({ params }, res) => {
    db.User.findOne({ _id: params.id })
        .populate({
            path: 'thoughts',
            select: '-__v'
        })
        .populate({
            path: 'friends',
            select: '-__v'
        })
        .then(dbUser => {
            res.json(dbUser);
        })
        .catch(err => {
            res.json(err);
        });
});

//create user
app.post('/api/users', ({ body }, res) => {
    db.User.create(body)
        .then(dbUser => {
            res.json(dbUser);
        })
        .catch(err => {
            res.json(err);
        });
});

//update user
app.put('/api/users/:id', ({ params, body }, res) => {
    db.User.findOneAndUpdate({ _id: params.id }, body, { new: true })
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this id!' });
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => res.status(400).json(err));
});

//delete user
app.delete('/api/users/:id', (req, res) => {
    //({_id: req.params.id}, { $set: { thoughts: [] } }, { new: true })

    db.User.findOneAndDelete({ _id: req.params.id })
        .then(dbUser => {
            db.Thought.deleteMany({ _id: { $in: dbUser.thoughts } })
                .then(response => {
                    if (!response) {
                        res.json({ message: 'No user found with this id!' });
                        return;
                    }
                    res.json({ message: 'User and associated thoughts deleted' });
                }
                )
        }
        )
        .catch(err => {
            res.json(err);
        });
});

// users friends routes

// create friend
app.post('/api/users/:userId/friends/:friendId', ({ params }, res) => {
    db.User.findOneAndUpdate(
        { _id: params.userId },
        { $push: { friends: params.friendId } },
        { new: true }
    )
        .then(dbUser => {
            res.json(dbUser);
        })
        .catch(err => {
            res.json(err);
        });
});

// delete friend
app.delete('/api/users/:userId/friends/:friendId', ({ params }, res) => {
    db.User.findOneAndUpdate(
        { _id: params.userId },
        { $pull: { friends: params.friendId } },
        { new: true }
    )
        .then(dbUser => {
            res.json(dbUser);
        })
        .catch(err => {
            res.json(err);
        });
});

// Thoughts routes

// create thought
app.post('/api/thoughts', ({ body }, res) => {
    userID = body.userId;
    db.Thought.create(body)
        .then((_id) => db.User.findByIdAndUpdate(userID, { $push: { thoughts: _id } }, { new: true })
        )
        .then(dbThought => {
            res.json(dbThought);
        })
        .catch(err => {
            res.json(err);
        });
});

// get all thoughts
app.get('/api/thoughts', (req, res) => {
    db.Thought.find({})
        .select('-__v')
        .then(dbThought => {
            res.json(dbThought);
        })
        .catch(err => {
            res.json(err);
        });
});

// get thought by id
app.get('/api/thoughts/:id', ({ params }, res) => {
    db.Thought.findOne({ _id: params.id })
        .then(dbThought => {
            res.json(dbThought);
        })
        .catch(err => {
            res.json(err);
        });
});

// update thought
app.put('/api/thoughts/:id', ({ params, body }, res) => {
    db.Thought.findOneAndUpdate({ _id: params.id }, body, { new: true })
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this id!' });
                return;
            }
            res.json(dbThoughtData);
        })
        .catch(err => res.status(400).json(err));
});

//delete thought
app.delete('/api/thoughts/:id', ({ params }, res) => {
    db.Thought.findOneAndDelete({ _id: params.id })
        .then(dbThought => {
            if (!dbThought) {
                res.json({ message: 'No thought found with this id!' });
                return;
            }
            res.json(dbUser);
        })
        .catch(err => {
            res.json(err);
        });
});

// reactions routes

// create reaction
app.post('/api/thoughts/:thoughtId/reactions', (req, res) => {
    db.Thought.findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $addToSet: { reactions: req.body } },
        { new: true }
    )
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                return res.status(404).json({ message: 'No thought with this id!' });
            }
            res.json(dbThoughtData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

//delete reaction
app.delete('/api/thoughts/:thoughtId/reactions/:reactionId', (req, res) => {
    db.Thought.findOneAndUpdate(
        { _id: req.params.thoughtId },
        { $pull: { reactions: { reactionId: req.params.reactionId } } },
        { new: true }
    )
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                return res.status(404).json({ message: 'No thought with this id!' });
            }
            res.json(dbThoughtData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});





mongoose.set('useCreateIndex', true);
mongoose.set('debug', true);

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});
