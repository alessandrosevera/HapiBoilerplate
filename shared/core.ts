import { Server } from "@hapi/hapi";

import Validator = require("./validator");
import Storable = require("./storable");
import {ValidationMethod} from "./enum";

export interface IStorable {}

export interface IConfigurator {
    knex : any;
    mssqlClient : IMSSQLClient;

    ipBinding : string;
    portBinding : number;

    schemaFolderPath : string;
    queryFolderPath : string;

    UserProvider : IUserProvider;
    RevokedUserTokenProvider: IRevokedUserTokenProvider;
    GeoPositionProvider: IGeoPositionProvider;
}

export interface IMSSQLClient {
    GetConnection(dbName : string | null) : Promise<[any, any]>;
    ClosePool() : Promise<any>;
}

export interface IOperator {
    Initialize() : Promise<Server>;
    Start() : Promise<void>;
}

export interface ITransferable {
    runtimeType : string;
    isNull : boolean;
}

export interface ITransferableCollection<TD extends ITransferable> extends ITransferable {
    setCollection(collection : TD[]) : void;
    getCollection() : TD[];
}


export interface IValidator<TD extends ITransferable> {
    IsDtoValid(dto : TD, method : ValidationMethod) : Validator.ValidationResult;
}

export interface ITransformer<TD extends ITransferable, TS extends IStorable> {
    DtoToStorable(dto : TD) : TS;
    DtoToUpdateMask(dto : TD) : TS;

    StorableToDto(storable : TS) : TD;
    ArrayOfStorableToDtoCollection(arrayOfStorable : TS[]) : ITransferableCollection<TD>;
}

export interface IPersistenceProvider<TS extends IStorable> {
    StoreEntity(storable : TS) :  Promise<any>;
    RetrieveEntity(filter : any) : Promise<any>;
    RetrieveEntities(filter : any) : Promise<any>;
    DeleteEntity(filter : any) : Promise<number>;
    UpdateEntity(filter : any, storable : TS) : Promise<number>;
}


export interface IGeoPositionProvider extends IPersistenceProvider<Storable.GeoPosition> {
    RetrievePosition(appointmentId: number | null | undefined, address: string | null | undefined) : Promise<Storable.GeoPosition[]>;
}

export interface IRevokedUserTokenProvider extends IPersistenceProvider<Storable.RevokedUserToken> {}

export interface IUserProvider extends IPersistenceProvider<Storable.User> {
    RetrieveUserByUsernameOrEmail(usernameOrEmail : string) : Promise<any>;
}