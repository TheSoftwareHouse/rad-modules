import { CommandHandler } from "@tshio/command-bus";
import { GET_POLICIES_COMMAND_TYPE, GetPoliciesCommand, GetPoliciesResponse } from "../commands/get-policies.command";
import { PolicyRepository } from "../../../../repositories/policy.repository";

export interface GetPoliciesHandlerProps {
  policyRepository: PolicyRepository;
}

export default class GetPoliciesHandler implements CommandHandler<GetPoliciesCommand> {
  public commandType: string = GET_POLICIES_COMMAND_TYPE;

  constructor(private dependencies: GetPoliciesHandlerProps) {}

  async execute(command: GetPoliciesCommand): Promise<GetPoliciesResponse> {
    const { policyRepository } = this.dependencies;
    const { page, limit } = command.payload;
    const result: GetPoliciesResponse = {
      ...(await policyRepository.getPolicies(command.payload)),
      page,
      limit,
    };

    // find the last page if policies object is empty and request page is more than 1
    if (result.policies.length === 0 && page > 1) {
      const lastPage = Math.ceil(result.total / (result.limit * result.page));
      const updateCommandPayload = { ...command.payload, page: lastPage > 1 ? lastPage : 1 };
      return this.execute(new GetPoliciesCommand(updateCommandPayload));
    }

    return result;
  }
}
