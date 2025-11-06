import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import Profile from './Profile.js'
import Like from './Like.js'
import Match from './Match.js'

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
    }
})

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


userSchema.post('findOneAndDelete', async function (doc) {
    if (doc && doc.profile) {
        const profileId = doc.profile;

        await Profile.findOneAndDelete({ _id: profileId });
        
        await Like.deleteMany({
            $or: [
                { liker: profileId },
                { liked: profileId }
            ]
        });

        await Match.deleteMany({ profiles: profileId });
    }
});

export default mongoose.model('User', userSchema)