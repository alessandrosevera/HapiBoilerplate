
import Sl = require("./shared/servicelocator");

import ApiOp = require("./api/operator");
import ApiConf = require("./api/configurator");

Sl.ServiceLocator.CurrentConfigurator = new ApiConf.ApiConfigurator();
Sl.ServiceLocator.CurrentOperator = new ApiOp.ApiOperator();

Sl.ServiceLocator.CurrentOperator.Initialize().then(() => Sl.ServiceLocator.CurrentOperator.Start());

// superitacalluser
// P^TLC++xzkYfMc[4Gv