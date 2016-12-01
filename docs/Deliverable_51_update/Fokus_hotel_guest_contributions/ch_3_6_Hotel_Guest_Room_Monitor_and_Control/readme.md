## 3.6	Hotel Guest Room Monitor & Control (FOKUS)

Two hyperties are provided to allow in general connecting to a LWM2M Server, which is used as the back-end to control smart appliances in the hotel scenario.  The first of the two hyperties, the *Room Monitor and Control Hyperty*, provides access to the IoT domain and encapsulates all logic for functionality provided within the hotel scenario.  The second hyperty, the *Hotel Connectivity Hyperty*, provides the reTHINK interface to user-side applications and means to communicate with the *Room Monitor and Control Hyperty* via the reThINK Message Bus.



### 3.6.1 Client side Hyperty

The *Hotel Connectivity Hyperty* resides at the client side. It provides the interface to applicaitons to control IoT appliances (here smart devices in hotel rooms). The implementation of the logic associated with each offered service related to the control of smart appliances resides remote at the server-side hyperty (i.e., the *Room Monitor and Control Hyperty*). The client-side hyperty "proxies" the communicaiton via the reTHINK message bus. This allows to decouple an IoT specific communication protocols from the user-side implementations.

Besides, in this specific usage scenario, the *Room Monitor and Control Hyperty* allows as well to configure the WiFi Interface to be used and to connect to the local WiFi network of the hotel. For that, it interacts with the Last Hop Connectivity Broker (LHCB) from the reTHINK QoS framework to configure and request the appropriate uplink technology used for communication.

#### 3.6.1.1 Architecture

The architecture of the client-side hyperty is depicted in the following figure. Internally, functionality is split two-fold, i.e. into a component for communicating / proxing with the server-side hyperty, and into a component interacting with the LHCB.

![Hotel Connectivity Hyperty Architecture](./Hotel-Connectivity-Hyperty-Architecture.png)

The Hotel Guest Application uses this hyperty and provides on top of it the graphical user interface to display and manimulation smart appliances.

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

The *Room Monitor and Control Hyperty* provides server-side the logic and IoT-specifc communiction means to interact with smart appliances. Specifically, the hyperty allows the user to monitor and control the smart devices from an evironment. In the case of the hotel guest, the environment is limited to his/her hotel room and in the case of the administrator, the enviroment spans over all the rooms supported by the Hotel LWM2M Message Node.

#### 3.6.1.1 Architecture

The Room Monitor and Control Hyperty consists of three building blocks:
  * Discovery module to retrieve the list of rooms and their associated devices received from the LWM2M Message Node;
  * The Monitor and actuate communication client  interacts with the Hotel LWM2M Message Node to retrieve the list of rooms, their associated smart devices, the sensed data and allow actuation; and
  * The authentication module providing a token-bases access control to smart appliances.

![Room Monitor and Control Hyperty Architecture](Room-Monitor-and-Control-Hyperty-Architecture.png)

#### 3.6.1.2	Hyperty Data Objects schemas

The SmartObject extends the Context Data Model to define a smart device and including the name, type (sensor, actuator, complex sensor), manufacturer information, capabilities (e.g. type of sensor) optional last measurement if a sensor and optional last received command. For both measurements and commands the timestamp and the user will be stored.

#### 3.6.1.3	Hyperty API

The Room Monitor and Control Hyperty will expose several functionalities:
  * start (userSettings) this will trigger starting the Hyperty and as a first action the user will be authenticated by the LWM2M Message Node<List<roomNumber, role>> getRooms() the information received via registration related to the list of rooms the user can have access to and the associated role
  * <List<DeviceId, SmartObject>>getDevices(roomNumber) – returns the devices from a room
  * String getLatestMeasurement(deviceId)–returns the latest received sensed data
  * <String, String, Time>getLatestActuation(deviceId)– returns the latest actuation command, the user and the timestamp on which it was sent
  * Time sendNewActuation(deviceId, user, time, command)– actuate on a device, by a user, the time to apply it and the comman itself

**cross check if up to date**

#### 3.6.1.4	Main data flows

**Include MSC showing main data flows for the above described APIs**

