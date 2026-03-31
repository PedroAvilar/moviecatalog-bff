# MovieCatalog - Backend For Frontend (BFF)

A dedicated backend service bridging the frontend application and external APIs.

> **Note:** This repository contains the **Backend For Frontend (BFF)** application. It works in conjunction with its dedicated **Frontend client**. 

## Project Links

- **Frontend Repository:** [moviecatalog-frontend](https://github.com/pedroavilar/moviecatalog-frontend)
- **Live Site:** [View live site](https://pedroavilar.github.io/moviecatalog-frontend/)

## About the project

The MovieCatalog BFF serves as a crucial intermediary layer for the frontend application. It was introduced to handle data aggregation, external API proxying (specifically the TMDB API), caching, and security mechanisms such as authentication and authorization.

By offloading these responsibilities from the client side, the frontend can remain strictly focused on UI/UX and performance while the BFF ensures data is served efficiently and securely. The backend also integrates with MongoDB to persist user-specific data, such as favorites and accounts.

## Technologies

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) (Mongoose)
- [JWT](https://jwt.io/) (JSON Web Tokens)
- [Docker](https://www.docker.com/)

## Installation and setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Duplicate the `.env.example` file and rename it to `.env`. Fill in the required environment variables (e.g., MongoDB URI, JWT Secret, TMDB API Key).

3. **Run the project:**

   **Using Node/Nodemon (Local)**:
   ```bash
   npm run dev
   ```

   **Using Docker**:
   ```bash
   docker-compose up -d
   ```

> For frontend setup instructions, please visit the [Frontend Repository](https://github.com/pedroavilar/moviecatalog-frontend).

## Project Status

This project is currently **under active development**. 
