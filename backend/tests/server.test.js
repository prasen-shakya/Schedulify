/**
 * MOCK DATABASE
 */
jest.mock("../config/database", () => {
  // Track USERS for tests
  let users = [];

  const mockQuery = jest.fn(async (sql, params) => {
    if (sql.includes("FROM User WHERE Email = ?")) {
      const email = params[0];
      const found = users.filter((u) => u.Email === email);
      return [found];
    }

    // ----- INSERT INTO User (Name, Email, Password) -----
    if (sql.startsWith("INSERT INTO User")) {
      const [name, email, password] = params;
      const newUser = {
        UserID: users.length + 1,
        Name: name,
        Email: email,
        Password: password,
      };
      users.push(newUser);
      return [{ insertId: newUser.UserID }];
    }

    // Default empty result for everything else
    return [[]];
  });

  return {
    getDbConnection: jest.fn(async () => {
      return {
        query: mockQuery,
      };
    }),
    closePool: jest.fn(async () => {}),
  };
});

/**
 * MOCK BCRYPT
 */
jest.mock("bcrypt", () => ({
  hash: jest.fn(async (pw) => `hashed-${pw}`),
  compare: jest.fn(async (pw, hashed) => hashed === `hashed-${pw}`),
}));

const request = require("supertest");
const { closePool } = require("../config/database.js");
const app = require("../server.js");

let authCookie;
let userID;

describe("User Login/Registration", () => {
  // This is for tests regarding user account creation

  describe("POST /register", () => {
    test("Returns 201 for successful account creation.", async () => {
      const res = await request(app).post("/api/register").send({
        name: "John Doe",
        email: "jdoe@gmail.com",
        password: "password",
      });

      userID = res.body.userId;

      expect(res.status).toBe(201);
    });

    test("Should return 400 because email already exists.", async () => {
      const res = await request(app).post("/api/register").set("Content-Type", "application/json").send({
        name: "John Doe",
        email: "jdoe@gmail.com",
        password: "password",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /login", () => {
    // This is for user login tests

    test("Should return 400 because email doesn't exists.", async () => {
      const res = await request(app).post("/api/login").set("Content-Type", "application/json").send({
        email: "johnDoe@gmail.com",
        password: "password",
      });

      expect(res.status).toBe(400);
    });

    // What happens when you give the wrong password
    test("Should return 400 because password isn't correct.", async () => {
      const res = await request(app).post("/api/login").set("Content-Type", "application/json").send({
        email: "jdoe@gmail.com",
        password: "password1",
      });
      expect(res.status).toBe(400);
    });
  });

  test("Returns 200 for successful login.", async () => {
    const res = await request(app).post("/api/login").set("Content-Type", "application/json").send({
      email: "jdoe@gmail.com",
      password: "password",
    });

    authCookie = res.headers["set-cookie"];
    expect(res.status).toBe(200);
  });

  describe("POST /logout", () => {
    // Successful logout
    test("Should return 200 on successful logout", async () => {
      const res = await request(app).post("/api/logout").set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({ message: "Logged out successfully." }));
    });
  });
});

describe("Tests for User actions: Creating Events, Updating Availability.", () => {
  describe("POST /login", () => {
    test("Should return 200 because successful login.", async () => {
      const res = await request(app).post("/api/login").set("Cookie", authCookie).send({
        email: "jdoe@gmail.com",
        password: "password",
      });

      // Save cookie for later tests
      authCookie = res.headers["set-cookie"];
      userID = res.body.userId;

      expect(res.status).toBe(200);
    });
  });

  // Creating an Event:
  describe("Creating an event.", () => {
    // Creating an event with a long name
    test("Should return 400 because name is too long.", async () => {
      const res = await request(app).post("/api/createEvent").set("Cookie", authCookie).set("Content-Type", "application/json").send({
        name: "Game Night for fun gaming and gaming fun with a lot of fun games.",
        description: "Let's play board games!",
        startDate: "2026-01-01",
        endDate: "2026-01-10",
        startTime: "09:00:00",
        endTime: "22:00:00",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Name must be less than 20 characters.");
    });

    // Creating an event with a long description
    test("Should return 400 because description is too long.", async () => {
      const res = await request(app).post("/api/createEvent").set("Cookie", authCookie).set("Content-Type", "application/json").send({
        name: "Game Night",
        description:
          "I’m curious what 150 words actually looks like on a page. I’m requiring my video production students to write a blog post each week for their 20 time projects. These blog posts need to have a least 150 words and an image that they have permission to use. When I first introduced this to the class last week and I mentioned 150 words, I could hear a corporate gasp. It was an utter shock. “Did he really say 150? That’s insane… 150 words is like an essay. It’s too much. How does he expect us to do that every week? Holy moly.” It was as if nearly every student thought that sounded like a short novel. I thought I’d set out to write 150 words in less than 5 minutes. Not only do I plan to write these words that quickly, I also will write them without much content. Done.",
        startDate: "2026-01-01",
        endDate: "2026-01-10",
        startTime: "09:00:00",
        endTime: "22:00:00",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Description must be less than 150 characters!");
    });

    // Creating an event where the start and end dates are wrong
    test("Should return 400 because endDate ? startDate.", async () => {
      const res = await request(app).post("/api/createEvent").set("Cookie", authCookie).set("Content-Type", "application/json").send({
        name: "Game Night",
        description: "Let's play board games!",
        startDate: "2026-01-10",
        endDate: "2026-01-01",
        startTime: "09:00:00",
        endTime: "22:00:00",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("End time cannot be before start time!");
    });

    test("Should return 201 for successful event creation.", async () => {
      const res = await request(app).post("/api/createEvent").set("Cookie", authCookie).set("Content-Type", "application/json").send({
        name: "Game Night",
        description: "Let's play board games!",
        startDate: "2026-01-01",
        endDate: "2026-01-10",
        startTime: "09:00:00",
        endTime: "22:00:00",
      });

      expect(res.status).toBe(201);
    });
  });
});

afterAll(async () => {
  await closePool(); // Closes all DB connections
});
