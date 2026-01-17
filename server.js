const dotenv = require("dotenv")
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const cors = require("cors")
const userRoutes = require("./routes/userRouter")

dotenv.config()
app.use(express.json())
// app.use(cors({
//     origin : ["http://localhost:5173", "https://plwc-mu.vercel.app/"],
//     credentials: true
// }))
app.use(cors()) 

app.use("/api/user", userRoutes)

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("MongoDB connected");
        
        const Port = process.env.PORT
        app.listen(Port, ()=>{
            console.log(`Server running on Port : ${Port}`);
        })
    } catch (error) {
        console.log(error);   
    }
}
startServer()