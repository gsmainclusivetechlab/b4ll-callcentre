---
title: Use Cases
sidebar_label: Use Cases
---

For the voice biometrics showcase it is possible to have access to the use cases
described below. These use cases aim to address different possibilities that can
be approached with the use of voice verification. However, depending on the
operator's needs, these solutions can be changed and adapted to simulate other
everyday situations.

## User Checking

When calling the call centre the user pass through a checking phase which
determine the status of the user as being **not enrolled**, **enrolled and
active**, and, **enrolled and deactivated**. Depending on the checking result
the call centre can take three different flows as described flowing:

### Enrolment

This flow means the user is not previously registered in the voice PoC. Thus, it
will take the user though the enrolment process. During this process one of the
voice phrases available for the call centre is randomly selected. The users then
must to record their voice phrase 3 times to the algorithm created the
voiceprint. After this quick process, the user is registered in the system.

It is important to mention here that, as discussed previously, we are not making
the initial enrolment with the mobile operator. We assume the user has already
created a mobile account and he/she is now enrolling in the voice recognition
service. There are different approaches the operator could use here, such as
validating the user with a PIN before enrolling into the voice service.

:::note User Story Include here details about the ID for initial identification
:::

### Verification

If the number of the caller is recognised in our data base and the account is
active the user is conducted for the voice verification process. The system will
provide one of the registered passphrases to the user and the user will repeat
it to have the voice verified. When verified, the user will receive a message
informing the verification was completed and the confidence of the algorithm.
The level of confidence can be used as a threshold for the verification process
and it is important to drive business needs.

### Reactivation

When the users deactivate their account (this possibility is available in the
main menu), the voiceprints are kept registered for future reactivation. Thus,
when a deactivated user is recognised there is no need to pass through the
enrolment process again. This way, the call centre uses the verification process
to reactivate the user. This use case can be adapted to other purposes, such as
SIM reactivation.

## Mobile Money Transactions

For mobile money transactions the users can navigate through a menu with three
different options and choose the one they want to test. The 3 different
possibilities available are: check the account balance, pay a bill and make a
transfer.

### Account Balance

Accessing this option, the user will listen the current mobile money account
balance. For this showcase the balance will be \$100 and will be renewed
automatically when it reaches zero, after using it for payments and transfers.

### Pay a Bill

This use case simulates the use of voice verification to make a payment. It can
be adapted to be used for merchant payments and any kind of bill and fees
payment. This is particular useful for featured phones when other payment
technologies are not available. Using voice for payment authentication would
speed the payment process and improve the safety for users. To use this
simulation the user has three different flows to test.

**Flow 01:** Invalid Payment Number: Any number different of 12345 or 54321 will
be considered as an invalid payment number.

**Flow 02:** Payment Successful: The payment number 12345 will let the user to
pay a bill of \$50.

**Flow 03:** Payment Declined: The payment number 54321 will lead the user to
try a payment of $150. Since the balance is $100 the payment will be declined
for insufficient funds.

### Make a Transfer

This use case simulates a mobile money transference using voice authentication
to access the service.

**Flow 01:** Invalid Transfer Account: If the user selects an account number
different of112233 the account number will be invalid.

**Flow 02:** Transfer Authorised: If the transfer is to the account number
112233 and the amount is until \$100 (Current user balance), the transfer will
be authorised.

**Flow 03:** Transfer Declined: If the transfer is to the account number 112233
and the amount is more \$100 (Current user balance), the transfer will be
declined.

## Simulate Alert

This use case demonstrates the possibility of call back the user to simulate a
notification or alert. When selecting this use case, the user will receive a
call informing about a notification/alert in their account. It could be
situations like an overdraft, a suspicious transaction, a high value
transference, etc. If necessary, during the calling the user can use voice
verification to validate a transaction. Currently this use case is being tested
using a webpage available here:
https://gsmainclusivetechlab.github.io/bilt-voice/voice-biometric/alerts/

## Manage Passphrase

The voice verification process needs only one passphrase to be used. However,
for this use case we considered the possibility of using different passphrases
to validate the user. The user can register multiple passphrases using this
option and during the validation process one of them is selected randomly. If
the user does not create new passphrases the one created during the enrolment
process will be used. The use of multiple passphrases increases the security
during the voice verification process.

## Deactivate Account

This use case set the user account as deactivated. The deactivation simulates a
scenario where the user wants to keep the data with the operator for possible
future account reactivation using the voice verification. Other use cases can be
approached here as SIM reactivation or services reactivations.

## Surveys

This is a way to receive feedback from users through questions with few options
of choice. The users can use the keyboard numbers to answer the survey. If
necessary, speech recognition can be applied allowing the use of opened
questions. The survey may have more than one question, however the bigger it
gets the higher is the possibility the user gives up without giving the
feedback. This way 2 or 3 questions would be the best choice. This use case can
be applied as a feedback survey in any of the previous use cases so we could get
a user opinion about it.
