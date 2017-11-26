# docsearch

Web application offering search and retrieval of documents from a repository, with user registration, authentication, and directory-specific authorization.

## Project Members

[Jonathan Pool](https://github.com/jrpool)

## Repository

https://github.com/jrpool/docsearch

## Discussion

### General

This application demonstrates the use of HTML, CSS, JavaScript, Apache `solr`, `bcrypt`, `body-parser`, `dotenv`, `ejs`, `express`, `express-session`, `PostgreSQL`, `pg` (node-postgres), `session-file-store`, and SendGrid to create a web server managing and providing selective access to a repository of documents.

### Implementation notes

This project currently has the status of a “minimum viable product”. Suggestions on priorities for the further development of the project are welcome.

## Installation and Configuration

0. These instructions presuppose that (1) [npm][npm] and [PostgreSQL][pg] are installed, (2) there is a PostgreSQL database cluster, (3) PostgreSQL is running, and (4) when you connect to the cluster you are a PostgreSQL superuser.

1. Your copy of this project will be located in its own directory, inside some other directory that you may choose or create. For example, to create that parent directory inside your own home directory’s `Documents` subdirectory and call it `projects`, you can execute:

    `mkdir ~/Documents/projects`

Make that parent directory your working directory, by executing, for example:

    `cd ~/Documents/projects`

2. Clone this project’s repository into it, thereby creating the project directory, named `docsearch`, by executing:

    `git clone https://github.com/jrpool/auth.git docsearch`

3. Make the project directory your working directory by executing:

    `cd docsearch`

4. Install required dependencies (you can see them listed in `package.json`) by executing:

    `npm i`

5. Obtain an account at SendGrid. For demonstration use, the free plan with a limit of 100 messages per day will suffice. (A complete user registration entails sending 4 messages.) Note the API key that SendGrid issues to you.

6. Create a file named `.env` in the project directory and populate it with the following content, where you will replace any parts that begin and end with “«»”:

```
CURATOR_KEY='«somethingSecret»'
PGHOST='localhost'
PGUSER='solr'
PGDATABASE='docsearch'
PGPASSWORD='null'
PGPORT='5432'
PORT='3000'
SECRET='«somethingElseSecret»'
SENDGRID_API_KEY='«yourSendGridAPIKey»'
CURATOR_GRP='0'
```

7. Feel free to add and remove directories and files inside `public/docs`. That directory is the root of your repository.

8. To customize your list of user categories and the directories that users in those categories have permission to see, add files to, or delete, edit the files `seedcat.sql` and `seeddir.sql` in the `src/db/config` directory.

9. To create and populate the database, execute `npm run revive_db`.

10. To start the application, execute `npm start`.

9. To access the application while it is running, use a web browser to request this URL:

`http://localhost:3000/`

[lg]: https://www.learnersguild.org
[npm]: https://www.npmjs.com/
[pg]: https://www.postgresql.org/
