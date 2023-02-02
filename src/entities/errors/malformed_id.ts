import ErrorResponse from "./error_response";

export default class MalformedIdError extends ErrorResponse {
    constructor(error: String) {
        super(error);
    }
}