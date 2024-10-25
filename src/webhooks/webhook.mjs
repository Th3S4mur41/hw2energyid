/**
 * Webhook class
 */

const METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]); // Supported HTTP methods

export class Webhook {
	#name;
	#url;
	#method;
	#mapping;
	#callInterval;
	#synchronized = new Date(0);

	/**
	 * Create a new Webhook instance
	 * @param {*} name - Set a name for the webhook
	 * @param {*} url - Set the URL of the webhook
	 * @param {*} method - [optional] Set the method to use for the webhook (Default: GET)
	 * @param {*} mapping - [optional] Set the mapping to adapt the data to the webhook format (Default: {})
	 * @param {*} callInterval - [optional] Set the interval in seconds to call the webhook (Default: 60s)
	 */
	constructor(name, url, method = "GET", mapping = {}, callInterval = 60) {
		this.#name = name;
		this.#url = url;
		this.#method = METHODS.has(method.toUpperCase()) ? method.toUpperCase() : "GET";
		this.#mapping = mapping;
		this.#callInterval = callInterval;

		console.log(`[${this.#name}] Webhook created`);
		console.debug(
			`[${this.#name}] Webhook config: ${this.#url} - ${this.#method} - ${JSON.stringify(this.#mapping)} - Call Interval: ${this.#callInterval}ms`,
		);
	}

	/**
	 * Getter for the name property
	 * @returns {string} - The name of the webhook
	 */
	get name() {
		return this.#name;
	}

	/**
	 * Getter for the URL property
	 * @returns {string} - The URL of the webhook
	 */
	get url() {
		return this.#url;
	}

	/**
	 * Getter for the method property
	 * @returns {string} - The HTTP method of the webhook
	 */
	get method() {
		return this.#method;
	}

	/**
	 * Getter for the synchronized property
	 * @returns {Date} - The last synchronized date
	 */
	get synchronized() {
		return this.#synchronized;
	}

	/**
	 * Format the data according to the mapping
	 * @param {Object} data - The data to be formatted
	 * @returns {Object} - The formatted data
	 */
	#formatData = (data) => {
		const jsonString = JSON.stringify(this.#mapping);
		// Check if any placholders is missing from data
		const missingKeys = jsonString.match(/\$\{(\w+)\}/g).map((key) => key.substring(2, key.length - 1));
		if (missingKeys.some((key) => data[key] === undefined)) {
			console.debug(`[${this.#name}] Missing keys in data: ${missingKeys}`);
			return undefined;
		}

		// Replace the placeholders with the data
		const formattedData = jsonString.replace(/\$\{(\w+)\}/g, (_, key) => data[key]);
		return JSON.parse(formattedData);
	};

	/**
	 * Send the data to the webhook URL
	 * @param {Object} data - The data to be sent
	 * @param {boolean} dryRun - If true, log the data instead of sending it
	 */
	send = async (data = "", dryRun = false) => {
		const jsonData = this.#formatData(data);

		// Check if jsonData is an empty object
		if (!jsonData) {
			console.warn(`[${this.#name}] No data matching the mapping. Skipping send.`);
			return { exitCode: 1, message: "No data matching the mapping. Skipping send." };
		}

		// Check if the last send was within the last hour
		const now = new Date();
		if (now - this.#synchronized < this.#callInterval * 1000) {
			console.log(`[${this.#name}] Data was sent less than ${this.#callInterval}s ago. Skipping send.`);
			return { exitCode: 0, message: `Data was sent less than ${this.#callInterval}s ago. Skipping send.` };
		}

		if (dryRun) {
			console.log(`[${this.#name}] Would send ${JSON.stringify(jsonData)}...`);
			return { exitCode: 0, message: "" };
		}
		console.log(`[${this.#name}] Sending ${JSON.stringify(jsonData)}...`);

		try {
			const response = await fetch(this.#url, {
				method: this.#method,
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(jsonData),
			});
			if (!response.ok) {
				throw new Error(`Failed to send data: ${response.statusText}`);
			}
			console.log(`[${this.#name}] Data sent successfully`);
		} catch (error) {
			console.error("Failed to send data", error);
			return { exitCode: 1, message: error.message };
		}

		this.#synchronized = now;
		return { exitCode: 0, message: "Data sent successfully" };
	};
}
