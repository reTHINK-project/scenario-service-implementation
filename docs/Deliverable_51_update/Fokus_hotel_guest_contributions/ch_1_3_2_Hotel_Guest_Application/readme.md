### 1.3.2 Hotel Guest Application

Benjamin is interested in booking a room as he will travel to a conference in another country. He is very happy with the flexibility and high tech support of the chain of hotels My High Tech Hotels that allows him to monitor and control his room as soon as the check in is done. He prefers rooms with a bright, dailight-balanced lights to better adjust to the local time after long flights, but also a more warmer light during the evening to adjust for going to bed. As he keeps on forgetting where the electronic key ended up after a day full of talks and exchanging impressions, he is glad he can open the door of his room with his Smart phone from the same app that he used to control the light in his room. The Hotel Guest application informs him about the WiFi credentials for the hotel netowrk and configures his phone with them. Thus he is able to contact his colleagues from work that are travelling with him without using roaming mobile telephony. 

The hotel administrator is happy of being able to monitor the room parameters and configure them, e.g. to turn-off lights while the guest is not in the room. In case of emergency, e.g. the level of CO2 is too high, the room door can be opened even if the guest is inside.

**Required Functionality**

Authentication and authorization support is required. The guest should be able to access the room -- and only his room -- by using a token received during booking. 

For room parameters monitoring and actuating a Hotel LWM2M Message Node is necessary for M2M communication.
The hotel guest and administrator digital access to the room is enabled by a Hotel Guest Application and a Hotel Administrator Application, operations of the administrator having the capability of overriding the settings of the guest in emergency situations or for energy efficiency. 

To resume the above described functionalities, the required functionalities are:
  * Grant access to one or several rooms via a token-based mechanisms
  * Monitoring sensing and actuating of devices
  * Overriding capabilities of administrator over the guest settings 
