import {Middleware} from '../support/middleware'

export class Cors extends Middleware
{
    handle(req, res) {
        res.set({
            'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN || '*',
            'Access-Control-Allow-Headers': process.env.CORS_ALLOW_HEADERS || '*',
        })
    }
}