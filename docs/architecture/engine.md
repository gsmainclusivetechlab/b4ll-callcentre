---
id: engine
title: Engine
sidebar_label: Engine
---

import useBaseUrl from '@docusaurus/useBaseUrl';

The application's architecture is composed of three main parts: the user side,
which consists of a mobile device (including feature phones); the server side,
which is developed by our team to create user sessions; and the supplier, which
contains the biometric platform with voice/speech recognition algorithms.

In the platform architecture. the Engine acts as a centralizer of the existing
flows. Users send requests to the Engine through the application or accessing
directly a communication provider. In turn, the Engine communicates with
Biometric Suppliers to make the services available to users. The red arrows
indicate the communication flows involving access to the API Gateway provided by
the Engine. In Appendix 5, it is possible to understand in more detail the
Engine's internal architecture.

The diagram below sketches out a microservice-based serverless architecture.
Embracing a microservice architecture will make it more straightforward to add
new biometrics types or providers in future.

<div style={{textAlign: 'center'}}>
<img alt="B4ll architetcure" src={useBaseUrl('img/engineGeneric.svg')}/>
</div>

<div style={{textAlign: 'center'}}>
<img alt="B4ll architetcure" src={useBaseUrl('img/engine.png')}/>
</div>

Within the biometrics engine, the lambda functions will route the biometrics
credentials to an appropriate biometrics’ supplier. If a voice recording is
received, for example, the engine will select a biometric supplier which is
capable of performing voice authentication. For our demo application, the
selection may be guided by the user’s selection within the mobile app.

Other services not shown in the diagram above can also be used to enhance the
user experience – for example DynamoDB may be used to store user data and
preferences within the communication channel business logic – or for other
technical reasons, such as using an S3 bucket in the biometrics engine to store
image data prior to biometric verification. Also shown is a simple deployment
for the landing page. The content of this landing page will be static, so an
object storage-based deployment is appropriate. The current proof of concept
contains an implementation for the “Call Centre” communication channel, and
handlers for single biometrics type (voice) and supplier. Additionally, the
communications channel and biometrics engine are not currently separated by a
dedicated API Gateway.
