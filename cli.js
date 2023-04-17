const createSkeleton = require("./lib/skeletonCreate")
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
    console.log("---------------------------------------------------------------------------------------------------------------")
    console.log("nginx-config-scaffold: A tool to scaffold out nginx certs + dns so that you can test configs in CI environments")
    console.log("---------------------------------------------------------------------------------------------------------------")
    console.log("Params: " +
        "\n --baseDir <baseDir>    Directory to scan configs from recursively\n" +
        " --upstreams            Add upstreams to hosts file \n" +
        " --dryrun               Don't make changes, just tell me what it would do \n" +
        " --help/-h              This help ")
}

async function main() {
    if (argv.help === true || argv.h === true || argv.baseDir === false) {
        printHelp()
        return
    }

    const FLAG_UPSTREAMS = argv.upstreams
    const FLAG_DRYRUN = argv.dryrun

    await createSkeleton.createSkeleton(argv.baseDir, FLAG_UPSTREAMS, FLAG_DRYRUN)
}

void main()