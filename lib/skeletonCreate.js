const  parseConfig = require("./parseConfig")
const  writeHosts = require("./writeHosts")
const  createCert = require("./createCert")


async function createSkeleton(baseDir, upstreams, dryrun) {


    const FLAG_UPSTREAMS = upstreams
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

        if (FLAG_UPSTREAMS) {
            const configUpstreams = await parseConfig.getNginxUpstreams(baseDir)
            for (const upstream of configUpstreams) {
                if (!FLAG_DRYRUN) {
                    console.log(`Adding to hosts file ${upstream}`)
                    await writeHosts.addToHostsFile(upstream)
                } else {
                    console.log(`Would have added ${upstream} to the hosts file`)
                }
            }

        }

    } catch(e) {
        console.error(e)
    }
}

exports.createSkeleton = createSkeleton