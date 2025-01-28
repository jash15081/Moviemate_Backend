import express from "express";  // Import express
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js"

dotenv.config({
    path: './.env'
});

// const MONGO_URI="mongodb+srv://chintan:chintan123@cluster0.i5cai.mongodb.net/moviemate?retryWrites=true&w=majority";
const PORT=8000;

// const app = express();  // Initialize app here

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port : ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });




    // connectDB()
    // .then(() => {
    //     app.listen(process.env.PORT || 8000, () => {
    //         console.log(`Server is running at port : ${process.env.PORT}`);
    //     });
    // })
    // .catch((err) => {
    //     console.log("MONGO db connection failed !!! ", err);
    // });












// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";

// import express from "express"
// const app = express();



// ;( async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//         app.on("err", () => {
//             console.log("Error : ", err);
//             throw err;
//         })


//         app.listen(process.env.PORT, () => {
//             console.log(`App is listing on the port ${process.env.PORT}`)
//         })
//     }catch(err){

//     }

// })()