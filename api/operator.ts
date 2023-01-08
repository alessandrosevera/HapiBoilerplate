import Core = require('../shared/core');
import Sl = require("../shared/servicelocator");
import Adapter = require('../shared/adapter');
import Dto = require('../shared/dto');
import Filter = require('../shared/filter');
import {Request, ResponseToolkit, Server} from "@hapi/hapi";
import {HttpStatuses} from "../shared/const";
import {DtoUser} from "../shared/dto";
import {UserRole} from "../shared/enum";
import fs from "fs";

const Hapi = require('@hapi/hapi');
const Bcrypt = require("bcrypt");
const Jwt = require('jsonwebtoken');

const JWT_SECRET = "TrtYzcJTCT]jtg-dRG,ND0*6otb318d#+gHn";

export class ApiOperator implements Core.IOperator {

    private server = new Hapi.Server({
        port: Sl.ServiceLocator.CurrentConfigurator.portBinding,
        host: Sl.ServiceLocator.CurrentConfigurator.ipBinding,
        routes: {
            cors: {
                origin: ['*'],
                headers: ['Accept', 'Authorization', 'Content-Type', 'Origin', 'X-Requested-With', 'If-None-Match'],
                additionalHeaders: ['access-control-request-method', 'access-control-request-headers', 'sec-fetch-mode', 'sec-fetch-site', 'sec-fetch-dest',
                    'accept-encoding', 'accept-language', 'user-agent', 'skip']
            }
        },
        /*tls: {
            key: fs.readFileSync("key.pem"),
            cert: fs.readFileSync("cert.pem")
        }*/
    });

    private userAdapter : Adapter.UserAdapter = new Adapter.UserAdapter();
    private geoPositionAdapter : Adapter.GeoPositionAdapter = new Adapter.GeoPositionAdapter();
    private revokedTokenAdapter : Adapter.RevokedUserTokenAdapter = new Adapter.RevokedUserTokenAdapter();

    public async Initialize() : Promise<Server> {
        await this.ConfigureServer();

        return this.server;
    }

    public async Start() : Promise<void> {
        await this.server.start();
        console.log("Hapi server started @", this.server.info.uri);
    }

    private async ConfigureServer() : Promise<boolean> {
        const that : ApiOperator = this;
        await that.ConfigureAuthStrategy();
        that.ConfigureUserPaths();
        that.ConfigureGeoPositionPaths();

        return true;
    }

    private async ConfigureAuthStrategy() {
        const that : ApiOperator = this;

        await that.server.register(require('@hapi/basic'));
        await that.server.register(require('@hapi/cookie'));
        await that.server.register(require('hapi-auth-bearer-token'));

        that.server.auth.strategy('session', 'cookie', {
            cookie: {
                name: 'itacall-cookie-111',
                password: '!wsYhFA*C2U6nz=Bu^%A@^F#SF3&kSR6',
                isSecure: false,
                clearInvalid: true
            },
            redirectTo: false,
            validateFunc: async (request : any, session : any) => {
                try {
                    const user : Dto.DtoUser = await that.userAdapter.RetrieveUserByAuthority("itacall", session.id);
                    if (!user) {
                        return { credentials: null, valid: false };
                    }

                    const credentials = {
                        id: user.idByAuthority,
                        name: user.username || user.email,
                        scope: user.role?.toLowerCase(),
                        user: user
                    }
                    return { credentials: credentials, valid: true };

                } catch (validateException) {
                    return { credentials: null, valid: false };
                }
            }
        });

        that.server.auth.strategy('bearer', 'bearer-access-token', {
            allowQueryToken: true,              // optional, false by default
            validate: async (request : any, token : any, h : any) => {
                let isValid : boolean = false;
                let credentials : any = null;
                let artifacts : any = null;

                try {
                    const decoded = Jwt.verify(token, JWT_SECRET);
                    if (decoded) {
                        const user = await that.userAdapter.RetrieveUserByAuthority(<string>decoded.idAuthority, <string>decoded.idByAuthority);
                        if (user) {
                            let isRevoked : boolean = await that.revokedTokenAdapter.IsRevoked(<string>user.idAuthority, <string>user.idByAuthority, token);
                            if (!isRevoked) {
                                credentials = {
                                    id: user.idByAuthority,
                                    name: user.username || user.email,
                                    token: token,
                                    scope: user.role?.toLowerCase(),
                                    user: user
                                };
                                artifacts = {
                                    id: user.idByAuthority,
                                    name: user.username || user.email,
                                    token: token,
                                    scope: user.role?.toLowerCase(),
                                    user: user
                                };
                                isValid = true;
                            }
                            else {
                                // TODO LOG
                            }
                        }
                        else {
                            // TODO LOG
                            console.error("USER NOT FOUND");
                        }
                    }
                }
                catch (exception) {
                    // TODO LOG

                    isValid = false;
                    credentials = null;
                    artifacts = null;

                    console.error(exception);
                }

                return { isValid, credentials, artifacts };
            }
        });

        that.server.auth.default('bearer');
    }

    private ConfigureUserPaths(){
        const that : ApiOperator = this;

        that.server.route({
            method: 'GET'
            , path: '/'
            , options: {
                auth: false
            }
            , handler: (request : Request, h : ResponseToolkit) => {
                // request.auth.isAuthenticated
                // request.auth.credentials
                return 'I\'m awake!';
            }
        });

        that.server.route({
            method: 'POST'
            , path: '/logout'
            , options: {
                auth: {
                    mode: 'try'
                }
            }
            , handler: async (request : any, h : any) => {
                const that = this;
                try {
                    if (request.auth.isAuthenticated && request.auth.credentials && request.auth.credentials.user) {
                        const authUser: DtoUser = request.auth.credentials.user;
                        let isRevoked : boolean = await that.revokedTokenAdapter.IsRevoked(<string>authUser.idAuthority, <string>authUser.idByAuthority, request.auth.credentials.token);
                        if (!isRevoked) {
                            isRevoked = await that.revokedTokenAdapter.Revoke(<string>authUser.idAuthority, <string>authUser.idByAuthority, request.auth.credentials.token);
                            if (isRevoked) {
                                return h.response().code(HttpStatuses.OK);
                            }
                            else {
                                return h.response().code(HttpStatuses.CONFLICT);
                            }
                        }
                    }
                    return h.response().code(HttpStatuses.OK);

                } catch (exception) {
                    // TODO LOG
                    return h.response().code(HttpStatuses.INTERNAL_SERVER_ERROR);
                }
            }
        });

        that.server.route({
            method: 'POST'
            , path: '/app/login'
            , handler: function(req : any, h : any) {
                return new Promise<Response>(async function(resolve, reject) {
                    try {
                        const {username, password} = req.payload;
                        const user: Dto.DtoUser = await that.userAdapter.RetrieveUserByUsernameOrEmail(username);
                        if (user) {
                            if (user.role !== UserRole.Superuser) {
                                if (await Bcrypt.compare(password, user.password)) {
                                    const jwtObject = {
                                        idAuthority: <string>user.idAuthority,
                                        idByAuthority: <string>user.idByAuthority
                                    };
                                    const token = Jwt.sign(jwtObject, JWT_SECRET, {expiresIn: "365d"});

                                    // req.cookieAuth.set({id: user.idByAuthority});
                                    resolve(h.response({token: token}).code(HttpStatuses.OK));
                                } else {
                                    resolve(h.response().code(HttpStatuses.UNAUTHORIZED));
                                }
                            }
                            else {
                                resolve(h.response().code(HttpStatuses.FORBIDDEN));
                            }
                        } else {
                            resolve(h.response().code(HttpStatuses.NOT_FOUND));
                        }
                    } catch (validateException) {
                        console.error(validateException);
                        resolve(h.response().code(HttpStatuses.INTERNAL_SERVER_ERROR));
                    }
                });
            }
            , options: {
                auth: {
                    mode: 'try'
                }
            }
        });

        that.server.route({
            method: 'POST'
            , path: '/dashboard/login'
            , handler: function(req : any, h : any) {
                return new Promise<Response>(async function(resolve, reject) {
                    try {
                        const {username, password} = req.payload;
                        const user: Dto.DtoUser = await that.userAdapter.RetrieveUserByUsernameOrEmail(username);
                        if (user) {
                            if (user.role === UserRole.Superuser) {
                                if (await Bcrypt.compare(password, user.password)) {
                                    const jwtObject = {
                                        idAuthority: <string>user.idAuthority,
                                        idByAuthority: <string>user.idByAuthority
                                    };
                                    const token = Jwt.sign(jwtObject, JWT_SECRET, {expiresIn: "365d"});

                                    // req.cookieAuth.set({id: user.idByAuthority});
                                    resolve(h.response({token: token}).code(HttpStatuses.OK));
                                } else {
                                    resolve(h.response().code(HttpStatuses.UNAUTHORIZED));
                                }
                            }
                            else {
                                resolve(h.response().code(HttpStatuses.FORBIDDEN));
                            }
                        } else {
                            resolve(h.response().code(HttpStatuses.NOT_FOUND));
                        }
                    } catch (validateException) {
                        console.error(validateException);
                        resolve(h.response().code(HttpStatuses.INTERNAL_SERVER_ERROR));
                    }
                });
            }
            , options: {
                auth: {
                    mode: 'try'
                }
            }
        });

        that.server.route({
            method: 'GET'
            , path: '/auth-user'
            , options: {
                auth: {
                    strategy: 'bearer'
                }
            }
            , handler: function(req : any, h : any) {
                if (req.auth.isAuthenticated && req.auth.credentials && req.auth.credentials.user) {

                    const authUser: DtoUser = req.auth.credentials.user;
                    return h.response(authUser).code(HttpStatuses.OK);
                }
                else {
                    return h.response().code(HttpStatuses.UNAUTHORIZED);
                }
            }
        });

        that.server.route({
            method: 'GET'
            , path: '/users'
            , options: {
                auth: {
                    strategy: 'bearer'
                    , scope: ['superuser']
                }
            }
            , handler: function(req : any, h : any) {
                const filterByParameters: Filter.UserFilter = new Filter.UserFilter();
                filterByParameters.isHidden = false;
                return that.userAdapter.RetrieveUsers(filterByParameters, h);
            }
        });

        that.server.route({
            method: 'GET'
            , path: '/users/{idAuthority}*{idByAuthority}/is-app-logged'
            , handler: function(req : any, h : any) {
                // ONLY VIEWER

                let isValidAppLogin = false;
                if (req.auth.isAuthenticated && req.auth.credentials
                    && req.auth.credentials.scope && req.auth.credentials.scope === UserRole.Viewer.toLowerCase()
                    && req.auth.credentials.user) {

                    const authUser: DtoUser = req.auth.credentials.user;
                    isValidAppLogin = authUser.idAuthority === req.params.idAuthority && authUser.idByAuthority === req.params.idByAuthority;
                }
                return h.response(isValidAppLogin).code(HttpStatuses.OK);
            }
            , options: {
                auth: {
                    strategy: 'bearer'
                    , scope: ['viewer']
                }
            }
        });

        that.server.route({
            method: 'GET'
            , path: '/users/{idAuthority}*{idByAuthority}'
            , options: {
                auth: {
                    strategy: 'bearer'
                    , scope: ['superuser']
                }
            }
            , handler: function(req : any, h : any) {
                const filterByParameters: Filter.UserFilter = new Filter.UserFilter();
                filterByParameters.idAuthority = req.params.idAuthority;
                filterByParameters.idByAuthority = req.params.idByAuthority;
                return that.userAdapter.RetrieveUser(filterByParameters, h);
            }
        });

        that.server.route({
            method: 'POST'
            , path: '/users'
            , options: {
                auth: {
                    strategy: 'bearer'
                    , scope: ['superuser']
                }
            }
            , handler: function(req : any, h : any) {
                const dtoOverridesByParameters: Dto.DtoUser = new Dto.DtoUser();
                return that.userAdapter.StoreUser(req.payload, dtoOverridesByParameters, h);
            }
        });

        that.server.route({
            method: 'DELETE'
            , path: '/users/{idAuthority}*{idByAuthority}'
            , options: {
                auth: {
                    strategy: 'bearer'
                    , scope: ['superuser']
                }
            }
            , handler: function(req : any, h : any) {
                const filterByParameters: Filter.UserFilter = new Filter.UserFilter();
                filterByParameters.idAuthority = req.params.idAuthority;
                filterByParameters.idByAuthority = req.params.idByAuthority;
                return that.userAdapter.DeleteUser(filterByParameters, h);
            }
        });

        that.server.route({
            method: 'PATCH'
            , path: '/users/{idAuthority}*{idByAuthority}'
            , options: {
                auth: {
                    strategy: 'bearer'
                    , scope: ['superuser']
                }
            }
            , handler: function(req : any, h : any) {
                const filterByParameters: Filter.UserFilter = new Filter.UserFilter();
                filterByParameters.idAuthority = req.params.idAuthority;
                filterByParameters.idByAuthority = req.params.idByAuthority;
                return that.userAdapter.UpdateUser(filterByParameters, req.payload, h);
            }
        });
    }

    private ConfigureGeoPositionPaths() {
        const that : ApiOperator = this;

        that.server.route({
            method: 'GET'
            , path: '/geopositions'
            , handler: function(req : any, h : any) {
                const appointmentId = req.query.appointmentId || null;
                const address = req.query.address || null;
                const filterByParameters : Dto.DtoGeoPosition = new Dto.DtoGeoPosition(undefined, address, appointmentId, undefined, undefined);
                return that.geoPositionAdapter.RetrievePosition(filterByParameters, h);
            }
            , options: {
                auth: {
                    strategy: 'bearer'
                }
            }
        });

        that.server.route({
            method: 'POST'
            , path: '/geopositions'
            , options: {
                auth: {
                    strategy: 'bearer'
                }
            }
            , handler: function(req : any, h : any) {
                return that.geoPositionAdapter.StorePosition(req.payload, h);
            }
        });
    }

}

process.on('unhandledRejection', (err) => {
    // TODO LOG
    console.error("unhandledRejection");
    console.error(err);
    process.exit(1);
});