"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.deleteBucket = exports.abortAllMultipartUpload = exports.deleteAllObjects = exports.clearBuckets = exports.isBucketEmpty = exports.getAllMultipartUploads = exports.listMultipartUploads = exports.getAllVersionObjects = exports.listVersionObjects = exports.getAllObjects = exports.listObjects = exports.getBucketVersioning = exports.createBucket = exports.hasBucket = void 0;
const core = __importStar(require("@actions/core"));
/**
 * ?????????????????????
 * @param obsClient obs???????????????obsClient????????????obs??????????????????????????????????????????????????????any?????????
 * @param bucketName ??????
 * @returns
 */
function hasBucket(obsClient, bucketName) {
    return __awaiter(this, void 0, void 0, function* () {
        const promise = yield obsClient.headBucket({
            Bucket: bucketName,
        });
        return !(promise.CommonMsg.Status === 404);
    });
}
exports.hasBucket = hasBucket;
/**
 * ?????????
 * @param obsClient obs?????????
 * @param bucketName ??????
 * @param region ???????????????
 * @param publicRead ???????????????????????????
 * @param storageClass ????????????
 * @returns
 */
function createBucket(obsClient, bucketName, region, publicRead, storageClass) {
    obsClient
        .createBucket({
        Bucket: bucketName,
        Location: region,
        ACL: publicRead ? obsClient.enums['AclPublicRead'] : obsClient.enums['AclPrivate'],
        StorageClass: storageClass ? obsClient.enums[storageClass] : '',
    })
        .then((result) => {
        if (result.CommonMsg.Status < 300) {
            if (result.InterfaceResult) {
                core.info(`create bucket: ${bucketName} Successfully.`);
                return true;
            }
        }
        else {
            core.setFailed(`create bucket: ${bucketName} failed, ${result.CommonMsg.Message}.`);
            return false;
        }
    })
        .catch((err) => {
        core.setFailed(`create bucket: ${bucketName} failed, ${err}.`);
        return false;
    });
    return false;
}
exports.createBucket = createBucket;
/**
 * ???????????????????????????
 * @param obsClient obs?????????
 * @param bucketName ??????
 * @returns
 */
function getBucketVersioning(obsClient, bucketName) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield obsClient.getBucketVersioning({
            Bucket: bucketName,
        });
        if (result.CommonMsg.Status < 300) {
            return result.InterfaceResult.VersionStatus;
        }
        else {
            core.info(`get bucket versioning failed because ${result.CommonMsg.Message}`);
            return '';
        }
    });
}
exports.getBucketVersioning = getBucketVersioning;
/**
 * ????????????????????????????????????????????????
 * @param obsClient Obs?????????
 * @param bucketName ??????
 * @param obsPath obs????????????????????????
 * @param marker ????????????
 * @returns
 */
function listObjects(obsClient, bucketName, obsPath, marker) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield obsClient.listObjects({
            Bucket: bucketName,
            Prefix: obsPath,
            Marker: marker !== null && marker !== void 0 ? marker : '',
        });
    });
}
exports.listObjects = listObjects;
/**
 * ????????????????????????
 * @param obsClient obs?????????
 * @param bucketName ??????
 * @param nextMarker ????????????
 */
function getAllObjects(obsClient, bucketName, nextMarker) {
    return __awaiter(this, void 0, void 0, function* () {
        const objList = [];
        let isTruncated = true;
        let marker = nextMarker;
        while (isTruncated) {
            const result = yield listObjects(obsClient, bucketName, '', marker);
            result.InterfaceResult.Contents.forEach((elem) => {
                objList.push({ Key: elem['Key'] });
            });
            isTruncated = result.InterfaceResult.IsTruncated === 'true';
            marker = result.InterfaceResult.NextMarker;
        }
        return objList;
    });
}
exports.getAllObjects = getAllObjects;
/**
 * ????????????????????????????????????????????????
 * @param obsClient Obs?????????
 * @param bucketName ??????
 * @param nextKeyMarker ????????????????????????????????????
 * @param nextVersionIdMarker ???????????????????????????????????????, ???nextKeyMarker????????????
 * @returns
 */
function listVersionObjects(obsClient, bucketName, nextKeyMarker, nextVersionIdMarker) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield obsClient.listVersions({
            Bucket: bucketName,
            KeyMarker: nextKeyMarker !== null && nextKeyMarker !== void 0 ? nextKeyMarker : '',
            VersionIdMarker: nextVersionIdMarker !== null && nextVersionIdMarker !== void 0 ? nextVersionIdMarker : '',
        });
    });
}
exports.listVersionObjects = listVersionObjects;
/**
 * ?????????????????????????????????
 * @param obsClient obs?????????
 * @param bucketName ??????
 * @param nextKeyMarker ??????????????????????????????
 * @param nextVersionMaker ???????????????????????????????????????
 */
function getAllVersionObjects(obsClient, bucketName, nextKeyMarker, nextVersionMaker) {
    return __awaiter(this, void 0, void 0, function* () {
        const objList = [];
        let isTruncated = true;
        let keyMarker = nextKeyMarker;
        let versionMaker = nextVersionMaker;
        while (isTruncated) {
            const result = yield listVersionObjects(obsClient, bucketName, keyMarker, versionMaker);
            result.InterfaceResult.Versions.forEach((elem) => {
                objList.push({
                    Key: elem['Key'],
                    VersionId: elem['VersionId'],
                });
            });
            result.InterfaceResult.DeleteMarkers.forEach((elem) => {
                objList.push({
                    Key: elem['Key'],
                    VersionId: elem['VersionId'],
                });
            });
            isTruncated = result.InterfaceResult.IsTruncated === 'true';
            keyMarker = result.InterfaceResult.NextKeyMarker;
            versionMaker = result.InterfaceResult.NextVersionIdMarker;
        }
        return objList;
    });
}
exports.getAllVersionObjects = getAllVersionObjects;
/**
 * ??????????????????????????????
 * @param obsClient obs?????????
 * @param bucketName ??????
 * @param nextKeyMarker ?????????????????????????????????
 * @param nextUploadIdMarker ???????????????????????????uploadid
 * @returns
 */
function listMultipartUploads(obsClient, bucketName, nextKeyMarker, nextUploadIdMarker) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield obsClient.listMultipartUploads({
            Bucket: bucketName,
            KeyMarker: nextKeyMarker !== null && nextKeyMarker !== void 0 ? nextKeyMarker : '',
            UploadIdMarker: nextUploadIdMarker !== null && nextUploadIdMarker !== void 0 ? nextUploadIdMarker : '',
        });
    });
}
exports.listMultipartUploads = listMultipartUploads;
/**
 * ????????????????????????????????????
 * @param obsClient obs?????????
 * @param bucketName ??????
 * @param nextKeyMarker ?????????????????????????????????
 * @param nextUploadIdMarker ?????????????????????uploadid
 * @returns
 */
function getAllMultipartUploads(obsClient, bucketName, nextKeyMarker, nextUploadIdMarker) {
    return __awaiter(this, void 0, void 0, function* () {
        const partList = [];
        let isTruncated = true;
        let keyMarker = nextKeyMarker;
        let uploadIdMarker = nextUploadIdMarker;
        while (isTruncated) {
            const result = yield listMultipartUploads(obsClient, bucketName, keyMarker, uploadIdMarker);
            result.InterfaceResult.Uploads.forEach((elem) => {
                partList.push({
                    Key: elem['Key'],
                    UploadId: elem['UploadId'],
                });
            });
            isTruncated = result.InterfaceResult.IsTruncated === 'true';
            keyMarker = result.InterfaceResult.NextKeyMarker;
            uploadIdMarker = result.InterfaceResult.NextUploadIdMarker;
        }
        return partList;
    });
}
exports.getAllMultipartUploads = getAllMultipartUploads;
/**
 * ??????????????????????????????/???????????????/??????
 * @param obsClient obs?????????
 * @param bucketName ??????
 * @returns
 */
function isBucketEmpty(obsClient, bucketName) {
    return __awaiter(this, void 0, void 0, function* () {
        const bucketVersioning = yield getBucketVersioning(obsClient, bucketName);
        if (bucketVersioning === 'Enabled') {
            return ((yield getAllVersionObjects(obsClient, bucketName)).length +
                (yield getAllMultipartUploads(obsClient, bucketName)).length ===
                0);
        }
        else if (bucketVersioning === 'Suspended' || bucketVersioning === undefined) {
            return ((yield getAllObjects(obsClient, bucketName)).length +
                (yield getAllMultipartUploads(obsClient, bucketName)).length ===
                0);
        }
        return false;
    });
}
exports.isBucketEmpty = isBucketEmpty;
/**
 * ?????????????????????????????????
 * @param obsClient obs?????????
 * @param bucketName ??????
 * @returns
 */
function clearBuckets(obsClient, bucketName) {
    return __awaiter(this, void 0, void 0, function* () {
        core.info('start clear bucket');
        const clearObject = yield deleteAllObjects(obsClient, bucketName);
        const clearPart = yield abortAllMultipartUpload(obsClient, bucketName);
        if (clearObject && clearPart) {
            core.info(`bucket: ${bucketName} cleared successfully.`);
            return true;
        }
        return false;
    });
}
exports.clearBuckets = clearBuckets;
/**
 * ????????????????????????/???????????????
 * @param obsClient obs?????????
 * @param bucketName ??????
 * @returns
 */
function deleteAllObjects(obsClient, bucketName) {
    return __awaiter(this, void 0, void 0, function* () {
        const bucketVersioning = yield getBucketVersioning(obsClient, bucketName);
        let objectList = [];
        if (bucketVersioning === 'Enabled') {
            objectList = yield getAllVersionObjects(obsClient, bucketName);
        }
        else if (bucketVersioning === 'Suspended' || bucketVersioning === undefined) {
            objectList = yield getAllObjects(obsClient, bucketName);
        }
        else {
            return false;
        }
        if (objectList.length === 0) {
            return true;
        }
        core.info('start clear objects.');
        // ?????????????????????????????????1000???
        while (objectList.length > 1000) {
            yield deleteObjects(obsClient, bucketName, objectList.splice(0, 1000));
        }
        yield deleteObjects(obsClient, bucketName, objectList);
        objectList = yield getAllObjects(obsClient, bucketName);
        if (objectList.length > 0) {
            core.info('delete all objects failed, please try again or delete objects by yourself.');
            return false;
        }
        else {
            core.info('finish clear objects.');
            return true;
        }
    });
}
exports.deleteAllObjects = deleteAllObjects;
/**
 * ??????????????????/???????????????
 * @param obsClient obs?????????
 * @param bucketName ??????
 * @param delList ?????????????????????
 */
function deleteObjects(obsClient, bucketName, delList) {
    return __awaiter(this, void 0, void 0, function* () {
        yield obsClient
            .deleteObjects({
            Bucket: bucketName,
            Quiet: false,
            Objects: delList,
        })
            .then((result) => {
            if (result.CommonMsg.Status === 400) {
                core.info(`Delete failed because ${result.CommonMsg.Message}`);
            }
            else if (result.InterfaceResult.Errors.length > 0) {
                core.info(`Failed to delete objects: ${result.InterfaceResult.Errors}.`);
            }
            else {
                core.info(`Successfully delete ${delList.length} objects.`);
            }
        });
    });
}
/**
 * ????????????????????????????????????
 * @param obsClient obs?????????
 * @param bucketName ??????
 * @returns
 */
function abortAllMultipartUpload(obsClient, bucketName) {
    return __awaiter(this, void 0, void 0, function* () {
        const partList = yield getAllMultipartUploads(obsClient, bucketName);
        if (partList.length === 0) {
            return true;
        }
        core.info('start clear part.');
        for (const part of partList) {
            yield obsClient.abortMultipartUpload({
                Bucket: bucketName,
                Key: part.Key,
                UploadId: part.UploadId,
            });
        }
        core.info('finish clear part.');
        return true;
    });
}
exports.abortAllMultipartUpload = abortAllMultipartUpload;
/**
 * ?????????
 * @param obsClient obs?????????
 * @param bucketName ??????
 * @param isBucketEmpty ???????????????
 * @returns
 */
function deleteBucket(obsClient, bucketName, isBucketEmpty) {
    return __awaiter(this, void 0, void 0, function* () {
        let isEmpty = isBucketEmpty;
        if (!isEmpty) {
            isEmpty = yield clearBuckets(obsClient, bucketName);
        }
        if (isEmpty) {
            obsClient
                .deleteBucket({
                Bucket: bucketName,
            })
                .then((result) => {
                if (result.CommonMsg.Status < 300) {
                    core.info(`delete bucket: ${bucketName} successfully.`);
                    return true;
                }
                else {
                    core.setFailed(`delete bucket: ${bucketName} failed, ${result.CommonMsg.Message}.`);
                }
            })
                .catch((err) => {
                core.setFailed(`delete bucket: ${bucketName} failed, ${err}.`);
            });
        }
        return false;
    });
}
exports.deleteBucket = deleteBucket;
