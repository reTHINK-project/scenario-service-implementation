# Getting Started

**Note:** Quobis will keep this guide updated and we will try to keep as much stable as possible. However it is a work on progress so we recommend to check it periodically and in the event you find any error when deploying the environment.   

## Scenarios

### Using rethink hosted on Quobis

This is the most straightforward way to start. This server is public and can be used by the rest of partners . You only need to link rethink.js from Quobis server:
    
    <script src="https://rethink-app.quobis.com/.well-known/runtime/rethink.js"
    ></script>

> We need to discuss others ways to deploy Rethink module.

Then you can use rethink global variable in window object to install the runtime:

    let domain = "rethink-app.quobis.com"
    let runtimeLoader = window.rethink.default.install(domain);

Once the runtime is installed you can require hyperties and protostubs through the runtime instance.

    runtimeLoader.requireHyperty(hyperty)
        .then(hypertyDeployed)
        .catch(function(reason) {
          errorMessage(reason);
        });


In order to test your app you can server it locally using http-server:

    sudo http-server --cors -S -p 443 -C rethink-certificate.cert -K rethink-certificate.key 

### Using rethink hosted on your own server

You have the option to host runtime files on your own server. In this scenario the steps are pretty similar than before but changing the URIs to the right place.

The distribution files are on dev-registry-browser@master repo, on .well-known/runtime:

* rethink.js
* index.html
* core.js
* context-service.js

One thing to take into account is the domain parameter in installation process. Runtime will look for index.html|core.js|context-service.js using this convention https://*domain*/.well-known/runtime/*distribution-file*.

Addiotionally you need to place the resources folder on the root path. The resource folder conteins hyperties and protostubs descriptors.

Finally, it is needed to configure the protostub descriptors to connect to Quobis Server:
    
    "configuration": {
       "url": "wss://rethink-app.quobis.com:9090/ws"
     },
     
### Using your own environment

The last but not the least is setup all the environment in your own server. We used an updated Ubuntu 14.04.4 LTS Server to install all the services.

#### Dev registry domain

1. Clone dev-registry-domain@master repo on your server and run it:

        mvn compile exec:java
    
#### Dev msg node vertx

1. Clone dev-msg-node-vertx@dev-0.4 repo on the same server.
2. **(Optional)** Generate your own server-keystore.jks.
3. Set your configuration in node.config.json.
4. Run it:

        mvn compile exec:java -Dexec.args="9090"

#### Configure Runtime

From here you can follow the second scenario to configure the runtime to connect to your own server.


