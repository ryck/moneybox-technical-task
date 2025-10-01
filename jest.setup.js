import "@testing-library/jest-dom";

// Polyfill Web APIs for Next.js API route testing
import { TextEncoder, TextDecoder } from "util";
import "whatwg-fetch";

// Make these available globally
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock NextResponse and NextRequest for API route testing
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data, init = {}) => {
      const status = init?.status || 200;
      return {
        json: async () => data,
        status: status,
        headers: new Headers(init?.headers || {}),
        ok: status >= 200 && status < 300,
        statusText:
          status === 200
            ? "OK"
            : status === 503
              ? "Service Unavailable"
              : "Error",
      };
    },
  },
  NextRequest: class MockNextRequest {
    constructor(input, init = {}) {
      this.url = typeof input === "string" ? input : input.url;
      this.method = init.method || "GET";
      this.headers = new Headers(init.headers);
      this.body = init.body;
      this._bodyUsed = false;
    }

    async json() {
      if (this._bodyUsed) throw new Error("Body already read");
      this._bodyUsed = true;
      try {
        return JSON.parse(this.body || "{}");
      } catch {
        throw new Error("Invalid JSON in request body");
      }
    }

    async text() {
      if (this._bodyUsed) throw new Error("Body already read");
      this._bodyUsed = true;
      return this.body || "";
    }
  },
}));

// Mock Request and Response for API route tests
if (typeof global.Request === "undefined") {
  global.Request = class MockRequest {
    constructor(input, init = {}) {
      this.url = typeof input === "string" ? input : input.url;
      this.method = init.method || "GET";
      this.headers = new Headers(init.headers);
      this.body = init.body;
      this._bodyUsed = false;
    }

    async json() {
      if (this._bodyUsed) throw new Error("Body already read");
      this._bodyUsed = true;
      return JSON.parse(this.body || "{}");
    }

    async text() {
      if (this._bodyUsed) throw new Error("Body already read");
      this._bodyUsed = true;
      return this.body || "";
    }
  };
}

if (typeof global.Response === "undefined") {
  global.Response = class MockResponse {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || "OK";
      this.headers = new Headers(init.headers);
      this.ok = this.status >= 200 && this.status < 300;
    }

    async json() {
      return JSON.parse(this.body || "{}");
    }

    async text() {
      return this.body || "";
    }

    static json(data, init = {}) {
      return new MockResponse(JSON.stringify(data), {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...init.headers,
        },
      });
    }
  };
}

if (typeof global.Headers === "undefined") {
  global.Headers = class MockHeaders {
    constructor(init) {
      this._headers = {};
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => {
            this._headers[key.toLowerCase()] = value;
          });
        } else if (typeof init === "object") {
          Object.entries(init).forEach(([key, value]) => {
            this._headers[key.toLowerCase()] = value;
          });
        }
      }
    }

    get(name) {
      return this._headers[name.toLowerCase()];
    }

    set(name, value) {
      this._headers[name.toLowerCase()] = value;
    }

    has(name) {
      return name.toLowerCase() in this._headers;
    }

    delete(name) {
      delete this._headers[name.toLowerCase()];
    }

    *[Symbol.iterator]() {
      for (const [key, value] of Object.entries(this._headers)) {
        yield [key, value];
      }
    }
  };
}
