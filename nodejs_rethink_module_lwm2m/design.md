
Here is the design of the module

Real World Modelling Configuration 
The module will accept a JSON configuration that will be saved in mongo DB
- Hotel Name, e.g. MyHotel
- List of available rooms: Room1,Room2,Room3,Room4
- For enabling admin access, there will be a group created, with a name configured in the config file and the list of identities of the persons in the group. ToDo: check if the rethink IdP supports grouping, role-based access
- Mapping of devices to Rooms. The JSON will contain pairs: {"roomId": "firstRoomId", "devices":["deviceId1", "deviceId2"...]}
- 
- In the DB for each room there will be a raw containing (at least) the information:if it is booked or not, GuestId, Admin Group Name
- In the DB the mapping of devices to Rooms will be mirrored.

Identity of the device will contain: the Manufacturer name, the Model number and the Serial number. From the Device Management Object (MO Id 3) these are resources with id: 0, 1 and 2. A LWM2M Read on /3/0 will retrieve the entire device information, a Read on /3/0/2 will retrieve the Serial Number.
OPS URN format: <OUI>"-"<ProductClass>"-"<SerialNumber> as in TR-069 standard. where OUI is the Manufacturer name, ProductClass is the model number. 

The lwm2m module will have to be extended to announce the nodejs rethink module lwm2m that a new client has registered, being able to send a read through the lwm2m module on the Device Management Object resources. Automatically read on the Humidity and Temperature objects will be sent. 

At the end of this operation, in the DB there will be information stored for each sensor about: registration status, last registration timestamp and links to raws containing last read value, last read value timestamp.



