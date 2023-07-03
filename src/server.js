import dotenv from 'dotenv'
import express from 'express'
import {ClaimController} from './app/controllers/claim-controller'

dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('Server running at: http://localhost:' + port)
})
app.get('/', (request, response) => {
    response.send({
        message: 'Your are connected to the Simple Faucet dApp Endpoint',
    })
})
app.post('/claim', async (request, response) => {
    (await new ClaimController().claim(request)).send(response)
})