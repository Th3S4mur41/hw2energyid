#! /usr/bin/env node

import * as fs from "node:fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { execute, schedule, setDryRun } from "../index.mjs";
import { Webhook } from "../webhooks/webhook.mjs";

// TODO: check node-cron for recursive solution
// https://www.npmjs.com/package/node-cron

const yargsBin = yargs(hideBin(process.argv))
	.usage("$0--energyid <energyid webhook>  --meter <homewizard meter host or ip> [options]")
	.option("e", {
		alias: "energyid",
		description: "URL of the EnergyId Webhook",
		type: "string",
	})
	.option("m", {
		alias: ["meter", "p", "p1"],
		description: "Hostname or IP address of the HomeWizard meter",
		type: "string",
	})
	.option("r", {
		alias: "recurring",
		description: "Run the task every hour",
		type: "boolean",
	})
	.option("o", {
		alias: "offset",
		description: "Add an offset to the meter's value (to compensate for consumption before installation)",
		type: "number",
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

if (!(argv.meter && argv.energyid)) {
	yargsBin.showHelp("log");
	process.exit(1);
}

console.log(`${process.env.npm_package_name} ${process.env.npm_package_version}`);
console.log("");

setDryRun(argv.d);

// import mappings.json
const mappings = JSON.parse(fs.readFileSync("./config/mappings.json", "utf8"));

const hooks = [];
for (const key in mappings) {
	const webhook = new Webhook(key, argv.energyid, "POST", mappings[key]);
	hooks.push(webhook);
}

if (argv.r) {
	console.log("Scheduling hw-hooks to run every hour");
	schedule(argv.meter, hooks, argv.offset);
} else {
	console.log(`Execute all hooks for ${argv.meter}`);
	execute(argv.meter, hooks, argv.offset);
}
