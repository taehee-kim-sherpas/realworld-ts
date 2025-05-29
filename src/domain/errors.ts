export class NotExistError extends Error {
    constructor(public message: string) {
        super(message);
    }
}


export class AlreadyExistError extends Error {
    constructor(public message: string) {
        super(message);
    }
}
