# x-custom-{client_name}-CP-customer-portal

## Development

### pom

Replace {client_name} placeholder with suitable names for artifacts and repos in scm settings.

### Frontend

Run the XTRF instance on the current machine or use one of [demo servers](https://knowledgebase.xtrf.eu/display/XTRFSupport/Demo+servers).

Go to the source directory.

```sh
$ cd src/main/webapp/src
```

Install dependencies.

```sh
$ npm install
$ bower install
```

Edit file `main-app/required/baseurl.js` using the chosen instance URL address and build number.

```js
baseURL = "https://x00XX-pc:8443/customer-api/";
buildNumber = "0000112233445566778899aaabbbcccdddeeefff";
```

Start the development environment.

```sh
$ grunt dev
```

Go to http://localhost:9001 and sign in.
