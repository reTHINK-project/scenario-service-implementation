
## 3.6	Hotel Guest Room Monitor & Control (FOKUS)

Two hyperties are provided to allow in general connecting to a LWM2M Server, which is used as the back-end to control smart appliances in the hotel scenario. The first of the two hyperties, the *Room Monitor and Control Hyperty*, provides access to the IoT domain and encapsulates all logic for functionality provided within the hotel scenario.  The second hyperty, the *Hotel Connectivity Hyperty*, provides the reTHINK interface to user-side applications and means to communicate with the *Room Monitor and Control Hyperty* via the reThINK Message Bus.

### 3.6.1 Server side Hyperty

The *Room Monitor and Control Hyperty* provides server-side the logic and IoT-specifc communiction means to interact with smart appliances. Specifically, the hyperty allows other hyperties to monitor and control the smart devices from an evironment. In the case of the hotel guest, the environment is limited to the hotel room(s) booked by a user, or, in the case of an administrator, the enviroment spans over all the rooms supported by the Hotel LWM2M Message Node and thereby the hyperty itself.

#### 3.6.1.1 Architecture

The Room Monitor and Control Hyperty consists of three building blocks:
  * Discovery module to retrieve the list of rooms and their associated devices received from the LWM2M Message Node;
  * The Monitor and actuate communication client interacts with the Hotel LWM2M Message Node to retrieve the list of rooms, their associated smart devices, the sensed data and allow actuation; and
  * The authentication module providing a token-bases access control to smart appliances.

![Room Monitor and Control Hyperty Architecture](Room-Monitor-and-Control-Hyperty-Architecture.png)

#### 3.6.1.2	Hyperty Data Objects schemas

The room objects extend the Context Data Model that holds 
1. basic information about the room (room name/number, booking status, etc.)
2. a list of individuals that have access to that room
3. a list of devices assigned to that room, which usually includes all smart devices like lights, and the Wifi configuration for the room, along with their current values or states 

An example representation for a room could look as follows:
```
{
    "__v": 1,
    "_id": "57690ec61dbc906c2ed8252b",
    "name": "2012",
    "members": [],
    "isBooked": false,
    "devices": [
        {
            "name": "myRaspberry",
            "lastValues": {
                "misc": [],
                "light": [
                    {
                        "timestamp": "2016-06-21T09:55:06.553Z",
                        "id": 1,
                        "_id": "57690ef71dbc906c2ed82531",
                        "dimmer": 30,
                        "name": "Desklamp",
                        "isOn": false,
                        "color": {
                            "value": {
                                "x": 0.3795,
                                "y": 0.4598
                            }
                        }
                    }
                ],
                "temperature": [
                    {
                        "_id": "57690efa1dbc906c2ed82532",
                        "timestamp": "2016-06-21T09:55:44.340Z",
                        "unit": "Cel",
                        "id": 0,
                        "value": 25.7
                    }
                ],
                "humidity": []
            },
            "registration": {
                "registered": true,
                "timestamp": "2016-06-21T09:55:03.620Z",
                "payload": "</3311/1>,</3303/0>"
            },
            "__v": 2,
            "room": "57690ec61dbc906c2ed8252b",
            "_id": "57690ec61dbc906c2ed8252e"
        }
    ]
}
```
TODO: addWiFiConfig to example
TODO: describe all possible devices
*WiFiConfig* is an object that holds the WiFi credentials: SSID, user, password, depending on the authentication scheme.

#### 3.6.1.3	Hyperty API

The Room Monitor and Control Hyperty will expose several hyperty-to-hyperty functionalities:
* automatically creates and publishes SyncObjects representing each room the hyperty was able to gather from the LWM2M Message Node
* exposes two functions that other hyperties can invoke
  * getRooms(<accessToken>), returning a list SyncObject URLs a user is allowed to monitor/subscribe to, based on the accessToken provided by the user
  * action(<actionAsJson>), forwarding actions from another hyperty to the LWM2M Message Node
  
With the provided functionalities, other hyperties can read the current state of rooms, get notified about room state changes, and invoke actions on devices situated in a room.

#### 3.6.1.4	Main data flows

*Include MSC showing main data flows for the above described APIs*


### 3.6.2 Client side Hyperty

The *Hotel Connectivity Hyperty* resides at the user side. It provides the interface to applicatons to control IoT appliances (here smart devices in hotel rooms). The implementation of the logic associated with each offered service related to the control of smart appliances resides remote at the server-side hyperty (i.e., the *Room Monitor and Control Hyperty*). The client-side hyperty "proxies" the communicaiton via the reTHINK message bus. This allows to decouple an IoT specific communication protocols from the user-side implementations.

Besides, in this specific usage scenario, the *Hotel Connectivity Hyperty* allows as well to configure the WiFi Interface to be used and to connect to the local WiFi network of the hotel. For that, it interacts with the Last Hop Connectivity Broker (LHCB) from the reTHINK QoS framework to configure and request the appropriate uplink technology used for communication.

#### 3.6.2.1 Architecture

The architecture of the client-side hyperty is depicted in the following figure:

![Hotel Connectivity Hyperty Architecture](./Hotel-Connectivity-Hyperty-Architecture.png)

The Hotel Guest Application uses this hyperty and provides on top of it the graphical user interface to display and manipulate smart appliances.

#### 3.6.2.2	Hyperty Data Objects schemas

The *Hotel Connectivity Hyperty* does not use custom schemas for its objects. However, using the Context Data Schema, it subscribes to the SyncObjects created by the *Room Monitor and Control Hyperty*.

#### 3.6.2.3	Hyperty API

The hyperty exposes the following functionalities:

* Events
  * `newRoom(roomData)`: triggered, when a new room is accessible
  * `changedRoom(roomData)`: triggered, when a room state has changed
  * `error(errorReason)`: triggered, when errors occur
* functions
  * `start(accessToken)`: executes the starting routine of the hyperty, provided with the access token it sends to the *Room Monitor and Control Hyperty* to get access to the appropriate rooms
  * `sendAction(deviceName, objectType, objectId, resourceType, value)`: invoke an action on the LWM2M Message Node.

TODO: describe all functions, or only the ones intended for users?

#### 3.6.2.4	Main data flows

**Include MSC showing main data flows for the above described APIs**




