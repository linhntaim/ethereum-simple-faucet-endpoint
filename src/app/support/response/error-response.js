import {Response} from './response'

export class ErrorResponse extends Response
{
    constructor(data = {}, status = 500) {
        super(data, status < 400 && status >= 600 ? 500 : status)
    }
}