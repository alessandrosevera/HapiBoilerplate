import Const = require("./const")

export class HttpExtensions {
    public static HttpStatusFromDbError(err : any) : number{
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