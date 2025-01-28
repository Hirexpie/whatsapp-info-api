import mongoose, { Document, Schema } from 'mongoose';

export interface IWhatsapp extends Document {
    userId: string
    to: string 
    from: string   
    body: string
    isDeleted: boolean
    createdAt: Date
    
}

const WhatsAppSchema: Schema = new Schema<IWhatsapp>({
    to: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    isDeleted: Boolean

},{
    timestamps:true
});

export const WhatsappModel = mongoose.model<IWhatsapp>('Whatsapp', WhatsAppSchema);

