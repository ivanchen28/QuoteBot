var express = require('express')
var app = express()
app.get("/", (request, response) => {
  response.sendStatus(200)
})
app.listen(process.env.PORT)

var quoteCooldown = false;
var addCooldown = false;
var deleteCooldown = false;
var helpCooldown = false;
var countCooldown = false;
var init = false;
const tmi = require('tmi.js');
const fs = require('fs');
var quotes = require("./quotes.json")
const opts = {
  identity: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  },
  channels: [
    'aliensrock'
  ]
};
const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);


client.connect();

function WriteQuotes() {
  console.log("Attempting to write")
  fs.writeFile("./quotes.json", JSON.stringify(quotes, null, 4), err => {
    if (err) throw err;
  });
}

if (!quotes.Quotes) {
  quotes.Quotes = []
  WriteQuotes()
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function getrandomint(min, max) {
  return Math.floor(Math.random() * max) + min  
}

function arrayRemove(arr, value) { 
  return arr.splice(value, 1)
}

function GetQuote(commandName, context) {
  const array = quotes.Quotes
  if (commandName === '!quote') {
    const quoteNum = getrandomint(1, array.length) - 1
    const quote = array[quoteNum]
    return '\"' + quote + '\" - Tyler [' + String(quoteNum + 1) + ']'
  } else {
    const quoteNum = Number(commandName.substring(7)) - 1
    const quote = array[quoteNum];

    if (quoteNum >= array.length || quoteNum + 2 < 0) {
      return '@' + context['display-name'] + ' There are only ' + array.length + ' quotes.'
    } else {
      if (quoteNum == -1) {
        return '\"' + "Hi" + '\" - Tyler [' + String(quoteNum + 1) + ']'
      } else if (quoteNum == -2) {
        return '\"' + "undefined, also what are you doing here" + '\" - Tyler [' + String(quoteNum + 1) + ']'
      } else {
        return '\"' + quote + '\" - Tyler [' + String(quoteNum + 1) + ']'
      }
    }
  }
}

function AddQuote(QuoteName, context) {
  var exists = false

  for (var i = 0; i < quotes.Quotes.length; i++) {
    if (quotes.Quotes[i] === QuoteName) {
      exists = true
      break
    }
  }

  if (exists == true) {
    return '@' + context['display-name'] + ' that quote already exists.'
  } else {
    console.log("Added")
    quotes.Quotes[quotes.Quotes.length] = QuoteName
    WriteQuotes()
    return '@' + context['display-name'] + ' Quote \"' + QuoteName +'\" has been added successfully as quote ' + quotes.Quotes.length + '.';
  }
}

function DeleteQuote(commandName, context) {
  var quoteNumber = -1;
  var quote;
  if (!isNaN(commandName.substring(14))) {
    quoteNumber = Math.floor(commandName.substring(14))
  }
  
  quoteNumber = Number(quoteNumber)
  if (quoteNumber <= quotes.Quotes.length) {
    quote = quotes.Quotes[quoteNumber - 1]
    quotes.Quotes.splice(quoteNumber - 1, 1)
    WriteQuotes()
    return context['display-name'] + ' Deleted quote \"' + quote + '\"';
  }
}

function onMessageHandler (target, context, msg, self) {
  if (self) return;
  const commandName = msg.trim(); // Remove whitespace from chat message
  var IsAdmin = false
  if (context.mod || context.username == "firsttobebear" || context.username == "aliensrock" || context.username == "donutpatthiswhale") {
    IsAdmin = true
  }

  if (!init) {
    //client.say(target, 'Tyler Quote Bot initialized. Type !quote to generate a random quote. Type !quote help for assistance.');
    init = true;
  }
  if (commandName === '!quote' || (commandName.substring(0, 6) === '!quote' && !(isNaN(commandName.substring(6))))) {
    if (!quoteCooldown) {
      client.say(target, GetQuote(commandName, context))

      quoteCooldown = true;
      setTimeout(function () {
        quoteCooldown = false;
      }, 30000);
    }
  }
  
  if (commandName.substring(0, 11) ===  '!quote add ') {
    if (IsAdmin) {
      client.say(target, AddQuote(commandName.substring(11), context))
    }
    else {
      if (!addCooldown) {
        addCooldown = true;
        client.say(target, '@' + context['display-name'] + ' Where\'s your shiny sword? You must be a moderator to perform this action.');
        setTimeout(function () {
          addCooldown = false;
        }, 10000);
      }
    }
  }
  
  if (commandName.substring(0, 14) === '!quote delete ' || commandName.substring(0, 14) === '!quote remove ') {
    if (IsAdmin) {
      client.say(target, DeleteQuote(commandName, context))
    }
    else {
      if (!deleteCooldown) {
        deleteCooldown = true;
        client.say(target, '@' + context['display-name'] + ' Where\'s your shiny sword? You must be a moderator to perform this action.');
        setTimeout(function () {
          deleteCooldown = false;
        }, 10000);
      }
    }
  }
  
  if (commandName === '!quote help') {
    if (IsAdmin) {
      client.say(target, '@' + context['display-name'] + ' !quote add [quote] - adds a quote (no \") // delete [quote] - deletes a quote // count - displays number of messages// help - displays this message');
    }
    else {
      if (!helpCooldown) {
        helpCooldown = true;
        client.say(target, '@' + context['display-name'] + ' Type !quote to generate a random quote! (30 second cooldown) // !quote count displays number of quotes.');
        setTimeout(function () {
          helpCooldown = false;
        }, 10000);
      }
    }
  }
  
  if (commandName === '!quote count') {
    if (!countCooldown) {
      countCooldown = true;
      client.say(target, '@' + context['display-name'] + ' There are currently ' + quotes.Quotes.length + ' quotes.');
      setTimeout(function () {
        countCooldown = false;
      }, 10000);
    }
  }
}

console.log("Started")