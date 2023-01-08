"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sl = require("./shared/servicelocator");
const ApiOp = require("./api/operator");
const ApiConf = require("./api/configurator");
Sl.ServiceLocator.CurrentConfigurator = new ApiConf.ApiConfigurator();
Sl.ServiceLocator.CurrentOperator = new ApiOp.ApiOperator();
Sl.ServiceLocator.CurrentOperator.Initialize().then(() => Sl.ServiceLocator.CurrentOperator.Start());
// superitacalluser
// P^TLC++xzkYfMc[4Gv
