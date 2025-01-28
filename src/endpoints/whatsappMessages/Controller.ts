import { Request,Response } from 'express'
import { WhatsappModel } from '../../DB/schems/whatsapp'
import { verifyRequest } from '../checkAuth'

class UserController {
    async getDeletedMessages(req:verifyRequest,res:Response) {
        try {
            const { phoneNumber,id } = req.authData
            const page:any = req.query.page || '0'
            const data = await WhatsappModel.find( {$or: [{from: phoneNumber+'@c.us'},{to: phoneNumber+'@c.us'}]}).sort({ createdAt: -1 }) 
            .skip(page * 100)
            .limit(100)
            res.json({whatsappMessages:data})
        }
        catch (e) {
            res.status(400).json(e)
        }
    }
}

export default new UserController()