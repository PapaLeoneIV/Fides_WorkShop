import logger from './config/logger';
import log  from "../config/logs";
import { RequestStatus as status } from "../config/RequestStatus";
import { EXCHANGE } from "../config/rabbit-config";
import { User } from "../models/User";
import { publisher } from "../models/RabbitmqPublisher";
import { userRepository } from "../repository/user-repository";
import ILoginRequestDTO from "../dtos/ILoginRequestDTO";
import IRegistrationRequestDTO from "../dtos/IRegistrationRequestDTO";
import IAuthResponseDTO from "../dtos/IAuthResponseDTO";

export async function updateExchange(response: IAuthResponseDTO, bindKeys: string) {
  try {
    await publisher.publishEvent(EXCHANGE, bindKeys, response);
    console.log(log.SERVICE.INFO.PROCESSING(`Response ${response.message} published successfully`, "", response));
  } catch (error) {
    console.error(log.SERVICE.ERROR.PROCESSING(`Failed publishing response`, "", error));
    throw error;
  }
}

export async function processRegistrationRequest(request: IRegistrationRequestDTO) {
  let REGISTRATION_BKEY = publisher.bindKeys.PublishRegistrationReq;
  let response: IAuthResponseDTO = { status: status.APPROVED, message: "User registered successfully", token: null };
  let user: User;

  try {
    if (await userRepository.read.getRow_byColumn("email", request.email))
      throw new Error("Registration denied user already exists");

    request.password = await User.hashPassword(request.password);
    user = new User(await userRepository.write.addRow(request));
    if (!user) return new Error("Failed to register user");

    console.log(log.SERVICE.INFO.PROCESSING(`User registered successfully`, "", request));
    await updateExchange(response, REGISTRATION_BKEY);
  } catch (error) {
    console.error(log.SERVICE.ERROR.PROCESSING(`Failed to register user: ${error}`, "", request));
    response.status = status.ERROR;
    response.message = error;
    await updateExchange(response, REGISTRATION_BKEY);
    return;
  }
}

export async function processLoginRequest(request: ILoginRequestDTO) {
  let LOGIN_BKEY = publisher.bindKeys.PublishLoginResp;
  let response: IAuthResponseDTO = { status: "APPROVED", message: "User logged in successfully", token: null };
  let user: User | null;

  try {
    user = new User(await userRepository.read.getRow_byColumn("email", request.email));
    if (!user) throw new Error("User does not exist");

    if (!(await user.validatePassword(request.password))) throw new Error("Wrong password");

    console.log(log.SERVICE.INFO.PROCESSING(`User logged in successfully`, "", request));
    if (!request.jwtToken) {
      console.log(log.SERVICE.INFO.PROCESSING(`JWT Token not found, generating new token`, "", request));
      response.token = user.generateAccessToken();
      await updateExchange(response, LOGIN_BKEY);
      return;
    }

    if (!User.authenticateToken(request.jwtToken)) throw new Error("JWT Token is invalid");

    response.token = user.generateAccessToken();
    await updateExchange(response, LOGIN_BKEY);
  } catch (error) {
    console.error(log.SERVICE.ERROR.PROCESSING(`Failed to login user: ${error}`, "", request));
    response.status = status.ERROR;
    response.message = error;
    await updateExchange(response, LOGIN_BKEY);
  }
}

/* export async function handle_user_info_req(msg: string){
    
} */
