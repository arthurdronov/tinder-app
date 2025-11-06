import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    dob: { type: Date },
    bio: { type: String, default: '' },
    photos: [{ type: String }],
    gender: { type: String, enum: ['homem', 'mulher', 'outro'] },
    seeking: { type: String, enum: ['homem', 'mulher', 'todos'] },
    ageRange: {
        min: { type: Number, default: 18 },
        max: { type: Number, default: 99 }
    }
})

export default mongoose.model('Profile', profileSchema)