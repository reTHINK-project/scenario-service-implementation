
Dummy Header for Section 1 per ToC
==================================

Usage Scenarios Description
===========================

Tourism in a Smart City
----------------------------------

###Scenario Environment (User Scenario #3)

The Smart Tourist Application User Scenario is situated wihtin a smart economy environment in a smart city, named Bersabon. Deliverable D1.1 describes the scenario as follows:

> Frank arrived in Bersabon on Friday morning. In the terminal building of the airport he sees an advertisement of the city app “Participate” and a QR code next to it. He downloads the app and reads through the welcome page and enters a Nickname. In the next step he is asked some questions about himself, utilizing some information from a social network about his preferences and manually the Hotel name he is staying in to enhance his stay. Perfect! The hotel his envisaged on a map and he can ask for the best route. The application provides him with the quickest public transportation route and best ticket options. Sitting in the underground he looks through some recommendations provided via the application, based on his preferences. He reads about a pub crawl tonight. After he read some comments from other participants he decides to participate since he has no appointment for tonight. After the Hotel check in, he starts his sightseeing tour. He searches for the location of the film museum and receives additionally the information, that there is long waiting queue currently. A blinking button saying “Guided Tour in Esperanto” catches his eyeball. He presses the button and a smile runs over his face. Since he has provided his mother tongue during the welcome process he is informed that already 7 other group members from his country have joined the group. The information on the page tells him, that in case more than 7 people request for a conducted tour in Esperanto there will be a tour in 3 hours. He quickly checks in for the group and is informed that for reservation and payment purposes he needs to provide his name and the hotel where he stays for verification purposes. Once the hotel content management system approves his name, the reservation is confirmed. At the museum he quickly finds his group on the map. The tour is perfect and he tells his new party about the pub crawl and gets some other ideas for the next day from them.

In this ecosystem, Alice is a tourist who visits the city of Bersabon. She is staying in the Old Inn Smart Boutique Hotel. Upon her arrival at the Airport, she downloaded the participate application to her Smartphone and registered as a user. Among information and recommendation functionality, the app also offers social networking functionality to connect to other tourists using the same application.
Going through her daily life, Alice is collecting data on her smartphone, e.g. by locally storing locations she frequently visits, from sensors he retrieves information from or including news websites which inform him about the latest movies starring his favorite actor. The process of acquiring data from sensors and webservices is visualized in the following figure.

![ContextData](01-ContextData.png)

As she is travelling alone, Alice does not know anyone in the city. Hence, she uses the application to search for people who are also new in the city. The app queries her service provider for a recommendation on what to do in the new city, as depicted in the next figure. 

![RecommendationServiceProvider](02-RecServiceProvider.png)

Alice's app uses information about his hobbies, preferences, and other interests to search for people in the vicinity. Bob, who also arrived in Bersabon earlier the same day also uses the app and both Alice and Bob share the same hobbies. Both are shown a list of other tourists in the same city which whom they might want to meet in order to discover the city together. (Associated use case: #72 Recommendation by service provider based on context and preference)

![PartyScreen](03-PartyScreen.png)

Alice looks through the list of recommended users. Bob strikes her interest: Alice is interested to meet someone who knows the restaurant scene. In Bob’s profile, Alice can see that he is a chef. Additionally, the music taste is indicated as similar to that of Alice. Bob decided to share his birthday only with his friends, so Alice cannot see it yet. Alice agrees and connects to Bob's social profile. (Associated use case: #15 Retrieving public information from nearby people)

![RetrievePublicInformation](05-RetrievePublicInformation.png)

Bob accepts and they agree to meet in the hotel lobby where Bob is staying. Alice reaches Bob's hotel shortly after. Here, they use the app to get recommendations of places to visit in the city.
Alice adds Bob in the application as a friend and Bob accepts the friend request. Now, Alice can see his whole profile. They talk about the music they like. For other things like sports, Alice and Bob are not that similar, but Alice can query Bob in order to use his connections to other people to retrieve further recommendations. (Associated use case: #71 Recommendation by friend)

![RecommendationFriend](06-RecFriend.png)

###User perspective
 

#### Identity Management and Trust from user perspective

*Textual description of Identity Management and Trust aspects from User Perspective*

#### Interoperability from user perspective

*Textual description of interoperability involving the usage of Apps delivered from different Testbed e.g. Audio Call between a Conversation App from DT and a Conversation App from PT*

###Required reTHINK Framework Functionalities

*Detailed analysis of required funcionalities, interfaces and data schemas as specified in D2.2, D3.1 and D4.1. Highlight missing functionalities*

###Required Testbed features


*Identify features required from Testbed operators including Public IPs, number of Docker images/Servers and its characteristics, ports to be opened, .. Use a Network diagram.*



###Required Hyperties


*identify required Hyperties, its main functionalities and associated data schemas. Use a graphical language to describe hyperties composition and relationships (to be defined)*



