# Natours - Tour Booking Backend Application

Welcome to the Natours backend application! This repository contains the backend code for a tour booking application created following the Udemy course by Jonas Schmedtmann. This README will provide you with essential information about the project, its structure, and how to set it up.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Natours is a backend application for a tour booking system. It uses Node.js and Express.js to handle server-side operations. This application incorporates various npm packages and middleware to provide security, authentication, and data management.

## Features

- User authentication with JWT (JSON Web Tokens).
- User roles (admin, user) with different access levels.
- Booking and payment processing with Stripe.
- Data sanitization and validation.
- Rate limiting and security headers using Express.js middleware.
- Handling of images using the Sharp library.
- Sending emails with Nodemailer.
- Secure password hashing using bcryptjs.
- Express.js view engine (Pug) for rendering views.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed on your local machine. You can download it from [nodejs.org](https://nodejs.org/).
- MongoDB set up and running locally or accessible via a cloud service. You will need to configure the database connection (see [Configuration](#configuration) section).
- Docker installed on your machine for containerization.
- Nginx installed for reverse proxy configuration (if not using a cloud provider that handles this for you).
- An AWS account for hosting and deployment.

## Installation

To get this project up and running on your local machine, follow these steps:

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/HazemHamdyy/natours.git
   ```

2. Change into the project directory:

   ```bash
   cd natuors
   ```

3. Install the project dependencies:

   ```bash
   npm install
   ```



## Usage

To start the server, run the following command:

```bash
npm start
```

The server will start on the port specified in your `.env` file (default is 8000).

You can access the application via `http://localhost:8000` in your web browser or use tools like Postman to interact with the API.

## Deployment

### Docker and Nginx

1. Dockerize the Application:

   Build a Docker image for your application:

   

2. Run Docker Container:

   Run the Docker container and map the container port to a host port (e.g., 8000) for development mode:

   ```bash
    docker-compose -f docker-compose.dev.yml up -d --build
   ```

    Run the Docker container and map the container port to a host port (e.g., 8000) for production mode:

   ```bash
    docker-compose -f docker-compose.prod.yml up -d --build
   ```




Now, your Node.js application is running inside a Docker container and is accessible via Nginx.



### Accessing the Deployed Application

The "Natours" backend application is already deployed and can be accessed at the following URL:

[http://ec2-51-20-120-62.eu-north-1.compute.amazonaws.com](http://ec2-51-20-120-62.eu-north-1.compute.amazonaws.com)

Hint: You can use the api documentation to test the app requests.

## API Documentation

link: https://documenter.getpostman.com/view/22135432/2s9YC7TByB

## Contributing

Contributions to this project are welcome. Feel free to open issues or create pull requests to improve the application.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Thank you for using the Natures tour booking backend application. If you have any questions or encounter any issues, please don't hesitate to contact us. Happy coding!
