# OncoKB Public Website

OncoKB is a precision oncology knowledge base and contains information about the effects and treatment implications of specific cancer gene alterations.
Please cite [Suehnholz et al., Cancer Discovery 2023](https://aacrjournals.org/cancerdiscovery/article/doi/10.1158/2159-8290.CD-23-0467/729589/Quantifying-the-Expanding-Landscape-of-Clinical) and [Chakravarty et al., JCO PO 2017](https://ascopubs.org/doi/full/10.1200/PO.17.00011).

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

### Setup Redis (optional)

The following steps is one way to set up the redis. As long as you have redis setup and ready to connect, then that would work.

- Install Docker
- Install Kubernetes(k8s) (In Mac versin, you can enable k8s in Docker Preference)
- Install helm
- Install redis `helm install oncokb-public-redis bitnami/redis --set auth.password=oncokb-public-redis-password --set replica.replicaCount=1`
- Follow the instructions after installing redis. Then you need to proxy the redis out, command looks like `kubectl port-forward --namespace default svc/oncokb-public-redis-master 6379:6379`

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

### Screenshot tests

Screenshot tests are run by [Jest][], [Puppeteer][]. They're located in [screenshot-test/](screenshot-test/). Because different dev environments have different systems, which may cause the resulting image doesn’t quite match the expected one from the [`__baseline_snapshots__`](screenshot-test/__baseline_snapshots__/) directory saved in source control, we dockerized the test process and can be run with:

```
yarn run screenshot-test-in-docker
```

You can also run screenshot-test locally using `yarn run screenshot-test`

#### Update screenshot tests

After running the command above, you will see `__diff_output__` and `__latest_snapshots__` folders created under `screenshot-test`. These new images indicate potential changes. If these changes are expected, please follow the below steps to update the images under `__baseline_snapshots__`.

1. Send a pull request to the intended branch
2. The PR will trigger the [Screenshot Test](https://github.com/oncokb/oncokb-public/actions/workflows/screenshot-test.yml) GitHub action
3. Using [this example](https://github.com/oncokb/oncokb-public/actions/runs/4623078834), the action will generate two folders(`visual-regression-diff-report` and `visual-regression-screenshots`) under the Artifacts section.
4. `visual-regression-diff-report` folder includes the files should be updated. You can copy over the ones with the same name under `visual-regression-screenshots` to your pull request.

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

## Testing Slack Integration

1. Ensure you can access the MSK secret server
2. Ensure you can access the [Slack API Manager](https://api.slack.com/apps/AQC1QUJQK/interactive-messages)
3. Install [ngrok](https://ngrok.com/download)
4. Update the `/src/main/resources/config/application-dev.yml` file

   - Change `spring.mail.username` to dev.oncokb@gmail.com
   - Change `spring.mail.password` to the password for dev.oncokb@gmail.com found in the secret server
   - Change `application.slack.user-registration-webhook` to the slack hook.
   - Change `application.slack.slack-base-url` to https://oncokb.slack.com
   - Change `application.slack.user-registration-channel-id` to C03EASPQ8AZ
   - If you need to use a slack endpoint that requires a token, update
     `application.slack.slack-bot-oauth-token` with the token get from this [page](https://api.slack.com/apps/AQC1QUJQK/oauth).

5. Start up ngrok

   ```sh
   ngrok http http://localhost:9090
   ```

6. Copy the forwarding URL generated by ngrok.

   - Should be something like https://xxxx-xxx-xxx-xx-xx.ngrok-free.app

7. Update the Request URL in the slack message configuration [in the Request URL](https://api.slack.com/apps/AQC1QUJQK/interactive-messages) to https://xxxx-xxx-xxx-xx-xx.ngrok-free.app/api/slack

   - Replace the base URL with the URL generated by ngrok for forwarding

8. Register an account in your local instance of OncoKB public

   - Ensure the email you use is one you have access to

9. Check the slack-app-dev channel for a message and approve it
