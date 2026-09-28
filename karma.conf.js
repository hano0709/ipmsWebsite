module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage'),
        ],
        client: {
            jasmine: { randome: true },
            clearContext: false,
        },
        jasmineHtmlReporter: { suppressAll: true},
        coverageReporter: {
            dir: require('path').join(__dirname, './coverage/ipms-website'),
            subdir: '.',
            reporters: [{ type: 'html' }, { type: 'text-summary' }],
        },
        reporters: ['progress', 'kjhtml'],
        browsers: ['Chrome'],
        customLaunchers: {
            ChromeHeadlessCI: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--disable-gpu'],
            },
        },
        restartOnFileChange: true,
    });
};