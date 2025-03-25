<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Popcorn Palace Movie Ticket Booking System

## Overview
The Popcorn Palace Movie Ticket Booking System is a backend service designed to handle various operations related to movie,showtime, and booking management.

## Functionality
The system provides the following APIs:

- **Movie API**: Manages movies available on the platform.
- **Showtime API**: Manages movies showtime on the theaters.
- **Booking API**: Manages the movie tickets booking.

## Technical Aspects
The system is built using Java Spring Boot, leveraging its robust framework for creating RESTful APIs. Data persistence can be managed using an in-memory database like H2 for simplicity, or a more robust solution like PostgreSQL for production.

## Homework Task
Candidates are expected to design and implement the above APIs, adhering to RESTful principles.

## APIs

### Movies  APIs

| API Description     | Method | Endpoint                | Request Body                                                                 | Response Status | Response Body      |
|---------------------|--------|-------------------------|-------------------------------------------------------------------------------|------------------|---------------------|
| Get all movies      | GET    | `/movies/all`           | —                                                                             | 200 OK           | List of movies      |
| Add a new movie     | POST   | `/movies/add`           | `{ title, genre, duration, rating, release_year }`                           | 201 Created      | Movie object        |
| Update a movie      | PATCH  | `/movies/update/:id`    | `{ title?, genre?, duration?, rating?, release_year? }`                      | 200 OK           | Success message     |
| Delete a movie      | DELETE | `/movies/delete/:id`    | —                                                                             | 200 OK           | Success message     |

---

### Showtime APIs

| API Description        | Method | Endpoint                             | Request Body                                                                                                    | Response Status | Response Body       |
|------------------------|--------|--------------------------------------|------------------------------------------------------------------------------------------------------------------|------------------|----------------------|
| Add a new showtime     | POST   | `/showTime/AddNewShowTime`           | `{ movie_title, movie_release_year, theater, start_time, end_time, price }`                                     | 201 Created      | Success message      |
| Update a showtime      | PATCH  | `/showTime/UpdateShowTime/:id`       | `{ movie_title?, movie_release_year?, theater?, start_time?, end_time?, price? }`                               | 200 OK           | Success message      |
| Get showtime by ID     | GET    | `/showTime/GetShowTimeById/:id`      | —                                                                                                               | 200 OK           | Showtime object with movie |
| Delete a showtime      | DELETE | `/showTime/DeleteShowTime/:id`       | —                                                                                                               | 200 OK           | Success message      |

---

### Ticket Booking APIs

| API Description        | Method | Endpoint                    | Request Body                                                                                                      | Response Status | Response Body       |
|------------------------|--------|-----------------------------|--------------------------------------------------------------------------------------------------------------------|------------------|----------------------|
| Book a ticket          | POST   | `/ticket/AddNewTicket`      | `{ movie_title, movie_theater, movie_start_time, customer_name, seat_number }`                                   | 201 Created      | Success message      |



## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
