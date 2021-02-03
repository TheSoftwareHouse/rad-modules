import { CommandHandler } from "@tshio/command-bus";
import { PolicyRepository } from "../../../../repositories/policy.repository";
import { REMOVE_POLICY_COMMAND_TYPE, RemovePolicyCommand } from "../commands/remove-policy.command";
import { NotFoundError } from "../../../../errors/not-found.error";
import { AdminPanelPoliciesConfig } from "../../../../config/config";
import { ConflictError } from "../../../../errors/conflict.error";
import { EventDispatcher } from "../../../../shared/event-dispatcher";
import { PolicyRemovedEvent } from "../subscribers/events/policy-removed.event";

interface RemovePolicyHandlerProps {
  policyRepository: PolicyRepository;
  adminPanelPolicies: AdminPanelPoliciesConfig;
  eventDispatcher: EventDispatcher;
}

export default class RemovePolicyHandler implements CommandHandler<RemovePolicyCommand> {
  public commandType: string = REMOVE_POLICY_COMMAND_TYPE;

  constructor(private dependencies: RemovePolicyHandlerProps) {}

  async execute(command: RemovePolicyCommand) {
    const { policyRepository, adminPanelPolicies } = this.dependencies;
    const { id, resource, attribute } = command.payload;
    const searchCriteria = id ? { id } : { resource, attribute };
    const policies = await policyRepository.findBy(searchCriteria);
    if (!policies.length) {
      throw new NotFoundError(`Policy not found for: ${JSON.stringify(searchCriteria)}.`);
    }
    const adminPolicies = Object.values(adminPanelPolicies);
    const attributes = adminPolicies.map((policy) => policy.attribute);
    const isBasePolicy = policies.some((policy) => attributes.includes(policy.attribute));
    if (isBasePolicy) {
      throw new ConflictError("Cannot delete base policy");
    }
    const idsToRemove = policies.map((policy) => policy.id);
    await policyRepository.delete(idsToRemove as string[]);
    await this.dependencies.eventDispatcher.dispatch(
      new PolicyRemovedEvent(
        policies.map((policy) => ({
          id: policy.id!,
          attribute: policy.attribute,
          resource: policy.resource,
        })),
      ),
    );
  }
}
