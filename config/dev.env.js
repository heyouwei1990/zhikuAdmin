'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // API_ROOT:'"http://api.mingchetech.com"'
  API_ROOT:'"http://api.admin.51xxwl.com"'
  // API_ROOT:'"http://192.168.191.1:8080"'
})
