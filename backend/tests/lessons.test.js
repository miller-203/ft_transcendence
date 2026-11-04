
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../src/app");

async function loginAsAdmin(agent) {
    const csrf = await agent.get("/auth/csrf-token");

    const response = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            email: process.env.TEST_ADMIN_EMAIL,
            password: process.env.TEST_ADMIN_PASSWORD
        });

    assert.equal(response.status, 200);

    const newCsrf = await agent.get("/auth/csrf-token");

    return newCsrf.body.csrfToken;
}

async function loginAsStudent(agent) {
    const csrf = await agent.get("/auth/csrf-token");

    const response = await agent
        .post("/auth/login")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            email: process.env.TEST_USER_EMAIL,
            password: process.env.TEST_USER_PASSWORD
        });

    assert.equal(response.status, 200);
}

test("loginAsAdmin helper works", async () => {
    const agent = request.agent(app);

    const token = await loginAsAdmin(agent);

    assert.equal(typeof token, "string");
    assert.ok(token.length > 0);

    const response = await agent.get("/courses/1/lessons");

    assert.equal(response.status, 200);
});

test("Guest cannot read a lesson", async () => {
    const response = await request(app)
        .get("/courses/1/lessons/1");

    assert.equal(response.status, 401);

    assert.deepEqual(response.body, {
        error: "Unauthorized"
    });
});

test("Student cannot list lessons", async () => {
    const agent = request.agent(app);

    await loginAsStudent(agent);

    const response = await agent.get("/courses/1/lessons");

    assert.equal(response.status, 403);
});

test("Guest cannot list lessons", async () => {
    const response = await request(app)
        .get("/courses/1/lessons");

    assert.equal(response.status, 401);

    assert.deepEqual(response.body, {
        error: "Unauthorized"
    });
});

test("Guest cannot create a lesson", async () => {
    const response = await request(app)
        .post("/courses/1/lessons")
        .send({
            title: "Introduction",
            content: "Test content."
        });

    assert.equal(response.status, 401);

    assert.deepEqual(response.body, {
        error: "Unauthorized"
    });
});

test("Student cannot create a lesson", async () => {
    const agent = request.agent(app);

    await loginAsStudent(agent);

    const csrf = await agent.get("/auth/csrf-token");

    const response = await agent
        .post("/courses/1/lessons")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            title: "Introduction",
            content: "Test content."
        });

    assert.equal(response.status, 403);
});

test("Guest cannot update a lesson", async () => {
    const response = await request(app)
        .patch("/courses/1/lessons/1")
        .send({
            title: "Updated Title"
        });

    assert.equal(response.status, 401);

    assert.deepEqual(response.body, {
        error: "Unauthorized"
    });
});

test("Student cannot update a lesson", async () => {
    const agent = request.agent(app);

    await loginAsStudent(agent);

    const csrf = await agent.get("/auth/csrf-token");

    const response = await agent
        .patch("/courses/1/lessons/1")
        .set("X-CSRF-Token", csrf.body.csrfToken)
        .send({
            title: "Updated Title"
        });

    assert.equal(response.status, 403);
});

test("Guest cannot delete a lesson", async () => {
    const response = await request(app)
        .delete("/courses/1/lessons/1");

    assert.equal(response.status, 401);

    assert.deepEqual(response.body, {
        error: "Unauthorized"
    });
});

test("Student cannot delete a lesson", async () => {
    const agent = request.agent(app);

    await loginAsStudent(agent);

    const csrf = await agent.get("/auth/csrf-token");

    const response = await agent
        .delete("/courses/1/lessons/1")
        .set("X-CSRF-Token", csrf.body.csrfToken);

    assert.equal(response.status, 403);
});

test("Admin cannot delete a lesson without CSRF", async () => {
    const agent = request.agent(app);

    await loginAsAdmin(agent);

    const response = await agent
        .delete("/courses/1/lessons/1");

    assert.equal(response.status, 403);
});

test("Admin cannot create a lesson without CSRF", async () => {
    const agent = request.agent(app);

    await loginAsAdmin(agent);

    const response = await agent
        .post("/courses/1/lessons")
        .send({
            title: "Introduction",
            content: "Test content."
        });

    assert.equal(response.status, 403);
});

test("Admin cannot update a lesson without CSRF", async () => {
    const agent = request.agent(app);

    await loginAsAdmin(agent);

    const response = await agent
        .patch("/courses/1/lessons/1")
        .send({
            title: "Updated Title"
        });

    assert.equal(response.status, 403);
});


test("Admin can create a lesson", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Lesson Test Course",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const response = await agent
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: "Introduction",
                content: "Welcome to this lesson."
            });

        assert.equal(response.status, 201);
        assert.equal(response.body.title, "Introduction");
        assert.equal(
            response.body.content,
            "Welcome to this lesson."
        );

    } finally {
        await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);
    }
});

test("Admin cannot create a lesson without a title", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Lesson Validation Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const response = await agent
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                content: "This lesson has no title."
            });

        assert.equal(response.status, 400);
        assert.deepEqual(response.body, {
            error: "Title and content are required"
        });

    } finally {
        const deleted = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});

test("Admin cannot create a lesson without content", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Lesson Validation Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const response = await agent
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: "Introduction"
            });

        assert.equal(response.status, 400);
        assert.deepEqual(response.body, {
            error: "Title and content are required"
        });

    } finally {
        const deleted = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});

test("Admin cannot create a lesson with an empty title", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Lesson Validation Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const response = await agent
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: "   ",
                content: "This lesson has a valid content field."
            });

        assert.equal(response.status, 400);
        assert.deepEqual(response.body, {
            error: "Bad Request"
        });

    } finally {
        const deleted = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});

test("Admin cannot create a lesson with empty content", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Lesson Validation Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const response = await agent
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: "Introduction",
                content: "   "
            });

        assert.equal(response.status, 400);
        assert.deepEqual(response.body, {
            error: "Bad Request"
        });

    } finally {
        const deleted = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});

test("Admin cannot create a lesson with a number as title", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Lesson Validation Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const response = await agent
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: 123,
                content: "Valid lesson content."
            });

        assert.equal(response.status, 400);
        assert.deepEqual(response.body, {
            error: "Bad Request"
        });

    } finally {
        const deleted = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});

test("Admin cannot create a lesson with a number as content", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Lesson Validation Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const response = await agent
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: "Introduction",
                content: 123
            });

        assert.equal(response.status, 400);
        assert.deepEqual(response.body, {
            error: "Bad Request"
        });

    } finally {
        const deleted = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});

test("Admin cannot create a lesson with an invalid course ID", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const response = await agent
        .post("/courses/abc/lessons")
        .set("X-CSRF-Token", token)
        .send({
            title: "Introduction",
            content: "Valid lesson content."
        });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
        error: "Bad Request"
    });
});

test("Admin cannot create a lesson for a missing course", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const response = await agent
        .post("/courses/999999999/lessons")
        .set("X-CSRF-Token", token)
        .send({
            title: "Introduction",
            content: "Valid lesson content."
        });

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, {
        error: "Course not found"
    });
});



test("Student receives 404 for a missing lesson", async () => {
    const agent = request.agent(app);

    await loginAsStudent(agent);

    const response = await agent
        .get("/courses/1/lessons/999999999");

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, {
        error: "Lesson not found"
    });
});

test("Student receives 400 for an invalid lesson ID", async () => {
    const agent = request.agent(app);

    await loginAsStudent(agent);

    const response = await agent
        .get("/courses/1/lessons/abc");

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
        error: "Invalid ID"
    });
});

test("Student receives 400 for an invalid course ID", async () => {
    const agent = request.agent(app);

    await loginAsStudent(agent);

    const response = await agent
        .get("/courses/abc/lessons/1");

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
        error: "Invalid ID"
    });
});

test("Student can read an existing lesson", async () => {
    // Admin creates a course and lesson.
    const admin = request.agent(app);
    const token = await loginAsAdmin(admin);

    const createdCourse = await admin
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Student Reading Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const createdLesson = await admin
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: "Introduction",
                content: "Welcome to the course."
            });

        assert.equal(createdLesson.status, 201);
        const lessonId = createdLesson.body.id;

        // Student uses a separate session.
        const student = request.agent(app);

        await loginAsStudent(student);

        const response = await student
            .get(`/courses/${courseId}/lessons/${lessonId}`);

        assert.equal(response.status, 200);
        assert.equal(response.body.id, lessonId);
        assert.equal(response.body.course_id, courseId);
        assert.equal(response.body.title, "Introduction");
        assert.equal(
            response.body.content,
            "Welcome to the course."
        );

    } finally {
        const deleted = await admin
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});

test("Student cannot read a lesson from another course", async () => {
    const admin = request.agent(app);
    const token = await loginAsAdmin(admin);

    const createdCourse = await admin
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Student Reading Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const createdLesson = await admin
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: "Introduction",
                content: "Welcome to the course."
            });

        assert.equal(createdLesson.status, 201);
        const lessonId = createdLesson.body.id;

        // Log in as a student using a separate session.
        const student = request.agent(app);

        await loginAsStudent(student);

        // Correct lesson ID, but wrong course ID.
        const response = await student
            .get(`/courses/999999999/lessons/${lessonId}`);

        assert.equal(response.status, 404);
        assert.deepEqual(response.body, {
            error: "Lesson not found"
        });

    } finally {
        const deleted = await admin
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});

test("Admin can list lessons", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Lessons List Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const createdLesson = await agent
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: "Introduction",
                content: "Welcome to the course."
            });

        assert.equal(createdLesson.status, 201);
        const lessonId = createdLesson.body.id;

        const response = await agent
            .get(`/courses/${courseId}/lessons`);

        assert.equal(response.status, 200);
        assert.ok(Array.isArray(response.body));

        const lesson = response.body.find(
            item => item.id === lessonId
        );

        assert.ok(lesson);
        assert.equal(lesson.title, "Introduction");
        assert.equal(lesson.course_id, courseId);

    } finally {
        const deleted = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});

test("Admin can list an empty course's lessons", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Empty Lessons Test Course",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const response = await agent
            .get(`/courses/${courseId}/lessons`);

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, []);

    } finally {
        const deleted = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});



test("Admin can update a lesson title", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Lesson Update Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const createdLesson = await agent
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: "Old Title",
                content: "Original content."
            });

        assert.equal(createdLesson.status, 201);
        const lessonId = createdLesson.body.id;

        // Update only the title.
        const response = await agent
            .patch(`/courses/${courseId}/lessons/${lessonId}`)
            .set("X-CSRF-Token", token)
            .send({
                title: "New Title"
            });

        assert.equal(response.status, 200);
        assert.equal(response.body.title, "New Title");

        // Content must remain unchanged.
        assert.equal(response.body.content, "Original content.");

    } finally {
        const deleted = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});

test("Admin can update lesson content", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Lesson Update Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const createdLesson = await agent
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: "Old Title",
                content: "Original content."
            });

        assert.equal(createdLesson.status, 201);
        const lessonId = createdLesson.body.id;

        // Update only the content.
        const response = await agent
            .patch(`/courses/${courseId}/lessons/${lessonId}`)
            .set("X-CSRF-Token", token)
            .send({
                content: "Updated lesson content."
            });

        assert.equal(response.status, 200);
        assert.equal(
            response.body.content,
            "Updated lesson content."
        );

        // Title must remain unchanged.
        assert.equal(response.body.title, "Old Title");

    } finally {
        const deleted = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});

test("Admin cannot update a lesson with an empty body", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Lesson Update Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const createdLesson = await agent
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: "Old Title",
                content: "Original content."
            });

        assert.equal(createdLesson.status, 201);
        const lessonId = createdLesson.body.id;

        const response = await agent
            .patch(`/courses/${courseId}/lessons/${lessonId}`)
            .set("X-CSRF-Token", token)
            .send({});

        assert.equal(response.status, 400);
        assert.deepEqual(response.body, {
            error: "Provide title or content"
        });

    } finally {
        const deleted = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});

test("Admin cannot update a lesson with an invalid title", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Lesson Update Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const createdLesson = await agent
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: "Old Title",
                content: "Original content."
            });

        assert.equal(createdLesson.status, 201);
        const lessonId = createdLesson.body.id;

        const response = await agent
            .patch(`/courses/${courseId}/lessons/${lessonId}`)
            .set("X-CSRF-Token", token)
            .send({
                title: "   "
            });

        assert.equal(response.status, 400);
        assert.deepEqual(response.body, {
            error: "Invalid title or content"
        });

    } finally {
        const deleted = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});

test("Admin cannot update a lesson with invalid content", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Lesson Update Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        const createdLesson = await agent
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: "Old Title",
                content: "Original content."
            });

        assert.equal(createdLesson.status, 201);
        const lessonId = createdLesson.body.id;

        const response = await agent
            .patch(`/courses/${courseId}/lessons/${lessonId}`)
            .set("X-CSRF-Token", token)
            .send({
                content: "   "
            });

        assert.equal(response.status, 400);
        assert.deepEqual(response.body, {
            error: "Invalid title or content"
        });

    } finally {
        const deleted = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);
    }
});

test("Admin cannot update a lesson with an invalid lesson ID", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const response = await agent
        .patch("/courses/1/lessons/abc")
        .set("X-CSRF-Token", token)
        .send({
            title: "Updated Title"
        });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
        error: "Invalid ID"
    });
});

test("Admin cannot update a lesson with an invalid course ID", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const response = await agent
        .patch("/courses/abc/lessons/1")
        .set("X-CSRF-Token", token)
        .send({
            title: "Updated Title"
        });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
        error: "Invalid ID"
    });
});

test("Admin cannot update a missing lesson", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const response = await agent
        .patch("/courses/1/lessons/999999999")
        .set("X-CSRF-Token", token)
        .send({
            title: "Updated Title"
        });

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, {
        error: "Lesson not found"
    });
});


test("Admin can delete a lesson", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    // Create a test course.
    const createdCourse = await agent
        .post("/courses")
        .set("X-CSRF-Token", token)
        .send({
            title: "Lesson Deletion Test",
            level: "beginner"
        });

    assert.equal(createdCourse.status, 201);
    const courseId = createdCourse.body.id;

    try {
        // Create a lesson.
        const createdLesson = await agent
            .post(`/courses/${courseId}/lessons`)
            .set("X-CSRF-Token", token)
            .send({
                title: "Lesson to Delete",
                content: "This lesson will be deleted."
            });

        assert.equal(createdLesson.status, 201);
        const lessonId = createdLesson.body.id;

        // Delete the lesson.
        const deleted = await agent
            .delete(`/courses/${courseId}/lessons/${lessonId}`)
            .set("X-CSRF-Token", token);

        assert.equal(deleted.status, 204);

        // Verify that the lesson no longer exists.
        const response = await agent
            .get(`/courses/${courseId}/lessons/${lessonId}`);

        assert.equal(response.status, 404);
        assert.deepEqual(response.body, {
            error: "Lesson not found"
        });

    } finally {
        // Clean up the test course.
        const cleanup = await agent
            .delete(`/courses/${courseId}`)
            .set("X-CSRF-Token", token);

        assert.equal(cleanup.status, 204);
    }
});

test("Admin cannot delete a missing lesson", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const response = await agent
        .delete("/courses/1/lessons/999999999")
        .set("X-CSRF-Token", token);

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, {
        error: "Lesson not found"
    });
});

test("Admin cannot delete a lesson with an invalid ID", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const response = await agent
        .delete("/courses/1/lessons/abc")
        .set("X-CSRF-Token", token);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
        error: "Invalid ID"
    });
});

test("Admin cannot delete a lesson with an invalid course ID", async () => {
    const agent = request.agent(app);
    const token = await loginAsAdmin(agent);

    const response = await agent
        .delete("/courses/abc/lessons/1")
        .set("X-CSRF-Token", token);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
        error: "Invalid ID"
    });
});

test("loginAsStudent helper works", async () => {
    const agent = request.agent(app);

    // Log in using the student helper.
    await loginAsStudent(agent);

    // Verify that the student is authenticated.
    const response = await agent.get("/users/me");

    assert.equal(response.status, 200);
});


