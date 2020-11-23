---
id: suppliers
title: Biometric Suppliers
sidebar_label: Biometric Suppliers
slug: /suppliers
---

Biometrics suppliers are one of the most important components of our
architecture. Through the suppliers we will have available the biometric
algorithms and solutions that are provided for the users' simulations. In this
sense, the B4LL project acts as an API gateway. This allows that when desired,
users can experience the same solution through different proposals available.

Our architecture is created in a simple way, allowing the rapid integration of
new biometrics suppliers whenever desirable. To do this, simply create a new
Lambida Functions, and its respectives handlers, with the information about the
supplier's API or SDK. This function will allows our engine to have access to
the services provided.

import useBaseUrl from '@docusaurus/useBaseUrl';

<div style={{textAlign: 'center'}}>
<img alt="B4ll architetcure" src={useBaseUrl('img/Suppliers.svg')}/>
</div>
