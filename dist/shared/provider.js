"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProvider = exports.RevokedUserTokenProvider = exports.GeoPositionProvider = exports.ProviderBase = void 0;
const Sl = require("./servicelocator");
const fse = require("fs-extra");
const moment = require("moment");
const { join } = require("path");
class ProviderBase {
    constructor(tableName) {
        this.tableName = tableName;
    }
    StoreEntity(storable) {
        return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).insert(storable);
    }
    RetrieveEntity(filter) {
        return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).where(filter).select();
    }
    RetrieveEntities(filter = null) {
        if (filter === null) {
            return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).select();
        }
        console.log(Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).where(filter).select().toString());
        return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).where(filter).select();
    }
    DeleteEntity(filter) {
        console.log(Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).where(filter).delete().toString());
        return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).where(filter).delete();
    }
    UpdateEntity(filter, storable) {
        console.log(Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).where(filter).update(storable).toString());
        return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName).where(filter).update(storable);
    }
}
exports.ProviderBase = ProviderBase;
class GeoPositionProvider extends ProviderBase {
    constructor() {
        super("GeoPosition");
    }
    RetrievePosition(appointmentId, address) {
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
exports.GeoPositionProvider = GeoPositionProvider;
class RevokedUserTokenProvider extends ProviderBase {
    constructor() {
        super("RevokedUserToken");
    }
}
exports.RevokedUserTokenProvider = RevokedUserTokenProvider;
class UserProvider extends ProviderBase {
    constructor() {
        super("User");
    }
    RetrieveUserByUsernameOrEmail(usernameOrEmail) {
        return Sl.ServiceLocator.CurrentConfigurator.knex(this.tableName)
            .where('email', usernameOrEmail)
            .orWhere('username', usernameOrEmail)
            .select();
    }
}
exports.UserProvider = UserProvider;
