declare module 'voiceit2-nodejs' {
    export interface Foo {
        number: number;
    }
    export namespace VoiceIt {
        type ResponseCode =
            | 'SUCC' // Successful API call
            | 'MISP' // Missing Parameters
            | 'MISU' // Missing users
            | 'FAIL' // The API call completed but failed. Example: Verification Unsuccessful
            | 'UNFD' // User not found
            | 'UDNM' // User does not match
            | 'GNFD' // Group not found
            | 'ENFD' // Enrolment not found
            | 'DDNE' // Data does not exist
            | 'FNFD' // Face not found in video
            | 'FTMF' // Found too many faces in video
            | 'IFAD' // Incorrect formatted audio data
            | 'IFVD' // Incorrect formatted video data
            | 'INCP' // Incorrect contentLanguage parameter
            | 'INPP' // Incorrect phrase parameter
            | 'SRNR' // Sound recording does not meet requirements
            | 'SSTQ' // Speaker is speaking too quiet
            | 'SSTL' // Speaker is speaking too loud
            | 'NEHS' // 	Not enough human speech detected
            | 'STTF' // Speech to text failed
            | 'RWPU' // Recording was previously used
            | 'PNTE' // Phrase needs a minimum of three enrolments
            | 'PDNM' // Phrase does not match
            | 'NPFC' // No phrases for contentLanguage
            | 'TVER' // Three video enrolments required
            | 'NFEF' // No face enrolments found
            | 'IEID' // Invalid enrolmentId
            | 'GERR' // A general error occurred
            | 'DAID' // Developer account is disabled ( most likely due to insufficient funds)
            | 'UNAC' // Unauthorized access ( make sure you are using the right API Key and Token)
            | 'FBDN' // Forbidden, please make sure to only access the API via HTTPS
            | 'CLNE' // Content language not enabled for free tier, only en-US is available on the VoiceIt free tier plan
            | 'ACLR' // API call limit reached
            | 'ACTO' // API call timed out
            | 'NSPE' // Enrolment not similar to previous enrolments
            | 'EMNV' // Email not verified
            | 'SANF' // Sub-account not found
            | 'EAEX'; // Email already exists in our system

        type BasicLanguage =
            // Catalan (Spain),
            | 'ca-ES'
            // Chinese, Mandarin (Simplified, China),
            | 'cmn-Hans-CN'
            // Chinese, Mandarin (Simplified, Hong Kong),
            | 'cmn-Hans-HK'
            // Chinese, Mandarin (Traditional, Taiwan),
            | 'cmn-Hant-TW'
            // Danish (Denmark),
            | 'da-DK'
            // German (Germany),
            | 'de-DE'
            // English (Australia),
            | 'en-AU'
            // English (Canada),
            | 'en-CA'
            // English (United Kingdom),
            | 'en-GB'
            // English (United States),
            | 'en-US'
            // Spanish (Spain),
            | 'es-ES'
            // Spanish (Mexico),
            | 'es-MX'
            // Spanish (United States),
            | 'es-US'
            // Finnish (Finland),
            | 'fi-FI'
            // French (Canada),
            | 'fr-CA'
            // French (France),
            | 'fr-FR'
            // Japanese (Japan),
            | 'ja-JP'
            // Korean (South Korea),
            | 'ko-KR'
            // Norwegian Bokmal (Norway),
            | 'nb-NO'
            // Dutch (Netherlands),
            | 'nl-NL'
            // Polish (Poland),
            | 'pl-PL'
            // Portuguese (Brazil),
            | 'pt-BR'
            // Portuguese (Portugal),
            | 'pt-PT'
            // Russian (Russia),
            | 'ru-RU'
            // Swedish (Sweden),
            | 'sv-SE'
            // No Speech To Text
            | 'no-STT';

        type PremiumLanguage =
            // Afrikaans (South Africa)
            | 'af-ZA'
            // Amharic (Ethiopia)
            | 'am-ET'
            // Arabic (United Arab Emirates)
            | 'ar-AE'
            // Arabic (Bahrain)
            | 'ar-BH'
            // Arabic (Algeria)
            | 'ar-DZ'
            // Arabic (Egypt)
            | 'ar-EG'
            // Arabic (Israel)
            | 'ar-IL'
            // Arabic (Iraq)
            | 'ar-IQ'
            // Arabic (Jordan)
            | 'ar-JO'
            // Arabic (Kuwait)
            | 'ar-KW'
            // Arabic (Lebanon)
            | 'ar-LB'
            // Arabic (Morocco)
            | 'ar-MA'
            // Arabic (Oman)
            | 'ar-OM'
            // Arabic (State of Palestine)
            | 'ar-PS'
            // Arabic (Qatar)
            | 'ar-QA'
            // Arabic (Saudi Arabia)
            | 'ar-SA'
            // Arabic (Tunisia)
            | 'ar-TN'
            // Azerbaijani (Azerbaijan)
            | 'az-AZ'
            // Bulgarian (Bulgaria)
            | 'bg-BG'
            // Bengali (Bangladesh)
            | 'bn-BD'
            // Bengali (India)
            | 'bn-IN'
            // Czech (Czech Republic)
            | 'cs-CZ'
            // Greek (Greece)
            | 'el-GR'
            // English (Ghana)
            | 'en-GH'
            // English (Ireland)
            | 'en-IE'
            // English (India)
            | 'en-IN'
            // English (Kenya)
            | 'en-KE'
            // English (Nigeria)
            | 'en-NG'
            // English (New Zealand)
            | 'en-NZ'
            // English (Philippines)
            | 'en-PH'
            // English (Tanzania)
            | 'en-TZ'
            // English (South Africa)
            | 'en-ZA'
            // Spanish (Argentina)
            | 'es-AR'
            // Spanish (Bolivia)
            | 'es-BO'
            // Spanish (Chile)
            | 'es-CL'
            // Spanish (Colombia)
            | 'es-CO'
            // Spanish (Costa Rica)
            | 'es-CR'
            // Spanish (Dominican Republic)
            | 'es-DO'
            // Spanish (Ecuador)
            | 'es-EC'
            // Spanish (Guatemala)
            | 'es-GT'
            // Spanish (Honduras)
            | 'es-HN'
            // Spanish (Nicaragua)
            | 'es-NI'
            // Spanish (Panama)
            | 'es-PA'
            // Spanish (Peru)
            | 'es-PE'
            // Spanish (Puerto Rico)
            | 'es-PR'
            // Spanish (Paraguay)
            | 'es-PY'
            // Spanish (El Salvador)
            | 'es-SV'
            // Spanish (Uruguay)
            | 'es-UY'
            // Spanish (Venezuela)
            | 'es-VE'
            // Basque (Spain)
            | 'eu-ES'
            // Persian (Iran)
            | 'fa-IR'
            // Filipino (Philippines)
            | 'fil-PH'
            // Galician (Spain)
            | 'gl-ES'
            // Gujarati (India)
            | 'gu-IN'
            // Hebrew (Israel)
            | 'he-IL'
            // Hindi (India)
            | 'hi-IN'
            // Croatian (Croatia)
            | 'hr-HR'
            // Hungarian (Hungary)
            | 'hu-HU'
            // Armenian (Armenia)
            | 'hy-AM'
            // Indonesian (Indonesia)
            | 'id-ID'
            // Icelandic (Iceland)
            | 'is-IS'
            // Italian (Italy)
            | 'it-IT'
            // Javanese (Indonesia)
            | 'jv-ID'
            // Georgian (Georgia)
            | 'ka-GE'
            // Khmer (Cambodia)
            | 'km-KH'
            // Kannada (India)
            | 'kn-IN'
            // Lao (Laos)
            | 'lo-LA'
            // Lithuanian (Lithuania)
            | 'lt-LT'
            // Latvian (Latvia)
            | 'lv-LV'
            // Malayalam (India)
            | 'ml-IN'
            // Marathi (India)
            | 'mr-IN'
            // Malay (Malaysia)
            | 'ms-MY'
            // Nepali (Nepal)
            | 'ne-NP'
            // Romanian (Romania)
            | 'ro-RO'
            // Sinhala (Sri Lanka)
            | 'si-LK'
            // Slovak (Slovakia)
            | 'sk-SK'
            // Slovenian (Slovenia)
            | 'sl-SI'
            // Serbian (Serbia)
            | 'sr-RS'
            // Sundanese (Indonesia)
            | 'su-ID'
            // Swahili (Kenya)
            | 'sw-KE'
            // Swahili (Tanzania)
            | 'sw-TZ'
            // Tamil (India)
            | 'ta-IN'
            // Tamil (Sri Lanka)
            | 'ta-LK'
            // Tamil (Malaysia)
            | 'ta-MY'
            // Tamil (Singapore)
            | 'ta-SG'
            // Telugu (India)
            | 'te-IN'
            // Thai (Thailand)
            | 'th-TH'
            // Turkish (Turkey)
            | 'tr-TR'
            // Ukrainian (Ukraine)
            | 'uk-UA'
            // Urdu (India)
            | 'ur-IN'
            // Urdu (Pakistan)
            | 'ur-PK'
            // Vietnamese (Vietnam)
            | 'vi-VN'
            // Chinese, Cantonese (Traditional, Hong Kong)
            | 'yue-Hant-HK'
            // Zulu (South Africa)
            | 'zu-ZA';

        export type ContentLanguage =
            | BasicLanguage
            | PremiumLanguage
            | 'en-DEV';

        export type Response<T> = T & {
            message: string;
            status: number;
            timeTaken: string;
            responseCode: ResponseCode;
        };

        export interface User {
            createdAt: number;
            userId: string;
        }

        export interface VoiceEnrolment {
            createdAt: number;
            contentLanguage: string;
            voiceEnrolmentId: string;
            text: string;
        }
    }

    export default class VoiceIt {
        constructor(userToken: string, empty: '');
        constructor(apiKey: string, apiToken: string);

        /**
         * Creates a user with a uniquely generated `userId`
         */
        createUser(
            callback: (result: VoiceIt.Response<VoiceIt.User>) => void
        ): void;

        /**
         * Retrieve all voice enrolments for a user
         */
        getAllVoiceEnrollments(
            input: { userId: string },
            callback: (
                result: VoiceIt.Response<{
                    count: number;
                    voiceEnrolments: VoiceIt.VoiceEnrolment[];
                }>
            ) => void
        ): void;

        /**
         * Create voice enrolment for a given user.
         *  Audio files should have a fixed length of 5 seconds, with the user beginning to speak after 500 milliseconds. This is used to capture background noise from the beginning and end of the audio clip that is utilized for noise profiling.
         */
        createVoiceEnrollmentByUrl(
            input: {
                userId: string;
                contentLanguage: VoiceIt.ContentLanguage;
                phrase: string;
                audioFileUrl: string;
            },
            callback: (
                result: VoiceIt.Response<
                    VoiceIt.VoiceEnrolment & { textConfidence: number }
                >
            ) => void
        ): void;

        /**
         * Verify voice recording matches previously provided enrolments
         *  Audio files should have a fixed length of 5 seconds, with the user beginning to speak after 500 milliseconds. This is used to capture background noise from the beginning and end of the audio clip that is utilized for noise profiling.
         */
        voiceVerificationByUrl(
            input: {
                userId: string;
                contentLanguage: VoiceIt.ContentLanguage;
                phrase: string;
                audioFileUrl: string;
            },
            callback: (
                result: VoiceIt.Response<
                    VoiceIt.VoiceEnrolment & {
                        confidence: number;
                        textConfidence: number;
                    }
                >
            ) => void
        ): void;
    }
}
