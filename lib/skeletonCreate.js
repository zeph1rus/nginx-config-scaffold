const  parseConfig = require("./parseConfig")
const  writeHosts = require("./writeHosts")
const  createCert = require("./createCert")


/**
 * @method createSkeleton
 * @summary Main method to create a scaffold to allow nginx config testing
 * @param baseDir {string} Directory to search from
 * @param upstreams {boolean} Dummy out upstream hostnames in hostsfile?
 * @param proxies {boolean} Dummy out hostnames in proxy_pass directives?
 * @param dryrun {boolean} Make changes or just document where we would?
 * @return {Promise<void>}
 */
async function createSkeleton(baseDir, upstreams, proxies, dryrun) {


    const FLAG_DRYRUN = dryrun
    try {
        const configElements= await parseConfig.getNginxCerts(baseDir)
        for (const sslCert of configElements) {

            const selfSignedCert = await createCert.getSelfSignedCert('www.selfsigned.com')
            if (!FLAG_DRYRUN) {

                if(await createCert.createDirForCert(sslCert.certFile) && await createCert.createDirForCert(sslCert.keyFile)) {
                    await createCert.writeCert(sslCert.certFile, sslCert.keyFile, selfSignedCert)
                } else {
                    console.log(`Couldn't write cert ${sslCert.certFile}`)
                }

            } else {
                console.log(`${sslCert.certFile} and key would have been created`)
            }
        }

        if (upstreams) {
            const configUpstreams = await parseConfig.getNginxUpstreams(baseDir)
            for (const upstream of configUpstreams) {
                if (!FLAG_DRYRUN) {
                    console.log(`Adding to hosts file ${upstream}`)
                    // TODO: Handle windows hosts file location (C:\windows\system32\drivers\etc\hosts) for the people who are mad enough to run nginx on windows
                    await writeHosts.addToHostsFile(upstream)
                } else {
                    console.log(`Would have added ${upstream} to the hosts file`)
                }
            }

        }

        if (proxies) {
            const configProxies = await parseConfig.getNginxProxies(baseDir)
            for (const proxy of configProxies) {
                if (!FLAG_DRYRUN) {
                    console.log(`Adding to hosts file ${proxy}`)
                    await writeHosts.addToHostsFile(proxy)
                } else {
                    console.log(`Would have added ${proxy} to the hosts file`)
                }
            }
        }

    } catch(e) {
        console.error(e)
    }
}

exports.createSkeleton = createSkeleton