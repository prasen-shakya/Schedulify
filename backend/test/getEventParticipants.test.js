const request = require("supertest");

// 🧩 Mocks must come FIRST — before requiring ../app
jest.mock("../database", () => ({
    getDbConnection: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
    verify: jest.fn().mockReturnValue({ userId: "123" }), // always passes auth
}));

// ✅ Import app + server AFTER mocks are set up
const { app } = require("../app");
const { getDbConnection } = require("../database");

// 🧹 Optional: silence console logs during tests for cleaner output
beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
    console.log.mockRestore();
    console.error.mockRestore();
});

describe("GET /api/getEventParticipants", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 404 when no participants are found", async () => {
        const fakeQuery = jest.fn().mockResolvedValue([[]]);
        getDbConnection.mockResolvedValue({ query: fakeQuery });

        const res = await request(app)
            .get("/api/getEventParticipants")
            .set("Cookie", ["token=faketoken"]) // needed to pass auth
            .send({ eventID: "event123" }); // route uses body even though it's GET

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/Event not found/i);
    });

    it("should return 200 and a list of participants", async () => {
        const fakeRows = [
            { UserID: 1, Name: "Alice" },
            { UserID: 2, Name: "Bob" },
        ];
        const fakeQuery = jest.fn().mockResolvedValue([fakeRows]);
        getDbConnection.mockResolvedValue({ query: fakeQuery });

        const res = await request(app)
            .get("/api/getEventParticipants")
            .set("Cookie", ["token=faketoken"])
            .send({ eventID: "event123" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual(fakeRows);
    });

    it("should return 400 when the DB query throws an error", async () => {
        const fakeQuery = jest.fn().mockRejectedValue(new Error("DB failed"));
        getDbConnection.mockResolvedValue({ query: fakeQuery });

        const res = await request(app)
            .get("/api/getEventParticipants")
            .set("Cookie", ["token=faketoken"])
            .send({ eventID: "event123" });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain("DB failed");
    });
});

