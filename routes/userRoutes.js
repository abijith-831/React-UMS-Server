const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const bcrypt = require('bcryptjs')
const User = require('../models/UserModel')
const jwt = require('jsonwebtoken')
const userMiddleware = require('../middleware/userMiddleware')
require('dotenv').config()


const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/')
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+'-'+file.originalname)
    }
})

const upload = multer({storage:storage})


//========= SIGN UP =========
router.post('/signup',upload.single('pic'),async(req,res)=>{
    console.log('ksndjfvsd');
    try {
        const {name , email, password} = req.body

        if (!name || !email || !password || !req.file) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const exists = await User.findOne({email})
        if(exists){
            console.log('already');
            return res.status(400).json({message:'User already exists'})
        }

        const hashed = await bcrypt.hash(password,10)
        console.log('sdgs'+name);
        const newUser = new User({
            name , 
            email,
            password : hashed,
            pic:req.file.path
        })

        await newUser.save()
        const userResponse = {
            _id: newUser._id,
            name: newUser.name,
            password : newUser.password,
            email: newUser.email,
            pic: newUser.pic,
            isAdmin: newUser.isAdmin,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
        };

        res.status(201).json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });

    }
})


//======== LOGIN IN =========
router.post('/login',async(req,res)=>{

    // console.log('logged');
    try {
        const {email , password} = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({email})
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const match = await bcrypt.compare(password , user.password)
        if (!match) {
            console.log('Password mismatch');
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        console.log('User authenticated:', user.name);

        const payload = {
            userId : user._id,
            email : user.email,
            isAdmin : user.isAdmin
        }

        const token = jwt.sign(
            payload,          
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        const userResponse = {
            token,
            _id: user._id,
            name: user.name,
            email: user.email,
            password : user.password,
            pic: user.pic,
            isAdmin: user.isAdmin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        res.status(200).json({ token, user: userResponse });

    } catch (error) {
        console.log('errrr',error);
   res.status(500).json(error);

    }
})



//======== UPDATE PROFILE ==========
router.put('/update-profile',upload.single('pic'),async(req,res)=>{
    try {        
    const { name , userId } = req.body;
    console.log('sbjcsf',req.file);
    
    if(!userId){
        return res.status(400).json({message:'User ID is missing'})
    }

    const user = await User.findById(userId)
    console.log('dbsd',user);

    if(name){
        user.name = name;
    }

    if(req.file){
        user.pic = req.file.path
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

    res.status(200).json(userResponse);
      

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error.' });
    } 
})



router.get('/protected-route',userMiddleware , (req,res)=>{
    res.status(200).json({ message: 'This is a protected route.', user: req.user });
})

module.exports = router