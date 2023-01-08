"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Const = require("./const");
class Emitter {
    EmitCreated(h) {
        return h.response().code(Const.HttpStatuses.CREATED);
    }
    EmitUpdated(h) {
        return h.response().code(Const.HttpStatuses.OK);
    }
    EmitDeleted(h) {
        return h.response().code(Const.HttpStatuses.NO_CONTENT);
    }
    EmitMethodNotAllowed(h) {
        return h.response().code(Const.HttpStatuses.METHOD_NOT_ALLOWED);
    }
    EmitError(h, code) {
        return h.response().code(code);
    }
    EmitDto(h, dto, code) {
        return h.response(dto).code(code).header('Access-Control-Allow-Origin', '*');
    }
    EmitBadRequest(h, validationResult) {
        return h.response(validationResult).code(Const.HttpStatuses.BAD_REQUEST).header('X-Custom', 'some-value');
    }
}
exports.default = Emitter;
