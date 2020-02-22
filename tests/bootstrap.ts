import "mocha";
import { use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { createConnection, Connection, ConnectionOptions } from "typeorm";
import { createContainer } from "../src/container";
import * as db from "../config/db";

use(chaiAsPromised);

const clearDb = async (_connection: Connection) => {};

before(async () => {
  const dbConnection = await createConnection({
    name: "integration-tests-connection",
    ...(db as ConnectionOptions),
    logging: false,
  });

  global.dbConnection = dbConnection;
  await dbConnection.dropDatabase();

  global.container = await createContainer();
});

beforeEach(async () => {
  if (global.dbConnection) {
    await clearDb(global.dbConnection);
  }
});

after(async () => {
  if (global.dbConnection) {
    await global.dbConnection.close();
  }
});
