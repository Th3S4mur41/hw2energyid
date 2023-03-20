/**
 * energyid-homewizard-connector
 */
let initialized = false;
let hw_p1_api = "";
let energyid_hook = "";

const typeMap = [
	[
		"total_power_import_t1_kwh",
		{
			id: "electricity-import-day",
			name: "Electricity Import (day)",
			metric: "electricityImport",
		},
	],
	[
		"total_power_import_t2_kwh",
		{
			id: "electricity-import-night",
			name: "Electricity Import (night)",
			metric: "electricityImport",
		},
	],
	[
		"total_power_export_t1_kwh",
		{
			id: "electricity-export-day",
			name: "Electricity Export (day)",
			metric: "electricityExport",
		},
	],
	[
		"total_power_export_t2_kwh",
		{
			id: "electricity-export-night",
			name: "Electricity Export (night)",
			metric: "electricityExport",
		},
	],
];

class Reading {
	constructor(type, date, value) {
		this.remoteId = type[1].id;
		this.remoteName = type[1].name;
		this.metric = type[1].metric;
		this.metricKind = "cumulative";
		this.unit = "kWh";
		this.interval = "P1D";
		this.data = [[date, value]];
	}

	json() {
		return JSON.stringify(this);
	}
}

/**
 *  Provate functions
 */

const getData = async () => {
	console.log("Retrieving data from Homewizard P1 API...");

	return fetch(hw_p1_api)
		.then((result) => {
			console.log("HomeWizard P1 data:");
			return result.json();
		})
		.then((data) => {
			console.log(data);
			return data;
		})
		.catch((error) => {
			console.error(error);
		});
};

const setReadings = (data) => {
	const readings = [];
	const readingDate = new Date();
	readingDate.setSeconds(0, 0);

	typeMap.forEach((type) => {
		readings.push(new Reading(type, readingDate.toISOString(), data[type[0]]));
	});
	return readings;
};

const sendReadings = (readings, dryRun) => {
	console.log(dryRun ? "Printing readings to console..." : "Sending readings to EnergyId Webhook...");
	readings.forEach((reading) => {
		if (dryRun) {
			console.log(`Reading to send: ${reading.json()}`);
			return;
		}
		fetch(energyid_hook, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: reading.json(),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Error sending reading: ${reading.json()}`);
				}
				console.log(`Sending reading: ${reading.json()}`);
			})
			.catch((e) => {
				console.error(e.message);
			});
	});
};

/**
 * Public functions
 */

export const init = (hwP1, energyidWebhook) => {
	hw_p1_api = `http://${hwP1}/api/v1/data/`;
	energyid_hook = energyidWebhook;
	initialized = hw_p1_api && energyid_hook;
};

export const sync = async (dryRun = false) => {
	if (!initialized) {
		console.error('Configuration is missing, call "init" function first.');
		return;
	}

	const data = await getData();
	const readings = setReadings(data);

	sendReadings(readings, dryRun);
};
