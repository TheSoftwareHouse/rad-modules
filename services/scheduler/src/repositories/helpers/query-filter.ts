function reduceCommaStringToArrayString(str: string) {
  const result = str.split(",").reduce((acumulator: string, value: any, index: number) => {
    const _acu = index > 0 ? `${acumulator},` : "";

    return Number.isNaN(value) ? `${_acu}${value}` : `${_acu}${value}`;
  }, "");

  return result.split(",");
}

export const OPERATORS: any = {
  eq: (value: any) => ({ operator: "=", orAnd: "AND", value }),
  eqOr: (value: any) => ({ operator: "=", orAnd: "OR", value }),
  neq: (value: any) => ({ operator: "<>", orAnd: "AND", value }),
  neqOr: (value: any) => ({ operator: "<>", orAnd: "OR", value }),
  lt: (value: any) => ({ operator: "<", orAnd: "AND", value }),
  ltOr: (value: any) => ({ operator: "<", orAnd: "Or", value }),
  lte: (value: any) => ({ operator: "<=", orAnd: "AND", value }),
  lteOr: (value: any) => ({ operator: "<=", orAnd: "OR", value }),
  gt: (value: any) => ({ operator: ">", orAnd: "AND", value }),
  gtOr: (value: any) => ({ operator: ">", orAnd: "OR", value }),
  gte: (value: any) => ({ operator: ">=", orAnd: "AND", value }),
  gteOr: (value: any) => ({ operator: ">=", orAnd: "OR", value }),
  include: (pattern: string) => ({ operator: "like", orAnd: "AND", value: `%${pattern}%` }),
  includeOr: (pattern: string) => ({ operator: "like", orAnd: "OR", value: `%${pattern}%` }),
  in: (array: string) => ({ operator: "IN", orAnd: "AND", value: reduceCommaStringToArrayString(array) }),
  inOr: (array: string) => ({ operator: "IN", orAnd: "OR", value: reduceCommaStringToArrayString(array) }),
};

export type FilterOperators =
  | "eq"
  | "eqOr"
  | "neq"
  | "neqOr"
  | "lt"
  | "ltOr"
  | "gt"
  | "gtOr"
  | "gte"
  | "gteOr"
  | "include"
  | "includeOr"
  | "in"
  | "inOr";

export interface QueryObject {
  page: number;
  limit: number;
  filter?: any;
  order?: any;
}

export function createTypeORMFilter(query: QueryObject, prefix = "", operators = OPERATORS) {
  const filterObject: any = {
    where: "",
    operands: {},
  };

  let id = 0;
  Object.entries(query.filter).forEach((filter) => {
    const [column, formula] = filter;
    Object.entries(formula as object).forEach((type) => {
      const [operator, operand] = type;
      const operatorFn = operators[operator];
      if (typeof operatorFn === "function") {
        const _filter = operatorFn(operand);
        const _prefix = column.indexOf(".") > -1 ? "" : prefix;
        if (operator === "include" || operator === "includeOr") {
          filterObject.where +=
            filterObject.where === ""
              ? `LOWER(${_prefix}${column}) ${_filter.operator} LOWER(:${id})`
              : ` ${_filter.orAnd} LOWER(${_prefix}${column}) ${_filter.operator} LOWER(:${id})`;
        } else if (operator === "in" || operator === "inOr") {
          filterObject.where +=
            filterObject.where === ""
              ? `${_prefix}${column} ${_filter.operator} (:...${id})`
              : ` ${_filter.orAnd} ${_prefix}${column} ${_filter.operator} (:...${id})`;
          filterObject.operands[`${id}`] = _filter.value;
        } else {
          filterObject.where +=
            filterObject.where === ""
              ? `${_prefix}${column} ${_filter.operator} :${id}`
              : ` ${_filter.orAnd} ${_prefix}${column} ${_filter.operator} :${id}`;
          filterObject.operands[`${id}`] = _filter.value;
        }

        filterObject.operands[`${id}`] = _filter.value;

        id += 1;
      }
    });
  });

  return filterObject;
}
