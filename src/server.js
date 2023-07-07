import dotenv from 'dotenv'
import express from 'express'
import {ClaimController} from './app/controllers/claim-controller'
import {SuccessResponse} from './app/support/response'
import {Cors} from './app/middlewares/cors'

dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use((req, res, next) => {
    [
        // new Cors(),
    ].forEach(middleware => {
        middleware.handle(req, res)
    })
    next()
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('Server running at: http://localhost:' + port)
})
app.get('/', (request, response) => {
    new SuccessResponse({
        message: 'Your are connected to the Simple Faucet dApp Endpoint',
    }).send(response)
})
app.post('/claim', async (request, response) => {
    (await new ClaimController().claim(request)).send(response)
})