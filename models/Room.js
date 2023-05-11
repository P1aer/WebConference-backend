import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    messages: [{
        type: Object,
    }],
    users: [{
        type: Object,
    }]
}, {
    timestamps: true
})

export default mongoose.model("Room",RoomSchema)