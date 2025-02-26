import { Request,Response } from 'express'
import { WhatsappModel } from '../../DB/schems/whatsapp'
import { verifyRequest } from '../checkAuth'

class UserController {
    async getDeletedMessages(req:verifyRequest,res:Response) {
        try {
            const phoneNumber  = req.authData?.phoneNumber || ""
            const page:any = req.query.page || '0'
            
            const data = await WhatsappModel.find( {$or: [{from: '+'+phoneNumber},{to: '+'+phoneNumber}]}).sort({ createdAt: -1 }) 
            .skip(page * 100)
            .limit(100)
            res.json({
                whatsappMessages:data,
                total:data.length
            })
        }
        catch (e) {
            res.status(400).json(e)
        }
    }
}

export default new UserController()