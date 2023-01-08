"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DtoGeoPositionCollection = exports.DtoGeoPosition = exports.DtoUserCollection = exports.DtoUser = exports.UserResource = exports.Transferable = void 0;
class Transferable {
    constructor(runtimeType) {
        this.runtimeType = runtimeType;
        this.isNull = false;
    }
}
exports.Transferable = Transferable;
class UserResource extends Transferable {
    constructor(runtimeType) {
        super(runtimeType);
    }
}
exports.UserResource = UserResource;
class DtoUser extends UserResource {
    constructor() {
        super("DtoUser");
    }
}
exports.DtoUser = DtoUser;
class DtoUserCollection extends Transferable {
    constructor() {
        super("DtoUserCollection");
        this.users = [];
    }
    setCollection(collection) {
        this.users = collection;
    }
    getCollection() {
        return this.users;
    }
}
exports.DtoUserCollection = DtoUserCollection;
class DtoGeoPosition extends Transferable {
    constructor(id, address, appointmentId, latitude, longitude) {
        super("DtoGeoPosition");
        this.id = id;
        this.address = address;
        this.appointmentId = appointmentId;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
exports.DtoGeoPosition = DtoGeoPosition;
class DtoGeoPositionCollection extends Transferable {
    constructor() {
        super("DtoGeoPositionCollection");
        this.positions = [];
    }
    setCollection(collection) {
        this.positions = collection;
    }
    getCollection() {
        return this.positions;
    }
}
exports.DtoGeoPositionCollection = DtoGeoPositionCollection;
