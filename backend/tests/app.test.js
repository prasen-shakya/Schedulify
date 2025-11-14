const request = require("supertest");
const app = require("../app.js");
const { closePool } = require("../database");

describe("User Login/Registration", () => {
    // This is for tests regarding user account creation
    describe("POST /register", () => {
        // test("returns 201 for successful account creation", async () => {
        //     const response = await request(app).post("/api/register").send({
        //         name: "John Doe",
        //         email: "jdoe@gmail.com",
        //         password: "password",
        //     });

        //     expect(response.status).toBe(201);
        // });

        test("should return 400 because email already exists", async () => {
            const response = await request(app).post("/api/register").send({
                name: "John Doe",
                email: "jdoe@gmail.com",
                password: "password",
            });

            expect(response.status).toBe(400);
        });
    });

    describe("POST /login", () => {
        // This is for user login tests
        test("returns 200 for successful account creation", async () => {
            const response = await request(app).post("/api/login").send({
                name: "John Doe",
                email: "jdoe@gmail.com",
                password: "password",
            });

            expect(response.status).toBe(200);
        });
    });
});

// Close the HTTP server *if* it was started
afterAll(async () => {
    await closePool(); // Closes all DB connections
});
