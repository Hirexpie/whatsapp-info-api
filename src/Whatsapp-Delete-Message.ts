import { Client, LocalAuth } from "whatsapp-web.js";
import { WhatsappModel } from "./DB/schems/whatsapp";
import { initDB } from "./DB";
import { Request,Response } from "express";
import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from 'cors'
import { UserModel } from "./DB/schems/user";
import { Types } from "mongoose";
import { checkAuth, verifyRequest } from "./endpoints/checkAuth";
import fs from 'fs'
import path from 'path'


const app = express();
app.use(cors())
app.use(express.json())
const server = http.createServer(app);
const io = new Server(server);

// const rout = Router()

async function deleteFolder(folderPath:string) {
    try {
        await fs.rmSync(folderPath, { recursive: true, force: true });
        console.log('Папка удалена');
    } catch (error) {
        console.error('Ошибка при удалении папки:', error);
    }
}


const clients: { [key: string]: Client } = {};

const newClient = (clientId:string) => {
    if (clients[clientId]) {
        console.log(`Клиент с ID ${clientId} уже существует.`);
        return 
    }
    // const { basePath, cachePath } = createUserDirectories(clientId);
    // const authPath = createUserDirectories(clientId);
    console.log(`Создаём нового клиента: ${clientId}`);
    const client = new Client({
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        },
        authStrategy: new LocalAuth({
            clientId: `client-${clientId}`,
            dataPath: path.join('.wwebjs_auth')
        }),
    });

    client.on("qr", (qr) => {
        io.emit("qr",  qr ); // Добавляем clientId в QR-код
        console.log(`QR-код обновлён для клиента ${clientId}`);
    });
    client.on('authenticated', async () => {
        try {
            const updatedUser = await UserModel.findOneAndUpdate({_id: new Types.ObjectId(clientId)}, { isAuth: true }, { new: true });
            if (updatedUser) {
                console.log(`Клиент ${clientId} успешно аутентифицирован.`);
            } else {
                console.log(`Пользователь с ID ${clientId} не найден.`);
            }


            clients[clientId] = client; // Сохраняем клиента


        } catch (error) {
            console.error("Ошибка при обновлении аутентификации:", error);
        }
    });
    client.on("ready", async () => {
        const phoneNumber = client.info?.wid?.user
        await UserModel.findOneAndUpdate({_id:new Types.ObjectId(clientId)},{phoneNumber:phoneNumber})
        io.emit('authed',{isAuth:true,phoneNum:phoneNumber})

        console.log(`Клиент ${clientId} подключён!`);
        deleteFolder('.wwebjs_cache')
        addMessageListener(client, clientId);
    });
        setTimeout(() => {
            if (!clients[clientId]) {
                deleteFolder(`.wwebjs_auth/session-client-${clientId}`)
            }
        },60000)
    client.initialize();
    // return client;
};



const addMessageListener = (client: Client, clientId: string) => {
    client.on("message_revoke_everyone", async (message, revokedMessage) => {
        if (revokedMessage) {
            const newMessage = new WhatsappModel({
                to: "+" + revokedMessage.to.replace("@c.us", ""),
                from: "+" + revokedMessage.from.replace("@c.us", ""),
                body: revokedMessage.body,
                isDeleted: true,
            });

            try {
                await newMessage.save();
                console.log(`Удалённое сообщение клиента ${clientId} сохранено в БД.`);
            } catch (error) {
                console.error("Ошибка при сохранении в БД:", error);
            }
        } else {
            console.log("Удалённое сообщение не обнаружено.");
        }
    });
};
const main = async () => {

    const authenticatedUsers = await UserModel.find({ isAuth: true });

    for (const user of authenticatedUsers) {
        if (!user._id) {
            continue
        }
        console.log(`🔄 Восстанавливаем клиента: ${user._id}`);
        newClient(user._id.toString());
    }


    app.delete('/logout',checkAuth ,async (req:verifyRequest, res:Response) => {
        try {

            const userId = req.authData?.id
            if (!userId) {
                res.json('error')
                return
            }
            await UserModel.findOneAndUpdate({_id:new Types.ObjectId(userId)},{phoneNumber: '',isAuth:false})
            deleteFolder(`.wwebjs_auth/session-client-${userId}`)
            delete clients[userId]
        }
        catch (e) {
            res.status(400).json({message:'что то пошло не так'})
        }
    })

    app.post('/isAuth', async (req:Request, res:Response) => {
        try {
            const userId = req.body.id;




            if (!userId) {
                res.status(400).json({ error: "Отсутствует ID пользователя" });
                return 
            }

            const user = await UserModel.findOne({_id:new Types.ObjectId(userId),isAuth:true})
            if (user) {
                res.json({isAuth:true,phoneNumber:user.phoneNumber})
                return
            }

            newClient(userId);
            res.json({ isAuth:false });
        } catch (e) {
            res.status(500).json({ error: "Ошибка на сервере", details: e });
        }
    });


    
};
initDB().then(main);


app.get('/getAuthedUsers',(req:Request,res:Response) => {
    try {
        const users = Object.keys(clients); // Получаем все clientId



        res.json({users})
    }
    catch (e) {
        console.log(clients,e)
        res.status(400).json({error:e})
    }
})

// export default rout
server.listen(50000, () => console.log("Сервер запущен на порту 50001 нет 50000"));
