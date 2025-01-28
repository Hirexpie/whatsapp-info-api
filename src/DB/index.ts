import mongoos from 'mongoose'
import { MongoConnect } from '../config/dotenv'

export const initDB = async () => {
    mongoos.connect(MongoConnect).then(() => {
        console.log('db connect')
    })
}