import Core = require("./core");
import Dto = require("./dto");
import Storable = require("./storable");

class TransformerHelper {
    public static ArrayOfStorableToArrayOfDto<TD extends Core.ITransferable, TS extends Core.IStorable>(arrayOfStorable : TS[], xfm : Core.ITransformer<TD, TS>) : TD[] {
        const dtoArray: TD[] = [];
        for (let idx : number = 0; idx < arrayOfStorable.length; idx++){
            const storable: TS = arrayOfStorable[idx];
            const dto: TD = xfm.StorableToDto(storable);
            if (!dto.isNull) {
                dtoArray.push(dto);
            }
        }
        return dtoArray;
    }
}

export class UserTransformer implements Core.ITransformer<Dto.DtoUser, Storable.User> {

    public DtoToStorable(dtoUser : Dto.DtoUser) : Storable.User {
        const user = new Storable.User();

        user.idAuthority = dtoUser.idAuthority;
        user.idByAuthority = dtoUser.idByAuthority;
        user.givenName = dtoUser.givenName;
        user.familyName = dtoUser.familyName;
        user.username = dtoUser.username;
        user.email = dtoUser.email;
        user.password = dtoUser.password;
        user.assignedCampaignCommaIds = dtoUser.assignedCampaignCommaIds;
        user.assignedActivityCommaIds = dtoUser.assignedActivityCommaIds;
        user.assignedVendorCommaIds = dtoUser.assignedVendorCommaIds;
        user.assignedAppointmentsCommaIds = dtoUser.assignedAppointmentsCommaIds;
        user.assignedCampaignCommaNames = dtoUser.assignedCampaignCommaNames;
        user.assignedActivityCommaNames = dtoUser.assignedActivityCommaNames;
        user.assignedVendorCommaNames = dtoUser.assignedVendorCommaNames;
        user.role = dtoUser.role;

        return user;
    }

    public DtoToUpdateMask(dtoUser : Dto.DtoUser) : Storable.User {
        const user = new Storable.User();

        user.idAuthority = undefined;
        user.idByAuthority = undefined;
        user.givenName = dtoUser.givenName;
        user.familyName = dtoUser.familyName;
        user.username = dtoUser.username;
        user.email = dtoUser.email;
        user.password = dtoUser.password;
        user.assignedCampaignCommaIds = dtoUser.assignedCampaignCommaIds;
        user.assignedActivityCommaIds = dtoUser.assignedActivityCommaIds;
        user.assignedVendorCommaIds = dtoUser.assignedVendorCommaIds;
        user.assignedAppointmentsCommaIds = dtoUser.assignedAppointmentsCommaIds;
        user.assignedCampaignCommaNames = dtoUser.assignedCampaignCommaNames;
        user.assignedActivityCommaNames = dtoUser.assignedActivityCommaNames;
        user.assignedVendorCommaNames = dtoUser.assignedVendorCommaNames;
        user.role = dtoUser.role;

        return user;
    }

    public StorableToDto(sUser : Storable.User) : Dto.DtoUser {

        const dtoUser : Dto.DtoUser = new Dto.DtoUser();
        dtoUser.isNull = sUser === null;
        if (sUser !== null) {
            if (sUser.idAuthority !== undefined) {
                dtoUser.idAuthority = sUser.idAuthority;
            }
            if (sUser.idByAuthority !== undefined) {
                dtoUser.idByAuthority = sUser.idByAuthority;
            }
            if (sUser.username !== undefined) {
                dtoUser.username = sUser.username;
            }
            if (sUser.password !== undefined) {
                dtoUser.password = sUser.password;
            }
            if (sUser.email !== undefined) {
                dtoUser.email = sUser.email;
            }

            dtoUser.givenName = sUser.givenName !== undefined ? sUser.givenName : null;
            dtoUser.familyName = sUser.familyName !== undefined ? sUser.familyName : null;

            dtoUser.assignedCampaignCommaIds = sUser.assignedCampaignCommaIds !== undefined ? sUser.assignedCampaignCommaIds : null;
            dtoUser.assignedActivityCommaIds = sUser.assignedActivityCommaIds !== undefined ? sUser.assignedActivityCommaIds : null;
            dtoUser.assignedVendorCommaIds = sUser.assignedVendorCommaIds !== undefined ? sUser.assignedVendorCommaIds : null;
            dtoUser.assignedAppointmentsCommaIds = sUser.assignedAppointmentsCommaIds !== undefined ? sUser.assignedAppointmentsCommaIds : null;

            dtoUser.assignedCampaignCommaNames = sUser.assignedCampaignCommaNames;
            dtoUser.assignedActivityCommaNames = sUser.assignedActivityCommaNames;
            dtoUser.assignedVendorCommaNames = sUser.assignedVendorCommaNames;

            dtoUser.role = sUser.role;
        }

        return dtoUser;
    }

    public ArrayOfStorableToDtoCollection(sUsers : Storable.User[]) : Dto.DtoUserCollection {
        const arrayOfUsers: Dto.DtoUser[] = TransformerHelper.ArrayOfStorableToArrayOfDto(sUsers, this);

        const dtoUserCollection: Dto.DtoUserCollection = new Dto.DtoUserCollection();
        if (arrayOfUsers.length > 0) {
            dtoUserCollection.isNull = false;
            dtoUserCollection.setCollection(arrayOfUsers);
        }
        else {
            dtoUserCollection.isNull = true;
        }

        return dtoUserCollection;
    }

}

export class GeoPositionTransformer implements Core.ITransformer<Dto.DtoGeoPosition, Storable.GeoPosition> {
    public DtoToStorable(dtoGeoPosition : Dto.DtoGeoPosition) : Storable.GeoPosition {
        const storable = new Storable.GeoPosition();
        storable.id = dtoGeoPosition.id;
        storable.appointmentId = dtoGeoPosition.appointmentId;
        storable.address = dtoGeoPosition.address;
        storable.latitude = dtoGeoPosition.latitude;
        storable.longitude = dtoGeoPosition.longitude;
        return storable;
    }

    public DtoToUpdateMask(dtoGeoPosition : Dto.DtoGeoPosition) : Storable.GeoPosition {
        const storable = new Storable.GeoPosition();
        storable.id = undefined;
        storable.appointmentId = dtoGeoPosition.appointmentId;
        storable.address = dtoGeoPosition.address;
        storable.latitude = dtoGeoPosition.latitude;
        storable.longitude = dtoGeoPosition.longitude;
        return storable;
    }

    public StorableToDto(sGeoPosition : Storable.GeoPosition) : Dto.DtoGeoPosition {
        return new Dto.DtoGeoPosition(sGeoPosition.id, sGeoPosition.address, sGeoPosition.appointmentId,
            sGeoPosition.latitude, sGeoPosition.longitude);
    }

    public ArrayOfStorableToDtoCollection(sPositions : Storable.GeoPosition[]) : Dto.DtoGeoPositionCollection {
        const arrayOfPositions: Dto.DtoGeoPosition[] = TransformerHelper.ArrayOfStorableToArrayOfDto(sPositions, this);

        const dtoGeoPositionCollection: Dto.DtoGeoPositionCollection = new Dto.DtoGeoPositionCollection();
        if (arrayOfPositions.length > 0) {
            dtoGeoPositionCollection.isNull = false;
            dtoGeoPositionCollection.setCollection(arrayOfPositions);
        }
        else {
            dtoGeoPositionCollection.isNull = true;
        }

        return dtoGeoPositionCollection;
    }
}
