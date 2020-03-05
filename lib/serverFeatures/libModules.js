"use strict";

require("source-map-support/register");

const Feature = require('@genx/app/lib/enum/Feature');

const path = require('path');

const {
  _,
  fs,
  eachAsync_
} = require('rk-utils');

const {
  InvalidConfiguration
} = require('../utils/Errors');

const LibModule = require('../LibModule');

module.exports = {
  type: Feature.PLUGIN,
  load_: async (server, entries) => eachAsync_(entries, async (config, name) => {
    let options = Object.assign({
      env: server.env,
      logWithAppName: server.options.logWithAppName
    }, config.options);
    let appPath;

    if (config.npmModule) {
      appPath = server.toAbsolutePath('node_modules', name);
    } else {
      appPath = path.join(server.appModulesPath, name);
    }

    let exists = (await fs.pathExists(appPath)) && (await fs.stat(appPath)).isDirectory();

    if (!exists) {
      throw new InvalidConfiguration(`Lib [${name}] not exists.`, server, `libModules.${name}`);
    }

    let lib = new LibModule(server, name, appPath, options);
    lib.on('configLoaded', () => {
      if (!_.isEmpty(config.settings)) {
        lib.config.settings = Object.assign({}, lib.config.settings, config.settings);
        server.log('verbose', `Lib settings of [${lib.name}] is overrided.`);
      }
    });
    let relativePath = path.relative(server.workingPath, appPath);
    server.log('verbose', `Loading lib [${lib.name}] from "${relativePath}" ...`);
    await lib.start_();
    server.registerLib(lib);
    server.log('verbose', `Lib [${lib.name}] is loaded.`);
  })
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXJGZWF0dXJlcy9saWJNb2R1bGVzLmpzIl0sIm5hbWVzIjpbIkZlYXR1cmUiLCJyZXF1aXJlIiwicGF0aCIsIl8iLCJmcyIsImVhY2hBc3luY18iLCJJbnZhbGlkQ29uZmlndXJhdGlvbiIsIkxpYk1vZHVsZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJ0eXBlIiwiUExVR0lOIiwibG9hZF8iLCJzZXJ2ZXIiLCJlbnRyaWVzIiwiY29uZmlnIiwibmFtZSIsIm9wdGlvbnMiLCJPYmplY3QiLCJhc3NpZ24iLCJlbnYiLCJsb2dXaXRoQXBwTmFtZSIsImFwcFBhdGgiLCJucG1Nb2R1bGUiLCJ0b0Fic29sdXRlUGF0aCIsImpvaW4iLCJhcHBNb2R1bGVzUGF0aCIsImV4aXN0cyIsInBhdGhFeGlzdHMiLCJzdGF0IiwiaXNEaXJlY3RvcnkiLCJsaWIiLCJvbiIsImlzRW1wdHkiLCJzZXR0aW5ncyIsImxvZyIsInJlbGF0aXZlUGF0aCIsInJlbGF0aXZlIiwid29ya2luZ1BhdGgiLCJzdGFydF8iLCJyZWdpc3RlckxpYiJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUFtQkEsTUFBTUEsT0FBTyxHQUFHQyxPQUFPLENBQUMsNEJBQUQsQ0FBdkI7O0FBQ0EsTUFBTUMsSUFBSSxHQUFHRCxPQUFPLENBQUMsTUFBRCxDQUFwQjs7QUFDQSxNQUFNO0FBQUVFLEVBQUFBLENBQUY7QUFBS0MsRUFBQUEsRUFBTDtBQUFTQyxFQUFBQTtBQUFULElBQXdCSixPQUFPLENBQUMsVUFBRCxDQUFyQzs7QUFDQSxNQUFNO0FBQUVLLEVBQUFBO0FBQUYsSUFBMkJMLE9BQU8sQ0FBQyxpQkFBRCxDQUF4Qzs7QUFDQSxNQUFNTSxTQUFTLEdBQUdOLE9BQU8sQ0FBQyxjQUFELENBQXpCOztBQUVBTyxNQUFNLENBQUNDLE9BQVAsR0FBaUI7QUFNYkMsRUFBQUEsSUFBSSxFQUFFVixPQUFPLENBQUNXLE1BTkQ7QUFjYkMsRUFBQUEsS0FBSyxFQUFFLE9BQU9DLE1BQVAsRUFBZUMsT0FBZixLQUEyQlQsVUFBVSxDQUFDUyxPQUFELEVBQVUsT0FBT0MsTUFBUCxFQUFlQyxJQUFmLEtBQXdCO0FBQzFFLFFBQUlDLE9BQU8sR0FBR0MsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFDeEJDLE1BQUFBLEdBQUcsRUFBRVAsTUFBTSxDQUFDTyxHQURZO0FBRXhCQyxNQUFBQSxjQUFjLEVBQUVSLE1BQU0sQ0FBQ0ksT0FBUCxDQUFlSTtBQUZQLEtBQWQsRUFHWE4sTUFBTSxDQUFDRSxPQUhJLENBQWQ7QUFLQSxRQUFJSyxPQUFKOztBQUVBLFFBQUlQLE1BQU0sQ0FBQ1EsU0FBWCxFQUFzQjtBQUNsQkQsTUFBQUEsT0FBTyxHQUFHVCxNQUFNLENBQUNXLGNBQVAsQ0FBc0IsY0FBdEIsRUFBc0NSLElBQXRDLENBQVY7QUFDSCxLQUZELE1BRU87QUFDSE0sTUFBQUEsT0FBTyxHQUFHcEIsSUFBSSxDQUFDdUIsSUFBTCxDQUFVWixNQUFNLENBQUNhLGNBQWpCLEVBQWlDVixJQUFqQyxDQUFWO0FBQ0g7O0FBRUQsUUFBSVcsTUFBTSxHQUFHLE9BQU12QixFQUFFLENBQUN3QixVQUFILENBQWNOLE9BQWQsQ0FBTixLQUFnQyxDQUFDLE1BQU1sQixFQUFFLENBQUN5QixJQUFILENBQVFQLE9BQVIsQ0FBUCxFQUF5QlEsV0FBekIsRUFBN0M7O0FBQ0EsUUFBSSxDQUFDSCxNQUFMLEVBQWE7QUFDVCxZQUFNLElBQUlyQixvQkFBSixDQUNELFFBQU9VLElBQUssZUFEWCxFQUVGSCxNQUZFLEVBR0QsY0FBYUcsSUFBSyxFQUhqQixDQUFOO0FBSUg7O0FBRUQsUUFBSWUsR0FBRyxHQUFHLElBQUl4QixTQUFKLENBQWNNLE1BQWQsRUFBc0JHLElBQXRCLEVBQTRCTSxPQUE1QixFQUFxQ0wsT0FBckMsQ0FBVjtBQUVBYyxJQUFBQSxHQUFHLENBQUNDLEVBQUosQ0FBTyxjQUFQLEVBQXVCLE1BQU07QUFDekIsVUFBSSxDQUFDN0IsQ0FBQyxDQUFDOEIsT0FBRixDQUFVbEIsTUFBTSxDQUFDbUIsUUFBakIsQ0FBTCxFQUFpQztBQUM3QkgsUUFBQUEsR0FBRyxDQUFDaEIsTUFBSixDQUFXbUIsUUFBWCxHQUFzQmhCLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JZLEdBQUcsQ0FBQ2hCLE1BQUosQ0FBV21CLFFBQTdCLEVBQXVDbkIsTUFBTSxDQUFDbUIsUUFBOUMsQ0FBdEI7QUFDQXJCLFFBQUFBLE1BQU0sQ0FBQ3NCLEdBQVAsQ0FBVyxTQUFYLEVBQXVCLG9CQUFtQkosR0FBRyxDQUFDZixJQUFLLGlCQUFuRDtBQUNIO0FBQ0osS0FMRDtBQU9BLFFBQUlvQixZQUFZLEdBQUdsQyxJQUFJLENBQUNtQyxRQUFMLENBQWN4QixNQUFNLENBQUN5QixXQUFyQixFQUFrQ2hCLE9BQWxDLENBQW5CO0FBQ0FULElBQUFBLE1BQU0sQ0FBQ3NCLEdBQVAsQ0FBVyxTQUFYLEVBQXVCLGdCQUFlSixHQUFHLENBQUNmLElBQUssV0FBVW9CLFlBQWEsT0FBdEU7QUFFQSxVQUFNTCxHQUFHLENBQUNRLE1BQUosRUFBTjtBQUVBMUIsSUFBQUEsTUFBTSxDQUFDMkIsV0FBUCxDQUFtQlQsR0FBbkI7QUFFQWxCLElBQUFBLE1BQU0sQ0FBQ3NCLEdBQVAsQ0FBVyxTQUFYLEVBQXVCLFFBQU9KLEdBQUcsQ0FBQ2YsSUFBSyxjQUF2QztBQUNILEdBdkMyQztBQWQvQixDQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIExvYWQgbGliIG1vZHVsZXNcbiAqIEBtb2R1bGUgRmVhdHVyZV9MaWJNb2R1bGVzXG4gKiBcbiAqIEBleGFtcGxlXG4gKiAgXG4gKiAgJ2xpYk1vZHVsZXMnOiB7XG4gKiAgICAgICc8bmFtZT4nOiB7XG4gKiAgICAgICAgICBucG1Nb2R1bGU6IGZhbHNlLCAvLyB3aGV0aGVyIGlzIGEgbnBtIG1vZHVsZVxuICogICAgICAgICAgb3B0aW9uczogeyAvLyBtb2R1bGUgb3B0aW9ucyBcbiAqICAgICAgICAgIH0sXG4gKiAgICAgICAgICBzZXR0aW5nczogeyAvLyBjYW4gb3ZlcnJpZGUgbW9kdWxlIGRlZmluZWQgc2V0dGluZ3NcbiAqICAgICAgICAgIH1cbiAqICAgICAgfVxuICogIH0gXG4gKi9cblxuY29uc3QgRmVhdHVyZSA9IHJlcXVpcmUoJ0BnZW54L2FwcC9saWIvZW51bS9GZWF0dXJlJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgeyBfLCBmcywgZWFjaEFzeW5jXyB9ID0gcmVxdWlyZSgncmstdXRpbHMnKTtcbmNvbnN0IHsgSW52YWxpZENvbmZpZ3VyYXRpb24gfSA9IHJlcXVpcmUoJy4uL3V0aWxzL0Vycm9ycycpO1xuY29uc3QgTGliTW9kdWxlID0gcmVxdWlyZSgnLi4vTGliTW9kdWxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBmZWF0dXJlIGlzIGxvYWRlZCBhdCBwbHVnaW4gc3RhZ2UuXG4gICAgICogQG1lbWJlciB7c3RyaW5nfVxuICAgICAqL1xuICAgIHR5cGU6IEZlYXR1cmUuUExVR0lOLFxuXG4gICAgLyoqXG4gICAgICogTG9hZCB0aGUgZmVhdHVyZS5cbiAgICAgKiBAcGFyYW0ge1dlYlNlcnZlcn0gc2VydmVyIC0gVGhlIHdlYiBzZXJ2ZXIgbW9kdWxlIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZW50cmllcyAtIExpYiBtb2R1bGUgZW50cmllcy5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48Kj59XG4gICAgICovXG4gICAgbG9hZF86IGFzeW5jIChzZXJ2ZXIsIGVudHJpZXMpID0+IGVhY2hBc3luY18oZW50cmllcywgYXN5bmMgKGNvbmZpZywgbmFtZSkgPT4geyAgICAgXG4gICAgICAgIGxldCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7IFxuICAgICAgICAgICAgZW52OiBzZXJ2ZXIuZW52LCBcbiAgICAgICAgICAgIGxvZ1dpdGhBcHBOYW1lOiBzZXJ2ZXIub3B0aW9ucy5sb2dXaXRoQXBwTmFtZVxuICAgICAgICB9LCBjb25maWcub3B0aW9ucyk7XG5cbiAgICAgICAgbGV0IGFwcFBhdGg7ICAgICBcblxuICAgICAgICBpZiAoY29uZmlnLm5wbU1vZHVsZSkge1xuICAgICAgICAgICAgYXBwUGF0aCA9IHNlcnZlci50b0Fic29sdXRlUGF0aCgnbm9kZV9tb2R1bGVzJywgbmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBQYXRoID0gcGF0aC5qb2luKHNlcnZlci5hcHBNb2R1bGVzUGF0aCwgbmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZXhpc3RzID0gYXdhaXQgZnMucGF0aEV4aXN0cyhhcHBQYXRoKSAmJiAoYXdhaXQgZnMuc3RhdChhcHBQYXRoKSkuaXNEaXJlY3RvcnkoKTtcbiAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkQ29uZmlndXJhdGlvbihcbiAgICAgICAgICAgICAgICBgTGliIFske25hbWV9XSBub3QgZXhpc3RzLmAsXG4gICAgICAgICAgICAgICAgc2VydmVyLFxuICAgICAgICAgICAgICAgIGBsaWJNb2R1bGVzLiR7bmFtZX1gKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBsZXQgbGliID0gbmV3IExpYk1vZHVsZShzZXJ2ZXIsIG5hbWUsIGFwcFBhdGgsIG9wdGlvbnMpO1xuICAgICAgICBcbiAgICAgICAgbGliLm9uKCdjb25maWdMb2FkZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIV8uaXNFbXB0eShjb25maWcuc2V0dGluZ3MpKSB7XG4gICAgICAgICAgICAgICAgbGliLmNvbmZpZy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIGxpYi5jb25maWcuc2V0dGluZ3MsIGNvbmZpZy5zZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgc2VydmVyLmxvZygndmVyYm9zZScsIGBMaWIgc2V0dGluZ3Mgb2YgWyR7bGliLm5hbWV9XSBpcyBvdmVycmlkZWQuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCByZWxhdGl2ZVBhdGggPSBwYXRoLnJlbGF0aXZlKHNlcnZlci53b3JraW5nUGF0aCwgYXBwUGF0aCk7XG4gICAgICAgIHNlcnZlci5sb2coJ3ZlcmJvc2UnLCBgTG9hZGluZyBsaWIgWyR7bGliLm5hbWV9XSBmcm9tIFwiJHtyZWxhdGl2ZVBhdGh9XCIgLi4uYCk7XG4gICAgXG4gICAgICAgIGF3YWl0IGxpYi5zdGFydF8oKTtcblxuICAgICAgICBzZXJ2ZXIucmVnaXN0ZXJMaWIobGliKTtcbiAgICAgICAgXG4gICAgICAgIHNlcnZlci5sb2coJ3ZlcmJvc2UnLCBgTGliIFske2xpYi5uYW1lfV0gaXMgbG9hZGVkLmApO1xuICAgIH0pXG59OyJdfQ==