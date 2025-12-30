import express from 'express'
import morgan from 'morgan'

import dotenv from "dotenv"
dotenv.config()


const app= express()
const PORT =process.env.PORT;
//logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//Body Parser Middleware:-want to accept some files like:-
//allow 1gb json file to pass.  express.json tells what kind of data you are accepting and allowed size
app.use(express.json({limit:'10kb'}))
//accept data from url
app.use(express.urlencoded({extended:true, limit:"10kb"}))



//handle global error
app.use((err, req,res,next)=>{
    console.error(err.stack)
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === "development" && {stack: err.stack})
    })
})


//API routes






//security for 404 handler should be always at bottom
//404 handler
app.use((req,res)=>{
    res.status(404).json({
        status:"error",
        message:"Route not found !!",

    })

})

app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT} in ${process.env.NODE_ENV} mode`)
})