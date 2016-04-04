# Getting Started

## Scenarios

### Using rethink hosted on Quobis

This is the most straightforward way to start. You only need to link rethink.js from Quobis server:
    
    <script src="https://rethink-app.quobis.com/.well-known/runtime/rethink.js"
    ></script>

> We need discuss about others ways to deploy Rethink module.

Then you can use rethink global variable in window object to install the runtime:

    let domain = "rethink-app.quobis.com"
    let runtimeLoader = window.rethink.install(domain);

Once the runtime is installed you can require hyperties and protostubs through the runtime instance.

    runtimeLoader.requireHyperty(hyperty)
        .then(hypertyDeployed)
        .catch(function(reason) {
          errorMessage(reason);
        });


In order to test your app you can server it locally using http-server:

    sudo http-server --cors -S -p 443 -C rethink-certificate.cert -K rethink-certificate.key 

### Using local hosted files




### Using youe own environment


