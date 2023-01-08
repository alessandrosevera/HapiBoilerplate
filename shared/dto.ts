import Core = require("./core");
import {UserRole} from "./enum";

export class Transferable implements Core.ITransferable {
    constructor(runtimeType : string){
        this.runtimeType = runtimeType;
        this.isNull = false;
    }

    public runtimeType : string;
    public isNull : boolean;
}

export class UserResource extends Transferable {
    constructor(runtimeType: string){
        super(runtimeType);
    }

    public idAuthority : string | undefined;
    public idByAuthority : string | undefined;
}

export class DtoUser extends UserResource {
    public givenName : string | null | undefined;
    public familyName : string | null | undefined;

    public username: string | undefined;
    public email: string | undefined;
    public password: string | undefined;

    public assignedCampaignCommaIds : string | null | undefined;
    public assignedActivityCommaIds : string | null | undefined;
    public assignedVendorCommaIds : string | null | undefined;

    public assignedCampaignCommaNames : string | null | undefined;
    public assignedActivityCommaNames : string | null | undefined;
    public assignedVendorCommaNames : string | null | undefined;

    public assignedAppointmentsCommaIds : string | null | undefined;

    public role : UserRole | undefined;

    constructor(){
        super("DtoUser");
    }
}

export class DtoUserCollection extends Transferable implements Core.ITransferableCollection<DtoUser> {
    private users: DtoUser[] = [];

    constructor(){
        super("DtoUserCollection");
    }

    public setCollection(collection : DtoUser[]){
        this.users = collection;
    }

    public getCollection() : DtoUser[] {
        return this.users;
    }
}

export class DtoGeoPosition extends Transferable {
    public id: number | undefined;
    public address: string | null | undefined;
    public appointmentId: number | null | undefined;
    public latitude: number | undefined;
    public longitude: number | undefined;

    constructor(id: number | undefined, address: string | null | undefined,
                appointmentId: number | null | undefined,
                latitude: number | undefined, longitude: number | undefined) {

        super("DtoGeoPosition");

        this.id = id;
        this.address = address;
        this.appointmentId = appointmentId;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

export class DtoGeoPositionCollection extends Transferable implements Core.ITransferableCollection<DtoGeoPosition> {
    private positions: DtoGeoPosition[] = [];

    constructor(){
        super("DtoGeoPositionCollection");
    }

    public setCollection(collection : DtoGeoPosition[]){
        this.positions = collection;
    }

    public getCollection() : DtoGeoPosition[] {
        return this.positions;
    }
}