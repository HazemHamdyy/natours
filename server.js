const mongoose =  require('mongoose')
const dotenv = require("dotenv");

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION  Shutting down...')
    console.log(err.name,err.message)
        process.exit(1)
})

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE_URL
mongoose.connect('mongodb+srv://hazem:nfwt8m5xxf0IHUYi@cluster0.olljuaz.mongodb.net/natours?retryWrites=true',{
    useNewUrlParser : true,
    useCreateIndex : true,
    useFindAndModify : false
}).then(con =>{
    // console.log(con.connections)
     console.log("DB connect successfully")
})


const app = require('./app');

const port = process.env.PORT || 3000;   

const server = app.listen(port,
    ()=>{
        console.log(`app is running on port : ${port}`)
    })

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJeCTION Shutting down...')
    console.log(err)
    server.close(()=>{
        process.exit(1)
    })
})
