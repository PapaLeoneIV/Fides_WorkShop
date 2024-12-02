interface AuthBindingKey {
    PublishLoginResp: string;
    PublishRegistrationReq: string; 
    ConsumeLoginReq: string;
    ConsumeRegistrationReq: string;
    PublishUserInformationResp: string;
    ConsumeUserInformationReq: string;
}

export const Authconfig: AuthBindingKey = {
    PublishLoginResp: "auth_login_response",
    PublishRegistrationReq: "auth_registration_response",
    ConsumeLoginReq: "auth_login_request" ,
    ConsumeRegistrationReq: "auth_registration_request",
    PublishUserInformationResp: "auth_user_information_response",
    ConsumeUserInformationReq: "auth_user_information_request"
};