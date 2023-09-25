'use strict';

/**
 * session-participant service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::session-participant.session-participant');
