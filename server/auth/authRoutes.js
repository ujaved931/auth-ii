const router = require('express').Router();
const jwt = require('jsonwebtoken')
const User = require('../users/User');
const secret = "The cake is a lie"

router.post('/register', function (req, res) {
  User.create(req.body)
    .then(({ username, race }) => {
      // we destructure the username and race to avoid returning the hashed password
      const token = generateToken({username, race})
      // then we assemble a new object and return it
      res.status(201).json({token});
    })
    .catch(err => res.status(500).json(err));
});


router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  User.findOne({ username })
  .then(user => {
    if (user) {
      user
      .validatePassword(password)
      .then(passwordsMatch => {
        let { username, race } = user
        if (passwordsMatch) {
          // generate token
          const token = generateToken(user);
          
          // send token to the client
          res.status(200).json({ message: `welcome ${username}!`, token });
        } else {
          res.status(401).send('invalid credentials');
        }
      })
      .catch(err => {
        res.send('error comparing passwords');
      });
    } else {
      res.status(401).send('invalid credentials');
    }
  })
  .catch(err => {
    res.send(err);
  });
})

function generateToken(user) {
  const options = {
    expiresIn: '1h'
  };
  const payload = { name: user.username, race: user.race}

  return jwt.sign(payload, secret, options)
}

module.exports = router;