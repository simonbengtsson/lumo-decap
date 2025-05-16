import { parse } from "yaml";

export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/setup") {
      if (request.method === "GET") {
        return new Response(
          /*html*/ `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="robots" content="noindex" />
            <title>Lumobase Decap Setup</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
          </head>
          <body>
            <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px; margin: 0 auto; padding: 2rem;">
              <h1>Lumobase Decap Setup</h1>
              <form method="POST">
              <div>
                <label for="decapConfigUrl">Public URL of your Decap config file</label><br>
                <input style="width: 100%;" type="text" name="decapConfigUrl" />
              </div>
              <br>
              <div>
                <label for="githubToken">Github Personal Token</label><br>
                <input style="width: 100%;" type="text" name="githubToken" />
              </div>
              <br>
              <button type="submit">Get Started</button>
              </form>
            </div>
          </body>
          </html>
        `,
          {
            headers: {
              "Content-Type": "text/html",
            },
          }
        );
      } else if (request.method === "POST") {
        console.log("POST request!");
        const formData = await request.formData();
        console.log("Form data", formData);
        const decapConfigUrl = formData.get("decapConfigUrl");
        const githubToken = formData.get("githubToken");

        if (!decapConfigUrl || !githubToken) {
          return new Response("Invalid form data", { status: 400 });
        }

        await env.MAINDB.put("decapConfigUrl", decapConfigUrl);
        await env.MAINDB.put("githubToken", githubToken);

        const url = new URL(request.url);
        url.pathname = "/";
        return Response.redirect(url.toString(), 303);
      }
    }

    const decapConfigUrl = await env.MAINDB.get("decapConfigUrl");
    const githubToken = await env.MAINDB.get("githubToken");

    if (!decapConfigUrl || !githubToken) {
      const url = new URL(request.url);
      url.pathname = "/setup";
      return Response.redirect(url.toString(), 303);
    }

    const response = await fetch(decapConfigUrl);
    const ymlText = await response.text();
    const decapJsonConfig = parse(ymlText);

    if (!decapJsonConfig.backend) {
      decapJsonConfig.backend = {};
    }

    decapJsonConfig.backend.name = "lumobase";
    decapJsonConfig.load_config_file = false;
    decapJsonConfig.githubToken = githubToken;

    const html = /*html*/ `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex" />
        <title>Content Manager</title>
    </head>
    <body>
      <script>
        window.DECAP_CONFIG = ${JSON.stringify(decapJsonConfig)}
        window.CMS_MANUAL_INIT = true
      </script>
      <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
      <script src="/client.js"></script>
    </body>
    </html>
    `;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
};
