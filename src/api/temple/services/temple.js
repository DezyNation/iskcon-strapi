'use strict';

/**
 * temple service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::temple.temple');
