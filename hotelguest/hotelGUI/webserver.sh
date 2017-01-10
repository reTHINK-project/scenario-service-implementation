#!/usr/bin/env bash

#Starts http-server to serve hotelGUI
#requires npm module: 'npm install -g http-server'
#On Linux: Make sure node has permission to bind to port 443: sudo setcap CAP_NET_BIND_SERVICE=+eip $(readlink -f $(which node))
http-server --ssl -p 443 --cors