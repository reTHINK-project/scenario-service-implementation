Group Chat Hyperty
------------------

### Architecture

*Describe main Hyperty functionalities, Hyperty type and scenarios where the Hyperty will be used. Describe main internal Hyperty component architecture with a class diagram.*

The Group Chat main functionality is to handle Text conversations among groups.

### Hyperty Data Objects schemas

*Identify reTHINK standardised data object schemas or Specify new Data Object schemas handled by the Hyperty*

This Hyperty handles standard [Communication Data Objects](https://github.com/reTHINK-project/dev-service-framework/blob/develop/docs/datamodel/data-objects/communication/readme.md) extended for Chat Communications:

![Group Chat Data Model](https://github.com/reTHINK-project/dev-service-framework/blob/develop/docs/datamodel/data-objects/communication/Communication-Data-Object-Model.png)

Each Chat Message is a SyncDataChild object.

The Hyperty author is the Reporter of the Chat Message and all other Group Chat Hyperty participants are observers.

### Hyperty API

*Specify Hyperty API to be consumed by the Application*

The Group Chat Hyperty implements two Hyperty APIs:

#### Hyperty Group Chat Manager API

The Hyperty Group Chat Manager API is used to manage new Chat Group conversations.

**addListener**

This function is used to handle notifications about incoming invitations to create a new Group Chat.

**create**

This function is used to create a new Group Chat providing the identifier of the Group to be notified.

#### Hyperty Group Chat API

The Hyperty ConnectionController API is used to control a connection instance.

**send**

This function is used to send a chat message.

**close**

This function is used to close an existing Group Chat instance.

**addParticipant**

This function is used to add / invite new participant on an existing Group Chat instance.

**removeParticipant**

This function is used to remove a participant from an existing Group Chat instance.

**open**

This function is used to open a Group Chat instance that was previously closed.

### Main data flows

*Use MSCs to describe how the Application can use the Hyperty API for the main use cases supported by the Hyperty. Mapping between the Hyperty API functions and the Hyperty Framework functions including the Data Object handling should be depicted in separated in Diagrams*

The following main use cases are supported by the Group Chat Hyperty:

#### Hyperty initialisation

#### Send Chat Message

![Send Message](group-chat-send.png)

#### Receive Chat Message

![Send Message](group-chat-receive.png)
