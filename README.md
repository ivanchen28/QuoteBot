# QuoteBot

A Twitch.tv chat bot that remembers streamers' quotes and displays one at random when !quote is typed.
The bot is currently configured for use by twitch.tv/aliensrock and runs 24/7 in his chat. Note that the provided quotes in quotes.json can be considered inappropriate for certain audiences.

Enter bot account details in the .env file, where USERNAME is the name of the account, and PASSWORD is the Oauth password for the account.
Then, adjust settings accordingly in server.js.

All uses can type !quote to generate a quote at random, !quote help for a help page, and !quote count to count the number of quotes.
Users can type !quote [#] to display a specific quote.
Channel moderators can add quotes with !quote add [quote] and delete quotes with !quote remove [quote#].
