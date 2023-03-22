#! /usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { init, sync } from "../src/index.mjs";
import cron from "node-cron";

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
	.option("r", {
		alias: "recurring",
		description: "Run the task every hour",
		type: "boolean",
	})
	.option("d", {
		alias: "dry-run",
		description: "Read the data and simulate sending the readings",
		type: "boolean",
	})
	.demandCommand(0)
	.help()
	.alias("h", "help")
	.version()
	.alias("v", "version");

const argv = yargsBin.argv;

if (!(argv.p1 && argv.energyid)) {
	yargsBin.showHelp("log");
	process.exit(1);
}

init(argv.p1, argv.energyid);
if (argv.r) {
	console.log("Scheduling hw2energyid to run every hour");
	cron.schedule("0 * * * *", () => {
		sync(argv.d);
	});
} else {
	sync(argv.d);
}
