import { expect, test } from '@jest/globals';
import * as fs from 'fs';
import * as download from '../src/download';
import { ObjectInputs } from '../src/types';

const ObsClient = require('esdk-obs-nodejs');
function getObsClient(inputs: ObjectInputs) {
    return new ObsClient({
        access_key_id: inputs.accessKey,       
        secret_access_key: inputs.secretKey,       
        server : `https://obs.${inputs.region}.myhuaweicloud.com`,
    });
}

// --------------------file---------------------
test('download a exist file to local and rename it', async () => {
    const inputs = {
        accessKey: '******',
        secretKey: '******',
        bucketName: '******',
        operationType: 'download',
        obsFilePath: 'uploadDir/file2.txt',
        localFilePath: ['resource/downloadDir/localfile1.txt'],
        region: 'cn-north-6'
    }
    const obs = getObsClient(inputs);
    await download.downloadFileOrFolder(obs, inputs);
    const isExist = fs.existsSync('resource/downloadDir/localfile1.txt');
    expect(isExist).toBeTruthy();
});

test('download a exist file but exclude it', async () => {
    const inputs = {
        accessKey: '******',
        secretKey: '******',
        bucketName: '******',
        operationType: 'download',
        obsFilePath: 'uploadDir/file1.txt',
        localFilePath: ['resource/downloadDir/localfile2.txt'],
        region: 'cn-north-6',
        exclude: ['uploadDir']
    }
    const obs = getObsClient(inputs);
    await download.downloadFileOrFolder(obs, inputs).then(() => {
        const isExist = fs.existsSync('resource/downloadDir/localfile2.txt');
        expect(isExist).toBeFalsy();
    });
});

test('download a nonexist file to local', async () => {
    const inputs = {
        accessKey: '******',
        secretKey: '******',
        bucketName: '******',
        operationType: 'download',
        obsFilePath: 'uploadDir/fileaaabbb.txt',
        localFilePath: ['resource/downloadDir/localfile3.txt'],
        region: 'cn-north-6'
    }
    const obs = getObsClient(inputs);
    await download.downloadFileOrFolder(obs, inputs).then(() => {
        const isExist = fs.existsSync('resource/downloadDir/localfile3.txt');
        expect(isExist).toBeFalsy();
    });
});

test('download a file to local that local has same name folder', async () => {
    const inputs = {
        accessKey: '******',
        secretKey: '******',
        bucketName: '******',
        operationType: 'download',
        obsFilePath: 'uploadDir/test/yasuobao.txt',
        localFilePath: ['resource/downloadDir/d5'],
        region: 'cn-north-6'
    }
    const obs = getObsClient(inputs);
    await download.downloadFileOrFolder(obs, inputs).then(() => {
        const isExist = fs.existsSync('resource/downloadDir/d5/yasuobao.txt/yasuobao.txt');
        expect(isExist).toBeTruthy();
    });
});

// ------------------------folder-------------------------

test('download a exist folder to local and exclude folder "test-mult" and file "yasuobao.txt"', async () => {
    const inputs = {
        accessKey: '******',
        secretKey: '******',
        bucketName: '******',
        operationType: 'download',
        obsFilePath: 'uploadDir',
        localFilePath: ['resource/downloadDir/d1'],
        region: 'cn-north-6',
        exclude: ['uploadDir/test-mult', "uploadDir/test/yasuobao.txt"]
    }
    const obs = getObsClient(inputs);
    await download.downloadFileOrFolder(obs, inputs).then(() => {
        const isExist1 = fs.existsSync('resource/downloadDir/d1/test/test2/file2-1.txt');
        const isExist2 = fs.existsSync('resource/downloadDir/d1/test/yasuobao.txt');
        expect(isExist1).toBeTruthy();
        expect(isExist2).toBeFalsy();
    });
});

test('download a exist folder to local and include folder itselt', async () => {
    const inputs = {
        accessKey: '******',
        secretKey: '******',
        bucketName: '******',
        operationType: 'download',
        obsFilePath: 'uploadDir/test/',
        localFilePath: ['resource/downloadDir/d2'],
        region: 'cn-north-6',
        include_self_folder: true,
        exclude: ['uploadDir/test-mult', "uploadDir/test/yasuobao.txt"]
    }
    const obs = getObsClient(inputs);
    await download.downloadFileOrFolder(obs, inputs).then(() => {
        const isExist1 = fs.existsSync('resource/downloadDir/d2/test/test2/file2-1.txt');
        const isExist2 = fs.existsSync('resource/downloadDir/d2/test/yasuobao.txt');
        expect(isExist1).toBeTruthy();
        expect(isExist2).toBeFalsy();
    });
});

test('download a exist folder to nonexist local', async () => {
    const inputs = {
        accessKey: '******',
        secretKey: '******',
        bucketName: '******',
        operationType: 'download',
        obsFilePath: 'uploadDir123',
        localFilePath: ['resource/downloadDir/d3'],
        region: 'cn-north-6',
        includeSelfFolder: true,
        exclude: ['uploadDir/test-mult', "uploadDir/test/yasuobao.txt"]
    }
    const obs = getObsClient(inputs);
    await download.downloadFileOrFolder(obs, inputs);
    const isExist = fs.existsSync('resource/downloadDir/abac/uploadDir123');
    expect(isExist).toBeFalsy();
});

test('download a nonexist folder to local', async () => {
    const inputs = {
        accessKey: '******',
        secretKey: '******',
        bucketName: '******',
        operationType: 'download',
        obsFilePath: 'uploadDir123',
        localFilePath: ['resource/downloadDir'],
        region: 'cn-north-6',
        includeSelfFolder: true,
        exclude: ['uploadDir/test-mult', "uploadDir/test/yasuobao.txt"]
    }
    const obs = getObsClient(inputs);
    await download.downloadFileOrFolder(obs, inputs);
    const isExist = fs.existsSync('resource/downloadDir/uploadDir123');
    expect(isExist).toBeFalsy();
});

// -----------------------------function--------------------------------

test('pathIsSingleFile', () => {
    expect(download.pathIsSingleFile(['obspath1.txt'], 'obspath1.txt')).toBeTruthy();
    expect(download.pathIsSingleFile(['obspath1.txt', 'obspath2'], 'obspath1.txt')).toBeFalsy();
    expect(download.pathIsSingleFile(['aaa/obspath1.txt'], 'aaa/obspath1.txt')).toBeTruthy();
    expect(download.pathIsSingleFile(['aaa/obspath1/'], 'aaa')).toBeFalsy();
});

test('createEmptyRootFolders', () => {
    const localpath1 = download.createEmptyRootFolders('resource/downloadDir', 'obs1/obs2', true);
    expect(localpath1).toEqual('resource/downloadDir/obs2');
    const localpath2 = download.createEmptyRootFolders('resource/downloadDir', 'obs1/obs2', false);
    expect(localpath2).toEqual('resource/downloadDir');
    const localpath3 = download.createEmptyRootFolders('resource/downloadDir', 'obs1/obs2', true);
    expect(localpath3).toEqual('resource/downloadDir/obs2');
    const localpath4 = download.createEmptyRootFolders('resource/downloadDir', 'obs1/obs2', false);
    expect(localpath4).toEqual('resource/downloadDir');
});

test('downloadFile', async () => {
    const inputs = {
        accessKey: '******',
        secretKey: '******',
        bucketName: '******',
        operationType: 'download',
        obsFilePath: 'uploadDir/file2.txt',
        localFilePath: ['resource/downloadDir/d4/file2rename.txt'],
        region: 'cn-north-6',
    }
    const obs = getObsClient(inputs);
    await download.downloadFile(obs, inputs, inputs.obsFilePath, inputs.localFilePath[0]);
    const isExist = fs.existsSync('resource/downloadDir/d4/file2rename.txt');
    expect(isExist).toBeTruthy();
});

test('getLocalFileName', () => {
    const local1 = download.getLocalFileName('resource/downloadDir/d4', 'obs1/obsfile.txt');
    expect(local1).toEqual('resource/downloadDir/d4/obsfile.txt');
    const local2 = download.getLocalFileName('resource/downloadDir/d4/1.txt', 'obs1/obsfile.txt');
    expect(local2).toEqual('resource/downloadDir/d4/1.txt');
});

test('getDownloadList and delUselessPath', async () => {
    const inputs = {
        accessKey: '******',
        secretKey: '******',
        bucketName: '******',
        operationType: 'download',
        obsFilePath: 'uploadDir',
        localFilePath: ['resource/downloadDir/d4/file2rename.txt'],
        region: 'cn-north-6',
        exclude: ['uploadDir/file2.txt', 'uploadDir/test-mult/other1'],
    };
    const obs = getObsClient(inputs);
    const res1 = await download.getDownloadList(obs, inputs, inputs.obsFilePath);
    expect(res1.indexOf('uploadDir/file2.txt')).toEqual(-1);
    expect(res1.indexOf('uploadDir/test-mult/other1/other1-1.txt')).toEqual(-1);
    expect(res1.indexOf('uploadDir/test-mult/') > -1).toBeTruthy();
});

test('download a folder to local that local has same name file', async () => {
    const inputs = {
        accessKey: '******',
        secretKey: '******',
        bucketName: '******',
        operationType: 'download',
        obsFilePath: 'uploadDir/test-mult',
        localFilePath: ['resource/downloadDir/d6'],
        include_self_folder: true,
        region: 'cn-north-6',
    };
    const obs = getObsClient(inputs);
    await download.downloadFile(obs, inputs, inputs.obsFilePath, inputs.localFilePath[0]);
    expect(fs.existsSync('resource/downloadDir/d6/test-mult/other2.txt')).toBeFalsy();
});
