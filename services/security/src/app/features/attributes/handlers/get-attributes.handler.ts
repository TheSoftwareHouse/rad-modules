import { Handler } from "../../../../../../../shared/command-bus";
import { GET_ATTRIBUTES_COMMAND_TYPE, GetAttributesCommand } from "../commands/get-attributes.command";
import { AttributesRepository } from "../../../../repositories/attributes.repostiory";

export interface GetAttributesHandlerProps {
  attributesRepository: AttributesRepository;
}

export default class GetAttributesHandler implements Handler<GetAttributesCommand> {
  public commandType: string = GET_ATTRIBUTES_COMMAND_TYPE;

  constructor(private dependencies: GetAttributesHandlerProps) {}

  async execute(command: GetAttributesCommand) {
    const { attributesRepository } = this.dependencies;

    const { page, limit } = command.payload;
    const { attributes, total } = await attributesRepository.getAttributes(command.payload);

    return {
      attributes: attributes.map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        userId: attribute?.user?.id,
        username: attribute?.user?.username,
      })),
      total,
      page,
      limit,
    };
  }
}
