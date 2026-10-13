// Unit tests: no database, no server.
import { test } from "node:test";
import assert from "node:assert/strict";
import { text } from "../src/validate";
import { rateLimit } from "../src/rateLimit";

test("text(): trims, requires a value, caps the length", () => {
    assert.deepEqual(text("  hi  ", "content", 10), { value: "hi" });
    assert.ok("error" in text("   ", "content", 10));
    assert.ok("error" in text(undefined, "content", 10));
    assert.ok("error" in text(42, "content", 10));
    assert.ok("error" in text("x".repeat(11), "content", 10));
    assert.deepEqual(text("x".repeat(10), "content", 10), { value: "x".repeat(10) });
});

function fakeRes() {
    const res: any = { statusCode: 200, headers: {}, body: undefined };
    res.status = (c: number) => { res.statusCode = c; return res; };
    res.json = (b: unknown) => { res.body = b; return res; };
    res.setHeader = (k: string, v: string) => { res.headers[k] = v; };
    return res;
}

test("rateLimit(): lets `max` requests through per user, then answers 429", () => {
    const limit = rateLimit("test", 3, 60_000);
    let passed = 0;
    const call = (userId: string) => { const res = fakeRes(); limit({ userId } as any, res, () => { passed++; }); return res; };
    for (let i = 0; i < 3; i++) assert.equal(call("a").statusCode, 200);
    const blocked = call("a");
    assert.equal(blocked.statusCode, 429);
    assert.equal(blocked.body.code, "rate_limited");
    assert.ok(Number(blocked.headers["Retry-After"]) > 0);
    assert.equal(call("b").statusCode, 200, "another user has their own budget");
    assert.equal(passed, 4);
});
