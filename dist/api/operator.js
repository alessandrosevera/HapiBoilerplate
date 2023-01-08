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
exports.ApiOperator = void 0;
const Sl = require("../shared/servicelocator");
const Adapter = require("../shared/adapter");
const Dto = require("../shared/dto");
const Filter = require("../shared/filter");
const const_1 = require("../shared/const");
const enum_1 = require("../shared/enum");
const Hapi = require('@hapi/hapi');
const Bcrypt = require("bcrypt");
const Jwt = require('jsonwebtoken');
const JWT_SECRET = "TrtYzcJTCT]jtg-dRG,ND0*6otb318d#+gHn";
class ApiOperator {
    constructor() {
        this.server = new Hapi.Server({
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
        this.userAdapter = new Adapter.UserAdapter();
        this.geoPositionAdapter = new Adapter.GeoPositionAdapter();
        this.revokedTokenAdapter = new Adapter.RevokedUserTokenAdapter();
    }
    Initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ConfigureServer();
            return this.server;
        });
    }
    Start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.server.start();
            console.log("Hapi server started @", this.server.info.uri);
        });
    }
    ConfigureServer() {
        return __awaiter(this, void 0, void 0, function* () {
            const that = this;
            yield that.ConfigureAuthStrategy();
            that.ConfigureUserPaths();
            that.ConfigureGeoPositionPaths();
            return true;
        });
    }
    ConfigureAuthStrategy() {
        return __awaiter(this, void 0, void 0, function* () {
            const that = this;
            yield that.server.register(require('@hapi/basic'));
            yield that.server.register(require('@hapi/cookie'));
            yield that.server.register(require('hapi-auth-bearer-token'));
            that.server.auth.strategy('session', 'cookie', {
                cookie: {
                    name: 'itacall-cookie-111',
                    password: '!wsYhFA*C2U6nz=Bu^%A@^F#SF3&kSR6',
                    isSecure: false,
                    clearInvalid: true
                },
                redirectTo: false,
                validateFunc: (request, session) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    try {
                        const user = yield that.userAdapter.RetrieveUserByAuthority("itacall", session.id);
                        if (!user) {
                            return { credentials: null, valid: false };
                        }
                        const credentials = {
                            id: user.idByAuthority,
                            name: user.username || user.email,
                            scope: (_a = user.role) === null || _a === void 0 ? void 0 : _a.toLowerCase(),
                            user: user
                        };
                        return { credentials: credentials, valid: true };
                    }
                    catch (validateException) {
                        return { credentials: null, valid: false };
                    }
                })
            });
            that.server.auth.strategy('bearer', 'bearer-access-token', {
                allowQueryToken: true,
                validate: (request, token, h) => __awaiter(this, void 0, void 0, function* () {
                    var _b, _c;
                    let isValid = false;
                    let credentials = null;
                    let artifacts = null;
                    try {
                        const decoded = Jwt.verify(token, JWT_SECRET);
                        if (decoded) {
                            const user = yield that.userAdapter.RetrieveUserByAuthority(decoded.idAuthority, decoded.idByAuthority);
                            if (user) {
                                let isRevoked = yield that.revokedTokenAdapter.IsRevoked(user.idAuthority, user.idByAuthority, token);
                                if (!isRevoked) {
                                    credentials = {
                                        id: user.idByAuthority,
                                        name: user.username || user.email,
                                        token: token,
                                        scope: (_b = user.role) === null || _b === void 0 ? void 0 : _b.toLowerCase(),
                                        user: user
                                    };
                                    artifacts = {
                                        id: user.idByAuthority,
                                        name: user.username || user.email,
                                        token: token,
                                        scope: (_c = user.role) === null || _c === void 0 ? void 0 : _c.toLowerCase(),
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
                })
            });
            that.server.auth.default('bearer');
        });
    }
    ConfigureUserPaths() {
        const that = this;
        that.server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: false
            },
            handler: (request, h) => {
                // request.auth.isAuthenticated
                // request.auth.credentials
                return 'I\'m awake!';
            }
        });
        that.server.route({
            method: 'POST',
            path: '/logout',
            options: {
                auth: {
                    mode: 'try'
                }
            },
            handler: (request, h) => __awaiter(this, void 0, void 0, function* () {
                const that = this;
                try {
                    if (request.auth.isAuthenticated && request.auth.credentials && request.auth.credentials.user) {
                        const authUser = request.auth.credentials.user;
                        let isRevoked = yield that.revokedTokenAdapter.IsRevoked(authUser.idAuthority, authUser.idByAuthority, request.auth.credentials.token);
                        if (!isRevoked) {
                            isRevoked = yield that.revokedTokenAdapter.Revoke(authUser.idAuthority, authUser.idByAuthority, request.auth.credentials.token);
                            if (isRevoked) {
                                return h.response().code(const_1.HttpStatuses.OK);
                            }
                            else {
                                return h.response().code(const_1.HttpStatuses.CONFLICT);
                            }
                        }
                    }
                    return h.response().code(const_1.HttpStatuses.OK);
                }
                catch (exception) {
                    // TODO LOG
                    return h.response().code(const_1.HttpStatuses.INTERNAL_SERVER_ERROR);
                }
            })
        });
        that.server.route({
            method: 'POST',
            path: '/app/login',
            handler: function (req, h) {
                return new Promise(function (resolve, reject) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            const { username, password } = req.payload;
                            const user = yield that.userAdapter.RetrieveUserByUsernameOrEmail(username);
                            if (user) {
                                if (user.role !== enum_1.UserRole.Superuser) {
                                    if (yield Bcrypt.compare(password, user.password)) {
                                        const jwtObject = {
                                            idAuthority: user.idAuthority,
                                            idByAuthority: user.idByAuthority
                                        };
                                        const token = Jwt.sign(jwtObject, JWT_SECRET, { expiresIn: "365d" });
                                        // req.cookieAuth.set({id: user.idByAuthority});
                                        resolve(h.response({ token: token }).code(const_1.HttpStatuses.OK));
                                    }
                                    else {
                                        resolve(h.response().code(const_1.HttpStatuses.UNAUTHORIZED));
                                    }
                                }
                                else {
                                    resolve(h.response().code(const_1.HttpStatuses.FORBIDDEN));
                                }
                            }
                            else {
                                resolve(h.response().code(const_1.HttpStatuses.NOT_FOUND));
                            }
                        }
                        catch (validateException) {
                            console.error(validateException);
                            resolve(h.response().code(const_1.HttpStatuses.INTERNAL_SERVER_ERROR));
                        }
                    });
                });
            },
            options: {
                auth: {
                    mode: 'try'
                }
            }
        });
        that.server.route({
            method: 'POST',
            path: '/dashboard/login',
            handler: function (req, h) {
                return new Promise(function (resolve, reject) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            const { username, password } = req.payload;
                            const user = yield that.userAdapter.RetrieveUserByUsernameOrEmail(username);
                            if (user) {
                                if (user.role === enum_1.UserRole.Superuser) {
                                    if (yield Bcrypt.compare(password, user.password)) {
                                        const jwtObject = {
                                            idAuthority: user.idAuthority,
                                            idByAuthority: user.idByAuthority
                                        };
                                        const token = Jwt.sign(jwtObject, JWT_SECRET, { expiresIn: "365d" });
                                        // req.cookieAuth.set({id: user.idByAuthority});
                                        resolve(h.response({ token: token }).code(const_1.HttpStatuses.OK));
                                    }
                                    else {
                                        resolve(h.response().code(const_1.HttpStatuses.UNAUTHORIZED));
                                    }
                                }
                                else {
                                    resolve(h.response().code(const_1.HttpStatuses.FORBIDDEN));
                                }
                            }
                            else {
                                resolve(h.response().code(const_1.HttpStatuses.NOT_FOUND));
                            }
                        }
                        catch (validateException) {
                            console.error(validateException);
                            resolve(h.response().code(const_1.HttpStatuses.INTERNAL_SERVER_ERROR));
                        }
                    });
                });
            },
            options: {
                auth: {
                    mode: 'try'
                }
            }
        });
        that.server.route({
            method: 'GET',
            path: '/auth-user',
            options: {
                auth: {
                    strategy: 'bearer'
                }
            },
            handler: function (req, h) {
                if (req.auth.isAuthenticated && req.auth.credentials && req.auth.credentials.user) {
                    const authUser = req.auth.credentials.user;
                    return h.response(authUser).code(const_1.HttpStatuses.OK);
                }
                else {
                    return h.response().code(const_1.HttpStatuses.UNAUTHORIZED);
                }
            }
        });
        that.server.route({
            method: 'GET',
            path: '/users',
            options: {
                auth: {
                    strategy: 'bearer',
                    scope: ['superuser']
                }
            },
            handler: function (req, h) {
                const filterByParameters = new Filter.UserFilter();
                filterByParameters.isHidden = false;
                return that.userAdapter.RetrieveUsers(filterByParameters, h);
            }
        });
        that.server.route({
            method: 'GET',
            path: '/users/{idAuthority}*{idByAuthority}/is-app-logged',
            handler: function (req, h) {
                // ONLY VIEWER
                let isValidAppLogin = false;
                if (req.auth.isAuthenticated && req.auth.credentials
                    && req.auth.credentials.scope && req.auth.credentials.scope === enum_1.UserRole.Viewer.toLowerCase()
                    && req.auth.credentials.user) {
                    const authUser = req.auth.credentials.user;
                    isValidAppLogin = authUser.idAuthority === req.params.idAuthority && authUser.idByAuthority === req.params.idByAuthority;
                }
                return h.response(isValidAppLogin).code(const_1.HttpStatuses.OK);
            },
            options: {
                auth: {
                    strategy: 'bearer',
                    scope: ['viewer']
                }
            }
        });
        that.server.route({
            method: 'GET',
            path: '/users/{idAuthority}*{idByAuthority}',
            options: {
                auth: {
                    strategy: 'bearer',
                    scope: ['superuser']
                }
            },
            handler: function (req, h) {
                const filterByParameters = new Filter.UserFilter();
                filterByParameters.idAuthority = req.params.idAuthority;
                filterByParameters.idByAuthority = req.params.idByAuthority;
                return that.userAdapter.RetrieveUser(filterByParameters, h);
            }
        });
        that.server.route({
            method: 'POST',
            path: '/users',
            options: {
                auth: {
                    strategy: 'bearer',
                    scope: ['superuser']
                }
            },
            handler: function (req, h) {
                const dtoOverridesByParameters = new Dto.DtoUser();
                return that.userAdapter.StoreUser(req.payload, dtoOverridesByParameters, h);
            }
        });
        that.server.route({
            method: 'DELETE',
            path: '/users/{idAuthority}*{idByAuthority}',
            options: {
                auth: {
                    strategy: 'bearer',
                    scope: ['superuser']
                }
            },
            handler: function (req, h) {
                const filterByParameters = new Filter.UserFilter();
                filterByParameters.idAuthority = req.params.idAuthority;
                filterByParameters.idByAuthority = req.params.idByAuthority;
                return that.userAdapter.DeleteUser(filterByParameters, h);
            }
        });
        that.server.route({
            method: 'PATCH',
            path: '/users/{idAuthority}*{idByAuthority}',
            options: {
                auth: {
                    strategy: 'bearer',
                    scope: ['superuser']
                }
            },
            handler: function (req, h) {
                const filterByParameters = new Filter.UserFilter();
                filterByParameters.idAuthority = req.params.idAuthority;
                filterByParameters.idByAuthority = req.params.idByAuthority;
                return that.userAdapter.UpdateUser(filterByParameters, req.payload, h);
            }
        });
    }
    ConfigureGeoPositionPaths() {
        const that = this;
        that.server.route({
            method: 'GET',
            path: '/geopositions',
            handler: function (req, h) {
                const appointmentId = req.query.appointmentId || null;
                const address = req.query.address || null;
                const filterByParameters = new Dto.DtoGeoPosition(undefined, address, appointmentId, undefined, undefined);
                return that.geoPositionAdapter.RetrievePosition(filterByParameters, h);
            },
            options: {
                auth: {
                    strategy: 'bearer'
                }
            }
        });
        that.server.route({
            method: 'POST',
            path: '/geopositions',
            options: {
                auth: {
                    strategy: 'bearer'
                }
            },
            handler: function (req, h) {
                return that.geoPositionAdapter.StorePosition(req.payload, h);
            }
        });
    }
}
exports.ApiOperator = ApiOperator;
process.on('unhandledRejection', (err) => {
    // TODO LOG
    console.error("unhandledRejection");
    console.error(err);
    process.exit(1);
});
