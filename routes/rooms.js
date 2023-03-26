import express from "express"
import checkToken from "../utils/checkToken.js";
import Room from "../models/Room.js";

const router = express.Router()

router.get('/',checkToken,async (req,res) => {
    try {
        const rooms = await Room.find()
        res.status(200).json(rooms)
    }
    catch (e) {
        console.log(e)
        res.status(500)
    }
})
router.get('/:id',checkToken,async (req,res) => {
    try {
        const paramId = req.params.id;
        const room = await Room.findById(paramId)
        if (!room) {
            res.status(404)
        }
        res.status(200).json(room)
    }
    catch (e) {
        console.log(e)
        res.status(500)
    }
})
router.post('/create',checkToken,async (req,res) => {
    try {
        if (!req.body.name) {
            res.status(400)
            return
        }
        const room = new Room({
            name: req.body.name,
            users: [],
            messages: []
        })
        const savedRoom = await room.save()
        res.status(200).json(savedRoom)
    }
    catch (e) {
        console.log(e)
        res.status(500)
    }
})

export default router