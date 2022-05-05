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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObsClient = exports.getInputs = void 0;
const core = __importStar(require("@actions/core"));
function getInputs() {
    return {
        access_key: core.getInput('access_key', { required: true }),
        secret_key: core.getInput('secret_key', { required: true }),
        bucket_name: core.getInput('bucket_name', { required: true }),
        operation_type: core.getInput('operation_type', { required: true }),
        local_file_path: core.getMultilineInput('local_file_path', {
            required: true,
        }),
        obs_file_path: core.getInput('obs_file_path', { required: true }),
        region: core.getInput('region', { required: true }),
        include_self_folder: core.getInput('include_self_folder', {
            required: false,
        }),
        exclude: core.getMultilineInput('exclude', { required: false }),
    };
}
exports.getInputs = getInputs;
/**
 * 根据ak/sk，初始化Obs客户端
 * @param ak AK
 * @param sk SK
 * @param server 连接OBS的服务地址
 * @returns obsClient为引入的obs库的类型，本身并未导出其类型，故使用any
 */
function getObsClient(ak, sk, server) {
    const ObsClient = require('esdk-obs-nodejs'); // eslint-disable-line @typescript-eslint/no-var-requires
    try {
        const obs = new ObsClient({
            access_key_id: ak,
            secret_access_key: sk,
            server: server,
        });
        return obs;
    }
    catch (error) {
        core.setFailed('init obs client fail.');
    }
}
exports.getObsClient = getObsClient;
