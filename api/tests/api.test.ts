/**
 * Integration tests against a running API (npm start first). Base URL: API_URL (default http://localhost:3030).
 *
 * Signed-in checks run only when tokens are given, so the tests never create accounts:
 *   TEST_USER_TOKEN  access token of a normal member
 *   TEST_MOD_TOKEN   access token of a moderator
 * (in the browser console on the site: (await supabase.auth.getSession()).data.session.access_token,
 * or copy it from a request's Authorization header; tokens last about an hour).
 * These checks only send requests that the API rejects, so they change no data.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

const BASE = process.env.API_URL ?? "http://localhost:3030";
const USER = process.env.TEST_USER_TOKEN;
const MOD = process.env.TEST_MOD_TOKEN;
const NIL = "00000000-0000-0000-0000-000000000000";

async function call(path: string, opts: { method?: string; token?: string | undefined; json?: unknown } = {}) {
    const headers: Record<string, string> = {};
    if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
    if (opts.json !== undefined) headers["Content-Type"] = "application/json";
    const res = await fetch(BASE + path, { method: opts.method ?? "GET", headers, body: opts.json === undefined ? null : JSON.stringify(opts.json) });
    return { status: res.status, body: await res.json().catch(() => null) };
}

test("public reads answer 200", async () => {
    for (const path of ["/misc/categories", "/post/fetch", "/post/fetch/announcement", "/report/status", "/post/search?q=a"]) {
        assert.equal((await call(path)).status, 200, path);
    }
});

test("paged feed returns every post exactly once, in feed order", async () => {
    const all = (await call("/post/fetch")).body.map((p: any) => p.id);
    for (const size of [3, 7]) {
        const ids: string[] = [];
        let before: string | null = null;
        do {
            const page: any = (await call(`/post/fetch?limit=${size}${before ? `&before=${encodeURIComponent(before)}` : ""}`)).body;
            ids.push(...page.posts.map((p: any) => p.id));
            before = page.next_before;
        } while (before);
        assert.deepEqual(ids, all, `page size ${size}`);
    }
});

test("search ignores PostgREST syntax in the term", async () => {
    const r = await call(`/post/search?q=${encodeURIComponent("a,b(c)%*")}`);
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
});

test("malformed ids are a 400, not a database error", async () => {
    assert.equal((await call("/post/not-a-uuid/fetch")).status, 400);
    assert.equal((await call("/comment/fetch-many?pids=nope")).status, 400);
});

test("every write and private read needs a login (401)", async () => {
    const routes: [string, string][] = [
        ["POST", "/post/create"], ["PUT", `/post/${NIL}/edit`], ["DELETE", `/post/${NIL}/delete`],
        ["PUT", `/post/${NIL}/hide`], ["PUT", `/post/${NIL}/unhide`], ["POST", `/post/${NIL}/react`],
        ["POST", `/comment/${NIL}`], ["PUT", `/comment/${NIL}`], ["DELETE", `/comment/${NIL}`],
        ["POST", "/report/createticket"], ["PUT", `/report/post/${NIL}/status`],
        ["GET", "/report/fetch"], ["GET", "/report/history"], ["GET", "/report/mine"], ["GET", "/post/mine"], ["GET", "/post/hidden"],
        ["GET", "/notification/fetch/"], ["POST", "/notification/read-all"], ["PUT", "/user/me"], ["PUT", "/user/interests"],
        ["GET", "/admin/categories"], ["GET", "/admin/users"], ["PUT", `/admin/users/${NIL}/role`],
    ];
    for (const [method, path] of routes) {
        assert.equal((await call(path, { method, token: "not-a-token" })).status, 401, `${method} ${path}`);
    }
});

test("members cannot use moderator routes (403)", { skip: !USER && "set TEST_USER_TOKEN" }, async () => {
    const routes: [string, string][] = [
        ["GET", "/report/fetch"], ["GET", "/report/history"], ["GET", "/post/hidden"],
        ["PUT", `/post/${NIL}/hide`], ["PUT", `/post/${NIL}/unhide`], ["PUT", `/report/post/${NIL}/status`],
        ["GET", "/admin/categories"], ["GET", "/admin/users"], ["PUT", `/admin/users/${NIL}/role`],
    ];
    for (const [method, path] of routes) {
        assert.equal((await call(path, { method, token: USER, json: {} })).status, 403, `${method} ${path}`);
    }
});

test("members cannot edit or delete posts that do not exist or are not theirs", { skip: !USER && "set TEST_USER_TOKEN" }, async () => {
    const valid = { title: "t", content: "c", category_names: ["x"] };
    assert.equal((await call(`/post/${NIL}/edit`, { method: "PUT", token: USER, json: valid })).status, 404);
    assert.equal((await call(`/post/${NIL}/delete`, { method: "DELETE", token: USER })).status, 404);
    // Someone else's post: the newest post not written by this user, if there is one.
    const feed = (await call("/post/fetch", { token: USER })).body as any[];
    const other = feed.find((p) => !p.is_mine);
    if (other) {
        assert.equal((await call(`/post/${other.id}/edit`, { method: "PUT", token: USER, json: valid })).status, 403);
        assert.equal((await call(`/post/${other.id}/delete`, { method: "DELETE", token: USER })).status, 403);
    }
});

test("empty or oversized text is rejected (400)", { skip: !USER && "set TEST_USER_TOKEN" }, async () => {
    const post = ((await call("/post/fetch")).body as any[])[0];
    assert.equal((await call(`/comment/${post.id}`, { method: "POST", token: USER, json: { content: "   " } })).status, 400);
    assert.equal((await call(`/comment/${post.id}`, { method: "POST", token: USER, json: { content: "x".repeat(1001) } })).status, 400);
    assert.equal((await call("/user/me", { method: "PUT", token: USER, json: { display_name: "x" } })).status, 400);
    assert.equal((await call(`/post/${post.id}/edit`, { method: "PUT", token: USER, json: { title: "", content: "c", category_names: ["x"] } })).status, 400);
});

test("moderators may read the queue and the history", { skip: !MOD && "set TEST_MOD_TOKEN" }, async () => {
    assert.equal((await call("/report/fetch", { token: MOD })).status, 200);
    const h = await call("/report/history", { token: MOD });
    assert.equal(h.status, 200);
    assert.ok(Array.isArray(h.body.entries));
    assert.equal((await call(`/admin/users/${NIL}/role`, { method: "PUT", token: MOD, json: { is_mod: "yes" } })).status, 400);
});
