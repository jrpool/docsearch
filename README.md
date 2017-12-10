# docsearch

Web application offering browsing, search, and retrieval of documents from a repository, with user registration, authentication, and directory-specific authorization.

## Project Members

[Jonathan Pool](https://github.com/jrpool)

## Repository

https://github.com/jrpool/docsearch

## Discussion

### General

This application is a web server that manages, and provides selective access to, a repository of documents.

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

  - User identity capabilities:
    - Registration.
    - Login with temporary username (“UID”) issued on registration.
    - Login.
    - Logout.
    - Deregistration.

  - User document capabilities:
    - Browse through the directory tree.
    - Browser-based return to previous tree nodes.
    - *Breadcrumb-based return to previous tree nodes.
    - Display and download specific documents.
    - *Search with query strings for documents a user is authorized to see.
    - Filesystem-based document addition and deletion.
    - *Browser-based document addition and deletion.

  - Role-based document access:
    - Distinct permissions for reading, adding, and deleting.
    - Directory-specific permissions.
    - Propagation of permissions to subdirectories.
    - Multi-role users having the union of their role permissions.
    - Pruning of redundant entries in displayed directory trees.

  - Administrator (“curator”) capabilities:
    - File-based customization of the application configuration (see below).
    - Registration as a curator with a secret code.
    - *Web-based definition of user roles (“categories”).
    - *Web-based assignment of permissions to categories.
    - Assignment of users to categories.
    - Assignment of permanent UIDs to users.
    - Editing of user registration records.
    - Deregistration of users.

  - Email notices:
    - Events triggering notices:
      - User registration.
      - User deregistration.
      - Curator editing of a user registration record.
      - Curator deregistration of a user.
    - Parties receiving notices:
      - Affected user.
      - Performing curator.
      - Application administrator.

  - Localization:
    - File-based whole-application language localization.
    - *User-based dynamic localization.

Suggestions on priorities for the further development of the project, and of course bug reports, are welcome. Feel free to [file issues at the repository](https://github.com/jrpool/docsearch/issues).

## Demonstration

You can try a live [demonstration version of this application](http://jpdev.pro), with a small directory tree of sample documents.

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
    - `PGDATABASE` and `PGUSER` must be unique to this installation if you have multiple installations on the same host. They both are deleted and recreated in the course of installation, so `PGUSER` should exist only for this installation.
    - `PORT` is the port the application will listen for requests on. If users will connect directly from outside the host, make it a port that the host’s firewall permits incoming traffic to address. If users will connect via a reverse proxy server, make it a port that the host’s firewall does **not** permit incoming traffic to address. (The former is considered secure only if user clients are on the same host as the application, because otherwise unencrypted transmission of all content, including passwords and confidential documents, will occur.
    - The `TEMP_UID_MAX` value is the largest number of registrants you expect to still have temporary UIDs at the same time, before curators assign permanent UIDs to them.
    - `URL` is the URL the application will tell users to use in reaching the application. Whether it specifies `http` or `https` depends on the user’s required behavior, not on the protocol used by the application itself (see the next paragraph).
    - Decide whether to make the application require the `https` protocol. You may have it use `http` and still require users to connect with `https`, by passing all requests through a reverse proxy server that communicates with users via `https` but with the application via `http`. The demonstration version does this. It uses [Nginx][nginx] as a reverse proxy server, with credentials obtained from [`certbot`][certbot] and [`letsencrypt`][le].
      - If `https`:
        - Set `HTTPS_CERT` to the path to your SSL/TLS certificate.
        - Set `HTTPS_KEY` to the path to your SSL/TLS private key.
        - Set `PROTOCOL` to `https`.
      - If `http`:
        - Set `HTTPS_CERT` to `''`.
        - Set `HTTPS_KEY` to `''`.
        - Set `PROTOCOL` to `http`.

    ```
    COOKIE_EXPIRE_DAYS=7
    CURATOR_CAT=0
    CURATOR_KEY=ASecretKey
    DOC_DIR=docs
    DOMAIN=yourdomain.org
    FROM_EMAIL=noreply@yourdomain.org
    FROM_NAME='Documents from Your Organization'
    HTTPS_CERT=/etc/letsencrypt/live/yourdomain.org/fullchain.pem
    HTTPS_KEY=/etc/letsencrypt/live/yourdomain.org/privkey.pem
    LANG=eng
    LINK_PREFIX=/ds
    MSGS=msgs
    NODE_ENV=production
    PGDATABASE=docrepo
    PGHOST=localhost
    PGPASSWORD=null
    PGPORT=5432
    PGUSER=docmaster
    # PORT must be 1024 or greater to allow a non-root process owner.
    PORT=3000
    PROTOCOL=https
    PUBLIC_CAT=1
    REG_EMAIL=admin@yourdomain.org
    REG_NAME='Your Administrator'
    SECRET=AnAuthenticationSecret
    SEED_DIR=seed
    SENDGRID_API_KEY=wHaTeVer.SenDGriDgIvEs.YoU
    TEMP_UID_MAX=3
    URL=https://www.yourdomain.org/ds
    ```

1. Install required dependencies (you can see them listed in `package.json`) by executing `npm i`. The dependencies that this installs will depend on whether you defined the Node environment as `development` or `production` in step 0.

1. Create your document directory (named in `.env` as `DOC_DIR`) inside `public`, as the root of your repository. Populate it with subdirectories and files. You may include symbolic links in it, and users with access to those links will also have access to the files and directories that they reference. This feature offers you the ability to grant multiple categories of users access to a particular file or directory without the need to make copies of it. But the feature requires care, because it is possible to mistakenly include a symbolic link to directories and files, anywhere in your file system, that you intend not to disclose.

1. Create your seed directory (named in `.env` as `SEED_DIR`) inside `src/db`. Copy the `demoseed` files into it. Edit them to define the categories of users you want to have and their access rights to directories in your repository. The user access rights must conform to this application’s **fundamental principle** that permission to do something to a directory implies permission to do the same thing to all of its descendants. The names of categories in `seedcat.sql` are internal to the database, so they should each begin with a letter or `_` and contain only letters, digits, and `_` (thus, no spaces).

1. Copy `src/server/demomsgs.js` into the same `src/server` directory, giving your copy the name you specified as `MSGS`. In your copy, modify the values of the properties in the `eng` object to conform to your requirements. Among the properties that you will probably need to redefine are `accessText`, `cats`, `docsTitle`, `footText`, `introText`, and `usrEtc`.

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
