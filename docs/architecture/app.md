---
id: app
title: Communication Channels
sidebar_label: Communication Channels
slug: /app
---

import useBaseUrl from '@docusaurus/useBaseUrl';

Communication channels act as a point of interaction between the user and the
project and can use different types of user interfaces. Currently, two
communication channels are being used in the project: a call center and a mobile
application.

### Call Centre

The call center is executed independently of the mobile application and uses
Twilio as a communication provider. The connections between the engine and
Twilio are made through Twilio Markup Language (TwiML).

<div style={{textAlign: 'center'}}>
<img alt="Docusaurus with Keytar" src={useBaseUrl('img/CallCentreTwilio.svg')} />
</div>

### Mobile Application

The mobile application is still under development and will allow a better user
experience when testing the different use cases and biometric suppliers.

The application provides operators with a showcase environment to experience the
use cases for different types of biometrics. This way we can concentrate
different approaches using one communication channel. It allows to provide a
good user experience when the operators need to decide about what is the best
type os biometric and the best solution available in the market. This is
possible since the B4ll can connect to diffeerent suppliers, allowing a
comparison between solutions and algorithms availables.

The following figure shows a generic use case about how the application will
work. Users access the app and select the parameters for the demo, such as:
biometric type, biometric supplier and use case. The application connects with
our engine, or if necessary with another communication channel, allowing request
and response calls through an API gateway.

<div style={{textAlign: 'center'}}>
<img alt="Docusaurus with Keytar" src={useBaseUrl('img/appUseCase.svg')} />
</div>

Our main objective is to demonstrate the potential of biometrics in emerging
markets in order to provide financial inclusion. Because of this, the target
operating systems in this first moment are Android, Android Go and iOS. Also,
whenever possible, the feature phones are being considered.
