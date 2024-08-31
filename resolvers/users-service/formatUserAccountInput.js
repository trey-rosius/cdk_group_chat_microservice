import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const timestamp = util.time.nowEpochSeconds();
  //Id format is
  const id = util.autoKsuid();
  const { ...values } = ctx.args;
  values.userInput.id = id;

  values.userInput.created_at = timestamp;
  values.userInput.updated_at = timestamp;

  return {
    payload: {
      values: values.userInput,
    },
  };
}

export function response(ctx) {
  return ctx.result;
}
