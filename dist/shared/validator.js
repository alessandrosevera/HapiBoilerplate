"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoPositionValidator = exports.UserValidator = exports.ValidatorBase = exports.JsonSchemaValidationResult = exports.ValidationResult = exports.JsonError = void 0;
const Dto = require("./dto");
const Sl = require("./servicelocator");
const util = require("util");
const enum_1 = require("./enum");
const validator = require('is-my-json-valid/require');
class JsonError {
    constructor() {
        this.field = "";
        this.message = "";
    }
}
exports.JsonError = JsonError;
class ValidationResult extends Dto.Transferable {
    constructor(reason) {
        super("ValidationResult");
        this.didValidate = false;
        this.reason = reason;
    }
    static CreateValidated() {
        const retVal = new ValidationResult("");
        retVal.didValidate = true;
        return retVal;
    }
}
exports.ValidationResult = ValidationResult;
class JsonSchemaValidationResult extends ValidationResult {
    constructor() {
        super("Invalid payload");
        this.errors = [];
        this.runtimeType = "JsonSchemaValidationResult";
    }
    static FromInvalidPayload(errors) {
        const retVal = new JsonSchemaValidationResult();
        retVal.didValidate = false;
        retVal.errors = errors;
        return retVal;
    }
}
exports.JsonSchemaValidationResult = JsonSchemaValidationResult;
class ValidatorBase {
    constructor(postSchemaFilename, patchSchemaFilename) {
        const postSchemaFilepath = util.format("%s/%s", Sl.ServiceLocator.CurrentConfigurator.schemaFolderPath, postSchemaFilename);
        const patchSchemaFilepath = util.format("%s/%s", Sl.ServiceLocator.CurrentConfigurator.schemaFolderPath, patchSchemaFilename);
        this.postSchemaValidator = validator(postSchemaFilepath);
        this.patchSchemaValidator = validator(patchSchemaFilepath);
    }
    IsDtoValid(dto, method) {
        let result;
        let schemaValidatorInUse = null;
        if (method === enum_1.ValidationMethod.POST) {
            schemaValidatorInUse = this.postSchemaValidator;
        }
        else if (method === enum_1.ValidationMethod.PATCH) {
            schemaValidatorInUse = this.patchSchemaValidator;
        }
        if (schemaValidatorInUse !== null) {
            const didValidate = schemaValidatorInUse(dto);
            if (didValidate) {
                result = ValidationResult.CreateValidated();
            }
            else {
                result = JsonSchemaValidationResult.FromInvalidPayload(schemaValidatorInUse.errors);
            }
        }
        else {
            result = new ValidationResult("No validation schema.");
        }
        return result;
    }
}
exports.ValidatorBase = ValidatorBase;
class UserValidator extends ValidatorBase {
    constructor() {
        super("post/user.json", "patch/user.json");
    }
}
exports.UserValidator = UserValidator;
class GeoPositionValidator extends ValidatorBase {
    constructor() {
        super("post/geoposition.json", "patch/geoposition.json");
    }
}
exports.GeoPositionValidator = GeoPositionValidator;
