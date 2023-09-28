'use strict';

/**
 * election-control controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::election-control.election-control');
