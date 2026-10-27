import { config } from "../config/config.js";

export class UpstreamError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

/**
 * One small wrapper around fetch for every call to auth-service's /internal API.
 * Keeping it in ONE file means if the auth API changes, only this file changes.
 */
async function request(path, { method = "GET", body, query } = {}) {
    const url = new URL(path, config.AUTH_SERVICE_URL);

    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null && value !== "") {
                url.searchParams.set(key, String(value));
            }
        }
    }

    let res;
    try {
        res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "x-internal-key": config.INTERNAL_API_KEY,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(5000), // never hang forever on another service
        });
    } catch (err) {
        throw new UpstreamError(503, "Auth service unavailable");
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new UpstreamError(res.status, data.message || "Auth service error");
    }
    return data;
}

// encodeURIComponent: the id comes from the URL the client sent us. Never paste it raw.
const enc = encodeURIComponent;

export const listUsers = (query) => request("/internal/users", { query });
export const getUser = (id) => request(`/internal/users/${enc(id)}`);
export const updateUserRole = (id, role) =>
    request(`/internal/users/${enc(id)}/role`, { method: "PATCH", body: { role } });
export const revokeUserSessions = (id) =>
    request(`/internal/users/${enc(id)}/revoke-sessions`, { method: "POST" });
