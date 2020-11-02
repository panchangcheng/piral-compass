
function removeModuleRules(compassConfig, rule) {

  for (let i=0; i < compassConfig.module.rules.length; i++) {
    if (compassConfig.module.rules[i].test.toString() === rule) {
      compassConfig.module.rules.splice(i, 1);
    }
  }

  return compassConfig
}

module.exports = function(compassConfig) {

  const path = require('path');
  const webpack = require('webpack');
  const WebpackBar = require('webpackbar');
  const HtmlWebpackPlugin = require('html-webpack-plugin');

  // const srcDir = path.resolve(process.cwd(), 'node_modules', 'compass-base', 'client');
  const srcDir = './node_modules/compass-base/client';
  // const sassCommonVarsFile = path.resolve(process.cwd(), 'scss', 'vars.scss');
  const sassCommonVarsFile = './scss/vars.scss';

  const CLIENT_DIR = "client";
  const BUILD_DIR = "build";
  const IS_PRODUCTION = process.env.NODE_ENV === "production";
  const KUBERNETES_SERVICE_HOST = process.env.KUBERNETES_SERVICE_HOST || "kubernetes";
  const KUBERNETES_SERVICE_PORT = Number(process.env.KUBERNETES_SERVICE_PORT || 443);
  const KUBERNETES_SERVICE_URL = `https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT}`;

  const config = {
    IS_PRODUCTION: IS_PRODUCTION,
    LENS_VERSION: process.env.LENS_VERSION,
    LENS_THEME: process.env.LENS_THEME,
    BUILD_VERSION: process.env.BUILD_VERSION,

    API_PREFIX: {
      BASE: '/api', // local express.js server api
      TENANT: '/base',  // tenant api
      TERMINAL: '/api-kube', // terminal api
      KUBE_BASE: '/api-kube', // kubernetes cluster api
      KUBE_USERS: '/api-users', // users & groups api
      KUBE_HELM: '/api-helm', // helm charts api middleware
      KUBE_RESOURCE_APPLIER: "/api-kube",
    },

    // express.js port
    LOCAL_SERVER_PORT: Number(process.env.LOCAL_SERVER_PORT || 8889),
    WEBPACK_DEV_SERVER_PORT: Number(process.env.LOCAL_SERVER_PORT || 8080),

    // session
    SESSION_NAME: process.env.SESSION_NAME || "lens-s3ss10n",
    SESSION_SECRET: process.env.SESSION_SECRET || "k0nt3n@-s3cr3t-key",

    // kubernetes apis
    KUBE_CLUSTER_NAME: process.env.KUBE_CLUSTER_NAME,
    KUBE_CLUSTER_URL: process.env.KUBE_CLUSTER_URL || KUBERNETES_SERVICE_URL,
    KUBE_USERS_URL: process.env.KUBE_USERS_URL || `http://localhost:9999`,
    KUBE_TERMINAL_URL: process.env.KUBE_TERMINAL_URL || `http://localhost:9998`,
    KUBE_HELM_URL: process.env.KUBE_HELM_URL || `http://localhost:9292`,
    KUBE_RESOURCE_APPLIER_URL: process.env.KUBE_RESOURCE_APPLIER_URL || `http://localhost:9393`,
    KUBE_METRICS_URL: process.env.KUBE_METRICS_URL || `http://localhost:9090`, // rbac-proxy-url

    // flags define visibility of some ui-parts and pages in dashboard
    USER_MANAGEMENT_ENABLED: JSON.parse(process.env.USER_MANAGEMENT_ENABLED || "false"),
    CHARTS_ENABLED: JSON.parse(process.env.CHARTS_ENABLED || "false"),

    SERVICE_ACCOUNT_TOKEN: process.env.SERVICE_ACCOUNT_TOKEN
      || null,

    KUBERNETES_CA_CERT: process.env.KUBERNETES_CA_CERT,
    KUBERNETES_CLIENT_CERT: process.env.KUBERNETES_CLIENT_CERT || "",
    KUBERNETES_CLIENT_KEY: process.env.KUBERNETES_CLIENT_KEY || "",
    KUBERNETES_TLS_SKIP: JSON.parse(process.env.KUBERNETES_TLS_SKIP || "false"),
    KUBERNETES_NAMESPACE: process.env.KUBERNETES_NAMESPACE || "", // default allowed namespace
  }

  // Client-side process.env, must be provided by webpack.DefinePlugin
  const clientVars = {
    BUILD_VERSION: config.BUILD_VERSION,
    IS_PRODUCTION: config.IS_PRODUCTION,
    API_PREFIX: config.API_PREFIX,
    TENANT_PREFIX: config.API_PREFIX,
    LOCAL_SERVER_PORT: config.LOCAL_SERVER_PORT,
  }

  compassConfig = removeModuleRules(compassConfig, '/\\.s[ac]ss$/i');
  compassConfig = removeModuleRules(compassConfig, '/\\.css$/i');

  compassConfig.module.rules.push({
    test: /\.s?css$/,
    use: [
      {
        loader: "style-loader",
        options: {}
      },
      {
        loader: "css-loader",
        options: {
          sourceMap: true
        },
      },
      {
        loader: "sass-loader",
        options: {
          sourceMap: true,
          prependData: '@import "' + sassCommonVarsFile + '";',
          sassOptions: {
            includePaths: [srcDir]
          },
        }
      },
    ]
  })

  compassConfig.plugins.push(
    new webpack.DefinePlugin({
      process: {
        env: JSON.stringify(clientVars)
      },
    }),
    new WebpackBar(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
  )

  return compassConfig;
}