---
title: Introduction
sidebar_label: Introduction
---

Voice is one of the biometric types approachd in the B4LL project to demonstrate
the strengths of using voice and speech recognition, and therefore, the
identification and authentication of mobile users to access mobile services.

The voice solution consists of an IVR Server System that allows the user to talk
to a voicebot through a menu of different possibilities. The services available
are a simulation of real services and have the purpose of demonstrate the use of
voice registration and authentication.

Based on the B4LL project architecture, the voice solution has three main
elements (call center, Engine and Biometric Supplier) and works like the figure
shown below. the user calls the call center to access the menu and the available
use cases. The call center communicates with the engine that acts as an
orchestrator between the call center and the biometric supplier, managing the
communication between them. The biometric supplier in turn provides the solution
for voice recording and voice recognition.

import useBaseUrl from '@docusaurus/useBaseUrl';

<img alt="Voice Biometrics Architecture"
src={useBaseUrl('img/VoiceArchitecture.svg')} />

The registration will take place through the voice recording for a specific
passphrase, the voice patterns detection and speech styles detection. Thus the
biometric solution creates a digital signature for the user. Once the record is
created, it is possible to perform authentication using the registered
passphrase by comparing the current user's voice with the stored signature.

The solution is an open source asset that allows mobile operators to test the
use of voice for authenticating customers’ identity in different use cases.
Specifically, the asset will allow operators and FSPs to:

1. Register their voice,

2. Navigate menus and execute commands using their voice,

3. Receive phone calls to validate actions/activities, and

4. Identify themselves using their voice to be granted permission to execute
   secure actions.

**Figure:** The figure below shows a more detailed view comparing the voice
asset with our architecture.

<img alt="Voice Biometrics Detailed Architecture"
src={useBaseUrl('img/VoiceDetailedArch.png')} />

:::note Note

It is important to point out that the proposed demo asset will only be available
to mobile operators to see the possibilities of biometrics with demo data i.e.
no real customer data will be used in this project.

:::
