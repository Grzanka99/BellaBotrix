import { Database } from "bun:sqlite";

const sql = (...str: Array<TemplateStringsArray | string>) => {
  return str.join().trim();
};

type Store<T> = {
  key: string;
  value: T;
};

const CREATE_STORAGE = sql`
  CREATE TABLE IF NOT EXISTS store (
    key   TEXT NOT NULL UNIQUE,
    value BLOB NOT NULL
  )
`;
const SET_QUERY = sql`
  INSERT INTO store
    (key, value)
  VALUES ($key, $value);
`;
const UPDATE_QUERY = sql`
  UPDATE store SET
    value = $value
  WHERE
    key = $key;
`;
const READ_QUERY = sql`SELECT key, value FROM store WHERE key = $key;`;
const DELETE_QUERY = sql`DELETE FROM store WHERE key = $key`;

/**
 * @description maybe not the fastest.
 * but will allow me to share data throught aplication on local db,
 * could be just regular sql lib tho
 * */
export class SqliteStorage {
  private db: Database;

  constructor(private filename: ":memory:" | (string & {})) {
    this.db = new Database(this.filename);
    this.db.run("pragma busy_timeout = 5000;");
    this.db.run(CREATE_STORAGE);
  }

  public has(key: string): boolean {
    const query = this.db.query(sql`SELECT key FROM store WHERE key = $key`);
    const res = query.get(key);
    if (res) {
      return true;
    }

    return false;
  }

  public set<T>(key: string, value: T): boolean {
    const data = JSON.stringify({ data: value });

    let res: { changes: number } | undefined = undefined;

    if (this.has(key)) {
      const query = this.db.query(UPDATE_QUERY);
      res = query.run(data, key);
    } else {
      const query = this.db.query(SET_QUERY);
      res = query.run(key, data);
    }

    if (res?.changes < 1) {
      return false;
    }

    return true;
  }

  public get<T = unknown>(key: string): Store<T> | undefined {
    if (!this.has(key)) {
      return undefined;
    }

    const query = this.db.query(READ_QUERY);
    const res = query.get(key) as Store<string>;

    const data = JSON.parse(res.value);

    return {
      key,
      value: data.data,
    };
  }

  public delete(key: string): boolean {
    const query = this.db.query(DELETE_QUERY);
    const res = query.run(key);

    if (res.changes < 1) {
      return false;
    }

    return true;
  }
}
