/**
 * Webhook class
 */

const METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

export class Webhook {
	#name = "";
	#url = "";
	#method = ""; /**
	 * Create a new Webhook instance
	 * @param {*} name - Set a name for the webhook
	 * @param {*} url - Set the URL of the webhook
	 * @param {*} method - [optional] Set the method to use for the webhook (Default: GET)
	 */
	constructor(name, url, method = "GET") {
		this.#name = name;
		this.#url = url;
		this.#method = METHODS.has(method.toUpperCase()) ? method.toUpperCase() : "GET";
	}

	/**
	 * Getter and setter
	 */

	get name() {
		return this.#name;
	}

	get url() {
		return this.#url;
	}

	get method() {
		return this.#method;
	}

	/**
	 *
	 */

	send = async (data = "") => {
		const jsonData = JSON.parse(data);
		console.log(`[${this.#name}] Sending ${jsonData.remoteName || "data"}...`);

		try {
			const response = await fetch(this.#url, {
				method: this.#method,
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: data,
			});

			if (!response.ok) {
				throw new Error();
			}

			console.log(`[${this.#name}] Sent reading: ${reading.json()}`);
		} catch (e) {
			console.error(`[${this.#name}] Error sending reading: ${data}`);
		}
	};
}
