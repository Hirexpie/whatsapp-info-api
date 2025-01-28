import { Router } from 'express';
import controller from './Controller'
import { checkAuth } from '../checkAuth';

const rout = Router();

rout.get('/getDelitedMessages',checkAuth,controller.getDeletedMessages)
// rout.post('/login', controller.login)


export default rout