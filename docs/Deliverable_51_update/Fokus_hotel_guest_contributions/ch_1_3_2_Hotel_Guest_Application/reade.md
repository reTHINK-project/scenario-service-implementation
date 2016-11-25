### 1.3.2 Hotel Guest Application

**copy original content over.  needs to be updated**

Benjamin is interested in booking a room as he will travel to a conference in another country. He is very happy with the flexibility and high tech support of the chain of hotels My High Tech Hotels that allows him to monitor and control his room as soon as the check in is done. He likes to have a temperature of 20.5 degrees. As he keeps on forgetting where the electronic key ended up after a day full of talks and exchanging impressions, he is glad he can open the door of his room with his Smart phone from the same app that he used to set the temperature. As he tends to oversleep in the morning especially due to jet lag, he has set the application to open the curtains at 06:00 to be able to wake up at 06:30 the next day. The Hotel Guest application has configured the WiFi network of the hotel on his phone. Thus he is able to contact his colleagues from work that are travelling with him without using roaming mobile telephony. 
The hotel administrator is happy of being able to monitor the room parameters and configure the air conditioning so that the room is kept cool by closing the curtains while the guest is not in the room. In case of emergency, e.g. the level of CO2 is too high, the room door can be open if the guest is inside.

**Required Functionality**

Authentication and authorization are the key requirements. The guest should be able to generate an identity based on the token received during booking using the Identity Management System. The identity is enabled at the Identity Management System by the hotel administrator after check in. 

For room parameters monitoring and actuating a Hotel LWM2M Message Node is necessary for M2M communication.
The hotel guest and administrator digital access to the room is enabled by a Hotel Guest Application and a Hotel Administrator Application, operations of the administrator having the capability of overriding the settings of the guest in emergency situations or for energy efficiency. Thus access to each smart object or resource of the room is broken down, so that the actions of the administrator are as less intrusive as possible.

To resume the above described functionalities, the required functionalities are:
  * Generate guest identity
  * Monitoring sensing and actuating of devices
  * Fine grain design of implementation
  * Overriding capabilities of administrator over the guest settings 
