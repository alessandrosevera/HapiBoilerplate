"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExtensions = void 0;
const Const = require("./const");
class HttpExtensions {
    static HttpStatusFromDbError(err) {
        switch (err) {
            case "ER_DUP_ENTRY":
            case "ER_NO_REFERENCED_ROW_2":
            case "ER_ROW_IS_REFERENCED_2":
                return Const.HttpStatuses.CONFLICT;
            default:
                break;
        }
        return Const.HttpStatuses.INTERNAL_SERVER_ERROR;
    }
}
exports.HttpExtensions = HttpExtensions;
