Smart Contextual Assistance
---------------------------

### Summary

The Smart Contextual Assistance scenario is based on [D1.1 Contextual Enriched Communication in Smart Enterprises](https://github.com/reTHINK-project/use-cases/wiki/Contextual-Enriched-Communication-in-Smart-Enterprises) and is supported by an App delivering Human to Human communication and Human to Machine communication (IoT) features that automaticaly adapt according to users context. Thus, it behaves as a Smart Business Assistance app when the user is in a Work context or it behaves as a Smart Personal Assistance app when the user is in a Personal context. The Smart Business Assistance enables Alice to collaborate with co-workers, external partners using other similar applications, as well as with customers. In addition, the Smart Business Assistance enables Alice to control office rooms. The Smart Personal Assistance manages personal communications, enables the control of smart home devices and provides a personal wellness coach to assist user's wellbeing.

User's context can be derived from different sources including:

-	location
-	wearable devices including bracelet
-	communication parties
-	sensors in Alice's mobile
-	sensors in physical places where Alice is located
-	calendar
-	opened web documents

#### Summary of Required functionalities

The Smart Contextual Assistance requires the following major reTHINK functionalities:

**Phase 1**

-	Hyperty Runtime in Browser
-	Hyperty Runtime in Smartphone
-	Vertx Message Node and its associated Protostub
-	A second Message Node and its associated Protostub to test cross domain H2H Communication interoperability
-	Catalogue server as specified in D2.2 supporting protostub descriptors, Hyperty descriptors, Data Object Schema.
-	Domain Registry as specified in D2.2 supporting Hyperty Instance registration, Hyperty Data Object Instance registration
-	An IdP server and its associated IdP (Proxy) protostub
-	Account registration
-	Identity login
-	Authorisation
-	Identity association to Hyperty
-	Identity assertion
-	Chat and Group Chat
-	Human Presence

**Phase 2**

-	Hyperty Runtime in Nodejs
-	Discovery service
-	Hyperty Runtime in Kurento Media Server to support Group Communication
-	Catalogue server as specified in D2.3 supporting protostub descriptors, Hyperty descriptors, Data Object Schema, Hyperty Runtime descriptors.
-	Domain Registry as specified in D2.3 supporting Hyperty Instance registration, Hyperty Data Object Instance registration
-	Global Discovery
-	Machine / Object Discovery
-	Trust calculation / evaluation
-	File Sharing
-	Device Control / Actuation
