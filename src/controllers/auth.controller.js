// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/user.model');

// /**
//  * Signup new user
//  */
// exports.signup = async (req, res) => {
//   try {
//     const { username, password, name, email, role } = req.body;
//     if (!username || !password) 
//       return res.status(400).json({ message: 'username & password required' });
    
//     const user = await User.create({ username, passwordHash: password, name, email, role });
//     return res.json({ message: 'ok', user: user.safe() });
//   } catch (err) {
//     if (err.code === 11000) 
//       return res.status(400).json({ message: 'username exists' });
//     return res.status(500).json({ message: 'error', error: err.message });
//   }
// };

// /**
//  * Login existing user
//  */
// exports.login = async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username });
//     if (!user) return res.status(401).json({ message: 'invalid credentials' });

//     const valid = await bcrypt.compare(password, user.passwordHash);
//     if (!valid) return res.status(401).json({ message: 'invalid credentials' });

//     const token = jwt.sign(
//       { id: user._id, username: user.username, role: user.role },
//       process.env.JWT_SECRET || 'replace_this_in_prod',
//       { expiresIn: '8h' }
//     );

//     return res.json({ token, user: user.safe() });
//   } catch (err) {
//     return res.status(500).json({ message: 'error', error: err.message });
//   }
// };

// =====================================================================================================

const userModel = require("../models/users.model")
const jwt = require("jsonwebtoken");
const bcrypt= require('bcrypt');


async function signup(req, res) {
  try {
    const { userType, firstName, lastName, email, phone, password, confirmPassword } = req.body;

    if (!userType || !firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!validEmail)
      return res.status(400).json({ message: "Please Enter a Vaild Email" });

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPassword.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      }); 
    }


    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      userType,
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    const token = jwt.sign({ _id: user._id}, process.env.JWT_SECRET, {expiresIn: "90d"});

    return res
      .status(201)
      .json({ message: "user Created Successfully!!!", token,  userType:user.userType });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });
    
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Login successful", token,  userType:user.userType });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


async function profile(req,res) {
  try {
    const userId = req.userId
    const userData = await userModel.findById(userId).select("firstName email userType")
    console.log(userData)
    res.json( userData)
  } catch (error) {
  res.json({'message': `Something went worng ${error}`})
  }
}

module.exports = { signup, login,profile };
