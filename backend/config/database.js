const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

let database;
const projectRoot = path.resolve(__dirname, "../..");

function getDatabasePath() {
    const configuredPath = process.env.SQLITE_DB_PATH || "./data/schedulify.db";
    return path.isAbsolute(configuredPath)
        ? configuredPath
        : path.resolve(projectRoot, configuredPath);
}

function initializeSchema(db) {
    const schemaPath = path.resolve(__dirname, "../../db/schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    db.exec(schemaSql);
}

function ensureWritableDatabasePath(dbPath) {
    const dbDirectory = path.dirname(dbPath);
    fs.mkdirSync(dbDirectory, { recursive: true, mode: 0o755 });

    if (!fs.existsSync(dbPath)) {
        fs.closeSync(fs.openSync(dbPath, "a", 0o644));
    }

    fs.accessSync(dbDirectory, fs.constants.R_OK | fs.constants.W_OK);
    fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
}

function createQueryExecutor(db) {
    return async function query(sql, params = []) {
        const statement = db.prepare(sql);
        const normalizedSql = sql.trim().toUpperCase();

        if (
            normalizedSql.startsWith("SELECT") ||
            normalizedSql.startsWith("PRAGMA")
        ) {
            return [statement.all(...params)];
        }

        const result = statement.run(...params);
        return [
            {
                insertId:
                    result.lastInsertRowid === null
                        ? undefined
                        : Number(result.lastInsertRowid),
                affectedRows: result.changes,
                changes: result.changes,
            },
        ];
    };
}

function createConnection(db) {
    return {
        query: createQueryExecutor(db),
        async beginTransaction() {
            db.exec("BEGIN TRANSACTION");
        },
        async commit() {
            db.exec("COMMIT");
        },
        async rollback() {
            db.exec("ROLLBACK");
        },
        release() {},
    };
}

function initDb() {
    if (!database) {
        const dbPath = getDatabasePath();
        ensureWritableDatabasePath(dbPath);

        const db = new DatabaseSync(dbPath, {
            open: true,
            readOnly: false,
        });
        db.exec("PRAGMA foreign_keys = ON");
        initializeSchema(db);

        database = {
            db,
            query: createQueryExecutor(db),
            async getConnection() {
                return createConnection(db);
            },
            async close() {
                db.close();
            },
        };
    }

    return database;
}

async function getDbConnection() {
    try {
        return initDb();
    } catch (err) {
        console.error(
            `Database connection failed for ${getDatabasePath()}:`,
            err.message
        );
        throw new Error("Database connection failed");
    }
}

async function closePool() {
    if (database) {
        await database.close();
        database = undefined;
    }
}

module.exports = {
    getDbConnection,
    closePool,
};
