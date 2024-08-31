export function request(ctx) {
  const { group_id, user_id, role } = ctx.args;

  return {
    version: "2018-05-29",
    method: "POST",
    resourcePath: `/groups/${group_id}/participant`,
    params: {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Headers": "*",
        Accept: "application/json",
      },
      body: {
        group_id,
        user_id,
        role,
      },
    },
  };
}

export function response(ctx) {
  console.log(`response is ${ctx.result}`);
  const res = JSON.parse(ctx.result.body);

  return res.message;
}
