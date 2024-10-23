/**
 * Webhook class
 */

const METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]); // Supported HTTP methods

export class Webhook {
	#name = "";
	#url = "";
	#method = "";
	#mapping = {};

	/**
	 * Create a new Webhook instance
	 * @param {*} name - Set a name for the webhook
	 * @param {*} url - Set the URL of the webhook
	 * @param {*} method - [optional] Set the method to use for the webhook (Default: GET)
	 * @param {*} mapping - [optional] Set the mapping to adapt the data to the webhook format (Default: {})
	 */
	constructor(name, url, method = "GET", mapping = {}) {
		this.#name = name;
		this.#url = url;
		this.#method = METHODS.has(method.toUpperCase()) ? method.toUpperCase() : "GET";
		this.#mapping = mapping;

		console.log(`[${this.#name}] Webhook created`);
		console.debug(`[${this.#name}] Webhook config: ${this.#url} - ${this.#method} - ${JSON.stringify(this.#mapping)}`);
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
	 * Format the data according to the mapping
	 * @param {Object} data - The data to be formatted
	 * @returns {Object} - The formatted data
	 */
	#formatData = (data) => {
		const jsonString = JSON.stringify(this.#mapping);
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

		if (dryRun) {
			console.log(`[${this.#name}] Would send ${JSON.stringify(jsonData)}...`);
			return;
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
			throw new Error("Failed to send data");
		}
	};
}
