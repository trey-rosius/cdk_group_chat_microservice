import { util } from "@aws-appsync/utils";
export function request(ctx) {
  const { input } = ctx.args;

  const timestamp = util.time.nowEpochSeconds();
  const id = util.autoKsuid();

  console.log(`send message input ${input}`);

  const messageItem = {
    ...input,
    id,
    created_at: timestamp,
  };

  return {
    method: "POST",
    version: "2018-05-29",
    resourcePath: `/groups/${input.group_id}/messages`,

    params: {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Headers": "*",
        Accept: "application/json",
      },

      body: {
        ...messageItem,
      },
    },
  };
}

export function response(ctx) {
  console.log(`response is ${ctx.result}`);
  const res = JSON.parse(ctx.result.body);
  return res;
}
