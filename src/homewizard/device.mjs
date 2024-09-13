/**
 * HomeWizard device class
 */

export class Device {
	#data = {};
	#offset = 0;

	/**
	 * Create a new HomeWizard device
	 * @param {string} name - The name of the HomeWizard Device
	 * @param {string} address - The IP Address or Hostname of the HomeWizard Device
	 * @param {number} offset - The offset to use for the readings
	 */
	constructor(name, address, offset = 0) {
		if (!name || !address) {
			throw new Error("Device Name and Address are required");
		}
		this.name = name;
		this.apiUrl = `http://${address}/api/v1/data/`;
		this.#offset = Number.isNaN(Number.parseFloat(offset)) ? 0 : Number.parseFloat(offset);
	}

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
		console.log(`Updating data from ${this.name} ...`);

		return fetch(this.apiUrl)
			.then((result) => {
				console.log(`${this.name}'s data:`);
				return result.json();
			})
			.then((data) => {
				console.log(data);
				this.#data = data;
				return data;
			})
			.catch((error) => {
				console.error(`${this.name} cannot update data from ${this.apiUrl}`);
			});
	};
}
