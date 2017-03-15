## 2.2	Hotel Guest (FOKUS)	
### 2.2.1	Scenario Introduction	

The hotel guest scenario use case was chosen as a means to exploit hyperties developed to access IoT devices via a device management system.  In particular, in the hotel scenario, a guest controls instalments in his room (e.g. the light, door lock, etc.) from his reTHINK application. Each installment is handeled in this use case as an IoT device, managed by a device server in the hotel infrastructure. Access to the devices' control is constrained by employing a token based access system.  As such, the following use case description as given in D5.1 provides the story highlighting those reTHINK features.

> Benjamin is interested in booking a room as he will travel to a conference in another country. He is very happy with the flexibility and high tech support of the chain of hotels My High Tech Hotels that allows him to monitor and control his room as soon as the check in is done. He prefers rooms with a bright, dailight-balanced lights to better adjust to the local time after long flights, but also a more warmer light during the evening to adjust for going to bed. As he keeps on forgetting where the electronic key ended up after a day full of talks and exchanging impressions, is glad he can open the door of his room with his Smart phone from the same app that he used to control the light in his room. The Hotel Guest application informs him about the WiFi credentials for the hotel netowrk and configures his phone with them. Thus he is able to contact his colleagues from work that are travelling with him without using roaming mobile telephony. 
>
>The hotel administrator is happy of being able to monitor the room parameters and configure them, e.g. to turn-off lights while the guest is not in the room. In case of emergency, e.g. the level of CO2 is too high, the room door can be opened even if the guest is inside.

Deliverable D5.1 provides a detailed description of the scenario environment, involved actors roles and user perspectives, as well as the detailed functionality to be provided by reTHINK hyperties.

### 2.2.2	Summary of hyperties and applications	

The hotel scenario is realized via two reTHINK applications:
  * the hotel guest application and
  * the hotel administrator application.
  
The former allows a guest of the hotel to control the installments in the room (i.e. the lights) and the room door's lock. Access to controlling the installments is restricted via a token-based access scheme.  A guest specific token only grants access to the guest's room during the time of occupation. In addition, the application allows to configure the device that the application runs on to connect to the password-protected WiFi network of the hotel.

The later allows the manager of the hotel to control the installments in all rooms (e.g. to open all room doors to the fire department in case of a fire or emergency.  Accress to all rooms is granted via a priveledged access token. As such, apart from having special access due to the used token, the application is almost identical to the hotel guest application.

As such, both applications are denoted as "hotel application" in the following picture.
![Hotel Scenario -- Applications and Hyperties](./Hotel-Applications-and-Hyperties.png)

The hotel application builds upon two main hyperties: the hotel connectivity hyperty, and the room monitor and control hyperty.  The latter of the two provides the interface from the reTHINK-based hyperty world with the LWM2M-based management of the hotel room instalments. On the guest's device part, the former provides the interface of the instalment control to the application.
