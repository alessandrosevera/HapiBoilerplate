
import Core = require("./core");

export class ServiceLocator {
    public static CurrentConfigurator : Core.IConfigurator;
    public static CurrentOperator : Core.IOperator;
}
