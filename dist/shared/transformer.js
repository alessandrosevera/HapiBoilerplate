"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoPositionTransformer = exports.UserTransformer = void 0;
const Dto = require("./dto");
const Storable = require("./storable");
class TransformerHelper {
    static ArrayOfStorableToArrayOfDto(arrayOfStorable, xfm) {
        const dtoArray = [];
        for (let idx = 0; idx < arrayOfStorable.length; idx++) {
            const storable = arrayOfStorable[idx];
            const dto = xfm.StorableToDto(storable);
            if (!dto.isNull) {
                dtoArray.push(dto);
            }
        }
        return dtoArray;
    }
}
class UserTransformer {
    DtoToStorable(dtoUser) {
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
    DtoToUpdateMask(dtoUser) {
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
    StorableToDto(sUser) {
        const dtoUser = new Dto.DtoUser();
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
    ArrayOfStorableToDtoCollection(sUsers) {
        const arrayOfUsers = TransformerHelper.ArrayOfStorableToArrayOfDto(sUsers, this);
        const dtoUserCollection = new Dto.DtoUserCollection();
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
exports.UserTransformer = UserTransformer;
class GeoPositionTransformer {
    DtoToStorable(dtoGeoPosition) {
        const storable = new Storable.GeoPosition();
        storable.id = dtoGeoPosition.id;
        storable.appointmentId = dtoGeoPosition.appointmentId;
        storable.address = dtoGeoPosition.address;
        storable.latitude = dtoGeoPosition.latitude;
        storable.longitude = dtoGeoPosition.longitude;
        return storable;
    }
    DtoToUpdateMask(dtoGeoPosition) {
        const storable = new Storable.GeoPosition();
        storable.id = undefined;
        storable.appointmentId = dtoGeoPosition.appointmentId;
        storable.address = dtoGeoPosition.address;
        storable.latitude = dtoGeoPosition.latitude;
        storable.longitude = dtoGeoPosition.longitude;
        return storable;
    }
    StorableToDto(sGeoPosition) {
        return new Dto.DtoGeoPosition(sGeoPosition.id, sGeoPosition.address, sGeoPosition.appointmentId, sGeoPosition.latitude, sGeoPosition.longitude);
    }
    ArrayOfStorableToDtoCollection(sPositions) {
        const arrayOfPositions = TransformerHelper.ArrayOfStorableToArrayOfDto(sPositions, this);
        const dtoGeoPositionCollection = new Dto.DtoGeoPositionCollection();
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
exports.GeoPositionTransformer = GeoPositionTransformer;
