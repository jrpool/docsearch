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

- Document formats for which the application intends to extract and analyze text content to support relevance discovery are <a href="http://tika.apache.org/1.16/formats.html">those supported by Apache Tika</a>.

- Possible user actions are:
    - Browse through the directory tree.
    - Display and download specific documents.
    - Search with query strings for documents a user is authorized to see.
    - Add a document to the collection.
    - Delete a document from the collection.

- Anybody can register as a user.

- There are between 1 and 26 “curators” (super-users). Any person automatically becomes a curator by including the `CURATOR_KEY` string in the `admin` field of the registration form. This key is kept secret and is disclosed only to those who should become curators.

- Once a user is registered, the user can log in and, if the user accesses the site within the cookie expiration time, it will not be necessary to log in again.

- Registration includes making claims as to the categories that the user belongs to. Membership in categories determines the access to the collection that a user has. A registrant’s claims are not automatically trusted. Curators decide which categories users really belong to.

- Registration also includes being issued a temporary user ID (UID) to enable logins. Curators decide on permanent UIDs for users.

- Users can log in and out and, once registered, can deregister themselves. Curators can amend users’ registration records and deregister users.

- The repository administration gets an email notice of each registration, registration amendment, and deregistration. Normally, after receiving a registration notice, a curator amends the registration record to replace the temporary UID with a durable one. When a curator acts on a user’s registration record, email notices are sent to the curator, the repository administration, and the affected user.

### Implementation notes

This application is currently a “minimum viable product”. This version is missing:

```
search
file addition
file deletion
category curation
directory permission curation
https
```

Suggestions on priorities for the further development of the project are welcome. Feel free to [file issues at the repository](https://github.com/jrpool/docsearch/issues).

## Installation

0. These instructions presuppose that (1) [npm][npm] and [PostgreSQL][pg] are installed, (2) there is a PostgreSQL database cluster, (3) PostgreSQL is running, (4) when you connect to the cluster you are a PostgreSQL superuser, and your PostgreSQL configuration permits trusted local IPv4 connections from you and from the `solr` PostgreSQL user that this application will create. If you get authentication errors running the `revive_db` script described below, you can edit your `pg_hba.conf` file, which may be located in `/etc/postgresql/«version»/main` or `/usr/local/var/postgres`. Insert the following lines above the existing line of type `host`, then restart postgreSQL with the applicable command on your server, such as `sudo service postgresql restart` or `pg_ctl restart`.

```
host    all             «you»           127.0.0.1/32             trust
host    all             solr            127.0.0.1/32             trust
```

1. Your copy of this project will be located in its own directory, inside some other directory that you may choose or create. For example, to create that parent directory inside your own home directory’s `Documents` subdirectory and call it `projects`, you can execute:

    `mkdir ~/Documents/projects`

Make that parent directory your working directory, by executing, for example:

    `cd ~/Documents/projects`

2. Clone this project’s repository into it, thereby creating the project directory, named `docsearch`, by executing:

    `git clone https://github.com/jrpool/auth.git docsearch`

3. Make the project directory your working directory by executing:

    `cd docsearch`

4. Create a directory named `sessions` by executing:

    `mkdir sessions`

5. Create a log directory and a file for log entries by executing:

```
    mkdir logs
    touch logs/access.logs
```

6. Obtain an account at SendGrid. For development or light production use, the free plan with a limit of 100 messages per day will suffice. (Each complete user registration entails sending 4 messages.) Note the API key that SendGrid issues to you.

## Configuration

0. Create a file named `.env` at the root of your project directory and populate it with the following content, amended as you wish. This file will be protected from modification by any updates of the application. Details:

- `CURATOR_CAT` and `PUBLIC_CAT` are the categories the users in which are to have the access rights of curators (maximum rights) and of the general public (minimum rights), respectively.
- If you are doing development on the application, change the value of `NODE_ENV` from `production` to `development`.
- See below for information about the `LANG` variable, and above for information about the `SENDGRID_API_KEY` variable.
- The `TEMP_UID_MAX` value is the largest number of registrants you expect to still have temporary UIDs before curators assign permanent IDs to them.

```
COOKIE_EXPIRE_DAYS=7
CURATOR_CAT=0
CURATOR_KEY=ASecretKey
DOMAIN=yourdomain.org
FROM_EMAIL=noreply@yourdomain.org
FROM_NAME=Documents from Your Organization
LANG=eng
NODE_ENV=production
PGDATABASE=docsearch
PGHOST=localhost
PGPASSWORD=null
PGPORT=5432
PGUSER=solr
PORT=3000
PUBLIC_CAT=1
REG_EMAIL=admin@yourdomain.org
REG_NAME=Your Administrator
SECRET=AnAuthenticationSecret
SENDGRID_API_KEY=wHaTeVer.SenDGriDgIvEs.YoU
TEMP_UID_MAX=3
URL=http://www.yourdomain.org
```

1. Ensure that non-local users can reach the application at the port you have chosen (see below under “Execution”). If they cannot, modify the server configuration to enable this access. If you have `ufw` installed, you can execute `ufw status` to see what is allowed. If the required port is not allowed, you can add it by executing `ufw allow 3000` (or such other port as you have chosen).

2. Install required dependencies (you can see them listed in `package.json`) by executing `npm i`. The dependencies that this installs will depend on whether you defined the Node environment as `development` or `production` in the previous step.

3. The `public/docs` directory is the root of your repository. Populate it with directories and files as needed. You may include symbolic links in it, and users with access to those links will also have access to the files and directories that they reference. The feature offers you the ability to grant multiple categories of users access to a particular file or directory without the need to make copies of it. But the feature requires care, because it is possible to mistakenly include a symbolic link to directories and files, anywhere in your file system, that you intend not to disclose.

4. To customize your list of user categories and the directories that users in those categories have permission to see, add files to, or delete, edit the files `seedcat.sql` and `seeddir.sql` in the `src/db/config` directory. It is important to observe the application’s fundamental principle that permission to do something to a directory implies permission to do the same thing to all of its descendants.

5. Modify the values of the properties in the `eng` object in the file `src/server/utic.js`, to conform to your requirements.

6. If you wish to add an additional language, add an object like `eng` to the `src/server/util.js` file, replacing the English values of the properties with strings in the other language. Name the new object with the ISO 639-3 alpha-3 code of that language. To make that language the language of the application’s user interface, replace `eng` with that code as the value of the `LANG` environment variable in the `.env` file. This version of the application does not yet support on-the-fly localization.

## Execution

0. To create and populate the database, execute `npm run revive_db`.

1. To start the application, execute `npm start` (or, if in a development environment, `npm run start_dev`).

2. To access the application while it is running, use a web browser to request the application’s port on your server, such as:

```
http://localhost:3000
http://www.yourserver.org:3000
```

3. When you access the application with your browser, register yourself as a curator. To obtain curator status, enter the CURATOR_KEY value into the “For administrative use” text field. Then, when you log in, you will be a curator.

[lg]: https://www.learnersguild.org
[npm]: https://www.npmjs.com/
[pg]: https://www.postgresql.org/
