import * as fs from "node:fs";

import { Device } from "./homewizard/device.mjs";
import { Webhook } from "./webhooks/webhook.mjs";

/**
 * energyid-homewizard-connector
 */
let initialized = false;
let hweDevice;
let energyid_hook = "";
let mappings = {};

/**
 * Public functions
 */

export const init = async (hwe, energyidWebhook, offset = 0) => {
	hweDevice = await Device.init(hwe, offset);
	energyid_hook = energyidWebhook;
	initialized = hweDevice instanceof Device && energyid_hook;

	// import mappings.json
	mappings = JSON.parse(fs.readFileSync("./config/mappings.json", "utf8"));
};

export const sync = async (dryRun = false) => {
	if (!initialized) {
		console.error('Configuration is missing, call "init" function first.');
		return;
	}

	const data = await hweDevice.update();
	if (!data) {
		return;
	}

	for (const key in mappings) {
		if (data[key]) {
			const hook = new Webhook(key, energyid_hook, "POST", mappings[key]);

			setTimeout(() => {
				// Account for time discrepensies between local system and server
				hook.send(data[key], dryRun);
			}, 5000);
		}
	}
};
