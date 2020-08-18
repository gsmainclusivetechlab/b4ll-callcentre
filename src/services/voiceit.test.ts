describe('voiceIt service', () => {
    // const voiceIt = MockedVoiceIt.mock.instances[0];

    test('createUser should handle failures', async () => {
        //     voiceIt.createUser = jest.fn(function (cb) {
        //         cb({
        //             responseCode: 'FAIL',
        //             message: 'Something went wrong',
        //         });
        //     });
        //     expect(createUser()).rejects.toMatchObject({
        //         message: 'Something went wrong',
        //     });
    });
    // test('createUser should handle errors', async () => {
    //     voiceIt.createUser = jest.fn(function () {
    //         throw new Error('invalid implementation');
    //     });
    //     expect(createUser()).rejects.toThrow('invalid implementation');
    // });

    // test('should call sdk enrolUser', async () => {
    //     voiceIt.createVoiceEnrolmentByUrl = jest.fn(function (input, cb) {
    //         cb({
    //             responseCode: 'SUCC',
    //             textConfidence: 0.9,
    //         });
    //     });
    //     expect(
    //         enrolUser('234', 'en-GB', {
    //             phrase: 'Tomorrow',
    //             recordingUrl: '../voice.wav',
    //         })
    //     ).resolves.toMatchObject({ textConfidence: 0.9 });
    //     expect(voiceIt.createVoiceEnrolmentByUrl).toHaveBeenCalledWith(
    //         {
    //             userId: '234',
    //             phrase: 'Never forget tomorrow is a new day',
    //             audioFileUrl: '../voice.wav',
    //             contentLanguage: 'en-GB',
    //         },
    //         expect.any(Function)
    //     );
    // });
    // test('enrolUser should handle failures', async () => {
    //     voiceIt.createVoiceEnrolmentByUrl = jest.fn(function (input, cb) {
    //         cb({
    //             responseCode: 'FAIL',
    //             textConfidence: 0.1,
    //         });
    //     });
    //     expect(
    //         enrolUser('234', 'en-GB', {
    //             phrase: 'Tomorrow',
    //             recordingUrl: '../voice.wav',
    //         })
    //     ).rejects.toMatchObject({ textConfidence: 0.1 });
    // });
    // test('enrolUser should handle failures', async () => {
    //     voiceIt.createVoiceEnrolmentByUrl = jest.fn(function () {
    //         throw new Error('A problem occurred');
    //     });
    //     expect(
    //         enrolUser('234', 'en-GB', {
    //             phrase: 'Tomorrow',
    //             recordingUrl: '../voice.wav',
    //         })
    //     ).rejects.toThrow('A problem occurred');
    // });

    // test('should call sdk verifyUser', async () => {
    //     voiceIt.voiceVerificationByUrl = jest.fn(function (input, cb) {
    //         cb({
    //             responseCode: 'SUCC',
    //             confidence: 0.85,
    //         });
    //     });
    //     expect(
    //         verifyUser('234', 'en-GB', {
    //             phrase: 'Tomorrow',
    //             recordingUrl: '../voice.wav',
    //         })
    //     ).resolves.toMatchObject({ confidence: 0.85 });
    //     expect(voiceIt.createVoiceEnrolmentByUrl).toHaveBeenCalledWith(
    //         {
    //             userId: '234',
    //             phrase: 'Never forget tomorrow is a new day',
    //             audioFileUrl: '../voice.wav',
    //             contentLanguage: 'en-GB',
    //         },
    //         expect.any(Function)
    //     );
    // });
    // test('enrolUser should handle failures', async () => {
    //     voiceIt.voiceVerificationByUrl = jest.fn(function (input, cb) {
    //         cb({
    //             responseCode: 'FAIL',
    //             textConfidence: 0.1,
    //         });
    //     });
    //     expect(
    //         verifyUser('234', 'en-GB', {
    //             phrase: 'Tomorrow',
    //             recordingUrl: '../voice.wav',
    //         })
    //     ).rejects.toMatchObject({ textConfidence: 0.1 });
    // });
    // test('enrolUser should handle failures', async () => {
    //     voiceIt.voiceVerificationByUrl = jest.fn(function () {
    //         throw new Error('A problem occurred');
    //     });
    //     expect(
    //         verifyUser('234', 'en-GB', {
    //             phrase: 'Tomorrow',
    //             recordingUrl: '../voice.wav',
    //         })
    //     ).rejects.toThrow('A problem occurred');
    // });
});
