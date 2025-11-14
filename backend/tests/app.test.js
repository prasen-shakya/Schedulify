const request = require("supertest");
const app = require('../app.js');
//import * as test from "node:test";

describe('User Login/Registration', () => {
    // this is for tests regarding user account creation
    describe('POST /register', () => {

        /*
        test('returns 201 for successful account creation', async () => {
            const response = await request(app).post("/api/register").send({
                name: "John Doe",
                email: "jdoe@gmail.com",
                password: "password"
            })

         */

            /*
            expect(response.status).toBe(201);

        })

             */

        test('should return 400 because email already exists', async () => {
            const response = await request(app).post("/api/register").send({
                name: "John Doe",
                email: "jdoe@gmail.com",
                password: "password"
            })

            expect(response.status).toBe(400);

        })
    })

    describe('POST /login', () => {
        // this is for user login tests
        test('returns 200 for successful account creation', async () => {
            const response = await request(app).post("/api/login").send({
                name: "John Doe",
                email: "jdoe@gmail.com",
                password: "password"
            })

            expect(response.status).toBe(200);

        })
    })

})

/*
describe('Event Information', () => {

})

 */
const { pool, closePool} = require("../database");

afterAll(async () => {
    // Close the HTTP server *if* it was started

    //if (pool && typeof pool.end === "function") {
        console.log("closing database");
        await closePool();  // closes all DB connections

    //}

    //if (server && typeof server.close === "function") {
        console.log("closing server");
    //}
});

