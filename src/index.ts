import express from 'express'
import { initDB } from './DB'
import userRout from './endpoints/user/Router'
import whatsappRout from './endpoints/whatsappMessages/Router'
import cors from 'cors'
// import whatsappService from './Whatsapp-Delete-Message'



const PORT = 4000
const app = express()

app.use(express.json())
app.use(cors())
app.use('/user',userRout)
app.use('/whatsapp',whatsappRout)
// app.use('/sevice',whatsappService)




const start = () => {
    app.listen(PORT,() => {
        console.log(`server started in port: ${PORT}`)
    })
} 
initDB().then(start)