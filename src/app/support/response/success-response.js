import {Response} from './response'

export class SuccessResponse extends Response
{
    constructor(data = {}) {
        super(data)
    }
}