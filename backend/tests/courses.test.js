const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../src/app");

test("Student cannot create a course", async () => {
    const agent = request.agent(app);

    // 1. Get a CSRF token before login.
    const csrfResponse = await agent.get("/auth/csrf-token");

    // 2. Login as our student account.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrfResponse.body.csrfToken)
        .send({
            email: process.env.TEST_USER_EMAIL,
            password: process.env.TEST_USER_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get a new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");

    // 4. Try to create a course.
    const response = await agent
        .post("/courses")
        .set("X-CSRF-Token", newCsrf.body.csrfToken)
        .send({
            title: "Student Test Course",
            level: "beginner"
        });

    // 5. The server must reject the student.
    assert.equal(response.status, 403);
});

test("Admin can create a course", async () => {
    const agent = request.agent(app);

    // 1. Get a CSRF token.
    const csrfResponse = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrfResponse.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get a new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");

    let courseId;

    try {
        // 4. Create a course.
        const response = await agent
            .post("/courses")
            .set("X-CSRF-Token", newCsrf.body.csrfToken)
            .send({
                title: "Automated Admin Test Course",
                level: "beginner"
            });

        courseId = response.body.id;

        assert.equal(response.status, 201);
        assert.ok(courseId);

    } finally {
        // 5. Delete the course if it was created.
        if (courseId) {
            const deleteResponse = await agent
                .delete(`/courses/${courseId}`)
                .set("X-CSRF-Token", newCsrf.body.csrfToken);

            assert.equal(deleteResponse.status, 204);
        }
    }
});

test("Admin cannot create a course with an empty title", async () => {
    const agent = request.agent(app);

    // 1. Get CSRF token.
    const csrfResponse = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrfResponse.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");

    // 4. Send invalid course data.
    const response = await agent
        .post("/courses")
        .set("X-CSRF-Token", newCsrf.body.csrfToken)
        .send({
            title: "",
            level: "beginner"
        });

    // 5. Check validation.
    assert.equal(response.status, 400);

    assert.deepEqual(response.body, {
        error: "Title and level are required"
    });
});

test("Admin cannot create a course with invalid level", async () => {
    const agent = request.agent(app);

    // 1. Get CSRF token.
    const csrfResponse = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrfResponse.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");

    // 4. Send invalid course data.
    const response = await agent
        .post("/courses")
        .set("X-CSRF-Token", newCsrf.body.csrfToken)
        .send({
            title: "JavaScript Basics",
            level: "superhero"
        });

    // 5. Check validation.
    assert.equal(response.status, 400);

    assert.deepEqual(response.body, {
        error: "Bad request"
    });
});

test("Admin cannot create a course without a level", async () => {
    const agent = request.agent(app);

    // 1. Get CSRF token.
    const csrfResponse = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrfResponse.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");

    // 4. Send invalid course data.
    const response = await agent
        .post("/courses")
        .set("X-CSRF-Token", newCsrf.body.csrfToken)
        .send({
            title: "JavaScript Basics",
        });

    // 5. Check validation.
    assert.equal(response.status, 400);

    assert.deepEqual(response.body, {
        error: "Title and level are required"
    });
});


test("Admin cannot create a course with a number as title", async () => {
    const agent = request.agent(app);

    // 1. Get CSRF token.
    const csrfResponse = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrfResponse.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");

    // 4. Send invalid course data.
    const response = await agent
        .post("/courses")
        .set("X-CSRF-Token", newCsrf.body.csrfToken)
        .send({
            title: 123,
            level: "beginner"
        });

    // 5. Check validation.
    assert.equal(response.status, 400);

    assert.deepEqual(response.body, {
        error: "Bad request"
    });
});


test("Admin cannot create a course with only spaces as title", async () => {
    const agent = request.agent(app);

    // 1. Get CSRF token.
    const csrfResponse = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrfResponse.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");

    // 4. Send invalid course data.
    const response = await agent
        .post("/courses")
        .set("X-CSRF-Token", newCsrf.body.csrfToken)
        .send({
            title: "   ",
            level: "beginner"
        })

    // 5. Check validation.
    assert.equal(response.status, 400);

    assert.deepEqual(response.body, {
        error: "Bad request"
    });
});

test("Admin cannot create a course with a number as level", async () => {
    const agent = request.agent(app);

    // 1. Get CSRF token.
    const csrfResponse = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrfResponse.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");

    // 4. Send invalid course data.
    const response = await agent
        .post("/courses")
        .set("X-CSRF-Token", newCsrf.body.csrfToken)
        .send({
            title: "JavaScript Basics",
            level: "123"
        })

    // 5. Check validation.
    assert.equal(response.status, 400);

    assert.deepEqual(response.body, {
        error: "Bad request"
    });
});

test("Admin cannot create a course without a title", async () => {
    const agent = request.agent(app);

    // 1. Get CSRF token.
    const csrfResponse = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrfResponse.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");

    // 4. Send invalid course data.
    const response = await agent
        .post("/courses")
        .set("X-CSRF-Token", newCsrf.body.csrfToken)
        .send({
            level: "123"
        })

    // 5. Check validation.
    assert.equal(response.status, 400);

    assert.deepEqual(response.body, {
        error: "Title and level are required"
    });
});


test("GET /courses/:id rejects an invalid ID", async () => {
    const response = await request(app)
        .get("/courses/abc");

    assert.equal(response.status, 400);

    assert.deepEqual(response.body, {
        error: "Bad request"
    });
});

test("GET /courses/:id returns 404 for a missing course", async () => {
    const response = await request(app)
        .get("/courses/999999999");

    assert.equal(response.status, 404);

    assert.deepEqual(response.body, {
        error: "course not found"
    });
});

test("GET /courses/:id returns an existing course", async () => {
    const agent = request.agent(app);

    // 1. Get a CSRF token.
    const csrf = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get a new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");

    let courseId;

    try {
        // 4. Create a course for testing.
        const created = await agent
            .post("/courses")
            .set("X-CSRF-Token", newCsrf.body.csrfToken)
            .send({
                title: "Read Test Course",
                level: "beginner"
            });

        assert.equal(created.status, 201);
        courseId = created.body.id;
        assert.ok(courseId);

        // 5. Read the course using its ID.
        const response = await agent.get(`/courses/${courseId}`);

        assert.equal(response.status, 200);
        assert.equal(response.body.id, courseId);
        assert.equal(response.body.title, "Read Test Course");

    } finally {
        // 6. Remove the test course.
        if (courseId) {
            const deleted = await agent
                .delete(`/courses/${courseId}`)
                .set("X-CSRF-Token", newCsrf.body.csrfToken);

            assert.equal(deleted.status, 204);
        }
    }
});

test("Admin can update a course title", async () => {
    const agent = request.agent(app);

    // 1. Get CSRF token before login.
    const csrf = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get a new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");
    const token = newCsrf.body.csrfToken;

    let courseId;

    try {
        // 4. Create a course.
        const created = await agent
            .post("/courses")
            .set("X-CSRF-Token", token)
            .send({
                title: "JavaScript Basics",
                level: "beginner"
            });

        assert.equal(created.status, 201);
        courseId = created.body.id;
        assert.ok(courseId);

        // 5. Update only the title.
        const updated = await agent
            .patch(`/courses/${courseId}`)
            .set("X-CSRF-Token", token)
            .send({
                title: "Advanced JavaScript"
            });

        // 6. Check the result.
        assert.equal(updated.status, 200);
        assert.equal(updated.body.title, "Advanced JavaScript");
        assert.equal(updated.body.level, "beginner");

    } finally {
        // 7. Delete the test course.
        if (courseId) {
            const deleted = await agent
                .delete(`/courses/${courseId}`)
                .set("X-CSRF-Token", token);

            assert.equal(deleted.status, 204);
        }
    }
});


test("Admin can update a course level", async () => {
    const agent = request.agent(app);

    // 1. Get CSRF token before login.
    const csrf = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get a new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");
    const token = newCsrf.body.csrfToken;

    let courseId;

    try {
        // 4. Create a course.
        const created = await agent
            .post("/courses")
            .set("X-CSRF-Token", token)
            .send({
                title: "JavaScript Basics",
                level: "beginner"
            });

        assert.equal(created.status, 201);
        courseId = created.body.id;
        assert.ok(courseId);

        // 5. Update only the title.
        const updated = await agent
            .patch(`/courses/${courseId}`)
            .set("X-CSRF-Token", token)
            .send({
                level: "intermediate"
            })

        // 6. Check the result.
        assert.equal(updated.status, 200);
        assert.equal(updated.body.title, "JavaScript Basics");
        assert.equal(updated.body.level, "intermediate");

    } finally {
        // 7. Delete the test course.
        if (courseId) {
            const deleted = await agent
                .delete(`/courses/${courseId}`)
                .set("X-CSRF-Token", token);

            assert.equal(deleted.status, 204);
        }
    }
});

test("Admin cannot update a course with an empty body", async () => {
    const agent = request.agent(app);

    // 1. Get CSRF token before login.
    const csrf = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get a new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");
    const token = newCsrf.body.csrfToken;

    let courseId;

    try {
        // 4. Create a course.
        const created = await agent
            .post("/courses")
            .set("X-CSRF-Token", token)
            .send({
                title: "JavaScript Basics",
                level: "beginner"
            });

        assert.equal(created.status, 201);
        courseId = created.body.id;
        assert.ok(courseId);

        // 5. Update only the title.
        const updated = await agent
            .patch(`/courses/${courseId}`)
            .set("X-CSRF-Token", token)
            .send({})

        // 6. Check the result.
        assert.equal(updated.status, 400);

        assert.deepEqual(updated.body, {
            error: "At least one field is required"
        });

    } finally {
        // 7. Delete the test course.
        if (courseId) {
            const deleted = await agent
                .delete(`/courses/${courseId}`)
                .set("X-CSRF-Token", token);

            assert.equal(deleted.status, 204);
        }
    }
});


test("Admin cannot update a course with an invalid level", async () => {
    const agent = request.agent(app);

    // 1. Get CSRF token before login.
    const csrf = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get a new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");
    const token = newCsrf.body.csrfToken;

    let courseId;

    try {
        // 4. Create a VALID course first.
        const created = await agent
            .post("/courses")
            .set("X-CSRF-Token", token)
            .send({
                title: "JavaScript Basics",
                level: "beginner"
            });

        assert.equal(created.status, 201);
        courseId = created.body.id;
        assert.ok(courseId);

        // 5. Try to update with an INVALID level.
        const updated = await agent
            .patch(`/courses/${courseId}`)
            .set("X-CSRF-Token", token)
            .send({
                level: "superhero"
            });

        // 6. Expect validation to reject the update.
        assert.equal(updated.status, 400);

        assert.deepEqual(updated.body, {
            error: "bad request"
        });

    } finally {
        // 7. Delete the test course.
        if (courseId) {
            const deleted = await agent
                .delete(`/courses/${courseId}`)
                .set("X-CSRF-Token", token);

            assert.equal(deleted.status, 204);
        }
    }
});

test("Admin cannot update a missing course", async () => {
    const agent = request.agent(app);

    // 1. Get CSRF token before login.
    const csrf = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get a new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");
    const token = newCsrf.body.csrfToken;

    let courseId;

    try {
        // 4. Create a VALID course first.
        const updated = await agent
            .patch("/courses/999999999")
            .set("X-CSRF-Token", token)
            .send({
                title: "Updated Course"
            });

            assert.equal(updated.status, 404);

            assert.deepEqual(updated.body, {
                error: "course not found"
            });

    } finally {
        // 7. Delete the test course.
        if (courseId) {
            const deleted = await agent
                .delete(`/courses/${courseId}`)
                .set("X-CSRF-Token", token);

            assert.equal(deleted.status, 204);
        }
    }
});

test("Admin cannot delete a missing course", async () => {
    const agent = request.agent(app);

    // 1. Get a CSRF token.
    const csrf = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get a new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");

    // 4. Try to delete a course that does not exist.
    const response = await agent
        .delete("/courses/999999999")
        .set("X-CSRF-Token", newCsrf.body.csrfToken);

    // 5. Check the response.
    assert.equal(response.status, 404);

    assert.deepEqual(response.body, {
        error: "Course not found"
    });
});



test("Admin cannot delete a course with an invalid ID", async () => {
    const agent = request.agent(app);

    // 1. Get a CSRF token.
    const csrf = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get a new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");

    // 4. Try to delete a course that does not exist.
    const response = await agent
        .delete("/courses/abc")
        .set("X-CSRF-Token", newCsrf.body.csrfToken);

    // 5. Check the response.
    assert.equal(response.status, 400);

    assert.deepEqual(response.body, {
        error: "bad request"
    });
});


test("Admin can delete a course", async () => {
    const agent = request.agent(app);

    // 1. Get a CSRF token before login.
    const csrf = await agent.get("/auth/csrf-token");

    // 2. Login as admin.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Get a new CSRF token after login.
    const newCsrf = await agent.get("/auth/csrf-token");
    const token = newCsrf.body.csrfToken;

    let courseId;
    let deletedSuccessfully = false;

    try {
        // 4. Create a course for testing.
        const created = await agent
            .post("/courses")
            .set("X-CSRF-Token", token)
            .send({
                title: "Delete Test Course",
                level: "beginner"
            });

        assert.equal(created.status, 201);

        courseId = created.body.id;
        assert.ok(courseId);

        // 5. Delete the course.
        const deleted = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
        deletedSuccessfully = true;

        // 6. Try to read the deleted course.
        const response = await agent
            .get(`/courses/${courseId}`);

        // 7. The course should no longer exist.
        assert.equal(response.status, 404);

        assert.deepEqual(response.body, {
            error: "course not found"
        });

    } finally {
        // Clean up only if the course still exists.
        if (courseId && !deletedSuccessfully) {
            await agent
                .delete(`/courses/${courseId}`)
                .set("X-CSRF-Token", token);
        }
    }
});


test("Student cannot delete a course", async () => {
    const agent = request.agent(app);

    // 1. Get a CSRF token.
    const csrf = await agent.get("/auth/csrf-token");

    // 2. Login as student.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            email: process.env.TEST_USER_EMAIL,
            password: process.env.TEST_USER_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Try to delete a course.
    const response = await agent
        .delete("/courses/1");

    // 4. Student must be rejected.
    assert.equal(response.status, 403);
});


test("Student cannot update a course", async () => {
    const agent = request.agent(app);

    // 1. Get a CSRF token.
    const csrf = await agent.get("/auth/csrf-token");

    // 2. Login as student.
    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            email: process.env.TEST_USER_EMAIL,
            password: process.env.TEST_USER_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // 3. Try to update a course.
    const response = await agent
        .patch("/courses/1")
        .send({
            title: "Changed by Student"
        });

    // 4. The student must be rejected.
    assert.equal(response.status, 403);
});

test("Guest cannot update a course", async () => {
    const response = await request(app)
        .patch("/courses/1")
        .send({
            title: "Changed by Guest"
        });

    assert.equal(response.status, 401);

    assert.deepEqual(response.body, {
        error: "Unauthorized"
    });
});

test("Guest cannot delete a course", async () => {
    const response = await request(app)
        .delete("/courses/1");

    assert.equal(response.status, 401);

    assert.deepEqual(response.body, {
        error: "Unauthorized"
    });
});

test("Guest cannot create a course", async () => {
    const response = await request(app)
        .post("/courses")
        .send({
            title: "Guest Course",
            level: "beginner"
        });

    assert.equal(response.status, 401);

    assert.deepEqual(response.body, {
        error: "Unauthorized"
    });
});

test("Admin can filter courses by level", async () => {
    const agent = request.agent(app);

    const csrfResponse = await agent.get("/auth/csrf-token");

    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrfResponse.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    const response = await agent.get("/courses?level=beginner");

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));

    for (const course of response.body) {
        assert.equal(course.level, "beginner");
    }
});

test("Admin filters actual courses by level", async () => {
    const agent = request.agent(app);

    const csrfResponse = await agent.get("/auth/csrf-token");

    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrfResponse.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    // CSRF token jdid men ba3d login.
    const newCsrf = await agent.get("/auth/csrf-token");
    const token = newCsrf.body.csrfToken;

    // Create two courses with different levels.
    const beginner = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Filtering Beginner Test",
            level: "beginner"
        });

    const advanced = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Filtering Advanced Test",
            level: "advanced"
        });

    assert.equal(beginner.status, 201);
    assert.equal(advanced.status, 201);

    const response = await agent.get("/courses?level=beginner");

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));

    // Beginner course khaso yban.
    assert.ok(
        response.body.some(course => course.id === beginner.body.id)
    );

    // Advanced course makhasoch yban.
    assert.ok(
        !response.body.some(course => course.id === advanced.body.id)
    );

    // Cleanup test data.
    const deleteBeginner = await agent
        .delete(`/courses/${beginner.body.id}`)
        .set("X-CSRF-Token", token);

    const deleteAdvanced = await agent
        .delete(`/courses/${advanced.body.id}`)
        .set("X-CSRF-Token", token);

    assert.equal(deleteBeginner.status, 204);
    assert.equal(deleteAdvanced.status, 204);
});
test("Admin can search courses by title", async () => {
    const agent = request.agent(app);

    const csrfResponse = await agent.get("/auth/csrf-token");

    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrfResponse.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    const newCsrf = await agent.get("/auth/csrf-token");
    const token = newCsrf.body.csrfToken;

    let courseId;

    try {
        const created = await agent
            .post("/courses")
            .set("X-CSRF-Token", token)
            .send({
                title: "Unique Search Test Course",
                level: "beginner"
            });

        assert.equal(created.status, 201);
        courseId = created.body.id;

        const response = await agent.get(
            "/courses?search=unique%20search%20test"
        );

        assert.equal(response.status, 200);
        assert.ok(Array.isArray(response.body));

        assert.ok(
            response.body.some(course => course.id === courseId)
        );
    } finally {
        if (courseId !== undefined) {
            await agent
                .delete(`/courses/${courseId}`)
                .set("X-CSRF-Token", token);
        }
    }
});

test("Admin can sort courses by title ascending", async () => {
    const agent = request.agent(app);

    const csrfResponse = await agent.get("/auth/csrf-token");

    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrfResponse.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    const response = await agent.get(
        "/courses?sort=title&order=asc"
    );

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));

    const titles = response.body.map(course => course.title);

    const sortedTitles = [...titles].sort((a, b) =>
        a.localeCompare(b)
    );

    assert.deepEqual(titles, sortedTitles);
});

test("Admin can paginate courses", async () => {
    const agent = request.agent(app);

    const csrfResponse = await agent.get("/auth/csrf-token");

    const loginResponse = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrfResponse.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(loginResponse.status, 200);

    const response = await agent.get(
        "/courses?page=1&limit=2"
    );

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));
    assert.ok(response.body.length <= 2);
});

test("Admin pagination returns different pages", async () => {
    const agent = request.agent(app);

    const csrf = await agent.get("/auth/csrf-token");

    const login = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(login.status, 200);

    const freshCsrf = await agent.get("/auth/csrf-token");
    const token = freshCsrf.body.csrfToken;

    const createdIds = [];

    try {
        for (const title of [
            "Pagination Alpha Test",
            "Pagination Bravo Test",
            "Pagination Charlie Test"
        ]) {
            const response = await agent
                .post("/courses")
                .set("X-CSRF-Token", token)
                .send({ title, level: "beginner" });

            assert.equal(response.status, 201);
            createdIds.push(response.body.id);
        }

        const page1 = await agent.get(
            "/courses?search=Pagination&sort=title&order=asc&page=1&limit=2"
        );

        const page2 = await agent.get(
            "/courses?search=Pagination&sort=title&order=asc&page=2&limit=2"
        );

        assert.equal(page1.status, 200);
        assert.equal(page2.status, 200);

        assert.ok(Array.isArray(page1.body));
        assert.ok(Array.isArray(page2.body));

        assert.equal(page1.body.length, 2);
        assert.ok(page2.body.length >= 1);

        const page1Ids = page1.body.map(course => course.id);
        const page2Ids = page2.body.map(course => course.id);

        for (const id of createdIds) {
            assert.ok(
                page1Ids.includes(id) || page2Ids.includes(id)
            );
        }

        for (const id of page1Ids) {
            assert.ok(!page2Ids.includes(id));
        }
    } finally {
        for (const id of createdIds) {
            await agent
                .delete(`/courses/${id}`)
                .set("X-CSRF-Token", token);
        }
    }
});