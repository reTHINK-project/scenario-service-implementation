Dummy Header for Section 1 per ToC
==================================

Usage Scenarios Description
===========================

Neighborhood App - Football group
----------------------------------

###User perspective
*Textual description of the scenario including the main use cases to be supported. Refer as much as possible to use cases defined in D1.1.*

Imagine Bob as a user of the communication service “Participate”. Recently Bob has moved to Berlin, Charlottenburg and wants to meet new friends with similar hobbies and interests in his new neighborhood. He creates a new tab in his “Participate” app and calls it “football group”.  He writes an invitation “Hi, interested in playing football in the Tiergarten, this Sunday 12:00?" and sends it to "Berlin Charlottenburg, like playing football". As a result Bob’s contact request will be delivered to all neighbors with a published profile in the internet, which matches with Bob’s search request, i.e. where “location” equals “Berlin Charlottenburg” and “hobbies” equals “like playing football”. Contacted people might be subscribers of different communication services, precondition is just that the communication service provides a downloadable protocol stub for Bob’s “Participate” app to initiate a cross-domain conversation. All neighbors of Bob, who retrieve Bob’s invitation in their inbox are free to answer or reject it. In case of neighbors who answer Bob’s invitation Bob has the possibility to add the interested neighbor to his football group. Bob has the possibility to start a group audio or video call or a group chat with all the members of his football group across network boarders.

How it works in detail:

Imagine Alice as subscriber of the communication service "TalkNow". Because "TalkNow" is a reThink compatible communication service, Alice is also registered in the gobal registry, where the descriptor of her communication endpoint at “TalkNow” is saved. In order to be detectable for others across networks and domains, Alice creates her own profile in a discovery service “Connect”, which includes her full name, location, profession, hobby and her registry key.  Her full profile consists of both, data, which Alice doesn’t want to publish in the internet like e.g. her registry key, and data, which Alice wants to publish in the internet in order to be detectable for others. Therefore she creates 2 subsets of her full profile, the subset called “Work” including her name and profession, and the subset called “hobby” including her hobby and location. Each of her subsets will be included in a public document of her discovery provider in order to be detectable in the internet. For others there is no association or reference detectable between the two published profile subsets of Alice. A search engine, e.g. Google or Unbooble crawls the public document of the discovery service of Alice.

Imagine Bob as a user of the communication service “Participate”. Recently Bob has moved to Berlin and wants to meet new friends with similar hobbies and interests in his new neighborhood. His communication service “Participate” provides an interface to the search engine Google or Unbooble which enables Bob to search for neighbors, who are interested in playing football. 
In the background the search engine detects among others also the sub-profile “hobby” of Alice including Alice’s hobby “football” and her location, which matches with Bob’s search request, and delivers the document to Bob’s communication client. The “hobby” subset of Alice includes also a profile key which allows Bob’s client to request for Alice’s registry key. To enable the delivery of Alice’s registry key, Bob has to authenticate. Therefor he is redirected to his identity provider “IDEasy” for input of his username and password. Together with his ID token Bob’s client is now authorized to request Alice’s registry key in the profile database of Alice’s discovery provider. With Alice’s registry key Bob’s client is now able to request the descriptor for Alice’s communication endpoint at “TalkNow” in the global registry.  The descriptor includes a link to the stub hoster who provides the protocol stub of “TalkNow”.  The protocol stub of “TalkNow” allows Bob’s client to connect with Alice using the messaging node of “TalkNow” and to deliver Bob’s invitation to Alice. Alice is free to answer Bob’s request like e.g. “Hi, I’m Alice, nice idea!”.  Bob adds Alice to his tab “football group”. *

###Scenario Environment
*Describe Actors involved in the scenario using Business Roles defined in D1.1 and D2.1, Business relationships and Business models/ecosystems defined in D1.1. Define Devices to be used including end-user devices like browser and smartphone as well as M2M/IoT devices like sensors and atuators. Provide a picture to illustrate the scenario environment*

Bob and Alice are subscribers of different communication providers “Participate” and “TalkNow”. 

Alice’s communication endpoint in the “TalkNow” domain is registered in the global registry. 

The protocol stub of “TalkNow”, which is required to connect with Alice, is provided for download by a stub hoster. 

To be detectable in the internet Alice publishes her profile in a discovery service “Connect”. Her profile includes information like name, pseudonyms, location, profession or hobbies and Alice’s registry key. 

Bob’s communication provider “Participate” provides an interface to an internet search engine for the search for conversational partners in the internet. 

For the request of protected profile information of Alice like e.g. her registry key an identity provider provides Bob with the required ID token. 

Bob’s participate app is provided with an interface to load and instantiate the “TalkNow” protocol stub from the stub hoster. 
The communication between Bob and Alice is initiated by the messaging node of the b-party, i.e. by Alice’s “TalkNow”. 

The communication client of “Participate” allows Bob to create a new tab, call the tab “football group” and add new members to his group. 

The communication client allows Bob to initiate group chats or calls.

#### Identity Management and Trust from user perspective

*Textual description of Identity Management and Trust aspects from User Perspective*

Alice creates a profile in a discovery service “connect” which includes her full name, location, profession, hobby and her registry key.  Her full profile consists of both, data, which Alice doesn’t want to publish in the internet like e.g. her registry key, as well as data, which Alice wants to publish in the internet in order to be detectable for others. Therefore she creates 2 subsets of her profile, the subset called “Work” including her name and profession, and the subset called “hobby” including her hobby and location. Each of her subsets will be published in a public document of her discovery provider in order to be detectable in the internet. To get access to Alice’s unpublished data like e.g. her registry key the authentication of the requesting party, Bob, is required. For authentication, the requesting party Bob is redirected to his identity provider in order to get the identity token of Bob's IDP to be authorized for the access to the unpublished profile data of Alice.

#### Interoperability from user perspective
*Textual description of interoperability involving the usage of Apps delivered from different Testbed e.g. Audio Call between a Conversation App from DT and a Conversation App from PT*

Bob and Alice are subscribers of different communication service providers “Participate” and “TalkNow”. A search engine allows Bob to search for like-minded people in his neighborhood, who are interested in playing football across network boarders. 

Alice has created a profile on a discovery service to be detectable in the internet. Her registry key is part of her protected profile data, which is not published in the internet. After authentication Bob’s identity token allows him to get access to Alice’s registry key, saved in Alice’s profile. With the registry key, Bob’s communication client gets access to the descriptor of Alice’s communication endpoint at “TalkNow”, which includes the URL for download of the protocol stub of “TalkNow”. The protocol stub enables Bob’s communication client of “Participate” to connect with Alice via the messaging node of “TalkNow” and send his invitation. 

Alice retrieves Bob’s invitation in her inbox and answers it. Bob adds Alice to his football group. Bob has the possibility to start a group audio or video call or a group chat with all the members of his football group across network boarders.*

###Required reTHINK Framework Functionalities

*Detailed analysis of required funcionalities, interfaces and data schemas as specified in D2.2, D3.1 and D4.1. Highlight missing functionalities*

###Required Testbed features


*Identify features required from Testbed operators including Public IPs, number of Docker images/Servers and its characteristics, ports to be opened, .. Use a Network diagram.*

Note that so far only one test bed operator has specified available components [see issues](https://github.com/reTHINK-project/testbeds/issues?utf8=✓&q=is%3Aissue+Constraints+of+Test+Bed+Operators+).  If you sepcify any requirements in access of the specified available components, you might face the situation that the use case might not be run on a available testbed.

###Required Hyperties


*identify required Hyperties, its main functionalities and associated data schemas. Use a graphical language to describe hyperties composition and relationships (to be defined)*
