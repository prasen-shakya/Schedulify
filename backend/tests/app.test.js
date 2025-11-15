const request = require("supertest");
const app = require("../app.js");
const { closePool } = require("../database");
const test = require("node:test");
const {response} = require("express");

describe("User Login/Registration", () => {
    // This is for tests regarding user account creation
    let cookie;

    describe("POST /register", () => {
        // test("Returns 201 for successful account creation.", async () => {
        //     const response = await request(app).post("/api/register").send({
        //         name: "John Doe",
        //         email: "jdoe@gmail.com",
        //         password: "password",
        //     });

        //     expect(response.status).toBe(201);
        // });

        test("Should return 400 because email already exists.", async () => {
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
        test("Returns 200 for successful login.", async () => {
            const response = await request(app).post("/api/login").send({
                email: "jdoe@gmail.com",
                password: "password",
            });

            cookie = response.cookie;

            expect(response.status).toBe(200);
        });

        // What happens when you give an invalid username.
        test("Should return 400 because email doesn't exists.", async () => {
            const response = await request(app).post("/api/login").send({
                email: "johnDoe@gmail.com",
                password: "password"
            });
            expect(response.status).toBe(400);
        })

        // What happens when you give the wrong password
        test("Should return 400 because password isn't correct.", async () => {
            const response = await request(app).post("/api/login").send({
                email: "jdoe@gmail.com",
                password: "password1"
            })
            expect(response.status).toBe(400);
        })
    });

    describe("POST /logout", () => {
        // Successful logout
        test("Should return 200 on successful logout", async () => {
            const response = await request(app).post("/api/logout").send({cookie});
        })

        expect(response.status).toBe(200);
    });
});

describe("Tests for User actions: Creating Events, Updating Availability.", () => {

    const login = request(app).post("/api/login").send({
        email: "jdoe@gmail.com",
        password: "password",
    })

    // Creating an Event:
    describe("Creating an event.", () => {
        test("Should return 201 for successful event creation.", async () => {
            const response = await request(app).post("/api/createEvent").send({
                name: "Game Night",
                description: "Let's play board games!",
                startDate: "2026-01-01",
                endDate: "2026-01-10",
                startTime: "9 am",
                endTime: "10 pm",

                user: {
                    userId: login.userId
                }
            });

            expect(response.status).toBe(201);
        });

        // Creating an event with a long name
        test("Should return 400 because name is too long.", async () => {
            const response = await request(app).post("/api/createEvent").send({
                name: "Game Night for fun gaming and gaming fun with a lot of fun games.",
                description: "Let's play board games!",
                startDate: "2026-01-01",
                endDate: "2026-01-10",
                startTime: "9 am",
                endTime: "10 pm",
                user: {
                    userId: login.userId
                }
            })

            expect(response.status).toBe(400);
            expect(response.body).toBe("Name must be less than 20 characters.");
        });

        // Creating an event with a long description
        test("Should return 400 because description is too long.", async () => {
            const response = await request(app).post("/api/createEvent").send({
                name: "Game Night for fun gaming and gaming fun with a lot of fun games.",
                description: "I’m curious what 150 words actually looks like on a page. I’m requiring my video production students to write a blog post each week for their 20 time projects. These blog posts need to have a least 150 words and an image that they have permission to use. When I first introduced this to the class last week and I mentioned 150 words, I could hear a corporate gasp. It was an utter shock. “Did he really say 150? That’s insane… 150 words is like an essay. It’s too much. How does he expect us to do that every week? Holy moly.” It was as if nearly every student thought that sounded like a short novel. I thought I’d set out to write 150 words in less than 5 minutes. Not only do I plan to write these words that quickly, I also will write them without much content. Done.",
                startDate: "2026-01-01",
                endDate: "2026-01-10",
                startTime: "9 am",
                endTime: "10 pm",
                user: {
                    userId: login.userId
                }
            });

            expect(response.status).toBe(400);
            expect(response.body).toBe("Description must be less than 150 characters!");
        });

        // Creating an event where the start and end dates are wrong
        test("Should return 400 because endDate ? startDate.", async () => {
            const response = await request(app).post("/api/createEvent").send({
                name: "Game Night",
                description: "Let's play board games!",
                startDate: "2026-01-10",
                endDate: "2026-01-01",
                startTime: "9 am",
                endTime: "10 pm",
                user: {
                    userId: login.userId
                }
            });

            expect(response.status).toBe(400);
            expect(response.body).toBe("End time cannot be before start time!");
        });
    });

})

// Close the HTTP server *if* it was started
afterAll(async () => {
    await closePool(); // Closes all DB connections
});
