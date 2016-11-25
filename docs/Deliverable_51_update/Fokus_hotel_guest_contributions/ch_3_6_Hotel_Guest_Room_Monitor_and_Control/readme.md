## 3.6	Hotel Guest Room Monitor & Control (FOKUS)
### 3.6.1 Client side Hyperty
### 3.6.2 Server side Hyperty



**Content from D5.1 below:  needs major update; merge into new structure above**

3.7	Hotel Connectivity Hyperty
The Hotel Connectivity Hyperty will help the hotel guest to use the connectivity provided by the hotel. A QR code will be received at checkin by the hotel guest. Using a QR code reader, the hyperty can retrieve WiFi information located at the URL link to which the QR code is leading to. After this the hyperty will access the list of WiFi configuration of the hotel guest smart phone and add the credentials of the WiFi connection.
3.7.1	Architecture
The architecture of the hyperty is depicted in Figure 42. The main building blocks are:
•	the QR reader retrieving the WiFi connectivity credentials
•	the Connectivity Adaptor manipulating the Smart Phone connectivity settings by adding the WiFi credentials. This component depends on the Smart Phone Operating System. The targeted Operating System is Android.
 
Figure 42 Hotel Connectivity Hyperty Architecture
3.7.2	Hyperty Data Objects schemas
WiFiConfig is an object that holds the WiFi credentials: SSID, user, password, depending on the authentication scheme.
3.7.3	Hyperty API
The Hyperty will expose two functionalities:
WiFiConfig readQRCode() – reading the QR code received during checkin
addWiFiSettings(WiFiConfig) – internal operation for adding the WiFi credentials to the hotel guest settings
3.7.4	Main data flows
The operation readQRcode will trigger scanning a QR code. The QR code encodes the Hotel WiFi settings location from the LWM2M Message Node. The hypertywill retrieving the resource located at the URLresource containing the WiFi settings that will be added on the hotel guest smart phone (Figure 43). An authentication of the guest follows to grant the guest free of charge access to the resource.
 
Figure 43 Hotel Connectivity Hyperty main data flows

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
