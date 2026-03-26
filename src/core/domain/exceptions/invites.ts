import { ControllerError } from "@/adapters/inbound/http/middlewares/general-error-handler";

export class InviteNotFound extends ControllerError {
    constructor(public status = 404) {
        super('Invite not found.')
    }
}