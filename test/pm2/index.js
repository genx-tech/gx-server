const path = require("path");
const { WebServer } = require("../..");

const createWebServer = (options) =>
    new WebServer("test", {
        workingPath: path.resolve(__dirname, "."),
        appModulesPath: "apps",
        logWithAppName: true,
        ...options,
    });

if (module.parent) {
    // export for code coverage
    module.exports = createWebServer;
} else {
    const options = {};

    options.logger = {
        level: "verbose",
    };

    const webServer = createWebServer(options);
    webServer.start_().catch((error) => {
        console.error(error);
    });
}
