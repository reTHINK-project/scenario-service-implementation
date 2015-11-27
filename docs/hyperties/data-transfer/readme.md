Dummy Header for Section per ToC
================================

Hyperties Specification
=======================

DataTransfer
-------------------

### Architecture

The DataTransfer Hyperty main functionality is to transfer data from or to an endpoint over a REST interface.

### Hyperty Data Objects schemas

This Hyperty handles a standard [Context Data Object](https://github.com/reTHINK-project/architecture/tree/master/docs/datamodel/context)

### Hyperty API

DataTransfer hyperty provides a REST based API for data up- and download, using GET, POST, and DELETE

**addListener**

This function is used to handle incoming requests

**retrieve**

This function requests a data-object via HTTP GET

**send**

This function sends a data object via HTTP POST.

**requestDelete**

This function sends an HTTP DELETE for a specific object-id

### Main data flows

[DataTransferHypertyGET]

[DataTransferHypertyPOST]

[DataTransferHypertyDELETE]
