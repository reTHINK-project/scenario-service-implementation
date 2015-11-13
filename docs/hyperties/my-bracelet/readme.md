Dummy Header for Section per ToC
================================

Hyperties Specification
=======================

My Bracelet Hyperty
-------------------

### Architecture

*Describe main Hyperty functionalities, Hyperty type and scenarios where the Hyperty will be used. Describe main internal Hyperty component architecture with a class diagram.*

The My Bracelet Hyperty main functionality is to collect data from an individual bracelet and publish it to a certain Context Resource URL.

### Hyperty Data Objects schemas

*Identity reTHINK standardised data object schemas or Specify new Data Object schemas handled by the Hyperty*

### Hyperty API

*Specify Hyperty API to be consumed by the Application*

It should be aligned with [W3C Generic Sensor API](http://www.w3.org/TR/2015/WD-generic-sensor-20151015/)

**Constructor**

contextURL is the resource URL where to publish data collected from the device.

bracelet( contextURL, options )

**Data Reading**

### Main data flows

*Use MSCs to describe how the Application can use the Hyperty API for the main use cases supported by the Hyperty. Mapping between the Hyperty API functions and the Hyperty Framework functions including the Data Object handling should be depicted in separated in Diagrams*
