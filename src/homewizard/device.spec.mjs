import { beforeEach, describe, expect, it, vi } from "vitest";
import { Webhook } from "../webhooks/webhook.mjs";
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
		updated: "2023-01-01T00:00:00.000Z",
		data: "mockData",
	};

	const mockHook = new Webhook("TestWebhook", "https://example.com/webhook", "POST", {
		key1: "${value1}",
		key2: "${value2}",
	});

	beforeEach(() => {
		fetch.mockReset();
	});

	it("should initialize successfully with valid data", async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
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
			ok: true,
			json: async () => mockData,
		});

		const device = await Device.init(mockAddress, mockOffset);

		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockApiResponse,
		});

		const now = new Date();
		const data = await device.update();

		expect(data).toEqual(mockApiResponse);
		expect(device.updated - now).toBeGreaterThan(0);
		expect(device.data).toEqual(mockApiResponse);
	});

	it("should handle data update failure", async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockData,
		});

		const device = await Device.init(mockAddress, mockOffset);

		fetch.mockRejectedValueOnce(new Error("Network Error"));

		await device.update();

		expect(device.data).toEqual({});
	});

	it("should return correct offset", async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockData,
		});

		const device = await Device.init(mockAddress, mockOffset);

		expect(device.offset).toBe(mockOffset);
	});

	it("should return correct data", async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockData,
		});

		const device = await Device.init(mockAddress, mockOffset);

		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockApiResponse,
		});

		await device.update();

		expect(device.data).toEqual(mockApiResponse);
	});

	it("should add a hook successfully", async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockData,
		});
		const device = await Device.init(mockAddress, mockOffset);

		const result = device.addHook(mockHook);
		expect(result).toEqual({ exitCode: 0, message: `Hook ${mockHook.name} added` });

		// check if the hooks set contains the new hook
		expect(device.hooks.size).toBe(1);

		expect(device.hooks.values().next().value.name).toBe(mockHook.name);
	});
});
