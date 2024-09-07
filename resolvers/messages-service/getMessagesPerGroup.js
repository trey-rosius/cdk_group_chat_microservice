export function request(ctx) {
  const { group_id } = ctx.args;

  return {
    version: "2018-05-29",
    method: "GET",
    params: {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Headers": "*",
        Accept: "application/json",
      },
    },
    resourcePath: `/groups/${group_id}/messages`,
  };
}

export function response(ctx) {
  console.log(`response is ${ctx.result}`);
  const res = JSON.parse(ctx.result.body);

  return { items: res };
}
