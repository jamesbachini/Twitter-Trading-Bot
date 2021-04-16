# Twitter Trading Bot

A trading bot to execute trades based on specific mentions of a ticker by a Twitter user.

## Social Trading Opportunity

This was originally set up to trade DOGE based on Elon Musks tweets but it can be used to monitor any account for any keyword. A trade will be executed if the user tweets a message which includes the keyword.

## Setup

Rename config-example.js to config.js and edit the file using a text editor such as VSCode

You'll need an API key for Twitter: [Twitter Developer Dashboard](https://developer.twitter.com/)

You'll also need a FTX API key: [FTX Exchange](https://ftx.com/#a=FTXWELCOME)

Keyword is not case sensitive and you can add #HashTags or $CashTags if you want to isolate those. Be careful because using the keyword "ETH" will execute if Elon starts tweeting about smoking meth.

## Additional Info

The code is set to use a trailing stop loss to manage risk. This is setup using a minus USD figure number. A market order will fire first and on confirmation of execution the trailing stop loss will be set up. This will follow the price up (hopefully) then closing the trade once the price drops back by the amount set.

[Developer Home Page](https://jamesbachini.com)

## Disclaimer

This script is for demonstration purposes only. It was put together in a couple of hours and is **not fully tested or production ready code**. Use it for educational purposes only and build something better if you want to use it with real funds.

*Do not use this script with your live trading account, and if you ignore this and lose funds do not blame me*

