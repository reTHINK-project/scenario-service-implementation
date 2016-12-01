## 3.6	Hotel Guest Room Monitor & Control (FOKUS)

Two hyperties are provided to allow in general connecting to a LWM2M Server, which is used as the back-end to control smart appliances in the hotel scenario.  The first of the two hyperties, the *Room Monitor and Control Hyperty*, provides access to the IoT domain and encapsulates all logic for functionality provided within the hotel scenario.  The second hyperty, the *Hotel Connectivity Hyperty*, provides the reTHINK interface to user-side applications and means to communicate with the *Room Monitor and Control Hyperty* via the reThINK Message Bus.

by interacting with the LWM2M Server. This hyperty is usually instatiated only once, i.e. in the back-end (here, at the hotel premises), to have a single means of communicating via standardized protocols like COAP but also via customized protocols to the IoT domain.  This hyperty encapsulates all functionality offered for a given scenario with re

### 3.6.1 Client side Hyperty

The *Room Monitor and Control Hyperty* resides at the client side. It provides the interface to applicaitons to control IoT appliances (here smart devices in hotel rooms). The implementation of the logic associated with each offered service related to the control of smart appliances resides remote at the server-side hyperty (i.e., the *Room Monitor and Control Hyperty*). The client-side hyperty "proxies" the communicaiton via the reTHINK message bus. This allows to decouple an IoT specific communication protocols from the user-side implementations.

Besides, in this specific usage scenario, the *Room Monitor and Control Hyperty* allows as well to configure the WiFi Interface to be used and to connect to the local WiFi network of the hotel. For that, it interacts with the Last Hop Connectivity Broker (LHCB) from the reTHINK QoS framework to configure and request the appropriate uplink technology used for communication.

#### 3.6.1.1 Architecture

The architecture of the client-side hyperty is depicted in the following figure. Internally, functionality is split two-fold, i.e. into a component for communicating / proxing with the server-side hyperty, and into a component interacting with the LHCB.

**INCLUDE FIGURE HERE**

#### 3.6.1.2	Hyperty Data Objects schemas

*WiFiConfig* is an object that holds the WiFi credentials: SSID, user, password, depending on the authentication scheme.

**to be updated**

#### 3.6.1.3	Hyperty API

The hyperty exposes the following functionalities:

*blabla()*  -- what its does

**to be updated**

#### 3.6.1.4	Main data flows

**Include MSC showing main data flows for the above described APIs**


### 3.6.2 Server side Hyperty




**Content from D5.1 below:  needs major update; merge into new structure above**


3.8	Room Monitor and Control Hyperty
The hyperty will allow the user to monitor and control the smart devices from an evironment. In the case of the hotel guest the environment will be limited to his/her hotel room and in the case of the administrator, the enviroment will span over all the rooms supported by the Hotel LWM2M Message Node.
3.8.1	Architecture
The Room Monitor and Control Hyperty will have as main building blocks:
•	Discovery module to retrievethe list of rooms and their associated devices will be received from the LWM2M Message Node. 
•	The Monitor and actuate GUI will be the graphical interface presenting to the user the sensed data and allowing actuation
•	The Monitor and actuate communication client will interact with the Hotel LWM2M Message Node to retrieve the list of rooms, their associated smart devices, the sensed data and allow actuation.
 
Figure 44 Room Monitor and Control Hyperty Architecture
3.8.2	Hyperty Data Objects schemas
The SmartObject extends the Context Data Modelto define a smart device and including the name, type (sensor, actuator, complex sensor), manufacturer information, capabilities (e.g. type of sensor) optional last measurement if a sensor and optional last received command. For both measurements and commands the timestamp and the user will be stored.
3.8.3	Hyperty API
The Room Monitor and Control Hyperty will expose several functionalities:
•	start (userSettings) this will trigger starting the Hyperty and as a first action the user will be authenticated by the LWM2M Message Node<List<roomNumber, role>> getRooms() the information received via registration related to the list of rooms the user can have access to and the associated role
•	<List<DeviceId, SmartObject>>getDevices(roomNumber) – returns the devices from a room
•	String getLatestMeasurement(deviceId)–returns the latest received sensed data
•	<String, String, Time>getLatestActuation(deviceId)– returns the latest actuation command, the user and the timestamp on which it was sent
•	Time sendNewActuation(deviceId, user, time, command)– actuate on a device, by a user, the time to apply it and the comman itself
3.8.4	Main data flows
The Monitor and actuate communication client will subscribe to the data sensed by a sensor from the room (Figure 34). Special care has to be taken so that the Hotel LWM2M Message Node is not overloaded with subscriptions from the same user smart phone that is changing the IP, at the same time the notifications have to arrive to the right smart phone so that the data is in sync when connected.
 
Figure 45 Room Monitor and Control Hyperty main data flow
3.9	Smart Device Configuration Bootstrap Hyperty
This Hyperty will supportsmart devices l. By Smart device we refer to devices that sense or actuate. This hyperty is part of the Hotel Administrator Application.
3.9.1	Architecture
As can be seen from Figure 35 the main building blocks of the Smart Device Configuration Bootstrap Hyperty are:
•	the Graphical User Interface that will interact with the Hotel Administrator to insert and select devices to be bootstraped
•	a Device Management (DM) Client that receives the request from the GUI and interacts with the Manufacturer DM server to bootstrap the devices. If the procedure was successful or any errors have occured, a message will be returned asynchronously to the GUI.
 
Figure 46 Smart Device Configuration Bootstrap Hyperty Architecture
3.9.2	Hyperty Data Objects schemas
A manufacturer DM server or Hotel LWM2M Message Node will be modelled as the pair (IP, port) on which it listens. A device will be modelled as the Manufacturer identity and its LWM2M endpoint id, unique identity per Manufacturer. 
3.9.3	Hyperty API
The Device Bootstrap API will expose the following API:
insertNewDevice(manufacturerId, deviceEndpointId)
insertNewManufacturer(dmSrvIP, dmSrvPort)
insertNewHotelDataServer(ip, port)
Integer bootstrapDevice(manufacturerId, deviceEndpointId, hotelDMSrvIP)
3.9.4	Main data flows
 
Figure 47 Smart Device Configuration Bootstrap Hyperty data flows
