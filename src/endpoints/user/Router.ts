import { Router } from 'express';
import controller from './Controller'

const rout = Router();

rout.post('/register', controller.register)
rout.post('/login', controller.login)


export default rout