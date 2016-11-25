## 2.2 Hotel Guest Application


**bring in original content from D5-1.  Needs to be updated**


### 2.2.1	Scenario Environment

The Hotel Guest Application User Scenario is situated within a smart economy environment in a smart city, named Bersabon. Deliverable D1.1 describes the scenario as follows:

> The dedicated meeting place of a conference is the Old Inn Smart Boutique Hotel. It is a small and cozy apartment hotel located in old downtown of Bersabon. The nice old building includes also the Cafe Night&Day and is well known among the digital scene. It targets young entrepreneurs that love enjoying city life in combination with a relaxed place for work and meet. Old Inn takes advantage of advanced IoT technologies where each room can be dynamically and automatically configured to fulfill guest’s preferences including room decoration (e.g. digital paintings and environmental lights), room temperature, mattress stiffness, etc. It also take advantages of being located in a smart city offering tourist recommendations according to real time data provided by smart city of Bersabon services e.g. visit planning, tickets reservation, etc. according to queues length and weather forecast. It was one of the first Apartment Hotels accepting the usage of customer’s power supply contracts in rented apartments. A web application for hotel is available for their guests, so they can choose amenities in advance and control with their guest-room phone/tablet lights, TV, blinds.

In that ecosystem, Alice is the owner of the Old Inn Smart Boutique Hotel. She had requested The Smarties, a young startup company developing appliances for smart cities, to create an individual application, the Old Inn Hotel Guest Application, for their customers allowing them to directly book rooms at the hotel, to make individual booking requests, and to control after check-in smart appliances in the room. The city of Bersabon hosts a Catalogue that stores and provides as a download various applications to enhance the experience of staying at Bersabon. The hosting service is provided free of charge for all local businesses as Bersabon expects that the service stipulates additional overnight stays of guests in the city which in turn increases revenues from city taxes. Alice takes advantage of the free service and put the Old Inn Hotel Guest Application in that Catalogue. Based on the good business relation between Alice and The Smarties, Alice also ordered a Hotel Room Monitor and Control hyperty at The Smarties which allows electronically opening the room door and controling the light within the room. The Hotel Room Monitor and Control is also stored in the Catalogue serviced by the City of Bersabon.

Benjamin is a frequent traveler who stayed at the Old Inn several times before. The availability of individualized booking and futuristic room control made Benjamin a returning customer whenever staying at Bersabon. Benjamin has signed up with German Telecom, DT, to provide him with identity management services.  

As Benjamin attends the conference at the Old Inn, he calls the Old Inn's Reception to ask if the hotel offers any special rates for conference attendees. The Old Inn Hotel Guest Application informs Benjamin that the hotel owner, Alice, is on duty as a receptionist. So Benjamin initiates a voice call with Alice. Alice tells Bob that best rates are always available via the hotel's booking portal.
Therefore, Benjamin uses his smart phone to book a room at the hotel, and select his room preferences.
When Benjamin arrives at the hotel, he uses the Old Inn Hotel Guest Application to check-in his room. During the check-in process, Benjamin receives credentials to access the hotel's WiFi network and the Hotel Connectivity Hyperty is adding these credentials automatically on his mobile phone. As part of the check-in process, Benjamin downloads to his smart phone a Room Monitor and Control Hyperty to open the door of his room and to control light within his room. Once the room is ready, Benjamin may open the door to his room and control the light within it. He can monitor the temperature from his room and lower the blinds if it is too hot. 

A Hotel Administrator Application will give access to information, especially to temperature, humidity and CO2 sensor information and gives overriding role to open the room door in case of emergency. All the guest and admin access to room parameters (temperature, humidity) and actuating is logged and stored in case further analysis is needed in the future, e.g. anonymous user profiling. The following figuer provides an overview of the use case is given.

**INCLUDE FIG HERE**

### 2.2.2	User perspective

Alice, the owner of the hotel is happy to be able to buy new sensors and easily configure and have them operational using the technology provided from D1.1 use case 5 “M2M Always Connected in Trustful Domains for Multi vendor devices”. The hotel owner and the hotel guest share trustfully access to the data collected from multiple sensors, feature enabled by D1.1 use cases 6 “M2M Seamless connected from different but Trustful domains” and  70 “Information reception from a sensor”.

#### 2.2.2.1	Identity Management and Trust from user perspective

Both the hotel owner and the hotel guest trust the identity management from the Identity Management Subsystem guaranteeing together with the Hotel LWM2M Message Node that access to data collected from the sensors deployed in the room and actuating on the room actuators is properly authenticated and only authorized users have access to it. The user can generate his own identity and pass it during check in. The identity will enable Benjamin to download a hotel hyperty to monitor and control the smart devices from his room as the hyperty accesses the LWM2M Message Node that will authorize the access by enquiring the Rethink Identity Management Subsystem.

#### 2.2.2.2	Interoperability from user perspective 

The Hotel Guest Application will be integrated in the Participate application in which other use cases referring to Audio-Video conversations, chat are enabled. Local connectivity management, in which the mobile phone will switch to the hotel WiFi when in range, will enable low cost service connectivity.

#### 2.2.2.3	Required polices

The usecase demands user roles in monitoring and actuating smart devices. More exactly, the administrator role will have higher authority in actuating than the hotel guest, e.g. for opening the room door in case of emergency.

### 2.2.3	Required reTHINK Framework Functionalities

From D3.1 the directly used components are the Runtime User Agent, the QoS User Agent and the Identity Hiperty. The Runtime User Agent is used by the hotel guest to to download the hotel guest application and hiperties. The QoS User Agent is used to add the WiFi hotel connectivity information in the list of supported WiFi networks after checkin. The Identity Hiperty is used to generate the hotel guest temporary identity used as input in the Hotel Room Monitor and Control Hiperty to remotely monitor sensor readings an actuate smart devices from the room. Other Runtime components from the Browser Runtime will be used indirectly to load the hiperties and run them.
From reThink Identity Management (D4.1) the used components are the Catalogue and the Identity Management Server. The Catalogue enables the end devices to dynamically download and refresh the downloaded version of the hyperties based on request from the Runtime User Agent. The indentity Management Server is capable of generating a temporary identity of the hotel guest and authenticate it when request is received from the LWM2M Message Node.

### 2.2.4	Required Testbed features

The testbed should have at least 3 virtual machines available for the Catalogue, the LWM2M Message Node and the Identity Manager Server/Identity Management Subsystem. The number of docker images depends on the implementation of these components. All 3 services should be accessible via public IP, be it only one that is shared and then NAT-ed, or reverse proxyfied towards the docker instances running the services or having a separate public IP for each service. A DNS server with SRV entries is needed in order that the setup can be replicated on several testbeds.

### 2.2.5	Required Hyperties
The use case demands a couple of applications and Hyperties (Figure 11).
In the Hotel Guest Application there are two Hyperties needed: Hotel Connectivity Hypertyand Room Monitor and Control Hyperty. The Hotel Administrator Application also makes use of the Room Monitor and Control Hyperty with credentials recognized by the LWM2M Message Node through the Identity Management Server with a role to override the hotel guest actions and has access to all the hotel rooms. Another type of Hyperty that is part of the Hotel Administrator Application is the Smart Device Configuration Bootstrap Hypertythat transfers the ownership of administrating a device from the initial manufacturer to the Hotel Administrator using a LWM2M bootstrap procedure implemented in the LWM2M Message Node.

In Phase 1 the Hotel Connectivity and the Room control hyperties will be developed, followed by the Smart Device Configuration Bootstrap hyperty in Phase 2. 

**Include Figure Here**
