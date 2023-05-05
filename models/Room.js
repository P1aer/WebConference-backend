import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    messages: [{
        type: Object,
    }],
    users: [{
        type: String,
    }]
}, {
    timestamps: true
})

export default mongoose.model("Room",RoomSchema)