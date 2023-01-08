import Const = require("./const")
import Validator = require("./validator");

export default class Emitter {

    protected EmitCreated(h : any) : Response {
        return h.response().code(Const.HttpStatuses.CREATED);
    }

    protected EmitUpdated(h : any) : Response {
        return h.response().code(Const.HttpStatuses.OK);
    }


    protected EmitDeleted(h : any) : Response {
        return h.response().code(Const.HttpStatuses.NO_CONTENT);
    }

    protected EmitMethodNotAllowed(h : any) : Response {
        return h.response().code(Const.HttpStatuses.METHOD_NOT_ALLOWED);
    }

    protected EmitError(h : any, code : number) : Response {
        return h.response().code(code);
    }

    protected EmitDto(h : any, dto : any, code : number) : Response {
        return h.response(dto).code(code).header('Access-Control-Allow-Origin','*');
    }

    protected EmitBadRequest(h : any, validationResult : Validator.ValidationResult) : Response {
        return h.response(validationResult).code(Const.HttpStatuses.BAD_REQUEST).header('X-Custom', 'some-value');
    }
}