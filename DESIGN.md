# Hephaestus Backend Design Document

## Usage

Hepheaestus generates responses through OpenAI's AI model text-davinci-003 and Dall-E 2 model for text and image responses respectively. The bot uses these models through the paid APIs provided by OpenAI orgaization. As this bot is entirely free and open source, there's no source of income to cover the costs of the paid APIs.

In order to keep this bot running without incuring any cost, Hephaestus offers two modes of usage and are as follows.

1. By default, Hephaestus uses free credits which are given to every registered user on OpenAI. To keep this mode of usage alive, there's a limit to number of requests that could be made from a user per day. As of now, the user can send 20 messages/day for textual responses and 5 messages/day for image responses.

2. The user generates the OpenAI API token by registering themselves at [www.openai.com](https://www.openai.com) and pass it to the Hephaestus bot. Any following message from that respective user uses it's own API token and has full access to the free credits. After the exhaustion of the user's free credits, the user can either purchase credits at OpenAI or create a new account

## Configuration Flow

1. User sends the command `/configure` to the bot.
2. Hephaestus creates a temporary unique url and sends it to client.
3. User opens the link and pastes the API token generated.
4. Acknowledgement of the reception of token is sent to the client once the token is validated, encrypted and saved securely.
5. Now, the command is in your hands completely.

## Security Measures

- The token is encrypted on the client by the Elliptic Curve Cryptography approach.
- TLS encryption encrypts the request payload again which again makes the communication between client and the server more secure.
- Upon reception of the encrypted token, it is saved in the database.

## Unique URL Generation

### URL Format

> ### https://hephaestus.com/configure/token

The token is made up of two parts, a subtoken and user id. Format of token is as follows:

`token = <primary token>.<user id>`

_Example URL: https://hephaestus.com/configure/8201bc30ef48fe9ee06636244292696b410c24f4b54fcf84d4d8eaee2cf7c488.a9s34dsfs23ern91fso3_

### Why this `primary token` and `user id`?

The primary token is the main part of the token that is unique for every user. It is valid for a short period of time and is regenerated once it is expired. The primary token is hashed with `SHA256` algorithm before saving in the database so that the attacker cannot use this primary token even in the case of database breach. Note that the primary token sent to the client is not hashed.

Second part of the token is the user id. It is used to identify the user in the database, whose hashed primary token should be compared against the incoming token. If a user tries to tamper with the user id or primary token, the request would be invalidated because of mismatch between incoming primary token and hashed primary token in the database.

- __primary token__: It is obtained through Cryptographically Secure Random Number Generators (CSPRNG). CSPRNGs create a truly secure random numbers by using unpredicatable initial seed value. There are libraries for these generators. In Node.js, `crypto.randomBytes()` returns a Buffer of random bytes which could be converted to hexadecimal to obtain a secure random number.

- __user id__: It's a unique id created by MongoDB when a new user is added in the database.

### Creation and validity of the token?

- When the user sends the `/configure` command, a new token is issued every time and the time of token creation is also persisted in the database. Additionally 

- Token expires after 10 mins and the link sent to the client becomes useless.

- If the user uses the link within 10 mins of issuance and request is successful, the token is deleted so that any further request from the same token is not accepted.