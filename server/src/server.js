import express from 'express'
import { Server } from 'socket.io'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(express.json())
app.use(cors({ origin: "*" }))

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL ||"*",        // allow all origins
        methods: ["GET", "POST"]
    }
});

const user = new Map()

io.on('connection', (socket) => {
    console.log('User Connected id:', socket.id)

    // login
    socket.on('Login', ({ username }) => {
        user.set(socket.id, username)
        console.log(username)

    })

    // message
    socket.on('message', ({ message, username }) => {
        const Hours = new Date().getHours()
        const Minutes = new Date().getMinutes()
        const Seconds = new Date().getSeconds()
        const time=`${Hours}h / ${Minutes}m / ${Seconds}s`
        io.emit('message-recive', { message,username, time})
        console.log()
    })

    // typing effect
    socket.on('typing',({username,isTyping})=>{
        socket.broadcast.emit('user-typing',{username,isTyping})
    })

    // disconnect
    socket.on('disconnect', () => {
        console.log('User Disconnected id:', socket.id,);

        io.emit('user_disconnected', socket.id);
    });

})
const  PORT= process.env.PORT || 3001;
server.listen(PORT, () => console.log('server started at 3001'))