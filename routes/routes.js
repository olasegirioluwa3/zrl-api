const express = require('express');
const bodyParser = require('body-parser');
const { User, Application, Payment } = require('./models');

const router = express.Router();

router.use(bodyParser.json());

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ 
      email: req.body.email, 
      password: hashedPassword 
    });
    res.status(201).json(user);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Login endpoint (Here, you'd also generate and send a JWT for authentication)

// Other endpoints for application submission, payment, etc.

module.exports = router;
