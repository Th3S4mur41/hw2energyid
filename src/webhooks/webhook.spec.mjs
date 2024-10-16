// src/webhook.test.mjs
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Webhook } from "./webhook.mjs";

globalThis.fetch = vi.fn();

describe("Webhook", () => {
	const mockName = "TestWebhook";
	const mockUrl = "https://example.com/webhook";
	const mockMethod = "POST";
	const mockData = JSON.stringify({ remoteName: "TestData" });

	beforeEach(() => {
		fetch.mockReset();
	});

	it("should initialize successfully with valid data", () => {
		const webhook = new Webhook(mockName, mockUrl, mockMethod);

		expect(webhook).toBeInstanceOf(Webhook);
		expect(webhook.name).toBe(mockName);
		expect(webhook.url).toBe(mockUrl);
		expect(webhook.method).toBe(mockMethod);
	});

	it("should default to GET method if invalid method is provided", () => {
		const invalidMethod = "INVALID";
		const webhook = new Webhook(mockName, mockUrl, invalidMethod);

		expect(webhook.method).toBe("GET");
	});

	it("should send data successfully", async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ success: true }),
		});

		const webhook = new Webhook(mockName, mockUrl, mockMethod);

		await webhook.send(mockData);

		expect(fetch).toHaveBeenCalledWith(mockUrl, {
			method: mockMethod,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: mockData,
		});
	});

	it("should handle data sending failure", async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
		});

		const webhook = new Webhook(mockName, mockUrl, mockMethod);

		await expect(webhook.send(mockData)).rejects.toThrow("Failed to send data");

		expect(fetch).toHaveBeenCalledWith(mockUrl, {
			method: mockMethod,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: mockData,
		});
	});
});
