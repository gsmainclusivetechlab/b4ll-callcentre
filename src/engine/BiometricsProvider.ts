export enum BiometricType {
    VOICE,
}

export interface EnrolmentRequest<EnrolmentData> {
    [BiometricType.VOICE]: {
        biometricType: BiometricType.VOICE;
        /** opaque data structure to pass to response handler */
        request: EnrolmentData;
        phrase: string;
    };
}

export interface EnrolmentResponse<EnrolmentData> {
    [BiometricType.VOICE]: {
        biometricType: BiometricType.VOICE;
        /** URL pointing to a voice recording for the provider to process */
        recordingUrl: string;
        /** opaque data structure to be passed from request */
        request: EnrolmentData;
    };
}

export interface VerificationRequest<VerificationData> {
    [BiometricType.VOICE]: {
        biometricType: BiometricType.VOICE;
        /** opaque data structure to pass to response handler */
        request: VerificationData;
        phrase: string;
    };
}

export interface VerificationResponse<VerificationData> {
    [BiometricType.VOICE]: {
        biometricType: BiometricType.VOICE;
        /** URL pointing to a voice recording for the provider to process */
        recordingUrl: string;
        /** opaque data structure to be passed from request */
        request: VerificationData;
    };
}

export interface BiometricsProvider<
    T extends BiometricType,
    EnrolmentData,
    EnrolmentRequestParams,
    EnrolmentResponseParams,
    VerificationData,
    VerificationRequestParams,
    VerificationResponseParams
> {
    getEnrolmentRequest: (
        /** provider-specific settings */
        params: EnrolmentRequestParams
    ) => Promise<EnrolmentRequest<EnrolmentData>[T]>;

    handleEnrolmentResponse: (
        x: EnrolmentResponse<EnrolmentData>[T],
        /** provider-specific settings */
        params: EnrolmentResponseParams
    ) => Promise<{
        success: boolean;
        complete: boolean;
        next?: EnrolmentRequest<EnrolmentData>[T];
    }>;

    getVerificationRequest: (
        /** provider-specific settings */
        params: VerificationRequestParams
    ) => Promise<VerificationRequest<VerificationData>[T]>;

    handleVerificationResponse: (
        x: VerificationResponse<VerificationData>[T],
        params: VerificationResponseParams
    ) => Promise<{
        success: boolean;
        confidence: number;
        complete: boolean;
        next?: VerificationRequest<VerificationData>[T];
    }>;
}
