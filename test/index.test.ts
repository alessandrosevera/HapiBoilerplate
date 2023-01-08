import { Server } from "@hapi/hapi";
import { describe, it, beforeEach, afterEach } from "mocha";
import { expect } from "chai";

import Sl = require("../shared/servicelocator");
import ApiOp = require("../api/operator");
import ApiConf = require("../api/configurator");

describe("root test", async () => {
    let testServer: Server;

    Sl.ServiceLocator.CurrentConfigurator = new ApiConf.ApiConfigurator();
    Sl.ServiceLocator.CurrentOperator = new ApiOp.ApiOperator();

    beforeEach((done) => {
        Sl.ServiceLocator.CurrentOperator.Initialize().then(function(server) {
            testServer = server;
            done();
        });
    })
    afterEach((done) => {
        testServer.stop().then(() => done());
    });

    it("index responds", async () => {
        const res = await testServer.inject({
            method: "get",
            url: "/"
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result).to.equal("Hi There!");
    });
})