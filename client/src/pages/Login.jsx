import React, { useState } from 'react'
import { io } from 'socket.io-client'
import {useNavigate} from 'react-router-dom'


const socket = io(import.meta.env.VITE_BACKEND_URL);
const Login = () => {
    const [username,setUsername]=useState('')

    const navigate=useNavigate()


    const sendingToLogin = () => {
        socket.emit('Login',{username})
        navigate('/chat',{ state: { username } })
    }
    return (
        <div>
            <div>
                <input type="text" placeholder='username' value={username} onChange={(e)=>setUsername(e.target.value)}/>
                <button type="button" onClick={sendingToLogin}>Join Room </button>
            </div>
        </div>
    )
}

export default Login