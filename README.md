<div align='center'>

<h1>moss</h1>

**A Many-to-One WebRTC signaling server.**
<br>

![](https://cdn.pixabay.com/photo/2022/10/15/20/02/moss-7523796_640.jpg)

</div>

*moss* (acronym for **M**any-to-**O**ne **S**ignaling **S**erver) is a small, WebSocket-based signaling server for [WebRTC](https://webrtc.org/). It behaves like a proxy from many clients to one central server/manager, based on unique ids per connection.

It's ...
- **fast** and **lightweight** by using [bun](https://bun.sh/) as its javascript runtime, [ElysiaJS](https://elysiajs.com/) as the [fastest web framework](https://github.com/SaltyAom/bun-http-framework-benchmark) currently available
- **small**, the project only focusses on being what's intended to be
- **easy-to-use** and **straight-forward**, because we don't like complicated APIs

## Usage

Download/Clone this repository and prepare the `.env` file (see [Environment variables](#environment-variables)).

<h3>Local installation</h3>

Ensure you have a working [bun](https://bun.sh/) installation. Then, run
```sh
bun run src/index.ts
```

and you are good to go.

<h3>Docker</h3>

To build the container, execute
```sh
docker build -t moss .
```

You can now run the application with
```sh
docker run -p 8080:8080 --env-file .env -it moss
```

<h3>Docker compose</h3>

Rename `template.docker-compose.yaml` to `docker-compose.yaml`.

```yaml
version: "3.9"

services:
  app:
    build: .
    ports:
      - "8080:8080"
    env_file: .env
    container_name: moss
    restart: always
```

Then, run
```sh
docker compose up -d
```

and the container should be build and executed automagically. In case you modified the port number in the `.env` file, you also need to update the inner port within the `docker-compose.yaml`.



<h3>Final notice</h3>

*moss* is originally designed to be executed within a local network environment. Although it may work when deployed on the www, it is neither tested nor supported.

<h2>Table of Contents</h2>

- [Usage](#usage)
- [Missing features and ToDo's](#missing-features-and-todos)
- [WebRTC and Signaling](#webrtc-and-signaling)
- [*moss* protocol and reference](#moss-protocol-and-reference)
  - [General information](#general-information)
  - [Environment variables](#environment-variables)
  - [Reserved packet types](#reserved-packet-types)
    - [`ping`](#ping)
    - [`set-master` (master only)](#set-master-master-only)
    - [`login` (client only)](#login-client-only)
- [FAQ](#faq)

## Missing features and ToDo's

- [ ] tests
- [ ] full documentation

Some future ideas:

- reference implementation and usage

## WebRTC and Signaling
The protocol of [WebRTC](https://webrtc.org/) requires a reachable signaling server so two clients can find each other and exchange required objects. However, the signaling server is kept as a blackbox. This is because it dependends on the application and use case of WebRTC which protocol and behaviour the signaling server should have.

In this case, every client should be connected and send data to one central instance. The signaling server acts like a proxy that redirects all client messages to the central server by attaching an origin. Every message from the central server includes an addressee the message gets forwarded to.

## *moss* protocol and reference

### General information
*moss* utilizes WebSockets and uses JSON-serialized objects as a protocol.

Client - *moss*:
```json
{
  "type": "<packet-type>",
  "payload": "<any>"
}
```

Central instance - *moss*:
```json
{
  "type": "<packet-type>",
  "payload": "<any>",
  "id": "<sender/receipient id>".
}
```

### Environment variables

Rename `template.env` to `.env` and add the values behind the respective keys:

- **`MOSS_CONNECTION_SECRET`** (required)<br>
Secret required to set a connection to as master and redirect all messages to this connection.

- **`MOSS_CONNECTION_OFFER_TYPE`** (required)<br>
Content for `type` key send back from *moss* on a connection login (i.e. WebRTC sdp offer).

- **`MOSS_HOSTNAME`**<br>
Change hostname *moss* starts on. *0.0.0.0* by default.

- **`MOSS_PORT`**<br>
Change port *moss* starts on. *8080* by default.

### Reserved packet types
In general, all packets are simply forwarded towards it's destination. However, there are three reserved packet types:


#### `ping`
*Check service availability.*

**Expects:**
```json
{
  "type": "ping",
  "payload": ""
}
```

**Returns:**
```json
{
  "type": "pong",
  "payload": ""
}
```

---

#### `set-master` (master only)
*Set a new master connection.*

**Expects:**
```json
{
  "type": "set-master",
  "payload": {
    "sdp": {},
    "secret": "<connection-secret>"
  }
}
```

**Returns:**
```json
{
  "type": "master-confirmation",
  "payload": ""
}
```
- `<connection-secret>`: Contents of `MOSS_CONNECTION_SECRET` environment variable. This tells *moss* that this connection is authorized to receive all client messages
- `sdp` key should contain the central instance' WebRTC SDP object, so clients can connect to it

---

#### `login` (client only)
*Client is ready to receive.*

**Expects:**
```json
{
  "type": "login",
  "payload": ""
}
```

**Returns:**
```json
{
  "type": "<offer-type>",
  "payload": {}
}
```
- `<offer-type>`: Contents of `MOSS_CONNECTION_OFFER_TYPE` environment variable. This is the packet that tells the client that the server wants to establish a WebRTC connection
- if no central instance is present yet, no offer is send as well
- a client should always be ready to receive a connection offer and migrate to it
- payload contains master SDP object


## FAQ

<h3>Okay, cool ... but why?</h3>
I am working on a bigger research project where this kind of niche implementation of a signaling server is required.

<h3>Why Bun and Typescript?</h3>
Fast development speed, fast execution speed, web programming languages are perfect when using web technologies.

<h3>Dude, why is the code so bad? Are you a beginner?</h3>
Yes, but also no. I have ~8 years experience in coding, but using Typescript is new for me. Please have mercy and feel free to educate me on best practices and coding standarts :-)
