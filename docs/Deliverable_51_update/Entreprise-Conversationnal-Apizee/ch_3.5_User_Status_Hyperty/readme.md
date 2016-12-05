### 3.5 User-Status hyperty
#### 3.5.1 Location hyperty functionality description

The UserStatus is an hyperty that allows send its status to a list of users (contacts) and subscribe the the status from other users. UserStatus hyperty defines a "connected" and "disconnected" status but the application can define other status if needed.

When starting, the UserStatus hyperty is not able to subscribe to a remote user status. When receiving a new invitation to subscribe to a remote user status, the hyperty also sends itself an invitation to the remote user to subscribe to its status (shema)

To manage a remote user's disconnection, the UserStatus hyperty continuously update and broadcast the status to the other parties (heartbit). If the hyperty doesn't receive an update for a certain amount of time, it considers the remote user as disconnected.

#### 3.5.2 Data-schema used

Availability is It uses the Context Data schema so it is compatible with any hyperty using the same data schema.

#### 3.5.3 Exposed API

**create**

Start monitoring for presence status
    
**setStatus**

Define new status for current user availability.


**getStatus**

Retrieve current user state

More detailes could be found in the following link https://github.com/reTHINK-project/dev-hyperty/tree/master/docs/user-status
