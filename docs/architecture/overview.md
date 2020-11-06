---
id: overview
title: B4LL Architecture
sidebar_label: Overview
---

import useBaseUrl from '@docusaurus/useBaseUrl';

This section describes the architecture proposed for the B4LL project. The
project was thought to be modular, allowing to offer, when necessary, new use
cases, types of biometrics and biometrics suppliers.

The architecture is divided in four main parts: the landing page, the
communication channels (mostly represented by the application), the engine, and
the biometrics suppliers. Each part is briefly described below. More details can
be found in the following sections

1. **Landing page:** B4LL project page containing relevant information for a
   better understanding of the use of biometrics and how the B4ll project can
   support mobile operators in the implementation of biometric technologies. The
   landing page can be accessed here: [B4ll Project](https://www.gsma.com/lab).

2. **Communication Channels:** The communication channels are responsible for
   the communication interface between the user and the b4ll system. The main
   communication channel is the mobile application, however, these channels can
   use external communication providers to supply new forms of interaction. The
   use of Twilio to create a call center is an example of a communication
   channel provider.

    **Mobile Application:** The main communication channel currently used in the
    project. The mobile application will provide access to all types of
    biometrics.

3. **Engine:** This part orchestrates the connection between the other parts of
   the architecture handling the data received from the communication channels
   and providing it to the engine.

4. **Biometric Suppliers:** Biometric solutions available on the market. The
   connection with the suppliers takes place through an SDK or API and allows
   access to biometric recognition solutions.

### Architectural Parts

**Figure:** Main components of the architecture.

<div style={{textAlign: 'center'}}>
<img alt="B4ll architetcure" src={useBaseUrl('img/ArchitectureParts.svg')}/>
</div>

### Connexions

-   The elements of the communication channel are responsible for requests and
    responses to the engine of the system.
-   The engine orchestrates the flow of messages and directs the requests to the
    selected biometric supplier.
-   The connection between the engine and the supplier is made using AWS lambda
    functions and the API or SDK provided by the supplier.

When using B4LL, the user activates one of the communication providers that will
intermediate data capture through the user interface. In this case, the channel
can be the mobile application, or another one that is necessary. The
architecture is prepared to accept extra communication providers and integrates
them with the engine. The call center is an example of this situation. In this
case a component to connects the call center to the engine was created.

The business logic of the communication channel integrates the communication
between the communication provider and the engine, allowing data capture,
processing and when necessary storage. Then the biometric data is passed to the
engine.

The engine logic handle the data received from the communication channels and
provide it to the Biometric Suppliers in an acceptable format. The
request/response connextion between engine and biometric supplier is done using
the supplier's API (or SDK) and the engine handler functions.

**Figure:** Architecture components and its relations.

<div style={{textAlign: 'center'}}>
<img alt="B4ll architetcure" src={useBaseUrl('img/ArchitectureConnexions.svg')}/>
</div>

:::info Data Storage It is important to mention here that the biometric data is
only stored on the biometri suppliers side. :::

### Detailed View

The diagram below sketches out a microservice-based serverless architecture.
Embracing a microservice architecture will make it more straightforward to add
new biometrics types or providers in future through the creation of new
connections for the new components.

**Figure:** Detailed architectural diagram.

<div style={{textAlign: 'center'}}>
<img alt="B4ll architetcure" src={useBaseUrl('img/B4llArchitecture.svg')}/>
</div>

Other services can also be used to enhance the user experience – for example
DynamoDB may be used to store user data and preferences within the communication
channel business logic – or for other technical reasons, such as using an S3
bucket in the biometrics engine to store image data prior to biometric
verification. Also shown is a simple deployment for the landing page. The
content of this landing page will be static, so an object storage-based
deployment is appropriate.

### Technological Considerations

-   The architecture is based on a scalable serveless model using an AWS
    environment
-   The orchestration and deployment of the components is fully automatable by
    using AWS CloudFormation and AWS SAM.
-   The main language used for the project is TypeScript
-   The API's follow the API Specification 3.0
