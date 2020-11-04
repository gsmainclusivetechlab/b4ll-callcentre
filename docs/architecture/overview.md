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
   landing page can be accessed here:
   [B4ll Project - TEMP](https://www.gsma.com/lab).

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
   the architecture.

4. **Biometric Suppliers:** Biometric solutions available on the market. The
   connection with the suppliers takes place through an SDK or API and allows
   access to biometric recognition solutions.

### Architectural Parts

**Figure:** Main components of the architecture and their connexions.

<div style={{textAlign: 'center'}}>
<img alt="B4ll architetcure" src={useBaseUrl('img/ArchitectureParts.svg')}/>
</div>

### Main Connexions

-   The elements of the communication channel are responsible for requests and
    responses to the engine of the system.
-   The engine orchestrates the flow of messages and directs the requests to the
    selected biometric supplier.
-   The connection between the engine and the supplier is made using AWS lambda
    functions and the API or SDK provided by the supplier.

**Figure:** Architecture main connexions. (CHange the figure and insert the
names of the connections - also change to the nam Engine)

<div style={{textAlign: 'center'}}>
<img alt="B4ll architetcure" src={useBaseUrl('img/ArchLevel0.png')}/>
</div>

Ao utilizar o show case, o usuário ativa um dos provedores de comunicação que
intermediará a captura de dados através da interface com o usuário. Neste caso,
o canal pode ser o aplicativo móvel, ou um outro que se faça necessário. In this
case our architecture is prepared to accept this extra components and integrates
it with the engine. The call centre is an example of this situation. In this
case a component to connects the call centre to the engine was created.

The communication channel uses an API Gateway to have access to the engine
business logic, including the Lambda stack...

The engine logic manages the the data received from the communication channels
and send it to the Biometric Suppliers. The request/response connextion between
engine and biometri supplier is done using the supplier's API (or SDK) and the
engine handler functions.

The following figure shows the architecture with the communication channels.

### Detailed Architecture

INSERIR AQUI A ARQUITETURA GERAL

A figura a seguir mostra a arquitetura de maneira mais detalhada.

### Technological Considerations

-   The architecture is based on a scalable serveless model using an AWS
    environment
-   The orchestration and deployment of the components is fully automatable by
    using AWS CloudFormation and AWS SAM.
-   The main language used for the project is TypeScript
-   The API's follow the API Specification 3.0
