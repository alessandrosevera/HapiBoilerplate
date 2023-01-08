"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiConfigurator = void 0;
const Provider = require("../shared/provider");
const moment = require("moment");
/*

bcrypt | cost: 10, time to hash: 65.683ms
bcrypt | cost: 11, time to hash: 129.227ms
bcrypt | cost: 12, time to hash: 254.624ms
bcrypt | cost: 13, time to hash: 511.969ms
bcrypt | cost: 14, time to hash: 1015.073ms
bcrypt | cost: 15, time to hash: 2043.034ms
bcrypt | cost: 16, time to hash: 4088.721ms
bcrypt | cost: 17, time to hash: 8162.788ms
bcrypt | cost: 18, time to hash: 16315.459ms
bcrypt | cost: 19, time to hash: 32682.622ms
bcrypt | cost: 20, time to hash: 66779.182ms

 */
class Db {
}
Db.MYSQL_DB_HOST = "127.0.0.1";
Db.MYSQL_DB_PORT = "3306"; // MySQL default is 3306
Db.MYSQL_DB_USERNAME = "root";
Db.MYSQL_DB_PASSWORD = "password";
Db.MYSQL_DB = "test_db";
Db.MSSQL_DB_HOST = "127.0.0.1";
Db.MSSQL_DB_USERNAME = "mssql";
Db.MSSQL_DB_PASSWORD = "mssql_password";
Db.MSSQL_DB = "TEST_MSSQL_DB";
Db.MSSQL_QUERY_TIMEOUT = 50000;
class MSSQLClient {
    constructor() {
        this.pool = null;
        this.mssql = require('mssql');
    }
    ClosePool() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // try to close the connection pool
                yield this.pool.close();
                // set the pool to null to ensure
                // a new one will be created by getConnection()
                this.pool = null;
            }
            catch (err) {
                // error closing the connection (could already be closed)
                // set the pool to null to ensure
                // a new one will be created by getConnection()
                this.pool = null;
                console.error(["error", "data"], "closePool error");
                console.error(["error", "data"], err);
            }
        });
    }
    GetConnection(dbName) {
        const that = this;
        let resolvedInError = false;
        let resolvedInContext = false;
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    if (that.pool) {
                        if (that.pool.pool) {
                            if (dbName && that.pool.config.database !== dbName) {
                                yield that.ClosePool();
                            }
                            else {
                                if (that.pool._connected) {
                                    resolvedInContext = true;
                                    resolve([that.pool, null]);
                                }
                                else {
                                    yield that.ClosePool();
                                }
                            }
                        }
                        else {
                            yield that.ClosePool();
                        }
                    }
                    if (!resolvedInContext) {
                        const config = {
                            user: Db.MSSQL_DB_USERNAME,
                            password: Db.MSSQL_DB_PASSWORD,
                            server: Db.MSSQL_DB_HOST,
                            database: dbName || Db.MSSQL_DB,
                            requestTimeout: Db.MSSQL_QUERY_TIMEOUT,
                            options: {
                                trustServerCertificate: false,
                                minVersion: 'TLSv1',
                                encrypt: false
                            }
                        };
                        const startTime = moment();
                        that.pool = yield that.mssql.connect(config);
                        const endTime = moment();
                        console.log("OPEN CONNECTION MS: " + endTime.diff(startTime, "milliseconds"));
                        that.pool.on("error", (err) => __awaiter(this, void 0, void 0, function* () {
                            console.error(["error", "data"], "connection pool error");
                            console.error(["error", "data"], err);
                            yield that.ClosePool();
                            if (!resolvedInContext) {
                                resolvedInError = true;
                                resolve([null, err]);
                            }
                        }));
                        if (!resolvedInError) {
                            resolvedInContext = true;
                            resolve([that.pool, null]);
                        }
                    }
                }
                catch (err) {
                    console.error(["error", "data"], "error connecting to sql server");
                    console.error(["error", "data"], err);
                    that.pool = null;
                    if (!resolvedInError) {
                        resolvedInContext = true;
                        resolve([null, err]);
                    }
                }
            });
        });
    }
}
class ApiConfigurator {
    constructor() {
        this.knex = require('knex')({
            client: 'mysql',
            connection: {
                host: process.env.OPENSHIFT_MYSQL_DB_HOST || Db.MYSQL_DB_HOST,
                user: process.env.OPENSHIFT_MYSQL_DB_USERNAME || Db.MYSQL_DB_USERNAME,
                port: process.env.OPENSHIFT_MYSQL_DB_PORT || Db.MYSQL_DB_PORT,
                password: process.env.OPENSHIFT_MYSQL_DB_PASSWORD || Db.MYSQL_DB_PASSWORD,
                database: process.env.OPENSHIFT_GEAR_NAME || Db.MYSQL_DB,
                useAffectedRows: true
            }
        });
        this.mssqlClient = new MSSQLClient();
        this.UserProvider = new Provider.UserProvider();
        this.RevokedUserTokenProvider = new Provider.RevokedUserTokenProvider();
        this.GeoPositionProvider = new Provider.GeoPositionProvider();
        this.ipBinding = process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0";
        this.portBinding = parseInt(process.env.OPENSHIFT_NODEJS_PORT || "80");
        this.schemaFolderPath = "../schema";
        this.queryFolderPath = "query";
    }
}
exports.ApiConfigurator = ApiConfigurator;
