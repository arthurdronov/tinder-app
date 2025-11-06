import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    profiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }]
});

export default mongoose.model('Match', matchSchema)