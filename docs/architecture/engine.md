---
id: engine
title: Engine
sidebar_label: Engine
---

import useBaseUrl from '@docusaurus/useBaseUrl';

In the platform architecture. the Engine acts as a centralizer of the existing
flows. Users send requests to the Engine through the application or accessing
directly a communication provider. In turn, the Engine communicates with
Biometric Suppliers to make the services available to users.

Within the biometrics engine, the lambda functions will route the biometrics
credentials to an appropriate biometrics’ supplier. If a voice recording is
received, for example, the engine will select a biometric supplier which is
capable of performing voice authentication. The biometric supplier selection may
be guided by the user’s selection within the mobile app.

<div style={{textAlign: 'center'}}>
<img alt="B4ll architetcure" src={useBaseUrl('img/engine.svg')}/>
</div>
