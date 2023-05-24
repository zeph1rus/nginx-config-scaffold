const ConfigParser = require('@webantic/nginx-config-parser')
const  recursive  = require('recursive-readdir')

/**
 * @typedef {Object} SslCert
 * @property {string} certFile - location of the cert file
 * @property {string} keyFile - location of the key file
 */


/**
 * @method handleException
 * @summary A generic exception handler to avoid code duplication
 * @param {Error} exception An Exception
 * @param {string} data The Config File being parsed
 */
function handleException(exception, data){
    switch (true) {
        case (exception instanceof ReferenceError): {
            console.error(`ReferenceError Parsing Config: ${data} - Config Possibly Broken? ${exception.toString()}`)
            break;
        }
        case (exception instanceof TypeError): {
            console.error(`TypeError Parsing Config: ${data} - Config Possibly Broken? ${exception.toString()}`)
            break;
        }
        default: {
            console.warn(`Couldn't Parse file ${data}: ${exception.toString()}`)
            break;
        }
    }

}

/**
 * @method parseProxyUrl
 * @summary Get hostname out of the url in the proxy_pass directive
 * @param url_string {string}
 * @return {string}
 */
function parseProxyUrl(url_string){
    try{
        /** @type {URL} */
        const parsedUrl = new URL('', url_string)
        // shouldn't be returned but for weirdly constructed urls we check anyway
        if ( parsedUrl.hostname.indexOf(':') >= 0) {
            return parsedUrl.hostname.split(':')[0]
        }
        return parsedUrl.hostname
    } catch (e) {
        return ""
    }
}



/**
 * @method getProxies
 * @summary Get hostnames from the proxy_pass directives
 * @param {string} configFile
 * @return {string[]}
 */

function getProxies(configFile) {
    /** @type {string[]} */
    let proxies = []
    const locationMatcher = new RegExp(String.raw`^location\s`)

    const parser = new ConfigParser()

    try {
        console.log(`Checking for proxy hosts in: ${configFile}`)
        const config = parser.readConfigFile(configFile, { parseIncludes: false })

        if (typeof config.server === 'object') {
            if (Array.isArray(config.server )) {
                config.server?.forEach((serverBlock) => {
                    for (const [key, val] of Object.entries(serverBlock)) {
                        if(locationMatcher.test(key)){
                            if ("proxy_pass" in val) {
                                console.log(`Found Proxy ${val.proxy_pass}`)
                                proxies.push(parseProxyUrl(val.proxy_pass))
                            }

                        }
                    }
                })
            } else {
                for (const [key, val] of Object.entries(config.server)) {
                    if(locationMatcher.test(key)){
                        if ("proxy_pass" in val) {
                            console.log(`Found Proxy ${val.proxy_pass}`)
                            proxies.push(parseProxyUrl(val.proxy_pass))
                        }

                    }
                }
            }

        } else {
            console.warn(`Config File: ${configFile} has no server block so is being ignored`)
        }

    } catch (e) {
        handleException(e, configFile)
    }

    return proxies
}


/**
 * @method getUpstreams
 * @summary Get the hostnames from upstream directives
 * @param {string} configFile
 * @return {string[]}
 */
function getUpstreams(configFile) {
    const upstreamMatcher = new RegExp(String.raw`^upstream\s`)
    const parser = new ConfigParser()

    /** @type {string[]} */
    let upstreams = []

    try {
        console.log(`Checking for Upstreams in ${configFile}`)
        const config = parser.readConfigFile(configFile, { parseIncludes: false})
        for (const [key, val] of Object.entries(config)) {
            // if val is undefined this can't be an upstream block
            if (key && val) {
                if(upstreamMatcher.test(key)) {
                    if (val.hasOwnProperty("server")) {
                        switch (typeof (val.server)) {
                            case "string": {
                                console.log(`got upstream single: ${val.server}`)
                                upstreams.push(val.server.split(":")[0])
                                break
                            }
                            case "object": {
                                // something else
                                console.log(`got upstream multiple ${Object.entries(val.server)}`)
                                for (const [_, value] of Object.entries(val.server)) {
                                    upstreams.push(value.split(":")[0])
                                }
                                break
                            }
                            default: {
                                break
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        handleException(e, configFile)
    }
    return upstreams
}


/**
 * @method getPaths
 * @summary Parse a single nginx config file and return the certs used in every server block. This does not parse included configs
 * @param configFile {string}
 * @return {SslCert[]}
 */
function getPaths(configFile) {
    /** @type SslCert[] */
    let certPaths= []

    const parser = new ConfigParser()

    try {
        console.log(`Parsing Config: ${configFile}`)
        const config = parser.readConfigFile(configFile, { parseIncludes: false })
        if (typeof config.server === 'object') {
            if (Array.isArray(config.server )) {
                config.server?.forEach((serverBlock) => {
                    if (serverBlock.ssl_certificate?.trim() && serverBlock.ssl_certificate_key?.trim()) {
                        certPaths.push({
                            certFile: serverBlock.ssl_certificate,
                            keyFile: serverBlock.ssl_certificate_key
                        })
                    }
                })
            } else {
                if (config.server.ssl_certificate?.trim() && config.server.ssl_certificate_key?.trim()) {
                    certPaths.push({
                        certFile: config.server.ssl_certificate,
                        keyFile: config.server.ssl_certificate_key
                    })
                }
            }

        } else {
            console.warn(`Config File: ${configFile} has no server block so is being ignored`)
        }

    } catch (e) {
        handleException(e, configFile)
    }
    return certPaths

}

/**
 * @method getConfigFiles
 * @summary Scan directories for nginx config files. Returns an array of strings containing config file paths
 * @param baseDir {string} root directory to search
 * @param [extensions] {string[]} extensions to search for (default .conf)
 * @return {Promise<string[]>}
 */
async function getConfigFiles(baseDir, extensions){

    const includeList = extensions ?? ['.conf']
    console.log(`Searching in ${baseDir}`)
    const fileNames = await recursive(baseDir)
    if (!fileNames) {
        return Promise.resolve([])
    }
    const files = fileNames.filter((fileName) => {
        let matched = false
        includeList.forEach((ext) => {
            if (fileName.trim().endsWith(ext)) {
                matched = true
            }
        })
        return matched
    })
    return Promise.resolve(files)
}



/**
 * @method deDupeCerts
 * @summary Return only unique certs
 * @param certs {SslCert[]}
 * @return {SslCert[]}
 */
function deDupeCerts(certs) {
    return certs.reduce((tot, currentValue) => {
        if (!tot.find(item => item.certFile === currentValue.certFile)) {
            return [...tot, currentValue]
        } else {
            return tot
        }
    }, [])
}

/**
 * @method deDupeUpstreams
 * @summary Return only unique upstreams
 * @param upstreams {string[]}
 * @return {string[]}
 */
function deDupeUpstreams(upstreams) {
    return upstreams.reduce((tot, currentValue) => {
        if (!tot.find(item => item === currentValue)) {
            return [...tot, currentValue]
        } else {
            return tot
        }
    }, [])
}


/**
 * @method getNginxCerts
 * @summary parse all the nginx certs in a directory and subdirectories and return all the certificates used.
 * @param basedir {string} The Base directory to search
 * @return {Promise<SslCert[]>}
 */
async function getNginxCerts(basedir) {
    /** @type SslCert[] */
    let certs = []

    const configFiles = await getConfigFiles(basedir)
    configFiles.forEach((configFile) => {
        getPaths(configFile)?.forEach((sslCertItem) => {
            certs.push(sslCertItem)
        })
    })
    //console.log(certs)
    return Promise.resolve(deDupeCerts(certs))
}


/**
 * @method getUpstreams
 * @summary Get the upstreams from all the config files
 * @param basedir {string} The base directory to search
 * @return {Promise<string[]>}
 */
async function getNginxUpstreams(basedir) {
    /** @type string[] */
    let upstreams = []
    const configFiles = await getConfigFiles(basedir)
    configFiles.forEach((configFile) => {
        getUpstreams(configFile)?.forEach((upstream) => {
            upstreams.push(upstream)
        })
    })

    return Promise.resolve(deDupeUpstreams(upstreams))

}

async function getNginxProxies(basedir) {
    /** @type string[] */
    let proxies = []
    const configFiles = await getConfigFiles(basedir)
    configFiles.forEach((configFile) => {
        getProxies(configFile)?.forEach((upstream) => {
            proxies.push(upstream)
        })
    })

    // this method works for both as they are simple lists
    return Promise.resolve(deDupeUpstreams(proxies))

}


exports.getNginxCerts = getNginxCerts
exports.getNginxUpstreams = getNginxUpstreams
exports.getNginxProxies = getNginxProxies
exports.parseProxyUrl = parseProxyUrl