export function request(ctx) {
  const { values } = ctx.prev.result;

  console.log(`prev result is ${ctx.prev.result}`);

  return {
    method: "POST",
    version: "2018-05-29",
    resourcePath: "/users",

    params: {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Headers": "*",
        Accept: "application/json",
      },

      body: {
        ...values,
      },
    },
  };
}

export function response(ctx) {
  console.log(`response is ${ctx.result}`);
  const res = JSON.parse(ctx.result.body);

  return res;
}
