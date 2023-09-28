'use strict';

/**
 * election-control service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::election-control.election-control');
