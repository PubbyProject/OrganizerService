export default class ErrorResponse {
    private error: String

    constructor(error: String) {
        this.error = error;
    }

    public getError() {
        return this.error;
    }
}