Dummy Header for Section per ToC
================================

Hyperties Specification
=======================

My Bracelet Hyperty
-------------------

### Architecture

The My Bracelet Hyperty main functionality is to collect data from an individual bracelet, publish it to a certain Context Resource URL allocated by the Hyperty Runtime and notifying the App about context changes.

### Hyperty Data Objects schemas

This Hyperty handles a standard [Context Data Object](https://github.com/reTHINK-project/dev-service-framework/blob/develop/docs/datamodel/data-objects/context/readme.md) with:

**ContextType**

HeartRate

StepsCounter

**ContextUnit**

-	beat/m: Heart rate in beats per minute
-	beats: Cumulative number of heart beats
-	steps/m: number of steps per minute
-	steps: Cumulative number of steps

### Hyperty API

Bracelet API is aligned with [W3C Generic Sensor API](http://www.w3.org/TR/2015/WD-generic-sensor-20151015/)

**Discover Available Health Context from the Bracelet**

```
Promise<ContextDataObjectList> discoverHealthContext( )
```

**Start Data Reading from Sensors**

options parameter is of type SensorOptions defined in [W3C Generic Sensor API](http://www.w3.org/TR/2015/WD-generic-sensor-20151015/#the-sensor-interface)

```
startReading( SensorOptions options )
```

### Main data flows

My Bracelet Setup:

![My Bracelet Setup](my-bracelet-setup.png)

Monitoring data collected from My Bracelete:

![Monitoring My Bracelet](my-bracelet-reading.png)
