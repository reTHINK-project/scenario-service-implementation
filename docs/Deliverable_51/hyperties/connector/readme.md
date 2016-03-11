Dummy Header for Section per ToC
================================

Hyperties Specification
=======================

Connector Hyperty
-----------------

### Architecture

The Connector main functionality is to handle two party audio and voice conversations.

![Architecture](connector-arch.png)

As depicted above, the Connector Hyperty comprises the Connector class that handles the creation of new outgoing or incoming connections. Each Connection instance is controlled by the ConnectionController class that uses the the native WebRTC API.

The Connection signalling is handled by the Syncher class from the Hyperty Service Framework library according to the Reporter-Observer data synchronisation mechanism, by using the standard [Connection Data Objects](https://github.com/reTHINK-project/architecture/tree/master/docs/datamodel/connection).

### Hyperty Data Objects schemas

This Hyperty handles standard [Connection Data Objects](https://github.com/reTHINK-project/architecture/tree/master/docs/datamodel/connection).

### Hyperty API

The Connector Hyperty implements two Hyperty APIs:

#### Hyperty Connector API

The Hyperty Connector API is used to create new connections.

**addListener**

This function is used to handle notifications about incoming requests to create a new connection.

**connect**

This function is used to create a new connection providing the identifier of users to be notified.

#### Hyperty ConnectionController API

The Hyperty ConnectionController API is used to control a connection instance.

**accept**

This function is used to accept an incoming connection request.

**decline**

This function is used to decline an incoming connection request.

**disconnect**

This function is used to close an existing connection instance.

**addPeer**

This function is used to add / invite new peers on an existing connection instance (for multiparty connections).

**removePeer**

This function is used to remove a peer from an existing connection instance.

### Main data flows

The following main use cases are supported by the Connector Hyperty:

#### Hyperty initialisation

Application adds a listener to receive incoming connection requests events.

![Initialisation](connector-invite.png)

#### Create new Connection

Invite Bob for a new communication:

![Invite Bob](connector-invite_001.png)

#### Notification about incoming connection request

Bob receives Connection Request notification:

![Bob receives Invite](connector-bob-accepts.png)

#### Alice sends ICE Candidates to Bob

Alice is notified Bob has subscribed the Connection and can start receiving ICE Candidates:

![Notification about Bob's subscription](connector-ice-candidates-update.png)

Alice updates Connection with her Ice Candidates:

![Alice’s peer is Updated with ICE Candidates](connector-ice-candidates-update_001.png)

#### Accept incoming connection request

Bob accepts Connection Request:

![Bob accepts Invite](connector-bob-accepts_001.png)

#### Aknowledgment that requested Connection was accepted by remote peer

Alice is aknowledge that Bob accepts Connection Request:

![Alice Aked Bob accepts Invite](connector-alice-acked-bob-accepted-invitation.png)

#### Bob sends ICE Candidates to Alice

Similar to Alice sends ICE Candidates to Bob

#### Connection is established

*to be provided*

#### Connection is closed by local peer

Connection is disconnected:

![Connection is closed](connector-disconnect.png)

#### Connection is closed by remote peer

*to be provided*
