import http from "http"
import express from "express";
import {Server} from "socket.io"
import cors from "cors"
import mongoose from "mongoose";
import auth from "./routes/auth.js"
import rooms from './routes/rooms.js'
import { ACTIONS } from "./config/actions.js";
import Room from "./models/Room.js";


mongoose.connect(process.env.MONGO_URI).then(() => console.log("start DB MONGA"))

const PORT = process.env.PORT || 3030;
const DEV = process.env.NODE_ENV === "development";
const TOKEN = process.env.TOKEN;

const app = express();
app.use(express.json(), cors());
app.use('/auth', auth)
app.use('/rooms', rooms)

const server = http.createServer(app);
const io = new Server(server, { cors: {} });

io.use((socket, next) => {
    const token = socket.handshake.auth.token; // check the auth token provided by the client upon connection
    if (token === TOKEN) {
        socket.userId = socket.handshake.auth.userId;
        socket.userName = socket.handshake.auth.userName
        next();
    } else {
        next(new Error("Authentication error"));
    }
});


io.on("connection", (socket) => {
    const leaveRoom = async () => {

        const {rooms} = socket;
        const user = {
            peerId: socket.id,
            userId: socket.userId,
            userName: socket.userName,
        }
        for (const roomId1 of Array.from(rooms).filter(roomId => roomId !== socket.id)) {

            const clients = Array.from(io.sockets.adapter.rooms.get(socket.currentRoom) || [])
/*            try {
                await Room.findByIdAndUpdate(roomId1, {
                    $pull :{
                        users: user
                    }
                })
            }
            catch (error) {
                console.log(error)
                return
            }*/
            clients.forEach(clientID => {
                // оповещаем о выходе пользователя
                io.to(clientID).emit(ACTIONS.REMOVE_PEER, {
                    peerID: socket.id,
                })
                io.to(clientID).emit(ACTIONS.LEAVED, user)
                // на фронте себе
                socket.emit(ACTIONS.REMOVE_PEER, {
                    peerID: clientID
                })
            })

            socket.leave(roomId1)
        }


        socket.currentRoom = null
    }
    socket.on(ACTIONS.JOIN ,async (roomId) => {
        const {rooms: joinedRooms} = socket;

        if (Array.from(joinedRooms).includes(roomId)) {
            return console.warn(`Already joined to ${roomId}`);
        }
        const user = {
            peerId: socket.id,
            userId: socket.userId,
            userName: socket.userName,
        }
/*        try {
            await Room.findByIdAndUpdate(roomId, {
                $push: {
                    users: user
                }
            })
        }
        catch (error) {
            console.log(error)
            return
        }*/
        console.log(roomId, 'Id on join')
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        console.log(clients, 'client in room')
        clients.forEach(clientID => {
            // те кто в комнате принимают пир
            io.to(clientID).emit(ACTIONS.ADD_PEER, {
                peerID: socket.id,
                createOffer: false,
            })
            io.to(clientID).emit(ACTIONS.JOINED, user)
            // кто подключился создает офер
            socket.emit(ACTIONS.ADD_PEER, {
                peerID: clientID,
                createOffer: true,
            })
        })
        socket.currentRoom = roomId
        socket.join(roomId)

        console.log(io.sockets.adapter.rooms.get(roomId),'clients after join\n ////////////////////////////////////////')
    })
    socket.on("disconnecting", leaveRoom)
    socket.on(ACTIONS.LEAVE, leaveRoom)

    socket.on(ACTIONS.RELAY_SDP,({peerID,sessionDescription}) => {
        io.to(peerID).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerID: socket.id,
            sessionDescription
        })
    })
    socket.on(ACTIONS.RELAY_ICE,({peerID, iceCandidate}) => {
        io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
            peerID: socket.id,
            iceCandidate,
        })
    })
    socket.on(ACTIONS.NEW_MESSAGE, async ({roomId, user, text}) => {
        const obj = {
            user,
            text
        }
        await Room.findByIdAndUpdate(roomId, {
            $push: {
                messages: obj
            }
        })
        socket.to(roomId).emit(ACTIONS.SET_MESSAGE, obj)
    })
});
server.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));