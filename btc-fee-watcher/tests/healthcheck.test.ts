import { runServer } from "../src/infra/server";
import "mocha";
import chai from "chai";
import chaiHttp from "chai-http";
const expect = chai.expect;

describe("API Healthcheck", () => {
  before(async () => {
    // Start the server before running tests
    await runServer();
  });

  it("should return Hello at /api/v1/", async () => {
    const response = await fetch("http://localhost:3561/api/v1/");
    const body = await response.text();
    expect(response.status).to.equal(200);
    expect(body).to.equal("Hello from BTC Fee Watcher!");
  });
});
