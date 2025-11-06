import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
    liker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    liked: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    }
}, { timestamps: true });

likeSchema.index({ liker: 1, liked: 1 }, { unique: true });

export default mongoose.model('Like', likeSchema);