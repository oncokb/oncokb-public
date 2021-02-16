# OncoKB Public Website

OncoKB is a precision oncology knowledge base and contains information about the effects and treatment implications of specific cancer gene alterations.
Please cite [Chakravarty et al., JCO PO 2017.](https://ascopubs.org/doi/full/10.1200/PO.17.00011)

This application was generated using JHipster 6.10.3, you can find documentation and help at [https://www.jhipster.tech/documentation-archive/v6.10.3](https://www.jhipster.tech/documentation-archive/v6.10.3).

## Status

[![Application CI Status](https://github.com/oncokb/oncokb-public/workflows/Application%20CI/badge.svg)](https://github.com/oncokb/oncokb-public/actions) [![Release Management Status](https://github.com/oncokb/oncokb-public/workflows/Release%20Management/badge.svg)](https://github.com/oncokb/oncokb-public/actions) [![Sentrey Release Status](https://github.com/oncokb/oncokb-public/workflows/Sentrey%20Release/badge.svg)](https://github.com/oncokb/oncokb-public/actions) <a href="https://codeclimate.com/github/oncokb/oncokb-public/maintainability"><img src="https://api.codeclimate.com/v1/badges/d625e20939f824b0290d/maintainability" /></a>

## Info

<a href="https://ascopubs.org/doi/full/10.1200/PO.17.00011"><img src="https://img.shields.io/badge/DOI-10.1200%2FPO.17.00011-1c75cd" /></a>

## Development

### Running environment

Make sure your running environment is the following:

- **Java version: 8**
- **MySQL version: 5.7.28**
- **Redis**

### Modify config

`/src/main/resources/config/application-dev.yml`

1. Confirm database name, username, password under `datasource` config.
2. Change `api-proxy-url` to the URL where oncokb running. For example, `http://localhost:8888/oncokb`
3. Make sure the password for your Redis as same as the password for Redis defined in this file

### Building

Before you can build this project, you must install and configure the following dependencies on your machine:

1. [Node.js][]: We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).

```
yarn install
```

We use yarn scripts and [Webpack][] as our build system.

Run the following commands in two separate terminals to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.

```

./mvnw


yarn start
```

yarn is also used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in [package.json](package.json). You can also run `yarn update` and `yarn install` to manage dependencies.
Add the `help` flag on any command to see how you can use it. For example, `yarn help update`.

The `yarn run` command will list all of the scripts available to run for this project.

### Connect with server side locally

After starting project up locally, you should type the following command in your browser console

```
localStorage.setItem("localdev", true)
```

To unset do:

```
localStorage.removeItem("localdev")
```

or

```
localStorage.setItem("localdev", false)
```

### PWA Support

JHipster ships with PWA (Progressive Web App) support, and it's turned off by default. One of the main components of a PWA is a service worker.

The service worker initialization code is commented out by default. To enable it, uncomment the following code in `src/main/webapp/index.html`:

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').then(function () {
      console.log('Service Worker Registered');
    });
  }
</script>
```

Note: [Workbox](https://developers.google.com/web/tools/workbox/) powers JHipster's service worker. It dynamically generates the `service-worker.js` file.

### Managing dependencies

For example, to add [Leaflet][] library as a runtime dependency of your application, you would run following command:

```
yarn add --exact leaflet
```

To benefit from TypeScript type definitions from [DefinitelyTyped][] repository in development, you would run following command:

```
yarn add --dev --exact @types/leaflet
```

Then you would import the JS and CSS files specified in library's installation instructions so that [Webpack][] knows about them:
Note: There are still a few other things remaining to do for Leaflet that we won't detail here.

For further instructions on how to develop with JHipster, have a look at [Using JHipster in development][].

## Building for production

### Packaging as jar

To build the final jar and optimize the oncokb application for production, run:

```

./mvnw -Pprod clean verify


```

This will concatenate and minify the client CSS and JavaScript files. It will also modify `index.html` so it references these new files.
To ensure everything worked, run:

```

java -jar target/*.jar


```

Then navigate to [http://localhost:9090](http://localhost:9090) in your browser.

Refer to [Using JHipster in production][] for more details.

### Packaging as war

To package your application as a war in order to deploy it to an application server, run:

```

./mvnw -Pprod,war clean verify


```

### Packaging with a docker image ready

```

    ./mvnw package -Pprod verify jib:dockerBuild -DskipTests


```

## Testing

To launch your application's tests, run:

```
./mvnw verify
```

### Client tests

Unit tests are run by [Jest][] and written with [Jasmine][]. They're located in [src/test/javascript/](src/test/javascript/) and can be run with:

```
yarn test
```

For more information, refer to the [Running tests page][].

### Screenshot tests

Screenshot tests are run by [Jest][], [Puppeteer][]. They're located in [screenshot-test/](screenshot-test/). Because different dev environments have different systems, which may cause the resulting image doesn’t quite match the expected one from the [`__baseline_snapshots__`](screenshot-test/__baseline_snapshots__/) directory saved in source control, we dockerized the test process and can be run with:

```
yarn run screenshot-test-in-docker
```

If you are confident with the changes from the [`__diff_output__`](screenshot-test/__diff_output__/) directory, you have two options to update the images stored in the [`__baseline_snapshots__`](screenshot-test/__baseline_snapshots__/) directory.

```
yarn run screenshot-test-in-docker:update
```

or

repalce the out-of-date images with the up-to-date images stored in [`__latest_snapshots__`](screenshot-test/__latest_snapshots__/).

> **NOTE:** The cmds above can only be executed in unix-based systems. If you are using Windows, please use `docker-compose build local_test` ,`docker-compose run --rm local_test` to run the tests, and use `docker-compose build local_test_update`, `docker-compose run --rm local_test_update` to update baseline images.

If you don't want to use docker, you can just use

```
yarn run screenshot-test
```

to run the tests and use

```
yarn run screenshot-test:update
```

to update baseline images. However, please keep in mind that the result images may not match the baseline images even you didn't change any thing. And the tests in CI process may fail as well.

**Why Puppeteer?**

We used _jest w/ puppeteer_ instead of _Webdriverio w/ Selenium_ basically based on below pros:

- Simple to set up, good document and easy to handle on.
- Maintained by Google and it gives you direct access to the [CDP][].
- Faster execution speed.
- Network interception. Your test codes can record, modify, block or generate responses to requests made by the browser.
- JavaScript first, so the code feels very natural

### Code quality

Sonar is used to analyse code quality. You can start a local Sonar server (accessible on http://localhost:9001) with:

```
docker-compose -f src/main/docker/sonar.yml up -d
```

You can run a Sonar analysis with using the [sonar-scanner](https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner) or by using the maven plugin.

Then, run a Sonar analysis:

```
./mvnw -Pprod clean verify sonar:sonar
```

If you need to re-run the Sonar phase, please be sure to specify at least the `initialize` phase since Sonar properties are loaded from the sonar-project.properties file.

```
./mvnw initialize sonar:sonar
```

For more information, refer to the [Code quality page][].

## Using Docker to simplify development (optional)

You can use Docker to improve your JHipster development experience. A number of docker-compose configuration are available in the [src/main/docker](src/main/docker) folder to launch required third party services.

For example, to start a mysql database in a docker container, run:

```
docker-compose -f src/main/docker/mysql.yml up -d
```

To stop it and remove the container, run:

```
docker-compose -f src/main/docker/mysql.yml down
```

You can also fully dockerize your application and all the services that it depends on.
To achieve this, first build a docker image of your app by running:

```
./mvnw -Pprod verify jib:dockerBuild
```

Then run:

```
docker-compose -f src/main/docker/app.yml up -d
```

For more information refer to [Using Docker and Docker-Compose][], this page also contains information on the docker-compose sub-generator (`jhipster docker-compose`), which is able to generate docker configurations for one or several JHipster applications.

## Continuous Integration (optional)

To configure CI for your project, run the ci-cd sub-generator (`jhipster ci-cd`), this will let you generate configuration files for a number of Continuous Integration systems. Consult the [Setting up Continuous Integration][] page for more information.

[jhipster homepage and latest documentation]: https://www.jhipster.tech
[jhipster 6.10.3 archive]: https://www.jhipster.tech/documentation-archive/v6.10.3
[using jhipster in development]: https://www.jhipster.tech/documentation-archive/v6.10.3/development/
[using docker and docker-compose]: https://www.jhipster.tech/documentation-archive/v6.10.3/docker-compose
[using jhipster in production]: https://www.jhipster.tech/documentation-archive/v6.10.3/production/
[running tests page]: https://www.jhipster.tech/documentation-archive/v6.10.3/running-tests/
[code quality page]: https://www.jhipster.tech/documentation-archive/v6.10.3/code-quality/
[setting up continuous integration]: https://www.jhipster.tech/documentation-archive/v6.10.3/setting-up-ci/
[node.js]: https://nodejs.org/
[yarn]: https://yarnpkg.org/
[webpack]: https://webpack.github.io/
[angular cli]: https://cli.angular.io/
[browsersync]: https://www.browsersync.io/
[jest]: https://facebook.github.io/jest/
[jasmine]: https://jasmine.github.io/2.0/introduction.html
[protractor]: https://angular.github.io/protractor/
[leaflet]: https://leafletjs.com/
[definitelytyped]: https://definitelytyped.org/
[puppeteer]: https://developers.google.com/web/tools/puppeteer
[cdp]: https://chromedevtools.github.io/devtools-protocol/
