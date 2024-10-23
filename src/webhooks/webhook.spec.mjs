// src/webhook.test.mjs
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Webhook } from "./webhook.mjs";

globalThis.fetch = vi.fn();

describe("Webhook", () => {
	const mockName = "TestWebhook";
	const mockUrl = "https://example.com/webhook";
	const mockMethod = "POST";
	const mockMapping = {
		key1: "${value1}",
		key2: "${value2}",
	};
	const mockData = {
		value1: "data1",
		value2: "data2",
	};

	beforeEach(() => {
		fetch.mockReset();
	});

	it("should initialize successfully with valid data", () => {
		const webhook = new Webhook(mockName, mockUrl, mockMethod, mockMapping);

		expect(webhook).toBeInstanceOf(Webhook);
		expect(webhook.name).toBe(mockName);
		expect(webhook.url).toBe(mockUrl);
		expect(webhook.method).toBe(mockMethod);
	});

	it("should default to GET method if invalid method is provided", () => {
		const invalidMethod = "INVALID";
		const webhook = new Webhook(mockName, mockUrl, invalidMethod, mockMapping);

		expect(webhook.method).toBe("GET");
	});

	it("should send data successfully", async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ success: true }),
		});

		const webhook = new Webhook(mockName, mockUrl, mockMethod, mockMapping);

		const result = await webhook.send(mockData);

		expect(fetch).toHaveBeenCalledWith(mockUrl, {
			method: mockMethod,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				key1: "data1",
				key2: "data2",
			}),
		});
		expect(result).toEqual({ exitCode: 0, message: "Data sent successfully" });
	});

	it("should handle data sending failure", async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
		});

		const webhook = new Webhook(mockName, mockUrl, mockMethod, mockMapping);

		const result = await webhook.send(mockData);

		expect(fetch).toHaveBeenCalledWith(mockUrl, {
			method: mockMethod,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				key1: "data1",
				key2: "data2",
			}),
		});
		expect(result).toEqual({ exitCode: 1, message: "Failed to send data: Internal Server Error" });
	});

	it("should log data instead of sending when dryRun is true", async () => {
		const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		const webhook = new Webhook(mockName, mockUrl, mockMethod, mockMapping);

		const result = await webhook.send(mockData, true);

		expect(consoleLogSpy).toHaveBeenCalledWith(
			`[${mockName}] Would send ${JSON.stringify({
				key1: "data1",
				key2: "data2",
			})}...`,
		);
		expect(result).toEqual({ exitCode: 0, message: "" });

		consoleLogSpy.mockRestore();
	});
});
