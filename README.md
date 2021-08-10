# SmartSearch bundle demo

This demopage uses the smartsearch.js bundle to send requests to a smartsearch backend and render the search results.

## How to run

There are multiple ways to run this demo. In both methods you will have to configure 2 variables.

SMARTSEARCH_URL: This is the base url of your api-gateway
SMARTSEARCH_PS: This is the name of your prepared search

### Using docker

You can build a docker container using the following command

```bash
docker build . -t smartsearch-demo:latest
```

You can run the container using the following command

```bash
docker run -p 12345:80 -e SMARTSEARCH_PS=prepared_search -e SMARTSEARCH_URL=api-gateway-url smartsearch-demo:latest
```

This command includes the configuration of aforementioned variables. You can access the demo at http://localhost:12345

### Using live-server

If you have npm installed you can run the demo by running the live-server command. In this case you have to create a file called `env.js` in the `config` folder and add the following code to it.

```javascript
window._env_ = {
    smartsearchURL: "the url of your api-gateway",
    preparedSearch: "the name of your prepared search"
}
```

Then you should be able to run the demo using the following command

```
npx live-server . port=12345
```

You can then access it on your browser at http://localhost:12345