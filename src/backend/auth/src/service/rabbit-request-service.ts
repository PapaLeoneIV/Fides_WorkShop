import logger from '../config/logger';
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
    logger.debug(log.SERVICE.PROCESSING(`Response ${response.message} published successfully`, { response }));
  } catch (error) {
    logger.error(log.SERVICE.PROCESSING(`Failed publishing response: ${error}`, { error }));
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

    logger.info(log.SERVICE.PROCESSING(`User registered successfully`, { }, request));
    await updateExchange(response, REGISTRATION_BKEY);
  } catch (error) {
    logger.error(log.SERVICE.PROCESSING(`Failed to register user: ${error}`, { error }, request));
    response.status = status.ERROR;
    response.message = error.message;
    await updateExchange(response, REGISTRATION_BKEY);
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

    logger.info(log.SERVICE.PROCESSING(`User logged successfully`, { }, request));
    if (!request.jwtToken) {
      logger.info(log.SERVICE.PROCESSING(`JWT Token not found, generating new token`, { }, request));
      response.token = user.generateAccessToken();
      return await updateExchange(response, LOGIN_BKEY);
    }

    if (!User.authenticateToken(request.jwtToken)) throw new Error("JWT Token is invalid");

    response.token = user.generateAccessToken();
    await updateExchange(response, LOGIN_BKEY);
  } catch (error) {
    logger.error(log.SERVICE.PROCESSING(`Failed to login user: ${error}`, { error }, request));
    response.status = status.ERROR;
    response.message = error.message;
    await updateExchange(response, LOGIN_BKEY);
  }
}

/* export async function handle_user_info_req(msg: string){
    
} */
