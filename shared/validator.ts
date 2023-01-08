import Dto = require("./dto");
import Core = require("./core");
import Sl = require("./servicelocator");

import util = require("util");
import {ValidationMethod} from "./enum";

const validator = require('is-my-json-valid/require')

export class JsonError {
    public field : string = "";
    public message : string = "";
}

export class ValidationResult extends Dto.Transferable {
    public didValidate : boolean = false;
    public reason : string;

    constructor(reason : string){
        super("ValidationResult");
        this.reason = reason;
    }

    static CreateValidated() : ValidationResult{
        const retVal : ValidationResult = new ValidationResult("");
        retVal.didValidate = true;
        return retVal;
    }
}

export class JsonSchemaValidationResult extends ValidationResult {
    public errors : JsonError[] = [];

    constructor(){
        super("Invalid payload");
        this.runtimeType = "JsonSchemaValidationResult";
    }

    static FromInvalidPayload(errors : JsonError[]){

        const retVal: JsonSchemaValidationResult = new JsonSchemaValidationResult();
        retVal.didValidate = false;
        retVal.errors = errors;

        return retVal;
    }

}

export class ValidatorBase<TD extends Core.ITransferable> implements Core.IValidator<TD> {

    constructor(postSchemaFilename : string, patchSchemaFilename : string){
        const postSchemaFilepath : string = util.format("%s/%s", Sl.ServiceLocator.CurrentConfigurator.schemaFolderPath ,postSchemaFilename);
        const patchSchemaFilepath : string = util.format("%s/%s", Sl.ServiceLocator.CurrentConfigurator.schemaFolderPath ,patchSchemaFilename);
        this.postSchemaValidator = validator(postSchemaFilepath);
        this.patchSchemaValidator = validator(patchSchemaFilepath);
    }

    public postSchemaValidator : any;
    public patchSchemaValidator : any;

    public IsDtoValid(dto : TD, method : ValidationMethod) : ValidationResult {
        let result : ValidationResult;

        let schemaValidatorInUse : any = null;
        if (method === ValidationMethod.POST) {
            schemaValidatorInUse = this.postSchemaValidator;
        }
        else if (method === ValidationMethod.PATCH) {
            schemaValidatorInUse = this.patchSchemaValidator;
        }

        if (schemaValidatorInUse !== null) {
            const didValidate: boolean = schemaValidatorInUse(dto);
            if (didValidate) {
                result = ValidationResult.CreateValidated();
            } else {
                result = JsonSchemaValidationResult.FromInvalidPayload(schemaValidatorInUse.errors);
            }
        }
        else {
            result = new ValidationResult("No validation schema.");
        }
        return result;
    }

}






export class UserValidator extends ValidatorBase<Dto.DtoUser> {

    constructor(){
        super("post/user.json", "patch/user.json");
    }
}

export class GeoPositionValidator extends ValidatorBase<Dto.DtoGeoPosition> {

    constructor(){
        super("post/geoposition.json", "patch/geoposition.json");
    }
}