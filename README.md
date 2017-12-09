# docsearch

Web application offering browsing, search, and retrieval of documents from a repository, with user registration, authentication, and directory-specific authorization.

## Project Members

[Jonathan Pool](https://github.com/jrpool)

## Repository

https://github.com/jrpool/docsearch

## Discussion

### General

This application is a web server that manager, and provides selective access to, a repository of documents.

The intended use case is a person or organization that has possession, on its own server, of a collection of documents in various formats and wants to make various parts of the collection accessible for various actions by various categories of users using web browsers.

The application classifies, indexes, and searches documents in all of the formats supported by [Apache Tika][tika].

### Origin

This project is being developed at [Learners Guild][lg] in the course of an apprenticeship in full-stack web development. The learning objectives served by the project include:

  - Encrypted server-client communication
  - Authentication
  - Cookie-based session persistence
  - Role-based authorization
  - Web-database integration
  - Web-email integration
  - User administration
  - Web-filesystem integration
  - File-access permission management
  - Cross-format document relevance discovery
  - Document display and delivery
  - Controlled distributed document repository modification
  - Security of administrative and user secrets
  - Internationalization/localization
  - Protection of customizations from deletion by updates
  - Usability

The tools used in the implementation include HTML, CSS, JavaScript, [Apache `solr`][solr], [`bcrypt`][bcrypt], [`body-parser`][bp], [`dotenv`][dotenv], [`ejs`][ejs], [`express`][ex], [`express-session`][exs], [`session-file-store`][sfs], [`PostgreSQL`][pg], [`pg`][nodepg] (node-postgres), the [SendGrid Web API][sgweb], and [`PM2`][pm2].

### Functionalities

The application is a work in progress. Its intended functionalites include the following (“*” = not yet implemented):

  - User-document interactions:
    - Browse through the directory tree.
    - Display and download specific documents.
    - *Search with query strings for documents a user is authorized to see.
    - *Add a document to the collection.
    - *Delete a document from the collection.

  - Role-based document access:
    - Distinct permissions for reading, adding, and deleting.
    - Multiple roles per user.
    - Pruning of redundant entries in browsable directory trees.

  - 

- Anybody can register as a user.

- There is at least 1 “curator” (super-user). Instructions for becoming a curator are in the last paragraph of this document.

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
dynamic localization
```

Suggestions on priorities for the further development of the project, and of course bug reports, are welcome. Feel free to [file issues at the repository](https://github.com/jrpool/docsearch/issues).

## Demonstration

You can try a live [demonstration version of this application](https://jpdev.pro/ds), with a small directory tree of sample documents.

As distributed for installation, this application is configured to allow you to replicate that demonstration, including the sample documents.

To navigate back up the tree when browsing, use the browser’s back button.

## Installation

1. These instructions presuppose that (1) [npm][npm] and [PostgreSQL][pg] are installed, (2) there is a PostgreSQL database cluster, (3) PostgreSQL is running, (4) when you connect to the cluster you are a PostgreSQL superuser, and (5) your PostgreSQL configuration permits trusted local IPv4 connections from you and from the `solr` PostgreSQL user that this application will create. If you get authentication errors running the `revive_db` script described below, you can edit your `pg_hba.conf` file, which may be located in `/etc/postgresql/«version»/main` or `/usr/local/var/postgres`. Insert the following lines above the existing similar line of type `host`, then restart postgreSQL with the applicable command on your server, such as `sudo service postgresql restart` or `pg_ctl restart`.

  ```
  host  all  «you»  127.0.0.1/32  trust
  host  all  solr   127.0.0.1/32  trust
  ```

1. Your copy of this project will be located in its own directory, inside some other directory that you may choose or create. For example, to create that parent directory inside your own home directory’s `Documents` subdirectory and call it `projects`, you can execute:

  `mkdir ~/Documents/projects`

  Make that parent directory your working directory, by executing, for example:

  `cd ~/Documents/projects`

1. Clone this project’s repository into it, thereby creating the project directory, named `docsearch`, by executing:

  `git clone https://github.com/jrpool/auth.git docsearch`

1. Make the project directory your working directory by executing:

  `cd docsearch`

1. Create a directory named `sessions` by executing:

  `mkdir sessions`

1. Create a log directory and a file for log entries by executing:

  ```
  mkdir logs
  touch logs/access.logs
  ```

1. Obtain an account at [SendGrid](https://sendgrid.com/). For development or light production use, the free plan with a limit of 100 messages per day will suffice. (Each complete user registration entails sending 4 messages.) Note the API key that SendGrid issues to you.

## Configuration

1. Create a file named `.env` at the root of your project directory and populate it with the following content, amended as you wish. This file will be protected from modification by any updates of the application. Details:

  - `CURATOR_CAT` and `PUBLIC_CAT` are the categories the users in which are to have the access rights of curators (maximum rights) and of the general public (minimum rights), respectively.
  - `DOC_DIR`, `SEED_DIR`, and `MSGS` should have the values `demodocs`, `demoseed`, and `demomsgs` while you are running the demonstration. When you add your own data and configuration, change these to match the names you give to your directories in the `public` and `src/db` directories and the file containing your messages. Updates of the application may update `demodocs`, `demoseed`, and `demomsgs`, but will not interfere with your own customizations of these, as long as you give them different names.
  - `LINK_PREFIX` is equal to any application prefix you use with a reverse proxy server, or `''` if none. For example, if requests to `https://yourdomain.org/docs/…` are passed to the application, the value should be `/docs`.
  - If you are doing development on the application, change the value of `NODE_ENV` from `production` to `development`.
  - See below for information about the `LANG` variable, and above for information about the `SENDGRID_API_KEY` variable.
  - The `TEMP_UID_MAX` value is the largest number of registrants you expect to still have temporary UIDs at the same time, before curators assign permanent UIDs to them.
  - Decide whether to require users to connect with the `https` protocol. The demonstration version is an example of the application with `http` chosen, but with all requests from outside the server forced to use `https` and those requests and their responses channeled through an [Nginx][nginx] reverse proxy server, using credentials from [`certbot`][certbot] and [`letsencrypt`][le], and using `http` to communicate with the application.
    - If `https`:
      - Set `HTTPS_CERT` to the path to your SSL/TLS certificate.
      - Set `HTTPS_KEY` to the path to your SSL/TLS private key.
      - Set `PROTOCOL` to `https`.
    - If `http`:
      - Set `HTTPS_CERT` to `''`.
      - Set `HTTPS_KEY` to `''`.
      - Set `PORT` to a port that the server’s firewall does not permit traffic from outside the server to address (if you are using `https` with a reverse proxy server).
      - Set `PROTOCOL` to `http`.

  ```
  COOKIE_EXPIRE_DAYS=7
  CURATOR_CAT=0
  CURATOR_KEY=ASecretKey
  DOC_DIR=docs
  DOMAIN=yourdomain.org
  FROM_EMAIL=noreply@yourdomain.org
  FROM_NAME=Documents from Your Organization
  HTTPS_CERT=/etc/letsencrypt/live/yourdomain.org/fullchain.pem
  HTTPS_KEY=/etc/letsencrypt/live/yourdomain.org/privkey.pem
  LANG=eng
  LINK_PREFIX=/ds
  MSGS=msgs
  NODE_ENV=production
  PGDATABASE=docsearch
  PGHOST=localhost
  PGPASSWORD=null
  PGPORT=5432
  PGUSER=solr
  # PORT must be 1024 or greater to allow a non-root process owner.
  PORT=3000
  PROTOCOL=https
  PUBLIC_CAT=1
  REG_EMAIL=admin@yourdomain.org
  REG_NAME=Your Administrator
  SECRET=AnAuthenticationSecret
  SEED_DIR=seed
  SENDGRID_API_KEY=wHaTeVer.SenDGriDgIvEs.YoU
  TEMP_UID_MAX=3
  URL=https://www.yourdomain.org/ds
  ```

1. Install required dependencies (you can see them listed in `package.json`) by executing `npm i`. The dependencies that this installs will depend on whether you defined the Node environment as `development` or `production` in step 0.

1. Create your document directory (named in `.env` as `DOC_DIR`) inside `public`, as the root of your repository. Populate it with subdirectories an files. You may include symbolic links in it, and users with access to those links will also have access to the files and directories that they reference. This feature offers you the ability to grant multiple categories of users access to a particular file or directory without the need to make copies of it. But the feature requires care, because it is possible to mistakenly include a symbolic link to directories and files, anywhere in your file system, that you intend not to disclose.

1. Create your seed directory (named in `.env` as `SEED_DIR`) inside `src/db`. Copy the `demoseed` files into it. Edit them to define the categories of users you want to have and their access rights to directories in your repository. The user access rights must conform to this application’s **fundamental principle** that permission to do something to a directory implies permission to do the same thing to all of its descendants.

1. Modify the values of the properties in the `eng` object in your message file (the one alongside or replacing `src/server/demomsgs.js`), to conform to your requirements. Among the properties that you will probably need to redefine are `accessText`, `cats`, `footText`, `introText`, and `usrEtc`.

1. If you wish to add an additional language, add an object like `eng` to your message file, replacing the English values of the properties with strings in the other language. Name the new object with the [ISO 639-3 alpha-3 code](http://www-01.sil.org/iso639-3/codes.asp) of that language. Add it to the export list at the end of the file. To make that language the language of the application’s user interface, replace `eng` with that code as the value of the `LANG` environment variable in your `.env` file. This version of the application does not yet support on-the-fly localization per user or browser preferences.

## Execution

1. Once the application is installed, create and populate the database by executing `npm run revive_db`.

1. There are 3 ways to start the application. In each case, make the project directory your working directory first.

  - If you have chosen to install a development environment, execute `npm run start_dev`. This will run the application under `nodemon`, automatically restarting the application when you change files or their content, to ensure that the changes are live.

  - If you have installed a production environment and want to test it, execute `npm start`.

  - If you have installed a production environment and want to launch it as a daemon, so it is detached from your command-line environment and it restarts when the server reboots, execute `npm run start_daemon`. If you want to stop the application after that, execute `npm run stop_daemon`. (On some systems it is necessary to execute these commands as a superuser, namely as `sudo npm run start_dev` and `sudo npm run stop_daemon`.)

  - In a production environment, both start methods cannot be relied on to adapt to any changes you make in the code. So, if you have made changes and want to test them, stop the application with `CONTROL-c` or `npm run stop_daemon` and then start it again.

1. To access the application while it is running, use a web browser to request the application’s port on your server, such as:

  ```
  http://localhost:3000
  https://www.yourserver.org/ds
  ```

1. When you access the application with your browser, register yourself as a curator. To obtain curator status, enter the CURATOR_KEY value into the “For administrative use” text field. Then, when you log in, you will be a curator.

[bcrypt]: https://www.npmjs.com/package/bcrypt
[bp]: https://www.npmjs.com/package/body-parser
[certbot]: https://certbot.eff.org/#ubuntuxenial-other
[dotenv]: https://www.npmjs.com/package/dotenv
[ejs]: https://www.npmjs.com/package/ejs
[ex]: https://www.npmjs.com/package/express
[exs]: https://www.npmjs.com/package/express-session
[le]: https://letsencrypt.org/
[lg]: https://www.learnersguild.org
[nginx]: http://nginx.org/en/
[nodepg]: https://www.npmjs.com/package/pg
[npm]: https://www.npmjs.com/
[pg]: https://www.postgresql.org/
[pm2]: https://www.npmjs.com/package/pm2
[sfs]: https://www.npmjs.com/package/session-file-store
[sgweb]: https://sendgrid.com/docs/API_Reference/api_v3.html
[solr]: http://lucene.apache.org/solr/
[tika]: http://tika.apache.org/1.16/formats.html
