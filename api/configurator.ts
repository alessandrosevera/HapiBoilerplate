
import Core = require('../shared/core');
import Provider = require("../shared/provider");

const moment = require("moment");
import {IGeoPositionProvider} from "../shared/core";
import {GeoPositionProvider} from "../shared/provider";

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
    static MYSQL_DB_HOST = "127.0.0.1";
    static MYSQL_DB_PORT = "3306"; // MySQL default is 3306
    static MYSQL_DB_USERNAME = "root";
    static MYSQL_DB_PASSWORD = "password";
    static MYSQL_DB = "test_db";

    static MSSQL_DB_HOST = "127.0.0.1";
    static MSSQL_DB_USERNAME = "mssql";
    static MSSQL_DB_PASSWORD = "mssql_password";
    static MSSQL_DB = "TEST_MSSQL_DB";
    static MSSQL_QUERY_TIMEOUT = 50000;
}

class MSSQLClient implements Core.IMSSQLClient {
    private pool: any = null;
    private mssql = require('mssql');

    public async ClosePool() {
        try {
            // try to close the connection pool
            await this.pool.close();

            // set the pool to null to ensure
            // a new one will be created by getConnection()
            this.pool = null;
        } catch (err) {
            // error closing the connection (could already be closed)
            // set the pool to null to ensure
            // a new one will be created by getConnection()
            this.pool = null;
            console.error(["error", "data"], "closePool error");
            console.error(["error", "data"], err);
        }
    }

    public GetConnection(dbName: string | null): Promise<[any, any]> {
        const that = this;
        let resolvedInError : boolean = false;
        let resolvedInContext : boolean = false;

        return new Promise<[any, any]>(async function (resolve, reject) {
            try {
                if (that.pool) {
                    if (that.pool.pool) {
                        if (dbName && that.pool.config.database !== dbName) {
                            await that.ClosePool();
                        } else {
                            if (that.pool._connected) {
                                resolvedInContext = true;
                                resolve([that.pool, null]);
                            }
                            else {
                                await that.ClosePool();
                            }
                        }
                    } else {
                        await that.ClosePool();
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
                    }
                    const startTime = moment();
                    that.pool = await that.mssql.connect(config);
                    const endTime = moment();

                    console.log("OPEN CONNECTION MS: " + endTime.diff(startTime, "milliseconds"));

                    that.pool.on("error", async (err: any) => {
                        console.error(["error", "data"], "connection pool error");
                        console.error(["error", "data"], err);
                        await that.ClosePool();

                        if (!resolvedInContext) {
                            resolvedInError = true;
                            resolve([null, err]);
                        }
                    });

                    if (!resolvedInError) {
                        resolvedInContext = true;
                        resolve([that.pool, null]);
                    }
                }

            } catch (err) {
                console.error(["error", "data"], "error connecting to sql server");
                console.error(["error", "data"], err);
                that.pool = null;

                if (!resolvedInError) {
                    resolvedInContext = true;
                    resolve([null, err]);
                }
            }
        });
    }
}

export class ApiConfigurator implements Core.IConfigurator {
    public ipBinding : string;
    public portBinding : number;
    public schemaFolderPath : string;
    public queryFolderPath : string;

    public knex = require('knex')({
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
    public mssqlClient = new MSSQLClient();

    constructor() {
        this.ipBinding = process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0";
        this.portBinding = parseInt(process.env.OPENSHIFT_NODEJS_PORT || "80");
        this.schemaFolderPath = "../schema";
        this.queryFolderPath = "query";
    }

    public UserProvider : Core.IUserProvider = new Provider.UserProvider();
    public RevokedUserTokenProvider : Core.IRevokedUserTokenProvider = new Provider.RevokedUserTokenProvider();
    public GeoPositionProvider : Core.IGeoPositionProvider = new Provider.GeoPositionProvider();
}

