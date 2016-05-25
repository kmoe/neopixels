'use strict';

const Hapi = require('hapi');
const Boom = require('boom');
const server = new Hapi.Server();
var Twitter = require('twitter');
const request = require('request');

server.connection({
  port: process.env.PORT || 1337
});

console.log('hello');

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('info', 'Server running at: ' + server.info.uri);
});

server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    console.log('info', 'base route');
    return reply('hello world 2');
  }
});

var client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

var stream = client.stream('statuses/filter', {track: 'katyemoe'});

const commands = ['red', 'pink', 'white', 'wakeup', 'disco', 'idle'];

stream.on('data', function(tweet) {
  console.log(tweet.text);

  const tweetText = tweet.text;

  let colour;

  for (let command of commands) {
    if (tweetText.indexOf(command) > -1) {
      colour = command;
    }
  }

  if (colour) {
    request('https://preview.twilio.com/wireless/Commands', {
      method: 'POST',
      form: {
        Device: process.env.DEVICE,
        Command: colour,
      },
      auth: {
        user: process.env.TWILIO_ACCOUNT_SID,
        pass: process.env.TWILIO_AUTH_TOKEN
      }
    }, function(error, response, body) {
      console.log(response.statusCode);
    });
  }
});

stream.on('error', function(error) {
  throw error;
});
