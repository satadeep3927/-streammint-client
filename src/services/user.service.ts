import { CreateOrUpdateUserArgs, User } from "../types/user.type";
import { IEnumerable, from } from "linq-to-typescript";

import BaseService from "./service";
import { PulseService } from "./pulse.service";

export default class UserService extends BaseService {
  private pulse: PulseService;

  constructor(baseURL: string, secretID: string, secretKey: string, pulse: PulseService) {
    super(baseURL, secretID, secretKey);
    this.pulse = pulse;
  }
  /**
   * Fetches the list of users from the project.
   * @returns {Promise<IEnumerable<User>>} A promise that resolves to an enumerable collection of User objects.
   */
  public async getUsers(): Promise<IEnumerable<User>> {
    const { data } = await this.get("/v1/project/users");
    return from(data.data);
  }
  /**
   *  Fetches a user by their ID.
   * @param {string} userID - The ID of the user to fetch.
   * @returns {Promise<User>} A promise that resolves to a User object.
   */
  public async getUserByID(userID: string): Promise<User> {
    const { data } = await this.get(`/v1/project/users/id/${userID}`);
    return data.data;
  }
  /**
   *  Fetches a user by their external id.
   *  @param {string} externalID - The external ID of the user to fetch.
   * @returns {Promise<User>} A promise that resolves to a User object.
   */
  public async getUserByExternalID(externalID: string): Promise<User> {
    const { data } = await this.get(`/v1/project/users/${externalID}`);
    return data.data;
  }

  /**
   * Creates a new user in the project.
   * @param {CreateOrUpdateUserArgs} user - The user object to create.
   * @returns {Promise<User>} A promise that resolves to the created User object.
   */
  public async createUser(user: CreateOrUpdateUserArgs): Promise<User> {
    const { data } = await this.post("/v1/project/users", user);
    if (this.pulse) {
      await this.pulse.emit("user_create", data.data);
    }
    return data.data;
  }
  /**
   *  Updates an existing user in the project.
   * @param {string} userID - The ID of the user to update.
   * @param {CreateOrUpdateUserArgs} user - The user object with updated fields.
   * @returns {Promise<User>} A promise that resolves to the updated User object.
   */
  public async updateUser(
    userID: string,
    user: CreateOrUpdateUserArgs
  ): Promise<User> {
    const { data } = await this.put(`/v1/project/users/${userID}`, user);
    if (this.pulse) {
      await this.pulse.emit("user_update", data.data);
    }
    return data.data;
  }

  /**
   * Deletes a user from the project.
   * @param {string} userID - The ID of the user to delete.
   * @returns {Promise<void>} A promise that resolves when the user is deleted.
   */
  public async deleteUser(userID: string): Promise<void> {
    await this.delete(`/v1/project/users/${userID}`);
    if (this.pulse) {
      await this.pulse.emit("user_delete", { id: userID });
    }
  }
}
