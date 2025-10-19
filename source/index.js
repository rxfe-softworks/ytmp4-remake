require('dotenv').config();

const fastify = require('fastify')({ logger: true });
const path = require('path');
const fs = require('fs').promises;
const YouTubeDownloader = require('./ytapi');
const downloader = new YouTubeDownloader();

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/', 
});
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '..', 'downloads'),
  prefix: '/server-downloads/',
  decorateReply: false,
});

fastify.get('/serverdat/', async (request, reply) => {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageData = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    return {
      TARGET_FORMAT: process.env.TARGET_FORMAT,
      homepage: packageData.homepage,
      version: packageData.version,
      QOTD: process.env.QOTD || null,
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000 });
    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();