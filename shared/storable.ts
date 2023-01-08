import Core = require("./core");
import {UserRole} from "./enum";

export class User implements Core.IStorable {
    public idAuthority : string | undefined;
    public idByAuthority : string | undefined;

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
}

export class RevokedUserToken implements Core.IStorable {
    public idAuthority : string | undefined;
    public idByAuthority : string | undefined;

    public token: string | undefined;
}

export class GeoPosition implements Core.IStorable {
    public id: number | undefined;
    public address: string | null | undefined;
    public appointmentId: number | null | undefined;
    public latitude: number | undefined;
    public longitude: number | undefined;
}