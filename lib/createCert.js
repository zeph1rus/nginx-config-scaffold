const selfsigned = require('selfsigned');
const {parse} = require("path");
const fsPromises = require('node:fs/promises')

/**
 * @typedef {Object} GenerateResult
 * @property {string} private - private key of cert
 * @property {string} public - public key of cert
 * @property {string} cert - certificate in x509 format
 * @property {string} fingerprint - fingerprint of the cert
 */


/**
 * @method getSelfSignedCert
 * @summary Uses selfsigned library to generate a self-signed ssl cert
 * @param cn Common name to use to generate the cert
 * @return {Promise<GenerateResult>}
 */
async function getSelfSignedCert(cn) {
    const attrs = [{ name: 'commonName', value: cn }]
    const cert = await selfsigned.generate(attrs, {days: 14})
    return Promise.resolve(cert)
}


/**
 * @method createDirForCert
 * @summary Creates the directory that will hold the cert if it doesn't exist. Promise returns false if we can't
 * @param certPath {string} Path to the certificate
 * @return {Promise<boolean>}
 */
async function createDirForCert(certPath) {
    const parsedPath = parse(certPath)
    try {
        try {
            await fsPromises.stat(parsedPath.dir);
            return Promise.resolve(true)
        }
        catch (statException) {
            if(statException.code === 'ENOENT') {
                console.warn(`Directory ${certPath} does not exist, trying to create`)
                await fsPromises.mkdir(parsedPath.dir, {recursive: true})
                return Promise.resolve(true)
            }
        }
    } catch(unableToCreate) {
        console.log(unableToCreate)
        return Promise.resolve(false)
    }

}

/**
 * @method writeCert
 * @summary Writes the cert and key to the directory
 * @param certPath {string} Full path to write the cert file to, including filename
 * @param keyPath {string} Full path to write the key file to, including filename
 * @param certObject {GenerateResult} Certificate Object from getSelfSignedCert method
 * @return {Promise<boolean>}
 */
async function writeCert(certPath, keyPath, certObject){
    try {
        await fsPromises.writeFile(certPath, certObject.cert)
        await fsPromises.writeFile(keyPath, certObject.private)
    } catch(unableToWrite) {
        console.error(`Couldn't write cert: ${certPath} - ${unableToWrite}`)
        return Promise.resolve(false)
    }

}

exports.getSelfSignedCert = getSelfSignedCert
exports.createDirForCert = createDirForCert
exports.writeCert = writeCert