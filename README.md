# docsearch

Web application offering search and retrieval of documents from a repository, with user registration, authentication, and directory-specific authorization.

## Project Members

[Jonathan Pool](https://github.com/jrpool)

## Repository

https://github.com/jrpool/docsearch

## Discussion

### General

This application demonstrates the use of HTML, CSS, JavaScript, Apache `solr`, `bcrypt`, `body-parser`, `dotenv`, `ejs`, `express`, `express-session`, `session-file-store`, `PostgreSQL`, `pg` (node-postgres), and SendGrid to create a web server managing, and providing selective access to, a repository of documents.

The use case addressed by this application is a person or organization that has possession, on its own server, of a collection of documents in various formats and wants to make various parts of the collection accessible for various actions by various categories of users using web browsers.

-- Document formats for which the application intends to extract and analyze text content to support relevance discovery are <a href="http://tika.apache.org/1.16/formats.html">those supported by Apache Tika</a>.

-- Possible user actions are:
    -- Browse through the directory tree.
    -- Display and download specific documents.
    -- Search with query strings for documents a user is authorized to see.
    -- Add a document to the collection.
    -- Delete a document from the collection.

-- Anybody can register as a user.

-- There are between 1 and 26 “curators” (super-users). Any person automatically becomes a curator by including the `CURATOR_KEY` string in the `admin` field of the registration form. This key is kept secret and is disclosed only to those who should become curators.

-- Once a user is registered, the user can log in, and if the user accesses the site within the cookie expiration time, it will not be necessary to log in again.

-- Registration includes making claims as to the categories that the user belongs to. Membership in categories is what determines the access to the collection that a user has. A registrant’s claims are not automatically trusted. Curators decide which categories users actually belong to.

-- Registration also includes being issued a temporary user ID (UID) to enable logins. Curators decide on permanent UIDs for users.

-- Users can log in and out and, once registered, can deregister themselves. Curators, can amend users’ registration records and deregister users.

-- The repository administration gets an email notice of each registration, registration amendment, and deregistration. Normally, after receiving a registration notice, a curator amends the registration record to replace the temporary UID with a durable one. When a curator acts on a user’s registration record, email notices are sent to the curator, the repository administration, and the affected user.

### Implementation notes

This application is currently a “minimum viable product”. This version is missing:

```
search
file addition
file deletion
category curation
directory permission curation
```

Suggestions on priorities for the further development of the project are welcome.

## Installation

0. These instructions presuppose that (1) [npm][npm] and [PostgreSQL][pg] are installed, (2) there is a PostgreSQL database cluster, (3) PostgreSQL is running, and (4) when you connect to the cluster you are a PostgreSQL superuser.

1. Your copy of this project will be located in its own directory, inside some other directory that you may choose or create. For example, to create that parent directory inside your own home directory’s `Documents` subdirectory and call it `projects`, you can execute:

    `mkdir ~/Documents/projects`

Make that parent directory your working directory, by executing, for example:

    `cd ~/Documents/projects`

2. Clone this project’s repository into it, thereby creating the project directory, named `docsearch`, by executing:

    `git clone https://github.com/jrpool/auth.git docsearch`

3. Make the project directory your working directory by executing:

    `cd docsearch`

4. Obtain an account at SendGrid. For development or light production use, the free plan with a limit of 100 messages per day will suffice. (Each complete user registration entails sending 4 messages.) Note the API key that SendGrid issues to you.

## Configuration

1. Create a file named `.env` in the project directory and populate it with the following content, where you will replace any parts that begin and end with “«»”. Details:

- The `TEMP_UID_MAX` value is the largest number of registrants you expect to still have temporary UIDs before curators assign permanent IDs to them.
- `CURATOR_CAT` and `PUBLIC_CAT` are the categories the users in which are to have the rights of curators (maximum rights) and of the general public (minimum rights), respectively.
- If you are only running the application and not developing it, change the value of `NODE_ENV` to `production`.

```
NODE_ENV='«development»'
CURATOR_KEY='«somethingSecret»'
PGHOST='localhost'
PGUSER='solr'
PGDATABASE='docsearch'
PGPASSWORD='null'
PGPORT='«5432»'
PORT='«3000»'
SECRET='«somethingElseSecret»'
SENDGRID_API_KEY='«SHGCPHTDI.0987LRLCGlnh45ntsh2390»'
LANG='eng'
CURATOR_CAT='«0»'
PUBLIC_CAT='«1»'
REG_EMAIL='«your_username@domain.ext»'
REG_NAME='«Your Name»'
FROM_EMAIL='«webmaster@domain.ext»'
FROM_NAME='«Sender Name»'
COOKIE_EXPIRE_DAYS='«7»'
TEMP_UID_MAX='«3»'
```

2. Install required dependencies (you can see them listed in `package.json`) by executing `npm i`. The dependencies that this installs will depend on whether you defined the Node environment as `development` or `production` in the previous step.

3. The `public/docs` directory is the root of your repository. Populate it with directories and files as needed.

4. To customize your list of user categories and the directories that users in those categories have permission to see, add files to, or delete, edit the files `seedcat.sql` and `seeddir.sql` in the `src/db/config` directory. It is important to observe the application’s fundamental principle that permission to do something to a directory implies permission to do the same thing to all of its descendants.

5. Modify the values of the properties in the `eng` object in the file `src/server/utic.js`, to conform to your requirements.

6. If you wish to add an additional language, add an object like `eng` to the `src/server/util.js` file, replacing the English values of the properties with strings in the other language. Name the new object with the ISO 639-3 alpha-3 code of that language. To make that language the language of the application’s user interface, replace `eng` with that code as the value of the `LG` environment variable in the `.env` file. This version of the application does not yet support on-the-fly localization.

## Execution

1. To create and populate the database, execute `npm run revive_db`.

2. To start the application, execute `npm start`.

3. To access the application while it is running, use a web browser to request this URL (replacing `«PORT»` with the value of the `PORT` environment variable):

`http://localhost:«PORT»/`

4. In the application, register yourself as a curator. To obtain curator permissions, on the registration form put the CURATOR_KEY value into the “For administrative use” text field.

[lg]: https://www.learnersguild.org
[npm]: https://www.npmjs.com/
[pg]: https://www.postgresql.org/
