import { parse } from "yaml";

export default {
  async fetch(_, env: any) {
    const decapConfigUrl = env.DECAP_CONFIG_URL;
    const githubToken = env.GITHUB_TOKEN;

    const response = await fetch(decapConfigUrl);
    const ymlText = await response.text();
    const decapJsonConfig = parse(ymlText);

    if (!decapJsonConfig.backend) {
      decapJsonConfig.backend = {};
    }

    decapJsonConfig.backend.name = "picobase";
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
