import ErrorResponse from "./error_response";

export default class OrganizerNotFoundError extends ErrorResponse {
    constructor(error: string) {
        super(error);
    }
}