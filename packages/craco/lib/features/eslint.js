const { getLoader, removeLoader, loaderByName } = require("../loaders");
const { log, error } = require("../logger");
const { isFunction, isArray, deepMergeWithArray } = require("../utils");

const ESLINT_MODES = {
    extends: "extends",
    file: "file"
};

function disableEslint(webpackConfig) {
    removeLoader(webpackConfig, loaderByName("eslint-loader"));

    log("Disabled ESLint.");
}

function resetDefaultOptions(loader) {
    loader.options.ignore = false;

    log("Reseted ESLint default options.");
}

function setFormatter(loader, formatter) {
    loader.options.formatter = formatter;

    log("Applied ESLint formatter.");
}

function extendsEslint(loader, eslintConfig) {
    let baseConfigExtends = {};

    if (isArray(eslintConfig.globals)) {
        baseConfigExtends.globals = eslintConfig.globals;

        log("Applied ESLint globals.");
    }

    if (isArray(eslintConfig.plugins)) {
        baseConfigExtends.plugins = eslintConfig.plugins;

        log("Applied ESLint plugins.");
    }

    if (isArray(eslintConfig.extends)) {
        baseConfigExtends.extends = eslintConfig.extends;

        log("Applied ESLint extends.");
    }

    if (eslintConfig.rules) {
        baseConfigExtends.rules = eslintConfig.rules;

        log("Applied ESLint rules.");
    }

    if (eslintConfig.env) {
        baseConfigExtends.env = eslintConfig.env;

        log("Applied ESLint env.");
    }

    if (eslintConfig.parserOptions) {
        baseConfigExtends.parserOptions = eslintConfig.parserOptions;

        log("Applied ESLint parserOptions.");
    }

    if (loader.options) {
        loader.options.baseConfig = deepMergeWithArray(loader.options.baseConfig || {}, baseConfigExtends);
    } else {
        loader.options = {
            baseConfig: baseConfigExtends
        };
    }
}

function useEslintConfigFile(loader) {
    if (loader.options) {
        loader.options.useEslintrc = true;
        delete loader.options.baseConfig;
    } else {
        loader.options = {
            useEslintrc: true
        };
    }

    log("Overwrited ESLint config to use a config file.");
}

function applyLoaderOptions(loader, loaderOptions, context) {
    if (isFunction(loaderOptions)) {
        loader.options = loaderOptions(loader.options || {}, context);
    } else {
        // TODO: ensure is otherwise a plain object, if not, log an error.
        loader.options = deepMergeWithArray(loader.options || {}, loaderOptions);
    }

    log("Applied ESLint loader options.");
}

function overrideEsLint(cracoConfig, webpackConfig, context) {
    if (cracoConfig.eslint) {
        const { isFound, match } = getLoader(webpackConfig, loaderByName("eslint-loader"));

        if (!isFound) {
            error("Cannot find ESLint loader (eslint-loader).");

            return webpackConfig;
        }

        const { enable, mode, formatter, loaderOptions } = cracoConfig.eslint;

        if (enable === false) {
            disableEslint(webpackConfig);

            return webpackConfig;
        }

        resetDefaultOptions(match.loader);

        if (formatter) {
            setFormatter(match.loader, formatter);
        }

        if (mode === ESLINT_MODES.file) {
            useEslintConfigFile(match.loader);
        } else {
            extendsEslint(match.loader, cracoConfig.eslint, context);
        }

        if (loaderOptions) {
            applyLoaderOptions(match.loader, loaderOptions);
        }
    }

    return webpackConfig;
}

module.exports = {
    overrideEsLint,
    ESLINT_MODES
};
