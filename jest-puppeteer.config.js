module.exports = {
    launch: {
        dumpio: true,
        headless: true
    },
    browser: 'chromium',
    browserContext: 'default',
    server: {
        command: `yarn start`,
        port: 9000,
        launchTimeout: 1000000,
        debug: true,
    },
}