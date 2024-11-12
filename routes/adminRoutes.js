const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/UserModel')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const adminMiddleware = require('../middleware/adminMIddleware')



///=======LOGIN ROUTE ============
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      if (email !== process.env.ADMIN_EMAIL) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const isMatch = process.env.ADMIN_PASSWORD;
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

  
      console.log('Admin authenticated successfully.');
  
      const payload = {
        role: 'admin',
        email: process.env.ADMIN_EMAIL,
      };
  
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      });
  
      res.status(200).json({ token, user: { email: process.env.ADMIN_EMAIL } });
    } catch (error) {
      console.error('Admin Login Error:', error);
      res.status(500).json({ message: 'Server error.' });
    }
});



//============== DASHBOARD RENDERING ============
router.get('/dashboard', adminMiddleware, async (req, res) => {
    try {
      const users = await User.find().select('name email createdAt ').sort({ createdAt: -1 })
      
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error.' });
    } 
});



//============== USER DETAILS UPDATING =============
router.put('/updateUser',async(req,res)=>{
  try {
    const {name,email,id} = req.body
    const user = await User.findById(id)

    if(!id){
      return res.status(400).json({message : 'User id is missing...'})
    }

    if(name){
      user.name = name
    }
    if(email){
      user.email = email
    }

    const updatedUser = await user.save()
    const userResponse = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      pic: updatedUser.pic,
      isAdmin: updatedUser.isAdmin,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    res.status(200).json(userResponse)

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
})


//============== USER DELETION ====================
router.put('/deleteUser',async(req,res)=>{  
  try {
    const {userId} = req.body

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const deletedUser = await User.findByIdAndDelete(userId)

    res.status(200).json({message : "User deleted Successfully!",user:deletedUser})
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error })
  }
})



router.post('/addUser',async(req,res)=>{
  console.log('backend');
})



module.exports = router