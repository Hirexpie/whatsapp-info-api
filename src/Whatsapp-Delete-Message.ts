import { Client ,LocalAuth} from 'whatsapp-web.js'
import fs from 'fs'
import qrcode from 'qrcode-terminal'
import { initDB } from './DB';
import { WhatsappModel } from './DB/schems/whatsapp';

const sessionPath = '../wwebjs_auth';
const start = () => {

    if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
    }
    const client = new Client({
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'], 
        },
        authStrategy: new LocalAuth(),
    });

    client.on('qr', (qr) => {
        console.log('Сканируйте QR-код с помощью WhatsApp:');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Клиент подключён!');
    });

    client.on('message_revoke_everyone', async (message, revokedMessage) => {
        if (revokedMessage) {
            const newMessage = new WhatsappModel({
                to:revokedMessage.to,
                from:revokedMessage.from,
                body:revokedMessage.body,
                isDeleted:true
            })
            newMessage.save()
            // console.log(`Сообщение удалено!`);
            // console.log(revokedMessage.to)
            
            // console.log(`Автор: ${revokedMessage.from}`);
            // console.log(`Содержимое удалённого сообщения: ${revokedMessage.body}`);
        } else {
            console.log('Удалённое сообщение не обнаружено.');
        }
    });

    client.initialize();
}


initDB().then(start)