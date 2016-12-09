
## 3.6	Hotel Guest Room Monitor & Control (FOKUS)

Two hyperties are provided to allow in general connecting to a LWM2M Server, which is used as the back-end to control smart appliances in the hotel scenario. The first of the two hyperties, the *Room Monitor and Control Hyperty*, provides access to the IoT domain and encapsulates all logic for functionality provided within the hotel scenario.  The second hyperty, the *Hotel Connectivity Hyperty*, provides the reTHINK interface to user-side applications and means to communicate with the *Room Monitor and Control Hyperty* via the reThINK Message Bus.

### 3.6.1 Server side Hyperty

The *Room Monitor and Control Hyperty* provides server-side the logic and IoT-specifc communiction means to interact with smart appliances. Specifically, the hyperty allows other hyperties to monitor and control the smart devices from an evironment. In the case of the hotel guest, the environment is limited to the hotel room(s) booked by a user, or, in the case of an administrator, the enviroment spans over all the rooms supported by the Hotel LWM2M Message Node and thereby the hyperty itself.

#### 3.6.1.1 Architecture

The Room Monitor and Control Hyperty consists of three building blocks:

* monitor and control rooms and their devices using the LWM2M Message Node;
* provision rooms as SyncObjects to other hyperties
* token-based access control to rooms and their devices.

![Room Monitor and Control Hyperty Architecture](Room-Monitor-and-Control-Hyperty-Architecture.png)

#### 3.6.1.2	Hyperty Data Objects schemas

The room objects extend the Context Data Model that hold

1. basic information about the room (room name/number, booking status, etc.)
2. a list of individuals that have access to that room
3. a list of devices assigned to that room, which usually includes all smart devices like lights, and the Wifi configuration for the room, along with their current values or states 

An example representation for a room could look as follows:
```
{
    "id": "5825a61908d25170004c597d",
    "name": "room1",
    "values": [{
        "name": "myRaspberry",
        "value": {
            "_id": "5825a61908d25170004c5980",
            "name": "myRaspberry",
            "__v": 99,
            "room": "5825a61908d25170004c597d",
            "lastValues": {
                "misc": [{
                    "title": "Wifi",
                    "label": "SSID",
                    "textfield": "someSSID",
                    "label": "Username",
                    "textfield": "Bob",
                    "label": "Password",
                    "textfield": "bobspassword"
                }],
                "light": [{
                    "name": "Desklamp",
                    "id": 1,
                    "_id": "5825a62608d25170004c5982",
                    "isOn": true,
                    "dimmer": 97,
                    "timestamp": "2016-12-02T12:04:51.783Z",
                    "color": {"unit": "CIE_JSON", "value": [0.409, 0.518]}
                }],
                "humidity": [],
                "temperature": [{
                    "unit": "Cel",
                    "id": 0,
                    "_id": "5825a62608d25170004c5981",
                    "value": 22.1,
                    "timestamp": "2016-12-02T12:10:29.863Z"
                }]
            },
            "registration": {
                "payload": "</3311/1>,</3303/0>",
                "timestamp": "2016-12-02T12:04:48.839Z",
                "registered": true
            }
        }
    }],
    "scheme": "context",
    "type": "chat",
    "reporter": "hyperty://fokus.fraunhofer.de/5c9039f9-53be-40e9-815a-740879a5d837",
    "schema": "hyperty-catalogue://catalogue.fokus.fraunhofer.de/.well-known/dataschema/Context"
}
```
The example shows a room named "room1" that contains

* a _misc_ object, which shows the Wifi credentials for the user,
* one _light_ called "Desklamp",
* and one _temperature sensor_

#### 3.6.1.3	Hyperty API

The Room Monitor and Control Hyperty will expose several _hyperty-to-hyperty_ functionalities:

* automatically creates and publishes SyncObjects representing each room the hyperty was able to gather from the LWM2M Message Node
* exposes two functions that other hyperties can invoke
 * `getRooms(accessToken)`, returning a list SyncObject URLs a user is allowed to monitor/subscribe to, based on the accessToken provided by the user
 * `makeRequest(actionAsJson)`, forwarding actions from another hyperty to the LWM2M Message Node
  
With the provided functionalities, other hyperties can read the current state of rooms, get notified about room state changes, and invoke actions on devices situated in a room.

#### 3.6.1.4	Main data flows

In general, the Room Monitor and Control Hyperty periodically polls the state of all rooms provided by the Hotel LWM2M Message Node and and serves them as SyncObjects to other hyperties. On every poll it detects if a new room has been introduced, or an existing room state has changed. By changing the contents of a SyncObject, all hyperties subscribed to that object will get notified of the change.

![Room Monitor and Control Hyperty main data flow](room-monitor-and-control-hyperty-data-flow.png)


### 3.6.2 Client side Hyperty

The *Hotel Connectivity Hyperty* resides at the user side. It provides the interface to applicatons to control IoT appliances (here smart devices in hotel rooms). The implementation of the logic associated with each offered service related to the control of smart appliances resides remote at the server-side hyperty (i.e., the *Room Monitor and Control Hyperty*). The client-side hyperty "proxies" the communicaiton via the reTHINK message bus. This allows to decouple an IoT specific communication protocols from the user-side implementations.

Besides, in this specific usage scenario, the *Hotel Connectivity Hyperty* allows as well to configure the WiFi Interface to be used and to connect to the local WiFi network of the hotel. For that, it interacts with the Last Hop Connectivity Broker (LHCB) from the reTHINK QoS framework to configure and request the appropriate uplink technology used for communication.

#### 3.6.2.1 Architecture

The architecture of the client-side hyperty consists of the following parts:

* Discovery of the running Room Monitor and Control Hyperty, and Authentication on it with an access token provided by the user
* Request of available rooms from the Room Monitor and Control Hyperty, and provisioning them to the user
* Event system that triggers events for room availability, state changes and errors
* Connectivity Adapter to the Last Hop Connectivity Broker, in order to change the netork interface used by the user's device

![Hotel Connectivity Hyperty Architecture](./Hotel-Connectivity-Hyperty-Architecture.png)

The Hotel Guest Application uses this hyperty and provides on top of it the graphical user interface to display and manipulate smart appliances.

#### 3.6.2.2	Hyperty Data Objects schemas

The *Hotel Connectivity Hyperty* does not use custom schemas for its objects. However, it subscribes to the SyncObjects created by the *Room Monitor and Control Hyperty*, in effect using the Context Data Model.

#### 3.6.2.3	Hyperty API

The hyperty exposes the following functionalities:

* events
  * `newRoom(roomData)`: triggered, when a new room is accessible
  * `changedRoom(roomData)`: triggered, when a room state has changed
  * `error(errorReason)`: triggered, when errors occur
* functions
  * `start(accessToken)`: executes the starting routine of the hyperty, provided with the access token it sends to the *Room Monitor and Control Hyperty* to get access to the appropriate rooms
  * `sendAction(deviceName, objectType, objectId, resourceType, value)`: invoke an action on the LWM2M Message Node.

#### 3.6.2.4	Main data flows

The Hotel Connectivity Hyperty first tries to discover a currently running Room Monitor and Control hyperty based on a well known identity (i.e. the identity that started the Room Monitor and Control Hyperty).
It then tries to request a list of syncObject URLs of rooms from the Room Monitor and Control Hyperty, providing a token that it got from the Hotel Guest Application. Based on this token, the Room Monitor and Control hyperty returns the amount of syncObject URLs of rooms this token is allowed access to.
The Hotel Connectivity Hyperty then subscribes on each syncObject in order to get the current room states, as well as get notified of state changes of those rooms. Events for new and/or changed rooms will be triggered in the Hotel Guest Application appropriately.

Finally, at the user's will, the Hotel Connectivity Hyperty may send a state change request for a device, which the Room Monitor and Control Hyperty forwards to the Hotel LwM2M Message Node.

![Hotel Connectivity Hyperty main data flow](hotel-connectivity-hyperty-data-flow.png)

Please note: green text/arrow implies interaction with other reTHINK components (e.g. communication through the reTHINK Message Node)
