/**
 * HomeWizard device class
 */

const PRIVATE_CONSTRUCTOR_KEY = Symbol();
const PROTOCOL = "http";

export class Device {
	#data = {};
	#offset = 0;
	#address = "";
	#name = "";
	#serial = "";
	#firmwareVersion = "";
	#apiVersion = "";

	/**
	 * Private Constructor - Use the init() function to instantiate a new instance
	 *
	 * @param {Symbol} constructorKey
	 * @param {string} name
	 * @param {string} serial
	 * @param {string} firmwareVersion
	 * @param {string} apiVersion
	 * @param {string} address
	 * @param {number} offset
	 */
	constructor(constructorKey, name, serial, firmwareVersion, apiVersion, address, offset) {
		if (constructorKey !== PRIVATE_CONSTRUCTOR_KEY) {
			throw new Error("Use the init() function to instantiate a new instance.");
		}
		if (!address) {
			throw new Error("Device Address is required");
		}
		this.#name = name;
		this.#serial = serial;
		this.#firmwareVersion = firmwareVersion;
		this.#apiVersion = apiVersion;
		this.#address = address;
		this.#offset = Number.isNaN(Number.parseFloat(offset)) ? 0 : Number.parseFloat(offset);

		this.log(`${this.#address} - New Device initialized`);
	}

	/**
	 *
	 * @param {string} address - The IP Address or Hostname of the HomeWizard Device
	 * @param {number} offset - The offset to use for the readings
	 * @returns
	 */
	static init = async (address, offset = 0) => {
		console.log(`Initializing ${address} ...`);

		try {
			const response = await fetch(`${PROTOCOL}://${address}/api/`);
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
	};

	/**
	 * Getter and setter
	 */

	get data() {
		return this.#data;
	}

	get offset() {
		return this.#offset;
	}

	/**
	 * Update the data from the HomeWizard device
	 * @returns {Promise} - The data from the HomeWizard device
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
				console.log(data);
				this.#data = data;
				return data;
			})
			.catch((error) => {
				console.error(`${this.#address} cannot update data from ${this.apiUrl}`);
			});
	};

	log = (message) => {
		console.log(`[${this.#name} - ${this.#serial}] ${message}`);
	};
}
