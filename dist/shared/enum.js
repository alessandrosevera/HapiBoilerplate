"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.ValidationMethod = void 0;
var ValidationMethod;
(function (ValidationMethod) {
    ValidationMethod["POST"] = "POST";
    ValidationMethod["PATCH"] = "PATCH";
})(ValidationMethod = exports.ValidationMethod || (exports.ValidationMethod = {}));
var UserRole;
(function (UserRole) {
    UserRole["Superuser"] = "Superuser";
    UserRole["Viewer"] = "Viewer";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
