import { Client, LocalAuth } from "whatsapp-web.js";
import { WhatsappModel } from "./DB/schems/whatsapp";
import { initDB } from "./DB";
// import { Request,Response,Router } from "express";
import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// const rout = Router()

const clients: Client[] = [];

const newClient = (clientId:string) => {
    const client = new Client({
        puppeteer: {
            headless: true, // Запуск без графического интерфейса
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--disable-gpu",
            ],
        },
        authStrategy: new LocalAuth({
            clientId: `client-${clientId}`
        }),
    });
    
        client.on("qr", (qr) => {
            io.emit("qr", qr); // Отправляем QR-код клиенту
            console.log("QR-код обновлен");
        });
        

    client.on("ready", () => {
        console.log("Клиент подключён!");
    });

    

    client.initialize();
    clients.push(client);
    return client;
};



const addMessages = () => {
    for (const client of clients) {
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
                    console.log("Удаленное сообщение сохранено в БД.");
                } catch (error) {
                    console.error("Ошибка при сохранении в БД:", error);
                }
            } else {
                console.log("Удалённое сообщение не обнаружено.");
            }
        });
    }
}

const main = async () => {
    app.get('/test',(req,res)=> {
        newClient(req.body.id);
        res.json('test')
    })

    addMessages()
};

initDB().then(main);

// export default rout
server.listen(50000, () => console.log("Сервер запущен на порту 50000"));
