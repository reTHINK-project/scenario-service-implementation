Dummy Header for Section 1 per ToC
==================================

Usage Scenarios Description
===========================

Enterprise Conversationnal sconario
----------------------------------

###Scenario Environment


*Describe Actors involved in the scenario using Business Roles defined in D1.1 and D2.1, Business relationships and Business models/ecosystems defined in D1.1. Define Devices to be used including end-user devices like browser and smartphone as well as M2M/IoT devices like sensors and atuators. Provide a picture to illustrate the scenario environment*



-	From WP1 :

H2H Multiparty Conversations https://github.com/reTHINK-project/use-cases/issues/86

H2H inter-domain Conversation with different CSPs and external IdPs https://github.com/reTHINK-project/use-cases/issues/95

-	From WP5 :

Enterprise use case

**Scenario to be implemented :**


Scenario can be decomposed in several phase :
1 - establishement of a multy party calls with users from the same CSP
2 - establishment of a 1 to 1 conversation and then adding a new participant by tranferring the call to the MCU
3 - connexion of an external CSP client to the conference




###User perspective


*Textual description of the scenario including the main use cases to be supported. Refer as much as possible to use cases defined in D1.1.*

<b>Phase 1 :</b>
User A and B and C are on same CSP 
User A on Entreprise 1 webSite calls user B from Entreprise 1
Multi party call is established between A and the MCU
B receive a notification of the connexion of A
Multi party call is established between B and the MCU (A and B are in conversation)
B wants to add C from entreprise 1 in the conversation
B send a notification to C
Multi party call is established between C and the MCU (A, B and C are in conversation)

<b>Phase 2 :</b>
User A and B and C are on same CSP 
User A on Entreprise 1 webSite calls user B from Entreprise 1
Peer-toPeer call is established between A and B
B wants to add C from entreprise 1 in the conversation
Calls between A and B is transferred to the MCU in order to add C in the conference

<b>Phase 3 :</b>
User A is on a different CSP than B and C
User A is on is Entreprise 2 application calls user B from Entreprise 1
Peer-toPeer call is established between A and B
B wants to add C from entreprise 1 in the conversation
Calls between A and B is transferred to the MCU in order to add C in the conference




#### Identity Management and Trust from user perspective

*Textual description of Identity Management and Trust aspects from User Perspective*

#### Interoperability from user perspective

*Textual description of interoperability involving the usage of Apps delivered from different Testbed e.g. Audio Call between a Conversation App from DT and a Conversation App from PT*


###Required reTHINK Framework Functionalities

*Detailed analysis of required funcionalities, interfaces and data schemas as specified in D2.2, D3.1 and D4.1. Highlight missing functionalities*

1 to 1 communication</br>
send Data : Notification</br>
Multi party calls</br>
inter-domain calls 

###Required Testbed features


*Identify features required from Testbed operators including Public IPs, number of Docker images/Servers and its characteristics, ports to be opened, .. Use a Network diagram.*

Note that so far only one test bed operator has specified available components [see issues](https://github.com/reTHINK-project/testbeds/issues?utf8=✓&q=is%3Aissue+Constraints+of+Test+Bed+Operators+).  If you sepcify any requirements in access of the specified available components, you might face the situation that the use case might not be run on a available testbed.

###Required Hyperties


*identify required Hyperties, its main functionalities and associated data schemas. Use a graphical language to describe hyperties composition and relationships (to be defined)*


Hyperty on client side</br>
Hyperty on messaging Node NodeJs for interconnection with different CSP</br>
Hyperty on server side for Kurento MCU
