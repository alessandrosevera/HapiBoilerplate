import Sl = require("./servicelocator");
import Core = require("./core");
import Storable = require("./storable");
import util = require("util");
import {HttpStatuses} from "./const";

const fse = require("fs-extra");
const moment = require("moment");
const { join } = require( "path" );

export class ProviderBase<TS extends Core.IStorable> implements Core.IPersistenceProvider<TS>{

    public tableName : string;

    constructor(tableName : string){
        this.tableName = tableName;
    }

    public StoreEntity(storable : TS) : Promise<any> {
        return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).insert(storable);
    }

    public RetrieveEntity(filter : any) : Promise<TS[]> {
        return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).where(filter).select();
    }

    public RetrieveEntities(filter : any = null) : Promise<TS[]> {
        if (filter === null){
            return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).select();
        }

        console.log(Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).where(filter).select().toString());
        return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).where(filter).select();
    }

    public DeleteEntity(filter : any) : Promise<number> {
        console.log(Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).where(filter).delete().toString());
        return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).where(filter).delete();
    }

    public UpdateEntity(filter : any, storable : TS) : Promise<any> {
        console.log(Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).where(filter).update(storable).toString());
        return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).where(filter).update(storable);
    }
}


export class GeoPositionProvider extends ProviderBase<Storable.GeoPosition> implements Core.IGeoPositionProvider {
    constructor() {
        super("GeoPosition");
    }

    public RetrievePosition(appointmentId: number | null | undefined, address: string | null | undefined) : Promise<Storable.GeoPosition[]> {
        if (appointmentId && address) {
            return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName)
                .where({ appointmentId: appointmentId })
                .orWhere({ address: address })
                .select();
        }
        else {
            if (appointmentId) {
                return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName)
                    .where({ appointmentId: appointmentId })
                    .select();
            }
            else if (address) {
                return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName)
                    .where({ address: address })
                    .select();
            }
        }

        return Promise.resolve([]);
    }
}


export class RevokedUserTokenProvider extends ProviderBase<Storable.RevokedUserToken> implements Core.IRevokedUserTokenProvider {
    constructor() {
        super("RevokedUserToken");
    }
}


export class UserProvider extends ProviderBase<Storable.User> implements Core.IUserProvider {
    constructor(){
        super("User");
    }

    public RetrieveUserByUsernameOrEmail(usernameOrEmail : string) : Promise<any> {
        return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName)
            .where('email', usernameOrEmail)
            .orWhere('username', usernameOrEmail)
            .select();
    }
}
