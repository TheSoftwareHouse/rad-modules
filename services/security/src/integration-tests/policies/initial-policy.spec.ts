import * as assert from "assert";
import { getCustomRepository } from "typeorm";
import { InitialPolicy } from "../../init/initial-policies";
import { PolicyTypeormRepository } from "../../repositories/typeorm/policy.typeorm.repository";
import { PolicyRepository } from "../../repositories/policy.repository";
import { TEST_ATTRIBUTE_NAME, TEST_RESOURCE_VALUE } from "../fixtures/policies.fixture";

describe("Initial policy tests", () => {
  const policyData = [
    {
      resource: "res1",
      attribute: "attr1",
    },
    {
      resource: "res1",
      attribute: "attr2",
    },
    {
      resource: "res2",
      attribute: "attr1",
    },
    {
      resource: "res2",
      attribute: "attr1",
    },
    {
      resource: "res1",
      attribute: "attr1",
    },
    {
      resource: "res1",
      attribute: "attr1",
    },
  ];

  it("Should create initial policies", () => {
    const initialPolicy = new InitialPolicy();
    return initialPolicy.update(policyData);
  });

  it("Should not have duplicate policy", async () => {
    const policyRepository: PolicyRepository = getCustomRepository(PolicyTypeormRepository);
    const policies = await policyRepository.findBy({ resource: TEST_RESOURCE_VALUE, attribute: TEST_ATTRIBUTE_NAME });
    assert.strictEqual(policies.length, 1);
  });
});
