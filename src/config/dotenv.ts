import dotenv from 'dotenv'


dotenv.config()
export const MongoConnect = process.env.MongoDB || ''
export const privateKey = process.env.privateKey || ''