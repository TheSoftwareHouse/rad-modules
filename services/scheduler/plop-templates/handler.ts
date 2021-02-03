import { Handler } from "@tshio/command-bus";
import { {{name.capitalSnake}}_COMMAND_TYPE, {{capitalize name.camelCased}}Command } from "../commands/{{name.kebabCased}}.command";

export default class {{capitalize name.camelCased}}Handler implements Handler<{{capitalize name.camelCased}}Command> {
  public commandType: string = {{name.capitalSnake}}_COMMAND_TYPE

  async execute(command: {{capitalize name.camelCased}}Command) {
    // execute body
  };
}
