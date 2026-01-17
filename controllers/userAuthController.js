const USER = require("../models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const generateToken = ({userId, email, fullName})=>{
    return jwt.sign({ id: userId, email, fullName}, process.env.JWT_SECRET,{
        expiresIn : "15m"
    })
}


//SignUp
//get access to the req.body
//check if there is an existing user
//if no user, create user
//save user in database and protect user password by hashing

const signUp = async (req, res) => {
    console.log("Incoming signup request");

    const {fullName, email, password} = req.body
    console.log(req.body);
    
    try {
        //if user exists?
        const existingUser = await USER.findOne({email})
        if (existingUser) {
            return res.status(400).json({ success : false, message : "User already exists"})
        }
        if (!fullName || !email || !password) {
            return res.status(400).json({success: false, message : "Please provide all credentials"})
        }
        //protect password by hashing
        const hashedPassword = await bcrypt.hash(password, 12)
        //create user
        const user = new USER({
            fullName : fullName,
            email : email,
            password : hashedPassword 
        })
        //save user in database
        await user.save()
        const token = generateToken({ userId : user._id, email : user.email , fullName : user.fullName});
        res.status(201).json({ success : true , message : "User created successfully", token,
        user: { id: user._id, email: user.email, fullName: user.fullName }})
    } catch (error) {
        console.error(error);
        res.status(500).json({success : false, message :  "Signup failed", error : error.message})
    }
}

//get access to req.body
//find user using User.findOne
//if no user res.404
// bycrypt.compare({password, user.password})
//create session token
//login successfull
const signIn = async (req,res) => {
    console.log("Sign in route hit");
    //get access to request
    const {email , password } = req.body;
    console.log(req.body);
    try {
        //find user in db
        const user = await USER.findOne({email})
        if (!user) {
           return res.status(404).json({ success: false, message: "User not found"}) 
        }
        //compare password if user
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message : "Invalid credentials"})
        }
        //create session token
         const token = generateToken({userId: user._id, email:user.email, fullName: user.fullName,})

        res.status(200).json({
            message: "Login successful",
            token,
            user:{
                id: user._id,
                email: user.email,
                fullName: user.fullName
            }
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message:"signin failed", error: error.message})
    }
    
}


module.exports = { signUp, signIn }