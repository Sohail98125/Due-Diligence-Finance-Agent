import mongooose from 'mongoose';

const UserSchema = new mongooose.Schema({
    googleId: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    }
}, {
    timestamps: true
})

export default mongooose.model("User", UserSchema);