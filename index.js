const  parseConfig = require("./lib/parseConfig")
const  writeHosts = require("./lib/writeHosts")
const  createCert = require("./lib/createCert")
const  argv = require('minimist')(process.argv.slice(2), {
    default: {
        baseDir: false,
        help: false,
        h: false,
        upstreams: false,
        u: false,
        dryrun: false
    },
});


function printHelp() {
    console.log("nginx-config-scaffold: A tool to scaffold out nginx certs + dns so that you can test configs in CI environments")
    console.log("Params: " +
        "\n --baseDir <baseDir> Directory to scan configs from. Defaults to current working directory \n" +
        " --upstreams/-u add upstreams to hosts file \n" +
        "--dryrun don't make changes, just tell me what it would do \n" +
        " --help/-h this help ")
}

async function main() {
    if (argv.help === true || argv.h === true || argv.baseDir === false) {
        printHelp()
        return
    }

    const FLAG_UPSTREAMS = (argv.upstreams === true || argv.u === true)
    const FLAG_DRYRUN = argv.dryrun

    try {
        const configElements= await parseConfig.getNginxCerts(argv.baseDir)
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
            const configUpstreams = await parseConfig.getNginxUpstreams(argv.baseDir)
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

void main()