const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(error.message);

    }
}

module.exports = connectDB