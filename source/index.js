require('dotenv').config();

const fastify = require('fastify')({ logger: true });
const path = require('path');
const fs = require('fs').promises;
const YouTubeDownloader = require('./ytapi');
const downloader = new YouTubeDownloader();

// Register static files from public folder
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/', 
});

// Register static files from downloads folder
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '..', 'downloads'),
  prefix: '/server-downloads/',
  decorateReply: false,
});

// 404 handler - must be registered after static files
fastify.setNotFoundHandler(async (request, reply) => {
  // Check if 404.html exists in the public folder
  const notFoundPath = path.join(__dirname, '..', 'public', '404.html');
  try {
    await fs.access(notFoundPath);
    // Send the 404.html file
    return reply.code(404).type('text/html').sendFile('404.html', path.join(__dirname, '..', 'public'));
  } catch (error) {
    // If 404.html doesn't exist, send a default 404 response
    return reply.code(404).type('text/html').send(`
      <h1>404 - Not Found</h1>
      <p>The requested resource was not found on this server.</p>
    `);
  }
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