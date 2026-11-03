const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../src/app");

test("GET /users/me returns 401 without login", async () => {
    const response = await request(app)
        .get("/users/me");

    assert.equal(response.status, 401);

    assert.deepEqual(response.body, {
        error: "Unauthorized"
    });
});



test("POST /auth/logout returns 403 without CSRF token", async () => {
    const response = await request(app)
        .post("/auth/logout");

    assert.equal(response.status, 403);

    assert.deepEqual(response.body, {
        error: "Invalid CSRF token"
    });
});

    test("POST /auth/logout returns 403 with invalid CSRF token", async () => {
        const agent = request.agent(app);

        // First, create a session and get its CSRF token.
        await agent.get("/auth/csrf-token");

        // Send a different token using the same session.
        const response = await agent
            .post("/auth/logout")
            .set("X-CSRF-Token", "wrong-token");

        assert.equal(response.status, 403);

        assert.deepEqual(response.body, {
            error: "Invalid CSRF token"
        });
    });

    test("POST /auth/logout accepts a valid CSRF token", async () => {
    const agent = request.agent(app);

    // Get a CSRF token and keep the session cookie.
    const csrfResponse = await agent.get("/auth/csrf-token");

    // Read the token from the response.
    const token = csrfResponse.body.csrfToken;

    // Send the token with the same session.
    const response = await agent
        .post("/auth/logout")
        .set("X-CSRF-Token", token);

    assert.equal(response.status, 204);
});

test("POST /auth/login rejects empty credentials", async () => {
    const agent = request.agent(app);

    // Get a CSRF token first.
    const csrfResponse = await agent.get("/auth/csrf-token");
    const token = csrfResponse.body.csrfToken;

    // Try to log in with empty values.
    const response = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", token)
        .send({
            email: "",
            password: ""
        });

    assert.equal(response.status, 400);
});
test("POST /auth/login rejects wrong credentials", async () => {
    const agent = request.agent(app);

    // Get CSRF token.
    const csrfResponse = await agent.get("/auth/csrf-token");
    const token = csrfResponse.body.csrfToken;

    // Try to log in with incorrect credentials.
    const response = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", token)
        .send({
            email: "nobody@example.com",
            password: "WrongPassword123!"
        });

    assert.equal(response.status, 401);

    assert.deepEqual(response.body, {
        error: "Unauthorized"
    });
});

test("POST /auth/login creates a session", async () => {
    const agent = request.agent(app);

    // Step 1: Get a CSRF token.
    const csrfResponse = await agent.get("/auth/csrf-token");
    const token = csrfResponse.body.csrfToken;

    // Step 2: Login.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", token)
        .send({
            email: process.env.TEST_USER_EMAIL,
            password: process.env.TEST_USER_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    assert.equal(loginResponse.body.role, "student");
    assert.equal(loginResponse.body.password_hash, undefined);
    // Step 3: Check whether the session remembers us.
    const meResponse = await agent.get("/users/me");

    assert.equal(meResponse.status, 200);
    assert.equal(meResponse.body.email, process.env.TEST_USER_EMAIL);
});

test("Logout destroys the authenticated session", async () => {
    const agent = request.agent(app);

    // 1. Get a token before login.
    const firstCsrf = await agent.get("/auth/csrf-token");

    // 2. Login.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", firstCsrf.body.csrfToken)
        .send({
            email: process.env.TEST_USER_EMAIL,
            password: process.env.TEST_USER_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Check that we're logged in.
    const beforeLogout = await agent.get("/users/me");
    assert.equal(beforeLogout.status, 200);

    // 4. Get a NEW token because login regenerated the session.
    const secondCsrf = await agent.get("/auth/csrf-token");

    // 5. Logout.
    const logoutResponse = await agent
        .post("/auth/logout")
        .set("X-CSRF-Token", secondCsrf.body.csrfToken);

    assert.equal(logoutResponse.status, 204);

    // 6. Check that the old login no longer works.
    const afterLogout = await agent.get("/users/me");
    assert.equal(afterLogout.status, 401);
});

test("POST /auth/login returns admin role", async () => {
    const agent = request.agent(app);

    const csrfResponse = await agent.get("/auth/csrf-token");
    const token = csrfResponse.body.csrfToken;

    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", token)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);
    assert.equal(loginResponse.body.role, "admin");
    assert.equal(loginResponse.body.password_hash, undefined);
});