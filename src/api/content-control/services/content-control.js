'use strict';

/**
 * content-control service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::content-control.content-control');
