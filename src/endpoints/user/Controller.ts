import { Request,Response } from 'express'
import bcrypt from 'bcrypt'
import { UserModel } from '../../DB/schems/user'
import jwt from 'jsonwebtoken'
import { privateKey } from '../../config/dotenv'

const generateToken = (data:any) => {
    return jwt.sign({
        authData:data
    },privateKey,{expiresIn:'1m'})
}

class UserController {
    async register(req:Request,res:Response) {
        try {

            const { nikname,password,phoneNumber } = req.body
            const isUser = await UserModel.findOne({nikname:nikname})
            if (isUser) {
                res.json({message:'пользаватель с таким ником уже существует'})
                return
            }
            const salt = bcrypt.genSaltSync(10)
            const PasswordHash = bcrypt.hashSync(password,salt)
            const newUser = new UserModel({
                nikname:nikname,
                PasswordHash:PasswordHash,
                phoneNumber:phoneNumber
            }) 
            newUser.save()
            res.json({message:'пользавтель успешно за регестрирован'})
            }
        catch (e) {
            res.status(400).json(e)
        }


    }
    async login(req:Request,res:Response) {
        try {
            const { login, password } = req.body
            const user = await UserModel.findOne({nikname:login})
            if (!user) {
                res.status(400).json({message:'логин или пароль не верень'})
                return
            }
            const isPass = await bcrypt.compareSync(password,user.PasswordHash)
            if (!isPass) {
                res.status(400).json({message:'логин или пароль не верень'})
                return
            }
            const token = generateToken({
                id:user.id,
                phoneNumber:user.phoneNumber
            })
            res.json({
                token: token,
                expiresAt: Date.now() * 60
            })
        }
        catch (e) {
            res.status(400).json(e)
        }
    }
}

export default new UserController()