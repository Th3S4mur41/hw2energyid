/**
 * Device class
 */

const PROTOCOL = "http"; // Protocol used for API requests
const PRIVATE_CONSTRUCTOR_KEY = Symbol("private"); // Symbol to enforce private constructor

export class Device {
	#name = "";
	#serial = "";
	#firmwareVersion = "";
	#apiVersion = "";
	#address = "";
	#offset = 0;
	#data = {};

	/**
	 * Private constructor to enforce the use of the init method
	 * @param {*} key - Private key to enforce private constructor
	 * @param {*} name - Name of the device
	 * @param {*} serial - Serial number of the device
	 * @param {*} firmwareVersion - Firmware version of the device
	 * @param {*} apiVersion - API version of the device
	 * @param {*} address - Address of the device
	 * @param {*} offset - Offset value for the device
	 */
	constructor(key, name, serial, firmwareVersion, apiVersion, address, offset) {
		if (key !== PRIVATE_CONSTRUCTOR_KEY) {
			throw new Error("Use Device.init() to create an instance");
		}
		this.#name = name;
		this.#serial = serial;
		this.#firmwareVersion = firmwareVersion;
		this.#apiVersion = apiVersion;
		this.#address = address;
		this.#offset = offset;
	}

	/**
	 * Initialize a new Device instance
	 * @param {string} address - Address of the device
	 * @param {number} offset - Offset value for the device
	 * @returns {Promise<Device>} - A promise that resolves to a new Device instance
	 */
	static async init(address, offset) {
		try {
			const response = await fetch(`${PROTOCOL}://${address}/api/`);
			if (!response.ok) {
				throw new Error(`Cannot initialize ${address}`);
			}
			const data = await response.json();

			return new Device(
				PRIVATE_CONSTRUCTOR_KEY,
				data.product_name,
				data.serial,
				data.firmware_version,
				data.api_version,
				address,
				offset,
			);
		} catch (error) {
			throw new Error(`Cannot initialize ${address}`);
		}
	}

	/**
	 * Getter for the data property
	 * @returns {Object} - The data of the device
	 */
	get data() {
		return this.#data;
	}

	/**
	 * Getter for the offset property
	 * @returns {number} - The offset value of the device
	 */
	get offset() {
		return this.#offset;
	}

	/**
	 * Update the data from the HomeWizard device
	 * @returns {Promise<Object>} - The data from the HomeWizard device
	 */
	update = async () => {
		const url = `${PROTOCOL}://${this.#address}/api/${this.#apiVersion}/data/`;
		this.log(`Updating data from ${url} ...`);

		return fetch(url)
			.then((result) => {
				console.log(`${this.#address}'s data:`);
				return result.json();
			})
			.then((data) => {
				if (!data.updated) {
					// If data does not contain an "updated" field, set the current timestamp
					const updated = new Date();
					updated.setSeconds(0, 0); // Keep an offset of 0 seconds to avoid time offset issues with the webhook server
					data.updated = updated.toISOString();
				}

				console.log(data);
				this.#data = data;

				return data;
			})
			.catch((error) => {
				console.error(`${this.#address} cannot update data from ${this.apiUrl}`);
			});
	};

	/**
	 * Log a message with the device's name and serial number
	 * @param {string} message - The message to log
	 */
	log = (message) => {
		console.log(`[${this.#name} - ${this.#serial}] ${message}`);
	};
}
