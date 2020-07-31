import { PolicyModel } from "../models/policy.model";
import { PolicyRepository } from "../../../../repositories/policy.repository";
import { Handler } from "../../../../../../../shared/command-bus";
import { ADD_POLICY_COMMAND_TYPE, AddPolicyCommand } from "../commands/add-policy.command";
import { EventDispatcher } from "../../../../shared/event-dispatcher";

export interface AddPolicyHandlerProps {
  policyRepository: PolicyRepository;
  eventDispatcher: EventDispatcher;
}

export default class AddPolicyHandler implements Handler<AddPolicyCommand> {
  public commandType: string = ADD_POLICY_COMMAND_TYPE;

  constructor(private dependencies: AddPolicyHandlerProps) {}

  async execute(command: AddPolicyCommand) {
    const { policyRepository } = this.dependencies;
    const { attribute, resource } = command.payload;

    const newPolicy = await policyRepository.addPolicy(PolicyModel.create({ attribute, resource }));
    await this.dependencies.eventDispatcher.dispatch({
      name: "PolicyAdded",
      payload: { id: newPolicy.id, attribute, resource },
    });
    return { id: newPolicy.id };
  }
}
