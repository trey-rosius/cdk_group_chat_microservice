export function request(ctx) {
  const { input } = ctx.args;
  const id = util.autoKsuid();
  return {
    version: "2018-05-29",
    method: "POST",
    resourcePath: `/typing`,
    params: {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Headers": "*",
        Accept: "application/json",
      },
      body: {
        ...input,
        id,
      },
    },
  };
}

export function response(ctx) {
  console.log(`response is ${ctx.result}`);
  const res = JSON.parse(ctx.result.body);

  return res;
}
