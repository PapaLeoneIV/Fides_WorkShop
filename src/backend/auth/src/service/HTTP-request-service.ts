import { Messages as log } from "../config/Messages";
import { RequestStatus as status } from "../config/RequestStatus";
import { User } from "../models/User";
import { userRepository } from "../repository/user-repository";
import { Response } from "express";
import ILoginRequestDTO from "../dtos/ILoginRequestDTO";
import IRegistrationRequestDTO from "../dtos/IRegistrationRequestDTO";
import IAuthResponseDTO from "../dtos/IAuthResponseDTO";

export async function HTTPprocessRegistrationRequest(request: IRegistrationRequestDTO, res: Response) {
  let response: IAuthResponseDTO = { status: status.APPROVED, message: "User registered successfully", token: null };
  let user: User;

  try {
    if (await userRepository.read.getRow_byColumn("email", request.email))
      throw new Error("Registration denied User already exists");

    request.password = await User.hashPassword(request.password);
    user = new User(await userRepository.write.addRow(request));
    if (!user) throw new Error("Failed to register user");

    console.log(log.SERVICE.INFO.PROCESSING(`User registered successfully`, "", request));
    res.status(200).json(response);
  } catch (error) {
    console.error(log.SERVICE.ERROR.PROCESSING(`Failed to register user: ${error}`, "", request));
    response.status = status.ERROR;
    response.message = error;
    res.status(500).json(response);
  }
}

export async function HTTPprocessLoginRequest(request: ILoginRequestDTO, res: Response) {
  let response: IAuthResponseDTO = { status: "APPROVED", message: "User logged in successfully", token: null };
  let user: User;

  try {
    user = new User(await userRepository.read.getRow_byColumn("email", request.email));
    if (!user) throw new Error("User does not exist");

    if (!(await user.validatePassword(request.password))) throw new Error("Wrong password");

    console.log(log.SERVICE.INFO.PROCESSING(`User logged in successfully`, "", request));
    if (!request.jwtToken) {
      console.log(log.SERVICE.INFO.PROCESSING(`JWT Token not found, generating new token`, "", request));
      response.token = user.generateAccessToken();
      res.status(200).json(response);
      return;
    }

    //TODO: investigate why this part of the code is commented
    // if (!User.authenticateToken(request.jwtToken)) throw new Error("JWT Token is invalid");

    // response.token = user.generateAccessToken();
    // // modified from the original code (500 status code)
    // res.status(200).json(response);
  } catch (error) {
    console.error(log.SERVICE.ERROR.PROCESSING(`Failed to login user: ${error}`, "", request));
    response.status = status.ERROR;
    response.message = error;
    res.status(500).json(response);
  }
}

export async function HTTPprocessJwtRefreshRequest(req: ILoginRequestDTO, res: Response) {
  let response: IAuthResponseDTO = {
    status: "APPROVED",
    message: "Token refreshed successfully",
    token: null,
  };

  try {
    let user: User;

    if (!req.jwtToken) throw new Error("JWT Token not found");

    let isJWTValid = User.authenticateToken(req.jwtToken as string);
    if (!isJWTValid || req.email !== isJWTValid.email) {
      console.log(log.SERVICE.INFO.PROCESSING(`JWT Token is invalid, generating new token`, "", req));
      //TODO: create a new static method to generate a new token from an email(?)
      user = new User(await userRepository.read.getRow_byColumn("email", req.email));
      if (!user) throw new Error("User does not exist");
      response.token = user.generateAccessToken();
      res.status(200).json(response);
    }
  } catch (error) {
    console.error(log.SERVICE.ERROR.PROCESSING(`Failed to refresh token: ${error}`, "", req));
    response.status = status.ERROR;
    response.message = error;
    res.status(500).json(response);
  }
}

export async function HTTPprocessUserInformationRequest(req: ILoginRequestDTO, res: Response) {
  let response: IAuthResponseDTO = {
    status: "APPROVED",
    message: "User information retrieved successfully",
    token: null,
  };
  let user: User;

  try {
    let isJWTValid = User.authenticateToken(req.jwtToken as string);
    if (!isJWTValid || req.email !== isJWTValid.email) throw new Error("JWT Token is invalid");

    user = new User(await userRepository.read.getRow_byColumn("email", req.email));
    if (!user) throw new Error("User does not exist");

    res.status(200).json(user); //?? response ??
  } catch (error) {
    console.error(log.SERVICE.ERROR.PROCESSING(`Failed to retrieve user information: ${error}`, "", req));
    response.status = status.ERROR;
    response.message = error;
    res.status(500).json(response);
    return;
  }
}
