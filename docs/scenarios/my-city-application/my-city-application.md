In progress

Dummy Header for Section 1 per ToC
==================================

Usage Scenarios Description
===========================

Scenario My City
----------------------------------

###Scenario Environment

*Describe Actors involved in the scenario using Business Roles defined in D1.1 and D2.1, Business relationships and Business models/ecosystems defined in D1.1. Define Devices to be used including end-user devices like browser and smartphone as well as M2M/IoT devices like sensors and atuators. Provide a picture to illustrate the scenario environment*

The _My City User Scenario_ represents the daily life in a smart city, named Bersabon.
Deliverable D1.1 describes the scenario as follows:

>Going through her daily life, Alice is collecting data on her smartphone, e.g. by locally storing locations she frequently visits, from sensors she retrieves information from or including news websites which inform her about the latest movies with her favorite actor. Her service provider makes suggestions on the basis of these collected data, e.g. she is recommended a cinema she hasn’t been before, that plays a movie with her favorite. Before going to the movies, Alice is also recommended a new restaurant that offers a special opening promotion. A week later, she is going downtown, and runs into a large crowd that seems to be looking at something. Her smartphone vibrates and notifies her about a new message by someone in the vicinity. She opens the group chat that automatically formed and sees a picture someone has taken and posted to the group: It seems to be from the center of the crowd, there is a street performer. Alice takes part in the conversation pseudonymously. On her way back home, she sees a note on the highest tree of her neighborhood. On it, there is a QR-code. She scans it with her smartphone and enters a group discussion about the removal of the tree.

In this smart city ecosystem, the city of Bersabon hosts a Cataloge that stores and provides applications to enhance the experience of staying at Bersabon. One of these applications is _Participate_, an application to exchange ideas, suggestions, etc with all the citizens and visitors. Here the local government provides information on the city, request feedback from citizens and allow citizens to discuss (in a group chat) about general problems or topics of the city. Users of Participate can join ad-hoc group chats to discuss hot topics (local exhibitions, discussion groups, events, etc). Some groups will be only available for users connected from a specific location, others will be accesible in an anonymous way.

Alice is a citizen of Bersabon that uses a number of applications from Bersabon Cataloge like Participate, and for the registry in these applications she is using the Registry service included in this Cataloge. As one of the citizen registered in Participate, she receives an invitation to join a group chat to propose and discuss the activities to be held during the Women's Equality Week in Bersabon. She acepts the invitation and proposes a workshop where a group of women of different profiles can tell her story, the obstacles they found along the way and the challenges ahead.

Bob belongs to the Bersabon local police department designed to help local citizens and visitor in different areas (traffic, etc). Bob can send notifications to users of Participate based on location, i.e. drivers closed to a traffic jam or participants in a public demonstration. He also have rights to retrieve public information of users in case of emergency, including the possibility to have a p2p conversation.

Some weeks later, when Alice goes to the place where the workshop is held, she receibes a notification that the main avenue to get the venue of the workshop is collapsed due to a broken down truck. She chooses another route but she still arrives twenty minutes late.

Carol is another citizen of Bersabon and she is taking part in the workshop of Women's Equality Week as speaker. She is also a Participate user, and for the registry in these applications she is using the Registry service included in this Cataloge. After her presentation she creates a survey for the Participate users that are located at the workshop area in order to vote for the most popular lesson learned discussed during the workshop.

When Alice is arriving at the workshop she receives the invitation to join the survey proposed by Carol.


###User perspective


*Textual description of the scenario including the main use cases to be supported. Refer as much as possible to use cases defined in D1.1.*

The _Participate_ App is based in three main functionalities:
- Notifications
- Group chat
- Survey participation

These functionalities can take location into account as a context filter. In this scenario the considered cases are:
- To send an invitation to participate in a Group Chat to all the registered users of 'Participate'
- To take part in group chat
- To send a message with info to all the users in a geographic area registered in 'Participate'
- To send a message to particpate in a survey to all the users in a geographic area registered in 'Participate'
- To fill a survey

The following WP1 Use Cases are required:
- #28 Being at a validated area
- #35 Messaging
- #63 H2H Anonymous Conversation
- #64 Human Context Presence Management
- #72 Recommendation by service provider based on context and preference
- #77 Unknown identities
- #80 Ad Hoc community
- #85 H2H Partial Anonymous Conversation
- #86 H2H Multiparty communication


#### Identity Management and Trust from user perspective

*Textual description of Identity Management and Trust aspects from User Perspective*

#### Interoperability from user perspective

*Textual description of interoperability involving the usage of Apps delivered from different Testbed e.g. Audio Call between a Conversation App from DT and a Conversation App from PT*

###Required reTHINK Framework Functionalities

*Detailed analysis of required funcionalities, interfaces and data schemas as specified in D2.2, D3.1 and D4.1. Highlight missing functionalities*

###Required Testbed features


*Identify features required from Testbed operators including Public IPs, number of Docker images/Servers and its characteristics, ports to be opened, .. Use a Network diagram.*

Note that so far only one test bed operator has specified available components [see issues](https://github.com/reTHINK-project/testbeds/issues?utf8=✓&q=is%3Aissue+Constraints+of+Test+Bed+Operators+).  If you sepcify any requirements in access of the specified available components, you might face the situation that the use case might not be run on a available testbed.

###Required Hyperties


*identify required Hyperties, its main functionalities and associated data schemas. Use a graphical language to describe hyperties composition and relationships (to be defined)*
