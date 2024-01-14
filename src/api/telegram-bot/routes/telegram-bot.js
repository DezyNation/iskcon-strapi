'use strict';

/**
 * telegram-bot router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::telegram-bot.telegram-bot');
