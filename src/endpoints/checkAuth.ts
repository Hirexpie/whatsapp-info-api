import { Request,Response,NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface verifyRequest extends Request {
    authData?: any;
  }

export const checkAuth = (req:verifyRequest,res:Response,next:NextFunction) => {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

    

    try {
        if (!token) {
            res.status(401).json({ message: 'Ошибка аутентификации' });
            return 
        }
        const decoded = jwt.decode(token) as {authData:any};
        req.authData = decoded.authData
        next();
    } catch (e) {
        res.status(401).json({ message: 'Ошибка аутентификации' });
        return 
    }



}