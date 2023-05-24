const createSkeleton = require("./lib/skeletonCreate")
const  argv = require('minimist')(process.argv.slice(2), {
    default: {
        basedir: false,
        help: false,
        h: false,
        upstreams: false,
        proxies: false,
        u: false,
        dryrun: false
    },
});


/**
 * @method printHelp
 * @summary Funnily enough, it prints the help text to the console
 */
function printHelp() {
    console.log("---------------------------------------------------------------------------------------------------------------")
    console.log("nginx-config-scaffold: A tool to scaffold out nginx certs + dns so that you can test configs in CI environments")
    console.log("---------------------------------------------------------------------------------------------------------------")
    console.log("Params: " +
        "\n --basedir <baseDir>    Directory to scan configs from recursively\n" +
        " --upstreams            Add upstreams to hosts file \n" +
        " --proxies              Add proxy hosts to hosts file\n" +
        " --dryrun               Don't make changes, just tell me what actions would be performed \n" +
        " --help/-h              This help ")
}

async function main() {
    if (argv.help === true || argv.h === true || argv.basedir === false) {
        printHelp()
        return
    }
    /** @type {boolean} */
    const FLAG_UPSTREAMS = argv.upstreams
    /** @type {boolean} */
    const FLAG_PROXIES = argv.proxies
    /** @type {boolean} */
    const FLAG_DRYRUN = argv.dryrun

    await createSkeleton.createSkeleton(argv.basedir, FLAG_UPSTREAMS, FLAG_PROXIES, FLAG_DRYRUN)
}

void main()