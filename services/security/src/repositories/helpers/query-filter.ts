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
  in: (array: string) => ({ operator: "IN", orAnd: "AND", value: array.toString() }),
  inOr: (array: string) => ({ operator: "IN", orAnd: "OR", value: array.toString() }),
};

export const KEYCLOAKOPERATORS: any = {
  eq: (key: any, value: any) => (item: any) => item[key] === value,
  eqOr: (key: any, value: any) => (item: any) => item[key] === value,
  neq: (key: any, value: any) => (item: any) => item[key] !== value,
  neqOr: (key: any, value: any) => (item: any) => item[key] !== value,
  lt: (key: any, value: any) => (item: any) => item[key] < value,
  ltOr: (key: any, value: any) => (item: any) => item[key] < value,
  lte: (key: any, value: any) => (item: any) => item[key] <= value,
  lteOr: (key: any, value: any) => (item: any) => item[key] <= value,
  gt: (key: any, value: any) => (item: any) => item[key] > value,
  gtOr: (key: any, value: any) => (item: any) => item[key] > value,
  gte: (key: any, value: any) => (item: any) => item[key] >= value,
  gteOr: (key: any, value: any) => (item: any) => item[key] >= value,
  include: (key: any, value: any) => (item: any) => item[key].toLowerCase().includes(value.toLowerCase()),
  includeOr: (key: any, value: any) => (item: any) => item[key].toLowerCase().includes(value.toLowerCase()),
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
  | "includeOr";

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

export function createKeycloakFilter(query: QueryObject, operators = KEYCLOAKOPERATORS) {
  const filterObjects: any[] = [];
  Object.entries(query.filter).forEach((filter) => {
    const [column, formula] = filter;

    Object.entries(formula as object).forEach((type) => {
      const [operator, operand] = type;
      const filterFunction = operators[operator](column, operand);
      if (typeof filterFunction === "function") {
        filterObjects.push({ or: operand.includes("Or"), filterFunction });
      }
    });
  });

  return filterObjects;
}
