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

A arquitetura do sistema funciona possui três elementos principais (IVR, Engine
and Biometric Supplier) e funciona como a figura a seguir. o usuário liga para o
call centre para ter acesso ao menu e os casos de uso que podem ser vistos. O
Call centre se comunica com o nosso engine que gerencia as solicitações e atua
como orquestrador entre o call centre e o biometric supplier. O biometric
supplier por sua vez, fornece a solucição de gravação e reconhecimento de voz.

import useBaseUrl from '@docusaurus/useBaseUrl';

<img alt="Voice Biometrics Architecture"
src={useBaseUrl('img/voiceArchitecture.svg')} />

The registration will take place through the voice record for a specific
passphrase, detecting the voice patterns and speech styles, thus creating a
digital signature for the user. Once the record is created, it is possible to
perform authentication using a passphrase by comparing the current user's voice
with the stored signature.
