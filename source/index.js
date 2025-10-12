require('dotenv').config();

const fastify = require('fastify')({ logger: true });
fastify.register(require('@fastify/static'), {
  root: require('path').join(__dirname, '..', 'public'),
  prefix: '/', 
});

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000});
    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();