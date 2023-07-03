export class Response
{
    constructor(data = {}, status = 200) {
        this.data = data
        this.status = status
    }

    send(response) {
        response.status(this.status).send(this.data)
    }
}