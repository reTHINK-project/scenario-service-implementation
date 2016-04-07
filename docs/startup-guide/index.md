#Developer welcome page

##Introduction
The goal of this page is to be a starting point for developers of hyperties and applications from WP5. There is a lot of documentation generated and updated by other WPs so this guide just points to the right documentation and makes some clarifications which can be welcome for begginers.

We encourage the developers to read the [dev-service-framework](https://github.com/reTHINK-project/dev-service-framework#getting-started) documentation, specially the [Getting started pages](https://github.com/reTHINK-project/dev-service-framework#getting-started).

##Developing hyperties

This  document released by WP3 [Hyperty Development Toolkit](https://github.com/reTHINK-project/dev-hyperty-toolkit/tree/develop) explains how to start programming a new hyperty. With this guide you an start now to develop the code of your hyperties using the core runtime in a browser.
However guides to use the hyperties in the  the definitive runtimes: [browser runtime](https://github.com/reTHINK-project/dev-runtime-browser), [standalone Apps runtime](https://github.com/reTHINK-project/dev-standalone-apps) and NodeJS runtimes will be released as soon as there is a stable runtime usable (browser runtime will be available very soon). The code of the hyperties should remain unchanged to be executed in the definitive runtimes (this is one of goals of reTHINK!) however the Web App may change a little bit. All the hyperties should be usable in any runtime (Browser, Nodejs and Standalone App) however the developer should use the one the hyperty being developed is aimed to. 

##The enviroment to develop and test my hyperties and Apps 
To develop and test the hyperties is necessary to use an enviroment with the main elements of the reTHINK architecture (namely Message Node, Registry Domain and Catalogue Server). 
The [Hyperty Development Toolkit](https://github.com/reTHINK-project/dev-hyperty-toolkit/tree/develop) explains how to use the [**Message Node**](https://github.com/reTHINK-project/core-framework/tree/master/docs/specs/msg-node) and the [**Registry Domain**](https://github.com/reTHINK-project/dev-registry-domain/tree/master/docs) hosted in a PT's public server. 

The [**Catalogue server**](https://github.com/reTHINK-project/dev-catalogue/tree/master/doc) (the other essential service) in the reTHINK architecture is being "simulated" right now by a "local-catalogue" which is web-server which serves the files which has to be provided by the Catalogue Server developed by Fokus. The core-runtime is expected to  use the Catalogue Server soon but it shouldn't affect the development of the hyperties. This is just to let you know this. 

###Using external hosted servers
The hosted enviroment allows the developer to save time getting a working environment form the begining. In the [Hyperty Development Toolkit](https://github.com/reTHINK-project/dev-hyperty-toolkit/tree/develop) is explained how to use PTs server to test your hyperties. Quobis also explains how to use its public server to test hyperties and Apps in its [guide](https://github.com/reTHINK-project/dev-runtime-browser/blob/master/startup_guide.md)

###Using your own servers
The developer can also deploy her own server with Message Node and Registry Domain (and soon Catalogue server). Quobis created [this guide](https://github.com/reTHINK-project/dev-runtime-browser/blob/master/startup_guide.md) based on our experience to get the services working to develop the browser runtime.  

##Informal explanation of reTHINK servers. 

Please refer to the official doc to understand perfectly the role and functions of a each element of the reTHINK architecture. However we consider helpful to provide an informal overview of the elements:

**Message Node:**  it is the element in charge of exchanging the messages between hyperties and between hyperties an other of elements of the reTHINK architecture (for example the Registry Domain). There are three reTHINK standard compliant Message Nodes available implemented with different technologies: [Vertx](https://github.com/reTHINK-project/dev-msg-node-vertx), [NodeJS](https://github.com/reTHINK-project/dev-msg-node-nodejs) and [Matrix](https://github.com/reTHINK-project/dev-msg-node-matrix). The Message Node functions and messages are defined [here](https://github.com/reTHINK-project/core-framework/tree/master/docs/specs/msg-nod).

**Registry Domain:** it is the element in charge of registering the hyperties and making them publicly accessible to the rest of hyperties. You can find all the doc [here](https://github.com/reTHINK-project/dev-registry-domain/tree/master/docs)

**Catalogue server:** is the element in charge of serving the re-usable pieces of code (hyperties, protostubs, core runtime files) in reTHINK. You can find all the doc [here](https://github.com/reTHINK-project/dev-catalogue/tree/master/doc
).


