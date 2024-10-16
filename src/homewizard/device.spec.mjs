// src/homewizard/device.test.mjs
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Device } from "./device.mjs";

globalThis.fetch = vi.fn();

describe("Device", () => {
	const mockAddress = "192.168.1.1";
	const mockOffset = 10;
	const mockData = {
		product_name: "HomeWizard",
		serial: "123456789",
		firmware_version: "1.0.0",
		api_version: "v1",
	};
	const mockApiResponse = {
		data: "mockData",
	};

	beforeEach(() => {
		fetch.mockReset();
	});

	it("should initialize successfully with valid data", async () => {
		fetch.mockResolvedValueOnce({
			json: async () => mockData,
		});

		const device = await Device.init(mockAddress, mockOffset);

		expect(device).toBeInstanceOf(Device);
		expect(device.offset).toBe(mockOffset);
		expect(device.data).toEqual({});
	});

	it("should throw an error if initialization fails", async () => {
		fetch.mockRejectedValueOnce(new Error("Network Error"));

		await expect(Device.init(mockAddress, mockOffset)).rejects.toThrow("Cannot initialize 192.168.1.1");
	});

	it("should update data successfully", async () => {
		fetch.mockResolvedValueOnce({
			json: async () => mockData,
		});

		const device = await Device.init(mockAddress, mockOffset);

		fetch.mockResolvedValueOnce({
			json: async () => mockApiResponse,
		});

		const data = await device.update();

		expect(data).toEqual(mockApiResponse);
		expect(device.data).toEqual(mockApiResponse);
	});

	it("should handle data update failure", async () => {
		fetch.mockResolvedValueOnce({
			json: async () => mockData,
		});

		const device = await Device.init(mockAddress, mockOffset);

		fetch.mockRejectedValueOnce(new Error("Network Error"));

		await device.update();

		expect(device.data).toEqual({});
	});

	it("should return correct offset", async () => {
		fetch.mockResolvedValueOnce({
			json: async () => mockData,
		});

		const device = await Device.init(mockAddress, mockOffset);

		expect(device.offset).toBe(mockOffset);
	});

	it("should return correct data", async () => {
		fetch.mockResolvedValueOnce({
			json: async () => mockData,
		});

		const device = await Device.init(mockAddress, mockOffset);

		fetch.mockResolvedValueOnce({
			json: async () => mockApiResponse,
		});

		await device.update();

		expect(device.data).toEqual(mockApiResponse);
	});
});
