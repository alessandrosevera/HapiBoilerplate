"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAdapter = exports.GeoPositionAdapter = exports.RevokedUserTokenAdapter = exports.AdapterBase = void 0;
const Storable = require("./storable");
const Transformer = require("./transformer");
const Filter = require("./filter");
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');
const Sl = require("./servicelocator");
const Const = require("./const");
const Validator = require("./validator");
const emitter_1 = __importDefault(require("./emitter"));
const extension_1 = require("./extension");
const enum_1 = require("./enum");
const Bcrypt = require("bcrypt");
class AdapterBase extends emitter_1.default {
    StoreInternal(data, h, mgr, val, xfm) {
        const that = this;
        const dto = data;
        return new Promise((resolve, reject) => {
            let validationResult;
            validationResult = val.IsDtoValid(dto, enum_1.ValidationMethod.POST);
            if (!validationResult.didValidate) {
                resolve(this.EmitBadRequest(h, validationResult));
            }
            else {
                const storable = xfm.DtoToStorable(dto);
                mgr.StoreEntity(storable).then(function () {
                    resolve(that.EmitCreated(h));
                }).catch(function (err) {
                    const code = extension_1.HttpExtensions.HttpStatusFromDbError(err.code);
                    console.error(err);
                    resolve(that.EmitError(h, code));
                });
            }
        });
    }
    Retrieve1Internal(filter, h, mgr, xfm) {
        const that = this;
        return new Promise((resolve, reject) => {
            mgr.RetrieveEntity(filter).then(function (rows) {
                if (rows.length === 0) {
                    resolve(that.EmitError(h, Const.HttpStatuses.NOT_FOUND));
                }
                else {
                    const storable = rows[0];
                    const dto = xfm.StorableToDto(storable);
                    if (!dto.isNull) {
                        resolve(that.EmitDto(h, dto, Const.HttpStatuses.OK));
                    }
                    else {
                        resolve(that.EmitError(h, Const.HttpStatuses.NOT_FOUND));
                    }
                }
            }).catch(function (err) {
                console.error(err);
                const code = extension_1.HttpExtensions.HttpStatusFromDbError(err.code);
                resolve(that.EmitError(h, code));
            });
        });
    }
    RetrieveNInternal(filter, h, mgr, xfm) {
        const that = this;
        return new Promise((resolve, reject) => {
            mgr.RetrieveEntities(filter).then(function (rows) {
                const dtoCollection = xfm.ArrayOfStorableToDtoCollection(rows);
                resolve(that.EmitDto(h, dtoCollection, Const.HttpStatuses.OK));
            }).catch(function (err) {
                const code = extension_1.HttpExtensions.HttpStatusFromDbError(err.code);
                resolve(that.EmitError(h, code));
            });
        });
    }
    Delete1Internal(filter, h, mgr) {
        const that = this;
        return new Promise((resolve, reject) => {
            mgr.DeleteEntity(filter).then(function (numberOfDeletedRows) {
                if (numberOfDeletedRows === 0) {
                    resolve(that.EmitError(h, Const.HttpStatuses.NOT_FOUND));
                }
                else {
                    resolve(that.EmitDeleted(h));
                }
            }).catch(function (err) {
                const code = extension_1.HttpExtensions.HttpStatusFromDbError(err.code);
                resolve(that.EmitError(h, code));
            });
        });
    }
    UpdateInternal(data, filter, h, mgr, val, xfm) {
        const that = this;
        const dto = data;
        return new Promise((resolve, reject) => {
            let validationResult;
            validationResult = val.IsDtoValid(dto, enum_1.ValidationMethod.PATCH);
            if (!validationResult.didValidate) {
                resolve(this.EmitBadRequest(h, validationResult));
            }
            else {
                const storable = xfm.DtoToUpdateMask(dto);
                mgr.UpdateEntity(filter, storable).then(function (count) {
                    if (count == 0) {
                        resolve(that.EmitError(h, Const.HttpStatuses.NOT_FOUND));
                    }
                    else {
                        resolve(that.EmitUpdated(h));
                    }
                }).catch(function (err) {
                    const code = extension_1.HttpExtensions.HttpStatusFromDbError(err.code);
                    resolve(that.EmitError(h, code));
                });
            }
        });
    }
}
exports.AdapterBase = AdapterBase;
class RevokedUserTokenAdapter {
    constructor() {
        this.mgr = Sl.ServiceLocator.CurrentConfigurator.RevokedUserTokenProvider;
    }
    Revoke(idAuthority, idByAuthority, token) {
        const that = this;
        return new Promise((resolve, reject) => {
            const storable = new Storable.RevokedUserToken();
            storable.token = token;
            storable.idAuthority = idAuthority;
            storable.idByAuthority = idByAuthority;
            that.mgr.StoreEntity(storable).then(function () {
                resolve(true);
            }).catch(function (err) {
                resolve(false);
            });
        });
    }
    IsRevoked(idAuthority, idByAuthority, token) {
        const that = this;
        return new Promise((resolve, reject) => {
            const filter = {
                idAuthority: idAuthority,
                idByAuthority: idByAuthority,
                token: token
            };
            that.mgr.RetrieveEntity(filter).then(function (rows) {
                resolve(rows.length > 0);
            }).catch(function (err) {
                resolve(false);
            });
        });
    }
}
exports.RevokedUserTokenAdapter = RevokedUserTokenAdapter;
class GeoPositionAdapter extends AdapterBase {
    constructor() {
        super(...arguments);
        this.mgr = Sl.ServiceLocator.CurrentConfigurator.GeoPositionProvider;
        this.xfm = new Transformer.GeoPositionTransformer();
        this.val = new Validator.GeoPositionValidator();
    }
    StorePosition(data, h) {
        return this.StoreInternal(data, h, this.mgr, this.val, this.xfm);
    }
    RetrievePosition(filterByParameters, h) {
        const that = this;
        return new Promise((resolve, reject) => {
            that.mgr.RetrievePosition(filterByParameters.appointmentId, filterByParameters.address).then(function (rows) {
                if (rows.length === 0) {
                    resolve(that.EmitError(h, Const.HttpStatuses.NOT_FOUND));
                }
                else {
                    const storable = rows[0];
                    const dto = that.xfm.StorableToDto(storable);
                    if (!dto.isNull) {
                        resolve(that.EmitDto(h, dto, Const.HttpStatuses.OK));
                    }
                    else {
                        resolve(that.EmitError(h, Const.HttpStatuses.NOT_FOUND));
                    }
                }
            }).catch(function (err) {
                console.error(err);
                const code = extension_1.HttpExtensions.HttpStatusFromDbError(err.code);
                resolve(that.EmitError(h, code));
            });
        });
    }
}
exports.GeoPositionAdapter = GeoPositionAdapter;
class UserAdapter extends AdapterBase {
    constructor() {
        super(...arguments);
        this.mgr = Sl.ServiceLocator.CurrentConfigurator.UserProvider;
        this.xfm = new Transformer.UserTransformer();
        this.val = new Validator.UserValidator();
        /*
            public RetrieveUserCredentials(request) : Promise<any>{
        
                var retVal : Dto.DtoUser = null;
        
                var userCompositeId : string = request.headers["x-user"];
                var components = userCompositeId.split("-");
                var idAuthority : string = components[0];
                var idByAuthority : string = components[1];
        
                var filter= {"idAuthority":idAuthority, "idByAuthority":idByAuthority}
        
                return this.mgr.RetrieveEntity(filter).then(
                    function(rows : Storable.User[]) {
                        var user : Dto.DtoUser;
                        if (rows.length === 0){
                            user = new Dto.DtoUser();
                            user.idAuthority = idAuthority;
                            user.idByAuthority = idByAuthority;
                        }
                        else {
                            var xfm : Transformer.UserTransformer = new Transformer.UserTransformer();
                            var storable : Storable.User = rows[0];
                            user = xfm.StorableToDto(storable);
                        }
        
                        return user;
        
                    });
        
            }
        */
    }
    StoreUser(data, dtoOverridesByParameters, h) {
        this.SetDtoOverrides(data, dtoOverridesByParameters);
        const salt = Bcrypt.genSaltSync(15);
        if (data.password) {
            data.password = Bcrypt.hashSync(data.password, salt);
        }
        return this.StoreInternal(data, h, this.mgr, this.val, this.xfm);
    }
    RetrieveUser(filterByParameters, h) {
        const filter = this.GetFilterByParameters(filterByParameters);
        return this.Retrieve1Internal(filter, h, this.mgr, this.xfm);
    }
    RetrieveUsers(filterByParameters, h) {
        const filter = this.GetFilterByParameters(filterByParameters);
        return this.RetrieveNInternal(filter, h, this.mgr, this.xfm);
    }
    DeleteUser(filterByParameters, h) {
        const filter = this.GetFilterByParameters(filterByParameters);
        return this.Delete1Internal(filter, h, this.mgr);
    }
    UpdateUser(filterByParameters, data, h) {
        const filter = this.GetFilterByParameters(filterByParameters);
        const salt = Bcrypt.genSaltSync(15);
        if (data.password) {
            data.password = Bcrypt.hashSync(data.password, salt);
        }
        return this.UpdateInternal(data, filter, h, this.mgr, this.val, this.xfm);
    }
    RetrieveUserByAuthority(idAuthority, idByAuthority) {
        const that = this;
        return new Promise((resolve, reject) => {
            const filterByParameters = new Filter.UserFilter();
            filterByParameters.idAuthority = idAuthority;
            filterByParameters.idByAuthority = idByAuthority;
            const filter = this.GetFilterByParameters(filterByParameters);
            that.mgr.RetrieveEntity(filter).then(function (rows) {
                if (rows.length === 0) {
                    reject(null);
                }
                else {
                    const storable = rows[0];
                    const dto = that.xfm.StorableToDto(storable);
                    if (!dto.isNull) {
                        resolve(dto);
                    }
                    else {
                        reject(null);
                    }
                }
            }).catch(function (err) {
                console.error(err);
                const code = extension_1.HttpExtensions.HttpStatusFromDbError(err.code);
                reject(null);
            });
        });
    }
    RetrieveUserByUsernameOrEmail(usernameOrEmail) {
        const that = this;
        return new Promise((resolve, reject) => {
            that.mgr.RetrieveUserByUsernameOrEmail(usernameOrEmail).then(function (rows) {
                if (rows.length === 0) {
                    reject(null);
                }
                else {
                    const storable = rows[0];
                    const dto = that.xfm.StorableToDto(storable);
                    if (!dto.isNull) {
                        resolve(dto);
                    }
                    else {
                        reject(null);
                    }
                }
            }).catch(function (err) {
                console.error(err);
                const code = extension_1.HttpExtensions.HttpStatusFromDbError(err.code);
                reject(null);
            });
        });
    }
    SetDtoOverrides(data, dtoOverridesByParameters) {
    }
    GetFilterByParameters(filterByParameters) {
        const filter = {};
        if (filterByParameters.idAuthority !== null && filterByParameters.idAuthority !== undefined)
            filter.idAuthority = filterByParameters.idAuthority;
        if (filterByParameters.idByAuthority !== null && filterByParameters.idByAuthority !== undefined)
            filter.idByAuthority = filterByParameters.idByAuthority;
        if (filterByParameters.isHidden !== null && filterByParameters.isHidden !== undefined)
            filter.isHidden = filterByParameters.isHidden;
        return filter;
    }
}
exports.UserAdapter = UserAdapter;
