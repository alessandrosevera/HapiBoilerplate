
import Dto = require("./dto");
import Storable = require("./storable");
import Transformer = require("./transformer");
import Filter = require("./filter");
const moment = require("moment");
const { v4 : uuidv4 } = require('uuid');

import Sl = require("./servicelocator");
import Core = require("./core");
import Const = require("./const")
import Validator = require("./validator");
import Emitter from "./emitter";
import {HttpExtensions} from "./extension";
import {ValidationMethod} from "./enum";

const Bcrypt = require("bcrypt");


export class AdapterBase<TD extends Core.ITransferable, TS extends Core.IStorable> extends Emitter {

    public StoreInternal(data : any, h : any, mgr : Core.IPersistenceProvider<TS>, val : Core.IValidator<TD>, xfm : Core.ITransformer<TD, TS>) : Promise<Response>{
        const that: AdapterBase<TD, TS> = this;
        const dto: TD = <TD>data;

        return new Promise<Response>((resolve, reject) => {
            let validationResult: Validator.ValidationResult;
            validationResult = val.IsDtoValid(dto, ValidationMethod.POST);
            if (!validationResult.didValidate) {
                resolve(this.EmitBadRequest(h, validationResult));
            } else {
                const storable: TS = xfm.DtoToStorable(dto);
                mgr.StoreEntity(storable).then(function () {
                    resolve(that.EmitCreated(h));
                }).catch(function (err) {
                    const code: number = HttpExtensions.HttpStatusFromDbError(err.code);
                    console.error(err);
                    resolve(that.EmitError(h, code));
                });
            }
        });
    }

    public Retrieve1Internal(filter : any, h : any, mgr : Core.IPersistenceProvider<TS>, xfm : Core.ITransformer<TD, TS>) : Promise<Response> {
        const that: AdapterBase<TD, TS> = this;
        return new Promise<Response>((resolve, reject) => {
            mgr.RetrieveEntity(filter).then(function (rows: TS[]) {
                if (rows.length === 0) {
                    resolve(that.EmitError(h, Const.HttpStatuses.NOT_FOUND));
                } else {
                    const storable: TS = rows[0];
                    const dto: TD = xfm.StorableToDto(storable);
                    if (!dto.isNull) {
                        resolve(that.EmitDto(h, dto, Const.HttpStatuses.OK));
                    } else {
                        resolve(that.EmitError(h, Const.HttpStatuses.NOT_FOUND));
                    }
                }
            }).catch(function (err) {
                console.error(err);
                const code: number = HttpExtensions.HttpStatusFromDbError(err.code);
                resolve(that.EmitError(h, code));
            });
        });
    }

    public RetrieveNInternal(filter : any, h : any, mgr : Core.IPersistenceProvider<TS>, xfm : Core.ITransformer<TD, TS>) : Promise<Response> {
        const that: AdapterBase<TD, TS> = this;
        return new Promise<Response>((resolve, reject) => {
            mgr.RetrieveEntities(filter).then(function (rows: TS[]) {
                const dtoCollection = xfm.ArrayOfStorableToDtoCollection(rows);
                resolve(that.EmitDto(h, dtoCollection, Const.HttpStatuses.OK));
            }).catch(function (err) {
                const code : number = HttpExtensions.HttpStatusFromDbError(err.code);
                resolve(that.EmitError(h, code));
            });
        });
    }

    public Delete1Internal(filter : any, h : any, mgr : Core.IPersistenceProvider<TS>) : Promise<Response> {
        const that: AdapterBase<TD, TS> = this;
        return new Promise<Response>((resolve, reject) => {
            mgr.DeleteEntity(filter).then(function (numberOfDeletedRows: number) {
                if (numberOfDeletedRows === 0) {
                    resolve(that.EmitError(h, Const.HttpStatuses.NOT_FOUND));
                } else {
                    resolve(that.EmitDeleted(h));
                }
            }).catch(function (err) {
                const code: number = HttpExtensions.HttpStatusFromDbError(err.code);
                resolve(that.EmitError(h, code));
            });
        });
    }

    public UpdateInternal(data : any, filter : any, h : any,  mgr : Core.IPersistenceProvider<TS>, val : Core.IValidator<TD>, xfm : Core.ITransformer<TD, TS>) : Promise<Response> {
        const that: AdapterBase<TD, TS> = this;
        const dto: TD = <TD>data;

        return new Promise<Response>((resolve, reject) => {
            let validationResult: Validator.ValidationResult;
            validationResult = val.IsDtoValid(dto, ValidationMethod.PATCH);
            if (!validationResult.didValidate) {
                resolve(this.EmitBadRequest(h, validationResult));
            } else {
                const storable: TS = xfm.DtoToUpdateMask(dto);
                mgr.UpdateEntity(filter, storable).then(function (count: number) {
                    if (count == 0) {
                        resolve(that.EmitError(h, Const.HttpStatuses.NOT_FOUND));
                    } else {
                        resolve(that.EmitUpdated(h));
                    }
                }).catch(function (err) {
                    const code: number = HttpExtensions.HttpStatusFromDbError(err.code);
                    resolve(that.EmitError(h, code));
                });
            }
        });
    }

}

export class RevokedUserTokenAdapter {
    private mgr : Core.IRevokedUserTokenProvider = Sl.ServiceLocator.CurrentConfigurator.RevokedUserTokenProvider;

    public Revoke(idAuthority: string, idByAuthority: string, token: string) : Promise<boolean> {
        const that : RevokedUserTokenAdapter = this;
        return new Promise<boolean>((resolve, reject) => {
            const storable: Storable.RevokedUserToken = new Storable.RevokedUserToken();
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

    public IsRevoked(idAuthority: string, idByAuthority: string, token: string) : Promise<boolean> {
        const that : RevokedUserTokenAdapter = this;
        return new Promise<boolean>((resolve, reject) => {
            const filter = {
                idAuthority: idAuthority,
                idByAuthority: idByAuthority,
                token: token
            };
            that.mgr.RetrieveEntity(filter).then(function (rows: Storable.RevokedUserToken[]) {
                resolve(rows.length > 0);
            }).catch(function (err) {
                resolve(false);
            });
        });
    }
}

export class GeoPositionAdapter extends AdapterBase<Dto.DtoGeoPosition, Storable.GeoPosition> {
    private mgr : Core.IGeoPositionProvider = Sl.ServiceLocator.CurrentConfigurator.GeoPositionProvider;
    private xfm : Transformer.GeoPositionTransformer = new Transformer.GeoPositionTransformer();
    private val : Validator.GeoPositionValidator = new Validator.GeoPositionValidator();

    public StorePosition(data : any, h : any) : Promise<Response> {
        return this.StoreInternal(data, h, this.mgr, this.val, this.xfm);
    }

    public RetrievePosition(filterByParameters : Dto.DtoGeoPosition, h : any) : Promise<Response> {
        const that: GeoPositionAdapter = this;
        return new Promise<Response>((resolve, reject) => {
            that.mgr.RetrievePosition(filterByParameters.appointmentId, filterByParameters.address).then(function (rows: Storable.GeoPosition[]) {
                if (rows.length === 0) {
                    resolve(that.EmitError(h, Const.HttpStatuses.NOT_FOUND));
                } else {
                    const storable: Storable.GeoPosition = rows[0];
                    const dto: Dto.DtoGeoPosition = that.xfm.StorableToDto(storable);
                    if (!dto.isNull) {
                        resolve(that.EmitDto(h, dto, Const.HttpStatuses.OK));
                    } else {
                        resolve(that.EmitError(h, Const.HttpStatuses.NOT_FOUND));
                    }
                }
            }).catch(function (err) {
                console.error(err);
                const code: number = HttpExtensions.HttpStatusFromDbError(err.code);
                resolve(that.EmitError(h, code));
            });
        });
    }
}

export class UserAdapter extends AdapterBase<Dto.DtoUser, Storable.User> {

    private mgr : Core.IUserProvider = Sl.ServiceLocator.CurrentConfigurator.UserProvider;
    private xfm : Transformer.UserTransformer = new Transformer.UserTransformer();
    private val : Validator.UserValidator = new Validator.UserValidator();

    public StoreUser(data : any, dtoOverridesByParameters : Dto.DtoUser, h : any) : Promise<Response> {
        this.SetDtoOverrides(data, dtoOverridesByParameters);

        const salt = Bcrypt.genSaltSync(15);
        if (data.password) {
            data.password = Bcrypt.hashSync(data.password, salt);
        }

        return this.StoreInternal(data, h, this.mgr, this.val, this.xfm);
    }

    public RetrieveUser(filterByParameters : Filter.UserFilter, h : any) : Promise<Response> {
        const filter: Dto.DtoUser = this.GetFilterByParameters(filterByParameters);
        return this.Retrieve1Internal(filter, h, this.mgr, this.xfm);
    }

    public RetrieveUsers(filterByParameters : Filter.UserFilter, h : any) : Promise<Response> {
        const filter: Dto.DtoUser = this.GetFilterByParameters(filterByParameters);
        return this.RetrieveNInternal(filter, h, this.mgr, this.xfm);
    }

    public DeleteUser(filterByParameters : Filter.UserFilter, h : any) : Promise<Response> {
        const filter: Dto.DtoUser = this.GetFilterByParameters(filterByParameters);
        return this.Delete1Internal(filter, h, this.mgr);
    }


    public UpdateUser(filterByParameters : Filter.UserFilter, data : any, h : any) : Promise<Response> {
        const filter: Dto.DtoUser = this.GetFilterByParameters(filterByParameters);

        const salt = Bcrypt.genSaltSync(15);
        if (data.password) {
            data.password = Bcrypt.hashSync(data.password, salt);
        }

        return this.UpdateInternal(data, filter, h,  this.mgr, this.val, this.xfm);
    }

    public RetrieveUserByAuthority(idAuthority : string, idByAuthority : string) : Promise<Dto.DtoUser> {
        const that: UserAdapter = this;
        return new Promise<Dto.DtoUser>((resolve, reject) => {
            const filterByParameters = new Filter.UserFilter();
            filterByParameters.idAuthority = idAuthority;
            filterByParameters.idByAuthority = idByAuthority;
            const filter : Dto.DtoUser = this.GetFilterByParameters(filterByParameters);

            that.mgr.RetrieveEntity(filter).then(function (rows: Storable.User[]) {
                if (rows.length === 0) {
                    reject(null);
                } else {
                    const storable: Storable.User = rows[0];
                    const dto: Dto.DtoUser = that.xfm.StorableToDto(storable);
                    if (!dto.isNull) {
                        resolve(dto);
                    } else {
                        reject(null);
                    }
                }
            }).catch(function (err) {
                console.error(err);
                const code: number = HttpExtensions.HttpStatusFromDbError(err.code);
                reject(null);
            });
        });
    }

    public RetrieveUserByUsernameOrEmail(usernameOrEmail : string) : Promise<Dto.DtoUser> {
        const that: UserAdapter = this;
        return new Promise<Dto.DtoUser>((resolve, reject) => {
            that.mgr.RetrieveUserByUsernameOrEmail(usernameOrEmail).then(function (rows: Storable.User[]) {
                if (rows.length === 0) {
                    reject(null);
                } else {
                    const storable: Storable.User = rows[0];
                    const dto: Dto.DtoUser = that.xfm.StorableToDto(storable);
                    if (!dto.isNull) {
                        resolve(dto);
                    } else {
                        reject(null);
                    }
                }
            }).catch(function (err) {
                console.error(err);
                const code: number = HttpExtensions.HttpStatusFromDbError(err.code);
                reject(null);
            });
        });
    }

    private SetDtoOverrides(data : any, dtoOverridesByParameters : Dto.DtoUser){
    }

    private GetFilterByParameters(filterByParameters : Filter.UserFilter) : any {
        const filter: any = {};

        if (filterByParameters.idAuthority !== null && filterByParameters.idAuthority !== undefined) filter.idAuthority = filterByParameters.idAuthority;
        if (filterByParameters.idByAuthority !== null && filterByParameters.idByAuthority !== undefined) filter.idByAuthority = filterByParameters.idByAuthority;
        if (filterByParameters.isHidden !== null && filterByParameters.isHidden !== undefined) filter.isHidden = filterByParameters.isHidden;

        return filter;
    }

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