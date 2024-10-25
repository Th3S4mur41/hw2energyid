import cron from "node-cron";
import { Device } from "./homewizard/device.mjs";

let dryRun = false;

/**
 * Initializes the device and adds hooks.
 * @param {string} deviceAddress - The address of the device.
 * @param {number} offset - The offset value for the device.
 * @param {Array} hooks - An array of hook objects to be added to the device.
 * @returns {Promise<Device>}
 */
const init = async (deviceAddress, offset, hooks) => {
	const device = await Device.init(deviceAddress, offset);
	for (const hook of hooks) {
		device.addHook(hook);
	}
	return device;
};

// TODO: add a function to load device and hooks config from a file

/**
 * Gets the current dry run status.
 * @returns {boolean} The current dry run status.
 */
export const getDryRun = () => dryRun;

/**
 * Sets the dry run status.
 * @param {boolean} value - The new dry run status.
 */
export const setDryRun = (value) => {
	dryRun = value;
};

/**
 * Executes the device synchronization.
 * @param {string} deviceAddress - The address of the device.
 * @param {Array} hooks - An array of hook objects to be added to the device.
 * @param {number} [offset=0] - The offset value for the device.
 * @returns {Promise<void>}
 */
export const execute = async (deviceAddress, hooks, offset = 0) => {
	console.log("execute", deviceAddress);
	const device = await init(deviceAddress, offset, hooks);
	device.sync(dryRun);
};

/**
 * Schedules the device synchronization using a cron expression.
 * @param {string} deviceAddress - The address of the device.
 * @param {Array} hooks - An array of hook objects to be added to the device.
 * @param {number} [offset=0] - The offset value for the device.
 * @param {string} [cronExpression=''] - The cron expression for scheduling.
 * @returns {Promise<void>}
 * @throws {Error} If the cron expression is invalid.
 */
export const schedule = async (deviceAddress, hooks, offset = 0, cronExpression = "") => {
	console.log("schedule", deviceAddress, cronExpression);
	const device = await init(deviceAddress, offset, hooks);

	const _cronExpression = cronExpression || "* * * * *"; // default to every minute
	if (!cron.validate(_cronExpression)) {
		throw new Error(`Invalid cron expression: ${_cronExpression}`);
	}

	cron.schedule(_cronExpression, async () => {
		device.sync(dryRun);
	});
};
