var express = require('express');
var router = express.Router();

const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/fcc-exercise-tracker').then(() => {
  console.log('mongodb connect success')
}).catch(err => {
  console.log('mongodb connect err-', err)
})
const UserSchema = new mongoose.Schema({ username: String })

const LogSchema = new mongoose.Schema({
  username: String, count: Number, log: [{
    description: String,
    duration: Number,
    date: String,
  }]
})

const User = mongoose.model('users', UserSchema)
const Log = mongoose.model('logs', LogSchema)

User.updateOne({ username: 'fcc_test' }, {}, { upsert: true })
  .then((data) => {
    // console.log('ahahha--success', data)

  }).catch(err => {
    // console.log('ahahha--err0r', err)
  })
/* GET users listing. */
router.route('/').get(function (req, res) {
  User.find({}).select('-__v').then(users => {
    res.json(users);
  }).catch(err => {
    res.send(err)
  })
})
  .post(function (req, res) {
    const { username } = req.body
    User.create({ username }).then(user => {
      console.log('user----', user);
      res.json({ username, _id: user._id })
    }).catch((err) => {
      res.send(err)
    })
  })

// add exercise
router.post('/:_id/exercises', async function (req, res) {
  // console.log('add exercise----', req.body)
  let { description, duration, date } = req.body
  let _id = req.params['_id']
  duration = Number(duration);
  console.log('date----', date)
  if (date) {
    date = new Date(date).toDateString()
  } else {
    date = new Date().toDateString();
  }

  const user = await User.findById(_id).select('-__v')

  const log = await Log.findOne({ username: user.username })
  if (log) {
    log.log.push({ description, duration, date })
    log.count = log.log.length
    await log.save()
  } else {
    await Log.create({ username: user.username, count: 1, log: [{ description, duration, date }] })
  }

  // "_id": "61204ee9f5860e05a3652f11",
  // "username": "fcc_test_16295073016",
  // "date": "Sat Oct 05 2024",
  // "duration": 10,
  // "description": "hhah"
  res.json({ username: user.username, _id: user._id, date, duration, description })
})

router.get('/:_id/logs', async function (req, res) {

  const _id = req.params['_id']
  const { from, to, limit } = req.query
  const user = await User.findById(_id).select('-__v')

  const log = await Log.findOne({ username: user.username }).select('-log._id')

  let filterLog = (log.log || [])

  if (from && to) {
    filterLog = filterLog.filter(item => { return new Date(item.date).getTime() >= new Date(from).getTime() && new Date(item.date).getTime() <= new Date(to).getTime() })
  }
  if (Number(limit)) {
    filterLog = filterLog.slice(0, Number(limit))
  }

  res.json({ _id: user._id, username: user.username, count: log.count, log: filterLog || [] })
})



module.exports = router;
