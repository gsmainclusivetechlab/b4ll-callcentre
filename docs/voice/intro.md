---
title: Introduction
sidebar_label: Introduction
---

The Voice Biometric project is a showcase to demonstrate the strengths of using
voice as a biometric solution for voice and speech recognition, and therefore,
the identification and authentication of mobile users to access services of
mobile operators.

The project consists of an IVR Server System that allows the user to talk to
voicebot through a menu of different possibilities. The services available are a
simulation of real services and have the purpose of demonstrate the use of voice
registration and authentication.

The system architecture has three main elements (call center, Engine and
Biometric Supplier) and works like the figure shown below. the user calls the
call center to access the menu and the use cases that can be assessed. The call
center communicates with our engine that acts as an orchestrator between the
call center and the biometric supplier, managing the communication between them.
The biometric supplier in turn provides the solution for voice recording and
voice recognition.

import useBaseUrl from '@docusaurus/useBaseUrl';

<img alt="Voice Biometrics Architecture"
src={useBaseUrl('img/VoiceArchitecture.svg')} />

The registration will take place through the voice record for a specific
passphrase, detecting the voice patterns and speech styles, thus creating a
digital signature for the user. Once the record is created, it is possible to
perform authentication using a passphrase by comparing the current user's voice
with the stored signature.

The project under development is an open source asset that allows financial
service providers to test the use of voice for authenticating customers’
identity in different use cases. Specifically, the asset will allow
participating FSPs to:

1. register their voice,

2. navigate menus and execute commands using their voice,

3. receive phone calls to validate actions/activities, and

4. identify themselves using their voice to be granted permission to execute
   secure actions.

<img alt="Voice Biometrics Detailed Architecture"
src={useBaseUrl('img/VoiceDetailedArch.png')} />

:::tip Note It is important to point out that the proposed demo asset will only
be available to service providers to test with demo data i.e. no real customer
data will be used in this project. :::
