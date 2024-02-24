import { expect } from "chai";
import { runServer } from "../src/infra/server";
import "mocha";

describe("API: Service", () => {
  before(async () => {
    // Start the server before running tests
    await runServer();
  });

  it("should return fee index at /api/v1/index", async () => {
    const response = await fetch("http://localhost:3561/api/v1/index");
    const body = await response.json(); // Parse response body as JSON
    expect(body).to.be.an("object");

    expect(body).to.have.property("feeEstimateMovingAverageRatio");

    expect(body.feeEstimateMovingAverageRatio).to.be.an("object");

    expect(body.feeEstimateMovingAverageRatio).to.include({
      last365Days: Number,
      last30Days: Number,
    });
  });
});
