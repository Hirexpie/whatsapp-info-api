import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    nikname: string;          
    phoneNumber: string;
    role: 'user' | 'admin' | 'moderator';
    PasswordHash: string;
    createdAt: Date;
    isAuth: boolean;
    
}

const UserSchema: Schema = new Schema<IUser>({
    nikname: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user',
    },
    PasswordHash: {
        type: String,
        required: true
    },
    isAuth: {
        type: Boolean,
        default: false
    }

},{
    timestamps:true
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);

