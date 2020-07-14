import { PolicyModel } from "../models/policy.model";
import { PolicyRepository } from "../../../../repositories/policy.repository";
import { Handler } from "../../../../../../../shared/command-bus";
import { ADD_POLICY_COMMAND_TYPE, AddPolicyCommand } from "../commands/add-policy.command";

export interface AddPolicyHandlerProps {
  policyRepository: PolicyRepository;
}

export default class AddPolicyHandler implements Handler<AddPolicyCommand> {
  public commandType: string = ADD_POLICY_COMMAND_TYPE;

  constructor(private dependencies: AddPolicyHandlerProps) {}

  async execute(command: AddPolicyCommand) {
    const { policyRepository } = this.dependencies;
    const { attribute, resource } = command.payload;

    const newPolicy = await policyRepository.addPolicy(PolicyModel.create({ attribute, resource }));
    return { id: newPolicy.id };
  }
}
