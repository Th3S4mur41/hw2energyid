import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { init, sync } from "../src/index.mjs";

// TODO: check node-cron for recursive solution
// https://www.npmjs.com/package/node-cron

const yargsBin = yargs(hideBin(process.argv))
	.usage("$0 --p1 <hw p1 host or ip> --energyid <energyid webhook> [option]")
	.option("p", {
		alias: "p1",
		description: "Hostname or IP address of the HomeWizard P1 device",
		type: "string",
	})
	.option("e", {
		alias: "energyid",
		description: "URL of the EnergyId Webhook",
		type: "string",
	})
	.demandCommand(0)
	.help()
	.alias("h", "help")
	.version()
	.alias("v", "version");

const argv = yargsBin.argv;

if (typeof argv.p1 === "undefined" || typeof argv.energyid === "undefined") {
	yargsBin.showHelp("log");
	process.exit(1);
}

init(argv.p1, argv.energyid);
sync();
